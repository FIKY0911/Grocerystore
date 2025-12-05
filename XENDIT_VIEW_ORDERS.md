#ihat Hasil Pembayaran di Orders

Panduan lengkap untuk melihat history transaksi dan hasil pembayaran di halaman Orders.

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

1. **Setelah Pembayaran Berhasil**
   - User di-redirect ke: `http://localhost:3000/success?orderNumber=order_xxx`
   - Halaman menampilkan:
     - ✅ "Order Confirmed!"
     - Order number
     - Status pembayaran
     - Tip: Link ke Orders page

2. **Klik Button "Orders"**
   - Button hijau di tengah
   - Icon: 📦 Package
   - Text: "Orders"

3. **Lihat Order di List**
   - Order terbaru muncul di atas
   - Status badge: 🟢 "Dibayar"
   - Detail order lengkap

### Method 2: Langsung ke Orders Page

1. **Navigasi ke Orders**
   - Klik menu "Orders" di header (icon 📋 Logs)
   - Atau langsung buka: `http://localhost:3000/orders`

2. **Lihat List Orders**
   - Semua orders ditampilkan
   - Sorted by date (terbaru dulu)
   - Status badge untuk setiap order

### Method 3: Auto-Refresh

Orders page akan **otomatis refresh** saat:
- User kembali ke tab/window (dari Xendit payment page)
- User navigate ke `/orders` page
- User klik button "Refresh"

---

## 🎯 Fitur Orders Page

### 1. Header Section

```
┌─────────────────────────────────────────────────┐
│  Pesanan Saya                    [🔄 Refresh]   │
│  Total X pesanan                                │
└─────────────────────────────────────────────────┘
```

**Features:**
- Title: "Pesanan Saya"
- Total count: "Total X pesanan"
- Refresh button: Manual refresh orders

### 2. Order Card

```
┌─────────────────────────────────────────────────┐
│  📦 Order #order_xxx                            │
│  📅 21 Maret 2024                               │
│                                                 │
│  🟢 Dibayar          [📄 Lihat Invoice]         │
├─────────────────────────────────────────────────┤
│  [Product Image] Product Name                   │
│                  Jumlah: 2x        Rp 50.000    │
│                                                 │
│  [Product Image] Product Name                   │
│                  Jumlah: 1x        Rp 25.000    │
├─────────────────────────────────────────────────┤
│  Pengiriman: Jakarta Selatan                    │
│                                                 │
│                  Total Pembayaran               │
│                  Rp 75.000                      │
└─────────────────────────────────────────────────┘
```

**Information Displayed:**
- ✅ Order number
- ✅ Order date
- ✅ Status badge (Dibayar/Menunggu/Dibatalkan)
- ✅ Product images & names
- ✅ Quantity per product
- ✅ Price per product
- ✅ Shipping address
- ✅ Total price
- ✅ Action buttons

### 3. Status Badges

| Status | Badge | Color | Icon |
|--------|-------|-------|------|
| **Dibayar** | 🟢 Dibayar | Green | ✅ CheckCircle2 |
| **Menunggu** | 🟡 Menunggu | Yellow | ⏰ Clock |
| **Dibatalkan** | 🔴 Dibatalkan | Red | ❌ XCircle |

### 4. Action Buttons

**"Lihat Invoice"**
- Icon: 📄 FileText
- Action: Navigate to `/invoice/order_xxx`
- Shows: Invoice details, payment URL, payment methods

**"Bayar Sekarang"** (only for pending orders)
- Icon: 💳 CreditCard
- Action: Open payment URL in new tab
- Shows: Only if status = "pending"

---

## 🔍 Example: Order Details

### Order Card Example

```typescript
Order #order_0872ab00-c6ff-4245-b0a8-f89d611277a2
📅 5 Desember 2024

Status: 🟢 Dibayar

Products:
├─ [Image] Apel Fuji
│  Jumlah: 2x
│  Harga: Rp 30.000
│
└─ [Image] Jeruk Mandarin
   Jumlah: 1x
   Harga: Rp 20.000

Pengiriman: Jakarta Selatan

Total Pembayaran: Rp 50.000

[📄 Lihat Invoice]
```

---

## 🔄 Auto-Refresh Feature

### When Auto-Refresh Triggers

1. **Page Visibility Change**
   ```javascript
   // User returns to tab/window
   document.visibilityState === 'visible'
   → Auto-refresh orders
   ```

2. **Component Mount**
   ```javascript
   // User navigates to /orders
   useEffect(() => {
     fetchOrders();
   }, [user]);
   ```

3. **Manual Refresh**
   ```javascript
   // User clicks Refresh button
   <Button onClick={handleRefresh}>
     🔄 Refresh
   </Button>
   ```

### Console Logs

```bash
# When fetching orders
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 3 orders

# When page becomes visible
👀 Page visible, refreshing orders...
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 3 orders
```

---

## 🧪 Testing Flow

### Test 1: View Order After Payment

1. **Complete Payment**
   ```bash
   # User at Xendit payment page
   # User pays with BCA VA
   # Payment confirmed
   ```

2. **Redirected to Success**
   ```bash
   # URL: http://localhost:3000/success?orderNumber=order_xxx
   # Page shows:
   ✅ "Order Confirmed!"
   📦 Order number: order_xxx
   💳 Status: Dibayar
   ```

3. **Click "Orders" Button**
   ```bash
   # Navigate to: http://localhost:3000/orders
   ```

4. **Verify Order in List**
   ```bash
   # Check:
   ✅ Order appears at top of list
   ✅ Status badge: "Dibayar" (green)
   ✅ Order details correct
   ✅ Products displayed
   ✅ Total price correct
   ```

### Test 2: Manual Refresh

1. **Open Orders Page**
   ```bash
   http://localhost:3000/orders
   ```

2. **Click Refresh Button**
   ```bash
   # Button shows: "Memuat..." with spinning icon
   # Console log:
   🔄 Fetching orders for user: user_xxx
   ✅ Orders fetched: X orders
   
   # Toast notification:
   ✅ "X pesanan ditemukan"
   ```

3. **Verify Updated**
   ```bash
   # Orders list refreshed
   # Latest orders at top
   ```

### Test 3: Auto-Refresh on Return

1. **Open Orders Page**
   ```bash
   http://localhost:3000/orders
   ```

2. **Switch to Another Tab**
   ```bash
   # Open new tab or switch to another app
   ```

3. **Return to Orders Tab**
   ```bash
   # Console log:
   👀 Page visible, refreshing orders...
   🔄 Fetching orders for user: user_xxx
   ✅ Orders fetched: X orders
   
   # Orders automatically refreshed
   ```

---

## 📊 Data Flow

```
┌──────────────┐
│   Browser    │
│ /orders      │
└──────┬───────┘
       │
       │ 1. Fetch orders
       ↓
┌──────────────┐
│   Next.js    │
│   Server     │
└──────┬───────┘
       │
       │ 2. Query Sanity
       ↓
┌──────────────┐
│    Sanity    │
│     CMS      │
└──────┬───────┘
       │
       │ 3. Return orders
       │    (filtered by clerkUserId)
       │    (sorted by orderDate desc)
       ↓
┌──────────────┐
│   Browser    │
│   Display    │
│   Orders     │
└──────────────┘
```

### Query Used

```typescript
// MY_ORDERS_QUERY
*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc) {
  ...,
  products[] {
    ...,
    product->
  },
  address->,
  xenditStatus,
  paymentUrl
}
```

**Filters:**
- `_type == 'order'` - Only order documents
- `clerkUserId == $userId` - Only user's orders
- `order(orderDate desc)` - Newest first

**Includes:**
- All order fields
- Product details (with reference)
- Address details (with reference)
- Xendit status
- Payment URL

---

## 🎨 UI Components

### Order Card Component

```typescript
<Card key={order._id}>
  <CardHeader>
    {/* Order number & date */}
    <Package /> Order #{order.orderNumber}
    <Calendar /> {formatDate(order.orderDate)}
    
    {/* Status badge */}
    {getStatusBadge(order.status)}
    
    {/* Invoice button */}
    <Link href={`/invoice/${order.orderNumber}`}>
      <Button>
        <FileText /> Lihat Invoice
      </Button>
    </Link>
  </CardHeader>
  
  <CardContent>
    {/* Products */}
    {order.products.map(item => (
      <div>
        <Image src={item.product.images[0]} />
        <p>{item.product.name}</p>
        <p>Jumlah: {item.quantity}x</p>
        <PriceFormatter amount={item.priceAtPurchase} />
      </div>
    ))}
    
    {/* Shipping address */}
    <CreditCard /> Pengiriman: {order.address.city}
    
    {/* Total price */}
    <PriceFormatter amount={order.totalPrice} />
    
    {/* Pay button (if pending) */}
    {order && (
4
ber 202cemdated**: Dest UpLa--

**e

-sting guid.md) - TeDIT_TESTING](./XENESTING.mdIT_Tw
- [XENDaction flons - TraOW.md)ACTION_FLANSNDIT_TRd](./XETION_FLOW.mIT_TRANSAC
- [XENDwyment flopamplete .md) - CoPAYMENT_FLOWXENDIT_./md](YMENT_FLOW.DIT_PA

- [XENntationocume📚 Related D## 

thods

---yment ment URL, pails, paymeInvoice deta Shows: `
-]/page.tsxberNum[order/invoice//(client): `app- Filerder_xxx`
 `/invoice/oe:**
- URL:ag P**Invoice
e
 dat, sorted by all orders ofows: List
- Shge.tsx`rs/paent)/orde/(clile: `apprders`
- FiURL: `/oge:**
-  Pa

**Ordersrderso Oinks tn, l confirmatioShows: Order
- ge.tsx`ess/pa/succient)app/(clile: `=xxx`
- Fmber?orderNuL: `/successge:**
- URss Pa
**Succe Pages
## 🔗 Related-

gsi

--utton berfunefresh bal r- [ ] Manue tab
kembali kat refresh sauto-
- [ ] Angsiberfu" hat Invoice Button "Lis)
- [ ]esddr aice,ducts, prap (proetails lengk ] Order d(green)
- [ayar" "Dib  badge: Statustas)
- [ ](paling a di list rder muncul ] Oerbuka
- [page tOrders 
- [ ] n" buttoders"Orer klik s
- [ ] Usr detailmpilkan ordenameess page  ] Succ
- [xx`r=xumbeccess?orderN ke `/suecter di-redir[ ] Us

- , pastikan:erhasilbayaran bh pemlalist

Sete
## ✅ Check``

---
/Card>
`dContent>
</Car}
  <>
    )   </Link   
/Button>Sekarang<utton>Bayar      <B>
   "_blank" target=l}.paymentUr{orderref=     <Link h ymentUrlr.pa && ordeing" "pendus ===.stat
