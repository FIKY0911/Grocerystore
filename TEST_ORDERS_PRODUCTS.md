# Test Orders Products - Quick Guide

## 🎯 Tujuan
Memastikan produart muncul di halaman `/orders` setelah checkout.

## ✅ Fixes Applied
1. ✅ Sanity permission fixed (using SANITY_WRITE_READ_TOKEN)
2. ✅ Enhanced logging di orders page
3. ✅ Better error handling di OrdersView
4. ✅ Debug script tersedia

## 🧪 Testing Steps

### Step 1: Check Existing Orders in Sanity

```bash
npm run check-orders
```

**Expected Output:**
```
📊 Total orders found: X

📦 Order 1:
   Order Number: order_xxx
   Customer: Your Name
   Status: pending
   Total: Rp 20.000
   Products Count (schema): 1
   Products Array Length: 1
   Products:
     1. Product Name (1x) - Rp 20.000
        Product Ref: abc123...
        Product Populated: ✅ Yes
        Product ID: abc123...
        Product Price: Rp 20.000
```

**❌ Bad Output:**
```
📦 Order 1:
   ...
   Products Count (schema): 0
   Products Array Length: 0
   ⚠️  NO PRODUCTS FOUND!
```

### Step 2: Test Orders Page

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Go to: `http://localhost:3000/orders`
   - Open Console (F12)

3. **Check Console Logs:**

**✅ Good Output:**
```
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 1 orders

📦 Order 1: {
  orderNumber: "order_xxx",
  productsCount: 1,
  productsArrayLength: 1
}
   Products:
   1. {
     productName: "Product Name",
     quantity: 1,
     priceAtPurchase: 20000,
     productId: "abc123...",
     slug: "product-slug"
   }
```

**❌ Bad Output:**
```
📦 Order 1: {
  orderNumber: "order_xxx",
  productsCount: 0,
  productsArrayLength: 0
}
   ⚠️ NO PRODUCTS IN THIS ORDER!
```

### Step 3: Visual Check

**✅ Harus Terlihat:**
- Order row dengan order number
- **Kolom "Nama Barang"** menampilkan:
  - • Product Name (1x)
  - Link ke product detail
- Total harga
- Status badge
- Shipper name
- Address

**❌ Jika Terlihat:**
- "⚠️ No products" di kolom Nama Barang
- Empty/kosong di kolom Nama Barang

### Step 4: Test New Checkout

1. **Add products ke cart** (minimal 1 produk)
2. **Open Console** (F12) sebelum checkout
3. **Checkout**

**Check Server Console:**
```
🛒 Cart products to save: { count: 1, products: [...] }
📦 Order data to save: { productsCount: 1, ... }
✅ Order saved to Sanity successfully
🛒 Products saved: 1
```

4. **Redirect ke `/orders`**
5. **Check Console** di browser
6. **Verify** products muncul

## 🐛 Troubleshooting

### Problem 1: "NO PRODUCTS FOUND" di check-orders script

**Cause:** Products tidak tersimpan saat checkout

**Solution:**
1. Check server console saat checkout
2. Pastikan muncul: `✅ Order saved to Sanity successfully`
3. Pastikan muncul: `🛒 Products saved: X` (X > 0)
4. Jika tidak, check error di server console

### Problem 2: "Product Populated: ❌ No"

**Cause:** Product reference broken atau product sudah di-delete

**Solution:**
1. Check product masih exist di Sanity Studio
2. Buka: `http://localhost:3000/studio`
3. Check Products → Cari product dengan ID yang di-reference
4. Jika tidak ada, product sudah di-delete

### Problem 3: "⚠️ No products" di UI tapi console log menunjukkan ada products

**Cause:** Rendering issue atau type mismatch

**Solution:**
1. Check console log untuk structure data
2. Verify `order.products` is array
3. Verify `item.product` is object with `name` field
4. Check for typos in field names

### Problem 4: Products tidak muncul di NEW order

**Cause:** Checkout tidak save products dengan benar

**Check Server Console saat Checkout:**
```
🛒 Cart products to save: { count: 0, ... }  ❌ BAD
🛒 Cart products to save: { count: 1, ... }  ✅ GOOD
```

**Solution:**
1. Check cart items sebelum checkout
2. Pastikan cart tidak kosong
3. Check browser console untuk cart details
4. Verify product._id exists

## 📊 Debug Commands

### 1. Check Orders in Sanity
```bash
npm run check-orders
```

### 2. Check Specific Order
Open Sanity Studio:
```
http://localhost:3000/studio
```
- Click "Order"
- Find your order
- Check "Products" field

### 3. Check Products in Sanity
```
http://localhost:3000/studio
```
- Click "Product"
- Verify products exist
- Check product IDs

## ✅ Success Criteria

Testing berhasil jika:
1. ✅ `npm run check-orders` menunjukkan products populated
2. ✅ Console log di `/orders` menunjukkan products data
3. ✅ UI menampilkan product names dengan benar
4. ✅ Links ke product detail berfungsi
5. ✅ New checkout save products dengan benar

## 🎯 Expected Results

### In Sanity (check-orders script):
```
Products Count (schema): 1
Products Array Length: 1
Product Populated: ✅ Yes
```

### In Browser Console (/orders page):
```
productsCount: 1
productsArrayLength: 1
productName: "Product Name"
```

### In UI (/orders page):
```
Nama Barang
• Product Name (1x)
```

---

**Ready to test!** Run `npm run check-orders` first, then check `/orders` page. 🚀

