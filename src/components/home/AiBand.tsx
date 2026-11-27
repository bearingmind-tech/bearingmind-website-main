import type { HomeContent } from "@/content/types";
import styles from "./AiBand.module.css";

export function AiBand({ c }: { c: HomeContent["aiBand"] }) {
  return (
    <section data-tone="dark" className={styles.band} aria-label="Our approach">
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.ornament} aria-hidden="true">
          <i />
          <b />
          <i />
        </span>
        <p className={styles.text}>
          <span className={styles.l1}>{c.line1}</span>
          {(c.line2Before || c.line2Emphasis || c.line2After) && (
            <span className={styles.l2}>
              {c.line2Before}
              {c.line2Emphasis && <em>{c.line2Emphasis}</em>}
              {c.line2After}
            </span>
          )}
        </p>
        <span className={`${styles.ornament} ${styles.flip}`} aria-hidden="true">
          <i />
          <b />
          <i />
        </span>
      </div>
    </section>
  );
}
