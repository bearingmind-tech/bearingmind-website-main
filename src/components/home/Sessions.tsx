import Link from "next/link";
import type { BookingContent, HomeContent, SiteSettings } from "@/content/types";
import { inr, minText, typeFee } from "@/lib/booking";
import { telHref, waHref } from "@/lib/links";
import { withTokens } from "@/lib/tokens";
import { ClockIcon, PinIcon } from "../ui/Icons";
import { SectionHead } from "../ui/SectionHead";
import styles from "./Sessions.module.css";

type Props = { c: HomeContent["sessions"]; booking: BookingContent; site: SiteSettings; withHead?: boolean; more?: boolean };

export function Sessions({ c, booking, site, withHead = true, more = false }: Props) {
  /* Fees are hidden unless switched on in the Studio; the booking flow always shows them before payment. */
  const showFees = booking.showFeesPublicly;
  return (
    <section className={`${styles.section} ${withHead ? "" : styles.sectionFlush}`} id="sessions" aria-labelledby="sessions-h">
      <div className="wrap">
        {withHead ? (
          <SectionHead id="sessions-h" title={c.heading} sub={c.subheading} more={more ? { href: "/sessions", label: "Compare all sessions" } : undefined} />
        ) : (
          <h2 id="sessions-h" className="sr-only">{c.heading}</h2>
        )}

        <div className={`${styles.grid} ${withHead ? "" : styles.flush}`}>
          {booking.sessionTypes.map((t) => {
            const [from, amount] = !showFees ? ["", ""] : typeFee(booking, t).startsWith("From ") ? ["From", typeFee(booking, t).slice(5)] : ["", typeFee(booking, t)];
            return (
              <article key={t.key} id={t.key} className={`${styles.card} plan-${t.theme}`} aria-labelledby={`s-${t.key}`}>
                {t.premium && <p className={styles.tag}>By reservation</p>}
                <div className={styles.body}>
                <header className={styles.top}>
                  <h3 id={`s-${t.key}`} className={styles.name}>{t.label}</h3>
                  {!t.hideCardIntro && (
                    <>
                      <p className={styles.forWho}>{t.forWho}</p>
                      <p className={styles.short}>{t.short}</p>
                    </>
                  )}
                  {showFees && (
                    <p className={styles.price}>
                      {from && <span className={styles.from}>{from}</span>}
                      <span className={styles.amount}>{amount}</span>
                    </p>
                  )}
                </header>

                <dl className={styles.meta}>
                  {!t.premium && (
                    <div>
                      <dt>Mode</dt>
                      <dd>{t.modeText}</dd>
                    </div>
                  )}
                  <div>
                    <dt><ClockIcon size={15} /> Slots</dt>
                    <dd>{t.slotsText}</dd>
                  </div>
                </dl>

                <p className={styles.note}>{t.note}</p>
                </div>

                <table className={styles.fees}>
                  <caption className="sr-only">{showFees ? "Fees" : "Options"} for {t.label}</caption>
                  <thead className="sr-only">
                    <tr><th scope="col">Session</th><th scope="col">Duration</th>{showFees && <th scope="col">Fee</th>}</tr>
                  </thead>
                  <tbody>
                    {t.premium && t.options.length > 1 ? (
                      /* Public Figures: one combined row, e.g. "Couple/Individual · 120/90 min" */
                      <tr>
                        <th scope="row">{[...t.options].reverse().map((o) => o.label).join("/")}</th>
                        <td className={`${styles.dur} ${showFees ? "" : styles.durEnd}`}>
                          {[...t.options].reverse().map((o) => o.minutesText || o.minutes).join("/")} min
                        </td>
                        {showFees && (
                          <td className={styles.fee}>{[...t.options].reverse().map((o) => inr(booking, o.fee)).join(" / ")}</td>
                        )}
                      </tr>
                    ) : t.options.map((o) => (
                      <tr key={o.key}>
                        <th scope="row">{t.options.length === 1 ? "Per session" : o.label}</th>
                        <td className={`${styles.dur} ${showFees ? "" : styles.durEnd}`}>{minText(o)}</td>
                        {showFees && (
                          <td className={styles.fee}>
                            {inr(booking, o.fee)}
                            {o.perPerson ? <small> + {inr(booking, o.perPerson)} per person</small> : null}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.foot}>
                  <Link className={`btn ${styles.cta}`} href={`/book/${t.slug}`}>
                    Book now
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.notes}>
          <p>
            {showFees ? c.feeNote : c.feeHiddenNote} <Link href="/book">{c.feeNoteLink}</Link>
          </p>
          <p>
            <PinIcon size={16} className={styles.noteIcon} />
            <span>
              {withTokens(c.diningNote, {
                call: <a href={telHref(site)}>call</a>,
                whatsapp: (
                  <a href={waHref(site)} target="_blank" rel="noopener">
                    WhatsApp
                  </a>
                ),
                phone: site.phoneDisplay,
              })}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
