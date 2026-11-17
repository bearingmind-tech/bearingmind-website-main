import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { getSite } from "@/lib/content";
import { isProduction } from "@/lib/env";
import { cormorant, instrumentSans, newsreader } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(site.siteUrl),
    title: { default: site.seoTitle, template: `%s | ${site.practiceName}` },
    description: site.seoDescription,
    applicationName: site.legalName,
    creator: site.legalName,
    publisher: site.legalName,
    category: "health",
    robots: isProduction
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: site.legalName,
      title: site.ogTitle,
      description: site.ogDescription,
      url: "/",
      locale: "en_IN",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.legalName }],
    },
    twitter: { card: "summary_large_image", title: site.ogTitle, description: site.ogDescription, images: ["/og-image.png"] },
    formatDetection: { telephone: true, email: true, address: true },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#FBFCFB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /* Reading the request makes every page render per request, so Next.js can stamp
     its scripts with the CSP nonce from src/proxy.ts. CMS data stays cached. */
  await headers();
  return (
    <html lang="en-IN" className={`${newsreader.variable} ${instrumentSans.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
