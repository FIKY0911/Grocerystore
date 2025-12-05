# ✅ Pengurangan Stok Otomatis - SELESAI

## Fitur
Stok barang di home akan **otomatis berkurang** ketika order sudah berstatus **Lunas (pai.

## Implementasi

### 1. API Route: `/api/orders/reduce-stock` ✅
**File**: `app/api/orders/reduce-stock/route.ts`

**Fungsi:**
- Menerima `orderNumber` dari client
- Validasi order sudah paid
- Cek apakah stock sudah dikurangi sebelumnya (prevent double reduction)
- Reduce stock untuk setiap product di order
- Mark order dengan flag `stockReduced: true`

**Safety Features:**
- ✅ Prevent double reduction dengan flag `stockReduced`
- ✅ Handle insufficient stock (set ke 0 jika negatif)
- ✅ Detailed logging untuk debugging
- ✅ Return informasi update untuk setiap product

### 2. Order Schema Update ✅
**File**: `sanity/schemaTypes/orderType.ts`

**Field baru:**
```typescript
{
  name: "stockReduced",
  type: "boolean",
  title: "Stock Reduced",
  description: "Indicates if stock has been reduced for this order",
  initialValue: false,
}
```

### 3. Query Update ✅
**File**: `sanity/queries/query.ts`

Updated `MY_ORDERS_QUERY` untuk include field `stockReduced`.

### 4. Client Integration ✅
**File**: `app/(client)/orders/page.tsx`

**Flow:**
1. Check payment status setiap 3 detik untuk pending orders
2. Jika status berubah dari `pending` → `paid`:
   - Call API `/api/orders/reduce-stock`
   - Show toast notification
   - Update local state dengan `stockReduced: true`

## Cara Kerja

### Complete Flow:
```
1. User checkout → Order created (status: pending, stockReduced: false)
2. User bayar di Xendit
3. Auto-refresh di Orders page detect status change
4. Status berubah: pending → paid
5. Trigger API reduce-stock
6. API reduce stock untuk setiap product:
   - Product A: stock 10 → 8 (qty: 2)
   - Product B: stock 5 → 3 (qty: 2)
7. Mark order: stockReduced = true
8. Show toast: "Pembayaran berhasil! Stok barang telah dikurangi."
9. Stock di home page otomatis update
```

### Prevent Double Reduction:
- ✅ Flag `stockReduced` di order document
- ✅ API check flag sebelum reduce
- ✅ Return early jika sudah reduced

## Testing

### Test Case 1: Normal Flow
1. Add product ke cart (cek stock awal di home)
2. Checkout → buat order
3. Bayar di Xendit
4. Kembali ke Orders page
5. Tunggu 3 detik → status jadi "Lunas"
6. Toast muncul: "Pembayaran berhasil! Stok barang telah dikurangi."
7. Refresh home page → stock berkurang sesuai quantity

### Test Case 2: Prevent Double Reduction
1. Order sudah paid dan stock sudah dikurangi
2. Refresh Orders page berkali-kali
3. Stock tidak berkurang lagi (protected by `stockReduced` flag)

### Test Case 3: Insufficient Stock
1. Product stock: 2
2. Order quantity: 5
3. After payment: stock set to 0 (not negative)
4. Warning logged in console

## Console Logs

### Success:
```
📦 Reducing stock for order: order_xxx
📋 Order products: 2
📦 Product: Tomat
   Current stock: 10
   Quantity ordered: 2
   New stock: 8
✅ Stock reduced successfully
✅ Order marked as stockReduced
```

### Already Reduced:
```
ℹ️ Stock already reduced for this order
```

### Insufficient Stock:
```
⚠️ Insufficient stock for Tomat
📦 Product: Tomat
   Current stock: 1
   Quantity ordered: 5
   New stock: 0
```

## Files Modified/Created
- ✅ `app/api/orders/reduce-stock/route.ts` (NEW)
- ✅ `sanity/schemaTypes/orderType.ts` (added stockReduced field)
- ✅ `sanity/queries/query.ts` (added stockReduced to query)
- ✅ `app/(client)/orders/page.tsx` (call reduce-stock API)

## Notes

### Webhook vs Client-Side
**Current Implementation: Client-Side**
- ✅ Works dengan current Sanity token permissions
- ✅ Immediate feedback dengan toast notification
- ✅ Prevent double reduction dengan flag

**Webhook (Future):**
- Jika Sanity token punya update permission
- Webhook bisa handle stock reduction otomatis
- Lebih reliable untuk production

### Stock Validation
- Stock bisa jadi negatif jika multiple users checkout bersamaan
- Recommendation: Add stock validation saat checkout
- Check available stock sebelum create order

## Status: COMPLETE ✅
Stok barang otomatis berkurang ketika order sudah lunas.

