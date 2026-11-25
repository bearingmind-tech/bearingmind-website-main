import { Band } from "@/components/home/Band";
import { Organisations } from "@/components/home/Organisations";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const home = await getHome();
  const o = home.organisations;
  return pageMeta("Leadership mentoring & mental health training", `${o.lede} ${o.body}`, "/organisations");
}

export default async function OrganisationsPage() {
  const [site, home] = await Promise.all([getSite(), getHome()]);
  const o = home.organisations;
  return (
    <>
      <JsonLd
        data={[
          serviceSchema(site, {
            name: "Leadership mentoring and workplace mental health training",
            serviceType: "Corporate mental health training and leadership mentoring",
            description: `${o.lede} ${o.body}`,
            path: "/organisations",
            audience: "Organisations, HR and leadership teams",
            offers: o.offerings,
          }),
          breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: o.heading, path: "/organisations" }]),
        ]}
      />
      <PageHeader title={o.heading} sub={o.subheading} crumbs={[{ name: "Home", href: "/" }, { name: o.heading }]} />
      <Organisations c={o} withHead={false} formOpen />
      <Band c={home.band} />
    </>
  );
}
