# Test Webhooktus Update ke "Paid"

## ✅ Webhook Sudah Dikonfigurasi

Webhook sudah ada dan berfungsi untuk update status otomatis dari Xendit.

### Status Mapping:
```typescript
Xendit Status → Order Status
PAID         → paid (✅ Lunas)
SETTLED      → paid (✅ Lunas)
EXPIRED      → cancelled (❌ Dibatalkan)
FAILED       → cancelled (❌ Dibatalkan)
PENDING      → pending (⏳ Menunggu)
```

## 🧪 Testing Webhook

### Prerequisites:

1. **Ngrok Running:**
   ```bash
   ngrok http 3000
   ```
   Copy HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

2. **Environment Variables (.env):**
   ```env
   XENDIT_CALLBACK_TOKEN=Ey4UWXkMt7XkEdy2oWTL9iIRUFGTbjkwX8KAdRE76o0HGrYU
   NEXT_PUBLIC_SITE_URL=http://localhost:3000/
   SANITY_WRITE_READ_TOKEN=sk...
   ```

3. **Xendit Dashboard:**
   - Login: https://dashboard.xendit.co/
   - Settings → Webhooks
   - Add webhook URL: `https://abc123.ngrok-free.app/api/webhook/callback`
   - Events: `invoice.paid`, `invoice.expired`, `invoice.failed`

### Test Flow:

#### Step 1: Create Order
1. Add products to cart
2. Checkout
3. Order created with status: **Menunggu** (pending)
4. Note order number: `order_xxx-xxx-xxx`

#### Step 2: Check Initial Status
**Orders Page:**
- Status badge: 🟡 **Menunggu**

**Sanity Studio:**
- Open: `http://localhost:3000/studio`
- Orders → Find your order
- Status: `pending`

#### Step 3: Make Payment
1. Click **Bayar** button
2. Redirect to Xendit payment page
3. Choose payment method
4. Complete payment (use test payment)

#### Step 4: Webhook Triggered
**Server Console (Terminal):**
```
📨 Xendit Webhook: Incoming notification
📦 Order Number: order_xxx-xxx-xxx
💳 Xendit Status: PAID
📊 Mapped Order Status: paid
✅ Order found in Sanity
💾 Updating order in Sanity...
✅ Order updated successfully in Sanity
📋 Updated fields: status, xenditStatus
💰 Payment successful, reducing stock...
✅ Stock reduced successfully for order: order_xxx-xxx-xxx
✅ Webhook processed successfully
```

#### Step 5: Verify Status Update
**Wait 3 seconds (auto-refresh):**

**Orders Page:**
- Status badge: 🟢 **Lunas** (paid)
- Alert hilang (no pending orders)

**Sanity Studio:**
- Refresh page
- Status: `paid`
- xenditStatus: `PAID`

## 🐛 Troubleshooting

### Problem: Status tidak berubah ke "paid"

**Check 1: Webhook Received?**
```bash
# Check server console
# Should show: 📨 Xendit Webhook: Incoming notification
```

**If NO webhook:**
- Ngrok not running?
- Webhook URL wrong in Xendit Dashboard?
- Callback token mismatch?

**Solution:**
```bash
# 1. Check ngrok
ngrok http 3000

# 2. Update webhook URL in Xendit Dashboard
https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/callback

# 3. Verify callback token in .env
XENDIT_CALLBACK_TOKEN=xxx
```

**Check 2: Webhook Failed?**
```bash
# Check server console for errors
❌ Error updating order in Sanity: ...
```

**If error:**
- Check `SANITY_WRITE_READ_TOKEN` in .env
- Restart dev server

**Check 3: Status in Sanity?**
1. Open Sanity Studio
2. Check order status field
3. If still "pending" → Webhook didn't update

**Solution:**
- Check webhook logs in Xendit Dashboard
- Check server console for errors
- Verify token permissions

### Problem: Webhook URL berubah

**Cause:** Ngrok restart, URL berubah

**Solution:**
1. Get new ngrok URL
2. Update webhook URL in Xendit Dashboard
3. Test again

## 🔍 Manual Webhook Test

Test webhook tanpa payment:

```bash
curl -X POST http://localhost:3000/api/webhook/callback \
  -H "Content-Type: application/json" \
  -H "x-callback-token: Ey4UWXkMt7XkEdy2oWTL9iIRUFGTbjkwX8KAdRE76o0HGrYU" \
  -d '{
    "id": "test_transaction_123",
    "external_id": "order_xxx-xxx-xxx",
    "status": "PAID",
    "amount": 20000,
    "paid_amount": 20000,
    "payment_channel": "BANK_TRANSFER",
    "payment_method": "BCA"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "orderNumber": "order_xxx-xxx-xxx",
    "orderStatus": "paid",
    "xenditStatus": "PAID",
    "transactionId": "test_transaction_123"
  }
}
```

**Then check:**
1. Orders page → Status should be "Lunas"
2. Sanity Studio → Status should be "paid"

## ✅ Success Criteria

Webhook berhasil jika:
1. ✅ Server receives webhook notification
2. ✅ Order status updated in Sanity: `pending` → `paid`
3. ✅ Stock reduced automatically
4. ✅ UI shows green badge "Lunas" (within 3 seconds)
5. ✅ No errors in console

## 📊 Webhook Flow Diagram

```
User completes payment in Xendit
  ↓
Xendit sends webhook to server
  POST /api/webhook/callback
  Headers: x-callback-token
  Body: { status: "PAID", external_id: "order_xxx" }
  ↓
Server verifies callback token
  ↓
Server maps status: PAID → paid
  ↓
Server updates order in Sanity
  UPDATE order SET status = 'paid'
  ↓
Server reduces stock
  ↓
Server returns 200 OK
  ↓
Client auto-refreshes (3 seconds)
  ↓
UI shows: 🟢 Lunas
```

## 📝 Checklist

- [ ] Ngrok running
- [ ] Webhook URL configured in Xendit
- [ ] Callback token in .env
- [ ] SANITY_WRITE_READ_TOKEN in .env
- [ ] Dev server running
- [ ] Create test order
- [ ] Make test payment
- [ ] Check server console for webhook logs
- [ ] Verify status changed to "paid" in Sanity
- [ ] Verify UI shows "Lunas" badge

## 🎯 Expected Result

**Before Payment:**
```
Status: 🟡 Menunggu (pending)
```

**After Payment (within 3 seconds):**
```
Status: 🟢 Lunas (paid)
```

---

**Ready to test!** Follow the steps above to verify webhook status update. 🎉

