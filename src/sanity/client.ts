import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

export const client = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

/** Every CMS read is tagged "sanity", so one webhook call refreshes the whole site. */
export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params, { next: { revalidate: 3600, tags: ["sanity"] } });
  } catch (err) {
    console.error("Sanity fetch failed, using default content:", err);
    return null;
  }
}
