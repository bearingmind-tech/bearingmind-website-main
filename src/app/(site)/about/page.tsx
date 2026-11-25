import { About } from "@/components/home/About";
import { Proof } from "@/components/home/Proof";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, founderSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const home = await getHome();
  return pageMeta(`${home.about.name}, ${home.about.role}`, `${home.about.name}, ${home.about.role}. ${home.about.intro}`, "/about");
}

export default async function AboutPage() {
  const [site, home] = await Promise.all([getSite(), getHome()]);
  return (
    <>
      <JsonLd data={[founderSchema(site, home), breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: home.about.heading, path: "/about" }])]} />
      <PageHeader title={home.about.heading} crumbs={[{ name: "Home", href: "/" }, { name: home.about.heading }]} />
      <About c={home.about} withHead={false} />
      <Proof c={home.proof} />
    </>
  );
}
