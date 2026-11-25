import { PostIndex } from "@/components/blog/PostIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPosts, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";
import { breadcrumbSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const [site, posts] = await Promise.all([getSite(), getPosts("article")]);
  /* An empty listing is thin content; it joins Google once the first article is published */
  return pageMeta("Articles on CBT, stress and workplace mental health", `Articles from ${site.legalName}: CBT, stress, resilience, relationships and workplace mental health, Bangalore.`, "/articles", { noindex: !posts.length });
}

export default async function Page() {
  const [site, posts] = await Promise.all([getSite(), getPosts("article")]);
  return (
    <>
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "Articles", path: "/articles" }])} />
      <PostIndex title="Articles" intro={`From ${site.legalName}.`} posts={posts} base="/articles" />
    </>
  );
}
