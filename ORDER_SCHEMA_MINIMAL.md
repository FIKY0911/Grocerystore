# 📋 Order Schema - Minimal Version

Schema Order yang sangat minimal dengan hanya field essential.

---

## 📝 Fields (8 total)

```typescript
{
  orderNumber: string,        // Order number
  customerName: string,       // Customer name
  email: string,              // Customer email
  products: [                 // Products array
    {
      product: reference,     // Reference to product
      quantity: number        // Quantity
    }
  ],
  address: reference,         // Reference to address
  shipper: reference,         // Reference to shipper
  status: string,             // pending | paid | cancelled
  orderDate: datetime         // Order date
}
```

---

## 🎯 What's Included

✅ **Order Number** - Unique identifier
✅ **Customer Name** - From cart
✅ **Email** - From cart
✅ **Products** - Product reference + quantity
✅ **Address** - Shipping address reference
✅ **Shipper** - Shipping service reference
✅ **Status** - Order status
✅ **Order Date** - When order created

---

## ❌ What's Removed

- ❌ clerkUserId
- ❌ totalPrice
- ❌ currency
- ❌ amountDiscount
- ❌ shippingCost
- ❌ priceAtPurchase
- ❌ xenditTransactionId
- ❌ xenditStatus
- ❌ paymentUrl
- ❌ expiryDate

---

## 🔄 Data Flow

```typescript
// From Cart
{
  customerName: "John Doe",
  email: "john@example.com",
  selectedAddress: Address,
  selectedShipper: Shipper,
  groupedItems: [
    { product: Product, quantity: 2 }
  ]
}

// To Sanity
{
  _type: "order",
  orderNumber: "order_xxx",
  customerName: "John Doe",
  email: "john@example.com",
  products: [
    {
      product: { _ref: "product_123" },
      quantity: 2
    }
  ],
  address: { _ref: "address_123" },
  shipper: { _ref: "shipper_jne" },
  status: "pending",
  orderDate: "2024-12-05T..."
}
```

---

## 📊 Query Example

```groq
*[_type == 'order'] {
  orderNumber,
  customerName,
  email,
  status,
  orderDate,
  products[] {
    quantity,
    product-> {
      name,
      images
    }
  },
  address-> {
    name,
    address,
    city
  },
  shipper-> {
    name
  }
}
```

---

## ✅ Benefits

1. **Super Simple** - Only 8 fields
2. **Easy to Understand** - No complex nested objects
3. **Fast** - Less data to save/query
4. **Clean** - Only what you need

---

**Total Fields**: 8 (vs 17 before, vs 30+ original)

---

**Last Updated**: December 2024
**Version**: 3.0.0 (Minimal)
