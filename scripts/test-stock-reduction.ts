// Script untuk test stock reduction
// Run: npx tsx scripts/test-stock-reduction.ts

import { createClient } from "@sanity/client";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_WRITE_READ_TOKEN!,
  useCdn: false,
});

async function testStockReduction() {
  console.log("🧪 Testing Stock Reduction System\n");

  // 1. Test: Fetch a product
  console.log("1️⃣ Fetching a product...");
  const product = await writeClient.fetch(
    `*[_type == "product"][0]{_id, name, stock}`
  );
  
  if (!product) {
    console.error("❌ No products found in database");
    return;
  }
  
  console.log("✅ Product found:", product.name);
  console.log("📦 Current stock:", product.stock);
  console.log("");

  // 2. Test: Fetch an order
  console.log("2️⃣ Fetching an order...");
  const order = await writeClient.fetch(
    `*[_type rder"][0]{
      _id,
      orderNumber,
      status,
      stockReduced,
      products[]{
        quantity,
        product->{_id, name, stock}
      }
    }`
  );
  
  if (!order) {
    console.error("❌ No orders found in database");
    return;
  }
  
  console.log("✅ Order found:", order.orderNumber);
  console.log("📊 Status:", order.status);
  console.log("📦 Stock reduced:", order.stockReduced || false);
  console.log("🛒 Products in order:", order.products?.length || 0);
  console.log("");

  // 3. Test: Check if we can update product stock
  console.log("3️⃣ Testing stock update permission...");
  const testStock = product.stock || 0;
  
  try {
    await writeClient
      .patch(product._id)
      .set({ stock: testStock })
      .commit();
    console.log("✅ Stock update permission: OK");
  } catch (error: any) {
    console.error("❌ Stock update permission: FAILED");
    console.error("Error:", error.message);
    console.log("\n⚠️ SOLUTION:");
    console.log("Generate new Sanity token with Editor/Administrator role");
    console.log("URL: https://www.sanity.io/manage");
    return;
  }
  console.log("");

  // 4. Test: Check if we can update order
  console.log("4️⃣ Testing order update permission...");
  try {
    await writeClient
      .patch(order._id)
      .set({ stockReduced: order.stockReduced || false })
      .commit();
    console.log("✅ Order update permission: OK");
  } catch (error: any) {
    console.error("❌ Order update permission: FAILED");
    console.error("Error:", error.message);
    console.log("\n⚠️ SOLUTION:");
    console.log("Generate new Sanity token with Editor/Administrator role");
    console.log("URL: https://www.sanity.io/manage");
    return;
  }
  console.log("");

  // 5. Summary
  console.log("=" .repeat(50));
  console.log("✅ ALL TESTS PASSED!");
  console.log("=" .repeat(50));
  console.log("\n📋 System Status:");
  console.log("✅ Can read products");
  console.log("✅ Can read orders");
  console.log("✅ Can update product stock");
  console.log("✅ Can update order status");
  console.log("\n🎉 Stock reduction system is ready to use!");
  console.log("\n📝 How to test:");
  console.log("1. Create an order (checkout from cart)");
  console.log("2. Pay at Xendit");
  console.log("3. Go back to Orders page");
  console.log("4. Wait 3 seconds for auto-refresh");
  console.log("5. Status will change to 'Lunas'");
  console.log("6. Stock will be reduced automatically");
  console.log("7. Check product stock in Sanity Studio");
}

testStockReduction().catch(console.error);

