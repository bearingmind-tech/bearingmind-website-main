import { redirect } from "next/navigation";
import { PlanChooser } from "@/components/booking/PlanChooser";
import { JsonLd } from "@/components/seo/JsonLd";
import { findType } from "@/lib/booking";
import { getBooking, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";

export async function generateMetadata() {
  const [site, booking] = await Promise.all([getSite(), getBooking()]);
  return pageMeta(
    `${booking.copy.heading}: CBT counselling, Bangalore and online`,
    `${booking.copy.heading} with ${site.legalName}, Richmond Town, Bangalore: ${booking.sessionTypes.map((t) => t.label).join(", ")}.`,
    "/book",
  );
}

export default async function BookPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type }, site, booking] = await Promise.all([searchParams, getSite(), getBooking()]);
  /* Old links used /book?type=… */
  const legacy = type ? findType(booking, type) : undefined;
  if (legacy) redirect(`/book/${legacy.slug}`);
  return (
    <>
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: booking.copy.heading, path: "/book" }])} />
      <PlanChooser cfg={booking} site={site} />
    </>
  );
}
