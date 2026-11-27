import type React from "react";
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
        <p className={styles.strength}>
          {c.strength.split(/(?<=[.!?])\s+/).map((line, i) => (
            <span key={i} className={styles.line} style={{ "--i": i } as React.CSSProperties}>
              {line}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
