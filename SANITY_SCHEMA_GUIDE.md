# 📋 Sanity Schema Guide - Order, Address & Shipper

Panduan lengkap schema Sanity untuk Order dengan Address dan Shipper.

---

## 🏗️ Schema Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SCHEMA RELATIONSHIPS                      │
└─────────────────────────────────────────────────────────────┘

Order (document)
├── orderNumber: string
├── clerkUserId: string
├── customerName: string
├── email: string
├── products: array
│   └── [
│       {
│         product: reference → Product
│         quantity: number
│         priceAtPurchase: number
│       }
│     ]
├── totalPrice: number
├── currency: string
├── amountDiscount: number
├── address: reference → Address ✅
├── shipper: reference → Shipper ✅
├── status: string (pending/paid/cancelled)
├── orderDate: datetime
└── ... (xendit fields)

Address (document)
├── name: string (Rumah, Kantor, dll)
├── email: email
├── address: string (alamat lengkap)
├── phone: string (nomor telepon) ✅ NEW
├── city: string
├── state: string (provinsi)
├── zip: string (kode pos)
├── default: boolean
└── createdAt: datetime

Shipper (document)
├── name: string (JNE, JNT, dll)
├── slug: slug
├── logo: image
└── isActive: boolean
```

---

## 📝 Schema Details

### 1. Address Schema

**File**: `sanity/schemaTypes/addressType.ts`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Nama alamat (Rumah, Kantor) |
| email | email | ❌ | Email user |
| address | string | ✅ | Alamat lengkap (min 5, max 200 char) |
| phone | string | ✅ | Nomor telepon (format: 081234567890) |
| city | string | ✅ | Kota/Kabupaten |
| state | string | ✅ | Provinsi (dropdown 38 provinsi) |
| zip | string | ✅ | Kode pos (5 digit) |
| default | boolean | ❌ | Alamat utama? (default: false) |
| createdAt | datetime | ❌ | Tanggal dibuat |

**Validation**:
- Address: min 5 char, max 200 char
- Phone: regex `/^(\+62|62|0)[0-9]{9,12}$/`
- Zip: regex `/^\d{5}$/` (5 digit angka)
- State: dropdown dari 38 provinsi Indonesia

**Preview**:
```
Title: Rumah (Utama)
Subtitle: Jl. Sudirman No. 123, Jakarta, DKI Jakarta
```

---

### 2. Shipper Schema

**File**: `sanity/schemaTypes/shippingServices.ts`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Nama kurir (JNE, JNT, SiCepat) |
| slug | slug | ✅ | Slug dari name |
| logo | image | ❌ | Logo kurir |
| isActive | boolean | ❌ | Aktif? (default: true) |

**Preview**:
```
Title: JNE
Media: [logo image]
```

---

### 3. Order Schema

**File**: `sanity/schemaTypes/orderType.ts`

**Key Fields for Address & Shipper**:

```typescript
defineField({
  name: "address",
  type: "reference",
  to: [{ type: "address" }],
  title: "Address",
  validation: (Rule) => Rule.required(),
}),

defineField({
  name: "shipper",
  type: "reference",
  to: [{ type: "shipper" }],
  title: "Shipper",
  validation: (Rule) => Rule.required(),
}),
```

**Reference Behavior**:
- `address` → References Address document
- `shipper` → References Shipper document
- Both are **required** fields
- Stored as `{ _ref: "document_id" }`

---

## 🔄 Data Flow

### From Cart to Order

```typescript
// 1. User selects address in cart
const selectedAddress: Address = {
  _id: "address_123",
  name: "Rumah",
  address: "Jl. Sudirman No. 123",
  phone: "081234567890",
  city: "Jakarta",
  state: "DKI Jakarta",
  zip: "12190",
  default: true,
  createdAt: "2024-12-05T..."
};

// 2. User selects shipper in cart
const selectedShipper = {
  _id: "shipper_jne",
  name: "JNE",
  slug: { current: "jne" },
  logo: {...},
  isActive: true
};

// 3. Create order with references
const orderData = {
  _type: "order",
  orderNumber: "order_xxx",
  // ... other fields
  address: {
    _type: "reference",
    _ref: "address_123"  // ← Reference to address
  },
  shipper: {
    _type: "reference",
    _ref: "shipper_jne"  // ← Reference to shipper
  }
};

// 4. Save to Sanity
await writeClient.create(orderData);
```

---

## 📊 Query Examples

### Query Order with Address & Shipper

```groq
*[_type == 'order' && clerkUserId == $userId] {
  _id,
  orderNumber,
  orderDate,
  totalPrice,
  status,
  
  // Resolve address reference
  address-> {
    _id,
    name,
    address,
    phone,
    city,
    state,
    zip
  },
  
  // Resolve shipper reference
  shipper-> {
    _id,
    name,
    logo
  },
  
  // Resolve product references
  products[] {
    quantity,
    priceAtPurchase,
    product-> {
      _id,
      name,
      images
    }
  }
}
```

**Result**:
```json
{
  "_id": "order_abc123",
  "orderNumber": "order_xxx",
  "orderDate": "2024-12-05T...",
  "totalPrice": 50000,
  "status": "paid",
  
  "address": {
    "_id": "address_123",
    "name": "Rumah",
    "address": "Jl. Sudirman No. 123",
    "phone": "081234567890",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "zip": "12190"
  },
  
  "shipper": {
    "_id": "shipper_jne",
    "name": "JNE",
    "logo": {...}
  },
  
  "products": [...]
}
```

---

## 🎨 Display in UI

### OrderCard Component

```tsx
<OrderCard order={order}>
  {/* Address Display */}
  {order.address && (
    <div>
      <MapPin className="w-4 h-4" />
      <div>
        <p>{order.address.name}</p>
        <p>{order.address.address}, {order.address.city}</p>
        <p>{order.address.phone}</p>
      </div>
    </div>
  )}
  
  {/* Shipper Display */}
  {order.shipper && (
    <div>
      <Truck className="w-4 h-4" />
      <p>{order.shipper.name}</p>
    </div>
  )}
</OrderCard>
```

---

## 🔧 Setup Instructions

### 1. Create Address in Sanity Studio

1. Go to Sanity Studio: `http://localhost:3000/studio`
2. Click **"Addresses"** in sidebar
3. Click **"Create new Address"**
4. Fill form:
   - Name: `Rumah`
   - Address: `Jl. Sudirman No. 123`
   - Phone: `081234567890`
   - City: `Jakarta`
   - State: `DKI Jakarta` (dropdown)
   - Zip: `12190`
   - Default: ✅ (check)
5. Click **"Publish"**

### 2. Create Shipper in Sanity Studio

1. Go to Sanity Studio
2. Click **"Jasa Pengiriman"** in sidebar
3. Click **"Create new Shipper"**
4. Fill form:
   - Name: `JNE`
   - Slug: `jne` (auto-generate)
   - Logo: Upload image (optional)
   - Active: ✅ (check)
5. Click **"Publish"**

Repeat for other shippers: JNT, SiCepat, Pos Indonesia, dll.

---

## ✅ Validation Rules

### Address Validation

```typescript
// Phone number
/^(\+62|62|0)[0-9]{9,12}$/
// Valid: 081234567890, +6281234567890, 6281234567890
// Invalid: 12345, 08123 (too short)

// Zip code
/^\d{5}$/
// Valid: 12190, 40123
// Invalid: 1234 (too short), 123456 (too long)

// Address length
min: 5 characters
max: 200 characters
```

### Shipper Validation

```typescript
// Name: required
// Slug: required, auto-generate from name
// isActive: default true
```

---

## 🧪 Testing

### Test Address Creation

```bash
1. Go to /address
2. Click "Tambah Alamat Baru"
3. Fill all fields
4. Submit
5. ✅ Address created in Sanity
6. ✅ Appears in address list
```

### Test Order with Address & Shipper

```bash
1. Add products to cart
2. Go to /cart
3. Select address (dropdown)
4. Select shipper (radio buttons)
5. Checkout
6. ✅ Order created with address & shipper references
7. Go to Sanity Studio → Orders
8. Click order
9. ✅ Address reference shows address details
10. ✅ Shipper reference shows shipper details
```

---

## 📝 Summary

### Schema Structure:
- ✅ **Address**: Standalone document dengan phone field
- ✅ **Shipper**: Standalone document dengan logo
- ✅ **Order**: References address & shipper

### Benefits:
- ✅ Reusable addresses (user bisa punya multiple addresses)
- ✅ Centralized shippers (easy to manage)
- ✅ Clean data structure (no duplication)
- ✅ Easy to query (GROQ with `->`)

### Files:
- `sanity/schemaTypes/addressType.ts` - Address schema
- `sanity/schemaTypes/shippingServices.ts` - Shipper schema
- `sanity/schemaTypes/orderType.ts` - Order schema with references

---

**Last Updated**: December 2024
**Version**: 1.0.0
