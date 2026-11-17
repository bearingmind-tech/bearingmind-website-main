import { Privacy } from "@/components/home/Privacy";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const home = await getHome();
  return pageMeta(home.privacy.heading, home.privacy.intro, "/privacy");
}

export default async function PrivacyPage() {
  const [site, home] = await Promise.all([getSite(), getHome()]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: home.privacy.heading, path: "/privacy" }])} />
      <PageHeader title={home.privacy.heading} sub={home.privacy.subheading} crumbs={[{ name: "Home", href: "/" }, { name: home.privacy.heading }]} />
      <Privacy c={home.privacy} email={site.email} withHead={false} open />
    </>
  );
}
