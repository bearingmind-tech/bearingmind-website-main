/* Reads content from Sanity, filling any empty field with the default
   content. The site therefore always renders, even before Sanity is set up. */
import { cache } from "react";
import { bookingDefaults, homeDefaults, siteDefaults } from "@/content/defaults";
import { defaultLandings } from "@/content/landings";
import { defaultPosts } from "@/content/posts";
import type { BookingContent, HomeContent, LandingPage, Post, PostSummary, SiteSettings } from "@/content/types";
import { client, sanityFetch } from "@/sanity/client";

type Plain = Record<string, unknown>;

function isPlain(v: unknown): v is Plain {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Overlay CMS values on defaults. Empty strings, empty lists and nulls keep the default. */
export function mergeContent<T>(base: T, over: unknown): T {
  if (over === null || over === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(over) && over.length ? over : base) as T;
  if (isPlain(base)) {
    if (!isPlain(over)) return base;
    const out: Plain = { ...base };
    for (const [k, v] of Object.entries(over)) {
      if (k.startsWith("_")) continue;
      out[k] = k in base ? mergeContent((base as Plain)[k], v) : v;
    }
    return out as T;
  }
  if (typeof base === "string") return (typeof over === "string" && over.trim() ? over : base) as T;
  return over as T;
}

export const getSite = cache(async (): Promise<SiteSettings> => {
  const data = await sanityFetch<Partial<SiteSettings>>(`*[_id == "siteSettings"][0]`);
  return mergeContent(siteDefaults, data);
});

export const getHome = cache(async (): Promise<HomeContent> => {
  const data = await sanityFetch<Partial<HomeContent>>(
    `*[_id == "homePage"][0]{..., about{..., "portraitUrl": portrait.asset->url}}`,
  );
  return mergeContent(homeDefaults, data);
});

export const getBooking = cache(async (): Promise<BookingContent> => {
  const data = await sanityFetch<Partial<BookingContent>>(`*[_id == "bookingSettings"][0]`);
  return mergeContent(bookingDefaults, data);
});

const summaryFields = `title, "slug": slug.current, kind, excerpt, publishedAt, updatedAt,
  "imageUrl": mainImage.asset->url, "imageAlt": mainImage.alt, "authorName": author->name`;

/** A plan landing page: Studio text over the built-in text. Only the built-in slugs exist as pages. */
export const getLanding = cache(async (slug: string): Promise<LandingPage | null> => {
  const base = defaultLandings.find((l) => l.slug === slug);
  if (!base) return null;
  const data = await sanityFetch<Partial<LandingPage>>(`*[_type == "landingPage" && slug.current == $slug][0]{..., "slug": slug.current}`, { slug });
  return mergeContent(base, data);
});

export const getPosts = cache(async (kind?: "blog" | "article"): Promise<PostSummary[]> => {
  const filter = kind ? `&& kind == $kind` : "";
  const data = await sanityFetch<PostSummary[]>(
    `*[_type == "post" && defined(slug.current) ${filter}] | order(publishedAt desc){${summaryFields}}`,
    kind ? { kind } : {},
  );
  /* Sanity not connected (or unreachable): show the built-in posts. Once seeded, Sanity is the source. */
  if (data === null) {
    return defaultPosts
      .filter((p) => !kind || p.kind === kind)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .map(({ title, slug, kind, excerpt, publishedAt, updatedAt, imageUrl, imageAlt, author }) => ({ title, slug, kind, excerpt, publishedAt, updatedAt, imageUrl, imageAlt, authorName: author?.name }));
  }
  return data;
});

export const getPost = cache(async (kind: "blog" | "article", slug: string): Promise<Post | null> => {
  if (!client) return defaultPosts.find((p) => p.kind === kind && p.slug === slug) || null;
  return sanityFetch<Post>(
    `*[_type == "post" && kind == $kind && slug.current == $slug][0]{
      ${summaryFields}, body[]{..., _type == "image" => {..., "url": asset->url, "dimensions": asset->metadata.dimensions}},
      seoTitle, seoDescription, reviewedBy, faqs, sources,
      "author": author->{name, role, bio, credentials, "imageUrl": image.asset->url}
    }`,
    { kind, slug },
  );
});
