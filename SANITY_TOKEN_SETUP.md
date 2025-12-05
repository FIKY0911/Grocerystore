# 🔑 Sanity Token Setup Guide

Panduan lengkap untuk setup Sanity Write Token dengan permission yang benar.

---

## ❌ Problem

Error saat create order:
```
Insufficient permissions; permission "create" required
```

Ini terjadi karena token Sanity tidak punya write permission.

---

## ✅ Solution

### Step 1: Go to Sanity Dashboard

1. Buka browser
2. Go to: https://sanity.io/manage
3. Login dengan akun Anda
4. Pilih project: **grocerystore** (atau nama project Anda)

### Step 2: Create New Token

1. Di sidebar, klik **"API"**
2. Klik tab **"Tokens"**
3. Klik tombol **"Add API token"**
4. Isi form:
   - **Label**: `Write Token for Production` (atau nama lain)
   - **Permissions**: Pilih **"Editor"** atau **"Administrator"**
     - ⚠️ JANGAN pilih "Viewer" (read-only)
     - ✅ Pilih "Editor" untuk write permission
5. Klik **"Save"**
6. **COPY TOKEN** yang muncul (hanya muncul sekali!)

### Step 3: Update .env File

1. Buka file `.env` di root project
2. Update atau tambahkan:
   ```
   NEXT_PUBLIC_SANITY_WRITE_TOKEN=sk_your_new_token_here
   ```
3. Save file

### Step 4: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## 🧪 Test Token

Run test script untuk verify token:

```bash
npx tsx scripts/test-sanity-write.ts
```

**Expected output:**
```
🧪 Testing Sanity Write Permission...
📝 Test 1: Creating test document...
✅ Test document created successfully!
🗑️  Test 2: Deleting test document...
✅ Test document deleted successfully!
🎉 All tests passed!
```

---

## 📋 Token Permissions

### Viewer (Read-only) ❌
- Can read documents
- **Cannot** create/update/delete
- **NOT suitable** for write operations

### Editor ✅
- Can read documents
- **Can** create/update/delete documents
- **Suitable** for write operations
- Recommended for production

### Administrator ✅
- Full access
- Can manage project settings
- Can create/update/delete documents
- Use with caution

---

## 🔧 Troubleshooting

### Issue 1: Token still not working

**Check:**
1. Token copied correctly (no spaces)
2. Token starts with `sk`
3. .env file saved
4. Dev server restarted

### Issue 2: Token expired

**Solution:**
1. Create new token
2. Update .env
3. Restart server

### Issue 3: Wrong permission

**Solution:**
1. Delete old token
2. Create new token with "Editor" permission
3. Update .env
4. Restart server

---

## ✅ Verification Checklist

- [ ] Token created with "Editor" or "Administrator" permission
- [ ] Token copied to .env file
- [ ] NEXT_PUBLIC_SANITY_WRITE_TOKEN set correctly
- [ ] Dev server restarted
- [ ] Test script passed
- [ ] Order creation works

---

**Last Updated**: December 2024
