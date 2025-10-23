// sanity/lib/client.ts
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  // token, // Removed token for frontend client to prevent security issues
});
