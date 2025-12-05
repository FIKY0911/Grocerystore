# 📦 Cara Pakai Orders - Panduan User

Panduan lengkap cara menggunakan fitur Orders dari checkout sampai pembayaran.

---

## 🛒 Step 1: Checkout dari Cart

### Langkah-langkah:
1. **Add produk ke cart**
   - Browse produk
   - Klik "Add to Cart"
   - Produk masuk ke cart

2. **Go to Cart**
   - Klik icon cart di header
   - Atau go to `/cart`

3. **Pilih Alamat Pengiriman**
   - Pilih alamat yang sudah ada
   - Atau klik "Tambah Alamat Baru"

4. **Pilih Jasa Pengiriman**
   - Pilih kurir (JNE, JNT, dll)

5. **Klik "Buat Invoice Pembayaran"**
   - Cart akan di-clear
   - Redirect ke halaman Orders

---

## 📦 Step 2: Lihat Orders

### Setelah Checkout:
- Anda akan diarahkan ke `/orders`
- Order baru muncul dengan status **Pending** (badge kuning)
- Ada banner kuning di atas: "Anda memiliki X pesanan yang menunggu pembayaran"

### Informasi Order:
- **Order Number**: Nomor unik order
- **Date**: Tanggal order dibuat
- **Customer**: Nama Anda
- **Email**: Email Anda
- **Total**: Total harga
- **Status**: Pending / Paid / Cancelled
- **Invoice Number**: ID transaksi Xendit

---

## 💳 Step 3: Bayar Order

### Cara Bayar:

#### Dari Table View (Desktop):
1. Lihat kolom "Payment"
2. Klik tombol **"💳 Bayar"**
3. Akan membuka Xendit di tab baru

#### Dari Grid View (Mobile):
1. Scroll ke order yang mau dibayar
2. Klik tombol **"💳 Bayar Sekarang"** (tombol hijau besar)
3. Akan membuka Xendit di tab baru

### Di Xendit:
1. Pilih metode pembayaran:
   - Bank Transfer (BCA, Mandiri, BNI, dll)
   - E-Wallet (OVO, GoPay, Dana, dll)
   - Retail Outlet (Alfamart, Indomaret)
   - Credit Card
   - QRIS

2. Ikuti instruksi pembayaran
3. Complete payment

---

## ✅ Step 4: Cek Status Order

### Setelah Bayar:
1. Kembali ke tab `/orders`
2. Klik tombol **"Refresh"** (icon refresh di kanan atas)
3. Status order akan berubah:
   - **Pending** (kuning) → **Paid** (hijau)
4. Tombol "💳 Bayar" akan hilang
5. Banner kuning akan hilang (jika tidak ada pending lagi)

### Auto-refresh:
- Orders page otomatis refresh saat tab visible
- Tidak perlu manual refresh jika sudah switch tab

---

## 🎨 Tampilan Orders Page

### Banner Pending Orders (Kuning)
```
⚠️ Anda memiliki 2 pesanan yang menunggu pembayaran
   Klik tombol "Bayar" untuk melanjutkan pembayaran di Xendit.
```

### Table View (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ Order Number │ Date │ Customer │ Email │ Total │ Status │ Payment │ Action │
├─────────────────────────────────────────────────────────────┤
│ 33a9243ec... │ 22/04│ John Doe │ ...   │ Rp50K │ Pending│ 💳 Bayar│   X    │
│ 44b8354fd... │ 21/04│ John Doe │ ...   │ Rp30K │ Paid   │    -    │   X    │
└─────────────────────────────────────────────────────────────┘
```

### Grid View (Mobile)
```
┌─────────────────────────────────────┐
│ 📦 Order #33a9243ec...              │
│ 📅 22 April 2024                    │
│ 🟡 Pending                          │
├─────────────────────────────────────┤
│ [Image] Apel Fuji                   │
│         Qty: 2x        Rp 30.000    │
│                                     │
│ [Image] Jeruk Mandarin              │
│         Qty: 1x        Rp 20.000    │
├─────────────────────────────────────┤
│ 📍 Rumah                            │
│    Jl. Sudirman No. 123, Jakarta    │
├─────────────────────────────────────┤
│ Total              Rp 50.000        │
├─────────────────────────────────────┤
│ [💳 Bayar Sekarang]                 │
│ Klik untuk melanjutkan pembayaran   │
└─────────────────────────────────────┘
```

---

## 🔄 Toggle View

### Switch antara Table dan Grid:
1. Lihat icon di kanan atas (di bawah tombol Refresh)
2. **Grid Icon** (⊞): Switch ke Grid view (card layout)
3. **List Icon** (☰): Switch ke Table view (table layout)

### Kapan Pakai:
- **Table View**: Bagus untuk desktop, lihat banyak info sekaligus
- **Grid View**: Bagus untuk mobile, lebih mudah dibaca

---

## 🗑️ Delete Order

### Cara Delete:
1. Klik icon **X** (merah) di kolom Action
2. Confirm delete
3. Order akan dihapus dari Sanity

### Catatan:
- Hanya bisa delete order milik sendiri
- Order yang sudah paid sebaiknya tidak dihapus
- Delete permanent, tidak bisa undo

---

## 💡 Tips & Tricks

### 1. Multiple Orders
- Anda bisa create beberapa orders sekaligus
- Bayar satu per satu sesuai kebutuhan
- Semua pending orders akan muncul di banner

### 2. Payment Timing
- Payment URL valid 24 jam (default Xendit)
- Bayar kapan saja dalam 24 jam
- Setelah 24 jam, order akan expired

### 3. Refresh Status
- Setelah bayar, tunggu beberapa detik
- Klik "Refresh" untuk update status
- Atau switch tab dan kembali (auto-refresh)

### 4. Check Order Details
- Klik order untuk lihat detail (coming soon)
- Lihat product images di grid view
- Lihat alamat pengiriman di card

### 5. Track Payment
- Invoice number = Xendit transaction ID
- Bisa dicek di Xendit dashboard
- Untuk customer support

---

## ❓ FAQ

### Q: Kenapa setelah checkout tidak langsung ke Xendit?
**A**: Flow baru memungkinkan Anda lihat order dulu sebelum bayar. Lebih flexible dan bisa bayar nanti.

### Q: Bagaimana cara bayar order yang pending?
**A**: Klik tombol "💳 Bayar" di orders page. Akan membuka Xendit di tab baru.

### Q: Berapa lama payment URL valid?
**A**: 24 jam (default Xendit). Setelah itu order akan expired.

### Q: Bisa bayar beberapa order sekaligus?
**A**: Tidak, harus bayar satu per satu. Setiap order punya payment URL sendiri.

### Q: Status tidak update setelah bayar?
**A**: Tunggu beberapa detik untuk webhook process. Lalu klik "Refresh".

### Q: Bisa cancel order?
**A**: Bisa delete order, tapi tidak ada refund jika sudah paid.

### Q: Order hilang dari list?
**A**: Check filter atau refresh page. Atau mungkin terhapus.

### Q: Tombol "Bayar" tidak muncul?
**A**: Hanya muncul untuk order dengan status "Pending". Order "Paid" tidak ada tombol bayar.

---

## 🎯 Summary Flow

```
1. Add to Cart
   ↓
2. Checkout (pilih alamat & kurir)
   ↓
3. Redirect ke /orders (status: Pending)
   ↓
4. Klik "💳 Bayar"
   ↓
5. Bayar di Xendit
   ↓
6. Refresh /orders
   ↓
7. Status berubah jadi "Paid" ✅
```

---

## 📞 Need Help?

Jika ada masalah:
1. Check console logs (F12)
2. Refresh page
3. Clear browser cache
4. Contact support

---

**Last Updated**: December 2024
**Version**: 2.0.0
