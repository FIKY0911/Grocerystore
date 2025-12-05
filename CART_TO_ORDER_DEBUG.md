# 🐛 Cart to Order Debug Guide

Panduan untuk debug flow dari Cart ke Order di Sanity.

---

## 🔍 Checklist Debug

### 1. Check Cart Data
```javascript
// Di browser console saat di /cart
const store = JSON.parse(localStorage.getItem('cart-store'));
console.log('🛒 Cart items:', store.state.items);
console.log('📦 Grouped items:', store.state.items.length);
```

**Expected:**
```json
{
  "items": [
    {
      "product": {
        "_id": "product_123",
        "name": "Apel Fuji",
        "price": 15000,
        ...
      },
      "quantity": 2
    }
  ]
}
```

---

### 2. Check Checkout Process

**Console logs saat klik "Buat Invoice Pembayaran":**

```
🛒 Cart items: 2
📦 Creating order: order_xxx-xxx-xxx
📤 Creating invoice with Xendit API...
✅ Invoice crea successfully
💾 Saving order data to Sanity...
🛒 Cart products to save: { count: 2, products: [...] }
📦 Order data: { orderNumber, productsCount, totalPrice, clerkUserId }
✅ Order saved to Sanity successfully
📝 Saved order ID: order_abc123
🛒 Products saved: 2
✅ Order created: order_xxx-xxx-xxx
💳 Payment URL: https://checkout.xendit.co/...
```

---

### 3. Check Sanity Studio

**Steps:**
1. Go to `http://localhost:3000/studio`
2. Navigate to **Orders** (sidebar)
3. Find your order by orderNumber
4. Verify fields:

```
✅ orderNumber: order_xxx-xxx-xxx
✅ clerkUserId: user_xxx
✅ customerName: John Doe
✅ email: john@example.com
✅ products: [
     {
       product: { _ref: "product_123" },
       quantity: 2,
       priceAtPurchase: 15000
     }
   ]
✅ totalPrice: 30000
✅ status: pending
✅ orderDate: 2024-12-05T...
✅ xenditTransactionId: inv_xxx
✅ paymentUrl: https://checkout.xendit.co/...
✅ address: { _ref: "address_123" }
✅ shipper: { _ref: "shipper_jne" }
```

---

### 4. Check Orders Page

**After creating order:**
1. Go to `/orders`
2. Check console logs:

```
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 1 orders
```

3. Verify order displayed in table/grid
4. Check order details match Sanity data

---

## 🚨 Common Issues

### Issue 1: Order tidak muncul di Sanity

**Symptoms:**
- Console log: "⚠️ Failed to save order to Sanity"
- Order tidak ada di Sanity Studio

**Debug:**
```javascript
// Check environment variable
console.log('SANITY_WRITE_TOKEN:', process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN ? 'EXISTS' : 'MISSING');
```

**Solutions:**
1. Check `.env` file:
   ```
   NEXT_PUBLIC_SANITY_WRITE_TOKEN=your_token_here
   ```
2. Restart dev server: `npm run dev`
3. Verify token di Sanity dashboard: https://sanity.io/manage

---

### Issue 2: Products array kosong di Sanity

**Symptoms:**
- Order created tapi `products: []`
- Console log: "🛒 Products saved: 0"

**Debug:**
```javascript
// Di cart page, sebelum checkout
console.log('Cart items:', groupedItems);
console.log('Products:', groupedItems.map(item => ({
  id: item.product._id,
  name: item.product.name,
  quantity: item.quantity,
  price: item.product.price
})));
```

**Solutions:**
1. Verify cart not empty
2. Check product._id exists
3. Check product.price exists
4. Verify groupedItems passed to createCheckoutSession

---

### Issue 3: Order muncul tapi products tidak ter-resolve

**Symptoms:**
- Order ada di Sanity
- Products array ada tapi product details null di /orders

**Debug in Sanity Vision:**
```groq
*[_type == 'order' && orderNumber == 'order_xxx'][0] {
  ...,
  products[] {
    quantity,
    priceAtPurchase,
    product-> {
      _id,
      name,
      images,
      price
    }
  }
}
```

**Solutions:**
1. Check product references valid
2. Verify products not deleted
3. Check MY_ORDERS_QUERY includes product->

---

### Issue 4: clerkUserId tidak match

**Symptoms:**
- Order created tapi tidak muncul di /orders
- Console: "✅ Orders fetched: 0 orders"

**Debug:**
```javascript
// Di orders page
console.log('Current user ID:', user.id);

// Di Sanity Vision
*[_type == 'order'] {
  orderNumber,
  clerkUserId
}
```

**Solutions:**
1. Verify user logged in
2. Check clerkUserId di order match dengan user.id
3. Re-create order dengan user yang benar

---

### Issue 5: Redirect ke /orders bukan Xendit

**Symptoms:**
- After checkout, redirect ke /orders
- Payment tidak dilakukan

**Debug:**
```javascript
// Check cart page handleCheckout
console.log('Payment URL:', paymentUrl);
// Should redirect to: window.location.href = paymentUrl
```

**Solutions:**
1. Check cart/page.tsx line ~153
2. Should be: `window.location.href = paymentUrl;`
3. NOT: `router.push('/orders');`

---

## 🧪 Manual Testing Steps

### Test 1: Complete Flow

```bash
1. Clear cart: localStorage.removeItem('cart-store')
2. Add 2 products to cart
3. Go to /cart
4. Select address
5. Select shipper
6. Click "Buat Invoice Pembayaran"
7. Check console logs (should see all ✅)
8. Should redirect to Xendit
9. Go to Sanity Studio → Orders
10. Verify order exists with products
11. Go to /orders
12. Verify order displayed
```

### Test 2: Verify Products Data

```bash
1. Create order with 3 different products
2. Go to Sanity Studio → Orders
3. Click on order
4. Expand products array
5. Verify each product has:
   - product reference
   - quantity
   - priceAtPurchase
6. Click on product reference
7. Should open product document
```

### Test 3: Verify Orders Page Display

```bash
1. Create order
2. Go to /orders
3. Switch to Grid view
4. Verify OrderCard shows:
   - Product images
   - Product names
   - Quantities
   - Prices
5. Switch to Table view
6. Verify all columns populated
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CART TO ORDER DATA FLOW                   │
└─────────────────────────────────────────────────────────────┘

1. CART (Zustand Store)
   ↓
   items: [
     {
       product: { _id, name, price, ... },
       quantity: 2
     }
   ]

2. CHECKOUT (cart/page.tsx)
   ↓
   groupedItems = store.getGroupedItems()
   metadata = { orderNumber, customerName, email, clerkUserId, address, shipperId }
   ↓
   createCheckoutSession(groupedItems, metadata)

3. CREATE ORDER (action/createCheckoutSession.ts)
   ↓
   productsData = groupedItems.map(item => ({
     _type: 'object',
     product: { _type: 'reference', _ref: item.product._id },
     quantity: item.quantity,
     priceAtPurchase: item.product.price
   }))
   ↓
   orderData = {
     _type: 'order',
     orderNumber,
     clerkUserId,
     products: productsData,  ← CART DATA HERE
     totalPrice,
     status: 'pending',
     ...
   }
   ↓
   writeClient.create(orderData)

4. SANITY DATABASE
   ↓
   Order document created with products array

5. ORDERS PAGE (app/(client)/orders/page.tsx)
   ↓
   MY_ORDERS_QUERY fetches orders with products->
   ↓
   Display in table/grid with product details
```

---

## 🔧 Quick Fixes

### Fix 1: Enable detailed logging

Add to `.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

### Fix 2: Test Sanity write

Create test file `test-sanity-write.ts`:
```typescript
import { writeClient } from '@/sanity/lib/writeClient';

async function testWrite() {
  try {
    const result = await writeClient.create({
      _type: 'order',
      orderNumber: 'test_' + Date.now(),
      clerkUserId: 'test_user',
      customerName: 'Test User',
      email: 'test@example.com',
      products: [],
      totalPrice: 10000,
      currency: 'IDR',
      status: 'pending',
      orderDate: new Date().toISOString(),
      xenditTransactionId: 'test_inv',
      xenditStatus: 'PENDING',
      paymentUrl: 'https://test.com',
    });
    console.log('✅ Test write successful:', result._id);
  } catch (error) {
    console.error('❌ Test write failed:', error);
  }
}

testWrite();
```

Run: `npx tsx test-sanity-write.ts`

### Fix 3: Clear and re-test

```bash
# Clear browser storage
localStorage.clear();

# Clear Sanity cache
rm -rf .next

# Restart dev server
npm run dev
```

---

## ✅ Success Indicators

When everything works correctly, you should see:

1. **Console logs:**
   - ✅ All green checkmarks
   - 🛒 Cart products count matches
   - 📦 Order saved with correct product count
   - 💳 Payment URL generated

2. **Sanity Studio:**
   - ✅ Order document exists
   - ✅ Products array populated
   - ✅ All references valid

3. **Orders Page:**
   - ✅ Order displayed
   - ✅ Product images shown
   - ✅ Product names correct
   - ✅ Quantities match
   - ✅ Prices correct

---

**Last Updated**: December 2024

