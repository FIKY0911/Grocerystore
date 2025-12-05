# Fix Order Products - Missing Keys

## ❌ Problem

Sanity Studio menampilkan error:
```
⚠️ Miss keys
Some items in the list are missing their keys. This must be fixed in order to edit the list.
```

**Cause:** Products array di order tidak punya `_key` property yang required oleh Sanity untuk array items.

## ✅ Solution Applied

### 1. Update createCheckoutSession
**File:** `action/createCheckoutSession.ts`

**Added `_key` to each product:**
```typescript
const productsData = groupedItems.map((item) => ({
  _key: `product-${item.product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  _type: 'object',
  product: { _type: 'reference', _ref: item.product._id },
  quantity: item.quantity,
  priceAtPurchase: item.product.price,
}));
```

### 2. Enhanced Order Schema
**File:** `sanity/schemaTypes/orderType.ts`

**Added preview for better UX:**
```typescript
preview: {
  select: {
    productName: "product.name",
    quantity: "quantity",
    price: "priceAtPurchase",
  },
  prepare({ productName, quantity, price }) {
    return {
      title: productName || "Unknown Product",
      subtitle: `Qty: ${quantity} × Rp ${price?.toLocaleString("id-ID")} = Rp ${(quantity * price).toLocaleString("id-ID")}`,
    };
  },
}
```

**Now in Sanity Studio, products will show:**
```
✅ Product Name
   Qty: 2 × Rp 25.000 = Rp 50.000
```

### 3. Fix Script for Existing Orders
**File:** `scripts/fix-order-keys.ts`

Script to add `_key` to existing orders that don't have it.

## 🔧 How to Fix

### For New Orders:
✅ **Already fixed!** New orders will automatically have `_key` in products array.

### For Existing Orders:

**Run fix script:**
```bash
npm run fix-order-keys
```

**Expected Output:**
```
🔧 Fixing missing _key in order products...

📊 Found 5 orders

🔧 Fixing order order_xxx-xxx-xxx...
   ✅ Fixed 2 products
🔧 Fixing order order_yyy-yyy-yyy...
   ✅ Fixed 1 products
✅ Order order_zzz-zzz-zzz - already has keys

📊 Summary:
   ✅ Fixed: 2 orders
   ⏭️  Skipped: 3 orders
   📦 Total: 5 orders

✅ Done!
```

## 🧪 Testing

### Test New Orders:

1. **Create new order:**
   - Add products to cart
   - Checkout
   - Order created

2. **Check Sanity Studio:**
   - Open: `http://localhost:3000/studio`
   - Go to Orders
   - Open the new order
   - Click on Products field
   - ✅ Should NOT show "Missing keys" error
   - ✅ Should show product preview with name and price

### Test Existing Orders:

1. **Before fix:**
   - Open order in Sanity Studio
   - Products field shows: ⚠️ Missing keys

2. **Run fix script:**
   ```bash
   npm run fix-order-keys
   ```

3. **After fix:**
   - Refresh Sanity Studio
   - Open same order
   - ✅ No more "Missing keys" error
   - ✅ Can edit products array

## 📋 Files Modified

1. ✅ `action/createCheckoutSession.ts` - Add _key to products
2. ✅ `sanity/schemaTypes/orderType.ts` - Add preview
3. ✅ `scripts/fix-order-keys.ts` - Fix script
4. ✅ `package.json` - Add script command

## 🎯 What is `_key`?

**Purpose:**
- Sanity requires unique `_key` for each item in an array
- Used for tracking items during edits
- Prevents data loss when reordering/editing array items

**Format:**
```typescript
_key: "product-{productId}-{timestamp}-{randomString}"
```

**Example:**
```typescript
{
  _key: "product-abc123-1234567890-xyz789",
  _type: "object",
  product: { _type: "reference", _ref: "abc123" },
  quantity: 2,
  priceAtPurchase: 25000
}
```

## 🐛 Troubleshooting

### Problem: Fix script fails

**Error:**
```
❌ Error: SANITY_WRITE_READ_TOKEN is not set
```

**Solution:**
- Check `.env` file
- Ensure `SANITY_WRITE_READ_TOKEN` exists
- Restart terminal

### Problem: Still shows "Missing keys" after fix

**Solution:**
1. Refresh Sanity Studio (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Run fix script again
4. Check console for errors

### Problem: Can't edit products in Sanity Studio

**Check:**
1. Run `npm run check-orders` to verify data
2. Check if products have `_key`
3. Run fix script if needed

## ✅ Success Criteria

After fix:
- ✅ No "Missing keys" error in Sanity Studio
- ✅ Can edit products array in orders
- ✅ Products show preview with name and price
- ✅ New orders automatically have `_key`
- ✅ Existing orders fixed with script

## 📝 Summary

### Before Fix:
```typescript
// ❌ Missing _key
products: [
  {
    _type: "object",
    product: { _ref: "abc123" },
    quantity: 2,
    priceAtPurchase: 25000
  }
]
```

### After Fix:
```typescript
// ✅ Has _key
products: [
  {
    _key: "product-abc123-1234567890-xyz789",
    _type: "object",
    product: { _ref: "abc123" },
    quantity: 2,
    priceAtPurchase: 25000
  }
]
```

---

**Ready to fix!** 
1. New orders will automatically have `_key`
2. Run `npm run fix-order-keys` to fix existing orders
3. Refresh Sanity Studio to see changes 🎉

