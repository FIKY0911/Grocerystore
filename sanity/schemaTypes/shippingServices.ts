// schemas/shipper.ts
import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "shipper",
  title: "Jasa Pengiriman",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nama Kurir",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "slug",
        title: "Slug",
        type: "slug",
        options: {
        source: "name",
        maxLength: 96,
        },
        validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Shipper image",
      type: "image",
    }),
    defineField({
      name: "isActive",
      title: "Aktif",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
