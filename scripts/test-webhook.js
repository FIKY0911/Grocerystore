/**
 * Script untuk test webhook Xendit secara manual
 * 
 * Usage:
 * node scripts/test-webhook.js
 * 
 * Atau dengan custom values:
 * NGROK_URL=https://abc123.ngrok-free.app \
 * CALLBACK_TOKEN=your_token \
 * node scripts/test-webhook.js
 */

const https = require('https');
const http = require('http');

// Get values from environment or use defaults
const NGROK_URL = process.env.NGROK_URL || 'https://YOUR-NGROK-URL.ngrok-free.app';
const CALLBACK_TOKEN = process.env.CALLBACK_TOKEN || 'YOUR_CALLBACK_TOKEN';
const ORDER_NUMBER = process.env.ORDER_NUMBER || 'order_test_123';

// Test payload
const testPayload = {
  id: 'test_invoice_id_' + Date.now(),
  external_id: ORDER_NUMBER,
  status: 'PAID', // atau 'EXPIRED', 'FAILED'
  amount: 10000,
  currency: 'IDR',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
};

const webhookUrl = `${NGROK_URL}/api/webhook/callback`;

console.log('🧪 Testing Xendit Webhook...\n');
console.log('Webhook URL:', webhookUrl);
console.log('Payload:', JSON.stringify(testPayload, null, 2));
console.log('\n');

// Parse URL
const url = new URL(webhookUrl);
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-callback-token': CALLBACK_TOKEN,
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response Status:', res.statusCode);
    console.log('📦 Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('\n🎉 Webhook test berhasil!');
    } else {
      console.log('\n❌ Webhook test gagal. Check error di atas.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Tips:');
  console.log('1. Pastikan ngrok masih berjalan');
  console.log('2. Pastikan development server (npm run dev) sedang berjalan');
  console.log('3. Pastikan URL ngrok sudah benar');
  console.log('4. Pastikan CALLBACK_TOKEN sudah benar');
});

req.write(JSON.stringify(testPayload));
req.end();

