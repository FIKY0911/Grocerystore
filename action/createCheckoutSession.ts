// app/actions/createCheckoutSession.ts
"use server";

import { Address } from "@/sanity.types";
import { CartItem } from "@/store";
import { v4 as uuidv4 } from "uuid";
import { midtrans } from "@/lib/midtrans";
import { writeClient } from "@/sanity/lib/writeClient";
import { urlFor } from "@/sanity/lib/image";

export interface Metadata {
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
  address?: Address | null;
  shipperId?: string;
}

export interface GroupedCartItems {
  product: CartItem["product"];
  quantity: number;
}

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata
) {
  if (!items.length) throw new Error("Keranjang kosong");
  if (!metadata.customerEmail) throw new Error("Email wajib diisi");

  const orderNumber = metadata.orderNumber || uuidv4();
  const totalPrice = Math.round(
    items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  );

  if (totalPrice <= 0) throw new Error("Total harus lebih dari 0");

  // Pastikan NEXT_PUBLIC_SITE_URL tersedia
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL belum diatur di .env");
  }

  // 📦 Siapkan payload Midtrans
  const parameter = {
    transaction_details: {
      order_id: orderNumber,
      gross_amount: totalPrice,
    },
    customer_details: {
      first_name: metadata.customerName.split(" ")[0] || metadata.customerName,
      last_name: metadata.customerName.split(" ").slice(1).join(" ") || "",
      email: metadata.customerEmail,
    },
    item_details: items.map((item) => ({
      id: item.product?._id || "unknown",
      price: Math.round(item.product?.price || 0),
      quantity: item.quantity,
      name: item.product?.name || "Produk Tidak Dikenal",
      image_url: item.product?.images?.[0] ? urlFor(item.product.images[0]).url() : null, // Explicitly set to null if no image
    })),
    // 🔥 Callbacks untuk Snap (opsional di backend, tapi aman ditambahkan)
    callbacks: {
      finish: `${siteUrl}/orders`,
      error: `${siteUrl}/orders`,
      pending: `${siteUrl}/orders`,
    },
    // 🔔 URL Notifikasi Webhook Midtrans
    notification_url: `${siteUrl}/api/webhooks`,
  };

  // 💳 Buat transaksi Midtrans
  const snapResponse = await midtrans.createTransaction(parameter);
  const { redirect_url: paymentUrl, transaction_id: transactionId, token: snapToken } = snapResponse;

  // 📝 Simpan ke Sanity
  const orderDoc = {
    _type: "order",
    orderNumber,
    invoice: {
      id: transactionId,
      number: orderNumber,
      hosted_invoice_url: paymentUrl, // Reintroduce hosted_invoice_url
    },
    clerkUserId: metadata.clerkUserId,
    customerName: metadata.customerName,
    email: metadata.customerEmail, // Correctly use customerEmail from metadata
    products: items.map((item) => ({
      _key: uuidv4(),
      product: { _type: "reference", _ref: item.product?._id },
      quantity: item.quantity,
      priceAtPurchase: item.product?.price || 0,
    })),
    totalPrice,
    currency: "IDR",
    amountDiscount: 0,
    address: metadata.address?._id ? { _type: "reference", _ref: metadata.address._id } : undefined,
    status: "pending",
    orderDate: new Date().toISOString(),
    paymentUrl, // Reintroduce paymentUrl
    midtransTransactionId: transactionId,
    midtransStatus: "pending",
    snapToken,
    shipper: metadata.shipperId ? { _type: "reference", _ref: metadata.shipperId } : undefined,
  };

  await writeClient.create(orderDoc);

  // 📦 Kurangi stok produk
  for (const item of items) {
    if (item.product?._id && item.quantity) {
      await writeClient
        .patch(item.product._id)
        .dec({ stock: item.quantity })
        .commit();
    }
  }

  return {
    // paymentUrl, // Remove this
    orderNumber,
    snapToken,
  };
