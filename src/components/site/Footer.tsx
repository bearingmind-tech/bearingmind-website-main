import Link from "next/link";
import type { BookingContent, SiteSettings } from "@/content/types";
import { defaultLandings } from "@/content/landings";
import { getPosts } from "@/lib/content";
import { telHref, waHref } from "@/lib/links";
import { ChatIcon, MailIcon, PhoneIcon, PinIcon } from "../ui/Icons";
import styles from "./Footer.module.css";

const explore = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Approach", href: "/approach" },
  { label: "Sessions", href: "/sessions" },
  { label: "For organisations", href: "/organisations" },
  { label: "Questions", href: "/faq" },
  { label: "Contact", href: "/contact" },
];
const read = [
  { label: "Blog", href: "/blog" },
  { label: "Articles", href: "/articles" },
  { label: "Research notes", href: "/approach#research" },
  { label: "Your privacy", href: "/privacy" },
];

/* Readable names for profile links added under Website settings → Profiles elsewhere */
const PROFILE_NAMES: [RegExp, string][] = [
  [/(^|\.)(g\.page|maps\.app\.goo\.gl|google\.[a-z.]+|goo\.gl)$/, "Google"],
  [/linkedin\./, "LinkedIn"],
  [/instagram\./, "Instagram"],
  [/facebook\.|fb\.com/, "Facebook"],
  [/(^|\.)(x|twitter)\.com$/, "X"],
  [/youtube\.|youtu\.be/, "YouTube"],
  [/practo\./, "Practo"],
  [/justdial\./, "Justdial"],
];
function profileName(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return PROFILE_NAMES.find(([re]) => re.test(host))?.[1] || host;
  } catch {
    return null;
  }
}

export async function Footer({ site, booking }: { site: SiteSettings; booking: BookingContent }) {
  const a = site.address;
  /* No link to an empty Articles page */
  const hasArticles = (await getPosts("article")).length > 0;
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.top}`}>
        <div className={styles.brandCol}>
          <FooterLogo />
          <p className={styles.about}>{site.seoDescription}</p>
          <Link href="/book" className={`btn ${styles.book}`}>
            {site.bookLabel}
          </Link>
        </div>

        <nav className={styles.col} aria-label="Explore">
          <p className={styles.head}>Explore</p>
          <ul>
            {explore.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label="Sessions">
          <p className={styles.head}>Sessions</p>
          <ul>
            {booking.sessionTypes.map((t) => (
              <li key={t.key}><Link href={`/${defaultLandings.find((l) => l.plan === t.key)?.slug ?? `book/${t.slug}`}`}>{t.label}</Link></li>
            ))}
          </ul>
          <p className={styles.head}>Read</p>
          <ul>
            {read.filter((l) => hasArticles || l.href !== "/articles").map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className={styles.head}>Visit or contact</p>
          <address className={styles.contact}>
            <a href={site.mapUrl} target="_blank" rel="noopener">
              <PinIcon size={17} />
              <span>
                {a.street}
                <br />
                {a.locality} {a.postalCode}
                <br />
                <small>{a.landmark}</small>
              </span>
            </a>
            <a href={telHref(site)}><PhoneIcon size={17} /><span>{site.phoneDisplay}</span></a>
            <a href={waHref(site)} target="_blank" rel="noopener"><ChatIcon size={17} /><span>WhatsApp</span></a>
            <a href={`mailto:${site.email}`}><MailIcon size={17} /><span>{site.email}</span></a>
          </address>
          {site.sameAs.length > 0 && (
            <>
              <p className={styles.head}>Find us online</p>
              <ul className={styles.profiles}>
                {site.sameAs.map((url) => {
                  const name = profileName(url);
                  return name ? (
                    <li key={url}>
                      <a href={url} target="_blank" rel="me noopener">{name}</a>
                    </li>
                  ) : null;
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="wrap">
        <p className={styles.crisis}>{site.footerCrisis}</p>
      </div>

      <div className={styles.bottom}>
        <div className={`wrap ${styles.bottomInner}`}>
          <p>
            © {new Date().getFullYear()} {site.footerRights}
          </p>
          <nav className={styles.legal} aria-label="Policies">
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cancellation-and-refunds">Cancellation and refunds</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <p className={styles.credit}>
            Designed and maintained by{" "}
            <a href="https://www.ariartech.com" target="_blank" rel="noopener">
              Ariar Technology
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* Logo in light colours for the dark footer */
function FooterLogo() {
  return (
    <svg className={styles.logo} viewBox="0 0 230 70" role="img" aria-label="BearingMind Health Services">
      <path d="M6 46H32L45 33" fill="none" stroke="#E2C48F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="34" fontFamily="var(--serif)" fontSize="26" fontWeight="500" fill="#FFFFFF">BearingMind</text>
      <text x="61" y="55" fontFamily="var(--sans)" fontSize="11.5" letterSpacing="2.2" fill="#B7CBC1">HEALTH SERVICES</text>
    </svg>
  );
}
