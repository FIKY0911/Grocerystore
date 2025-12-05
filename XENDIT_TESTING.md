# Testing Xendit Integration

Panduan testing untuk memastikan integrasi Xendit berfungsi dengan baik.

## 🧪 Testing Checklist

### 1. Environment Ves ✅

```bash
# Cek apakah semua environment variables sudah di-set
echo $env:XENDIT_SERVER_KEY
echo $env:XENDIT_CALLBACK_TOKEN
echo $env:NEXT_PUBLIC_XENDIT_KEY
echo $env:NEXT_PUBLIC_SITE_URL
```

**Expected Output:**
- Semua variable harus mengembalikan nilai (bukan kosong)
- `XENDIT_SERVER_KEY` harus dimulai dengan `xnd_development_` atau `xnd_production_`
- `XENDIT_CALLBACK_TOKEN` harus ada (string random)

---

### 2. Test Webhook Endpoint ✅

```bash
# Test webhook dengan order number dummy
node scripts/test-xendit-webhook.js
```

**Expected Output:**
```
✅ Webhook test berhasil!
Response: { success: true, message: "Webhook processed successfully" }
```

**Jika gagal:**
- Pastikan development server berjalan (`npm run dev`)
- Pastikan `XENDIT_CALLBACK_TOKEN` sudah di-set
- Cek console log di terminal development server

---

### 3. Test Invoice Endpoint ✅

```bash
# Test dengan order number yang ada di database
ORDER_NUMBER=order_xxx node scripts/test-invoice-endpoint.js
```

**Expected Output:**
```
✅ Request berhasil!
📦 Order Data:
   Order Number: order_xxx
   Status: pending/paid
   Payment URL: https://checkout.xendit.co/web/xxx
```

**Jika gagal:**
- Pastikan order number benar
- Pastikan order sudah dibuat di Sanity atau Xendit
- Cek console log untuk error details

---

### 4. Test Checkout Flow (End-to-End) 🔄

#### Step 1: Add Product to Cart
1. Buka aplikasi di browser: `http://localhost:3000`
2. Pilih produk
3. Klik "Add to Cart"
4. Cek cart icon (harus ada badge jumlah)

#### Step 2: Checkout
1. Klik cart icon
2. Klik "Checkout"
3. Isi alamat pengiriman
4. Pilih jasa pengiriman
5. Klik "Proceed to Payment"

**Expected:**
- Loading indicator muncul
- Redirect ke halaman invoice
- Invoice menampilkan detail order
- Payment URL tersedia

**Jika gagal:**
- Cek console browser untuk error
- Cek console server untuk error
- Pastikan `XENDIT_SERVER_KEY` valid

#### Step 3: View Invoice
1. Setelah checkout, Anda akan di-redirect ke `/invoice/order_xxx`
2. Halaman invoice harus menampilkan:
   - Order number
   - Status pembayaran
   - Total harga
   - Tombol "Bayar Sekarang"
   - Payment methods (Virtual Account, E-Wallet, dll)

**Expected:**
- Semua data tampil dengan benar
- Payment URL tersedia
- Tombol "Bayar Sekarang" berfungsi

**Jika gagal:**
- Cek console browser: `📋 Invoice data received`
- Cek apakah `paymentUrl` ada
- Cek apakah `xenditTransactionId` ada

#### Step 4: Payment
1. Klik "Bayar Sekarang"
2. Tab baru terbuka dengan Xendit payment page
3. Pilih metode pembayaran (contoh: Virtual Account BCA)
4. Salin nomor Virtual Account

**Expected:**
- Xendit payment page terbuka
- Berbagai metode pembayaran tersedia
- Nomor VA/payment code ditampilkan

**Jika gagal:**
- Cek apakah payment URL valid
- Cek Xendit Dashboard untuk melihat invoice

#### Step 5: Simulate Payment (Development)
Untuk development, gunakan Xendit test mode:

**Option A: Webhook Simulation**
```bash
# Simulate payment success
ORDER_NUMBER=order_xxx STATUS=PAID node scripts/test-xendit-webhook.js
```

**Option B: Xendit Dashboard**
1. Login ke [Xendit Dashboard](https://dashboard.xendit.co/)
2. Navigasi ke **Invoices**
3. Cari invoice berdasarkan order number
4. Klik "Mark as Paid" (untuk testing)

#### Step 6: Verify Order Status
1. Kembali ke halaman invoice
2. Klik "Refresh Status" atau reload page
3. Status harus berubah menjadi "Dibayar"
4. Navigasi ke `/orders`
5. Order harus muncul dengan status "Dibayar"

**Expected:**
- Status order ter-update di Sanity
- Stock produk berkurang
- Badge di header ter-update

**Jika gagal:**
- Cek webhook logs di console server
- Cek Sanity Studio untuk melihat order status
- Cek apakah webhook URL sudah dikonfigurasi di Xendit Dashboard

---

## 🔍 Debugging Tips

### Console Logs to Check

#### Browser Console
```javascript
// Saat fetch invoice
📋 Invoice data received: {
  hasOrder: true,
  hasPaymentUrl: true,
  paymentUrl: "https://checkout.xendit.co/web/xxx",
  xenditTransactionId: "xxx",
  hasXenditInvoice: true
}

// Saat payment URL tersedia
✅ Payment URL tersedia: https://checkout.xendit.co/web/xxx
```

#### Server Console
```bash
# Saat create invoice
📤 Creating invoice with Xendit API...
✅ Invoice created successfully: { id: "xxx", status: "PENDING" }
💾 Saving order data to Sanity...
✅ Order saved to Sanity successfully

# Saat webhook diterima
✅ Xendit Webhook: Callback token verified
📨 Xendit Webhook: Incoming notification
📦 Order Number: order_xxx
💳 Xendit Status: PAID
✅ Order updated successfully in Sanity
💰 Payment successful, reducing stock...
✅ Stock reduced successfully
```

### Common Issues

#### 1. Payment URL tidak tersedia
**Symptoms:**
- `paymentUrl` is null/undefined
- Tombol "Bayar Sekarang" tidak berfungsi

**Debug:**
```javascript
// Cek di browser console
console.log('Order:', invoiceData?.order);
console.log('Payment URL:', invoiceData?.order?.paymentUrl);
console.log('Xendit Transaction ID:', invoiceData?.order?.xenditTransactionId);
console.log('Xendit Invoice:', invoiceData?.xenditInvoice);
```

**Solutions:**
1. Pastikan invoice berhasil dibuat di Xendit
2. Cek `xenditTransactionId` tersimpan di Sanity
3. Cek Xendit Dashboard untuk melihat invoice
4. Fallback: Gunakan manual URL `https://checkout.xendit.co/web/{xenditTransactionId}`

#### 2. Webhook tidak diterima
**Symptoms:**
- Order status tidak ter-update setelah pembayaran
- Stock tidak berkurang

**Debug:**
```bash
# Cek webhook logs di server console
# Seharusnya ada log seperti:
✅ Xendit Webhook: Callback token verified
📨 Xendit Webhook: Incoming notification
```

**Solutions:**
1. Pastikan webhook URL dikonfigurasi di Xendit Dashboard
2. Untuk development, gunakan ngrok
3. Test webhook dengan script: `node scripts/test-xendit-webhook.js`
4. Cek Xendit Dashboard > Webhooks > Logs

#### 3. Invoice tidak ditemukan
**Symptoms:**
- Error "Invoice tidak ditemukan"
- 404 response dari API

**Debug:**
```bash
# Test endpoint
ORDER_NUMBER=order_xxx node scripts/test-invoice-endpoint.js
```

**Solutions:**
1. Pastikan order number benar
2. Cek apakah order ada di Sanity
3. Cek apakah invoice ada di Xendit (via external_id)
4. Cek console log untuk error details

---

## 📊 Test Scenarios

### Scenario 1: Happy Path (Success)
1. ✅ User checkout
2. ✅ Invoice created in Xendit
3. ✅ Order saved in Sanity
4. ✅ User redirected to invoice page
5. ✅ User clicks "Bayar Sekarang"
6. ✅ User completes payment
7. ✅ Webhook received
8. ✅ Order status updated to "paid"
9. ✅ Stock reduced
10. ✅ User sees success message

### Scenario 2: Payment Expired
1. ✅ User checkout
2. ✅ Invoice created
3. ❌ User doesn't pay within 24 hours
4. ✅ Webhook received (status: EXPIRED)
5. ✅ Order status updated to "cancelled"
6. ✅ Stock NOT reduced

### Scenario 3: Payment Failed
1. ✅ User checkout
2. ✅ Invoice created
3. ❌ Payment fails (insufficient balance, etc)
4. ✅ Webhook received (status: FAILED)
5. ✅ Order status updated to "cancelled"
6. ✅ Stock NOT reduced

---

## 🚀 Production Testing

### Before Going Live

1. ✅ Switch to production API keys
   ```env
   XENDIT_SERVER_KEY=xnd_production_xxx
   XENDIT_CALLBACK_TOKEN=production_token
   NEXT_PUBLIC_XENDIT_KEY=xnd_public_production_xxx
   ```

2. ✅ Update webhook URL to production domain
   ```
   https://yourdomain.com/api/webhook/callback
   ```

3. ✅ Test with real payment (small amount)
4. ✅ Verify webhook received in production
5. ✅ Verify order status updated
6. ✅ Verify stock reduced
7. ✅ Monitor Xendit Dashboard for errors

### Production Monitoring

1. **Xendit Dashboard**
   - Monitor invoice creation
   - Check webhook delivery status
   - Review failed payments

2. **Server Logs**
   - Monitor webhook logs
   - Check for errors
   - Track payment success rate

3. **Sanity Studio**
   - Verify orders are created
   - Check order status updates
   - Monitor stock levels

---

## 📞 Support

Jika masih ada masalah setelah testing:

1. Cek [XENDIT_INTEGRATION_GUIDE.md](./XENDIT_INTEGRATION_GUIDE.md) untuk troubleshooting
2. Cek console logs (browser & server)
3. Test dengan scripts yang disediakan
4. Hubungi Xendit Support: support@xendit.co

---

**Last Updated**: December 2024

