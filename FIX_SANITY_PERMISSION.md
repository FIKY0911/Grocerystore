# 🚨 Quick Fix: Sanity Permission Error

## Problem
```
⚠️ Failed to save order to Sanity: 
Insufficient permissions; permission "create" required
```

## Quick Fix (5 menit)

### 1. Buka Sanity Dashboard
```
https://sanity.io/manage
```

### 2. Pilih Project
- Klik project: **grocerystore**

### 3. Create Token Baru
- Sidebar → **API** → **Tokens**
- Klik **"Add API token"**
- Label: `Production Write Token`
- **Permission: EDITOR** ⚠️ (PENTING!)
- Klik **Save**
- **COPY TOKEN** (hanya muncul sekali!)

### 4. Update .env
Buka file `.env`, update baris ini:
```env
NEXT_PUBLIC_SANITY_WRITE_TOKEN=sk_paste_token_baru_disini
```

### 5. Restart Server
```bash
# Stop (Ctrl+C)
npm run dev
```

### 6. Test
```bash
# Test token
npx tsx scripts/test-sanity-write.ts

# Atau langsung test checkout
# Add product to cart → Checkout
```

## ✅ Done!

Order sekarang akan tersimpan di Sanity.

---

## 🔍 Verify

Check console saat checkout:
```
✅ Invoice created successfully
💾 Saving order data to Sanity...
✅ Order saved to Sanity successfully  ← Harus muncul ini
📝 Saved order ID: order_abc123
```

---

## 💡 Tips

- Token harus permission **"Editor"** atau **"Administrator"**
- Token **"Viewer"** tidak bisa write
- Token hanya muncul sekali, simpan baik-baik
- Jika lupa, create token baru

---

**Need Help?** Check: `SANITY_TOKEN_SETUP.md`
