import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/content/types";
import { PageHeader } from "../ui/PageHeader";
import styles from "./Blog.module.css";

export function PostIndex({ title, intro, posts, base }: { title: string; intro: string; posts: PostSummary[]; base: string }) {
  return (
    <>
    <PageHeader title={title} sub={intro} crumbs={[{ name: "Home", href: "/" }, { name: title }]} />
    <div className={`wrap ${styles.index}`}>
      {posts.length ? (
        <ul className={styles.list}>
          {posts.map((p) => (
            <li key={p.slug}>
              <article className={styles.card}>
                {p.imageUrl && (
                  <Image className={styles.thumb} src={`${p.imageUrl}?w=720&h=405&fit=crop&auto=format`} alt={p.imageAlt || ""} width={720} height={405} sizes="(max-width: 760px) 100vw, 340px" />
                )}
                <div>
                  <time className={styles.date} dateTime={p.publishedAt}>
                    {new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                  <h2 className={styles.cardTitle}>
                    <Link href={`${base}/${p.slug}`}>{p.title}</Link>
                  </h2>
                  {p.excerpt && <p className={styles.excerpt}>{p.excerpt}</p>}
                  {p.authorName && <p className={styles.by}>By {p.authorName}</p>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>New posts are on their way.</p>
      )}
    </div>
    </>
  );
}
