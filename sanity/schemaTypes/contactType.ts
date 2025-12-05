import { defineType } from "sanity";

export const contactType = defineType({
  name: 'contactMessage',
  title: 'Contact Message',
  type: 'document',
  fields: [
    { name: 'name', title: 'Nama', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'subject', title: 'Subjek', type: 'string' },
    { name: 'message', title: 'Pesan', type: 'text' },
    { name: 'createdAt', title: 'Dibuat pada', type: 'datetime' },
  ],
});
