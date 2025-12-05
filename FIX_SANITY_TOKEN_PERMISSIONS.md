# Fix Sanity Token Permissions

## ❌ Problem

```
❌ Error: Insufficient permissions; permission "update" required
```

Token `SANITY_WRITE_READ_TOKEN` tidak punya permission untuk **update** documents.

## 🔍rent Permissions

Token saat ini hanya bisa:
- ✅ Create documents
- ❌ Update documents (MISSING!)
- ❌ Delete documents

## ✅ Solution: Generate New Token

### Step 1: Login ke Sanity Management

1. Buka: https://www.sanity.io/manage
2. Login dengan akun Anda

### Step 2: Pilih Project

- Cari project: **grocerystore**
- Project ID: `4pdrsxhm`
- Klik untuk masuk

### Step 3: Navigate to API Tokens

1. Klik **API** di sidebar kiri
2. Klik **Tokens** tab

### Step 4: Add New Token

1. Klik **Add API token** button
2. Fill in details:
   - **Name:** `Full Access Token for Orders`
   - **Permissions:** Select **Editor** (recommended) atau **Administrator**

### Step 5: Copy Token

1. Klik **Add token**
2. **IMPORTANT:** Copy token immediately!
3. Token format: `sk...` (starts with `sk`)
4. Token hanya ditampilkan sekali!

### Step 6: Update .env File

Replace token lama dengan token baru:

```env
# OLD (insufficient permissions)
# SANITY_WRITE_READ_TOKEN=skDujDIN1layUpXu8LDXzHhPhz9ws00t2QftAyRPCwjmLHyeUIdoN6tdyBdSuQdUjtFhGWPEtfrASMsPOAUZgkaF2NfzsRbL7SSfVV42KStjiD70rFpnQNTOTdrpE4cOIQFkCH4i5g9ASLbC21NbgwBZkF6FCIinx1iEwKiPajB9BhYHCEUb

# NEW (full permissions)
SANITY_WRITE_READ_TOKEN=YOUR_NEW_TOKEN_HERE
```

### Step 7: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 8: Test Token

```bash
npm run test-webhook
```

**Expected Output:**
```
🧪 Testing Webhook - Manual Status Update

📦 Found pending order:
   Order Number: order_xxx
   Current Status: pending

💾 Updating status to "paid"...
✅ Order updated successfully!

📊 New Status:
   status: paid
   xenditStatus: PAID

🎉 Test complete!
```

## 📊 Token Permissions Comparison

### Viewer (Read Only)
- ✅ Read documents
- ❌ Create documents
- ❌ Update documents
- ❌ Delete documents

### Editor (Recommended)
- ✅ Read documents
- ✅ Create documents
- ✅ Update documents ← **NEEDED!**
- ✅ Delete documents (own)

### Administrator (Full Access)
- ✅ Read documents
- ✅ Create documents
- ✅ Update documents ← **NEEDED!**
- ✅ Delete documents (all)
- ✅ Manage project settings

## 🧪 Testing After Fix

### Test 1: Manual Update
```bash
npm run test-webhook
```

Should show:
```
✅ Order updated successfully!
```

### Test 2: Check Orders Page
1. Go to: `http://localhost:3000/orders`
2. Status should change from "Menunggu" to "Lunas"

### Test 3: Check Sanity Studio
1. Open: `http://localhost:3000/studio`
2. Orders → Find order
3. Status should be "paid"

## 🔐 Security Notes

### Token Storage
- ✅ Store in `.env` file (already in `.gitignore`)
- ❌ Never commit to Git
- ❌ Never share publicly

### Token Rotation
If you need to rotate token:
1. Generate new token in Sanity
2. Update `.env` file
3. Restart dev server
4. Delete old token in Sanity

### Production Deployment
Update token in Vercel:
1. Vercel Dashboard → Project → Settings
2. Environment Variables
3. Update `SANITY_WRITE_READ_TOKEN`
4. Redeploy

## ✅ Success Criteria

After fixing token:
1. ✅ `npm run test-webhook` succeeds
2. ✅ Status updates from "pending" to "paid"
3. ✅ Webhook can update order status
4. ✅ No "Insufficient permissions" error

## 📝 Checklist

- [ ] Login to Sanity Management
- [ ] Navigate to API → Tokens
- [ ] Generate new token with Editor permission
- [ ] Copy token
- [ ] Update SANITY_WRITE_READ_TOKEN in .env
- [ ] Restart dev server
- [ ] Run `npm run test-webhook`
- [ ] Verify status changed to "paid"
- [ ] Test real payment flow

## 🎯 Expected Result

**Before Fix:**
```
❌ Error: Insufficient permissions; permission "update" required
```

**After Fix:**
```
✅ Order updated successfully!
📊 New Status: paid
```

---

**Next:** After generating new token, run `npm run test-webhook` to verify! 🎉

