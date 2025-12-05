# Check Sanity Token Permissions

## Current Issue

Token `SANITY_WRITE_READ_TOKEN` tidak bisa update documents meskipun diklaim sebagai "Editor" token.

## How to Check Token Permissions

### Step 1: Login ke Sanity Management

1. Buka: https://www.sanity.io/manage
2. Login dengan akun Anda

### Step 2: Navigate to Tokens

1. Pilih project: **grocerystore** (4pdrsxhm)
2. Klik **API** di sidebar
3. Klik **Tokens** tab

### Step 3: Find Your Token

Look for token yang starts dengan: `skDujDIN1l...`

Check:
- **Name:** Apa nama token ini?
- **Permissions:** Apa permission level?
  - Viewer? (Read only)
  - Editor? (Read + Write)
  - Administrator? (Full access)

## Expected vs Actual

### What We Need:
```
Permission: Editor atau Administrator
Capabilities:
  ✅ Read
  ✅ Create
  ✅ Update  ← NEEDED!
  ✅ Delete
```

### What We Have (Current Token):
```
Permission: ??? (Unknown)
Capabilities:
  ✅ Read
  ✅ Create
  ❌ Update  ← MISSING!
  ❌ Delete
```

## Solution Options

### Option 1: Update Existing Token Permission

If token exists but has wrong permission:
1. Find token in Sanity Dashboard
2. Check if you can edit permission
3. Change to **Editor** or **Administrator**
4. Save changes
5. Restart dev server

### Option 2: Generate New Token (Recommended)

1. **In Sanity Dashboard:**
   - API → Tokens → Add API token
   - Name: `Editor Token for Orders`
   - Permission: **Editor** (or **Administrator**)
   - Click **Add token**

2. **Copy Token:**
   - Copy the new token (starts with `sk`)
   - Token only shown once!

3. **Update .env:**
   ```env
   SANITY_WRITE_READ_TOKEN=YOUR_NEW_TOKEN_HERE
   ```

4. **Restart Server:**
   ```bash
   npm run dev
   ```

5. **Test:**
   ```bash
   npm run test-webhook
   ```

## Verify Token Works

After updating token, test with:

```bash
npm run test-webhook
```

**Success Output:**
```
✅ Order updated successfully!
📊 New Status:
   status: paid
   xenditStatus: PAID
```

**Failure Output:**
```
❌ Error: Insufficient permissions; permission "update" required
```

If still fails → Token still doesn't have update permission

## Alternative: Use Sanity CLI

Check token permissions via CLI:

```bash
npx sanity@latest debug --secrets
```

This will show all tokens and their permissions.

## Next Steps

1. [ ] Login to Sanity Management
2. [ ] Check current token permission
3. [ ] If not Editor/Admin → Generate new token
4. [ ] Update SANITY_WRITE_READ_TOKEN in .env
5. [ ] Restart dev server
6. [ ] Run `npm run test-webhook`
7. [ ] Verify success

---

**Important:** Token MUST have **Editor** or **Administrator** permission to update orders!
