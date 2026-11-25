import Link from "next/link";
import type { BookingContent, SiteSettings } from "@/content/types";
import { inr, minText } from "@/lib/booking";
import { telHref, waHref } from "@/lib/links";
import { withTokens } from "@/lib/tokens";
import styles from "./PlanChooser.module.css";

export function PlanChooser({ cfg, site }: { cfg: BookingContent; site: SiteSettings }) {
  return (
    <div className={styles.page}>
      <div className={`wrap ${styles.intro}`}>
        <div>
          <h1 className={styles.title}>{cfg.copy.heading}</h1>
          <p className={styles.lede}>Choose your plan. Each has its own times and its own booking calendar.</p>
        </div>
        <p className={styles.speak}>
          {withTokens(cfg.copy.preferToSpeak, {
            call: <a href={telHref(site)}>Call</a>,
            whatsapp: (
              <a href={waHref(site)} target="_blank" rel="noopener">
                WhatsApp
              </a>
            ),
            phone: site.phoneDisplay,
          })}
        </p>
      </div>

      <div className={`wrap ${styles.grid}`}>
        {cfg.sessionTypes.map((t) => (
          <Link key={t.key} href={`/book/${t.slug}`} className={`${styles.card} plan-${t.theme}`}>
            <span className={styles.tag}>{t.premium ? "By reservation" : t.options[0].modes.length > 1 ? "Online or in person" : "Online"}</span>
            <h2 className={styles.name}>{t.label}</h2>
            <p className={styles.short}>{t.short}</p>
            <dl className={styles.facts}>
              <div>
                <dt>For</dt>
                <dd>{t.forWho}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>{t.slotsText}</dd>
              </div>
            </dl>
            <ul className={styles.fees}>
              {t.options.map((o) => (
                <li key={o.key}>
                  <span>{t.options.length > 1 ? o.label : "Per session"} · {minText(o)}</span>
                  <b>{inr(cfg, o.fee)}</b>
                </li>
              ))}
            </ul>
            <span className={styles.cta}>
              Book now
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
