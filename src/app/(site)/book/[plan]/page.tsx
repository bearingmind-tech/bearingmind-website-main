import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { JsonLd } from "@/components/seo/JsonLd";
import { findPlan } from "@/lib/booking";
import { getBooking, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ plan: string }> };

export async function generateStaticParams() {
  const booking = await getBooking();
  return booking.sessionTypes.map((t) => ({ plan: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const [{ plan }, booking] = await Promise.all([params, getBooking()]);
  const t = findPlan(booking, plan);
  if (!t) return {};
  return pageMeta(
    t.premium ? `${t.label}: private dinner consultation, Bangalore` : `Book ${t.label} counselling, Bangalore and online`,
    `${t.short}. ${t.slotsText}. For ${t.forWho.toLowerCase()}. Book online in three short steps.`,
    `/book/${t.slug}`,
  );
}

export default async function PlanBookingPage({ params }: Props) {
  const [{ plan }, site, booking] = await Promise.all([params, getSite(), getBooking()]);
  const t = findPlan(booking, plan);
  if (!t) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(site, [
          { name: "Home", path: "/" },
          { name: booking.copy.heading, path: "/book" },
          { name: t.label, path: `/book/${t.slug}` },
        ])}
      />
      <BookingFlow cfg={booking} site={site} type={t} />
    </>
  );
}
