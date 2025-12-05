# Redirect URL Configuration

## 🎯 Purpose
Configure redirect URLs untuk Xendit payment flow agar user kembali ke aplikasi setelah pembayaran.

## 📋 Current Configuration

### Environment Variables (.env)
```env
# For Development (localhost)
_PUBLIC_SITE_URL=http://localhost:3000/

# For Production (Vercel)
# NEXT_PUBLIC_SITE_URL=https://grocerystore-rpl-kel13.vercel.app/
```

### Redirect URLs Generated

**Success URL:**
```
http://localhost:3000/success?orderNumber=order_xxx-xxx-xxx
```

**Failure URL:**
```
http://localhost:3000/cart
```

## 🔧 How It Works

### 1. Create Checkout Session
**File:** `action/createCheckoutSession.ts`

```typescript
// Get base URL from environment
const redirectBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Remove trailing slash
const baseUrl = redirectBaseUrl.endsWith('/') 
  ? redirectBaseUrl.slice(0, -1) 
  : redirectBaseUrl;

// Generate redirect URLs
const successRedirectUrl = `${baseUrl}/success?orderNumber=${orderNumber}`;
const failureRedirectUrl = `${baseUrl}/cart`;
```

### 2. Xendit Invoice
Redirect URLs dikirim ke Xendit saat create invoice:

```typescript
const invoiceData = {
  // ...
  successRedirectUrl: "http://localhost:3000/success?orderNumber=xxx",
  failureRedirectUrl: "http://localhost:3000/cart",
  // ...
};
```

### 3. Payment Flow
```
User clicks "Bayar" 
  ↓
Redirect to Xendit Payment Page
  ↓
User completes payment
  ↓
Xendit redirects to:
  - Success: http://localhost:3000/success?orderNumber=xxx
  - Failure: http://localhost:3000/cart
```

## 🧪 Testing

### Test Success Flow:

1. **Create Order:**
   - Add products to cart
   - Checkout
   - Note order number

2. **Check Console Log:**
   ```
   🌐 Redirect URLs:
   📍 Base URL: http://localhost:3000
   ✅ Success redirect: http://localhost:3000/success?orderNumber=order_xxx
   ❌ Failure redirect: http://localhost:3000/cart
   ```

3. **Make Payment:**
   - Click "Bayar" button
   - Complete payment in Xendit
   - Should redirect to: `http://localhost:3000/success?orderNumber=xxx`

4. **Verify Success Page:**
   - Shows order number
   - Shows success message
   - Cart is cleared
   - Can click "Orders" to see order

### Test Failure Flow:

1. **Make Payment:**
   - Click "Bayar" button
   - Cancel payment or let it expire

2. **Verify Redirect:**
   - Should redirect to: `http://localhost:3000/cart`
   - Cart items still there
   - Can retry checkout

## 🔄 Environment-Specific Configuration

### Development (localhost)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000/
```

**Redirect URLs:**
- Success: `http://localhost:3000/success?orderNumber=xxx`
- Failure: `http://localhost:3000/cart`

### Production (Vercel)
```env
NEXT_PUBLIC_SITE_URL=https://grocerystore-rpl-kel13.vercel.app/
```

**Redirect URLs:**
- Success: `https://grocerystore-rpl-kel13.vercel.app/success?orderNumber=xxx`
- Failure: `https://grocerystore-rpl-kel13.vercel.app/cart`

## 🚨 Important Notes

### 1. Trailing Slash
Code automatically removes trailing slash:
```typescript
const baseUrl = redirectBaseUrl.endsWith('/') 
  ? redirectBaseUrl.slice(0, -1) 
  : redirectBaseUrl;
```

So both work:
- ✅ `http://localhost:3000/`
- ✅ `http://localhost:3000`

### 2. Development vs Production

**Development:**
- Use `http://localhost:3000/`
- No HTTPS required
- Xendit test mode

**Production:**
- Use `https://your-domain.vercel.app/`
- HTTPS required
- Xendit production mode

### 3. Restart Required

After changing `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 4. Vercel Deployment

Update environment variable in Vercel:
1. Vercel Dashboard → Project → Settings
2. Environment Variables
3. Update `NEXT_PUBLIC_SITE_URL`
4. Redeploy

## 🐛 Troubleshooting

### Problem: Redirect to wrong URL

**Check:**
1. `.env` file has correct `NEXT_PUBLIC_SITE_URL`
2. Server restarted after changing `.env`
3. Console log shows correct redirect URLs

**Solution:**
```bash
# 1. Check .env
cat .env | grep NEXT_PUBLIC_SITE_URL

# 2. Restart server
npm run dev

# 3. Check console log during checkout
# Should show: 📍 Base URL: http://localhost:3000
```

### Problem: Redirect to Vercel URL in development

**Cause:** `NEXT_PUBLIC_SITE_URL` still pointing to Vercel

**Solution:**
```env
# Change from:
NEXT_PUBLIC_SITE_URL=https://grocerystore-rpl-kel13.vercel.app/

# To:
NEXT_PUBLIC_SITE_URL=http://localhost:3000/
```

### Problem: Redirect to localhost in production

**Cause:** Vercel environment variable not updated

**Solution:**
1. Vercel Dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_SITE_URL` to production URL
3. Redeploy

## ✅ Verification Checklist

### Development:
- [ ] `.env` has `NEXT_PUBLIC_SITE_URL=http://localhost:3000/`
- [ ] Server restarted
- [ ] Console log shows correct URLs
- [ ] Payment redirects to localhost
- [ ] Success page loads correctly

### Production:
- [ ] Vercel env var has production URL
- [ ] Redeployed after env var change
- [ ] Payment redirects to production domain
- [ ] Success page loads correctly
- [ ] HTTPS working

## 📝 Summary

**Current Setup:**
- ✅ Development: `http://localhost:3000/`
- ✅ Success redirect: `/success?orderNumber=xxx`
- ✅ Failure redirect: `/cart`
- ✅ No new tab (same tab redirect)

**After Payment:**
- ✅ User stays in same tab
- ✅ Redirects back to your app
- ✅ Shows success page with order details

---

**Ready!** Setelah pembayaran, user akan redirect ke `http://localhost:3000/success` 🎉
