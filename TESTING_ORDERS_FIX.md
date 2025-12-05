# Testing Guide - Orders Products Fix

## 🎯 Tujuan Testing
Memastikan products dari cart muncul dengan benar di halaman orders setelah 

## ✅ Fixes yang Sudah Diterapkan

### 1. Validasi Products Data
- ✅ Validasi `productsData` tidak kosong
- ✅ Validasi setiap product memiliki `_id` yang valid
- ✅ Error handling yang lebih baik

### 2. Enhanced Logging
- ✅ Log cart details sebelum checkout
- ✅ Log products data yang disimpan ke Sanity
- ✅ Log products yang di-fetch dari Sanity

### 3. Improved Query
- ✅ Menambahkan `productsCount` untuk debug
- ✅ Populate products dengan field lengkap
- ✅ Memastikan reference ter-resolve

## 🚀 Cara Testing

### Step 1: Start Development Server

```bash
npm run dev
```

Tunggu sampai server running di `http://localhost:3000`

### Step 2: Login & Add Products to Cart

1. Buka browser: `http://localhost:3000`
2. Login dengan akun Clerk
3. Browse products dan tambahkan **minimal 2 produk** ke cart
4. Pastikan cart icon menunjukkan jumlah items

### Step 3: Checkout

1. Buka cart page: `http://localhost:3000/cart`
2. **PENTING**: Buka **Browser Console** (F12 → Console tab)
3. Pilih alamat pengiriman
4. Pilih jasa pengiriman
5. Klik tombol **"Buat Invoice Pembayaran"**

### Step 4: Check Console Logs

#### A. Browser Console (Cart Page)
Seharusnya muncul logs seperti ini:

```
🛒 Cart items: 2
📦 Cart details: [
  {
    productId: "abc123...",
    productName: "Apel Fuji",
    quantity: 2,
    price: 25000
  },
  {
    productId: "def456...",
    productName: "Jeruk Mandarin",
    quantity: 1,
    price: 30000
  }
]
📦 Creating order: order_xxx-xxx-xxx
```

**✅ Check:**
- `Cart items` > 0
- Setiap item punya `productId`, `productName`, `quantity`, `price`
- Tidak ada `undefined` atau `null`

#### B. Server Console (Terminal)
Seharusnya muncul logs seperti ini:

```
🛒 Cart products to save: {
  count: 2,
  products: [
    { productId: "abc123...", quantity: 2, price: 25000 },
    { productId: "def456...", quantity: 1, price: 30000 }
  ]
}

📦 Order data to save: {
  orderNumber: "order_xxx-xxx-xxx",
  productsCount: 2,
  products: [...],
  totalPrice: 80000
}

✅ Order saved to Sanity successfully
📝 Saved order ID: order-id-xxx
🛒 Products saved: 2
```

**✅ Check:**
- `count: 2` (sesuai jumlah items di cart)
- `productsCount: 2`
- `Products saved: 2`
- Tidak ada error

### Step 5: Verify Orders Page

1. Setelah checkout berhasil, akan redirect ke `/orders`
2. **PENTING**: Buka **Browser Console** (F12 → Console tab)
3. Lihat order yang baru dibuat

#### Browser Console (Orders Page)
Seharusnya muncul logs seperti ini:

```
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 3 orders

📦 Order 1: {
  orderNumber: "order_xxx-xxx-xxx",
  productsCount: 2,
  products: 2,
  productDetails: [
    { name: "Apel Fuji", quantity: 2, price: 25000 },
    { name: "Jeruk Mandarin", quantity: 1, price: 30000 }
  ]
}
```

**✅ Check:**
- `productsCount: 2` (sesuai dengan yang disimpan)
- `products: 2` (array length)
- `productDetails` menampilkan nama, quantity, price
- Tidak ada `undefined` atau `null`

#### Visual Check di Orders Page
**✅ Harus terlihat:**
- Order card/row dengan order number
- **Kolom "Nama Barang"** menampilkan:
  - • Apel Fuji (2x)
  - • Jeruk Mandarin (1x)
- Total harga: Rp 80.000
- Status: Pending (badge kuning)
- Tombol "Bayar" (💳)

### Step 6: Verify di Sanity Studio

1. Buka Sanity Studio: `http://localhost:3000/studio`
2. Login jika diminta
3. Pilih **"Order"** dari sidebar
4. Cari order dengan order number yang baru dibuat
5. Klik untuk membuka detail

**✅ Check di Sanity:**
- Field **Products** harus ada array dengan 2 items
- Setiap item harus punya:
  - `product` → Reference ke product (klik untuk lihat detail)
  - `quantity` → 2 atau 1
  - `priceAtPurchase` → 25000 atau 30000

## 🐛 Troubleshooting

### Problem 1: Cart items = 0

**Symptom:**
```
🛒 Cart items: 0
```

**Solution:**
- Pastikan sudah add products ke cart
- Refresh page dan check cart icon
- Check localStorage: `cart-store`

### Problem 2: productId = undefined

**Symptom:**
```
📦 Cart details: [
  { productId: undefined, productName: "...", ... }
]
```

**Solution:**
- Product di Sanity mungkin corrupt
- Check product di Sanity Studio
- Hapus product dari cart dan add ulang

### Problem 3: Products saved: 0

**Symptom:**
```
✅ Order saved to Sanity successfully
🛒 Products saved: 0
```

**Solution:**
- Check error di server console
- Pastikan `NEXT_PUBLIC_SANITY_WRITE_TOKEN` ada di `.env`
- Check Sanity permissions

### Problem 4: productsCount = 0 di Orders Page

**Symptom:**
```
📦 Order 1: {
  productsCount: 0,
  products: 0,
  productDetails: []
}
```

**Possible Causes:**
1. Products tidak tersimpan ke Sanity (check Step 4B)
2. Query tidak populate dengan benar
3. Product references invalid

**Solution:**
1. Check server console saat checkout
2. Verify di Sanity Studio (Step 6)
3. Run check script:
   ```bash
   npm run check-orders
   ```

### Problem 5: Products tidak muncul di UI

**Symptom:**
- Console log menunjukkan products ada
- Tapi UI tidak menampilkan products

**Solution:**
- Check `OrdersView.tsx` component
- Pastikan mapping `order.products` benar
- Check conditional rendering

## 🔍 Debug Script

Jika masih ada masalah, jalankan debug script:

```bash
npm run check-orders
```

**Expected Output:**
```
🔍 Checking orders in Sanity...

📊 Total orders found: 3

📦 Order 1:
   Order Number: order_xxx-xxx-xxx
   Customer: John Doe
   Status: pending
   Total: Rp 80.000
   Products Count (schema): 2
   Products Array Length: 2
   Products:
     1. Apel Fuji (2x) - Rp 25.000
        Product Ref: abc123...
        Product Populated: Yes
     2. Jeruk Mandarin (1x) - Rp 30.000
        Product Ref: def456...
        Product Populated: Yes
```

**❌ Bad Output:**
```
📦 Order 1:
   ...
   Products Count (schema): 0
   Products Array Length: 0
   ⚠️  NO PRODUCTS FOUND!
```

Jika output seperti ini, berarti products tidak tersimpan ke Sanity.

## ✅ Success Criteria

Testing dianggap **BERHASIL** jika:

1. ✅ Console logs menunjukkan cart items > 0
2. ✅ Console logs menunjukkan products saved > 0
3. ✅ Console logs di orders page menunjukkan productsCount > 0
4. ✅ UI orders page menampilkan products dengan benar
5. ✅ Sanity Studio menunjukkan products array terisi
6. ✅ Debug script menunjukkan "Product Populated: Yes"

## 📝 Checklist Testing

- [ ] Start dev server
- [ ] Login ke aplikasi
- [ ] Add 2+ products ke cart
- [ ] Buka browser console
- [ ] Checkout dan monitor logs
- [ ] Check server console logs
- [ ] Verify di orders page
- [ ] Check browser console di orders page
- [ ] Verify di Sanity Studio
- [ ] (Optional) Run debug script

## 🎉 Next Steps

Jika testing berhasil:
1. ✅ Orders sudah muncul dengan products
2. ✅ Data cart tersimpan dengan benar
3. ✅ Query populate products dengan benar

Jika masih ada masalah:
1. Screenshot console logs (browser + server)
2. Screenshot Sanity Studio (order detail)
3. Share error messages
4. Run debug script dan share output

---

**Note:** Pastikan untuk **selalu check console logs** di setiap step untuk identify masalah lebih cepat.
