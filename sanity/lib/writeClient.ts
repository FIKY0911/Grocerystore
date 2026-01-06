// lib/sanity/writeClient.ts
import { createClient } from "@sanity/client";

// Gunakan SANITY_WRITE_READ_TOKEN atau fallback ke NEXT_PUBLIC_SANITY_WRITE_TOKEN
const token = process.env.SANITY_WRITE_READ_TOKEN || process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN;

if (!token) {
  throw new Error(
    "SANITY_WRITE_READ_TOKEN or NEXT_PUBLIC_SANITY_WRITE_TOKEN is not set. Please add it to your .env file."
  );
}

console.log('🔑 Using Sanity Write Token:', token.substring(0, 10) + '...');

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4pdrsxhm',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-10',
  token: token,
  useCdn: false, // IMPORTANT: Must be false for write operations
});
