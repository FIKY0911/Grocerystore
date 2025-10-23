// schemas/order.ts
import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    // 🔁 Midtrans Integration
    defineField({
      name: "midtransTransactionId",
      title: "Midtrans Transaction ID",
      type: "string",
    }),
    defineField({
      name: "midtransStatus",
      title: "Midtrans Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Settlement", value: "settlement" },
          { title: "Capture", value: "capture" },
          { title: "Deny", value: "deny" },
          { title: "Cancel", value: "cancel" },
          { title: "Expire", value: "expire" },
          { title: "Lunas", value: "paid" },
        ],
      },
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    // 📦 Produk
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Bought",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "priceAtPurchase",
              title: "Price at Purchase",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              product: "product.name",
              quantity: "quantity",
              image: "product.images.0",
              price: "priceAtPurchase",
            },
            prepare(select) {
              return {
                title: `${select.product} x ${select.quantity}`,
                subtitle: `IDR ${(select.price * select.quantity).toLocaleString()}`,
                media: select.image,
              };
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    // 💰 Harga
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "IDR",
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      initialValue: 0,
    }),
    // 📍 Alamat Pengiriman (REFERENSI ke dokumen address)
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "reference",
      to: [{ type: "address" }],
      validation: (Rule) => Rule.required(),
    }),
    // 🚚 Jasa Pengiriman
    defineField({
      name: "shipper",
      title: "Jasa Pengiriman",
      type: "reference",
      to: [{ type: "shipper" }],
      validation: (Rule) => Rule.required(),
    }),
    // 📊 Status
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      initialValue: "pending",
      options: {
        list: [
          { title: "Menunggu Pembayaran", value: "pending" },
          { title: "Diproses", value: "processing" },
          { title: "Lunas", value: "paid" },
          { title: "Dikirim", value: "shipped" },
          { title: "Diterima", value: "delivered" },
          { title: "Dibatalkan", value: "cancelled" },
        ],
      },
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "invoice",
      title: "Invoice Details",
      type: "object",
      fields: [
        defineField({
          name: "id",
          title: "Invoice ID",
          type: "string",
        }),
        defineField({
          name: "number",
          title: "Invoice Number",
          type: "string",
        }),
        defineField({
          name: "hosted_invoice_url",
          title: "Hosted Invoice URL",
          type: "url",
        }),
      ],
    }),
    defineField({
      name: "paymentUrl",
      title: "Midtrans Payment URL",
      type: "url",
    }),
    defineField({
      name: "snapToken",
      title: "Midtrans Snap Token",
      type: "string",
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      orderId: "orderNumber",
      status: "status",
      addressName: "address.name",
    },
    prepare(select) {
      const orderIdSnippet = select.orderId
        ? `${select.orderId.slice(0, 5)}...${select.orderId.slice(-5)}`
        : "N/A";
      return {
        title: `${select.name} (${orderIdSnippet})`,
        subtitle: `IDR ${select.amount?.toLocaleString()} • ${select.status || "pending"} • ${select.addressName || "Alamat"}`,
        media: BasketIcon,
      };
    },
  },
});
