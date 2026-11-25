import type { MetadataRoute } from "next";
import { getBooking, getPosts, getSite } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, posts, booking] = await Promise.all([getSite(), getPosts(), getBooking()]);
  const u = (p: string) => new URL(p, site.siteUrl).toString();
  /* Real dates only: a lastmod that changes on every crawl teaches Google to ignore it.
     Static pages carry none; listings use their newest post. */
  const newest = (kind: "blog" | "article") => {
    const d = posts.filter((p) => p.kind === kind).map((p) => +new Date(p.updatedAt || p.publishedAt)).filter(Boolean);
    return d.length ? new Date(Math.max(...d)) : undefined;
  };
  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1, images: [u("/og-image.png"), u("/images/m-h-sharieff.jpg")] },
    { url: u("/book"), changeFrequency: "weekly", priority: 0.9 },
    ...booking.sessionTypes.map((t) => ({ url: u(`/book/${t.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: u("/about"), changeFrequency: "monthly", priority: 0.9, images: [u("/images/m-h-sharieff.jpg")] },
    { url: u("/approach"), changeFrequency: "monthly", priority: 0.8 },
    { url: u("/sessions"), changeFrequency: "monthly", priority: 0.9 },
    { url: u("/organisations"), changeFrequency: "monthly", priority: 0.8 },
    { url: u("/faq"), changeFrequency: "monthly", priority: 0.7 },
    { url: u("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: u("/blog"), lastModified: newest("blog"), changeFrequency: "weekly", priority: 0.7 },
    { url: u("/articles"), lastModified: newest("article"), changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({
      url: u(`/${p.kind === "article" ? "articles" : "blog"}/${p.slug}`),
      lastModified: new Date(p.updatedAt || p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: p.imageUrl ? [p.imageUrl] : undefined,
    })),
  ];
}
