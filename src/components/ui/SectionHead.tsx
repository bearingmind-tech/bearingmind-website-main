import Link from "next/link";
import styles from "./SectionHead.module.css";

type Props = {
  title: string;
  sub?: string;
  id?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
  more?: { href: string; label: string };
  tone?: "light" | "dark";
};

/* One heading style for every section, so the whole site reads as one system. */
export function SectionHead({ title, sub, id, as = "h2", align = "left", more, tone = "light" }: Props) {
  const H = as;
  return (
    <div className={`${styles.head} ${align === "center" ? styles.center : ""} ${tone === "dark" ? styles.dark : ""}`}>
      <span className={styles.mark} aria-hidden="true" />
      <H id={id} className={styles.title}>{title}</H>
      {sub && <p className={styles.sub}>{sub}</p>}
      {more && (
        <Link href={more.href} className={`textlink ${styles.more}`}>
          {more.label}
        </Link>
      )}
    </div>
  );
}
