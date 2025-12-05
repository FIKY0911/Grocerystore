# Order Status Auto-Update

## 🎯 How It Works

Order status akan otomatis berubah dari **Pending** → **Paid** setelah pembayaran berhasil melalui 2 mekanisme:

### 1. Xendit Webhook (Server-side)
**File:** `app/api/webhook/callback/route.ts`

Ketika pembayaran berhasil:
```
User completes payment in Xendit
  ↓
Xendit sends webhook to server
  ↓
Server receives notification
  ↓
Server updates order status in Sanity
  ↓
Status: pending → paid
```

### 2. Auto-Refresh (Client-side)
**File:** `/orders/page.tsx`

User melihat perubahan status melalui:

#### A. Page Visibility
```typescript
// Refresh saat user kembali ke tab
document.addEventListener("visibilitychange", () => {
  if (visible) fetchOrders();
});
```

#### B. Polling (30 seconds)
```typescript
// Auto-refresh setiap 30 detik jika ada pending orders
if (pendingOrders.length > 0) {
  setInterval(() => {
    fetchOrders();
  }, 30000);
}
```

#### C. Manual Refresh
```typescript
// User klik tombol Refresh
<Button onClick={handleRefresh}>
  <RefreshCw /> Refresh
</Button>
```

## 📊 Status Flow

### Complete Flow:
```
1. User checkout
   Status: pending (yellow badge)
   ↓
2. User clicks "Bayar" button
   Redirect to Xendit
   ↓
3. User completes payment
   Xendit processes payment
   ↓
4. Xendit sends webhook
   Server updates status → paid
   ↓
5. Client auto-refreshes (max 30s)
   UI shows: paid (green badge)
```

## 🔄 Auto-Refresh Features

### 1. Smart Polling
- ✅ Only polls when there are pending orders
- ✅ Stops polling when no pending orders
- ✅ Interval: 30 seconds

### 2. Visual Indicators
- ✅ Pending orders alert with count
- ✅ Auto-refresh notification
- ✅ Refresh button with loading state

### 3. Console Logs
```
🔄 Auto-refresh enabled: 2 pending orders
⏰ Auto-refreshing orders (checking payment status)...
✅ Orders fetched: 3 orders
📦 Order 1: { orderNumber: "xxx", status: "paid" }
🛑 Auto-refresh disabled (no pending orders)
```

## 🧪 Testing

### Test Auto-Update:

1. **Create Order:**
   - Add products to cart
   - Checkout
   - Order created with status: **Pending**

2. **Check Orders Page:**
   - Go to `/orders`
   - See yellow badge: **Pending**
   - See alert: "Anda memiliki 1 pesanan yang menunggu pembayaran"

3. **Check Console:**
   ```
   🔄 Auto-refresh enabled: 1 pending orders
   ```

4. **Make Payment:**
   - Click "Bayar" button
   - Complete payment in Xendit
   - Xendit redirects back to app

5. **Wait for Auto-Refresh:**
   - Max 30 seconds
   - Console shows: `⏰ Auto-refreshing orders...`
   - Status changes to: **Paid** (green badge)

6. **Verify:**
   - ✅ Badge color changed: Yellow → Green
   - ✅ Alert disappeared (no pending orders)
   - ✅ Console shows: `🛑 Auto-refresh disabled`

### Test Manual Refresh:

1. **After Payment:**
   - Don't wait for auto-refresh
   - Click **Refresh** button

2. **Verify:**
   - ✅ Status updated immediately
   - ✅ Shows success toast

## 🐛 Troubleshooting

### Problem: Status tidak berubah setelah pembayaran

**Check 1: Webhook Working?**
```bash
# Check server console for webhook logs
📨 Xendit Webhook: Incoming notification
💳 Xendit Status: PAID
✅ Order updated successfully in Sanity
```

**If no webhook logs:**
- Webhook URL not configured in Xendit
- Ngrok not running (for development)
- Callback token mismatch

**Solution:**
- Follow `NGROK_WEBHOOK_SETUP.md`
- Configure webhook in Xendit Dashboard
- Verify callback token

**Check 2: Auto-Refresh Working?**
```bash
# Check browser console
🔄 Auto-refresh enabled: 1 pending orders
⏰ Auto-refreshing orders (checking payment status)...
```

**If no auto-refresh logs:**
- Page not detecting pending orders
- JavaScript error

**Solution:**
- Check browser console for errors
- Refresh page manually
- Click Refresh button

**Check 3: Order Status in Sanity?**
1. Open Sanity Studio: `http://localhost:3000/studio`
2. Go to Orders
3. Find your order
4. Check status field

**If status still "pending" in Sanity:**
- Webhook not received
- Webhook failed to update
- Check server logs

### Problem: Auto-refresh terlalu sering

**Current:** 30 seconds interval

**To change:**
```typescript
// In app/(client)/orders/page.tsx
const interval = setInterval(() => {
  fetchOrders();
}, 60000); // Change to 60 seconds (1 minute)
```

### Problem: Auto-refresh tidak berhenti

**Check:**
- Are there still pending orders?
- Auto-refresh only stops when no pending orders

**Solution:**
- Wait for all orders to be paid/cancelled
- Or close the page

## ⚙️ Configuration

### Polling Interval
**File:** `app/(client)/orders/page.tsx`

```typescript
// Current: 30 seconds
const interval = setInterval(() => {
  fetchOrders();
}, 30000);

// Options:
// 15 seconds: 15000
// 30 seconds: 30000 (default)
// 60 seconds: 60000
// 2 minutes: 120000
```

### Disable Auto-Refresh
```typescript
// Comment out the polling useEffect
/*
useEffect(() => {
  // ... polling logic
}, [orders, user]);
*/
```

## 📊 Status Badges

### Visual Indicators:

**Pending (Yellow):**
```
🟡 Pending
- Menunggu pembayaran
- Auto-refresh active
- Show "Bayar" button
```

**Paid (Green):**
```
🟢 Paid
- Pembayaran berhasil
- Auto-refresh stopped
- Show "Pesan lagi" button
```

**Cancelled (Red):**
```
🔴 Cancelled
- Pembayaran dibatalkan/expired
- Auto-refresh stopped
- Show "Pesan lagi" button
```

## ✅ Success Criteria

Status update berhasil jika:
1. ✅ Webhook received by server
2. ✅ Order status updated in Sanity
3. ✅ Client auto-refreshes within 30s
4. ✅ UI shows green badge
5. ✅ Alert disappeared
6. ✅ Auto-refresh stopped

## 📝 Summary

### Automatic Updates:
- ✅ Webhook updates status in Sanity
- ✅ Auto-refresh every 30s (if pending orders)
- ✅ Refresh on page visibility
- ✅ Manual refresh button

### User Experience:
- ✅ Real-time status updates
- ✅ Visual feedback (badges, alerts)
- ✅ No need to manually refresh
- ✅ Max 30s delay to see status change

### Developer Experience:
- ✅ Console logs for debugging
- ✅ Smart polling (only when needed)
- ✅ Configurable interval
- ✅ Easy to disable

---

**Ready!** Status akan otomatis update setelah pembayaran berhasil. 🎉

