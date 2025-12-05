# Orders Troubleshooting Guide

## Masalah: Orders Tidak Muncul di Halaman Orders

### Checklist Debugging:

#### 1. ✅ Cek Token Sanity
```bash
# Di file .env, pastikan ada:
NEXT_PUBLIC_SANITY_WRITE_TOKEN=sk...
```

**Cara membuat token baru:**
1. Buka https://sanity.io/manage
2. Pilih project Anda
3. Klik "API" di sidebar
4. Klik "Add API Token"
5. Nama: "Write Token"
6. Permission: **Editor** (bukan Viewer!)
7. Copy token dan paste ke `.env`

#### 2. ✅ Cek Schema Sanity
Schema `orderType` harus memiliki field berikut:
- `orderNumber` (string)
- `clerkUserId` (string) ← **PENTING!**
- `customerName` (string)
- `email` (string)
- `products` (array)
- `address` (reference)
- `shipper` (reference)
- `status` (string)
- `orderDate` (datetime)
- `totalPrice` (number) ← **PENTING!**
- `paymentUrl` (string) ← **PENTING!**

**Jika ada field yang kurang, update schema dan restart Sanity Studio:**
```bash
npm run dev
```

#### 3. ✅ Cek Data yang Dikirim
Buka browser console saat checkout dan cari log:
```
💾 Saving order data to Sanity...
📦 Order data: {...}
```

Pastikan semua field ada dan tidak `undefined`.

#### 4. ✅ Test Manual dengan Script
```bash
npx tsx scripts/test-order-creation.ts
```

**Sebelum run, update script dengan:**
- Product ID yang valid (dari Sanity Studio)
- Address ID yang valid
- Shipper ID yang valid

#### 5. ✅ Cek Permission di Sanity
1. Buka Sanity Studio: http://localhost:3000/studio
2. Cek apakah document type "Order" ada
3. Coba buat order manual di Studio
4. Jika error "Insufficient permissions", token Anda tidak punya akses **Editor**

#### 6. ✅ Cek Query di Orders Page
Query `MY_ORDERS_QUERY` harus fetch field yang benar:
```typescript
const MY_ORDERS_QUERY = defineQuery(`*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
  _id,
  orderNumber,
  orderDate,
  totalPrice,
  status,
  paymentUrl,
  products[]{
    quantity,
    priceAtPurchase,
    product->{
      _id,
      name,
      images,
      "slug": slug.current
    }
  },
  address->{
    _id,
    name,
    address,
    city,
    phone
  },
  shipper->{
    _id,
    name
  }
}`);
```

#### 7. ✅ Cek User ID
Orders di-filter berdasarkan `clerkUserId`. Pastikan:
- User sudah login (ada `user.id` dari Clerk)
- `clerkUserId` di order sama dengan `user.id` saat login

**Debug di browser console:**
```javascript
// Di halaman orders, buka console dan ketik:
console.log('User ID:', user?.id);
```

### Common Errors:

#### Error: "Insufficient permissions"
**Solusi:** Token Anda hanya punya permission "Viewer". Buat token baru dengan permission "Editor".

#### Error: "Field 'clerkUserId' not found"
**Solusi:** Update schema `orderType.ts` dan restart Sanity Studio.

#### Error: "Reference not found"
**Solusi:** 
- Address ID atau Shipper ID tidak valid
- Pastikan address dan shipper sudah dibuat di Sanity Studio terlebih dahulu

#### Orders tidak muncul tapi tidak ada error
**Solusi:**
1. Cek apakah order berhasil dibuat di Sanity Studio
2. Cek apakah `clerkUserId` di order sama dengan user yang login
3. Refresh halaman orders (klik tombol Refresh)

### Cara Cek Order di Sanity Studio:

1. Buka http://localhost:3000/studio
2. Klik "Order" di sidebar
3. Lihat apakah ada order baru
4. Klik order untuk melihat detail
5. Pastikan field `clerkUserId` terisi dengan benar

### Flow Lengkap:

```
Cart → Checkout → createCheckoutSession
  ↓
1. Create invoice di Xendit ✅
2. Save order ke Sanity ✅
3. Redirect ke /orders ✅
  ↓
Orders Page → Fetch orders by clerkUserId
  ↓
Display orders (table/grid view)
```

### Tips:

- Selalu cek browser console untuk error
- Gunakan Sanity Studio untuk verify data
- Test dengan script sebelum test di UI
- Pastikan semua reference (address, shipper, product) valid
