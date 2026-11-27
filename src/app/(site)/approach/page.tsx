import { Approach } from "@/components/home/Approach";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ResearchNotes } from "@/components/home/ResearchNotes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const home = await getHome();
  return pageMeta(`${home.approach.heading}: CBT counselling in Bangalore`, home.approach.lede, "/approach");
}

export default async function ApproachPage() {
  const [site, home] = await Promise.all([getSite(), getHome()]);
  return (
    <>
      <JsonLd
        data={[
          serviceSchema(site, {
            name: "CBT-based counselling and coaching",
            serviceType: "Cognitive Behavioural Therapy based counselling and coaching",
            description: home.approach.lede,
            path: "/approach",
            offers: home.approach.areas.flatMap((a) => a.items),
          }),
          breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "Approach", path: "/approach" }]),
        ]}
      />
      <PageHeader title={home.approach.heading} sub={home.approach.lede} crumbs={[{ name: "Home", href: "/" }, { name: "Approach" }]} />
      <Approach c={home.approach} withHead={false} />
      <HowItWorks c={home.how} />
      <ResearchNotes c={home.research} />
    </>
  );
}
