import { BookCta } from "@/components/ui/BookCta";
import { Faq } from "@/components/home/Faq";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Sessions } from "@/components/home/Sessions";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBooking, getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const [home, booking] = await Promise.all([getHome(), getBooking()]);
  return pageMeta(
    booking.showFeesPublicly ? "Counselling sessions and fees, Bangalore and online" : "Counselling sessions in Bangalore and online",
    `Counselling plans in Bangalore and online: ${booking.sessionTypes.map((t) => t.label).join(", ")}. ${booking.showFeesPublicly ? home.sessions.feeNote : "Confidential CBT, booked online."}`,
    "/sessions",
  );
}

export default async function SessionsPage() {
  const [site, home, booking] = await Promise.all([getSite(), getHome(), getBooking()]);
  return (
    <>
      <JsonLd data={[organizationSchema(site, home, booking), breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: home.sessions.heading, path: "/sessions" }])]} />
      <PageHeader title={home.sessions.heading} sub={home.sessions.subheading} crumbs={[{ name: "Home", href: "/" }, { name: home.sessions.heading }]} />
      <Sessions c={home.sessions} booking={booking} site={site} withHead={false} />
      <HowItWorks c={home.how} />
      <Faq c={home.faq} />
      <BookCta site={site} />
    </>
  );
}
