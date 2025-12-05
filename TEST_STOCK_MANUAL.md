# Manual Test: Stock Reduction

## Cara Test Stock Reduction

### Step 1: Cek Stock Awal
1. Buka Sanity Studio: http://localhost:3333
2. Pilih Products
3. Pilih salah satu product (misal: Tomat)
4. Catat stock awal (misal: **10**)

### Sterder
1. Buka website: http://localhost:3000
2. Add product ke cart (misal: Tomat, quantity: **2**)
3. Checkout
4. Akan redirect ke Xendit payment page

### Step 3: Bayar di Xendit
1. Pilih metode pembayaran (misal: Virtual Account)
2. Klik "Pay"
3. Untuk testing, gunakan test payment

### Step 4: Cek Status Order
1. Kembali ke http://localhost:3000/orders
2. Tunggu 3 detik (auto-refresh)
3. Status akan berubah dari "Menunggu" → "Lunas"
4. Toast notification muncul: "Pembayaran berhasil! Stok barang telah dikurangi."

### Step 5: Verifikasi Stock Berkurang
1. Buka Sanity Studio lagi
2. Refresh halaman Products
3. Cek stock product Tomat
4. Stock seharusnya: **10 - 2 = 8**

## Expected Console Logs

### Di Browser Console (Orders Page):
```
💳 Payment status changed: pending → paid
📦 Reducing stock for order: order_xxx
✅ Stock reduced: {success: true, message: "Stock reduced successfully", updates: [...]}
```

### Di Server Console (Terminal):
```
📦 Reducing stock for order: order_xxx
📋 Order products: 1
📦 Product: Tomat
   Current stock: 10
   Quantity ordered: 2
   New stock: 8
✅ Order marked as stockReduced
✅ Stock reduced successfully
POST /api/orders/reduce-stock 200 in XXXms
```

## Troubleshooting

### Stock Tidak Berkurang?

**1. Cek Console Browser**
- Buka DevTools → Console
- Cari error message
- Pastikan ada log: "📦 Reducing stock for order"

**2. Cek Console Server**
- Lihat terminal yang running `npm run dev`
- Cari error message
- Pastikan API `/api/orders/reduce-stock` dipanggil

**3. Cek Sanity Token Permission**
Jika ada error: "Insufficient permissions"
- Token tidak punya permission update
- Generate token baru di: https://www.sanity.io/manage
- Pilih role: **Editor** atau **Administrator**
- Update `SANITY_WRITE_READ_TOKEN` di `.env`

**4. Cek Order Status**
- Buka Sanity Studio → Orders
- Pastikan order status = "paid"
- Pastikan field `stockReduced` = true

**5. Cek Product Stock**
- Buka Sanity Studio → Products
- Refresh halaman
- Cek field `stock`

## Test dengan Multiple Products

### Scenario:
- Order 2 products:
  - Tomat: stock 10, order 2 → new stock: 8
  - Wortel: stock 15, order 3 → new stock: 12

### Expected Result:
- Tomat stock: 10 → 8 ✅
- Wortel stock: 15 → 12 ✅
- Order `stockReduced`: false → true ✅

## API Test (Manual)

Jika ingin test API langsung:

```bash
# Test reduce stock API
curl -X POST http://localhost:3000/api/orders/reduce-stock \
  -H "Content-Type: application/json" \
  -d '{"orderNumber": "order_xxx"}'
```

Replace `order_xxx` dengan order number yang sudah paid.

## Current Implementation Status

✅ API `/api/orders/reduce-stock` - Created
✅ Order schema field `stockReduced` - Added
✅ Query `MY_ORDERS_QUERY` includes `stockReduced` - Updated
✅ Orders page calls API when status → paid - Implemented
✅ Toast notification - Implemented
✅ Prevent double reduction - Implemented

## Next Steps

1. Test dengan real order
2. Verify stock berkurang di Sanity
3. Check console logs
4. Report any errors

