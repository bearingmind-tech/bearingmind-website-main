import Link from "next/link";
import styles from "./PageHeader.module.css";

/* Top of each inner page: breadcrumb, title and the client's own subheading. */
export function PageHeader({ title, sub, crumbs }: { title: string; sub?: string; crumbs: { name: string; href?: string }[] }) {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.name}>
                {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className={styles.title}>{title}</h1>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
      <svg className={styles.rose} viewBox="0 0 400 400" aria-hidden="true">
        <circle cx="200" cy="200" r="186" />
        <circle cx="200" cy="200" r="150" />
        <circle cx="200" cy="200" r="104" />
        <path d="M200 40v320M40 200h320M87 87l226 226M313 87 87 313" />
        <polygon points="200,92 211,200 189,200" />
      </svg>
    </header>
  );
}
