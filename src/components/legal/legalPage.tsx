import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { legalDocs } from "@/content/legal";
import { getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";
import { LegalView } from "./LegalView";

export const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
  { label: "Cancellation and refunds", href: "/cancellation-and-refunds" },
  { label: "Contact", href: "/contact" },
];

/* Shared metadata and page for /privacy, /terms and /cancellation-and-refunds */
export async function legalMetadata(slug: string) {
  const doc = legalDocs(await getSite()).find((d) => d.slug === slug);
  return doc ? pageMeta(doc.seoTitle, doc.seoDescription, `/${slug}`) : {};
}

export async function LegalPage({ slug }: { slug: string }) {
  const site = await getSite();
  const doc = legalDocs(site).find((d) => d.slug === slug);
  if (!doc) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: doc.title, path: `/${slug}` }])} />
      <LegalView doc={doc} related={LEGAL_LINKS.filter((l) => l.href !== `/${slug}`)} />
    </>
  );
}
