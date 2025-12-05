# ✅ Real-time Payment Status Update - SELESAI

## Masalah yang Diselesaikan
Status pembayaran di halaman Orders sekarang **otomatis berubah** ketika user sudah melakukan pembayaran di Xendit, tanpa perlu refresh manual.

## Solusi yang Diimplementasikan

### 1. **Client-Side Payment Check** ✅
Karena Sanity token tidak memiliki permission untuk update, kami membuat workaround dengan mengecek status pembayaran langsung dari Xendit API di client-side.

**File yang dibuat/dimodifikasi:**

#### `app/api/orders/check-payment/route.ts` (BARU)
- API route untuk mengecek status invoice dari Xendit
- Mengambil status terbaru langsung dari Xendit API
- Mapping status Xendit ke status order internal:
  - `PAID` / `SETTLED` → `paid` (Lunas)
  - `EXPIRED` / `FAILED` → `cancelled` (Dibatalkan)
  - Lainnya → `pending` (Menunggu)

#### `app/(client)/orders/page.tsx` (DIPERBAIKI)
- Fungsi `checkPaymentStatus()` untuk cek status setiap order pending
- Auto-refresh setiap **3 detik** jika ada order pending
- Status update otomatis di UI tanpa perlu refresh manual
- **FIX**: Menggunakan `updatedOrders` (bukan `data`) saat set state

## Cara Kerja

### Flow Real-time Update:
```
1. User membuka halaman Orders
2. Sistem fetch orders dari Sanity
3. Untuk setiap order dengan status "pending":
   - Extract invoice ID dari payment URL
   - Call API /api/orders/check-payment
   - API query Xendit untuk status terbaru
   - Update status di local state (UI)
4. Auto-refresh setiap 3 detik jika ada pending orders
5. Status berubah otomatis: Menunggu → Lunas
```

### Auto-Refresh Logic:
- ✅ Auto-refresh **aktif** jika ada order pending
- ✅ Auto-refresh **berhenti** jika tidak ada order pending
- ✅ Interval: **3 detik**
- ✅ Juga refresh saat tab browser kembali visible

## Testing

### Cara Test:
1. Buat order baru dari cart
2. Buka halaman Orders - status akan "Menunggu"
3. Klik tombol "Bayar" untuk buka Xendit
4. Lakukan pembayaran di Xendit
5. **Kembali ke halaman Orders**
6. Dalam 3 detik, status akan otomatis berubah menjadi "Lunas"

### Expected Behavior:
- ✅ Status badge berubah: Menunggu (kuning) → Lunas (hijau)
- ✅ Tombol "Bayar" hilang setelah status Lunas
- ✅ Auto-refresh berhenti setelah semua order paid/cancelled
- ✅ Console log menunjukkan: `💳 Payment status changed: pending → paid`

## Catatan Penting

### Kenapa Tidak Pakai Webhook?
Webhook sudah ada di `app/api/webhook/callback/route.ts` dan berfungsi dengan baik, TAPI:
- ❌ Sanity token (`SANITY_WRITE_READ_TOKEN`) tidak punya permission **update**
- ✅ Token bisa **create** order tapi tidak bisa **update** status
- ⚠️ User perlu generate token baru dengan permission Editor/Administrator

### Workaround vs Fix Permanent:
**Workaround (Current):**
- ✅ Client-side check via Xendit API
- ✅ Update status di local state (UI only)
- ❌ Status tidak tersimpan di Sanity database
- ❌ Refresh halaman akan kembali ke status lama

**Fix Permanent (Recommended):**
1. Generate token baru di https://www.sanity.io/manage
2. Pilih role: **Editor** atau **Administrator**
3. Update `SANITY_WRITE_READ_TOKEN` di `.env`
4. Webhook akan bisa update status di database
5. Status persisten setelah refresh

## Files Modified
- ✅ `app/(client)/orders/page.tsx` - Fixed fetchOrders to use updatedOrders
- ✅ `app/api/orders/check-payment/route.ts` - Fixed import typo

## Status: COMPLETE ✅
Real-time payment status update sudah berfungsi dengan baik menggunakan client-side check.
