import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import styles from "./Blog.module.css";

type Img = { url?: string; alt?: string; caption?: string; dimensions?: { width: number; height: number } };

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: Img }) =>
      value.url ? (
        <figure className={styles.figure}>
          <Image
            src={`${value.url}?w=1200&auto=format`}
            alt={value.alt || ""}
            width={value.dimensions?.width || 1200}
            height={value.dimensions?.height || 800}
            sizes="(max-width: 760px) 100vw, 720px"
          />
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      ) : null,
  },
  marks: {
    link: ({ children, value }) => {
      /* Only web, email and phone links are allowed; anything else (e.g. javascript:) is dropped */
      const raw: string = String(value?.href || "");
      const href = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(raw) ? raw : "#";
      const external = /^https?:/.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
          {children}
        </a>
      );
    },
  },
};

export function PostBody({ value }: { value: unknown[] }) {
  return (
    <div className={styles.body}>
      <PortableText value={value as never} components={components} />
    </div>
  );
}
