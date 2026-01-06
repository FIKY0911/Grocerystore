import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const userType = defineType({
  name: "user",
  type: "document",
  title: "User",
  icon: UserIcon,
  fields: [
    defineField({
      name: "clerkUserId",
      type: "string",
      title: "Clerk User ID",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "firstName",
      type: "string",
      title: "First Name",
    }),
    defineField({
      name: "lastName",
      type: "string",
      title: "Last Name",
    }),
    defineField({
      name: "fullName",
      type: "string",
      title: "Full Name",
    }),
    defineField({
      name: "imageUrl",
      type: "url",
      title: "Profile Image URL",
    }),
    defineField({
      name: "phone",
      type: "string",
      title: "Phone Number",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      title: "Created At",
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      type: "datetime",
      title: "Updated At",
      readOnly: true,
    }),
    defineField({
      name: "lastSignInAt",
      type: "datetime",
      title: "Last Sign In",
      readOnly: true,
    }),
    defineField({
      name: "isActive",
      type: "boolean",
      title: "Is Active",
      initialValue: true,
    }),
    defineField({
      name: "totalOrders",
      type: "number",
      title: "Total Orders",
      initialValue: 0,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "fullName",
      subtitle: "email",
      totalOrders: "totalOrders",
    },
    prepare({ title, subtitle, totalOrders }) {
      return {
        title: title || "No Name",
        subtitle: `${subtitle} • ${totalOrders || 0} orders`,
      };
    },
  },
});
