# 📦 Panduan Cepat Orders List

Panduan singkat untuk menggunakan fitur Orders List.

---

## 🎯 Fitur Utama

✅ **Tamp*
- Table view (desktop)
- Grid view (mobile-friendly)
- Toggle antara kedua view

✅ **Informasi Order**
- Order number
- Tanggal order
- Customer name & email
- Total harga
- Status (Paid/Pending/Cancelled)
- Invoice number dari Xendit
- Detail produk dengan gambar
- Alamat pengiriman

✅ **Aksi**
- Refresh orders
- Delete order
- Bayar sekarang (untuk pending orders)
- Auto-refresh saat tab visible

---

## 📁 Struktur File

```
app/(client)/orders/
├── page.tsx              # Main orders page
└── OrdersView.tsx        # View component (table/grid)

components/
├── OrderCard.tsx         # Card component untuk grid view
├── PriceFormatter.tsx    # Format harga ke IDR
└── Container.tsx         # Layout wrapper

sanity/
├── schemaTypes/
│   └── orderType.ts      # Schema order di Sanity
└── queries/
    └── query.ts          # MY_ORDERS_QUERY

action/
└── createCheckoutSession.ts  # Create order dari cart

app/api/orders/
└── delete/
    └── route.ts          # API delete order
```

---

## 🔄 Flow Penggunaan

### 1. User Checkout
```
Cart → Checkout → Payment → Order Created (status: pending)
```

### 2. User Bayar
```
Xendit Payment → Webhook → Order Updated (status: paid)
```

### 3. User Lihat Orders
```
/orders → Fetch dari Sanity → Display orders
```

---

## 💻 Cara Menggunakan

### Melihat Orders
1. Login dengan Clerk
2. Navigate ke `/orders`
3. Orders akan otomatis di-fetch berdasarkan user ID

### Toggle View
- Klik icon **Grid** untuk card view
- Klik icon **List** untuk table view

### Refresh Orders
- Klik tombol **Refresh** di header
- Atau biarkan auto-refresh saat tab visible

### Delete Order
- Klik icon **X** di setiap order
- Confirm delete
- Order akan dihapus dari Sanity

### Bayar Order Pending
- Klik tombol **Bayar Sekarang** di card
- Redirect ke Xendit payment page

---

## 🎨 Komponen

### OrderCard
Menampilkan order dalam format card dengan:
- Product images
- Product names & quantities
- Shipping address
- Total price
- Status badge
- Payment button (jika pending)

### OrdersView
Komponen dengan 2 mode:
- **Table**: Untuk desktop, menampilkan semua info dalam tabel
- **Grid**: Untuk mobile, menampilkan cards

---

## 🔐 Security

- ✅ User hanya bisa lihat orders miliknya sendiri
- ✅ User hanya bisa delete orders miliknya sendiri
- ✅ Clerk authentication required
- ✅ Sanity query filtered by `clerkUserId`

---

## 📊 Data Structure

### Order di Sanity
```typescript
{
  _id: string;
  orderNumber: string;
  clerkUserId: string;
  customerName: string;
  email: string;
  products: [
    {
      product: { _ref: "product_id" },
      quantity: number,
      priceAtPurchase: number
    }
  ];
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
  orderDate: datetime;
  xenditTransactionId: string;
  xenditStatus: string;
  paymentUrl: url;
  address: { _ref: "address_id" };
  shipper: { _ref: "shipper_id" };
}
```

---

## 🐛 Troubleshooting

### Orders tidak muncul
**Problem**: Halaman kosong atau loading terus
**Solution**: 
- Check console untuk error
- Verify `clerkUserId` di Sanity match dengan user login
- Check Sanity query di Vision tool

### Delete order gagal
**Problem**: Error saat delete
**Solution**:
- Verify user owns the order
- Check API endpoint `/api/orders/delete`
- Check Sanity write token

### Status tidak update
**Problem**: Status masih pending padahal sudah bayar
**Solution**:
- Check webhook configuration di Xendit
- Verify webhook URL accessible
- Check webhook logs di Xendit dashboard

### Images tidak muncul
**Problem**: Product images tidak tampil di OrderCard
**Solution**:
- Check `urlFor` function di `sanity/lib/image.ts`
- Verify product has images array
- Check Sanity image CDN

---

## 🚀 Tips

1. **Performance**: Orders di-cache di client, refresh manual jika perlu
2. **Mobile**: Gunakan grid view untuk tampilan lebih baik di mobile
3. **Auto-refresh**: Orders auto-refresh saat tab visible
4. **Payment**: Pending orders bisa langsung dibayar dari orders page
5. **Filter**: Saat ini filter by user, bisa ditambahkan filter by status/date

---

## 📝 Next Steps

Fitur yang bisa ditambahkan:
- [ ] Filter by status (paid/pending/cancelled)
- [ ] Filter by date range
- [ ] Search by order number
- [ ] Export orders to CSV/PDF
- [ ] Order detail page
- [ ] Track shipping status
- [ ] Cancel order functionality
- [ ] Reorder functionality

---

## 🎯 Summary

✅ Orders list sudah berfungsi dengan baik
✅ Terintegrasi dengan Sanity, Xendit, dan Clerk
✅ Responsive design (table + grid view)
✅ Auto-refresh dan manual refresh
✅ Delete order functionality
✅ Payment button untuk pending orders

**Status**: ✅ Production Ready

---

**Last Updated**: December 2024

