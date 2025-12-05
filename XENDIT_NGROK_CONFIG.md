# Konfigurasi Xendit dengan Ngrok

## Konfigurasi yang Sudah Diterapkan

Berdasarkan konfigurasi Anda di Xendit Dashboard:

### 1. Webhook URL
```
https://dernier-potentially-collins.ngrok-free.dev/api/webhook/callback
```

### 2. Bill Payments URL (Redirect URL)
```
https://dernier-potentially-collins.ngrok-free.dev/
```

## Environment Variables yang Diperlukan

Pastikan file `.env` Anda memiliki konfigurasi berikut:

```env
# Xendit Configuration
XENDIT_SERVER_KEY=xnd_development_xxxxxxxxxxxxxxxxxxxxx
XENDIT_CALLBACK_TOKEN=your_callback_token_from_xendit_dashboard

# Site URL - Gunakan URL ngrok Anda
NEXT_PUBLIC_SITE_URL=https://dernier-potentially-collins.ngrok-free.dev

# Sanity (Opsional)
NEXT_PUBLIC_SANITY_WRITE_TOKEN=your_sanity_token
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=your_dataset
```

## Cara Kerja

### 1. Saat User Checkout
- Invoice dibuat di Xendit dengan:
  - `success_redirect_url`: `https://dernier-potentially-collins.ngrok-free.dev/success`
  - `failure_redirect_url`: `https://dernier-potentially-collins.ngrok-free.dev/cart`

### 2. Webhook Callback
- Xendit akan mengirim notifikasi ke: `https://dernier-potentially-collins.ngrok-free.dev/api/webhook/callback`
- Webhook akan:
  - Verifikasi callback token
  - Update status order di Sanity
  - Reduce stock jika pembayaran berhasil

### 3. Redirect Setelah Pembayaran
- **Success**: User di-redirect ke `/success` dengan orderNumber
- **Failure**: User di-redirect ke `/cart`

## Verifikasi Konfigurasi

### 1. Cek Environment Variables
Pastikan `NEXT_PUBLIC_SITE_URL` sudah di-set ke URL ngrok:
```bash
# Di terminal, cek apakah variable sudah ter-load
echo $NEXT_PUBLIC_SITE_URL
```

### 2. Test Webhook
Gunakan script test webhook:
```bash
node scripts/test-webhook.js
```

Atau dengan custom values:
```bash
NGROK_URL=https://dernier-potentially-collins.ngrok-free.dev \
CALLBACK_TOKEN=your_token \
node scripts/test-webhook.js
```

### 3. Test Checkout Flow
1. Buka aplikasi di: `https://dernier-potentially-collins.ngrok-free.dev`
2. Tambahkan produk ke cart
3. Lakukan checkout
4. Pastikan invoice Xendit dibuat dengan redirect URL yang benar
5. Setelah pembayaran, pastikan webhook menerima callback

## Troubleshooting

### Webhook tidak menerima callback
1. **Pastikan ngrok masih berjalan**
   - URL ngrok harus tetap aktif
   - Jika ngrok restart, URL akan berubah

2. **Update webhook URL di Xendit Dashboard**
   - Jika URL ngrok berubah, update di Xendit Dashboard > Settings > Webhooks

3. **Cek Callback Token**
   - Pastikan `XENDIT_CALLBACK_TOKEN` di `.env` sama dengan yang di Xendit Dashboard

4. **Cek Logs**
   - Lihat terminal development server untuk melihat log webhook
   - Check Xendit Dashboard > Webhooks > Logs untuk melihat status webhook

### Redirect URL tidak bekerja
1. **Pastikan NEXT_PUBLIC_SITE_URL sudah benar**
   - Harus menggunakan URL ngrok: `https://dernier-potentially-collins.ngrok-free.dev`
   - Bukan `http://localhost:3000`

2. **Restart development server**
   - Setelah mengubah `.env`, restart server:
     ```bash
     npm run dev
     ```

3. **Cek Invoice di Xendit Dashboard**
   - Lihat invoice yang dibuat
   - Pastikan `success_redirect_url` dan `failure_redirect_url` sudah benar

## Catatan Penting

⚠️ **Ngrok Free Plan:**
- URL ngrok akan berubah setiap kali restart (kecuali menggunakan ngrok account dengan reserved domain)
- Untuk development, ini biasanya tidak masalah
- Untuk production, gunakan domain permanen dengan HTTPS

⚠️ **Security:**
- Jangan commit file `.env` ke git
- Jangan share URL ngrok atau callback token secara publik
- Gunakan HTTPS untuk production

## Next Steps

Setelah konfigurasi selesai:

1. ✅ Test checkout flow end-to-end
2. ✅ Verify webhook menerima callback dari Xendit
3. ✅ Verify order status update di Sanity CMS
4. ✅ Verify stock reduction saat pembayaran berhasil
5. ✅ Test dengan berbagai payment methods

Selamat! Integrasi Xendit dengan ngrok Anda sudah siap digunakan! 🎉

