import Link from "next/link";
import type { BookingContent, LandingPage, SessionType, SiteSettings } from "@/content/types";
import { findMode } from "@/lib/booking";
import { telHref, waHref } from "@/lib/links";
import { Faq } from "../home/Faq";
import { CheckIcon } from "../ui/Icons";
import { PageHeader } from "../ui/PageHeader";
import styles from "./LandingView.module.css";

type Props = { page: LandingPage; plan: SessionType; booking: BookingContent; site: SiteSettings; others: { label: string; href: string }[] };

export function LandingView({ page, plan, booking, site, others }: Props) {
  const book = `/book/${plan.slug}`;
  const modes = [...new Set(plan.options.flatMap((o) => o.modes))]
    .map((m, i) => {
      const label = findMode(booking, m)?.label || m;
      return i ? label.charAt(0).toLowerCase() + label.slice(1) : label;
    })
    .join(" or ");
  return (
    <div className={`plan-${plan.theme}`}>
      <PageHeader title={page.title} sub={page.sub} crumbs={[{ name: "Home", href: "/" }, { name: "Sessions", href: "/sessions" }, { name: plan.label }]} />

      <section className={styles.intro} aria-label="Overview">
        <div className={`wrap ${styles.introGrid}`}>
          <div className={styles.lede}>
            {page.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <section className={styles.card} aria-label={`${plan.label} at a glance`}>
            <p className={styles.tag}>{plan.label}</p>
            <dl className={styles.facts}>
              <div>
                <dt>For</dt>
                <dd>{plan.forWho}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{modes}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>{plan.slotsText}</dd>
              </div>
              <div>
                <dt>Length</dt>
                <dd>{[...new Set(plan.options.map((o) => `${o.minutesText || o.minutes} min`))].join(", ")}</dd>
              </div>
            </dl>
            <Link className={`btn ${styles.cta}`} href={book}>
              Book now
            </Link>
            <p className={styles.speak}>
              Prefer to speak first? <a href={telHref(site)}>Call</a> or{" "}
              <a href={waHref(site)} target="_blank" rel="noopener">
                WhatsApp
              </a>{" "}
              {site.phoneDisplay}
            </p>
          </section>
        </div>
      </section>

      <div className={`wrap ${styles.body}`}>
        {page.sections.map((s) => (
          <section key={s.heading} className={styles.section}>
            <h2 className={styles.h2}>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.points?.length ? (
              <ul className={styles.points}>
                {s.points.map((pt) => (
                  <li key={pt}>
                    <CheckIcon size={18} className={styles.tick} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        {page.readMore && (
          <p className={styles.readMore}>
            Further reading: <Link href={page.readMore.href}>{page.readMore.label}</Link>
          </p>
        )}
      </div>

      <Faq c={{ heading: "Questions", subheading: `About ${plan.label} sessions.`, items: page.faq }} />

      <section className={styles.close} aria-labelledby="close-h">
        <div className="wrap">
          <h2 id="close-h" className={styles.closeTitle}>
            Ready when you are.
          </h2>
          <p className={styles.closeSub}>{plan.slotsText}.</p>
          <Link className={`btn ${styles.cta} ${styles.closeBtn}`} href={book}>
            Book now
          </Link>
          <nav className={styles.others} aria-label="Other plans">
            <span>Other plans:</span>
            {others.map((o) => (
              <Link key={o.href} href={o.href}>
                {o.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
