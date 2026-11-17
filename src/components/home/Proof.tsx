import Link from "next/link";
import type { HomeContent } from "@/content/types";
import styles from "./Proof.module.css";

export function Proof({ c }: { c: HomeContent["proof"] }) {
  return (
    <section className={styles.proof} aria-label="Testimonials">
      <div className="wrap">
        <blockquote className={styles.quote}>{c.quote}</blockquote>
        <ul className={styles.lines}>
          {c.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className={styles.noquote}>{c.noQuote}</p>
        <p className={styles.cta}>
          <Link className="btn" href="/book">
            {c.cta}
          </Link>
        </p>
      </div>
    </section>
  );
}
