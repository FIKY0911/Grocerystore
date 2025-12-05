# Fix Sanity Permission Error - Orders

## ❌ Error
```
⚠️ Failed to save order to Sanity: transaction failed: 
Insufficient permissions; permission "create" required
```

## 🔍 Root Cause
Token `NEXT_PUBLIC_SANITY_WRITE_TOKEN` tidak memiliki permission untuk **create** documents di Sanity.

## ✅ Solution Applied

### 1. Update writeClient.ts
Menggunakan `E_READ_TOKEN` yang memiliki permission lebih lengkap:

```typescript
// Prioritas token: SANITY_WRITE_READ_TOKEN > NEXT_PUBLIC_SANITY_WRITE_TOKEN
const writeToken = process.env.SANITY_WRITE_READ_TOKEN || 
                   process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN;
```

### 2. Token Priority
1. **SANITY_WRITE_READ_TOKEN** (Primary) - Full permissions (create, read, update, delete)
2. **NEXT_PUBLIC_SANITY_WRITE_TOKEN** (Fallback) - Limited permissions

## 🧪 Testing

### 1. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 2. Check Console Log
Saat server start, harus muncul:
```
🔑 Using Sanity token: skDujDIN1l...
```

### 3. Test Checkout
1. Add products ke cart
2. Checkout
3. Check server console

**Expected Output:**
```
💾 Saving order data to Sanity...
✅ Order saved to Sanity successfully
📝 Saved order ID: order-id-xxx
🛒 Products saved: 1
```

**No More Error:**
```
❌ ⚠️ Failed to save order to Sanity: Insufficient permissions
```

## 🔧 Alternative Solutions

### Option 1: Generate New Token di Sanity (Recommended)

1. **Login ke Sanity Management:**
   - Buka: https://www.sanity.io/manage
   - Login dengan akun Anda

2. **Pilih Project:**
   - Pilih project: `grocerystore` (ID: 4pdrsxhm)

3. **Generate Token:**
   - Klik **API** di sidebar
   - Klik **Tokens** tab
   - Klik **Add API token**

4. **Configure Token:**
   - **Name:** `Write Token for Orders`
   - **Permissions:** **Editor** (atau **Administrator**)
   - Klik **Add token**

5. **Copy Token:**
   - Copy token yang baru dibuat
   - **PENTING:** Token hanya ditampilkan sekali!

6. **Update .env:**
   ```env
   SANITY_WRITE_READ_TOKEN=sk_new_token_here...
   ```

7. **Restart Server:**
   ```bash
   npm run dev
   ```

### Option 2: Update Existing Token Permissions

1. **Login ke Sanity Management:**
   - https://www.sanity.io/manage

2. **Check Token Permissions:**
   - API → Tokens
   - Cari token yang sedang digunakan
   - Check permissions

3. **Update Permissions:**
   - Jika permission = **Viewer** → Upgrade ke **Editor**
   - Jika permission = **Custom** → Enable **create** permission

4. **Restart Server:**
   ```bash
   npm run dev
   ```

## 📋 Token Permissions Explained

### Viewer (Read Only)
- ✅ Read documents
- ❌ Create documents
- ❌ Update documents
- ❌ Delete documents

### Editor (Read + Write)
- ✅ Read documents
- ✅ Create documents
- ✅ Update documents
- ✅ Delete documents (own documents)

### Administrator (Full Access)
- ✅ Read documents
- ✅ Create documents
- ✅ Update documents
- ✅ Delete documents (all)
- ✅ Manage project settings

## 🔍 Verify Token Permissions

### Method 1: Test Create Document
```bash
# Run this in terminal
curl -X POST https://4pdrsxhm.api.sanity.io/v2025-10-10/data/mutate/production \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "mutations": [{
      "create": {
        "_type": "order",
        "orderNumber": "test_order",
        "status": "pending"
      }
    }]
  }'
```

**Success Response:**
```json
{
  "transactionId": "...",
  "results": [...]
}
```

**Error Response:**
```json
{
  "error": {
    "description": "Insufficient permissions; permission \"create\" required"
  }
}
```

### Method 2: Check in Sanity Studio
1. Buka: http://localhost:3000/studio
2. Try create new Order document
3. Jika bisa create → Token OK
4. Jika error → Token tidak punya permission

## 🚨 Important Notes

### 1. Token Security
- ❌ **JANGAN** commit token ke Git
- ✅ Token harus di `.env` (sudah di `.gitignore`)
- ✅ Update token di Vercel environment variables

### 2. Update Vercel Environment Variables
Jika deploy di Vercel:

1. **Buka Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Pilih Project:**
   - grocerystore-rpl-kel13

3. **Settings → Environment Variables:**
   - Update `SANITY_WRITE_READ_TOKEN` dengan token baru
   - Atau tambahkan jika belum ada

4. **Redeploy:**
   - Klik **Redeploy** untuk apply changes

### 3. Token Rotation
Jika generate token baru:
1. Update di `.env` (local)
2. Update di Vercel (production)
3. Restart dev server
4. Test checkout

## ✅ Success Criteria

Setelah fix, checkout harus:
1. ✅ Create invoice di Xendit
2. ✅ Save order ke Sanity (no error)
3. ✅ Order muncul di `/orders` page
4. ✅ Products ter-populate dengan benar

## 📝 Checklist

- [x] Update `writeClient.ts` untuk gunakan `SANITY_WRITE_READ_TOKEN`
- [ ] Restart dev server
- [ ] Test checkout
- [ ] Verify order saved di Sanity
- [ ] Check `/orders` page
- [ ] (Optional) Generate new token dengan Editor permission
- [ ] (Optional) Update Vercel environment variables

## 🎉 Expected Result

**Before Fix:**
```
⚠️ Failed to save order to Sanity: Insufficient permissions
📝 Invoice sudah dibuat di Xendit, tetap return payment URL
```

**After Fix:**
```
✅ Order saved to Sanity successfully
📝 Saved order ID: order-id-xxx
🛒 Products saved: 1
```

---

**Note:** Jika `SANITY_WRITE_READ_TOKEN` juga tidak punya permission, Anda harus generate token baru di Sanity Management dengan permission **Editor** atau **Administrator**.

