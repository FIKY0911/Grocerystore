# 📦 Melihat Hasil Pembayaran di Orders

Panduan untuk melihat history transaksi setelah pembayaran berhasil.

---

## 🔄 Flow Setelah Pembayaran

```
User Bayar di Xendit
   ↓
Payment Success
   ↓
Redirect ke: http://localhost:3000/success?orderNumber=order_xxx
   ↓
User Klik "Orders" Button
   ↓
Redirect ke: http://localhost:3000/orders
   ↓
✅ Order Muncul di List dengan Status "Dibayar"
```

---

## 📋 Cara Melihat Hasil Pembayaran

### Method 1: Dari Success Page

1. Setelah pembayaran berhasil → redirect ke `/success?orderNumber=xxx`
2. Klik button "Orders" (hijau, icon 📦)
3. Order muncul di list dengan status "Dibayar"

### Method 2: Langsung ke Orders

1. Klik menu "Orders" di header (icon 📋)
2. Atau buka: `http://localhost:3000/orders`
3. Lihat list semua orders

### Method 3: Auto-Refresh

Orders page otomatis refresh saat:
- User kembali ke tab (dari payment page)
- User navigate ke `/orders`
- User klik button "Refresh"

---

## 🎯 Fitur Orders Page

### Header
- Title: "Pesanan Saya"
- Total count: "Total X pesanan"
- Button: "🔄 Refresh" (manual refresh)

### Order Card
- Order number
- Order date
- Status badge (Dibayar/Menunggu/Dibatalkan)
- Product images & details
- Quantity & price
- Shipping address
- Total price
- Action buttons

### Status Badges
- 🟢 **Dibayar** (green) - Payment success
- 🟡 **Menunggu** (yellow) - Pending payment
- 🔴 **Dibatalkan** (red) - Cancelled/expired

---

## ✅ Summary

Setelah pembayaran berhasil:
1. ✅ User redirect ke `/success`
2. ✅ Klik "Orders" button
3. ✅ Order muncul di `/orders` dengan status "Dibayar"
4. ✅ Auto-refresh saat kembali ke tab
5. ✅ Manual refresh dengan button

**Order Number Example:**
```
http://localhost:3000/success?orderNumber=order_0872ab00-c6ff-4245-b0a8-f89d611277a2
```

Order ini akan muncul di `/orders` dengan semua detail lengkap!

---

**Last Updated**: December 2024
