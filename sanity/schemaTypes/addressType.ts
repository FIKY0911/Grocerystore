import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

// Daftar provinsi di Indonesia
const INDONESIAN_PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
];

export const addressType = defineType({
  name: "address",
  title: "Addresses",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "name",
      title: "Address Name",
      type: "string",
      description: "Nama alamat (misal: Rumah, Kantor)",
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: "email",
      title: "User Email",
      type: "email",
    }),
    defineField({
      name: "address",
      title: "Alamat Lengkap",
      type: "string",
      description: "Alamat jalan lengkap dengan nomor rumah/blok",
      validation: (Rule) => Rule.required().min(5).max(200),
    }),
    defineField({
      name: "phone",
      title: "Nomor Telepon",
      type: "string",
      description: "Nomor telepon penerima (contoh: 081234567890)",
      validation: (Rule) =>
        Rule.required()
          .regex(/^(\+62|62|0)[0-9]{9,12}$/, {
            name: "phoneNumber",
            invert: false,
          })
          .custom((phone: string | undefined) => {
            if (!phone) return "Nomor telepon wajib diisi";
            if (!/^(\+62|62|0)[0-9]{9,12}$/.test(phone)) {
              return "Format nomor telepon tidak valid (contoh: 081234567890)";
            }
            return true;
          }),
    }),
    defineField({
      name: "city",
      title: "Kota / Kabupaten",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "state",
      title: "Provinsi",
      type: "string",
      description: "Pilih provinsi di Indonesia",
      options: {
        list: INDONESIAN_PROVINCES.map((province) => ({
          title: province,
          value: province,
        })),
        layout: "dropdown", // tampilkan sebagai dropdown
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "zip",
      title: "Kode Pos",
      type: "string",
      description: "Contoh: 12345",
      validation: (Rule) =>
        Rule.required()
          .regex(/^\d{5}$/, {
            name: "kodePos",
            invert: false,
          })
          .custom((zip: string | undefined) => {
            if (!zip) return "Kode pos wajib diisi";
            if (!/^\d{5}$/.test(zip)) return "Kode pos harus 5 digit angka";
            return true;
          }),
    }),
    defineField({
      name: "default",
      title: "Alamat Utama",
      type: "boolean",
      description: "Jadikan sebagai alamat pengiriman utama?",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Dibuat Pada",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "address",
      city: "city",
      state: "state",
      isDefault: "default",
    },
    prepare({ title, subtitle, city, state, isDefault }) {
      return {
        title: `${title} ${isDefault ? "(Utama)" : ""}`,
        subtitle: `${subtitle}, ${city}, ${state}`,
      };
    },
  },
});
