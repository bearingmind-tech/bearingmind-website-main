import Link from "next/link";
import type { LegalDoc } from "@/content/legal";
import { formatDate } from "@/lib/booking";
import { PageHeader } from "../ui/PageHeader";
import styles from "./LegalView.module.css";
import { RichLine } from "./RichLine";

export function LegalView({ doc, related }: { doc: LegalDoc; related: { label: string; href: string }[] }) {
  return (
    <>
      <PageHeader title={doc.title} sub={doc.sub} crumbs={[{ name: "Home", href: "/" }, { name: doc.title }]} />
      <div className={`wrap ${styles.wrap}`}>
        <article className={styles.doc}>
          <p className={styles.updated}>
            Last updated: <time dateTime={doc.updated}>{formatDate(doc.updated, { day: "numeric", month: "long", year: "numeric" })}</time>
          </p>
          {doc.sections.map((s) => (
            <section key={s.heading} className={styles.section}>
              <h2 className={styles.h2}>{s.heading}</h2>
              {s.body?.map((p) => (
                <p key={p}>
                  <RichLine text={p} />
                </p>
              ))}
              {s.points?.length ? (
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>
                      <RichLine text={p} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {s.after?.map((p) => (
                <p key={p}>
                  <RichLine text={p} />
                </p>
              ))}
            </section>
          ))}
        </article>
        <nav className={styles.related} aria-label="Related policies">
          <p>Related</p>
          <ul>
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>{r.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
