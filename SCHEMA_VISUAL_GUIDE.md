# 🎨 Visual Schema Guide

Panduan visual untuk memahami relationship schema Order, Address, dan Shipper.
--

## 📊 Schema Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORDER SCHEMA                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Order Document                                          │    │
│  │ _id: "order_abc123"                                     │    │
│  │ orderNumber: "order_xxx-xxx-xxx"                        │    │
│  │ clerkUserId: "user_123"                                 │    │
│  │ customerName: "John Doe"                                │    │
│  │ email: "john@example.com"                               │    │
│  │ totalPrice: 50000                                       │    │
│  │ status: "pending"                                       │    │
│  │                                                          │    │
│  │ ┌────────────────────────────────────────────┐         │    │
│  │ │ products: [                                 │         │    │
│  │ │   {                                         │         │    │
│  │ │     product: { _ref: "product_1" } ────────┼─────────┼────┼──→ Product
│  │ │     quantity: 2                             │         │    │
│  │ │     priceAtPurchase: 15000                  │         │    │
│  │ │   }                                         │         │    │
│  │ │ ]                                           │         │    │
│  │ └────────────────────────────────────────────┘         │    │
│  │                                                          │    │
│  │ address: { _ref: "address_123" } ─────────────────────┼────┼──→ Address
│  │                                                          │    │
│  │ shipper: { _ref: "shipper_jne" } ─────────────────────┼────┼──→ Shipper
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

                              ↓                    ↓
                              
┌──────────────────────────┐         ┌──────────────────────────┐
│   ADDRESS DOCUMENT       │         │   SHIPPER DOCUMENT       │
│                          │         │                          │
│  _id: "address_123"      │         │  _id: "shipper_jne"      │
│  name: "Rumah"           │         │  name: "JNE"             │
│  address: "Jl. Sudirman" │         │  slug: "jne"             │
│  phone: "081234567890"   │         │  logo: {...}             │
│  city: "Jakarta"         │         │  isActive: true          │
│  state: "DKI Jakarta"    │         │                          │
│  zip: "12190"            │         │                          │
│  default: true           │         │                          │
└──────────────────────────┘         └──────────────────────────┘
```

---

## 🔄 Data Flow Visualization

### Step 1: User Selects Address & Shipper

```
┌─────────────────────────────────────────────────────────────┐
│                      CART PAGE                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Alamat Pengiriman                                   │    │
│  │ ○ Rumah                                             │    │
│  │   Jl. Sudirman No. 123, Jakarta                     │    │
│  │   081234567890                                       │    │
│  │                                                      │    │
│  │ ● Kantor                                            │    │
│  │   Jl. Thamrin No. 456, Jakarta                      │    │
│  │   081234567891                                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Jasa Pengiriman                                     │    │
│  │ ● JNE                                               │    │
│  │ ○ JNT                                               │    │
│  │ ○ SiCepat                                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Buat Invoice Pembayaran]                                  │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Create Order with References

```typescript
// Selected data
selectedAddress = {
  _id: "address_123",
  name: "Kantor",
  address: "Jl. Thamrin No. 456",
  phone: "081234567891",
  city: "Jakarta",
  state: "DKI Jakarta",
  zip: "10110"
}

selectedShipper = {
  _id: "shipper_jne",
  name: "JNE"
}

// Create order
orderData = {
  _type: "order",
  orderNumber: "order_xxx",
  // ... other fields
  
  // Store as references (not full objects)
  address: {
    _type: "reference",
    _ref: "address_123"  // ← Only store ID
  },
  shipper: {
    _type: "reference",
    _ref: "shipper_jne"  // ← Only store ID
  }
}
```

### Step 3: Query Order with Resolved References

```groq
// Query
*[_type == 'order'][0] {
  ...,
  address->,  // ← Resolve reference
  shipper->   // ← Resolve reference
}

// Result
{
  "_id": "order_abc123",
  "orderNumber": "order_xxx",
  
  // Full address object (resolved)
  "address": {
    "_id": "address_123",
    "name": "Kantor",
    "address": "Jl. Thamrin No. 456",
    "phone": "081234567891",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "zip": "10110"
  },
  
  // Full shipper object (resolved)
  "shipper": {
    "_id": "shipper_jne",
    "name": "JNE",
    "logo": {...}
  }
}
```

---

## 📱 UI Display Examples

### Order Card - Grid View

```
┌─────────────────────────────────────────────────────────┐
│ 📦 Order #order_xxx...                    🟡 Pending    │
│ 📅 5 Desember 2024                                      │
├─────────────────────────────────────────────────────────┤
│ [IMG] Apel Fuji                          Rp 30.000     │
│       Qty: 2x @ Rp 15.000                               │
│                                                          │
│ [IMG] Jeruk Mandarin                     Rp 20.000     │
│       Qty: 1x @ Rp 20.000                               │
├─────────────────────────────────────────────────────────┤
│ 📍 Kantor                                               │
│    Jl. Thamrin No. 456, Jakarta                         │
│    081234567891                                          │
│                                                          │
│ 🚚 JNE                                                  │
├─────────────────────────────────────────────────────────┤
│ Total                                    Rp 50.000      │
├─────────────────────────────────────────────────────────┤
│ [💳 Bayar Sekarang]                                     │
│ [🛒 Pesan Lagi]                                         │
└─────────────────────────────────────────────────────────┘
```

### Order Table - Table View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Order Number  │ Date      │ Products      │ Total     │ Status  │ Payment   │
├──────────────────────────────────────────────────────────────────────────────┤
│ order_xxx...  │ 5 Des     │ • Apel (2x)   │ Rp 50.000 │ Pending │ 💳 Bayar  │
│ inv_xxx...    │ 2024      │ • Jeruk (1x)  │           │         │           │
│               │           │               │           │         │           │
│ 📍 Kantor, Jakarta                                                           │
│ 🚚 JNE                                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Benefits of Reference Schema

### 1. Data Normalization ✅

**Without References (Bad)**:
```json
{
  "order": {
    "address": {
      "name": "Rumah",
      "address": "Jl. Sudirman No. 123",
      "city": "Jakarta",
      // ... duplicate data in every order
    }
  }
}
```

**With References (Good)**:
```json
{
  "order": {
    "address": { "_ref": "address_123" }  // ← Just reference
  }
}
```

### 2. Easy Updates ✅

Update address once → All orders automatically updated

```
User updates address:
  "Jl. Sudirman No. 123" → "Jl. Sudirman No. 456"

All orders with address_123 reference:
  ✅ Automatically show new address
```

### 3. Reusability ✅

```
User has 3 addresses:
  - Rumah (address_123)
  - Kantor (address_456)
  - Kos (address_789)

Orders can reference any of them:
  Order 1 → address_123 (Rumah)
  Order 2 → address_456 (Kantor)
  Order 3 → address_123 (Rumah)  ← Reuse!
```

### 4. Centralized Management ✅

```
Manage shippers in one place:
  - Add new shipper → Available for all orders
  - Deactivate shipper → isActive: false
  - Update logo → All orders show new logo
```

---

## 🔍 Query Patterns

### Pattern 1: Get Order with Full Details

```groq
*[_type == 'order' && _id == $orderId][0] {
  ...,
  address-> {
    name,
    address,
    phone,
    city,
    state,
    zip
  },
  shipper-> {
    name,
    logo
  },
  products[] {
    quantity,
    priceAtPurchase,
    product-> {
      name,
      images,
      slug
    }
  }
}
```

### Pattern 2: Get All Orders for User

```groq
*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc) {
  _id,
  orderNumber,
  orderDate,
  totalPrice,
  status,
  address->,
  shipper->,
  products[]->
}
```

### Pattern 3: Get Orders by Address

```groq
*[_type == 'order' && address._ref == $addressId] {
  orderNumber,
  orderDate,
  totalPrice,
  status
}
```

---

## 📝 Summary

### Schema Structure:
```
Order (main document)
  ├── address (reference) → Address document
  ├── shipper (reference) → Shipper document
  └── products (array of references) → Product documents
```

### Key Points:
- ✅ References stored as `{ _ref: "document_id" }`
- ✅ Query with `->` to resolve references
- ✅ Normalized data (no duplication)
- ✅ Easy to update and maintain
- ✅ Reusable addresses and shippers

### Files:
- `sanity/schemaTypes/addressType.ts` - Address schema with phone
- `sanity/schemaTypes/shippingServices.ts` - Shipper schema
- `sanity/schemaTypes/orderType.ts` - Order schema with references

---

**Last Updated**: December 2024
