import Link from "next/link";
import { SearchForm } from "./SearchForm";
import styles from "./NotFoundView.module.css";

const popular = [
  { label: "Book a session", href: "/book" },
  { label: "Sessions and fees", href: "/sessions" },
  { label: "About", href: "/about" },
  { label: "Questions", href: "/faq" },
];

export function NotFoundView() {
  return (
    <section className={styles.wrap} aria-labelledby="nf-h">
      <svg className={styles.compass} viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="70" />
        <polygon className={styles.n} points="100,38 108,100 92,100" />
        <polygon className={styles.s} points="100,162 108,100 92,100" />
        <circle className={styles.hub} cx="100" cy="100" r="6" />
      </svg>
      <p className={styles.code}>404</p>
      <h1 id="nf-h" className={styles.title}>This page has lost its bearing.</h1>
      <p className={styles.text}>The page you were looking for has moved or does not exist. Search the site, or return home.</p>
      <SearchForm />
      <Link className={`btn ghost ${styles.home}`} href="/">
        Return to home
      </Link>
      <nav aria-label="Popular pages" className={styles.popular}>
        {popular.map((p) => (
          <Link key={p.href} href={p.href}>
            {p.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
