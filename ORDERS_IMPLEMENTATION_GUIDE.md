# 📦 Orders List Implementation Guide

Panduan lengkap implementasi Orders List di Client dan Sanity.io sebagai Backend.

---

## 📋 Table of Contents

1. [Overview)
2. [Architecture](#architecture)
3. [Backend Setup (Sanity)](#backend-setup-sanity)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Flow Diagram](#flow-diagram)
7. [Testing](#testing)

---

## 🎯 Overview

Sistem Orders List yang terintegrasi dengan:
- ✅ **Sanity.io** sebagai Backend/Database
- ✅ **Xendit** untuk Payment Gateway
- ✅ **Clerk** untuk User Authentication
- ✅ **Zustand** untuk State Management
- ✅ **Next.js 15** dengan App Router

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDERS SYSTEM ARCHITECTURE                │
└─────────────────────────────────────────────────────────────┘

CLIENT SIDE                    SERVER SIDE                EXTERNAL
┌──────────────┐              ┌──────────────┐          ┌──────────┐
│              │              │              │          │          │
│   Cart       │──────────────│  Checkout    │──────────│  Xendit  │
│  (Zustand)   │   Submit     │   Action     │  Create  │  Payment │
│              │              │              │  Invoice │          │
└──────────────┘              └──────┬───────┘          └────┬─────┘
                                     │                       │
                                     │ Save Order            │ Webhook
                                     ▼                       ▼
                              ┌──────────────┐          ┌──────────┐
                              │              │          │          │
                              │   Sanity.io  │◄─────────│ Webhook  │
                              │   Database   │  Update  │ Handler  │
                              │              │  Status  │          │
                              └──────┬───────┘          └──────────┘
                                     │
                                     │ Fetch Orders
                                     ▼
                              ┌──────────────┐
                              │              │
                              │ Orders Page  │
                              │  (Client)    │
                              │              │
                              └──────────────┘
```

---

## 🗄️ Backend Setup (Sanity)

### 1. Order Schema

File: `sanity/schemaTypes/orderType.ts`

**Key Fields:**
```typescript
{
  orderNumber: string;          // Unique order ID
  clerkUserId: string;          // User ID dari Clerk
  customerName: string;         // Nama customer
  email: string;                // Email customer
  products: array;              // Array of products dengan quantity
  totalPrice: number;           // Total harga
  status: 'pending' | 'paid' | 'cancelled';
  orderDate: datetime;          // Tanggal order
  xenditTransactionId: string;  // ID dari Xendit
  xenditStatus: string;         // Status dari Xendit
  paymentUrl: url;              // URL pembayaran
  address: reference;           // Reference ke address
  shipper: reference;           // Reference ke shipper
}
```

### 2. Query untuk Orders

File: `sanity/queries/query.ts`

```typescript
const MY_ORDERS_QUERY = defineQuery(`
  *[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
    _id,
    orderNumber,
    orderDate,
    customerName,
    email,
    totalPrice,
    status,
    xenditTransactionId,
    xenditStatus,
    paymentUrl,
    products[]{
      quantity,
      priceAtPurchase,
      product->{
        _id,
        name,
        images,
        "slug": slug.current
      }
    },
    address->{
      _id,
      name,
      address,
      city,
      state,
      zip,
      phone
    }
  }
`);
```

---

## 💻 Frontend Implementation

### 1. Orders Page

File: `app/(client)/orders/page.tsx`

**Features:**
- ✅ Display orders dalam table format
- ✅ Filter by user (Clerk userId)
- ✅ Status badges (Paid, Pending, Cancelled)
- ✅ Refresh button
- ✅ Delete order functionality
- ✅ Auto-refresh saat page visible
- ✅ Loading state
- ✅ Empty state

**Key Components:**
```tsx
- Container: Layout wrapper
- Badge: Status indicator
- PriceFormatter: Format harga ke IDR
- Button: Action buttons
- Icons: Lucide React icons
```

### 2. State Management

File: `store.ts`

```typescript
interface StoreState {
  // ... other states
  orders: MY_ORDERS_QUERYResult;
  setOrders: (orders: MY_ORDERS_QUERYResult) => void;
  removeOrder: (orderId: string) => void;
}
```

---

## 🔌 API Endpoints

### 1. Delete Order

**Endpoint:** `DELETE /api/orders/delete`

**Request:**
```json
{
  "orderId": "order_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Security:**
- ✅ Requires authentication (Clerk)
- ✅ Verifies order belongs to user
- ✅ Validates orderId

---

## 🔄 Flow Diagram

### Complete Order Flow

```
1. 🛒 USER ADDS TO CART
   └─ Products stored in Zustand store

2. 💳 USER CHECKOUT
   ├─ Select address
   ├─ Select shipping method
   └─ Click "Proceed to Payment"

3. 📝 CREATE ORDER
   ├─ Call createCheckoutSession()
   ├─ Create invoice di Xendit
   └─ Save order to Sanity (status: pending)

4. 🌐 USER PAYS
   └─ Redirect to Xendit payment page

5. ✅ PAYMENT SUCCESS
   ├─ Xendit sends webhook
   └─ Update order status to 'paid'

6. 📦 DISPLAY IN ORDERS PAGE
   └─ Fetch orders with MY_ORDERS_QUERY
```

### Data Flow: Cart → Order

```typescript
// 1. Cart Data (Zustand)
cart: [
  { product: { _id, name, price, ... }, quantity: 2 }
]

// 2. Checkout Action
createCheckoutSession(groupedItems, metadata)

// 3. Order in Sanity
{
  _type: 'order',
  products: [
    {
      product: { _ref: product._id },
      quantity: 2,
      priceAtPurchase: 15000
    }
  ],
  status: 'pending',
  ...
}

// 4. After Payment (Webhook)
{
  ...order,
  status: 'paid',
  xenditStatus: 'PAID'
}

// 5. Display in Orders Page
orders.map(order => (
  <OrderRow
    orderNumber={order.orderNumber}
    products={order.products}
    status={order.status}
    ...
  />
))
```

---

## 🧪 Testing

### 1. Test Create Order

```bash
# 1. Add products to cart
# 2. Go to checkout
# 3. Fill address & shipping
# 4. Click "Proceed to Payment"
# 5. Check Sanity Studio → Orders
# 6. Verify order created with status: pending
```

### 2. Test Payment Flow

```bash
# 1. Complete checkout
# 2. Pay at Xendit (use test mode)
# 3. Check webhook logs
# 4. Verify order status updated to 'paid'
# 5. Check orders page
```

### 3. Test Orders Page

```bash
# 1. Navigate to /orders
# 2. Verify orders displayed
# 3. Test refresh button
# 4. Test delete order
# 5. Test status badges
```

---

## 📊 Database Structure

### Orders Collection in Sanity

```
orders/
├── order_abc123
│   ├── orderNumber: "order_abc123"
│   ├── clerkUserId: "user_123"
│   ├── customerName: "John Doe"
│   ├── email: "john@example.com"
│   ├── products: [
│   │   {
│   │     product: { _ref: "product_1" },
│   │     quantity: 2,
│   │     priceAtPurchase: 15000
│   │   }
│   │ ]
│   ├── totalPrice: 30000
│   ├── status: "paid"
│   ├── orderDate: "2024-12-05T10:00:00.000Z"
│   ├── xenditTransactionId: "inv_123"
│   ├── xenditStatus: "PAID"
│   ├── paymentUrl: "https://checkout.xendit.co/..."
│   ├── address: { _ref: "address_123" }
│   └── shipper: { _ref: "shipper_jne" }
```

---

## 🎨 UI Components

### Table Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Order List                                      [Refresh]    │
├─────────────────────────────────────────────────────────────┤
│ Order Number │ Date       │ Customer │ Email │ Total │ ... │
├─────────────────────────────────────────────────────────────┤
│ 33a9243ec... │ 22/04/2025 │ Noor M.  │ ...   │ $5,358│ ... │
└─────────────────────────────────────────────────────────────┘
```

### Status Badges

- 🟢 **Paid** - Green badge
- 🟡 **Pending** - Yellow badge
- 🔴 **Cancelled** - Red badge

---

## 🔐 Security

### Authentication
- ✅ Clerk authentication required
- ✅ User can only see their own orders
- ✅ User can only delete their own orders

### Validation
- ✅ Order ID validation
- ✅ User ID verification
- ✅ Amount validation (min 10,000 IDR for Xendit)

---

## 🚀 Deployment Checklist

- [ ] Set environment variables:
  - `XENDIT_SERVER_KEY`
  - `NEXT_PUBLIC_SANITY_WRITE_TOKEN`
  - `NEXT_PUBLIC_SITE_URL`
  - `CLERK_SECRET_KEY`
- [ ] Configure webhook URL di Xendit dashboard
- [ ] Test payment flow in production
- [ ] Verify orders page accessible
- [ ] Test delete order functionality

---

## 📝 Notes

### Important Points

1. **Order Number**: Generated using `randomUUID()` dengan prefix "order_"
2. **Status Flow**: pending → paid (via webhook)
3. **Price Storage**: `priceAtPurchase` menyimpan harga saat order dibuat
4. **Product Reference**: Menggunakan Sanity reference untuk link ke product
5. **Auto-refresh**: Orders page auto-refresh saat tab visible

### Common Issues

**Issue**: Orders tidak muncul
- **Solution**: Check `clerkUserId` match dengan user yang login

**Issue**: Delete order gagal
- **Solution**: Verify user owns the order

**Issue**: Status tidak update
- **Solution**: Check webhook configuration di Xendit

---

## 🎯 Summary

✅ **Backend**: Order schema di Sanity dengan semua field yang diperlukan
✅ **Frontend**: Orders page dengan table layout sesuai design
✅ **API**: Delete order endpoint dengan security
✅ **Flow**: Cart → Checkout → Payment → Orders
✅ **Integration**: Xendit payment + Clerk auth + Sanity database

---

**Last Updated**: December 2024
**Version**: 1.0.0

