import type { HomeContent } from "@/content/types";
import { ShieldIcon } from "../ui/Icons";
import { SectionHead } from "../ui/SectionHead";
import styles from "./Approach.module.css";

type Props = { c: HomeContent["approach"]; withHead?: boolean; more?: boolean };

export function Approach({ c, withHead = true, more = false }: Props) {
  return (
    <section className={styles.section} id="approach" aria-labelledby="approach-h">
      <div className="wrap">
        {withHead ? (
          <div className={styles.intro}>
            <SectionHead id="approach-h" title={c.heading} more={more ? { href: "/approach", label: "See our approach" } : undefined} />
            <p className={styles.lede}>{c.lede}</p>
          </div>
        ) : (
          <h2 id="approach-h" className="sr-only">{c.heading}</h2>
        )}

        <div className={`${styles.areas} ${withHead ? "" : styles.flush}`}>
          {c.areas.map((area) => (
            <article key={area.title} className={styles.area}>
              <h3>{area.title}</h3>
              <ul>
                {area.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className={styles.note}>
          <ShieldIcon size={22} className={styles.noteIcon} />
          <span>{c.note}</span>
        </p>
      </div>
    </section>
  );
}
