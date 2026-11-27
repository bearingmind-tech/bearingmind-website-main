"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { HomeContent } from "@/content/types";
import { SectionHead } from "../ui/SectionHead";
import styles from "./ResearchNotes.module.css";

/* All notes are in the HTML (readable by Google and AI); one is shown at a time. */
export function ResearchNotes({ c }: { c: HomeContent["research"] }) {
  const notes = c.notes;
  const [i, setI] = useState(0);
  const reduced = useSyncExternalStore(subscribeMotion, prefersReduced, () => false);
  const [userPaused, setPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduced;
  const [fading, setFading] = useState(false);
  const hover = useRef(false);

  const go = (n: number) => {
    setFading(true);
    window.setTimeout(() => {
      setI(((n % notes.length) + notes.length) % notes.length);
      setFading(false);
    }, 400);
  };

  useEffect(() => {
    if (paused || notes.length < 2) return;
    const id = window.setInterval(() => {
      if (!hover.current) go(i + 1);
    }, 9000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, notes.length]);

  if (!notes.length) return null;

  return (
    <section className={styles.research} id="research" aria-labelledby="rn-h">
      <div className={`wrap ${styles.inner}`}>
        <SectionHead id="rn-h" title={c.heading} sub={c.subheading} align="center" />
        <div
          className={`${styles.card} ${fading ? styles.fading : ""}`}
          onMouseEnter={() => (hover.current = true)}
          onMouseLeave={() => (hover.current = false)}
          onFocus={() => (hover.current = true)}
          onBlur={() => (hover.current = false)}
        >
          <ol className={styles.notes} aria-live="polite">
            {notes.map((n, k) => (
              <li key={n.text} hidden={k !== i}>
                <p className={styles.text}>{n.text}</p>
                <p className={styles.src}>{n.source}</p>
              </li>
            ))}
          </ol>
          <div className={styles.ctl}>
            <button type="button" aria-label="Previous note" onClick={() => go(i - 1)}>
              ‹
            </button>
            <button type="button" aria-label={paused ? "Play notes" : "Pause notes"} onClick={() => setPaused(!paused)}>
              {/* Icons, not letters, so the button's spoken name ("Pause notes") never conflicts with visible text */}
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                {paused ? <path d="M3 1.5v9l7.5-4.5z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /> : <path d="M3.5 1.5v9M8.5 1.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
              </svg>
            </button>
            <button type="button" aria-label="Next note" onClick={() => go(i + 1)}>
              ›
            </button>
            <span className={styles.count}>
              {i + 1} of {notes.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const prefersReduced = () => window.matchMedia(QUERY).matches;
