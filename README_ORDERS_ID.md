# 📦 Panduan Orders List - Bahasa Indonesia

Panduan lengkap sistem Orders List dari Cart ke Sanity ke Client.

---

## 🎯 Apa yang Sudah Dibuat?

### ✅ Sistem Orders Lengkap
1. **Backend (Sanity)**: Schema order dengan products array
2. **Server Action**: Create order dari cart data
3. **API**: Delete order endpoint
4. **Frontend**: Halaman orders dengan 2 view mode (table & grid)
5. **Components**: OrderCard untuk tampilan card
6. **State**: Zustand store untuk manage orders

---

## 🔄 Cara Kerja

### 1. User Add to Cart
```
User pilih produk → Klik "Add to Cart" → 
Tersimpan di Zustand store (localStorage)
```

### 2. User Checkout
```
User ke /cart → Pilih alamat → Pilih kurir → 
Klik "Buat Invoice Pembayaran"
```

### 3. System Create Order
```
Cart data → createCheckoutSession() → 
Create invoice di Xendit → Save order ke Sanity → 
Redirect ke Xendit payment page
```

### 4. User Bayar
```
User bayar di Xendit → Xendit kirim webhook → 
Update order status jadi "paid"
```

### 5. User Lihat Orders
```
User ke /orders → Fetch orders dari Sanity → 
Tampilkan dalam table/grid dengan product details
```

---

## 📁 File-File Penting

### Backend (Sanity)
- `sanity/schemaTypes/orderType.ts` - Schema order
- `sanity/queries/query.ts` - Query untuk fetch orders
- `sanity/lib/writeClient.ts` - Client untuk write ke Sanity

### Server & API
- `action/createCheckoutSession.ts` - Create order dari cart
- `app/api/orders/delete/route.ts` - API delete order

### Frontend
- `app/(client)/cart/page.tsx` - Halaman cart dengan checkout
- `app/(client)/orders/page.tsx` - Halaman orders list
- `app/(client)/orders/OrdersView.tsx` - Component view (table/grid)
- `components/OrderCard.tsx` - Component card untuk grid view

### State
- `store.ts` - Zustand store (cart & orders)

---

## 🧪 Cara Testing

### Test 1: Create Order
```bash
1. Add 2-3 produk ke cart
2. Go to /cart
3. Pilih alamat pengiriman
4. Pilih jasa pengiriman
5. Klik "Buat Invoice Pembayaran"
6. Check console - harus ada log:
   🛒 Cart items: X
   📦 Creating order: order_xxx
   ✅ Invoice created successfully
   💾 Saving order data to Sanity...
   ✅ Order saved to Sanity successfully
   🛒 Products saved: X
7. Harus redirect ke Xendit payment page
```

### Test 2: Check Sanity
```bash
1. Go to http://localhost:3000/studio
2. Klik "Orders" di sidebar
3. Cari order yang baru dibuat
4. Verify:
   ✅ orderNumber ada
   ✅ products array terisi
   ✅ quantity & priceAtPurchase benar
   ✅ address & shipper reference valid
   ✅ status = "pending"
```

### Test 3: View Orders
```bash
1. Go to /orders
2. Check console:
   🔄 Fetching orders for user: user_xxx
   ✅ Orders fetched: X orders
3. Verify:
   ✅ Order muncul di table
   ✅ Product images tampil
   ✅ Product names benar
   ✅ Quantities match
   ✅ Prices benar
   ✅ Status badge warna sesuai
```

### Test 4: Toggle View
```bash
1. Di /orders, klik icon Grid (top right)
2. Verify tampilan berubah jadi cards
3. Klik icon List
4. Verify tampilan berubah jadi table
```

### Test 5: Payment Flow
```bash
1. Create order (jangan bayar dulu)
2. Go to /orders
3. Klik "Bayar Sekarang" di card
4. Bayar di Xendit (test mode)
5. Wait webhook process
6. Refresh /orders
7. Verify status berubah jadi "paid" (badge hijau)
```

---

## 🐛 Troubleshooting

### Problem: Order tidak muncul di Sanity

**Penyebab**: Token Sanity tidak valid atau tidak ada

*usi**:
```bash
1. Check .env file
2. Pastikan ada: NEXT_PUBLIC_SANITY_WRITE_TOKEN=xxx
3. Restart dev server: npm run dev
```

### Problem: Products array kosong di Sanity

**Penyebab**: Cart kosong atau data tidak terkirim

**Solusi**:
```bash
1. Check cart sebelum checkout
2. Console log: groupedItems.length harus > 0
3. Verify console log: "🛒 Products saved: X" (X > 0)
```

### Problem: Order tidak muncul di /orders

**Penyebab**: clerkUserId tidak match

**Solusi**:
```bash
1. Check console: "Current user ID: user_xxx"
2. Go to Sanity Studio → Orders
3. Check clerkUserId di order
4. Harus sama dengan user ID yang login
```

### Problem: Product images tidak muncul

**Penyebab**: urlFor function error atau product tidak ada images

**Solusi**:
```bash
1. Check product di Sanity Studio
2. Pastikan product punya images array
3. Check sanity/lib/image.ts
```

### Problem: Redirect ke /orders bukan Xendit

**Penyebab**: Code salah di cart page

**Solusi**:
```bash
1. Check app/(client)/cart/page.tsx line ~153
2. Harus: window.location.href = paymentUrl;
3. BUKAN: router.push('/orders');
```

---

## 📊 Data Flow Detail

### Cart Data (Zustand)
```javascript
{
  items: [
    {
      product: {
        _id: "product_123",
        name: "Apel Fuji",
        price: 15000,
        images: [...]
      },
      quantity: 2
    }
  ]
}
```

### Order Data (Sanity)
```javascript
{
  _type: "order",
  orderNumber: "order_xxx-xxx-xxx",
  clerkUserId: "user_xxx",
  customerName: "John Doe",
  email: "john@example.com",
  
  // DATA DARI CART
  products: [
    {
      product: { _ref: "product_123" },  // Reference ke product
      quantity: 2,
      priceAtPurchase: 15000
    }
  ],
  
  totalPrice: 30000,
  status: "pending",
  orderDate: "2024-12-05T...",
  xenditTransactionId: "inv_xxx",
  paymentUrl: "https://checkout.xendit.co/...",
  address: { _ref: "address_xxx" },
  shipper: { _ref: "shipper_xxx" }
}
```

### Display di /orders
```javascript
{
  orderNumber: "order_xxx",
  customerName: "John Doe",
  totalPrice: 30000,
  status: "paid",
  
  // PRODUCTS DENGAN DETAILS (reference ter-resolve)
  products: [
    {
      quantity: 2,
      priceAtPurchase: 15000,
      product: {
        _id: "product_123",
        name: "Apel Fuji",
        images: [...],  // Bisa ditampilkan
        slug: "apel-fuji"
      }
    }
  ],
  
  // ADDRESS DETAILS (reference ter-resolve)
  address: {
    name: "Rumah",
    address: "Jl. Sudirman No. 123",
    city: "Jakarta Selatan"
  }
}
```

---

## 🔑 Key Points

### 1. Cart ke Order
- ✅ Data cart (products + quantities) tersimpan ke Sanity
- ✅ Menggunakan product reference (bukan copy data)
- ✅ Price disimpan sebagai `priceAtPurchase` (snapshot harga saat order)

### 2. Order Status
- **pending**: Order baru dibuat, belum bayar
- **paid**: Order sudah dibayar (via webhook)
- **cancelled**: Order dibatalkan

### 3. Query Orders
- Filter by `clerkUserId` (user hanya lihat order sendiri)
- Include `product->` untuk resolve product details
- Include `address->` untuk resolve address details
- Order by `orderDate desc` (terbaru di atas)

### 4. Security
- User hanya bisa lihat orders miliknya
- User hanya bisa delete orders miliknya
- Clerk authentication required
- Sanity write token untuk create/update/delete

---

## 📝 Environment Variables

Pastikan ada di `.env`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_WRITE_TOKEN=xxx
XENDIT_SERVER_KEY=xxx
CLERK_SECRET_KEY=xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Fitur yang Sudah Ada

### Halaman Orders
- ✅ Table view (desktop)
- ✅ Grid view (mobile)
- ✅ Toggle antara views
- ✅ Product images
- ✅ Product names & quantities
- ✅ Prices formatted (IDR)
- ✅ Status badges (colored)
- ✅ Invoice numbers
- ✅ Refresh button
- ✅ Auto-refresh saat tab visible
- ✅ Delete order button
- ✅ Payment button (pending orders)
- ✅ Empty state
- ✅ Loading state

### OrderCard Component
- ✅ Order number
- ✅ Order date
- ✅ Status badge
- ✅ Product list dengan images
- ✅ Quantities & prices
- ✅ Shipping address
- ✅ Total price
- ✅ Payment button (if pending)

---

## ✅ Kesimpulan

**Status**: ✅ **SELESAI & BERFUNGSI**

**Yang Sudah Berfungsi:**
1. ✅ Data cart tersimpan ke Sanity sebagai order
2. ✅ Products dari cart tersimpan dengan reference
3. ✅ Order muncul di Sanity Studio
4. ✅ Order muncul di halaman /orders
5. ✅ Product details ditampilkan dengan images
6. ✅ Status management (pending → paid via webhook)
7. ✅ Delete order functionality
8. ✅ Responsive design (table + grid)
9. ✅ Auto-refresh functionality

**Flow Lengkap:**
```
Cart → Checkout → Create Order → Xendit Payment → 
Webhook Update → Display di /orders
```

**Cara Pakai:**
1. Add products to cart
2. Checkout dengan pilih alamat & kurir
3. Bayar di Xendit
4. Lihat orders di /orders

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lebih detail, lihat:
- `ORDERS_IMPLEMENTATION_GUIDE.md` - Panduan implementasi lengkap
- `ORDERS_QUICK_GUIDE_ID.md` - Panduan cepat
- `ORDERS_TESTING_GUIDE.md` - Panduan testing
- `CART_TO_ORDER_DEBUG.md` - Panduan debug
- `ORDERS_COMPLETE_SUMMARY.md` - Summary lengkap

---

**Dibuat**: December 2024
**Status**: Production Ready ✅

