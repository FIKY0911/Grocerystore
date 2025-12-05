// app/api/invoice/[orderNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { INVOICE_QUERY } from "@/sanity/queries/query";
import { getXenditAuthHeader, mapXenditStatusToOrderStatus } from "@/lib/xendit";

/**
 * GET /api/invoice/[orderNumber]
 * 
 * Endpoint untuk mendapatkan detail invoice berdasarkan orderNumber
 * 
 * Flow:
 * 1. Cari order di Sanity berdasarkan orderNumber
 * 2. Jika tidak ada, coba cari di Xendit menggunakan external_id
 * 3. Jika ada xenditTransactionId, fetch status terbaru dari Xendit
 * 4. Update status di Sanity jika berbeda
 * 5. Return order data dengan xendit invoice data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    console.log('🔍 Fetching invoice for order:', orderNumber);

    // ============================================
    // Step 1: Fetch order dari Sanity
    // ============================================
    
    let order = await client.fetch(INVOICE_QUERY, { orderNumber });

    if (order) {
      console.log('✅ Order found in Sanity:', order._id);
    } else {
      console.log('⚠️ Order not found in Sanity, checking Xendit...');
    }

    // ============================================
    // Step 2: Jika tidak ada di Sanity, coba ambil dari Xendit
    // ============================================
    
    let xenditInvoice = null;
    if (!order) {
      try {
        console.log('📤 Fetching invoice from Xendit API...');
        
        // Cari invoice di Xendit menggunakan external_id (orderNumber)
        const response = await fetch(
          `https://api.xendit.co/v2/invoices?external_id=${encodeURIComponent(orderNumber)}`,
          {
            headers: {
              'Authorization': getXenditAuthHeader(),
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Xendit API error:', response.status, errorText);
        } else {
          const invoices = await response.json();
          console.log('📦 Xendit response:', JSON.stringify(invoices, null, 2));
          
          // Xendit bisa return array langsung atau object dengan data property
          const invoiceList = Array.isArray(invoices) ? invoices : (invoices.data || []);
          
          if (invoiceList.length > 0) {
            xenditInvoice = invoiceList[0];
            console.log('✅ Invoice found in Xendit:', xenditInvoice.id);
            
            // Buat order object dari data Xendit untuk ditampilkan
            order = {
              orderNumber: orderNumber,
              xenditTransactionId: xenditInvoice.id,
              xenditStatus: xenditInvoice.status,
              paymentUrl: xenditInvoice.invoice_url,
              status: mapXenditStatusToOrderStatus(xenditInvoice.status),
              totalPrice: xenditInvoice.amount,
              currency: xenditInvoice.currency || 'IDR',
              expiryDate: xenditInvoice.expiry_date,
              availableBanks: xenditInvoice.available_banks || [],
              availableRetailOutlets: xenditInvoice.available_retail_outlets || [],
              availableEwallets: xenditInvoice.available_ewallets || [],
              availableQRCodes: xenditInvoice.available_qr_codes || [],
              shouldExcludeCreditCard: xenditInvoice.should_exclude_credit_card || false,
              customerName: xenditInvoice.customer?.given_names || '',
              email: xenditInvoice.payer_email || '',
              orderDate: xenditInvoice.created,
            };
          } else {
            console.log('⚠️ No invoices found in Xendit for external_id:', orderNumber);
          }
        }
      } catch (xenditError: any) {
        console.error("❌ Failed to fetch invoice from Xendit:", xenditError?.message || xenditError);
      }
    }

    // ============================================
    // Step 3: Jika masih tidak ada order, return 404
    // ============================================
    
    if (!order) {
      console.log('❌ Order not found in Sanity or Xendit');
      return NextResponse.json(
        { 
          success: false,
          message: "Order tidak ditemukan",
          orderNumber,
          checkedSources: ['Sanity', 'Xendit']
        },
        { status: 404 }
      );
    }

    // ============================================
    // Step 4: Cek status terbaru dari Xendit (jika ada xenditTransactionId)
    // ============================================
    
    if (order.xenditTransactionId && !xenditInvoice) {
      try {
        console.log('📤 Fetching latest status from Xendit...');
        
        const response = await fetch(
          `https://api.xendit.co/v2/invoices/${order.xenditTransactionId}`,
          {
            headers: {
              'Authorization': getXenditAuthHeader(),
            },
          }
        );

        if (response.ok) {
          xenditInvoice = await response.json();
          console.log('✅ Latest status from Xendit:', xenditInvoice.status);
          
          // Update paymentUrl jika belum ada atau berbeda
          if (xenditInvoice.invoice_url && (!order.paymentUrl || order.paymentUrl !== xenditInvoice.invoice_url)) {
            order.paymentUrl = xenditInvoice.invoice_url;
          }
          
          // Update status di Sanity jika berbeda dan order ada di Sanity
          if (order._id && xenditInvoice.status !== order.xenditStatus) {
            try {
              console.log('💾 Updating order status in Sanity...');
              const { writeClient } = await import("@/sanity/lib/writeClient");
              
              const orderStatus = mapXenditStatusToOrderStatus(xenditInvoice.status);

              await writeClient
                .patch(order._id)
                .set({
                  status: orderStatus,
                  xenditStatus: xenditInvoice.status,
                  paymentUrl: xenditInvoice.invoice_url,
                })
                .commit();

              // Update order object dengan status terbaru
              order.status = orderStatus;
              order.xenditStatus = xenditInvoice.status;
              order.paymentUrl = xenditInvoice.invoice_url;
              
              console.log('✅ Order status updated in Sanity');
            } catch (updateError: any) {
              console.error("⚠️ Failed to update order in Sanity:", updateError?.message || updateError);
            }
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch from Xendit:', response.status, errorText);
        }
      } catch (xenditError: any) {
        console.error("❌ Failed to fetch Xendit invoice:", xenditError?.message || xenditError);
      }
    }

    // ============================================
    // Step 5: Pastikan paymentUrl selalu ada
    // ============================================
    
    // Pastikan paymentUrl selalu ada dari xenditInvoice jika tersedia
    if (xenditInvoice?.invoice_url) {
      order.paymentUrl = xenditInvoice.invoice_url;
    }

    // Jika masih tidak ada paymentUrl tapi ada xenditTransactionId, buat URL manual
    if (!order.paymentUrl && order.xenditTransactionId) {
      // Xendit invoice URL format: https://checkout.xendit.co/web/{invoice_id}
      order.paymentUrl = `https://checkout.xendit.co/web/${order.xenditTransactionId}`;
      console.log(`⚠️ Payment URL created manually: ${order.paymentUrl}`);
    }

    // ============================================
    // Step 6: Return response
    // ============================================
    
    console.log('✅ Invoice data prepared successfully');
    console.log('📋 Order Number:', order.orderNumber);
    console.log('📋 Has Payment URL:', !!order.paymentUrl);
    console.log('📋 Xendit Transaction ID:', order.xenditTransactionId);

    return NextResponse.json({
      success: true,
      order,
      xenditInvoice,
    });
  } catch (error: any) {
    console.error("❌ Error fetching invoice:", error);
    console.error("📋 Error details:", error?.message || error);
    console.error("📋 Stack trace:", error?.stack);
    
    return NextResponse.json(
      { 
        success: false,
        message: "Terjadi kesalahan server",
        error: error?.message 
      },
      { status: 500 }
    );
  }
}

