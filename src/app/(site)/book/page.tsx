import { BookingFlow } from "@/components/booking/BookingFlow";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBooking, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const [site, booking] = await Promise.all([getSite(), getBooking()]);
  return pageMeta(
    `${booking.copy.heading}: CBT counselling, Bangalore and online`,
    `${booking.copy.heading} with ${site.legalName}, Richmond Town, Bangalore: ${booking.sessionTypes.map((t) => t.label).join(", ")}.`,
    "/book",
  );
}

export default async function BookPage() {
  const [site, booking] = await Promise.all([getSite(), getBooking()]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: booking.copy.heading, path: "/book" }])} />
      <BookingFlow cfg={booking} site={site} />
    </>
  );
}
