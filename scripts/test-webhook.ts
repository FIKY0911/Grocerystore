// Script untuk test webhook secara manual
import { createClient } from '@sanity/client';

const writeClient = createClient({
  projectId: '4pdrsxhm',
  dataset: 'production',
  apiVersion: '2025-10-10',
  useCdn: false,
  token: process.env.SANITY_WRITE_READ_TOKEN,
});

async function testWebhook() {
  try {
    console.log('🧪 Testing Webhook - Manual Status Update\n');

    // Get latest pending order
    const order = await writeClient.fetch(
      `*[_type == 'order' && status == 'pending'] | order(orderDate desc)[0]`
    );

    if (!order) {
      console.log('❌ No pending orders found');
      console.log('💡 Create an order first by doing checkout');
      return;
    }

    console.log('📦 Found pending order:');
    console.log('   Order Number:', order.orderNumber);
    console.log('   Current Status:', order.status);
    console.log('   Customer:', order.customerName);
    console.log('   Total:', order.totalPrice);
    console.log('');

    // Simulate webhook - update status to paid
    console.log('💾 Updating status to "paid"...');
    
    const updateData = {
      status: 'paid',
      xenditStatus: 'PAID',
      xenditTransactionId: 'test_' + Date.now(),
    };

    const result = await writeClient
      .patch(order._id)
      .set(updateData)
      .commit();

    console.log('✅ Order updated successfully!');
    console.log('');
    console.log('📊 New Status:');
    console.log('   status:', result.status);
    console.log('   xenditStatus:', result.xenditStatus);
    console.log('');
    console.log('🎉 Test complete! Check orders page to see the change.');
    console.log('💡 Status should change from "Menunggu" to "Lunas"');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('💡 Possible issues:');
    console.error('   - SANITY_WRITE_READ_TOKEN not set or invalid');
    console.error('   - Token does not have write permissions');
    console.error('   - Network connection issue');
  }
}

testWebhook();
