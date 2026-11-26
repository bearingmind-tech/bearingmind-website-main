import Image from "next/image";
import Link from "next/link";
import type { Post, SiteSettings } from "@/content/types";
import { breadcrumbSchema, faqSchema, postSchema } from "@/lib/seo";
import { JsonLd } from "../seo/JsonLd";
import { BookCta } from "../ui/BookCta";
import { PostBody } from "./PostBody";
import styles from "./Blog.module.css";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function PostView({
  post,
  site,
  base,
  sectionName,
}: {
  post: Post;
  site: SiteSettings;
  base: string;
  sectionName: string;
}) {
  const path = `${base}/${post.slug}`;
  const schemas: object[] = [
    postSchema(site, post, path),
    breadcrumbSchema(site, [
      { name: "Home", path: "/" },
      { name: sectionName, path: base },
      { name: post.title, path },
    ]),
  ];
  if (post.faqs?.length) schemas.push(faqSchema(post.faqs));

  return (
    <>
      <article className={`wrap ${styles.post}`}>
        <JsonLd data={schemas} />
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
          <Link href={base}>{sectionName}</Link>
        </nav>
        <header className={styles.postHead}>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="lede">{post.excerpt}</p>}
          <p className={styles.meta}>
            {post.author?.name && (
              <>
                By {post.author.name}
                {post.author.role ? `, ${post.author.role}` : ""} ·{" "}
              </>
            )}
            <time dateTime={post.publishedAt}>{fmt(post.publishedAt)}</time>
            {post.updatedAt && (
              <>
                {" "}
                · Updated{" "}
                <time dateTime={post.updatedAt}>{fmt(post.updatedAt)}</time>
              </>
            )}
            {post.reviewedBy && <> · Reviewed by {post.reviewedBy}</>}
          </p>
        </header>
        {post.imageUrl && (
          <Image
            className={styles.hero}
            src={`${post.imageUrl}?w=1440&h=810&fit=crop&auto=format`}
            alt={post.imageAlt || ""}
            width={1440}
            height={810}
            priority
            sizes="(max-width: 760px) 100vw, 720px"
          />
        )}
        <PostBody value={post.body || []} />

        {post.faqs?.length ? (
          <section className={styles.faqs} aria-labelledby="post-faq">
            <h2 id="post-faq">Questions</h2>
            {post.faqs.map((f) => (
              <div key={f.question}>
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </section>
        ) : null}

        {post.sources?.length ? (
          <section className={styles.sources} aria-labelledby="post-sources">
            <h2 id="post-sources">Sources</h2>
            <ol>
              {post.sources.map((s) => (
                <li key={s.title}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {post.author?.name && (
          <section className={styles.author} aria-label="About the author">
            {post.author.imageUrl && (
              <Image
                src={`${post.author.imageUrl}?w=160&h=160&fit=crop&auto=format`}
                alt=""
                width={80}
                height={80}
              />
            )}
            <div>
              <p className={styles.authorName}>{post.author.name}</p>
              {post.author.role && (
                <p className={styles.authorRole}>{post.author.role}</p>
              )}
              {post.author.bio && (
                <p className={styles.authorBio}>{post.author.bio}</p>
              )}
            </div>
          </section>
        )}
      </article>
      <BookCta site={site} />
    </>
  );
}
