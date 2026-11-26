import { BookCta } from "@/components/ui/BookCta";
import { PostIndex } from "@/components/blog/PostIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPosts, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const site = await getSite();
  return pageMeta("Blog: CBT, stress and mental wellbeing", `Blog from ${site.legalName}: CBT, stress, resilience, relationships and workplace mental health, Bangalore.`, "/blog");
}

export default async function Page() {
  const [site, posts] = await Promise.all([getSite(), getPosts("blog")]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <PostIndex title="Blog" intro={`From ${site.legalName}.`} posts={posts} base="/blog" />
      <BookCta site={site} />
    </>
  );
}
