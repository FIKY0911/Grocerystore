# 🧪 Orders Testing Guide

Panduan lengkap untuk testing fitur Orders List.

---

## 📋 Pre-requisites

Sebelum testing, pastikan:
- ✅ Sanity Studio running (`npm run dev`)
- ✅ Xendit account configured (test mode)
- ✅ Clerk authentication setup
- ✅ Environment variables configured:
  - `XENDIT_SERVER_KEY`
  - `NEXT_PUBLIC_SANITY_WRITE_TOKEN`
  - `NEXT_PUBLIC_SITE_URL`
  - `CLERK_SECRET_KEY`

---

## 🧪 Test Scenarios

### Test 1: Create Order from Cart

**Steps:**
1. Login dengan Clerk
2. Add products to cart (minimal 2 products)
3. Go to `/cart`
4. Click "Checkout"
5. Fill shipping address
6. Select shipping m
 Click "Proceed to Payment"

**Expected Result:**
- ✅ Redirect ke Xendit payment page
- ✅ Order created di Sanity dengan status "pending"
- ✅ Order number generated (format: `order_uuid`)
- ✅ Products saved dengan quantity & priceAtPurchase

**Verify in Sanity Studio:**
```
1. Go to http://localhost:3000/studio
2. Navigate to Orders
3. Find your order
4. Check:
   - orderNumber exists
   - clerkUserId matches your user
   - products array populated
   - status = "pending"
   - xenditTransactionId exists
   - paymentUrl exists
```

---

### Test 2: View Orders Page

**Steps:**
1. Login dengan Clerk
2. Navigate to `/orders`
3. Wait for orders to load

**Expected Result:**
- ✅ Orders displayed in table format
- ✅ Only your orders shown (filtered by clerkUserId)
- ✅ Order details correct:
  - Order number (truncated)
  - Date formatted (DD/MM/YYYY)
  - Customer name
  - Email
  - Total price (formatted IDR)
  - Status badge (yellow for pending)
  - Invoice number (truncated)

**Verify:**
```javascript
// Check console logs
console.log("🔄 Fetching orders for user:", user.id);
console.log("✅ Orders fetched:", data.length, "orders");
```

---

### Test 3: Toggle View Mode

**Steps:**
1. On `/orders` page
2. Click Grid icon (top right)
3. Verify grid view displayed
4. Click List icon
5. Verify table view displayed

**Expected Result:**
- ✅ Grid view shows OrderCard components
- ✅ Table view shows table layout
- ✅ Both views show same data
- ✅ Delete button visible in both views

---

### Test 4: Refresh Orders

**Steps:**
1. On `/orders` page
2. Click "Refresh" button
3. Wait for refresh to complete

**Expected Result:**
- ✅ Refresh button shows spinning icon
- ✅ Orders re-fetched from Sanity
- ✅ Toast notification: "X pesanan ditemukan"
- ✅ Orders list updated

**Verify:**
```javascript
// Check console logs
console.log("🔄 Fetching orders for user:", user.id);
console.log("✅ Orders fetched:", data.length, "orders");
```

---

### Test 5: Auto-refresh on Tab Visible

**Steps:**
1. On `/orders` page
2. Switch to another tab
3. Wait 5 seconds
4. Switch back to `/orders` tab

**Expected Result:**
- ✅ Orders automatically refreshed
- ✅ Console log: "👀 Page visible, refreshing orders..."
- ✅ Latest orders displayed

---

### Test 6: Delete Order

**Steps:**
1. On `/orders` page
2. Click X icon on any order
3. Confirm delete in dialog
4. Wait for deletion

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Order deleted from Sanity
- ✅ Order removed from list
- ✅ Toast notification: "Pesanan berhasil dihapus"

**Verify in Sanity Studio:**
```
1. Go to http://localhost:3000/studio
2. Navigate to Orders
3. Verify order no longer exists
```

---

### Test 7: Payment Flow (Pending → Paid)

**Steps:**
1. Create order (Test 1)
2. Go to Xendit payment page
3. Select payment method (e.g., Bank Transfer)
4. Complete payment (use test mode)
5. Wait for webhook
6. Go to `/orders`
7. Click "Refresh"

**Expected Result:**
- ✅ Order status updated to "paid"
- ✅ Status badge green
- ✅ xenditStatus = "PAID"
- ✅ Payment button hidden (only for pending)

**Verify in Sanity Studio:**
```
1. Go to http://localhost:3000/studio
2. Navigate to Orders
3. Find your order
4. Check:
   - status = "paid"
   - xenditStatus = "PAID"
   - paymentMethod exists
   - paymentChannel exists
```

---

### Test 8: Empty State

**Steps:**
1. Login with new user (no orders)
2. Navigate to `/orders`

**Expected Result:**
- ✅ Empty state displayed
- ✅ Package icon shown
- ✅ Message: "No Orders Yet"
- ✅ "Start Shopping" button
- ✅ Button links to home page

---

### Test 9: Loading State

**Steps:**
1. Navigate to `/orders`
2. Observe loading state (may be quick)

**Expected Result:**
- ✅ Loading spinner displayed
- ✅ Message: "Loading orders..."
- ✅ Centered on page

---

### Test 10: Grid View - OrderCard

**Steps:**
1. On `/orders` page
2. Switch to Grid view
3. Verify OrderCard display

**Expected Result:**
- ✅ Cards displayed in grid (1 col mobile, 2 col tablet, 3 col desktop)
- ✅ Each card shows:
  - Order number (truncated)
  - Order date (formatted)
  - Status badge
  - Product images
  - Product names & quantities
  - Prices per product
  - Shipping address
  - Total price
  - "Bayar Sekarang" button (if pending)
  - Delete button (top right)

---

### Test 11: Payment Button (Pending Orders)

**Steps:**
1. Create order (don't pay yet)
2. Go to `/orders`
3. Switch to Grid view
4. Find pending order
5. Click "Bayar Sekarang"

**Expected Result:**
- ✅ Opens Xendit payment page in new tab
- ✅ Payment URL correct
- ✅ Order details shown in Xendit

---

### Test 12: Responsive Design

**Steps:**
1. On `/orders` page
2. Resize browser to mobile size (< 768px)
3. Verify layout
4. Resize to tablet (768px - 1024px)
5. Verify layout
6. Resize to desktop (> 1024px)
7. Verify layout

**Expected Result:**
- ✅ Mobile: Grid view recommended, table scrollable
- ✅ Tablet: Grid 2 columns, table fits
- ✅ Desktop: Grid 3 columns, table full width
- ✅ All elements readable and accessible

---

### Test 13: Error Handling - Delete Failed

**Steps:**
1. On `/orders` page
2. Disconnect internet
3. Try to delete order
4. Reconnect internet

**Expected Result:**
- ✅ Toast error: "Terjadi kesalahan"
- ✅ Order not removed from list
- ✅ Console error logged

---

### Test 14: Error Handling - Fetch Failed

**Steps:**
1. Stop Sanity Studio
2. Navigate to `/orders`
3. Wait for error

**Expected Result:**
- ✅ Toast error: "Gagal memuat pesanan"
- ✅ Console error logged
- ✅ Loading state ends

---

### Test 15: Security - Other User's Orders

**Steps:**
1. Login as User A
2. Create order
3. Note order ID
4. Logout
5. Login as User B
6. Navigate to `/orders`
7. Try to access User A's order

**Expected Result:**
- ✅ User B cannot see User A's orders
- ✅ Query filtered by clerkUserId
- ✅ Only User B's orders shown

---

### Test 16: Security - Delete Other User's Order

**Steps:**
1. Login as User A
2. Create order
3. Note order ID
4. Logout
5. Login as User B
6. Try to delete User A's order via API

**Expected Result:**
- ✅ API returns 404 or 401
- ✅ Error: "Order not found or unauthorized"
- ✅ Order not deleted

**Test via Console:**
```javascript
fetch('/api/orders/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 'user_a_order_id' })
})
.then(r => r.json())
.then(console.log);
// Expected: { error: "Order not found or unauthorized" }
```

---

## 🔍 Debugging Tips

### Check Console Logs

**Orders Page:**
```javascript
// Fetch orders
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 3 orders

// Auto-refresh
👀 Page visible, refreshing orders...

// Delete order
✅ Order deleted: order_xxx
```

**Create Order:**
```javascript
// Checkout
📤 Creating invoice with Xendit API...
✅ Invoice created successfully
💾 Saving order data to Sanity...
✅ Order saved to Sanity successfully
```

### Check Sanity Studio

1. Go to `http://localhost:3000/studio`
2. Navigate to Orders
3. Verify order data:
   - All fields populated
   - References resolved
   - Status correct

### Check Xendit Dashboard

1. Go to Xendit dashboard (test mode)
2. Navigate to Invoices
3. Find your invoice
4. Check:
   - Status
   - Amount
   - Items
   - Webhook logs

---

## ✅ Test Checklist

Copy this checklist untuk tracking:

```
[ ] Test 1: Create Order from Cart
[ ] Test 2: View Orders Page
[ ] Test 3: Toggle View Mode
[ ] Test 4: Refresh Orders
[ ] Test 5: Auto-refresh on Tab Visible
[ ] Test 6: Delete Order
[ ] Test 7: Payment Flow (Pending → Paid)
[ ] Test 8: Empty State
[ ] Test 9: Loading State
[ ] Test 10: Grid View - OrderCard
[ ] Test 11: Payment Button (Pending Orders)
[ ] Test 12: Responsive Design
[ ] Test 13: Error Handling - Delete Failed
[ ] Test 14: Error Handling - Fetch Failed
[ ] Test 15: Security - Other User's Orders
[ ] Test 16: Security - Delete Other User's Order
```

---

## 🐛 Common Issues

### Issue: Orders tidak muncul
**Cause**: clerkUserId tidak match
**Fix**: 
```typescript
// Check query
console.log("User ID:", user.id);
// Verify di Sanity Studio bahwa clerkUserId sama
```

### Issue: Delete gagal
**Cause**: Order tidak ditemukan atau unauthorized
**Fix**:
```typescript
// Check API response
const response = await fetch('/api/orders/delete', {...});
const data = await response.json();
console.log(data); // Check error message
```

### Issue: Images tidak muncul
**Cause**: urlFor function error
**Fix**:
```typescript
// Check sanity/lib/image.ts
import { urlFor } from "@/sanity/lib/image";
// Verify product has images array
```

---

## 📊 Performance Testing

### Load Time
- **Target**: < 2 seconds untuk fetch orders
- **Test**: Use Chrome DevTools Network tab
- **Optimize**: Add pagination if > 50 orders

### Memory Usage
- **Target**: < 50MB for orders page
- **Test**: Use Chrome DevTools Memory profiler
- **Optimize**: Implement virtual scrolling for large lists

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Correct data displayed
- ✅ Proper error handling
- ✅ Security enforced
- ✅ Responsive design working
- ✅ Performance acceptable

---

**Last Updated**: December 2024
