import { ContactView } from "@/components/legal/ContactView";
import { JsonLd } from "@/components/seo/JsonLd";
import { defaultLandings } from "@/content/landings";
import { getBooking, getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { abs, breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const site = await getSite();
  const a = site.address;
  return pageMeta(
    "Contact BearingMind, Richmond Town, Bangalore",
    `Call or WhatsApp ${site.phoneDisplay}, email ${site.email}, or visit ${a.street}, ${a.locality} ${a.postalCode}. Session times, grievance contact and enquiries.`,
    "/contact",
  );
}

export default async function ContactPage() {
  const [site, home, booking] = await Promise.all([getSite(), getHome(), getBooking()]);
  const plans = Object.fromEntries(defaultLandings.map((l) => [l.plan, `/${l.slug}`]));
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "ContactPage", url: abs(site, "/contact"), name: "Contact", about: { "@id": abs(site, "/#organization") } },
          organizationSchema(site, home, booking),
          breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]),
        ]}
      />
      <ContactView site={site} booking={booking} plans={plans} />
    </>
  );
}
