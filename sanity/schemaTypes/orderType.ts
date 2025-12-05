// schemas/order.ts
import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  type: "document",
  title: "Order",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      type: "string",
      title: "Order Number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      title: "Clerk User ID",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      type: "string",
      title: "Customer Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "products",
      type: "array",
      title: "Products",
      of: [
        defineArrayMember({
          type: "object",
          name: "orderProduct",
          title: "Order Product",
          fields: [
            defineField({
              name: "product",
              type: "reference",
              to: [{ type: "product" }],
              title: "Product",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "quantity",
              type: "number",
              title: "Quantity",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "priceAtPurchase",
              type: "number",
              title: "Price at Purchase",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              productName: "product.name",
              quantity: "quantity",
              price: "priceAtPurchase",
            },
            prepare({ productName, quantity, price }) {
              return {
                title: productName || "Unknown Product",
                subtitle: `Qty: ${quantity} × Rp ${price?.toLocaleString("id-ID") || 0} = Rp ${((quantity || 0) * (price || 0)).toLocaleString("id-ID")}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "address",
      type: "reference",
      to: [{ type: "address" }],
      title: "Shipping Address",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shipper",
      type: "reference",
      to: [{ type: "shipper" }],
      title: "Shipping Service",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      initialValue: "pending",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderDate",
      type: "datetime",
      title: "Order Date",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "totalPrice",
      type: "number",
      title: "Total Price",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "paymentUrl",
      type: "string",
      title: "Payment URL",
    }),
    defineField({
      name: "stockReduced",
      type: "boolean",
      title: "Stock Reduced",
      description: "Indicates if stock has been reduced for this order",
      initialValue: false,
    }),
  ],
});
