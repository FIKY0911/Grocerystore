// lib/sanity/writeClient.ts
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, token } from "../env";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN, // Harus berupa write token dari Sanity
  useCdn: true,
});
