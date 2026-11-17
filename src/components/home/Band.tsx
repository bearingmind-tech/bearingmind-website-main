import type { HomeContent } from "@/content/types";
import styles from "./Band.module.css";

export function Band({ c }: { c: HomeContent["band"] }) {
  return (
    <section className={styles.band} aria-label="Mental health in numbers">
      <div className="wrap">
        <p className={styles.fig}>
          {c.figure}
          <span className={styles.src}>{c.source}</span>
        </p>
        <p className={styles.strength}>{c.strength}</p>
      </div>
    </section>
  );
}
