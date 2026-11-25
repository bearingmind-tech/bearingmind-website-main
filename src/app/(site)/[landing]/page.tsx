import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { LandingView } from "@/components/landing/LandingView";
import { defaultLandings } from "@/content/landings";
import { findType } from "@/lib/booking";
import { getBooking, getLanding, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/seo";

export const revalidate = 3600;
/* Only the plan landing pages live at the top level; anything else is a 404 */
export const dynamicParams = false;

type Props = { params: Promise<{ landing: string }> };

export function generateStaticParams() {
  return defaultLandings.map((l) => ({ landing: l.slug }));
}

export async function generateMetadata({ params }: Props) {
  const page = await getLanding((await params).landing);
  if (!page) return {};
  return pageMeta(page.seoTitle, page.seoDescription, `/${page.slug}`);
}

export default async function LandingPageRoute({ params }: Props) {
  const [{ landing }, site, booking] = await Promise.all([params, getSite(), getBooking()]);
  const page = await getLanding(landing);
  const plan = page && findType(booking, page.plan);
  if (!page || !plan) notFound();
  const others = defaultLandings
    .filter((l) => l.slug !== page.slug)
    .map((l) => ({ href: `/${l.slug}`, label: findType(booking, l.plan)?.label || l.title }));
  return (
    <>
      <JsonLd
        data={[
          serviceSchema(site, {
            name: page.title,
            description: page.seoDescription,
            path: `/${page.slug}`,
            serviceType: plan.premium ? "Executive counselling and coaching" : "CBT-based counselling",
            audience: plan.forWho,
            offers: plan.options.map((o) => `${plan.label}: ${o.label}`),
          }),
          faqSchema(page.faq),
          breadcrumbSchema(site, [
            { name: "Home", path: "/" },
            { name: "Sessions", path: "/sessions" },
            { name: plan.label, path: `/${page.slug}` },
          ]),
        ]}
      />
      <LandingView page={page} plan={plan} booking={booking} site={site} others={others} />
    </>
  );
}
