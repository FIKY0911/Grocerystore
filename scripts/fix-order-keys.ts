// Script untuk fix missing _key di products array
import { createClient } from '@sanity/client';

const writeClient = createClient({
  projectId: '4pdrsxhm',
  dataset: 'production',
  apiVersion: '2025-10-10',
  useCdn: false,
  token: process.env.SANITY_WRITE_READ_TOKEN,
});

async function fixOrderKeys() {
  try {
    console.log('🔧 Fixing missing _key in order products...\n');

    // Get all orders
    const orders = await writeClient.fetch(`*[_type == 'order']{
      _id,
      orderNumber,
      products
    }`);

    console.log(`📊 Found ${orders.length} orders\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const order of orders) {
      if (!order.products || order.products.length === 0) {
        console.log(`⏭️  Skipping order ${order.orderNumber} - no products`);
        skippedCount++;
        continue;
      }

      // Check if any product is missing _key
      const needsFix = order.products.some((p: any) => !p._key);

      if (!needsFix) {
        console.log(`✅ Order ${order.orderNumber} - already has keys`);
        skippedCount++;
        continue;
      }

      console.log(`🔧 Fixing order ${order.orderNumber}...`);

      // Add _key to products that don't have it
      const fixedProducts = order.products.map((product: any, index: number) => {
        if (product._key) {
          return product; // Already has _key
        }

        // Generate unique _key
        const productId = product.product?._ref || 'unknown';
        const key = `product-${productId}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

        return {
          ...product,
          _key: key,
        };
      });

      // Update order with fixed products
      try {
        await writeClient
          .patch(order._id)
          .set({ products: fixedProducts })
          .commit();

        console.log(`   ✅ Fixed ${fixedProducts.length} products`);
        fixedCount++;
      } catch (error: any) {
        console.error(`   ❌ Error fixing order ${order.orderNumber}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} orders`);
    console.log(`   ⏭️  Skipped: ${skippedCount} orders`);
    console.log(`   📦 Total: ${orders.length} orders`);
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixOrderKeys();
