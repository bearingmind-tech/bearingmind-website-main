import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/PostView";
import { getPost, getPosts, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/pageMeta";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts("article");
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("article", slug);
  if (!post) return {};
  const image = post.imageUrl ? `${post.imageUrl}?w=1200&h=630&fit=crop&auto=format` : undefined;
  return pageMeta(post.seoTitle || post.title, post.seoDescription || post.excerpt || post.title, `/articles/${post.slug}`, {
    image,
    type: "article",
    published: post.publishedAt,
    modified: post.updatedAt || post.publishedAt,
    authors: post.author?.name ? [post.author.name] : undefined,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [site, post] = await Promise.all([getSite(), getPost("article", slug)]);
  if (!post) notFound();
  return <PostView post={post} site={site} base="/articles" sectionName="Articles" />;
}
