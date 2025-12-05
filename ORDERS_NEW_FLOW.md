# 🔄 Orders Flow - Updated Version

Flow baru: Checkout → Orders Page (Pending) → Bayar dari Orders

---

## 🎯 New Flow Overview

### Before (Old Flow)
```
Cart → Checkout → Redirect ke Xendit → Bayar → Orders Page
```

### After (New Flow)
```
Cart → Checkout → Orders Page (Pending) → Klik "Bayar" → Xendit → Orders Page (Paid)
```

---

## 📊 Detailed New Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW CHECKOUT FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. 🛒 USER ADDS TO CART
   └─ Products stored in Zustand

2. 💳 USER CHECKOUT
   ├─ Go to /cart
   ├─ Select address
   ├─ Select shipper
   └─ Click "Buat Invoice Pembayaran"

3. 📝 CREATE ORDER (Status: PENDING)
   ├─ Create invoice di Xendit
   ├─ Save order to Sanity (status: pending)
   ├─ Clear cart
   └─ Redirect to /orders (NOT to Xendit)

4. 📦 ORDERS PAGE
   ├─ Show pending orders with yellow alert
   ├─ Display "💳 Bayar" button for pending orders
   └─ User can see all orders (pending & paid)

5. 💰 USER CLICKS "BAYAR"
   ├─ Opens Xendit payment page (new tab)
   └─ User completes payment

6. ✅ PAYMENT SUCCESS
   ├─ Xendit sends webhook
   ├─ Update order status: pending → paid
   └─ User refreshes /orders to see updated status

7. 🎉 ORDER COMPLETED
   └─ Status badge changes to green "Paid"
```

---

## 🔑 Key Changes

### 1. Cart Page (`app/(client)/cart/page.tsx`)

**Before:**
```typescript
// Redirect ke Xendit payment page
window.location.href = paymentUrl;
```

**After:**
```typescript
// Redirect ke orders page
router.push('/orders');
```

**Toast Message:**
```typescript
toast.success("Pesanan berhasil dibuat! Silakan lanjutkan pembayaran di halaman Orders.");
```

---

### 2. Orders Page (`app/(client)/orders/page.tsx`)

**Added: Pending Orders Alert**
```tsx
{pendingOrders.length > 0 && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <h3>Anda memiliki {pendingOrders.length} pesanan yang menunggu pembayaran</h3>
    <p>Klik tombol "Bayar" untuk melanjutkan pembayaran di Xendit.</p>
  </div>
)}
```

**Added: Pending Count in Footer**
```tsx
Total: {orders.length} orders ({pendingOrders.length} pending)
```

---

### 3. OrdersView - Table (`app/(client)/orders/OrdersView.tsx`)

**Added: Payment Column**
```tsx
<th>Payment</th>

// In tbody
<td>
  {order.status === "pending" && order.paymentUrl ? (
    <a href={order.paymentUrl} target="_blank">
      💳 Bayar
    </a>
  ) : (
    <span>-</span>
  )}
</td>
```

---

### 4. OrderCard - Grid (`components/OrderCard.tsx`)

**Payment Button (Already Exists)**
```tsx
{order.status === "pending" && order.paymentUrl && (
  <div className="mt-4">
    <a
      href={order.paymentUrl}
      target="_blank"
      className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md"
    >
      💳 Bayar Sekarang
    </a>
    <p className="text-xs text-gray-500 text-center mt-2">
      Klik untuk melanjutkan pembayaran di Xendit
    </p>
  </div>
)}
```

---

## 🎨 UI/UX Improvements

### 1. Pending Orders Alert (Yellow Banner)
- Muncul di atas orders list
- Menampilkan jumlah pending orders
- Instruksi jelas untuk user

### 2. Payment Button Visibility
- **Table View**: Kolom "Payment" dengan tombol "💳 Bayar"
- **Grid View**: Tombol besar "💳 Bayar Sekarang" di bawah card

### 3. Status Badges
- **Pending**: Yellow badge
- **Paid**: Green badge
- **Cancelled**: Red badge

### 4. Footer Info
- Total orders count
- Pending orders count (jika ada)

---

## 🧪 Testing New Flow

### Test 1: Complete Checkout Flow
```bash
1. Add products to cart
2. Go to /cart
3. Select address & shipper
4. Click "Buat Invoice Pembayaran"
5. ✅ Should redirect to /orders (NOT Xendit)
6. ✅ Should see yellow alert: "X pesanan menunggu pembayaran"
7. ✅ Should see order with status "Pending"
8. ✅ Should see "💳 Bayar" button
```

### Test 2: Payment from Orders Page
```bash
1. On /orders page with pending order
2. Click "💳 Bayar" button
3. ✅ Should open Xendit in new tab
4. Complete payment in Xendit
5. Go back to /orders tab
6. Click "Refresh" button
7. ✅ Status should change to "Paid"
8. ✅ Yellow alert should disappear (if no more pending)
9. ✅ "💳 Bayar" button should disappear
```

### Test 3: Multiple Pending Orders
```bash
1. Create 3 orders without paying
2. Go to /orders
3. ✅ Should see alert: "3 pesanan menunggu pembayaran"
4. ✅ All 3 orders should have "💳 Bayar" button
5. Pay 1 order
6. Refresh /orders
7. ✅ Should see alert: "2 pesanan menunggu pembayaran"
8. ✅ Paid order should have green badge, no button
9. ✅ 2 pending orders still have "💳 Bayar" button
```

### Test 4: Grid vs Table View
```bash
1. On /orders with pending orders
2. Switch to Grid view
3. ✅ Should see "💳 Bayar Sekarang" button in cards
4. Switch to Table view
5. ✅ Should see "💳 Bayar" button in Payment column
6. Both buttons should work (open Xendit)
```

---

## 📱 User Experience

### Advantages of New Flow

1. **Better Control**
   - User tidak langsung di-redirect ke payment
   - User bisa lihat order dulu sebelum bayar
   - User bisa bayar nanti jika belum siap

2. **Multiple Orders**
   - User bisa create multiple orders
   - Bayar satu per satu sesuai kebutuhan
   - Tracking lebih mudah

3. **Flexibility**
   - User bisa kembali ke orders kapan saja
   - Payment URL tersimpan, bisa dibayar nanti
   - Tidak perlu checkout ulang jika belum bayar

4. **Transparency**
   - User lihat semua orders (pending & paid)
   - Status jelas dengan badges
   - Alert untuk pending orders

---

## 🔄 Status Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER STATUS LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

1. PENDING (Yellow Badge)
   ├─ Order baru dibuat dari checkout
   ├─ Belum dibayar
   ├─ Payment URL tersedia
   └─ Tombol "💳 Bayar" muncul

2. PAID (Green Badge)
   ├─ Payment berhasil (via webhook)
   ├─ Tombol "💳 Bayar" hilang
   └─ Order completed

3. CANCELLED (Red Badge)
   ├─ Order dibatalkan
   └─ Tidak bisa dibayar lagi
```

---

## 💡 Tips for Users

### Untuk User:
1. **Setelah Checkout**: Anda akan diarahkan ke halaman Orders
2. **Lihat Pending Orders**: Cek banner kuning di atas untuk orders yang belum dibayar
3. **Bayar Kapan Saja**: Klik tombol "💳 Bayar" saat siap untuk membayar
4. **Multiple Orders**: Anda bisa create beberapa orders dan bayar satu per satu
5. **Refresh Status**: Setelah bayar, klik "Refresh" untuk update status

### Untuk Developer:
1. **Payment URL**: Tersimpan di order, valid selama 24 jam (default Xendit)
2. **Webhook**: Tetap diperlukan untuk update status
3. **Auto-refresh**: Orders page auto-refresh saat tab visible
4. **Manual Refreser bisa klik tombol "Refresh"

---

## 🎯 Summary

### What Changed:
- ✅ Checkout redirect ke `/orders` (bukan Xendit)
- ✅ Orders page show pending orders dengan alert
- ✅ Payment button di orders page (table & grid)
- ✅ User bayar dari orders page, bukan langsung

### What Stayed:
- ✅ Order creation process sama
- ✅ Xendit invoice creation sama
- ✅ Webhook update status sama
- ✅ Order data structure sama

### Benefits:
- ✅ Better user control
- ✅ More flexible payment timing
- ✅ Better order tracking
- ✅ Support multiple pending orders

---

**Updated**: December 2024
**Version**: 2.0.0
**Status**: Production Ready ✅

