# Orders Page - Modern Table Design

## Overview
Halaman orders telah dirombak total dengan desain tabel modern yang clean dan profesional, mirip dengan tampilan admin dashboard.

## Perubahan Utama

### 1. **Tampilan Tabel Modern**
- Desain tabel dengan kolom yang jelas dan terstruktur
- Header dengan background abu-abu dan teks uppercase
- Hover effect pada setiap baris
- Responsive dan clean layout

### 2. **Kolom Tabel**
| Kolom | Deskripsi |
|-------|-----------|
| Order Number | Nomor pesanan (dipotong untuk tampilan) |
| Date | Tanggal pesanan (format DD/MM/YYYY) |
| Customer | Nama pelanggan |
| Email | Email pelanggan 
al | Totgan format currency |
| Status | Badge status (Paid/Pending/Cancelled) |
| Invoice Number | ID transaksi Xendit |
| Action | Tombol delete (X) |

### 3. **Fitur**
- ✅ Auto-refresh saat halaman visible (user kembali dari payment)
- ✅ Manual refresh button dengan loading state
- ✅ Delete order functionality dengan konfirmasi
- ✅ Status badge dengan warna berbeda (hijau/kuning/merah)
- ✅ Responsive table dengan horizontal scroll
- ✅ Hover effects untuk better UX
- ✅ Loading state yang clean
- ✅ Empty state dengan call-to-action

### 4. **Status Badge Colors**
- **Paid**: Hijau (bg-green-500)
- **Pending**: Kuning (bg-yellow-500)
- **Cancelled**: Merah (bg-red-500)

## File yang Diubah

### 1. `app/(client)/orders/page.tsx`
**Perubahan:**
- Mengganti card layout dengan table layout
- Menambahkan kolom-kolom sesuai desain modern
- Menambahkan delete functionality
- Menyederhanakan tampilan (tidak menampilkan detail produk di tabel)
- Menambahkan proper TypeScript interface untuk Order

**Struktur Baru:**
```tsx
- Header (Title + Refresh Button)
- Table
  - Header Row (8 kolom)
  - Body Rows (data orders)
- Footer (Total count)
```

### 2. `sanity/queries/query.ts`
**Perubahan:**
- Menyederhanakan `MY_ORDERS_QUERY`
- Hanya fetch data yang diperlukan untuk tabel
- Menambahkan proper field selection
- Optimasi query untuk performa lebih baik

**Query Baru:**
```groq
*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
  _id,
  orderNumber,
  orderDate,
  customerName,
  email,
  totalPrice,
  status,
  xenditTransactionId,
  xenditStatus,
  paymentUrl,
  products[]{...},
  address->{...}
}
```

### 3. `app/api/orders/delete/route.ts` (NEW)
**Fitur:**
- DELETE endpoint untuk menghapus order
- Verifikasi user authorization
- Validasi order ownership
- Error handling yang proper

**Endpoint:**
```
DELETE /api/orders/delete
Body: { orderId: string }
```

## Styling

### Tailwind Classes Utama
```css
- Table: w-full, overflow-x-auto
- Header: bg-gray-50, border-b, uppercase, text-xs
- Rows: hover:bg-gray-50, divide-y
- Cells: px-6 py-4, whitespace-nowrap
- Badge: px-3 py-1, rounded
```

## User Experience

### Loading State
- Spinner dengan teks "Loading orders..."
- Centered di tengah layar

### Empty State
- Icon package
- Pesan "No Orders Yet"
- Call-to-action button "Start Shopping"

### Delete Confirmation
- Browser confirm dialog
- Toast notification setelah delete
- Auto-refresh setelah delete berhasil

## API Integration

### Fetch Orders
```typescript
const data = await client.fetch(MY_ORDERS_QUERY, {
  userId: user.id,
});
```

### Delete Order
```typescript
const response = await fetch("/api/orders/delete", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId }),
});
```

## Auto-Refresh Feature

### Visibility Change Detection
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && user?.id) {
      fetchOrders();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
}, [user]);
```

**Kapan Auto-Refresh Terjadi:**
1. User kembali dari halaman payment Xendit
2. User switch tab dan kembali ke orders page
3. User minimize browser dan buka lagi

## Security

### Authorization
- Semua query menggunakan `clerkUserId` filter
- Delete endpoint verifikasi ownership
- Protected dengan Clerk authentication

### Validation
- Order ID validation
- User ID validation
- Proper error messages

## Performance

### Optimasi
- Query hanya fetch field yang diperlukan
- Tidak fetch semua product details di tabel
- Efficient re-rendering dengan proper state management
- Conditional refresh (hanya saat visible)

## Testing

### Manual Testing Checklist
- [ ] Orders ditampilkan dengan benar
- [ ] Status badge warna sesuai
- [ ] Delete order berfungsi
- [ ] Refresh button berfungsi
- [ ] Auto-refresh saat kembali dari payment
- [ ] Empty state ditampilkan jika tidak ada order
- [ ] Loading state ditampilkan saat fetch
- [ ] Responsive di mobile
- [ ] Horizontal scroll di mobile untuk tabel

## Future Improvements

### Possible Enhancements
1. Pagination untuk banyak orders
2. Search/filter functionality
3. Sort by column
4. Export to CSV
5. Bulk actions (delete multiple)
6. Order detail modal/drawer
7. Print invoice button
8. Status filter dropdown
9. Date range filter
10. Order tracking integration

## Notes

- Desain mengikuti prinsip modern admin dashboard
- Clean dan minimalist
- Focus pada readability dan usability
- Mudah di-maintain dan di-extend
- TypeScript untuk type safety
- Proper error handling di semua level

