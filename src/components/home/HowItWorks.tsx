import type { HomeContent } from "@/content/types";
import { SectionHead } from "../ui/SectionHead";
import styles from "./HowItWorks.module.css";

export function HowItWorks({ c }: { c: HomeContent["how"] }) {
  return (
    <section className={styles.section} id="how" aria-labelledby="how-h">
      <div className="wrap">
        <SectionHead id="how-h" title={c.heading} />
        <ol className={styles.steps}>
          {c.steps.map((st, i) => (
            <li key={st.title}>
              <span className={styles.num} aria-hidden="true">{i + 1}</span>
              <h3 className={styles.title}>{st.title}</h3>
              <p className={styles.text}>{st.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
