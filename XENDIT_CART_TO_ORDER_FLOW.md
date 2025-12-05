# 🛒der Flow - Complete Guide

Dokumentasi lengkap bagaimana data dari cart menjadi order di Sanity setelah pembayaran sukses.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   CART TO ORDER FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. 🛒 USER ADD PRODUCTS TO CART
   │
   ├─ User browse products
   ├─ Click "Add to Cart"
   └─ Cart stored in Zustand store (client-side)
   
   Cart Data:
   {
     items: [
       {
         product: {
           _id: "product_1",
           name: "Apel Fuji",
           price: 15000,
           images: [...]
         },
         quantity: 2
       },
       {
         product: {
           _id: "product_2",
           name: "Jeruk Mandarin",
           price: 20000,
           images: [...]
         },
         quantity: 1
       }
     ]
   }
   
   ↓

2. 💳 USER CHECKOUT
   │
   ├─ User fills shipping address
   ├─ User selects shipping method
   └─ Click "Proceed to Payment"
   
   ↓

3. 📝 CREATE ORDER IN SANITY (status: pending)
   │
   Function: createCheckoutSession(groupedItems, metadata)
   
   Input from Cart:
   groupedItems = [
     { product: {...}, quantity: 2 },
     { product: {...}, quantity: 1 }
   ]
   
   metadata = {
     orderNumber: "order_xxx",
     customerName: "John Doe",
     customerEmail: "john@example.com",
     clerkUserId: "user_xxx",
     address: { _id: "address_xxx", ... },
     shipperId: "shipper_xxx"
   }
   
   ↓
   
   Create Invoice di Xendit:
   POST https://api.xendit.co/v2/invoices
   {
     external_id: "order_xxx",
     amount: 50000,
     items: [
       { name: "Apel Fuji", quantity: 2, price: 15000 },
       { name: "Jeruk Mandarin", quantity: 1, price: 20000 }
     ]
   }
   
   ↓
   
   Save Order to Sanity:
   {
     _type: 'order',
     orderNumber: "order_xxx",
     clerkUserId: "user_xxx",
     customerName: "John Doe",
     email: "john@example.com",
     products: [
       {
         product: { _ref: "product_1" },
         quantity: 2,
         priceAtPurchase: 15000
       },
       {
         product: { _ref: "product_2" },
         quantity: 1,
         priceAtPurchase: 20000
       }
     ],
     totalPrice: 50000,
     status: 'pending', ← Initial status
     xenditTransactionId: "invoice_id",
     xenditStatus: 'PENDING',
     paymentUrl: "https://checkout.xendit.co/...",
     orderDate: "2024-12-05T10:00:00.000Z",
     address: { _ref: "address_xxx" },
     shipper: { _ref: "shipper_xxx" }
   }
   
   ↓

4. 🌐 USER PAYS AT XENDIT
   │
   └─ User selects payment method & pays
   
   ↓

5. ✅ PAYMENT SUCCESS
   │
   └─ Xendit sends webhook
   
   ↓

6. 🔔 WEBHOOK UPDATES ORDER (status: paid)
   │
   POST /api/webhook/callback
   
   Webhook updates order in Sanity:
   {
     ...existing order data,
     status: 'paid', ← Updated!
     xenditStatus: 'PAID',
     paymentMethod: 'BANK_TRANSFER',
     paymentChannel: 'BCA',
     paidAmount: 50000
   }
   
   ↓

7. 📦 ORDER APPEARS IN /ORDERS
   │
   Query: MY_ORDERS_QUERY
   *[_type == 'order' && clerkUserId == $userId] | order(orderDate desc) {
     ...,
     products[] {
       ...,
       product-> {
         _id,
         name,
         images,
         price
       }
     },
     address->,
     xenditStatus,
     paymentUrl
   }
   
   ↓
   
   Display in Orders Page:
   ┌─────────────────────────────────────────┐
   │ 📦 Order #order_xxx                     │
   │ 📅 5 Desember 2024                      │
   │ 🟢 Dibayar                              │
   ├─────────────────────────────────────────┤
   │ [Image] Apel Fuji                       │
   │         Jumlah: 2x        Rp 30.000     │
   │                                         │
   │ [Image] Jeruk Mandarin                  │
   │         Jumlah: 1x        Rp 20.000     │
   ├─────────────────────────────────────────┤
   │ Pengiriman: Jakarta Selatan             │
   │                                         │
   │ Total Pembayaran: Rp 50.000             │
   └─────────────────────────────────────────┘
```

---

## 🔍 Detailed Breakdown

### Step 1: Cart Data Structure

**Client-Side (Zustand Store)**

```typescript
// store.ts
interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: any[];
    // ... other product fields
  };
  quantity: number;
}

const useStore = create<StoreState>((set) => ({
  cart: [],
  addToCart: (product) => { /* ... */ },
  removeFromCart: (productId) => { /* ... */ },
  // ...
}));
```

**Example Cart Data:**

```json
{
  "cart": [
    {
      "product": {
        "_id": "product_1",
        "name": "Apel Fuji",
        "price": 15000,
        "images": ["image1.jpg"],
        "category": "Buah"
      },
      "quantity": 2
    },
    {
      "product": {
        "_id": "product_2",
        "name": "Jeruk Mandarin",
        "price": 20000,
        "images": ["image2.jpg"],
        "category": "Buah"
      },
      "quantity": 1
    }
  ]
}
```

---

### Step 3: Save Order to Sanity

**Function:** `createCheckoutSession()`

**Input:**

```typescript
groupedItems: [
  {
    product: {
      _id: "product_1",
      name: "Apel Fuji",
      price: 15000,
      category: "Buah",
      url: "http://localhost:3000/product/apel-fuji"
    },
    quantity: 2
  },
  {
    product: {
      _id: "product_2",
      name: "Jeruk Mandarin",
      price: 20000,
      category: "Buah",
      url: "http://localhost:3000/product/jeruk-mandarin"
    },
    quantity: 1
  }
]

metadata: {
  orderNumber: "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  clerkUserId: "user_2abc123",
  address: {
    _id: "address_123",
    street: "Jl. Sudirman No. 123",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12190",
    phone: "081234567890"
  },
  shipperId: "shipper_jne"
}
```

**Process:**

```typescript
// 1. Calculate total
const total = groupedItems.reduce(
  (sum, item) => sum + item.product.price * item.quantity,
  0
);
// Result: 15000 * 2 + 20000 * 1 = 50000

// 2. Create invoice at Xendit
const invoice = await xendit.createInvoice({
  external_id: "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
  amount: 50000,
  items: [
    { name: "Apel Fuji", quantity: 2, price: 15000 },
    { name: "Jeruk Mandarin", quantity: 1, price: 20000 }
  ]
});

// 3. Save order to Sanity
const orderData = {
  _type: 'order',
  orderNumber: "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
  clerkUserId: "user_2abc123",
  customerName: "John Doe",
  email: "john@example.com",
  
  // Products from cart
  products: [
    {
      _type: 'object',
      product: { _type: 'reference', _ref: "product_1" },
      quantity: 2,
      priceAtPurchase: 15000
    },
    {
      _type: 'object',
      product: { _type: 'reference', _ref: "product_2" },
      quantity: 1,
      priceAtPurchase: 20000
    }
  ],
  
  totalPrice: 50000,
  currency: 'IDR',
  status: 'pending',
  orderDate: new Date().toISOString(),
  
  // Xendit data
  xenditTransactionId: invoice.id,
  xenditStatus: invoice.status,
  paymentUrl: invoice.invoice_url,
  
  // Address & shipping
  address: { _type: 'reference', _ref: "address_123" },
  shipper: { _type: 'reference', _ref: "shipper_jne" }
};

await writeClient.create(orderData);
```

**Result in Sanity:**

```json
{
  "_id": "order_abc123",
  "_type": "order",
  "orderNumber": "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
  "clerkUserId": "user_2abc123",
  "customerName": "John Doe",
  "email": "john@example.com",
  "products": [
    {
      "_type": "object",
      "product": {
        "_ref": "product_1"
      },
      "quantity": 2,
      "priceAtPurchase": 15000
    },
    {
      "_type": "object",
      "product": {
        "_ref": "product_2"
      },
      "quantity": 1,
      "priceAtPurchase": 20000
    }
  ],
  "totalPrice": 50000,
  "currency": "IDR",
  "status": "pending",
  "orderDate": "2024-12-05T10:00:00.000Z",
  "xenditTransactionId": "65fc7522ff846905c2fc1c8d",
  "xenditStatus": "PENDING",
  "paymentUrl": "https://checkout.xendit.co/v2/65fc7522ff846905c2fc1c8d",
  "address": {
    "_ref": "address_123"
  },
  "shipper": {
    "_ref": "shipper_jne"
  }
}
```

---

### Step 6: Webhook Updates Order

**After Payment Success:**

```typescript
// Webhook receives notification
const notification = {
  id: "65fc7522ff846905c2fc1c8d",
  external_id: "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
  status: "PAID",
  amount: 50000,
  paid_amount: 50000,
  payment_method: "BANK_TRANSFER",
  payment_channel: "BCA"
};

// Update order in Sanity
await writeClient
  .patch(order._id)
  .set({
    status: "paid",
    xenditStatus: "PAID",
    paymentMethod: "BANK_TRANSFER",
    paymentChannel: "BCA",
    paidAmount: 50000
  })
  .commit();

// Reduce stock
await reduceStock(orderNumber);
```

**Updated Order in Sanity:**

```json
{
  "_id": "order_abc123",
  "_type": "order",
  "orderNumber": "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
  "status": "paid", // ← UPDATED
  "xenditStatus": "PAID", // ← UPDATED
  "paymentMethod": "BANK_TRANSFER", // ← ADDED
  "paymentChannel": "BCA", // ← ADDED
  "paidAmount": 50000, // ← ADDED
  "products": [
    {
      "product": { "_ref": "product_1" },
      "quantity": 2,
      "priceAtPurchase": 15000
    },
    {
      "product": { "_ref": "product_2" },
      "quantity": 1,
      "priceAtPurchase": 20000
    }
  ],
  "totalPrice": 50000
  // ... other fields
}
```

---

### Step 7: Display in Orders Page

**Query:**

```typescript
// MY_ORDERS_QUERY
*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc) {
  ...,
  products[] {
    ...,
    product-> {
      _id,
      name,
      images,
      price,
      slug
    }
  },
  address->,
  xenditStatus,
  paymentUrl
}
```

**Result:**

```json
[
  {
    "_id": "order_abc123",
    "orderNumber": "order_0872ab00-c6ff-4245-b0a8-f89d611277a2",
    "status": "paid",
    "orderDate": "2024-12-05T10:00:00.000Z",
    "totalPrice": 50000,
    "products": [
      {
        "quantity": 2,
        "priceAtPurchase": 15000,
        "product": {
          "_id": "product_1",
          "name": "Apel Fuji",
          "images": ["image1.jpg"],
          "price": 15000
        }
      },
      {
        "quantity": 1,
        "priceAtPurchase": 20000,
        "product": {
          "_id": "product_2",
          "name": "Jeruk Mandarin",
          "images": ["image2.jpg"],
          "price": 20000
        }
      }
    ],
    "address": {
      "city": "Jakarta Selatan",
      "street": "Jl. Sudirman No. 123"
    }
  }
]
```

**Display:**

```tsx
{orders.map((order) => (
  <Card key={order._id}>
    <CardHeader>
      <CardTitle>Order #{order.orderNumber}</CardTitle>
      <Badge>Dibayar</Badge>
    </CardHeader>
    <CardContent>
      {/* Products from cart */}
      {order.products.map((item, index) => (
        <div key={index}>
          <Image src={item.product.images[0]} />
          <p>{item.product.name}</p>
          <p>Jumlah: {item.quantity}x</p>
          <PriceFormatter amount={item.priceAtPurchase * item.quantity} />
        </div>
      ))}
      
      {/* Total */}
      <PriceFormatter amount={order.totalPrice} />
    </CardContent>
  </Card>
))}
```

---

## ✅ Summary

**Cart to Order Flow:**

1. ✅ User adds products to cart (Zustand store)
2. ✅ User checkout with address & shipping
3. ✅ **Order created in Sanity** with cart data (status: pending)
4. ✅ Invoice created in Xendit
5. ✅ User pays at Xendit
6. ✅ Webhook updates order (status: paid)
7. ✅ **Order displayed in /orders** with all product details

**Key Points:**

- ✅ Cart data (products, quantities) saved to Sanity as order
- ✅ Order includes product references, quantities, prices
- ✅ Order status: pending → paid (after payment)
- ✅ Orders page fetches from Sanity with product details
- ✅ All cart items displayed in orders with images, names, prices

---

**Last Updated**: December 2024

