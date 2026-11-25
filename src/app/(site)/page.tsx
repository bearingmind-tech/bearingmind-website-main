import { About } from "@/components/home/About";
import { AiBand } from "@/components/home/AiBand";
import { Approach } from "@/components/home/Approach";
import { Band } from "@/components/home/Band";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Organisations } from "@/components/home/Organisations";
import { Privacy } from "@/components/home/Privacy";
import { Proof } from "@/components/home/Proof";
import { ResearchNotes } from "@/components/home/ResearchNotes";
import { Sessions } from "@/components/home/Sessions";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBooking, getHome, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { faqSchema, founderSchema, organizationSchema, websiteSchema } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const site = await getSite();
  return { ...pageMeta(site.seoTitle, site.seoDescription, "/"), title: { absolute: site.seoTitle } };
}

export default async function HomePage() {
  const [site, home, booking] = await Promise.all([getSite(), getHome(), getBooking()]);
  return (
    <>
      <JsonLd
        data={[organizationSchema(site, home, booking), founderSchema(site, home), websiteSchema(site), faqSchema(home.faq.items)]}
      />
      <Hero c={home.hero} />
      <AiBand c={home.aiBand} />
      <About c={home.about} more />
      <Approach c={home.approach} more />
      <Organisations c={home.organisations} more />
      <Band c={home.band} />
      <HowItWorks c={home.how} />
      <Sessions c={home.sessions} booking={booking} site={site} more />
      <Proof c={home.proof} />
      <Privacy c={home.privacy} site={site} />
      <Faq c={home.faq} more />
      <ResearchNotes c={home.research} />
    </>
  );
}
