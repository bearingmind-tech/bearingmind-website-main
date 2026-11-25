import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/* Renders **bold** and [text](href) inside a line of legal or contact text */
export function RichLine({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index}>{m[1]}</strong>);
    else {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={m.index} href={href}>
            {m[2]}
          </Link>
        ) : (
          <a key={m.index} href={href}>
            {m[2]}
          </a>
        ),
      );
    }
    last = re.lastIndex;
  }
  out.push(text.slice(last));
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}
