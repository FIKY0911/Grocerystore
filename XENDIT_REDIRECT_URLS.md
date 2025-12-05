# Xendit Redirect URLs Configuration

Dokumentasi konfigurasi redirect URLs untuk Xendit payment gateway.

---

## 🌐 Environment Variable

Redirect URLs menggunakan `NEXT_PUBTE_URL` dari environment variables.

### Development (dengan ngrok)

```env
NEXT_PUBLIC_SITE_URL=https://dernier-potentially-collins.ngrok-free.dev/
```

### Production

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 🔗 Redirect URLs

### 1. Success Redirect URL

**URL**: `http://localhost:3000/success?orderNumber={orderNumber}`

**Example**:
```
http://localhost:3000/success?orderNumber=order_xxx
```

**Kapan digunakan:**
- User berhasil melakukan pembayaran
- Xendit redirect user ke URL ini setelah payment confirmed

**Halaman Success menampilkan:**
- ✅ Confirmation message
- 📦 Order number
- 💳 Payment status
- 🔗 Links ke: Home, Orders, Shop

**File**: `app/(client)/success/page.tsx`

---

### 2. Failure Redirect URL

**URL**: `http://localhost:3000/cart`

**Example**:
```
http://localhost:3000/cart
```

**Kapan digunakan:**
- Invoice expired (tidak dibayar dalam 24 jam)
- Payment failed
- User cancel payment

**Halaman Cart menampilkan:**
- 🛒 Cart items (masih ada)
- 💡 Message: "Pembayaran gagal atau dibatalkan"
- 🔄 Option untuk checkout lagi

**File**: `app/(client)/cart/page.tsx`

---

## 📝 Implementation

### File: `action/createCheckoutSession.ts`

```typescript
// Redirect URLs untuk user (selalu ke localhost)
const redirectBaseUrl = 'http://localhost:3000';

const successRedirectUrl = `${redirectBaseUrl}/success?orderNumber=${orderNumber}`;
const failureRedirectUrl = `${redirectBaseUrl}/cart`;

console.log('🌐 Redirect URLs (untuk user):');
console.log('✅ Success redirect:', successRedirectUrl);
console.log('❌ Failure redirect:', failureRedirectUrl);
console.log('');
console.log('📡 Webhook URL (untuk Xendit callback):');
console.log('🔗', process.env.NEXT_PUBLIC_SITE_URL);

// Prepare invoice data untuk Xendit
const invoiceData = {
  externalId: orderNumber,
  amount: total,
  // ... other fields
  successRedirectUrl: successRedirectUrl,
  failureRedirectUrl: failureRedirectUrl,
  // ... other fields
};

// Create invoice di Xendit
const response = await fetch('https://api.xendit.co/v2/invoices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': getXenditAuthHeader(),
  },
  body: JSON.stringify(xenditPayload),
});
```

---

## 🔄 Redirect Flow

```
User Checkout
   ↓
Create Invoice
   ├─ successRedirectUrl: http://localhost:3000/success?orderNumber=xxx
   └─ failureRedirectUrl: http://localhost:3000/cart
   ↓
User Redirect ke Xendit Payment Page
   ↓
User Bayar
   ↓
┌─────────────────────────────────────┐
│  Payment Success?                   │
├─────────────────────────────────────┤
│  YES → Redirect to localhost:3000   │
│  NO  → Redirect to localhost:3000   │
└─────────────────────────────────────┘
   ↓
User langsung akses localhost:3000
(Tidak perlu ngrok untuk redirect)
```

---

## ⚙️ Configuration Steps

### 1. Set Environment Variable

Edit `.env` file:

```env
# Development
# Webhook URL (untuk Xendit callback)
NEXT_PUBLIC_SITE_URL=https://dernier-potentially-collins.ngrok-free.dev/

# Redirect URL (hardcoded di code)
# User akan di-redirect ke: http://localhost:3000

# Production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start server
npm run dev
```

### 3. Verify URLs

Saat checkout, cek console log:

```bash
🌐 Redirect URLs (untuk user):
✅ Success redirect: http://localhost:3000/success?orderNumber=order_xxx
❌ Failure redirect: http://localhost:3000/cart

📡 Webhook URL (untuk Xendit callback):
🔗 https://dernier-potentially-collins.ngrok-free.dev/
```

### 4. Test Redirect

1. Lakukan checkout
2. Lihat invoice di Xendit
3. Verify redirect URLs di Xendit invoice:
   ```json
   {
     "success_redirect_url": "http://localhost:3000/success?orderNumber=order_xxx",
     "failure_redirect_url": "http://localhost:3000/cart"
   }
   ```

---

## 🧪 Testing

### Test Success Redirect

1. Lakukan checkout
2. Bayar invoice (atau simulate dengan webhook)
3. Xendit akan redirect ke:
   ```
   http://localhost:3000/success?orderNumber=order_xxx
   ```
4. Halaman success harus menampilkan:
   - ✅ "Order Confirmed!"
   - Order number
   - Payment status
   - Links ke Home, Orders, Shop

### Test Failure Redirect

1. Lakukan checkout
2. Biarkan invoice expired (atau cancel payment)
3. Xendit akan redirect ke:
   ```
   http://localhost:3000/cart
   ```
4. Halaman cart harus menampilkan:
   - Cart items (jika masih ada)
   - Option untuk checkout lagi

---

## 🔍 Debugging

### Check Redirect URLs in Console

Saat create invoice, cek console log:

```bash
📤 Creating invoice with Xendit API...
🌐 Using site URL: https://dernier-potentially-collins.ngrok-free.dev
✅ Success redirect: https://dernier-potentially-collins.ngrok-free.dev/success?orderNumber=order_xxx
❌ Failure redirect: https://dernier-potentially-collins.ngrok-free.dev/cart
```

### Check Redirect URLs in Xendit Dashboard

1. Login ke [Xendit Dashboard](https://dashboard.xendit.co/)
2. Navigasi ke **Invoices**
3. Cari invoice berdasarkan order number
4. Klik invoice untuk melihat details
5. Verify `success_redirect_url` dan `failure_redirect_url`

### Check Redirect URLs in API Response

```javascript
// Saat create invoice, log response
console.log('Invoice created:', {
  id: invoice.id,
  success_redirect_url: invoice.success_redirect_url,
  failure_redirect_url: invoice.failure_redirect_url,
});
```

---

## ⚠️ Important Notes

### 1. Trailing Slash

Code automatically removes trailing slash dari `NEXT_PUBLIC_SITE_URL`:

```typescript
// Input: https://dernier-potentially-collins.ngrok-free.dev/
// Output: https://dernier-potentially-collins.ngrok-free.dev

const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
```

### 2. Query Parameters

Success URL includes `orderNumber` as query parameter:

```
/success?orderNumber=order_xxx
```

Halaman success menggunakan `useSearchParams()` untuk mendapatkan orderNumber:

```typescript
const searchParams = useSearchParams();
const orderNumber = searchParams.get("orderNumber");
```

### 3. Ngrok URL Changes

⚠️ **Ngrok Free Plan**: URL berubah setiap kali restart

**Solution:**
1. Update `NEXT_PUBLIC_SITE_URL` di `.env`
2. Restart development server
3. Test checkout lagi

**Better Solution:**
- Gunakan ngrok account dengan reserved domain
- Atau gunakan domain production

### 4. HTTPS Required

Xendit requires HTTPS for redirect URLs in production.

**Development**: ngrok provides HTTPS automatically
**Production**: Use SSL certificate for your domain

---

## 📊 URL Comparison

| Environment | Success URL | Failure URL |
|-------------|-------------|-------------|
| **Development (localhost)** | `http://localhost:3000/success?orderNumber=xxx` | `http://localhost:3000/cart` |
| **Development (ngrok)** | `https://xxx.ngrok.io/success?orderNumber=xxx` | `https://xxx.ngrok.io/cart` |
| **Production** | `https://yourdomain.com/success?orderNumber=xxx` | `https://yourdomain.com/cart` |

---

## ✅ Checklist

- [ ] `NEXT_PUBLIC_SITE_URL` di-set di `.env`
- [ ] Development server restarted
- [ ] Console log menampilkan URL yang benar
- [ ] Test checkout
- [ ] Verify redirect URLs di Xendit invoice
- [ ] Test success redirect
- [ ] Test failure redirect
- [ ] Halaman success menampilkan order details
- [ ] Halaman cart berfungsi setelah failure

---

## 📚 Related Documentation

- [XENDIT_PAYMENT_FLOW.md](./XENDIT_PAYMENT_FLOW.md) - Complete payment flow
- [XENDIT_INTEGRATION_GUIDE.md](./XENDIT_INTEGRATION_GUIDE.md) - Integration guide
- [XENDIT_TESTING.md](./XENDIT_TESTING.md) - Testing guide

---

**Last Updated**: December 2024

