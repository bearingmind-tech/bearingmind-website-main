import Image from "next/image";
import type { HomeContent } from "@/content/types";
import { CheckIcon } from "../ui/Icons";
import { SectionHead } from "../ui/SectionHead";
import styles from "./About.module.css";

type Props = { c: HomeContent["about"]; withHead?: boolean; more?: boolean };

export function About({ c, withHead = true, more = false }: Props) {
  const portrait = c.portraitUrl ? `${c.portraitUrl}?w=900&h=1125&fit=crop&crop=top&auto=format` : "/images/m-h-sharieff.jpg";
  return (
    <section className={styles.section} id="about" aria-labelledby={withHead ? "about-h" : undefined} aria-label={withHead ? undefined : c.heading}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.text}>
          {withHead ? (
            <SectionHead id="about-h" title={c.heading} more={more ? { href: "/about", label: "More about the practice" } : undefined} />
          ) : (
            <h2 className="sr-only">{c.name}</h2>
          )}
          <p className={styles.role}>{c.role}</p>
          <p className={styles.name}>{c.name}</p>
          <p className={styles.intro}>{c.intro}</p>

          <h3 className={styles.credHead}>{c.credentialsHeading}</h3>
          <ul className={styles.creds}>
            {c.credentials.map((cr) => (
              <li key={cr}>
                <CheckIcon size={18} className={styles.tick} />
                <span>{cr}</span>
              </li>
            ))}
          </ul>
          <p className={styles.disclaim}>{c.disclaimer}</p>
        </div>

        <div className={styles.visual}>
          <figure className={styles.portrait}>
            <Image src={portrait} width={900} height={1125} alt={c.portraitAlt} sizes="(max-width: 900px) 90vw, 460px" priority={!withHead} />
          </figure>
          <dl className={styles.regs} aria-label="Registrations">
            {c.registrations.map((r) => (
              <div key={r.label} className={r.badge ? styles.withBadge : undefined}>
                <dt>
                  {r.badge && <Image src={r.badge} width={120} height={120} alt="" className={styles.badge} />}
                  {r.label}
                </dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
