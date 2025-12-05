/**
 * Script untuk testing Invoice Endpoint
 * 
 * Script ini testapi/invoice/[orderNumber]
 * untuk memastikan data invoice dari Xendit bisa diambil
 * 
 * Usage:
 *   node scripts/test-invoice-endpoint.js
 * 
 * Environment Variables:
 *   API_URL - Base URL API (default: http://localhost:3000)
 *   ORDER_NUMBER - Order number untuk testing (REQUIRED)
 */

const http = require('http');
const https = require('https');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const ORDER_NUMBER = process.env.ORDER_NUMBER;

// Validate configuration
if (!ORDER_NUMBER) {
  console.error('❌ Error: ORDER_NUMBER tidak ditemukan');
  console.error('💡 Usage: ORDER_NUMBER=order_xxx node scripts/test-invoice-endpoint.js');
  console.error('');
  console.error('📝 Contoh:');
  console.error('   ORDER_NUMBER=order_123 node scripts/test-invoice-endpoint.js');
  process.exit(1);
}

const url = new URL(`${API_URL}/api/invoice/${ORDER_NUMBER}`);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

console.log('🧪 Testing Invoice Endpoint');
console.log('========================');
console.log('📍 API URL:', API_URL);
console.log('📦 Order Number:', ORDER_NUMBER);
console.log('🔗 Full URL:', url.href);
console.log('');

// Prepare request options
const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

console.log('📤 Sending GET request...');
console.log('');

// Send request
const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response received:');
    console.log('Status Code:', res.statusCode);
    console.log('');
    
    try {
      const jsonData = JSON.parse(data);
      
      console.log('📋 Response Data:');
      console.log(JSON.stringify(jsonData, null, 2));
      console.log('');
      
      // Analyze response
      if (res.statusCode === 200) {
        console.log('✅ Request berhasil!');
        console.log('');
        
        // Check order data
        if (jsonData.order) {
          console.log('📦 Order Data:');
          console.log('   Order Number:', jsonData.order.orderNumber);
          console.log('   Status:', jsonData.order.status);
          console.log('   Xendit Status:', jsonData.order.xenditStatus);
          console.log('   Xendit Transaction ID:', jsonData.order.xenditTransactionId);
          console.log('   Payment URL:', jsonData.order.paymentUrl || '❌ TIDAK ADA');
          console.log('   Total Price:', jsonData.order.totalPrice);
          console.log('');
        } else {
          console.log('⚠️ Order data tidak ditemukan dalam response');
        }
        
        // Check xendit invoice data
        if (jsonData.xenditInvoice) {
          console.log('💳 Xendit Invoice Data:');
          console.log('   Invoice ID:', jsonData.xenditInvoice.id);
          console.log('   Status:', jsonData.xenditInvoice.status);
          console.log('   Invoice URL:', jsonData.xenditInvoice.invoice_url);
          console.log('   Amount:', jsonData.xenditInvoice.amount);
          console.log('   Expiry Date:', jsonData.xenditInvoice.expiry_date);
          console.log('');
        } else {
          console.log('⚠️ Xendit invoice data tidak ditemukan dalam response');
          console.log('💡 Ini normal jika order belum dibuat di Xendit');
          console.log('');
        }
        
        // Check payment URL availability
        const paymentUrl = jsonData.order?.paymentUrl || 
                          jsonData.xenditInvoice?.invoice_url ||
                          (jsonData.order?.xenditTransactionId 
                            ? `https://checkout.xendit.co/web/${jsonData.order.xenditTransactionId}` 
                            : null);
        
        if (paymentUrl) {
          console.log('✅ Payment URL tersedia:', paymentUrl);
        } else {
          console.log('❌ Payment URL TIDAK TERSEDIA!');
          console.log('');
          console.log('🔍 Debugging Info:');
          console.log('   order.paymentUrl:', jsonData.order?.paymentUrl || 'null');
          console.log('   xenditInvoice.invoice_url:', jsonData.xenditInvoice?.invoice_url || 'null');
          console.log('   order.xenditTransactionId:', jsonData.order?.xenditTransactionId || 'null');
          console.log('');
          console.log('💡 Kemungkinan penyebab:');
          console.log('   1. Order belum dibuat di Xendit');
          console.log('   2. xenditTransactionId tidak tersimpan di Sanity');
          console.log('   3. Invoice sudah expired/deleted di Xendit');
        }
      } else if (res.statusCode === 404) {
        console.log('❌ Order tidak ditemukan');
        console.log('');
        console.log('💡 Pastikan:');
        console.log('   1. Order number benar');
        console.log('   2. Order sudah dibuat di sistem');
        console.log('   3. Order tersimpan di Sanity atau Xendit');
      } else {
        console.log('❌ Request gagal dengan status:', res.statusCode);
      }
    } catch (e) {
      console.log('❌ Error parsing JSON response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending request:');
  console.error(error.message);
  console.error('');
  console.error('💡 Pastikan:');
  console.error('   1. Development server berjalan (npm run dev)');
  console.error('   2. API URL benar');
  console.error('   3. Tidak ada firewall yang memblokir');
  process.exit(1);
});

req.end();

