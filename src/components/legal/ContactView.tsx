import Link from "next/link";
import type { BookingContent, SiteSettings } from "@/content/types";
import { telHref, waHref } from "@/lib/links";
import { ChatIcon, MailIcon, PhoneIcon, PinIcon } from "../ui/Icons";
import { PageHeader } from "../ui/PageHeader";
import styles from "./ContactView.module.css";

export function ContactView({ site, booking, plans }: { site: SiteSettings; booking: BookingContent; plans: Record<string, string> }) {
  const a = site.address;
  return (
    <>
      <PageHeader title="Contact" sub={`Call, WhatsApp, email, or visit us in ${a.street.split(",").pop()?.trim() || a.locality}, Bangalore.`} crumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.cards}>
          <a className={styles.card} href={telHref(site)}>
            <PhoneIcon size={22} />
            <span>
              <b>Phone</b>
              {site.phoneDisplay}
            </span>
          </a>
          <a className={styles.card} href={waHref(site)} target="_blank" rel="noopener">
            <ChatIcon size={22} />
            <span>
              <b>WhatsApp</b>
              {site.phoneDisplay}
            </span>
          </a>
          <a className={styles.card} href={`mailto:${site.email}`}>
            <MailIcon size={22} />
            <span>
              <b>Email</b>
              {site.email}
            </span>
          </a>
          <a className={styles.card} href={site.mapUrl} target="_blank" rel="noopener">
            <PinIcon size={22} />
            <span>
              <b>Address</b>
              {a.street}, {a.locality} {a.postalCode}
              <small>{a.landmark}</small>
            </span>
          </a>
        </div>

        <div className={styles.cols}>
          <section aria-labelledby="hours-h">
            <h2 id="hours-h" className={styles.h2}>Session times</h2>
            <dl className={styles.hours}>
              {booking.sessionTypes.map((t) => (
                <div key={t.key}>
                  <dt>
                    <Link href={plans[t.key] || `/book/${t.slug}`}>{t.label}</Link>
                  </dt>
                  <dd>{t.slotsText}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>
              Sessions are by appointment. <Link href="/book">Book a session</Link> online.
            </p>
          </section>

          <section aria-labelledby="go-h">
            <h2 id="go-h" className={styles.h2}>Privacy and grievances</h2>
            <p>
              Questions or complaints about your personal data go to our Grievance Officer, <strong>{site.founder.name}</strong>, at{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a> or {site.phoneDisplay}. See our <Link href="/privacy">privacy policy</Link>.
            </p>
            <h2 className={styles.h2}>For organisations</h2>
            <p>
              For leadership mentoring, manager training and workshops, <Link href="/organisations">send an enquiry</Link>.
            </p>
            <p className={styles.crisis}>
              This service is not for emergencies. If you or someone you know is in crisis, call <strong>Tele-MANAS on 14416</strong> or go to the nearest hospital.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
