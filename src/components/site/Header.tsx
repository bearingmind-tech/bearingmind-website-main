"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/content/types";
import { telHref, waHref } from "@/lib/links";
import { ChatIcon, ChevronIcon, MailIcon, PhoneIcon, PinIcon } from "../ui/Icons";
import { Logo } from "./Logo";
import styles from "./Header.module.css";

type Props = {
  site: Pick<SiteSettings, "nav" | "bookLabel" | "phone" | "phoneDisplay" | "whatsapp" | "email" | "address" | "mapUrl">;
};

export function Header({ site }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const burgerRef = useRef<HTMLButtonElement>(null);

  /* Close the mobile menu after navigating */
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* While the menu is open: lock scrolling, make the page behind unreachable by keyboard
     and screen readers, move focus into the menu, and close on Escape (focus returns to the button). */
  useEffect(() => {
    const behind = [document.getElementById("main"), document.querySelector("footer")].filter(Boolean) as HTMLElement[];
    document.documentElement.style.overflow = open ? "hidden" : "";
    behind.forEach((el) => (open ? el.setAttribute("inert", "") : el.removeAttribute("inert")));
    if (!open) return;
    document.querySelector<HTMLElement>("#mobile-menu a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      burgerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className={styles.utility}>
        <div className={`wrap ${styles.utilityInner}`}>
          <a href={site.mapUrl} target="_blank" rel="noopener" className={styles.uLink}>
            <PinIcon size={15} /> {site.address.street}, {site.address.locality}
          </a>
          <div className={styles.uRight}>
            <a href={telHref(site as SiteSettings)} className={styles.uLink}>
              <PhoneIcon size={15} /> {site.phoneDisplay}
            </a>
            <a href={waHref(site as SiteSettings)} target="_blank" rel="noopener" className={styles.uLink}>
              <ChatIcon size={15} /> WhatsApp
            </a>
            <a href={`mailto:${site.email}`} className={styles.uLink}>
              <MailIcon size={15} /> {site.email}
            </a>
          </div>
        </div>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${open ? styles.menuOpen : ""}`}>
        <div className={`wrap ${styles.bar}`}>
          <Link className={styles.brand} href="/">
            <Logo className={styles.logo} />
          </Link>

          <nav className={styles.nav} aria-label="Main">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className={`${styles.link} ${active(item.href) ? styles.active : ""}`} aria-current={active(item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <Link className={`btn ${styles.cta}`} href="/book">
              {site.bookLabel}
            </Link>
            <button
              ref={burgerRef}
              type="button"
              className={styles.burger}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={`${styles.panel} ${open ? styles.panelOpen : ""}`} aria-hidden={!open} inert={!open}>
        <nav className={styles.panelNav} aria-label="Mobile">
          <Link href="/" className={`${styles.pLink} ${pathname === "/" ? styles.pActive : ""}`}>
            Home <ChevronIcon size={20} />
          </Link>
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className={`${styles.pLink} ${active(item.href) ? styles.pActive : ""}`}>
              {item.label} <ChevronIcon size={20} />
            </Link>
          ))}
        </nav>
        <div className={styles.panelSecondary}>
          <Link href="/articles">Articles</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <div className={styles.panelFoot}>
          <Link className={`btn ${styles.panelCta}`} href="/book">
            {site.bookLabel}
          </Link>
          <div className={styles.panelContact}>
            <a href={telHref(site as SiteSettings)}><PhoneIcon size={16} /> {site.phoneDisplay}</a>
            <a href={waHref(site as SiteSettings)} target="_blank" rel="noopener"><ChatIcon size={16} /> WhatsApp</a>
            <a href={`mailto:${site.email}`}><MailIcon size={16} /> {site.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
