import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchForm } from "@/components/ui/SearchForm";
import { searchSite } from "@/lib/search";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q || "").slice(0, 80);
  const hits = q ? await searchSite(q) : [];
  return (
    <>
      <PageHeader title="Search" crumbs={[{ name: "Home", href: "/" }, { name: "Search" }]} />
      <div className={`wrap ${styles.wrap}`}>
        <SearchForm defaultValue={q} autoFocus={!q} />
        {q && (
          <p className={styles.count} role="status">
            {hits.length ? `${hits.length} result${hits.length === 1 ? "" : "s"} for “${q}”` : `No results for “${q}”. Try another word, or browse the pages below.`}
          </p>
        )}
        {hits.length > 0 && (
          <ol className={styles.list}>
            {hits.map((h, i) => (
              <li key={`${h.path}-${i}`}>
                <Link href={h.path} className={styles.title}>
                  {h.title}
                </Link>
                <p className={styles.snippet}>{h.snippet}</p>
              </li>
            ))}
          </ol>
        )}
        {q && !hits.length && (
          <nav className={styles.browse} aria-label="Browse">
            <Link href="/sessions">Sessions</Link>
            <Link href="/about">About</Link>
            <Link href="/approach">Approach</Link>
            <Link href="/faq">Questions</Link>
            <Link href="/book">Book a session</Link>
          </nav>
        )}
      </div>
    </>
  );
}
