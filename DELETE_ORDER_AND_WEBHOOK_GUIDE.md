# Delete Order & Webhook Status Update Guide

## ✅ Fixes Applied

### 1. Delete Order API
**File:** `app/api/ors/delete/route.ts`

**Changes:**
- ✅ Using `writeClient` instead of read-only `client`
- ✅ Enhanced logging for debugging
- ✅ Proper error handling

**How it works:**
1. Verify user authentication
2. Check order belongs to user
3. Delete order from Sanity
4. Return success response

### 2. Webhook Status Update
**File:** `app/api/webhook/callback/route.ts`

**Already implemented:**
- ✅ Verify callback token from Xendit
- ✅ Parse notification payload
- ✅ Update order status in Sanity
- ✅ Reduce stock when payment successful
- ✅ Comprehensive logging

## 🧪 Testing Delete Order

### Test in UI:

1. **Go to Orders Page:**
   ```
   http://localhost:3000/orders
   ```

2. **Find an Order:**
   - Look for any order in the list
   - Click the **X** (delete) button

3. **Confirm Delete:**
   - Confirm deletion in the popup
   - Order should disappear from list

4. **Check Console:**
   ```
   🗑️ Deleting order: order-id-xxx for user: user_xxx
   ✅ Order found, deleting...
   ✅ Order deleted successfully: order-id-xxx
   ```

### Test with API:

```bash
curl -X DELETE http://localhost:3000/api/orders/delete \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{"orderId": "order-id-here"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

## 🔔 Testing Webhook Status Update

### Prerequisites:

1. **Ngrok Running:**
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

2. **Environment Variables:**
   ```env
   XENDIT_CALLBACK_TOKEN=your_callback_token_here
   NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
   ```

3. **Xendit Dashboard Setup:**
   - Login: https://dashboard.xendit.co/
   - Settings → Webhooks
   - Add webhook URL: `https://abc123.ngrok-free.app/api/webhook/callback`
   - Copy callback token to `.env`

### Test Flow:

#### Step 1: Create Order
1. Add products to cart
2. Checkout
3. Note the order number (e.g., `order_xxx-xxx-xxx`)

#### Step 2: Check Initial Status
- Go to `/orders` page
- Order status should be: **Pending** (yellow badge)

#### Step 3: Make Payment
1. Click **Bayar** (💳) button
2. Redirect to Xendit payment page
3. Choose payment method
4. Complete payment (use test payment if in development)

#### Step 4: Webhook Triggered
**Server Console should show:**
```
📨 Xendit Webhook: Incoming notification
📦 Order Number: order_xxx-xxx-xxx
💳 Xendit Status: PAID
📊 Mapped Order Status: paid
✅ Order found in Sanity
💾 Updating order in Sanity...
✅ Order updated successfully in Sanity
💰 Payment successful, reducing stock...
✅ Stock reduced successfully for order: order_xxx-xxx-xxx
✅ Webhook processed successfully
```

#### Step 5: Verify Status Update
1. Refresh `/orders` page
2. Order status should change to: **Paid** (green badge)
3. Check Sanity Studio:
   - Order status = "paid"
   - xenditStatus = "PAID"
   - xenditTransactionId = "xxx"

### Manual Webhook Test:

```bash
curl -X POST http://localhost:3000/api/webhook/callback \
  -H "Content-Type: application/json" \
  -H "x-callback-token: YOUR_CALLBACK_TOKEN" \
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

## 🐛 Troubleshooting

### Problem 1: Delete Order Failed

**Symptoms:**
```
❌ Error deleting order: Insufficient permissions
```

**Solution:**
- Check `SANITY_WRITE_READ_TOKEN` in `.env`
- Restart dev server
- Verify token has delete permission

### Problem 2: Webhook Not Received

**Check:**
1. **Ngrok still running?**
   ```bash
   # Check ngrok terminal
   # Should show: Forwarding https://xxx.ngrok-free.app -> http://localhost:3000
   ```

2. **Webhook URL correct?**
   - Xendit Dashboard → Settings → Webhooks
   - URL should be: `https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/callback`

3. **Callback token correct?**
   - Check `.env`: `XENDIT_CALLBACK_TOKEN=xxx`
   - Should match token in Xendit Dashboard

4. **Dev server running?**
   ```bash
   npm run dev
   ```

**Solution:**
```bash
# 1. Restart ngrok
ngrok http 3000

# 2. Copy new URL
# 3. Update webhook URL in Xendit Dashboard
# 4. Update NEXT_PUBLIC_SITE_URL in .env
# 5. Restart dev server
npm run dev
```

### Problem 3: Status Not Updated

**Check Server Console:**
```
❌ Error updating order in Sanity: Insufficient permissions
```

**Solution:**
- Using `SANITY_WRITE_READ_TOKEN` (already fixed)
- Restart dev server

**Check Webhook Logs:**
```
⚠️ Order not found in database
```

**Solution:**
- Order might not be saved in Sanity
- Check order creation logs
- Verify orderNumber matches

### Problem 4: Stock Not Reduced

**Check Console:**
```
❌ Failed to reduce stock: Product not found
```

**Solution:**
- Check `reduceStock` function in `sanity/actions`
- Verify products exist in Sanity
- Check product IDs in order

## 📊 Status Mapping

### Xendit Status → Order Status

| Xendit Status | Order Status | Badge Color |
|--------------|--------------|-------------|
| PENDING      | pending      | Yellow      |
| PAID         | paid         | Green       |
| EXPIRED      | cancelled    | Red         |
| FAILED       | cancelled    | Red         |

## 🔐 Security Notes

### Delete Order:
- ✅ User authentication required
- ✅ Verify order belongs to user
- ✅ Cannot delete other user's orders

### Webhook:
- ✅ Callback token verification
- ✅ Invalid token = 401 Unauthorized
- ✅ Missing fields = 400 Bad Request

## 📝 Checklist

### Delete Order:
- [x] API route created
- [x] Using writeClient
- [x] User authentication
- [x] Authorization check
- [x] Error handling
- [x] Logging

### Webhook:
- [x] Callback route created
- [x] Token verification
- [x] Status mapping
- [x] Order update
- [x] Stock reduction
- [x] Error handling
- [x] Comprehensive logging

### Configuration:
- [ ] Ngrok running
- [ ] Webhook URL configured in Xendit
- [ ] XENDIT_CALLBACK_TOKEN in .env
- [ ] NEXT_PUBLIC_SITE_URL in .env
- [ ] SANITY_WRITE_READ_TOKEN in .env

### Testing:
- [ ] Delete order works
- [ ] Webhook receives notifications
- [ ] Status updates correctly
- [ ] Stock reduces on payment
- [ ] Logs show correct flow

## 🎯 Expected Flow

### Complete Order Flow:

```
1. Cart → Checkout
   ↓
2. Create Order (status: pending)
   ↓
3. Create Xendit Invoice
   ↓
4. Redirect to Success Page
   ↓
5. User clicks "Orders"
   ↓
6. User clicks "Bayar" (💳)
   ↓
7. Redirect to Xendit Payment
   ↓
8. User completes payment
   ↓
9. Xendit sends webhook
   ↓
10. Webhook updates order status → paid
    ↓
11. Stock reduced
    ↓
12. User sees "Paid" status in Orders page
```

### Delete Order Flow:

```
1. User goes to Orders page
   ↓
2. User clicks X (delete) button
   ↓
3. Confirm deletion
   ↓
4. API verifies user owns order
   ↓
5. Delete order from Sanity
   ↓
6. Order removed from UI
```

## 🚀 Production Deployment

### Vercel Environment Variables:

```env
SANITY_WRITE_READ_TOKEN=sk...
XENDIT_CALLBACK_TOKEN=xxx...
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Xendit Webhook URL (Production):

```
https://your-domain.vercel.app/api/webhook/callback
```

**Important:**
- Update webhook URL in Xendit Dashboard for production
- Use production callback token
- Test webhook in production environment

---

**Ready to test!** 
1. Try deleting an order
2. Try making a payment and watch status update automatically 🎉

