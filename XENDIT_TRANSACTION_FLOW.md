# 🔄 Xendit Transaction Flow - Complete Guide

Dokumentasi lengkap alur transaksi dari checkout hingga history di Orders page.

---

## 📊 Complete Transaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPLETE TRANSACTION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. 🛒 USER ADD TO CART
   │
   ├─ Browse products di localhost:3000
   ├─ Click "Add to Cart"
   └─ Cart badge updated
   
   ↓

2. 💳 USER CHECKOUT
   │
   ├─ Click cart icon
   ├─ Review cart items
   ├─ Fill shipping address
   ├─ Select shippd
   └─ Click "Proceed to Payment"
   
   ↓

3. 📝 CREATE INVOICE & ORDER
   │
   ├─ Function: createCheckoutSession()
   ├─ POST https://api.xendit.co/v2/invoices
   │  └─ Response: invoice_url, invoice_id, status: PENDING
   │
   ├─ Save order to Sanity:
   │  {
   │    orderNumber: "order_xxx",
   │    status: "pending",
   │    xenditTransactionId: "invoice_id",
   │    xenditStatus: "PENDING",
   │    paymentUrl: "https://checkout.xendit.co/v2/xxx",
   │    totalPrice: 50000,
   │    products: [...],
   │    customerName: "John Doe",
   │    email: "john@example.com",
   │    clerkUserId: "user_xxx",
   │    orderDate: "2024-03-21T17:57:55.128Z"
   │  }
   │
   └─ Return: { orderNumber, paymentUrl }
   
   ↓

4. 🌐 REDIRECT TO XENDIT
   │
   ├─ User redirected to: invoice.invoice_url
   │  └─ https://checkout.xendit.co/v2/{invoice_id}
   │
   └─ Xendit Payment Page shows:
      ├─ Order details
      ├─ Total amount: Rp 50.000
      ├─ Expiry: 24 hours
      └─ Payment methods:
         ├─ 🏦 Virtual Account (BCA, BNI, BRI, Mandiri, dll)
         ├─ 💳 Credit Card
         ├─ 📱 E-Wallet (OVO, Dana, ShopeePay, LinkAja, dll)
         ├─ 🏪 Retail Outlet (Alfamart, Indomaret)
         ├─ 📲 QR Code (QRIS)
         └─ 💰 Paylater (Kredivo, Akulaku, Atome)
   
   ↓

5. 💰 USER PAYS
   │
   ├─ User selects payment method (e.g., BCA Virtual Account)
   ├─ Xendit generates VA number: 1234567890
   ├─ User transfers via mobile banking
   └─ Payment confirmed by bank
   
   ↓

6. ✅ PAYMENT SUCCESS
   │
   └─ Xendit updates invoice status: PENDING → PAID
   
   ↓

7. 🔀 TWO PARALLEL ACTIONS
   │
   ├─────────────────────────────┬─────────────────────────────┐
   │                             │                             │
   │  A. USER REDIRECT            │  B. WEBHOOK CALLBACK        │
   │  (Immediate)                 │  (Background)               │
   │                             │                             │
   │  Xendit redirects user to:   │  Xendit sends webhook to:   │
   │  http://localhost:3000/      │  https://xxx.ngrok.io/      │
   │  success?orderNumber=xxx     │  api/webhook/callback       │
   │                             │                             │
   │  User sees:                  │  Webhook handler:           │
   │  ✅ "Order Confirmed!"       │  1. Verify callback token   │
   │  📦 Order number             │  2. Parse payload           │
   │  💳 Payment status           │  3. Fetch order from Sanity │
   │  🔗 Links to Orders          │  4. Update order:           │
   │                             │     - status: "paid"        │
   │                             │     - xenditStatus: "PAID"  │
   │                             │     - paymentMethod: "..."  │
   │                             │     - paymentChannel: "..." │
   │                             │  5. Reduce product stock    │
   │                             │  6. Return success          │
   │                             │                             │
   └─────────────────────────────┴─────────────────────────────┘
   
   ↓

8. 📦 ORDER SAVED IN SANITY
   │
   └─ Order updated in Sanity:
      {
        orderNumber: "order_xxx",
        status: "paid", ✅ UPDATED
        xenditStatus: "PAID", ✅ UPDATED
        xenditTransactionId: "invoice_id",
        paymentUrl: "https://checkout.xendit.co/v2/xxx",
        paymentMethod: "BANK_TRANSFER", ✅ ADDED
        paymentChannel: "BCA", ✅ ADDED
        paidAmount: 50000, ✅ ADDED
        totalPrice: 50000,
        products: [...],
        customerName: "John Doe",
        email: "john@example.com",
        clerkUserId: "user_xxx",
        orderDate: "2024-03-21T17:57:55.128Z"
      }
   
   ↓

9. 📋 HISTORY IN /ORDERS
   │
   ├─ User navigates to: http://localhost:3000/orders
   │
   └─ Orders page shows:
      ├─ List of all orders (sorted by date, newest first)
      ├─ Each order displays:
      │  ├─ Order number: order_xxx
      │  ├─ Order date: 21 Maret 2024
      │  ├─ Status badge: 🟢 "Dibayar"
      │  ├─ Products (first 3 items)
      │  ├─ Total price: Rp 50.000
      │  ├─ Shipping address
      │  └─ Actions:
      │     ├─ "Lihat Invoice" → /invoice/order_xxx
      │     └─ "Bayar Sekarang" (if pending)
      │
      └─ Real-time updates (fetch from Sanity)
```

---

## 🔍 Detailed Breakdown

### Step 8: Order Saved in Sanity

**Before Payment:**
```json
{
  "orderNumber": "order_xxx",
  "status": "pending",
  "xenditStatus": "PENDING",
  "xenditTransactionId": "65fc7522ff846905c2fc1c8d",
  "paymentUrl": "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
  "totalPrice": 50000,
  "products": [...],
  "customerName": "John Doe",
  "email": "john@example.com",
  "clerkUserId": "user_xxx",
  "orderDate": "2024-03-21T17:57:55.128Z"
}
```

**After Payment (Updated by Webhook):**
```json
{
  "orderNumber": "order_xxx",
  "status": "paid", // ✅ UPDATED
  "xenditStatus": "PAID", // ✅ UPDATED
  "xenditTransactionId": "65fc7522ff846905c2fc1c8d",
  "paymentUrl": "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
  "paymentMethod": "BANK_TRANSFER", // ✅ ADDED
  "paymentChannel": "BCA", // ✅ ADDED
  "paidAmount": 50000, // ✅ ADDED
  "totalPrice": 50000,
  "products": [...],
  "customerName": "John Doe",
  "email": "john@example.com",
  "clerkUserId": "user_xxx",
  "orderDate": "2024-03-21T17:57:55.128Z"
}
```

---

### Step 9: History in /orders

**Query Used:**
```typescript
// MY_ORDERS_QUERY
*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc) {
  ...,
  products[] {
    ...,
    product->
  }
}
```

**Page Component:**
```typescript
// app/(client)/orders/page.tsx
const OrdersPage = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      const data = await client.fetch(MY_ORDERS_QUERY, {
        userId: user.id,
      });
      
      setOrders(data);
    };

    fetchOrders();
  }, [user]);

  // Render orders...
};
```

**Display:**
- Orders sorted by date (newest first)
- Status badge:
  - 🟢 "Dibayar" (paid)
  - 🟡 "Menunggu" (pending)
  - 🔴 "Dibatalkan" (cancelled)
- Product images & details
- Total price
- Shipping address
- Action buttons

---

## 🎯 Key Points

### 1. Two Separate URLs

**User Redirect (Frontend):**
```
http://localhost:3000/success?orderNumber=order_xxx
http://localhost:3000/cart
```
- User sees success/failure page immediately
- No delay waiting for webhook

**Webhook Callback (Backend):**
```
https://dernier-potentially-collins.ngrok-free.dev/api/webhook/callback
```
- Xendit sends notification in background
- Updates order status in database
- Reduces product stock

### 2. Order Status Flow

```
pending → paid → processing → shipped → delivered
   ↓
cancelled (if expired/failed)
```

**Status Updates:**
- `pending` - Created when checkout
- `paid` - Updated by webhook after payment
- `processing` - Manual update by admin
- `shipped` - Manual update by admin
- `delivered` - Manual update by admin
- `cancelled` - Updated by webhook if expired/failed

### 3. Real-time Updates

Orders page fetches data from Sanity on:
- Component mount
- User navigation to /orders
- Manual refresh

**To see updated status:**
1. User pays at Xendit
2. Webhook updates order in Sanity
3. User navigates to /orders
4. Orders page fetches latest data
5. User sees "Dibayar" status ✅

---

## 🧪 Testing Complete Flow

### Test 1: Successful Payment

1. **Checkout**
   ```bash
   # Open browser
   http://localhost:3000
   
   # Add products to cart
   # Click checkout
   # Fill address & shipping
   # Click "Proceed to Payment"
   ```

2. **Verify Invoice Created**
   ```bash
   # Check console log
   📝 CREATE INVOICE & ORDER
   ✅ Invoice created: invoice_id
   💾 Order saved to Sanity: order_xxx
   ```

3. **Pay at Xendit**
   ```bash
   # User redirected to Xendit
   # Select payment method (e.g., BCA VA)
   # Copy VA number
   # Transfer via mobile banking
   ```

4. **Verify Redirect**
   ```bash
   # User redirected to:
   http://localhost:3000/success?orderNumber=order_xxx
   
   # Page shows:
   ✅ "Order Confirmed!"
   📦 Order number: order_xxx
   💳 Status: Dibayar
   ```

5. **Verify Webhook**
   ```bash
   # Check server console
   ✅ Xendit Webhook: Callback token verified
   📨 Incoming notification
   📦 Order Number: order_xxx
   💳 Xendit Status: PAID
   ✅ Order updated in Sanity
   💰 Stock reduced
   ```

6. **Check Orders Page**
   ```bash
   # Navigate to:
   http://localhost:3000/orders
   
   # Verify:
   ✅ Order appears in list
   ✅ Status badge: "Dibayar" (green)
   ✅ Order details correct
   ✅ Products displayed
   ✅ Total price correct
   ```

### Test 2: Failed/Expired Payment

1. **Checkout** (same as above)

2. **Don't Pay** (let it expire or cancel)

3. **Verify Redirect**
   ```bash
   # User redirected to:
   http://localhost:3000/cart
   
   # Cart items still there
   # Can checkout again
   ```

4. **Verify Webhook**
   ```bash
   # Check server console
   ✅ Xendit Webhook: Callback token verified
   📨 Incoming notification
   📦 Order Number: order_xxx
   💳 Xendit Status: EXPIRED
   ✅ Order updated: status = cancelled
   ⚠️ Stock NOT reduced
   ```

5. **Check Orders Page**
   ```bash
   # Navigate to:
   http://localhost:3000/orders
   
   # Verify:
   ✅ Order appears in list
   ✅ Status badge: "Dibatalkan" (red)
   ```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│ localhost:   │
│    3000      │
└──────┬───────┘
       │
       │ 1. Checkout
       ↓
┌──────────────┐
│   Next.js    │
│   Server     │
└──────┬───────┘
       │
       │ 2. Create Invoice
       ↓
┌──────────────┐      3. Save Order      ┌──────────────┐
│   Xendit     │◄────────────────────────│    Sanity    │
│     API      │                         │     CMS      │
└──────┬───────┘                         └──────▲───────┘
       │                                        │
       │ 4. Return invoice_url                  │
       ↓                                        │
┌──────────────┐                                │
│   Browser    │                                │
│  (Xendit     │                                │
│   Payment    │                                │
│    Page)     │                                │
└──────┬───────┘                                │
       │                                        │
       │ 5. User pays                           │
       ↓                                        │
┌──────────────┐                                │
│   Xendit     │                                │
│   Backend    │                                │
└──────┬───────┘                                │
       │                                        │
       ├─────────────────────────────────────┐  │
       │                                     │  │
       │ 6a. Redirect user                   │  │
       ↓                                     │  │
┌──────────────┐                             │  │
│   Browser    │                             │  │
│ localhost:   │                             │  │
│ 3000/success │                             │  │
└──────────────┘                             │  │
                                             │  │
                                             │  │ 6b. Send webhook
                                             ↓  │
                                      ┌──────────────┐
                                      │   Next.js    │
                                      │   Webhook    │
                                      │   Handler    │
                                      └──────┬───────┘
                                             │
                                             │ 7. Update order
                                             ↓
                                      ┌──────────────┐
                                      │    Sanity    │
                                      │     CMS      │
                                      └──────────────┘
```

---

## ✅ Summary

**Complete Transaction Flow:**

1. ✅ User checkout di localhost:3000
2. ✅ Invoice created di Xendit
3. ✅ Order saved to Sanity (status: pending)
4. ✅ User redirect ke Xendit payment page
5. ✅ User bayar dengan metode pilihan
6. ✅ User redirect ke localhost:3000/success
7. ✅ Webhook update order di Sanity (status: paid)
8. ✅ Stock reduced
9. ✅ **History muncul di /orders** ✅

**Key Features:**
- ✅ Real-time order tracking
- ✅ Multiple payment methods
- ✅ Automatic stock reduction
- ✅ Order history with status badges
- ✅ Invoice details page
- ✅ Secure webhook verification

---

## 📚 Related Files

**Frontend:**
- `app/(client)/orders/page.tsx` - Orders history page
- `app/(client)/success/page.tsx` - Success page after payment
- `app/(client)/cart/page.tsx` - Cart page (failure redirect)
- `app/(client)/invoice/[orderNumber]/page.tsx` - Invoice details

**Backend:**
- `action/createCheckoutSession.ts` - Create invoice & order
- `app/api/webhook/callback/route.ts` - Webhook handler
- `app/api/invoice/[orderNumber]/route.ts` - Get invoice details

**Helpers:**
- `lib/xendit.ts` - Xendit helper functions
- `lib/xendit-types.ts` - TypeScript types
- `sanity/queries/query.ts` - Sanity queries (MY_ORDERS_QUERY)

---

**Last Updated**: December 2024

