import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";
import { isProduction } from "@/lib/env";

/* Production: search engines and AI assistants are welcome; private areas are not crawled.
   Preview and test deployments: nothing is indexed, so duplicates never reach Google. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "Meta-ExternalAgent",
  "DuckAssistBot",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!isProduction) return { rules: [{ userAgent: "*", disallow: "/" }] };
  const site = await getSite();
  const disallow = ["/studio", "/api/", "/search"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
    ],
    sitemap: new URL("/sitemap.xml", site.siteUrl).toString(),
    host: site.siteUrl,
  };
}
