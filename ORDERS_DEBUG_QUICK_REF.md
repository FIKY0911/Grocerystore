# Orders Debug - Quick Reference

## 🔍 Quick Checks

### 1. Cart Page (Before Checkout)
**Browser Console:**
```javascript
//art items
🛒 Cart items: X  // Must be > 0
📦 Cart details: [...]  // Must have productId, productName, quantity, price
```

**✅ Good:** All fields populated, no undefined
**❌ Bad:** Cart items = 0, productId = undefined

---

### 2. Checkout (Server Console)
**Terminal:**
```javascript
🛒 Cart products to save: { count: X, products: [...] }
📦 Order data to save: { productsCount: X, ... }
✅ Order saved to Sanity successfully
🛒 Products saved: X  // Must match cart items count
```

**✅ Good:** Products saved > 0
**❌ Bad:** Products saved = 0, Error messages

---

### 3. Orders Page (After Checkout)
**Browser Console:**
```javascript
✅ Orders fetched: X orders
📦 Order 1: {
  productsCount: X,  // Must be > 0
  products: X,       // Must match productsCount
  productDetails: [...]  // Must have name, quantity, price
}
```

**✅ Good:** productsCount > 0, productDetails populated
**❌ Bad:** productsCount = 0, productDetails = []

---

### 4. Sanity Studio
**Check:** `http://localhost:3000/studio` → Orders → Select order

**✅ Good:**
- Products array has items
- Each item has: product (reference), quantity, priceAtPurchase
- Can click product reference to see details

**❌ Bad:**
- Products array is empty
- Product reference is broken/null

---

## 🚨 Common Issues & Quick Fixes

### Issue: Cart items = 0
```bash
# Check localStorage
localStorage.getItem('cart-store')

# Clear and re-add products
localStorage.clear()
# Refresh page, add products again
```

### Issue: Products saved = 0
```bash
# Check .env file
NEXT_PUBLIC_SANITY_WRITE_TOKEN=xxx  # Must exist

# Restart dev server
# Ctrl+C, then npm run dev
```

### Issue: productsCount = 0 in Orders
```bash
# Run debug script
npm run check-orders

# Check Sanity Studio
# Open order → Check products field
```

### Issue: Products not showing in UI
```typescript
// Check OrdersView.tsx
order.products?.map((item) => {
  console.log('Product:', item.product?.name);  // Should not be undefined
})
```

---

## 📊 Debug Script

```bash
npm run check-orders
```

**Good Output:**
```
Products Count (schema): 2
Products Array Length: 2
Product Populated: Yes
```

**Bad Output:**
```
Products Count (schema): 0
⚠️  NO PRODUCTS FOUND!
```

---

## 🔧 Files Modified

1. `action/createCheckoutSession.ts` - Validasi & logging
2. `app/(client)/cart/page.tsx` - Cart logging
3. `sanity/queries/query.ts` - Improved query
4. `app/(client)/orders/page.tsx` - Orders logging
5. `scripts/check-orders.ts` - Debug script

---

## 📞 Need Help?

**Check these in order:**
1. Browser console (cart page)
2. Server console (terminal)
3. Browser console (orders page)
4. Sanity Studio
5. Run `npm run check-orders`

**Share:**
- Console logs (screenshot)
- Error messages
- Sanity Studio screenshot
- Debug script output

