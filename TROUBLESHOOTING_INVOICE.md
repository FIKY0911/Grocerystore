# Troubleshooting: Invoice Tidak Muncul

Panduan lengkap untuk mengatasi masalah invoice yang tidak muncul di endpoint `/api/invoice/[orderNumber]`

## 🔍 Checklist Debugging

### 1. Verifikasi Struktur Endpoint

**Endpoint yang benar:**
```
GET /api/invoice/order_xxxxx
```

**Struktur file yang benar:**
```
app/
  api/
    invoice/
      [orderNumber]/
        route.ts    ✅ BENAR
```

**Struktur file yang SALAH:**
```
app/
  api/
    invoice/
      route.ts    ❌ SALAH (tidak bisa handle dynamic route)
