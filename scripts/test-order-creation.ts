// Test script untuk memastikan order bisa dibuat di Sanity
import { writeClient } from '../sanity/lib/writeClient';

async function testOrderCreation() {
  console.log('🧪 Testing order creation in Sanity...\n');

  // Test data
  const testOrder = {
    _type: 'order',
    orderNumber: `test_order_${Date.now()}`,
    clerkUserId: 'test_user_123',
    customerName: 'Test Customer',
    email: 'test@example.com',
    products: [
      {
        _type: 'object',
        product: { _type: 'reference', _ref: 'd105d4a2-26ed-4a11-95fa-1bf6394fe8ca' }, // Ganti dengan product ID yang valid
        quantity: 1,
        priceAtPurchase: 10000,
      },
    ],
    address: { _type: 'reference', _ref: 'your-address-id' }, // Ganti dengan address ID yang valid
    shipper: { _type: 'reference', _ref: 'your-shipper-id' }, // Ganti dengan shipper ID yang valid
    status: 'pending',
    orderDate: new Date().toISOString(),
    totalPrice: 10000,
    paymentUrl: 'https://checkout-staging.xendit.co/web/test123',
  };

  try {
    console.log('📦 Creating test order...');
    console.log('Order data:', JSON.stringify(testOrder, null, 2));
    
    const result = await writeClient.create(testOrder);
    
    console.log('\n✅ Order created successfully!');
    console.log('Order ID:', result._id);
    console.log('Order Number:', result.orderNumber);
    
    return result;
  } catch (error: any) {
    console.error('\n❌ Failed to create order:');
    console.error('Error:', error.message);
    console.error('Details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Run test
testOrderCreation()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
