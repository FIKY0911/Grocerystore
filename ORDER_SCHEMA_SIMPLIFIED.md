# 📋 Order Schema - Simplified Version

Schema Order yang sudah diperpendek dengan hanya field essential.

---

## 🎯 Schema Structure

### Groups (Tabs di Sanity Studio)

1. **Basic Info** - Order number, status, date
2. **Customer** - Customer details
3. **Products** - Products in order
4. **Shipping** - Address & shipper
5. **Payment** - Payment details

---

## 📝 Fields

### Basic Info
```typescript
- orderNumber: string (required, readOnly)
- status: "pending" | "paid" | "cancelled" (required)
- orderDate: datetime (required)
```

### Customer
```typescript
- clerkUserId: string (required, readOnly)
- customerName: string (required)
- email: string (required, email format)
```

### Products
```typescript
- products: array of {
    product: reference to Product (required)
    quantity: number (required, min: 1)
    priceAtPurchase: number (required, min: 0)
  }
```

### Shipping
```typescript
- address: reference to Address (required)
- shipper: reference to Shipper (required)
- shippingCost: number (default: 0)
```

### Payment
```typescript
- totalPrice: number (required, min: 1000)
- currency: string (default: "IDR")
- amountDiscount: number (default: 0)
- xenditTransactionId: string (required, readOnly)
- xenditStatus: string (required, readOnly)
- paymentUrl: url (required)
- expiryDate: datetime (required)
```

---

## 🔄 Data Flow

### From Cart to Order

```typescript
// Cart data
{
  selectedAddress: Address,
  selectedShipper: Shipper,
  groupedItems: [
    { product: Product, quantity: number }
  ]
}

// Create order
{
  _type: "order",
  orderNumber: "order_xxx",
  clerkUserId: user.id,
  customerName: user.fullName,
  email: user.email,
  
  // Products from cart
  products: [
    {
      product: { _ref: product._id },
      quantity: 2,
      priceAtPurchase: 15000
    }
  ],
  
  // Shipping from cart
  address: { _ref: selectedAddress._id },
  shipper: { _ref: selectedShipper._id },
  shippingCost: 0,
  
  // Payment
  totalPrice: 30000,
  currency: "IDR",
  amountDiscount: 0,
  status: "pending",
  
  // Xendit
  xenditTransactionId: invoice.id,
  xenditStatus: invoice.status,
  paymentUrl: invoice.invoice_url,
  expiryDate: invoice.expiry_date,
  
  orderDate: new Date().toISOString()
}
```

---

## 🎨 Preview in Sanity Studio

```
Title: 🟡 order_xxx-xxx-xxx...
Subtitle: John Doe • Rp 50.000 • 5 Des 2024
Description: 📍 Rumah • 🚚 JNE
```

---

## 📊 Comparison

### Before (Long Schema)
- 30+ fields
- Many Xendit-specific fields
- Complex nested objects
- Hard to maintain

### After (Simplified)
- 17 fields only
- Essential fields only
- Clean structure
- Easy to maintain

---

## ✅ Benefits

1. **Simpler** - Easier to understand
2. **Faster** - Less data to save/query
3. **Cleaner** - No unnecessary fields
4. **Maintainable** - Easy to update

---

## 🔧 What Was Removed

Removed Xendit-specific fields:
- ❌ availableBanks
- ❌ availableRetailOutlets
- ❌ availableEwallets
- ❌ availableQRCodes
- ❌ availableDirectDebits
- ❌ availablePaylaters
- ❌ shouldExcludeCreditCard
- ❌ shouldSendEmail
- ❌ merchantName
- ❌ merchantProfilePictureUrl
- ❌ fees
- ❌ items
- ❌ successRedirectUrl
- ❌ failureRedirectUrl

**Why?** These fields are Xendit-specific and not needed for order management.

---

## 📝 Summary

**Essential Fields Only:**
- ✅ Order info (number, status, date)
- ✅ Customer info (name, email, userId)
- ✅ Products (with quantity & price)
- ✅ Shipping (address & shipper)
- ✅ Payment (total, Xendit ID, payment URL)

**Total**: 17 fields vs 30+ fields before

---

**Last Updated**: December 2024
**Version**: 2.0.0 (Simplified)
