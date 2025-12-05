# Setup Webhook Xendit dengan Ngrok

## Langkah 1: Dapatkan URL Ngrok

Setelah menjalankan `ngrok http 3000`, Anda akan melihat output seperti ini:

```
Forwarding   https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:3000
```

**Salin URL HTTPS** (yang berawalan `https://`) - ini adalah URL ngrok Anda.

Contoh: `https://abc123.ngrok-free.app`

## Langkah 2: Konfigurasi Webhook di Xendit Dashboard

1. **Login ke Xendit Dashboard**
   - Buka https://dashboard.xendit.co/
   - Login dengan akun Anda

2. **Navigasi ke Settings > Webhooks**
   - Klik menu **Settings** di sidebar kiri
   - Pilih **Webhooks** dari menu dropdown

3. **Tambahkan Webhook URL**
   - Klik tombol **Add Webhook** atau **Create Webhook**
   - Masukkan webhook URL dengan format:
     ```
     https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/callback
     ```
     Ganti `YOUR-NGROK-URL` dengan URL ngrok yang Anda dapatkan di Langkah 1
   
   **Contoh:**
   ```
   https://abc123.ngrok-free.app/api/webhook/callback
   ```

4. **Pilih Events yang Ingin Didengarkan**
   Centang event-event berikut:
   - ✅ `invoice.paid` - Ketika invoice berhasil dibayar
   - ✅ `invoice.expired` - Ketika invoice expired
   - ✅ `invoice.failed` - Ketika pembayaran gagal
   - ✅ `invoice.voided` - Ketika invoice di-void (opsional)

5. **Salin Callback Token**
   - Setelah membuat webhook, Xendit akan menampilkan **Callback Verification Token**
   - **PENTING**: Salin token ini dan tambahkan ke file `.env` (atau `.env.local`):
     ```env
     XENDIT_CALLBACK_TOKEN=token_yang_di_salin_dari_dashboard
     ```
   - Jika token sudah ada, pastikan token di file `.env` sama dengan yang di dashboard

6. **Simpan Konfigurasi**
   - Klik **Save** atau **Create Webhook**
   - Pastikan status webhook adalah **Active**

## Langkah 3: Update Environment Variables

Pastikan file `.env` Anda (atau `.env.local`) memiliki semua variabel yang diperlukan:

```env
# Xendit Server Key (dari Settings > API Keys)
XENDIT_SERVER_KEY=xnd_development_xxxxxxxxxxxxxxxxxxxxx

# Xendit Callback Token (dari Settings > Webhooks)
XENDIT_CALLBACK_TOKEN=token_dari_webhook_yang_baru_dibuat

# Xendit Public Key (opsional)
NEXT_PUBLIC_XENDIT_KEY=xnd_public_development_xxxxxxxxxxxxxxxxxxxxx

# Site URL - untuk development gunakan URL ngrok
NEXT_PUBLIC_SITE_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

**PENTING**: 
- Ganti `YOUR-NGROK-URL` dengan URL ngrok Anda yang sebenarnya
- Pastikan file `.env` ada di root project (sama level dengan `package.json`)
- Restart development server setelah mengubah file `.env`:
  ```bash
  # Stop server (Ctrl+C)
  # Kemudian jalankan lagi
  npm run dev
  ```

## Langkah 4: Test Webhook

### Test Manual dengan cURL

Anda bisa test webhook secara manual dengan mengirim request ke endpoint:

```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/callback \
  -H "Content-Type: application/json" \
  -H "x-callback-token: YOUR_CALLBACK_TOKEN" \
  -d '{
    "id": "test_invoice_id",
    "external_id": "order_test_123",
    "status": "PAID"
  }'
```

### Test dengan Checkout Flow

1. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

2. **Pastikan Ngrok Masih Berjalan**
   - Terminal ngrok harus tetap aktif
   - URL ngrok tidak boleh berubah (jika berubah, update webhook URL di Xendit Dashboard)

3. **Test Checkout**
   - Buka aplikasi di browser: `http://localhost:3000`
   - Atau melalui ngrok: `https://YOUR-NGROK-URL.ngrok-free.app`
   - Tambahkan produk ke cart
   - Lakukan checkout
   - Gunakan test payment method dari Xendit

4. **Monitor Logs**
   - Check terminal development server untuk melihat log webhook
   - Check terminal ngrok untuk melihat request yang masuk
   - Check Xendit Dashboard > Webhooks > Logs untuk melihat status webhook

## Troubleshooting

### Webhook tidak menerima callback

1. **Pastikan ngrok masih berjalan**
   - URL ngrok harus tetap aktif
   - Jika ngrok restart, URL akan berubah - update webhook URL di Xendit Dashboard

2. **Check Callback Token**
   - Pastikan `XENDIT_CALLBACK_TOKEN` di file `.env` sama dengan yang di Xendit Dashboard
   - Restart development server setelah mengubah file `.env`

3. **Check Webhook URL**
   - Pastikan URL di Xendit Dashboard adalah: `https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/callback`
   - Pastikan tidak ada typo atau trailing slash

4. **Check Server Logs**
   - Lihat terminal development server untuk error messages
   - Check apakah endpoint `/api/webhook/callback` bisa diakses

### Ngrok URL berubah

Jika ngrok restart atau URL berubah:

1. **Dapatkan URL ngrok yang baru**
2. **Update webhook URL di Xendit Dashboard**
3. **Update `NEXT_PUBLIC_SITE_URL` di file `.env`** (jika menggunakan ngrok untuk frontend)
4. **Restart development server**

### Error: "Invalid token" di webhook

- Pastikan `XENDIT_CALLBACK_TOKEN` di file `.env` sama dengan yang di Xendit Dashboard
- Pastikan header `x-callback-token` dikirim oleh Xendit (ini otomatis)
- Check apakah ada whitespace atau karakter tersembunyi di token

## Catatan Penting

⚠️ **Ngrok Free Plan:**
- URL ngrok akan berubah setiap kali restart (kecuali menggunakan ngrok account dengan reserved domain)
- Untuk development, ini biasanya tidak masalah
- Untuk production, gunakan domain permanen dengan HTTPS

⚠️ **Security:**
- Jangan commit file `.env` atau `.env.local` ke git (sudah di-ignore oleh `.gitignore`)
- Jangan share URL ngrok atau callback token secara publik
- Gunakan HTTPS untuk production

## Next Steps

Setelah webhook berhasil dikonfigurasi:

1. ✅ Test checkout flow end-to-end
2. ✅ Verify order status update di Sanity CMS
3. ✅ Verify stock reduction saat pembayaran berhasil
4. ✅ Test dengan berbagai payment methods (jika tersedia)

Selamat! Webhook Xendit Anda sudah siap digunakan! 🎉

