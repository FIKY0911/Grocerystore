// API route untuk reduce stock ketika order sudah paid
import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/writeClient";

export async function POST(req: NextRequest) {
  try {
    const { orderNumber } = await req.json();

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    console.log("📦 Reducing stock for order:", orderNumber);

    // Fetch order dari Sanity
    const order = await writeClient.fetch(
      `*[_type == "order" && orderNumber == $orderNumber][0]{
        _id,
        orderNumber,
        status,
        stockReduced,
        products[]{
          _key,
          quantity,
          product->{
            _id,
            name,
            stock
          }
        }
      }`,
      { orderNumber }
    );

    if (!order) {
      console.error("❌ Order not found:", orderNumber);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Cek apakah order sudah paid
    if (order.status !== "paid") {
      console.log("⚠️ Order not paid yet, skipping stock reduction");
      return NextResponse.json(
        { 
          success: false,
          message: "Order not paid yet" 
        },
        { status: 400 }
      );
    }

    // Cek apakah stock sudah dikurangi sebelumnya
    if (order.stockReduced) {
      console.log("ℹ️ Stock already reduced for this order");
      return NextResponse.json(
        { 
          success: true,
          message: "Stock already reduced",
          alreadyReduced: true
        }
      );
    }

    console.log("📋 Order products:", order.products?.length || 0);

    // Reduce stock untuk setiap product
    const stockUpdates = [];
    
    for (const item of order.products || []) {
      if (!item.product) {
        console.error("❌ Product reference not found for item:", item._key);
        continue;
      }

      const productId = item.product._id;
      const productName = item.product.name;
      const currentStock = item.product.stock || 0;
      const quantity = item.quantity;
      const newStock = currentStock - quantity;

      console.log(`📦 Product: ${productName}`);
      console.log(`   Current stock: ${currentStock}`);
      console.log(`   Quantity ordered: ${quantity}`);
      console.log(`   New stock: ${newStock}`);

      if (newStock < 0) {
        console.error(`⚠️ Insufficient stock for ${productName}`);
        // Tetap lanjutkan, set stock ke 0
        stockUpdates.push({
          productId,
          productName,
          oldStock: currentStock,
          newStock: 0,
          quantity,
          warning: "Insufficient stock, set to 0"
        });
        
        await writeClient
          .patch(productId)
          .set({ stock: 0 })
          .commit();
      } else {
        stockUpdates.push({
          productId,
          productName,
          oldStock: currentStock,
          newStock,
          quantity
        });
        
        await writeClient
          .patch(productId)
          .set({ stock: newStock })
          .commit();
      }
    }

    // Mark order sebagai stockReduced
    try {
      await writeClient
        .patch(order._id)
        .set({ stockReduced: true })
        .commit();
      console.log("✅ Order marked as stockReduced");
    } catch (error) {
      console.error("⚠️ Failed to mark order as stockReduced:", error);
      // Tidak critical, stock sudah dikurangi
    }

    console.log("✅ Stock reduced successfully");
    console.log("📊 Updates:", stockUpdates);

    return NextResponse.json({
      success: true,
      message: "Stock reduced successfully",
      updates: stockUpdates
    });

  } catch (error: any) {
    console.error("❌ Error reducing stock:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reduce stock" },
      { status: 500 }
    );
  }
}

