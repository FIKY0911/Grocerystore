// lib/sanity/writeClient.ts
import { createClient } from "@sanity/client";

// Gunakan SANITY_WRITE_READ_TOKEN
if (!process.env.SANITY_WRITE_READ_TOKEN) {
  throw new Error(
    "SANITY_WRITE_READ_TOKEN is not set. Please add it to your .env file."
  );
}

console.log('🔑 Using Sanity Write Token:', process.env.SANITY_WRITE_READ_TOKEN.substring(0, 10) + '...');

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4pdrsxhm',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-10',
  token: process.env.SANITY_WRITE_READ_TOKEN,
  useCdn: false, // IMPORTANT: Must be false for write operations
});
