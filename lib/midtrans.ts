import midtransClient from 'midtrans-client';
// lib/midtrans.ts

export const midtrans = new midtransClient.Snap({
    isProduction: false, // ganti ke true kalau sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    // merchantId: process.env.MIDTRANS_MERCHANT_ID!,
});
