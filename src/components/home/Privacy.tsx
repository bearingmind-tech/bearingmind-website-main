import type { HomeContent, SiteSettings } from "@/content/types";
import { SectionHead } from "../ui/SectionHead";
import { ShieldIcon } from "../ui/Icons";
import styles from "./Privacy.module.css";

type Props = { c: HomeContent["privacy"]; email: SiteSettings["email"]; withHead?: boolean; open?: boolean };

export function Privacy({ c, email, withHead = true, open = false }: Props) {
  return (
    <section className={styles.privacy} id="privacy" aria-labelledby="pv-h">
      <div className={`wrap ${styles.grid}`}>
        <div>
          {withHead ? <SectionHead id="pv-h" title={c.heading} sub={c.subheading} /> : <h2 id="pv-h" className="sr-only">{c.heading}</h2>}
        </div>
        <div>
          <p className={styles.intro}>
            <ShieldIcon size={24} className={styles.icon} />
            <span>{c.intro}</span>
          </p>
          <details className={styles.item} open={open}>
            <summary>{c.noticeTitle}</summary>
            <div className={styles.body}>
              {c.notice.map((n) => (
                <p key={n.label}>
                  <b>{n.label}</b> {n.text}
                </p>
              ))}
            </div>
          </details>
          <details className={styles.item} open={open}>
            <summary>{c.grievanceTitle}</summary>
            <div className={styles.body}>
              <p>
                {c.grievance} · <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
