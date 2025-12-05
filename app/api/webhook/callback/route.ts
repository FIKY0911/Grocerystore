// app/api/webhook/callback/route.ts
import { reduceStock } from "@/sanity/actions";
import { writeClient } from "@/sanity/lib/writeClient";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers';
import { 
  verifyCallbackToken, 
  mapXenditStatusToOrderStatus,
  getXenditCallbackToken 
} from "@/lib/xendit";

/**
 * Xendit Webhook Callback Handler
 * 
 * Endpoint ini menerima notifikasi dari Xendit saat status pembayaran berubah.
 * 
 * Security:
 * - Verifikasi callback token dari header x-callback-token
 * - Token harus match dengan XENDIT_CALLBACK_TOKEN di environment variables
 * 
 * Flow:
 * 1. Verify callback token
 * 2. Parse notification payload
 * 3. Update order status di Sanity
 * 4. Reduce stock jika pembayaran berhasil
 * 
 * Xendit akan mengirim ulang webhook jika tidak menerima response 200 OK
 */
export async function POST(request: NextRequest) {
  const headersList = headers();
  const receivedToken = headersList.get('x-callback-token');

  // ============================================
  // Step 1: Verify Callback Token
  // ============================================
  
  try {
    // Cek apakah XENDIT_CALLBACK_TOKEN sudah di-set
    getXenditCallbackToken();
  } catch (error: any) {
    console.error("❌ Xendit Webhook: XENDIT_CALLBACK_TOKEN tidak ditemukan");
    console.error("💡 Pastikan XENDIT_CALLBACK_TOKEN sudah di-set di file .env");
    return NextResponse.json(
      { 
        success: false,
        message: "Webhook not configured properly" 
      }, 
      { status: 500 }
    );
  }

  // Verify token
  if (!verifyCallbackToken(receivedToken)) {
    console.error("❌ Xendit Webhook: Invalid callback token");
    console.error("📋 Received token:", receivedToken ? `${receivedToken.substring(0, 10)}...` : 'null');
    return NextResponse.json(
      { 
        success: false,
        message: "Invalid or missing callback token" 
      }, 
      { status: 401 }
    );
  }

  console.log("✅ Xendit Webhook: Callback token verified");

  // ============================================
  // Step 2: Parse Notification Payload
  // ============================================
  
  try {
    const notification = await request.json();
    
    console.log("📨 Xendit Webhook: Incoming notification");
    console.log("📋 Notification data:", JSON.stringify(notification, null, 2));

    // Handle both snake_case and camelCase formats from Xendit
    const orderNumber = notification.external_id || notification.externalId;
    const xenditStatus = notification.status;
    const transactionId = notification.id;
    const amount = notification.amount;
    const paidAmount = notification.paid_amount || notification.paidAmount;
    const paymentChannel = notification.payment_channel || notification.paymentChannel;
    const paymentMethod = notification.payment_method || notification.paymentMethod;

    // Validate required fields
    if (!orderNumber || !xenditStatus) {
      console.error("❌ Xendit Webhook: Missing required fields in payload");
      console.error("📋 orderNumber:", orderNumber);
      console.error("📋 xenditStatus:", xenditStatus);
      return NextResponse.json(
        { 
          success: false,
          message: "Missing required fields (external_id or status)" 
        }, 
        { status: 400 }
      );
    }

    console.log("📦 Order Number:", orderNumber);
    console.log("💳 Xendit Status:", xenditStatus);
    console.log("🆔 Transaction ID:", transactionId);
    console.log("💰 Amount:", amount);
    console.log("💵 Paid Amount:", paidAmount);
    console.log("🏦 Payment Channel:", paymentChannel);
    console.log("💳 Payment Method:", paymentMethod);

    // Map Xendit status ke internal order status
    const orderStatus = mapXenditStatusToOrderStatus(xenditStatus);
    console.log("📊 Mapped Order Status:", orderStatus);

    // ============================================
    // Step 3: Fetch Order from Sanity
    // ============================================
    
    const order = await writeClient.fetch(
      `*[_type == "order" && orderNumber == $orderNumber][0]`,
      { orderNumber }
    );

    if (!order) {
      console.error("❌ Xendit Webhook: Order not found in Sanity");
      console.error("📋 Order Number:", orderNumber);
      console.log("💡 Order mungkin belum tersimpan di Sanity atau orderNumber tidak match");
      
      // Return 200 untuk acknowledge webhook (agar Xendit tidak retry)
      // Tapi tandai sebagai warning
      return NextResponse.json(
        { 
          success: true,
          warning: "Order not found in database",
          orderNumber,
          xenditStatus 
        }, 
        { status: 200 }
      );
    }

    console.log("✅ Order found in Sanity");
    console.log("📋 Order ID:", order._id);
    console.log("📋 Current Status:", order.status);
    console.log("📋 Current Xendit Status:", order.xenditStatus);

    // ============================================
    // Step 4: Update Order Status di Sanity
    // ============================================
    
    try {
      console.log("💾 Updating order in Sanity...");
      
      const updateData: any = {
        status: orderStatus,
        xenditStatus: xenditStatus,
      };
      
      // Update transaction ID jika ada
      if (transactionId) {
        updateData.xenditTransactionId = transactionId;
      }
      
      // Update payment info jika ada
      if (paymentChannel) {
        updateData.paymentChannel = paymentChannel;
      }
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }
      if (paidAmount) {
        updateData.paidAmount = paidAmount;
      }
      
      const patchResult = await writeClient
        .patch(order._id)
        .set(updateData)
        .commit();
      
      console.log("✅ Order updated successfully in Sanity");
      console.log("📋 Updated fields:", Object.keys(updateData).join(', '));
    } catch (error: any) {
      console.error("❌ Error updating order in Sanity:", error);
      console.error("📋 Error details:", error?.message || error);
      
      // Return 500 agar Xendit retry webhook
      return NextResponse.json(
        { 
          success: false,
          message: "Failed to update order in database",
          error: error?.message 
        }, 
        { status: 500 }
      );
    }

    // ============================================
    // Step 5: Reduce Stock (jika pembayaran berhasil)
    // ============================================
    
    if (orderStatus === "paid" && order.status !== "paid") {
      console.log("💰 Payment successful, reducing stock...");
      
      try {
        await reduceStock(orderNumber);
        console.log("✅ Stock reduced successfully for order:", orderNumber);
      } catch (error: any) {
        console.error("❌ Failed to reduce stock:", error);
        console.error("📋 Error details:", error?.message || error);
        
        // Ini business logic error, tapi webhook sudah diproses
        // Jadi kita tidak ingin Xendit retry
        // Log error untuk manual investigation
        console.log("⚠️ MANUAL ACTION REQUIRED: Stock not reduced for order:", orderNumber);
      }
    } else if (orderStatus === "paid") {
      console.log("ℹ️ Order already marked as paid, skipping stock reduction");
    }

    // ============================================
    // Step 6: Return Success Response
    // ============================================
    
    console.log("✅ Webhook processed successfully");
    
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        orderNumber,
        orderStatus,
        xenditStatus,
        transactionId,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    console.error("📋 Error details:", error?.message || error);
    console.error("📋 Stack trace:", error?.stack);
    
    return NextResponse.json(
      { 
        success: false,
        message: "Webhook processing error",
        error: error?.message 
      }, 
      { status: 400 }
    );
  }
}
