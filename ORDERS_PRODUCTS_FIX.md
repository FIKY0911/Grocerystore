# Fix Ors - Products Tidak Muncul

## Masalah
Orders muncul di halaman `/orders` tapi **products array kosong** atau tidak ter-populate dengan benar.

## Root Cause Analysis

### 1. Data Flow Cart → Order
```
Cart (store.ts)
  ↓
groupedItems = [{ product: Product, quantity: number }]
  ↓
createCheckoutSession(groupedItems, metadata)
  ↓
productsData = groupedItems.map(item => ({
  _type: 'object',
  product: { _type: 'reference', _ref: item.product._id },
  quantity: item.quantity,
  priceAtPurchase: item.product.price
}))
  ↓
orderData.products = productsData
  ↓
Sanity Order Document
```

### 2. Kemungkinan Penyebab

#### A. Product._id Tidak Valid
```typescript
// ❌ Problem
item.product._id = undefined
item.product._id = null
item.product._id = ""

// ✅ Solution
// Validasi sebelum save
if (!item.product._id) {
  throw new Error('Product ID tidak valid');
}
```

#### B. Products Array Tidak Disimpan
```typescript
// ❌ Problem
orderData.products = [] // Empty array

// ✅ Solution
// Pastikan productsData tidak kosong
if (productsData.length === 0) {
  throw new Error('Tidak ada produk untuk disimpan');
}
```

#### C. Reference Tidak Ter-populate di Query
```groq
// ❌ Problem - Reference tidak di-populate
products[]

// ✅ Solution - Populate dengan ->
products[]{
  quantity,
  priceAtPurchase,
  product->{
    _id,
    name,
    images,
    price,
    "slug": slug.current
  }
}
```

## Solusi yang Sudah Diterapkan

### 1. Validasi Products Data (createCheckoutSession.ts)
```typescript
// Validasi products data
if (productsData.length === 0) {
  throw new Error('Tidak ada produk untuk disimpan');
}

// Validasi setiap product reference
const invalidProducts = productsData.filter(p => !p.product._ref);
if (invalidProducts.length > 0) {
  console.error('❌ Invalid product references:', invalidProducts);
  throw new Error('Beberapa produk tidak memiliki ID yang valid');
}
```

### 2. Enhanced Logging (createCheckoutSession.ts)
```typescript
console.log('🛒 Cart products to save:', {
  count: productsData.length,
  products: productsData.map(p => ({
    productId: p.product._ref,
    quantity: p.quantity,
    price: p.priceAtPurchase
  }))
});

console.log('📦 Order data to save:', {
  orderNumber: orderData.orderNumber,
  productsCount: orderData.products.length,
  products: orderData.products,
  totalPrice: orderData.totalPrice,
});
```

### 3. Enhanced Logging (cart/page.tsx)
```typescript
console.log('🛒 Cart items:', groupedItems.length);
console.log('📦 Cart details:', groupedItems.map(item => ({
  productId: item.product._id,
  productName: item.product.name,
  quantity: item.quantity,
  price: item.product.price
})));
```

### 4. Enhanced Query (query.ts)
```groq
*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
  _id,
  orderNumber,
  orderDate,
  totalPrice,
  status,
  paymentUrl,
  "productsCount": count(products),  // ✅ Count products
  products[]{
    quantity,
    priceAtPurchase,
    product->{                        // ✅ Populate reference
      _id,
      name,
      images,
      price,
      "slug": slug.current
    }
  },
  ...
}
```

### 5. Debug Logging (orders/page.tsx)
```typescript
data.forEach((order: any, idx: number) => {
  console.log(`📦 Order ${idx + 1}:`, {
    orderNumber: order.orderNumber,
    productsCount: order.productsCount || 0,
    products: order.products?.length || 0,
    productDetails: order.products?.map((p: any) => ({
      name: p.product?.name,
      quantity: p.quantity,
      price: p.priceAtPurchase
    }))
  });
});
```

## Cara Testing

### 1. Check Console Logs

#### A. Saat Checkout (Browser Console)
```
🛒 Cart items: 2
📦 Cart details: [
  { productId: "abc123", productName: "Product A", quantity: 2, price: 10000 },
  { productId: "def456", productName: "Product B", quantity: 1, price: 20000 }
]
📦 Creating order: order_xxx
```

#### B. Saat Create Order (Server Console)
```
🛒 Cart products to save: {
  count: 2,
  products: [
    { productId: "abc123", quantity: 2, price: 10000 },
    { productId: "def456", quantity: 1, price: 20000 }
  ]
}

📦 Order data to save: {
  orderNumber: "order_xxx",
  productsCount: 2,
  products: [...],
  totalPrice: 40000
}

✅ Order saved to Sanity successfully
📝 Saved order ID: order-id-xxx
🛒 Products saved: 2
```

#### C. Saat Fetch Orders (Browser Console)
```
🔄 Fetching orders for user: user_xxx
✅ Orders fetched: 3 orders

📦 Order 1: {
  orderNumber: "order_xxx",
  productsCount: 2,
  products: 2,
  productDetails: [
    { name: "Product A", quantity: 2, price: 10000 },
    { name: "Product B", quantity: 1, price: 20000 }
  ]
}
```

### 2. Check Sanity Studio

1. Buka Sanity Studio: `http://localhost:3000/studio`
2. Pilih **Order** dari menu
3. Buka order yang baru dibuat
4. Check field **Products**:
   - ✅ Harus ada array dengan items
   - ✅ Setiap item harus punya:
     - `product` (reference ke product)
     - `quantity` (number)
     - `priceAtPurchase` (number)

### 3. Run Check Script

```bash
npm run check-orders
```

Output yang diharapkan:
```
🔍 Checking orders in Sanity...

📊 Total orders found: 3

📦 Order 1:
   Order Number: order_xxx
   Customer: John Doe
   Status: pending
   Total: Rp 40.000
   Products Count (schema): 2
   Products Array Length: 2
   Products:
     1. Product A (2x) - Rp 10.000
        Product Ref: abc123
        Product Populated: Yes
     2. Product B (1x) - Rp 20.000
        Product Ref: def456
        Product Populated: Yes
```

## Troubleshooting

### Problem: Products Count = 0

**Check:**
1. Console log di cart page sebelum checkout
2. Pastikan `groupedItems.length > 0`
3. Pastikan setiap item punya `product._id`

**Solution:**
```typescript
// Di cart page, tambahkan validasi
if (groupedItems.length === 0) {
  toast.error("Keranjang kosong!");
  return;
}

// Check setiap product
const invalidItems = groupedItems.filter(item => !item.product._id);
if (invalidItems.length > 0) {
  console.error('Invalid items:', invalidItems);
  toast.error("Beberapa produk tidak valid!");
  return;
}
```

### Problem: Products Array Length = 0 di Sanity

**Check:**
1. Server console log saat create order
2. Pastikan `productsData.length > 0`
3. Pastikan tidak ada error saat save ke Sanity

**Solution:**
```typescript
// Di createCheckoutSession.ts
console.log('Before save:', orderData.products.length);

const savedOrder = await writeClient.create(orderData);

console.log('After save:', savedOrder._id);
console.log('Products saved:', savedOrder.products?.length);
```

### Problem: Product Reference Tidak Ter-populate

**Check:**
1. Query di `query.ts`
2. Pastikan menggunakan `product->` bukan `product`

**Solution:**
```groq
// ❌ Wrong
products[]{
  product  // Hanya return reference ID
}

// ✅ Correct
products[]{
  product->{  // Populate full product data
    _id,
    name,
    images
  }
}
```

### Problem: Product Populated = No

**Check:**
1. Product masih exist di Sanity?
2. Product ID valid?
3. Product tidak di-delete?

**Solution:**
```bash
# Check product di Sanity
npm run check-orders

# Atau query manual di Sanity Vision
*[_type == "product" && _id == "product-id-here"]
```

## Next Steps

1. **Test Checkout Flow:**
   - Tambah produk ke cart
   - Checkout
   - Check console logs
   - Verify order di `/orders`

2. **Verify Data:**
   - Run `npm run check-orders`
   - Check Sanity Studio
   - Verify products ter-populate

3. **Monitor Logs:**
   - Browser console (cart page)
   - Server console (create order)
   - Browser console (orders page)

## Summary

✅ **Fixes Applied:**
- Validasi products data sebelum save
- Enhanced logging di semua step
- Improved query dengan populate
- Debug script untuk check orders

🔍 **How to Verify:**
- Check console logs saat checkout
- Run `npm run check-orders`
- Check Sanity Studio
- Verify di `/orders` page

📝 **Expected Result:**
- Products muncul di orders page
- Setiap order punya products array
- Products ter-populate dengan data lengkap

