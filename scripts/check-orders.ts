// Script untuk check orders di Sanity
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '4pdrsxhm',
  dataset: 'production',
  apiVersion: '2025-10-10',
  useCdn: false,
  token: process.env.SANITY_WRITE_READ_TOKEN,
});

async function checkOrders() {
  try {
    console.log('🔍 Checking orders in Sanity...\n');

    // Get latest orders
    const orders = await client.fetch(`*[_type == 'order'] | order(orderDate desc)[0...5]{
      _id,
      orderNumber,
      orderDate,
      totalPrice,
      status,
      clerkUserId,
      customerName,
      "productsCount": count(products),
      products[]{
        quantity,
        priceAtPurchase,
        "productRef": product._ref,
        product->{
          _id,
          name,
          price
        }
      }
    }`);

    console.log(`📊 Total orders found: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('⚠️  No orders found in Sanity!');
      console.log('💡 Try creating an order first by doing checkout.');
      return;
    }

    orders.forEach((order: any, idx: number) => {
      console.log(`\n📦 Order ${idx + 1}:`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: Rp ${order.totalPrice?.toLocaleString('id-ID')}`);
      console.log(`   Products Count (schema): ${order.productsCount || 0}`);
      console.log(`   Products Array Length: ${order.products?.length || 0}`);
      
      if (order.products && order.products.length > 0) {
        console.log(`   Products:`);
        order.products.forEach((p: any, i: number) => {
          console.log(`     ${i + 1}. ${p.product?.name || '❌ NOT POPULATED'} (${p.quantity}x) - Rp ${p.priceAtPurchase?.toLocaleString('id-ID')}`);
          console.log(`        Product Ref: ${p.productRef}`);
          console.log(`        Product Populated: ${p.product ? '✅ Yes' : '❌ No'}`);
          if (p.product) {
            console.log(`        Product ID: ${p.product._id}`);
            console.log(`        Product Price: Rp ${p.product.price?.toLocaleString('id-ID')}`);
          }
        });
      } else {
        console.log(`   ⚠️  NO PRODUCTS FOUND!`);
        console.log(`   💡 This means products array is empty in Sanity.`);
      }
    });

    console.log('\n✅ Check complete!');
    console.log('\n💡 Tips:');
    console.log('   - If "Product Populated: ❌ No" → Product reference is broken');
    console.log('   - If "NO PRODUCTS FOUND" → Products not saved during checkout');
    console.log('   - Check server console logs during checkout for errors');
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  }
}

checkOrders();
