import { Faq } from "@/components/home/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const home = await getHome();
  return pageMeta("Questions about CBT counselling and sessions", home.faq.items.map((q) => q.question).join(" "), "/faq");
}

export default async function FaqPage() {
  const [site, home] = await Promise.all([getSite(), getHome()]);
  return (
    <>
      <JsonLd data={[faqSchema(home.faq.items), breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: home.faq.heading, path: "/faq" }])]} />
      <PageHeader title={home.faq.heading} sub={home.faq.subheading} crumbs={[{ name: "Home", href: "/" }, { name: home.faq.heading }]} />
      <Faq c={home.faq} withHead={false} />
    </>
  );
}
