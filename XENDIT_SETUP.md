# Setup Xendit Integration

Dokumentasi ini menjelaskan cara mengintegrasikan Xendit payment gateway ke dalam aplikasi grocery store.

## Environment Variables

Tambahkan variabel berikut ke file `.env.local` atau `.env`:

```env
# Xendit Server Key (Secret Key)
# Digunakan untuk server-side operations seperti membuat invoice, cek status, dll
# JANGAN expose key ini ke client-side
XENDIT_SERVER_KEY=xnd_development_xxxxxxxxxxxxxxxxxxxxx

# Xendit Callback Token
# Token untuk verifikasi webhook dari Xendit
# Dapatkan dari Xendit Dashboard > Settings > Webhooks
XENDIT_CALLBACK_TOKEN=your_callback_token_here

# Xendit Public Key (Optional - untuk client-side jika diperlukan)
# Biasanya tidak diperlukan karena semua operasi dilakukan di server
NEXT_PUBLIC_XENDIT_KEY=xnd_public_development_xxxxxxxxxxxxxxxxxxxxx

# Site URL (untuk redirect setelah pembayaran)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Cara Mendapatkan API Keys

### 1. XENDIT_SERVER_KEY (Secret Key)

1. Login ke [Xendit Dashboard](https://dashboard.xendit.co/)
2. Navigasi ke **Settings** > **API Keys**
3. Klik **Generate secret key**
4. Berikan nama dan atur izin sesuai kebutuhan
5. Salin Secret Key yang dihasilkan
6. **PENTING**: Secret Key hanya ditampilkan sekali, simpan dengan aman!

### 2. XENDIT_CALLBACK_TOKEN

1. Di Xendit Dashboard, navigasi ke **Settings** > **Webhooks**
2. Di bagian **Callback verification token**, salin token yang tersedia
3. Atau buat token baru jika belum ada

### 3. NEXT_PUBLIC_XENDIT_KEY (Optional)

1. Di Xendit Dashboard, navigasi ke **Settings** > **API Keys**
2. Public Key biasanya sudah tersedia di dashboard
3. Salin Public Key yang ada

## Konfigurasi Webhook

1. Di Xendit Dashboard, navigasi ke **Settings** > **Webhooks**
2. Tambahkan webhook URL:
   ```
   https://yourdomain.com/api/webhook/callback
   ```
   Untuk development, gunakan ngrok atau service serupa:
   ```
   https://your-ngrok-url.ngrok.io/api/webhook/callback
   ```
3. Pilih event yang ingin didengarkan:
   - `invoice.paid`
   - `invoice.expired`
   - `invoice.failed`
4. Simpan konfigurasi

## Struktur Integrasi

### 1. Xendit Client (`lib/xendit.ts`)

File ini menginisialisasi Xendit SDK dengan server key dari environment variable.

```typescript
import { Xendit } from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SERVER_KEY,
});

export const Invoice = xenditClient.Invoice;
export default xenditClient;
```

### 2. Create Checkout Session (`action/createCheckoutSession.ts`)

Server action yang membuat invoice di Xendit saat user melakukan checkout.

**Fitur:**
- Membuat invoice dengan detail produk
- Menyimpan order ke Sanity CMS
- Mengembalikan payment URL untuk redirect user

### 3. Webhook Callback (`app/api/webhook/callback/route.ts`)

API route yang menerima notifikasi dari Xendit saat status pembayaran berubah.

**Fitur:**
- Verifikasi callback token untuk keamanan
- Update status order di Sanity
- Reduce stock saat pembayaran berhasil

**Status Mapping:**
- `PAID` → `paid`
- `EXPIRED` / `FAILED` → `cancelled`
- Lainnya → `pending`

### 4. Invoice API (`app/api/invoice/route.ts`)

API route untuk mendapatkan detail invoice dan status pembayaran terbaru dari Xendit.

## Testing

### Development Mode

1. Pastikan semua environment variables sudah di-set
2. Gunakan ngrok atau service serupa untuk expose webhook URL:
   ```bash
   npx ngrok http 3000
   ```
3. Update webhook URL di Xendit Dashboard dengan URL ngrok
4. Test checkout flow:
   - Tambahkan produk ke cart
   - Lakukan checkout
   - Gunakan Xendit test credentials untuk pembayaran

### Test Credentials

Xendit menyediakan test credentials untuk development. Gunakan:
- Test card numbers (jika menggunakan card payment)
- Test e-wallet accounts
- Test bank accounts

Lihat [Xendit Testing Documentation](https://docs.xendit.co/) untuk detail lebih lanjut.

## Troubleshooting

### Error: "Xendit API key tidak ditemukan"

- Pastikan `XENDIT_SERVER_KEY` sudah di-set di file `.env` (atau `.env.local`)
- Pastikan file `.env` ada di root project (sama level dengan `package.json`)
- Restart development server setelah menambahkan environment variable

### Webhook tidak menerima callback

- Pastikan webhook URL sudah dikonfigurasi di Xendit Dashboard
- Pastikan `XENDIT_CALLBACK_TOKEN` sudah di-set dengan benar
- Check log server untuk melihat error details
- Pastikan server dapat diakses dari internet (gunakan ngrok untuk development)

### Invoice tidak dibuat

- Check console log untuk error details
- Pastikan amount minimum adalah 1000 IDR
- Pastikan customer data (email, phone) valid
- Check Xendit Dashboard untuk melihat error dari Xendit

## Security Best Practices

1. **JANGAN** commit file `.env` atau `.env.local` ke git
2. **JANGAN** expose `XENDIT_SERVER_KEY` ke client-side
3. Selalu verifikasi `XENDIT_CALLBACK_TOKEN` di webhook handler
4. Gunakan HTTPS untuk production
5. Validasi semua input sebelum mengirim ke Xendit API

## Resources

- [Xendit Documentation](https://docs.xendit.co/)
- [Xendit Dashboard](https://dashboard.xendit.co/)
- [Xendit API Reference](https://developers.xendit.co/api-reference/)

