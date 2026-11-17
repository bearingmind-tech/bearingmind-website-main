import type { HomeContent } from "@/content/types";
import { CheckIcon } from "../ui/Icons";
import { SectionHead } from "../ui/SectionHead";
import { OrgEnquiry } from "./OrgEnquiry";
import styles from "./Organisations.module.css";

type Props = { c: HomeContent["organisations"]; withHead?: boolean; more?: boolean; formOpen?: boolean };

export function Organisations({ c, withHead = true, more = false, formOpen = false }: Props) {
  return (
    <section data-tone="dark" className={styles.section} id="organisations" aria-labelledby="org-h">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.left}>
          {withHead ? (
            <SectionHead id="org-h" title={c.heading} sub={c.subheading} tone="dark" more={more ? { href: "/organisations", label: "Programmes for organisations" } : undefined} />
          ) : (
            <h2 id="org-h" className="sr-only">{c.heading}</h2>
          )}
          <p className={styles.lede}>{c.lede}</p>
          <p className={styles.cred}>{c.credentials}</p>
        </div>

        <div className={styles.card} data-tone="light">
          <p className={styles.body}>{c.body}</p>
          <ul className={styles.list}>
            {c.offerings.map((o) => (
              <li key={o}>
                <CheckIcon size={18} className={styles.tick} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
          <OrgEnquiry cta={c.cta} initiallyOpen={formOpen} />
        </div>
      </div>
    </section>
  );
}
