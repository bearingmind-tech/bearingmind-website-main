import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { JsonLd } from "@/components/seo/JsonLd";
import { findPlan } from "@/lib/booking";
import { getBooking, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ plan: string }> };

export async function generateStaticParams() {
  const booking = await getBooking();
  return booking.sessionTypes.map((t) => ({ plan: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const [{ plan }, booking] = await Promise.all([params, getBooking()]);
  const t = findPlan(booking, plan);
  if (!t) return {};
  return pageMeta(t.seoTitle || `${t.label} counselling in Bangalore`, t.seoDescription || `${t.short}. ${t.slotsText}. For ${t.forWho}.`, `/book/${t.slug}`);
}

export default async function PlanBookingPage({ params }: Props) {
  const [{ plan }, site, booking] = await Promise.all([params, getSite(), getBooking()]);
  const t = findPlan(booking, plan);
  if (!t) notFound();
  return (
    <>
      <JsonLd
        data={[
          serviceSchema(site, {
            name: t.seoTitle || t.label,
            description: t.seoDescription || `${t.short}. ${t.slotsText}.`,
            path: `/book/${t.slug}`,
            serviceType: t.premium ? "Executive counselling and coaching" : "CBT-based counselling",
            audience: t.forWho,
            offers: t.options.map((o) => `${t.label}: ${o.label}`),
          }),
          breadcrumbSchema(site, [
            { name: "Home", path: "/" },
            { name: booking.copy.heading, path: "/book" },
            { name: t.label, path: `/book/${t.slug}` },
          ]),
        ]}
      />
      <BookingFlow cfg={booking} site={site} type={t} />
    </>
  );
}
