# Xendit API Endpoints

Dokumentasi endpoint Xendit yang digunakan dalam aplikasi.

## 🌐 Base URL

```
https://api.xendit.co
```

---

## 📋 Endpoints yang Digunakan

### 1. Create Invoice

**Endpoint**: `POST /v2/invoices`

**Digunakan di**: `action/createCheckoutSession.ts`

**Purpose**: Membuat invoice baru untuk pembayaran

**Request**:
```typescript
POST https://api.xendit.co/v2/invoices
Headers:
  Content-Type: application/json
  Authorization: Basic {base64(XENDIT_SERVER_KEY:)}

Body:
{
  external_id: "order_xxx",
  amount: 50000,
  payer_email: "customer@example.com",
  description: "Order dari Customer",
  customer: {
    given_names: "John Doe",
    email: "customer@example.com",
    mobile_number: "6281234567890"
  },
  invoice_duration: 86400,
  success_redirect_url: "https://yourdomain.com/success",
  failure_redirect_url: "https://yourdomain.com/cart",
  currency: "IDR",
  items: [...]
}
```

**Response**:
```json
{
  "id": "65fc7522ff846905c2fc1c8d",
  "external_id": "order_xxx",
  "status": "PENDING",
  "invoice_url": "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
  "amount": 50000,
  "expiry_date": "2024-03-22T17:57:54.578Z",
  "available_banks": [...],
  "available_ewallets": [...],
  ...
}
```

**Documentation**: https://developers.xendit.co/api-reference/#create-invoice

---

### 2. Get Invoice by External ID

**Endpoint**: `GET /v2/invoices?external_id={orderNumber}`

**Digunakan di**: `app/api/invoice/[orderNumber]/route.ts`

**Purpose**: Mendapatkan invoice berdasarkan external_id (order number)

**Request**:
```typescript
GET https://api.xendit.co/v2/invoices?external_id=order_xxx
Headers:
  Authorization: Basic {base64(XENDY:)}
```

**Response**:
```json
[
  {
    "id": "65fc7522ff846905c2fc1c8d",
    "external_id": "order_xxx",
    "status": "PENDING",
    "invoice_url": "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
    "amount": 50000,
    ...
  }
]
```

**Notes**:
- Response adalah array of invoices
- Bisa juga return object dengan property `data` yang berisi array
- Filter berdasarkan `external_id` yang match

**Documentation**: https://developers.xendit.co/api-reference/#get-invoice

---

### 3. Get Invoice by ID

**Endpoint**: `GET /v2/invoices/{invoice_id}`

**Digunakan di**: `app/api/invoice/[orderNumber]/route.ts`

**Purpose**: Mendapatkan invoice berdasarkan invoice ID untuk cek status terbaru

**Request**:
```typescript
GET https://api.xendit.co/v2/invoices/65fc7522ff846905c2fc1c8d
Headers:
  Authorization: Basic {base64(XENDIT_SERVER_KEY:)}
```

**Response**:
```json
{
  "id": "65fc7522ff846905c2fc1c8d",
  "external_id": "order_xxx",
  "status": "PAID",
  "invoice_url": "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
  "amount": 50000,
  "paid_amount": 50000,
  "paid_at": "2024-03-21T18:30:00.000Z",
  "payment_method": "BANK_TRANSFER",
  "payment_channel": "BCA",
  ...
}
```

**Documentation**: https://developers.xendit.co/api-reference/#get-invoice

---

## 🔐 Authentication

Semua endpoint menggunakan **Basic Authentication**:

```typescript
Authorization: Basic {base64(XENDIT_SERVER_KEY + ':')}
```

**Implementation**:
```typescript
// Helper function di lib/xendit.ts
export function getXenditAuthHeader(): string {
  const serverKey = getXenditServerKey();
  return `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;
}

// Usage
const response = await fetch('https://api.xendit.co/v2/invoices', {
  headers: {
    'Authorization': getXenditAuthHeader(),
  }
});
```

---

## 🔔 Webhook Callback

**Endpoint**: `POST {your_webhook_url}`

**Diterima di**: `app/api/webhook/callback/route.ts`

**Purpose**: Xendit mengirim notifikasi saat status invoice berubah

**Request dari Xendit**:
```typescript
POST https://yourdomain.com/api/webhook/callback
Headers:
  Content-Type: application/json
  x-callback-token: {XENDIT_CALLBACK_TOKEN}

Body:
{
  "id": "65fc7522ff846905c2fc1c8d",
  "external_id": "order_xxx",
  "status": "PAID",
  "amount": 50000,
  "paid_amount": 50000,
  "paid_at": "2024-03-21T18:30:00.000Z",
  "payment_method": "BANK_TRANSFER",
  "payment_channel": "BCA",
  ...
}
```

**Response yang harus dikirim**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Security**:
- Verify `x-callback-token` header
- Token harus match dengan `XENDIT_CALLBACK_TOKEN` di environment variables

**Documentation**: https://developers.xendit.co/api-reference/#invoice-callback

---

## 📊 Invoice Status Flow

```
PENDING → PAID → SETTLED
   ↓
EXPIRED
```

**Status Descriptions**:
- `PENDING` - Invoice dibuat, menunggu pembayaran
- `PAID` - Pembayaran berhasil, dana masih di Xendit
- `SETTLED` - Dana sudah masuk ke saldo merchant
- `EXPIRED` - Invoice kadaluarsa (default 24 jam)

**Internal Status Mapping** (di aplikasi):
```typescript
PENDING → pending
PAID/SETTLED → paid
EXPIRED/FAILED → cancelled
```

---

## 🧪 Testing Endpoints

### Test Create Invoice

```bash
curl -X POST https://api.xendit.co/v2/invoices \
  -H "Content-Type: application/json" \
  -u xnd_development_xxx: \
  -d '{
    "external_id": "test_order_123",
    "amount": 50000,
    "payer_email": "test@example.com",
    "description": "Test invoice"
  }'
```

### Test Get Invoice by External ID

```bash
curl -X GET "https://api.xendit.co/v2/invoices?external_id=test_order_123" \
  -u xnd_development_xxx:
```

### Test Get Invoice by ID

```bash
curl -X GET https://api.xendit.co/v2/invoices/65fc7522ff846905c2fc1c8d \
  -u xnd_development_xxx:
```

---

## 🔗 Payment URL Format

Setelah invoice dibuat, user akan di-redirect ke:

```
https://checkout.xendit.co/v2/{invoice_id}
```

atau

```
https://checkout.xendit.co/web/{invoice_id}
```

**Example**:
```
https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d
```

Di halaman ini, user bisa:
- Pilih metode pembayaran (VA, E-Wallet, QR, dll)
- Lihat detail pembayaran
- Mendapatkan nomor VA atau payment code
- Melakukan pembayaran

---

## 📚 Resources

- **Xendit API Documentation**: https://developers.xendit.co/api-reference/
- **Invoice API**: https://developers.xendit.co/api-reference/#invoices
- **Webhook Guide**: https://developers.xendit.co/api-reference/#webhooks
- **Testing Guide**: https://developers.xendit.co/api-reference/#test-scenarios
- **Xendit Dashboard**: https://dashboard.xendit.co/

---

## 🔍 Debugging

### Check API Response

```javascript
// Di browser console atau server log
const response = await fetch('https://api.xendit.co/v2/invoices/xxx', {
  headers: { 'Authorization': getXenditAuthHeader() }
});

console.log('Status:', response.status);
console.log('Data:', await response.json());
```

### Common Errors

| Status Code | Error | Solution |
|-------------|-------|----------|
| 401 | Unauthorized | Check XENDIT_SERVER_KEY |
| 404 | Not Found | Check invoice ID or external_id |
| 400 | Bad Request | Check request payload |
| 500 | Server Error | Contact Xendit support |

---

**Last Updated**: December 2024

