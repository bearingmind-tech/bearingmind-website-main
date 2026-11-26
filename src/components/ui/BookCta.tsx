import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { telHref, waHref } from "@/lib/links";
import styles from "./BookCta.module.css";

/* The closing "Book now" box at the end of a page */
export function BookCta({ site }: { site: SiteSettings }) {
  return (
    <section className={styles.wrapOuter} aria-labelledby="book-cta-h">
      <div className={`wrap`}>
        <div className={styles.box}>
          <div>
            <h2 id="book-cta-h" className={styles.title}>
              Ready when you are.
            </h2>
            <p className={styles.text}>Choose your plan and book online in three short steps. Everything you share stays confidential.</p>
          </div>
          <div className={styles.actions}>
            <Link className={`btn ${styles.book}`} href="/book">
              Book now
            </Link>
            <p className={styles.speak}>
              or <a href={telHref(site)}>call</a> /{" "}
              <a href={waHref(site)} target="_blank" rel="noopener">
                WhatsApp
              </a>{" "}
              {site.phoneDisplay}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
