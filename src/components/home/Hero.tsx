import Link from "next/link";
import type { HomeContent } from "@/content/types";
import { Compass } from "./Compass";
import styles from "./Hero.module.css";

export function Hero({ c }: { c: HomeContent["hero"] }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-h">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.text}>
          <h1 id="hero-h" className={styles.title}>{c.heading}</h1>
          <p className={styles.lede}>{c.lede}</p>
          <div className={styles.actions}>
            <Link className="btn" href="/book">
              {c.primaryCta}
            </Link>
            <Link className="btn ghost" href="/#how">
              {c.secondaryCta}
            </Link>
          </div>
        </div>
        <Compass breathe={c.compassBreathe} caption={c.compassCaption} />
      </div>
    </section>
  );
}
