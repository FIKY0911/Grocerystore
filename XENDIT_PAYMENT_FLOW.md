# 🔄 Xendit Payment Flow - Grocery Store

Dokumentasi lengkap alur pembayaran dari cart hingga orders.

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. 🛒 USER ADD TO CART
   │
   ├─ User browse products
   ├─ Click "Add to Cart"
   └─ Cart badge updated
   
   ↓

2. 💳 USER CHECKOUT
   │
   ├─ User click cart icon
   ├─ Review cart items
   ├─ Fill shipping address
   ├─ Select shipping method
   └─ Click "Proceed to Payment"
   
   ↓

3. 📝 CREATE INVOICE (createCheckoutSession)
   │
   ├─ Validate cart items
   ├─ Calculate total amount
   ├─ Format customer data
   ├─ POST https://api.xendit.co/v2/invoices
   │  └─ Response: invoice_url, invoice_id, status: PENDING
   ├─ Save order to Sanity (status: pending)
   │  └─ Include: xenditTransactionId, paymentUrl
   └─ Return: { orderNumber, paymentUrl }
   
   ↓

4. 🌐 REDIRECT TO XENDIT
   │
   ├─ User redirected to: invoice.invoice_url
   │  └─ Example: https://checkout.xendit.co/v2/{invoice_id}
   │
   └─ Xendit Payment Page shows:
      ├─ Order details
      ├─ Total amount
      └─ Payment methods:
         ├─ 🏦 Virtual Account (BCA, BNI, BRI, Mandiri, dll)
         ├─ 💳 Credit Card
         ├─ 📱 E-Wallet (OVO, Dana, ShopeePay, LinkAja, dll)
         ├─ 🏪 Retail Outlet (Alfamart, Indomaret)
         ├─ 📲 QCode (QRIS)
         └─ 💰 Paylater (Kredivo, Akulaku, Atome)
   
   ↓

5. 💰 USER SELECTS PAYMENT METHOD
   │
   ├─ Example: Virtual Account BCA
   │  ├─ Xendit generates VA number
   │  ├─ User copies VA number
   │  └─ User transfers via mobile banking/ATM
   │
   ├─ Example: E-Wallet (OVO)
   │  ├─ User clicks "Pay with OVO"
   │  ├─ OVO app opens
   │  └─ User confirms payment
   │
   └─ Example: QRIS
      ├─ QR code displayed
      ├─ User scans with banking app
      └─ User confirms payment
   
   ↓

6. ✅ PAYMENT COMPLETED
   │
   └─ User completes payment via selected method
   
   ↓

7. 🔔 XENDIT SENDS WEBHOOK
   │
   ├─ POST {your_domain}/api/webhook/callback
   ├─ Headers: x-callback-token
   └─ Body:
      {
        "id": "invoice_id",
        "external_id": "order_xxx",
        "status": "PAID",
        "amount": 50000,
        "paid_amount": 50000,
        "payment_method": "BANK_TRANSFER",
        "payment_channel": "BCA",
        ...
      }
   
   ↓

8. 🔐 WEBHOOK HANDLER (app/api/webhook/callback/route.ts)
   │
   ├─ Verify callback token
   ├─ Parse notification payload
   ├─ Fetch order from Sanity
   ├─ Update order status:
   │  ├─ status: "pending" → "paid"
   │  ├─ xenditStatus: "PENDING" → "PAID"
   │  └─ Add payment details
   ├─ Reduce product stock
   └─ Return success response
   
   ↓

9. 📦 ORDER SAVED TO ORDERS
   │
   ├─ Order status: "paid"
   ├─ Payment confirmed
   ├─ Stock reduced
   └─ Order visible in /orders page
   
   ↓

10. 🎉 USER SEES ORDER IN ORDERS PAGE
    │
    ├─ User navigates to /orders
    ├─ Order listed with status "Dibayar"
    ├─ Can view invoice details
    └─ Can track order status
```

---

## 🔍 Detailed Flow

### Step 1: Add to Cart 🛒

**User Action:**
- Browse products
- Click "Add to Cart" button

**System Action:**
- Add product to cart state (Zustand store)
- Update cart badge count
- Show success toast

**Files Involved:**
- `components/AddToCartButton.tsx`
- `store.ts` (Zustand)

---

### Step 2: Checkout 💳

**User Action:**
- Click cart icon
- Review items in cart
- Fill shipping address
- Select shipping method
- Click "Proceed to Payment"

**System Action:**
- Validate cart items
- Validate address
- Validate shipping method
- Call `createCheckoutSession()`

**Files Involved:**
- `app/(client)/cart/page.tsx` (atau checkout page)
- `action/createCheckoutSession.ts`

---

### Step 3: Create Invoice 📝

**Function:** `createCheckoutSession()`

**Input:**
```typescript
{
  groupedItems: [
    { product: {...}, quantity: 2 },
    { product: {...}, quantity: 1 }
  ],
  metadata: {
    orderNumber: "order_xxx",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    clerkUserId: "user_xxx",
    address: {...},
    shipperId: "shipper_xxx"
  }
}
```

**Process:**
1. Validate input
2. Calculate total amount (min 1000 IDR)
3. Format customer data (phone: 62xxx)
4. Create invoice di Xendit:
   ```typescript
   POST https://api.xendit.co/v2/invoices
   {
     external_id: "order_xxx",
     amount: 50000,
     payer_email: "john@example.com",
     customer: {
       given_names: "John Doe",
       email: "john@example.com",
       mobile_number: "6281234567890"
     },
     invoice_duration: 86400, // 24 hours
     success_redirect_url: "https://yourdomain.com/success",
     failure_redirect_url: "https://yourdomain.com/cart",
     currency: "IDR",
     items: [...]
   }
   ```

5. Xendit Response:
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

6. Save order to Sanity:
   ```typescript
   {
     _type: 'order',
     orderNumber: "order_xxx",
     status: 'pending',
     xenditTransactionId: "65fc7522ff846905c2fc1c8d",
     xenditStatus: 'PENDING',
     paymentUrl: "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
     totalPrice: 50000,
     products: [...],
     ...
   }
   ```

**Output:**
```typescript
{
  orderNumber: "order_xxx",
  paymentUrl: "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d"
}
```

**Files Involved:**
- `action/createCheckoutSession.ts`
- `lib/xendit.ts` (helper functions)

---

### Step 4: Redirect to Xendit 🌐

**System Action:**
- Redirect user to `paymentUrl`
- User sees Xendit payment page

**Xendit Payment Page Shows:**
- Order details
- Total amount
- Expiry time (24 hours)
- Payment methods:
  - **Virtual Account**: BCA, BNI, BRI, Mandiri, Permata, BSI, BNC, CIMB, BJB
  - **E-Wallet**: OVO, Dana, ShopeePay, LinkAja, GoPay, AstraPay, JeniusPay
  - **Retail Outlet**: Alfamart, Indomaret
  - **QR Code**: QRIS
  - **Credit Card**: Visa, Mastercard, JCB
  - **Paylater**: Kredivo, Akulaku, Atome

---

### Step 5: User Selects Payment Method 💰

**Example 1: Virtual Account BCA**
1. User clicks "BCA Virtual Account"
2. Xendit generates VA number: `1234567890`
3. User copies VA number
4. User opens mobile banking/ATM
5. User transfers to VA number
6. Payment confirmed

**Example 2: E-Wallet (OVO)**
1. User clicks "Pay with OVO"
2. OVO app opens (or web redirect)
3. User enters OVO PIN
4. Payment confirmed

**Example 3: QRIS**
1. User clicks "QRIS"
2. QR code displayed
3. User scans with banking app
4. User confirms payment
5. Payment confirmed

---

### Step 6: Payment Completed ✅

**User sees:**
- Payment success message
- Receipt/confirmation
- Redirect to success page (optional)

**Xendit:**
- Updates invoice status: `PENDING` → `PAID`
- Prepares webhook notification

---

### Step 7: Xendit Sends Webhook 🔔

**Webhook Request:**
```http
POST https://yourdomain.com/api/webhook/callback
Headers:
  Content-Type: application/json
  x-callback-token: {XENDIT_CALLBACK_TOKEN}

Body:
{
  "id": "65fc7522ff846905c2fc1c8d",
  "external_id": "order_xxx",
  "user_id": "user_xxx",
  "status": "PAID",
  "merchant_name": "Grocerystore",
  "amount": 50000,
  "paid_amount": 50000,
  "paid_at": "2024-03-21T18:30:00.000Z",
  "payer_email": "john@example.com",
  "description": "Order dari John Doe",
  "payment_method": "BANK_TRANSFER",
  "payment_channel": "BCA",
  "payment_destination": "1234567890",
  "currency": "IDR",
  "created": "2024-03-21T17:57:55.128Z",
  "updated": "2024-03-21T18:30:00.000Z"
}
```

---

### Step 8: Webhook Handler 🔐

**Function:** `POST /api/webhook/callback`

**Process:**
1. **Verify Callback Token**
   ```typescript
   const receivedToken = headers.get('x-callback-token');
   if (!verifyCallbackToken(receivedToken)) {
     return 401 Unauthorized
   }
   ```

2. **Parse Notification**
   ```typescript
   const { external_id, status, payment_method, payment_channel } = payload;
   const orderNumber = external_id; // "order_xxx"
   const xenditStatus = status; // "PAID"
   ```

3. **Map Status**
   ```typescript
   const orderStatus = mapXenditStatusToOrderStatus(xenditStatus);
   // "PAID" → "paid"
   ```

4. **Fetch Order from Sanity**
   ```typescript
   const order = await writeClient.fetch(
     `*[_type == "order" && orderNumber == $orderNumber][0]`,
     { orderNumber }
   );
   ```

5. **Update Order Status**
   ```typescript
   await writeClient
     .patch(order._id)
     .set({
       status: "paid",
       xenditStatus: "PAID",
       paymentChannel: "BCA",
       paymentMethod: "BANK_TRANSFER",
       paidAmount: 50000
     })
     .commit();
   ```

6. **Reduce Stock** (if paid)
   ```typescript
   if (orderStatus === "paid") {
     await reduceStock(orderNumber);
   }
   ```

7. **Return Success**
   ```typescript
   return {
     success: true,
     message: "Webhook processed successfully"
   }
   ```

**Files Involved:**
- `app/api/webhook/callback/route.ts`
- `lib/xendit.ts` (helper functions)
- `sanity/actions.ts` (reduceStock)

---

### Step 9: Order Saved to Orders 📦

**Order in Sanity:**
```typescript
{
  _id: "order_id",
  _type: "order",
  orderNumber: "order_xxx",
  status: "paid", // ✅ Updated
  xenditStatus: "PAID", // ✅ Updated
  xenditTransactionId: "65fc7522ff846905c2fc1c8d",
  paymentUrl: "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
  paymentMethod: "BANK_TRANSFER", // ✅ Added
  paymentChannel: "BCA", // ✅ Added
  paidAmount: 50000, // ✅ Added
  totalPrice: 50000,
  customerName: "John Doe",
  email: "john@example.com",
  clerkUserId: "user_xxx",
  orderDate: "2024-03-21T17:57:55.128Z",
  products: [...],
  address: {...},
  shipper: {...}
}
```

**Product Stock:**
- Stock reduced for each product in order
- Example: Product A stock: 100 → 98 (if quantity: 2)

---

### Step 10: User Sees Order 🎉

**User navigates to `/orders`**

**Orders Page Shows:**
- List of all orders
- Order status badge:
  - 🟢 "Dibayar" (paid)
  - 🟡 "Menunggu" (pending)
  - 🔴 "Dibatalkan" (cancelled)
- Order details:
  - Order number
  - Order date
  - Total price
  - Products
  - Shipping address
- Actions:
  - "Lihat Invoice" button → `/invoice/order_xxx`
  - "Bayar Sekarang" button (if pending)

**Invoice Page Shows:**
- Order details
- Payment status
- Payment URL (if pending)
- Payment methods available
- Expiry time (if pending)
- Payment confirmation (if paid)

**Files Involved:**
- `app/(client)/orders/page.tsx`
- `app/(client)/invoice/[orderNumber]/page.tsx`

---

## 🔄 Status Flow

```
Order Status Flow:
pending → paid → processing → shipped → delivered

Xendit Status Flow:
PENDING → PAID → SETTLED
   ↓
EXPIRED (if not paid within 24 hours)
```

**Status Mapping:**
| Xendit Status | Order Status | Description |
|---------------|--------------|-------------|
| `PENDING` | `pending` | Menunggu pembayaran |
| `PAID` | `paid` | Pembayaran berhasil |
| `SETTLED` | `paid` | Dana sudah masuk ke merchant |
| `EXPIRED` | `cancelled` | Invoice kadaluarsa |
| `FAILED` | `cancelled` | Pembayaran gagal |

---

## ✅ Summary

**Flow yang Anda gunakan sudah BENAR:**

1. ✅ User add to cart
2. ✅ User checkout → Create invoice di Xendit
3. ✅ User redirect ke Xendit payment page
4. ✅ User pilih metode pembayaran (bank, e-wallet, dll)
5. ✅ User bayar
6. ✅ Webhook diterima → Update order status
7. ✅ Order masuk ke Orders page dengan status "Dibayar"

**Semua sudah terimplementasi dengan baik!** 🎉

---

## 📞 Support

Jika ada pertanyaan tentang flow:
- Baca [XENDIT_INTEGRATION_GUIDE.md](./XENDIT_INTEGRATION_GUIDE.md)
- Baca [XENDIT_TESTING.md](./XENDIT_TESTING.md)
- Test dengan scripts yang disediakan

---

**Last Updated**: December 2024

