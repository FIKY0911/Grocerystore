# Vercel Environment Variables Setup

## 🚀 Important: Update Vercel Environment Variables

Setelah fix local, Anda **HARUS** update environment variables di Vercel agar production juga bekerja.

## 📋 Steps

### 1. Login ke Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2. Pilih Project
- Cari project: **grocerystore-rpl-kel13**
- Klik untuk masuk ke project settings

### 3. Buka Environment Variables
- Klik **Settings** di top menu
- Klik **Environment Variables** di sidebar

### 4. Update/Add Variables

#### A. SANITY_WRITE_READ_TOKEN (PENTING!)
```
Name: SANITY_WRITE_READ_TOKEN
Value: skDujDIN1layUpXu8LDXzHhPhz9ws00t2QftAyRPCwjmLHyeUIdoN6tdyBdSuQdUjtFhGWPEtfrASMsPOAUZgkaF2NfzsRbL7SSfVV42KStjiD70rFpnQNTOTdrpE4cOIQFkCH4i5g9ASLbC21NbgwBZkF6FCIinx1iEwKiPajB9BhYHCEUb
Environment: Production, Preview, Development
```

#### B. NEXT_PUBLIC_SITE_URL (Check)
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://grocerystore-rpl-kel13.vercel.app/
Environment: Production, Preview, Development
```

#### C. Other Required Variables (Verify)
Pastikan semua variable ini ada:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_SANITY_PROJECT_ID`
- ✅ `NEXT_PUBLIC_SANITY_DATASET`
- ✅ `NEXT_PUBLIC_SANITY_API_VERSION`
- ✅ `XENDIT_SERVER_KEY`
- ✅ `XENDIT_CALLBACK_TOKEN`
- ✅ `NEXT_PUBLIC_XENDIT_KEY`

### 5. Redeploy

Setelah update environment variables:

**Option A: Automatic Redeploy**
- Vercel akan otomatis redeploy jika ada git push

**Option B: Manual Redeploy**
1. Klik **Deployments** tab
2. Klik **...** (three dots) di latest deployment
3. Klik **Redeploy**
4. Confirm redeploy

### 6. Verify Deployment

Setelah deployment selesai:

1. **Check Deployment Logs:**
   - Klik deployment yang baru
   - Check logs untuk error
   - Harus muncul: `🔑 Using Sanity Write Token: skDujDIN1l...`

2. **Test Production:**
   - Buka: https://grocerystore-rpl-kel13.vercel.app/
   - Login
   - Add products ke cart
   - Checkout
   - Verify order muncul di `/orders`

## 🔍 Troubleshooting

### Problem: Environment Variable Tidak Ter-apply

**Solution:**
1. Check variable name (case-sensitive!)
2. Check environment scope (Production/Preview/Development)
3. Redeploy manually
4. Clear Vercel cache:
   ```bash
   vercel --prod --force
   ```

### Problem: Still Getting Permission Error in Production

**Check:**
1. Variable `SANITY_WRITE_READ_TOKEN` ada di Vercel?
2. Value token benar (copy-paste dari .env)?
3. Deployment sudah selesai?
4. Check deployment logs untuk error

**Solution:**
```bash
# Re-verify token di local dulu
npm run dev
# Test checkout
# Jika local OK, tapi production error:
# - Double check Vercel env variables
# - Redeploy
```

### Problem: Redirect URLs Masih ke Localhost

**Check:**
1. `NEXT_PUBLIC_SITE_URL` di Vercel = `https://grocerystore-rpl-kel13.vercel.app/`
2. Tidak ada typo (trailing slash OK)
3. Redeploy setelah update

## 📝 Checklist

- [ ] Login ke Vercel Dashboard
- [ ] Pilih project grocerystore-rpl-kel13
- [ ] Buka Settings → Environment Variables
- [ ] Add/Update `SANITY_WRITE_READ_TOKEN`
- [ ] Verify `NEXT_PUBLIC_SITE_URL`
- [ ] Verify all other required variables
- [ ] Redeploy (automatic or manual)
- [ ] Check deployment logs
- [ ] Test checkout in production
- [ ] Verify orders muncul di production

## 🎯 Success Criteria

Production deployment berhasil jika:
- ✅ Deployment logs tidak ada error
- ✅ Checkout berhasil create order
- ✅ Order tersimpan ke Sanity
- ✅ Order muncul di `/orders` page
- ✅ Redirect URLs menggunakan vercel.app domain
- ✅ No "Insufficient permissions" error

## 🔐 Security Notes

1. **Never commit tokens to Git**
   - Tokens harus di `.env` (sudah di `.gitignore`)
   - Update via Vercel dashboard only

2. **Token Rotation**
   - Jika generate token baru di Sanity
   - Update di `.env` (local)
   - Update di Vercel (production)
   - Redeploy

3. **Environment Separation**
   - Development: localhost
   - Production: vercel.app
   - Use correct `NEXT_PUBLIC_SITE_URL` for each

---

**Important:** Jangan lupa update Vercel environment variables setelah fix local! 🚀
