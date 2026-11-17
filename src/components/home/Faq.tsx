import type { HomeContent } from "@/content/types";
import { SectionHead } from "../ui/SectionHead";
import styles from "./Faq.module.css";

type Props = { c: HomeContent["faq"]; withHead?: boolean; more?: boolean };

export function Faq({ c, withHead = true, more = false }: Props) {
  return (
    <section className={styles.faq} id="faq" aria-labelledby="faq-h">
      <div className={`wrap ${styles.grid}`}>
        <div>
          {withHead ? (
            <SectionHead id="faq-h" title={c.heading} sub={c.subheading} more={more ? { href: "/faq", label: "All questions" } : undefined} />
          ) : (
            <h2 id="faq-h" className="sr-only">{c.heading}</h2>
          )}
        </div>
        <div>
          {c.items.map((q) => (
            <details key={q.question} className={styles.item}>
              <summary>
                <h3 className={styles.q}>{q.question}</h3>
              </summary>
              <p>{q.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
