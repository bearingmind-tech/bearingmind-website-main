/* One helper for every page's <head>: title, description, canonical URL,
   Open Graph and Twitter cards. Keeps all pages complete and consistent. */
import type { Metadata } from "next";

const SITE_NAME = "BearingMind Health Services";
const DEFAULT_IMAGE = "/og-image.png";

/** Trims to a search-friendly length at a word boundary. */
export function clipText(text: string, max = 158): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

type Opts = { image?: string; type?: "website" | "article"; noindex?: boolean; published?: string; modified?: string; authors?: string[] };

export function pageMeta(title: string, description: string, path: string, opts: Opts = {}): Metadata {
  const desc = clipText(description);
  const image = opts.image || DEFAULT_IMAGE;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    authors: opts.authors?.map((name) => ({ name })),
    openGraph: {
      type: opts.type || "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: path,
      title,
      description: desc,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(opts.type === "article" ? { publishedTime: opts.published, modifiedTime: opts.modified, authors: opts.authors } : {}),
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [image] },
  };
}
