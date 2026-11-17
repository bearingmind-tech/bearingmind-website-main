"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./Compass.module.css";

/* A working compass.
   - Phones and tablets: the needle points to real north on its own, using the
     device's compass sensor, and the heading is shown below. Android starts at
     once; iPhone and iPad need one tap anywhere (Apple only lets a page read the
     compass after a tap), then it stays live.
   - Computers (no compass sensor): the needle turns gently towards the pointer.
   - Reduced motion: the needle rests on north.
   Performance: the moving parts are separate GPU layers; the needle only animates
   while it is actually turning, and the breathing circles pause when off screen. */

const ticks = Array.from({ length: 72 }, (_, i) => {
  const deg = i * 5;
  const major = deg % 45 === 0;
  const len = major ? 14 : deg % 15 === 0 ? 8 : 5;
  const a = ((deg - 90) * Math.PI) / 180;
  const p = (r: number) => [+(200 + r * Math.cos(a)).toFixed(1), +(200 + r * Math.sin(a)).toFixed(1)];
  const [x1, y1] = p(150);
  const [x2, y2] = p(150 + len);
  return { x1, y1, x2, y2, major };
});

const POINTS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const cardinal = (deg: number) => POINTS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];

type OrientationEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
type PermissionApi = { requestPermission?: () => Promise<"granted" | "denied"> };

const RAD = Math.PI / 180;

/* Which way the top of the screen faces, in degrees from north (0–360). */
function headingFrom(ev: OrientationEvt, absolute: boolean): number | null {
  let h: number | null = null;
  if (typeof ev.webkitCompassHeading === "number" && ev.webkitCompassHeading >= 0) {
    h = ev.webkitCompassHeading; // iPhone / iPad: already corrected for tilt
  } else if (absolute && typeof ev.alpha === "number") {
    const alpha = ev.alpha, beta = ev.beta ?? 0, gamma = ev.gamma ?? 0;
    if (Math.abs(beta) < 45 && Math.abs(gamma) < 45) {
      h = 360 - alpha; // lying fairly flat
    } else {
      /* Held upright: work out where the screen's top edge points (W3C formula) */
      const x = beta * RAD, y = gamma * RAD, z = alpha * RAD;
      const vx = -Math.cos(z) * Math.sin(y) - Math.sin(z) * Math.sin(x) * Math.cos(y);
      const vy = -Math.sin(z) * Math.sin(y) + Math.cos(z) * Math.sin(x) * Math.cos(y);
      h = Math.atan2(vx, vy) / RAD;
    }
  }
  if (h === null || Number.isNaN(h)) return null;
  /* Landscape: the top edge of the screen is a side of the phone */
  const angle = screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0;
  return (((h + angle) % 360) + 360) % 360;
}

export function Compass({ breathe, caption }: { breathe: string; caption: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const marksRef = useRef<SVGSVGElement>(null);
  const liveRef = useRef(false);
  const target = useRef(0);
  const current = useRef(-48);
  const raf = useRef(0);
  const reduced = useRef(false);
  const shown = useRef<number | null>(null);
  const [live, setLive] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const tapToStart = useSyncExternalStore(noop, needsTapToStart, () => false);
  const [asked, setAsked] = useState(false);
  const needsTap = tapToStart && !asked;
  const [onScreen, setOnScreen] = useState(true);

  /* Turn the needle towards its target, the shorter way round, and stop once it arrives */
  const kick = useCallback(() => {
    if (raf.current || reduced.current) return;
    const step = () => {
      const diff = ((target.current - current.current + 540) % 360) - 180;
      if (Math.abs(diff) < 0.05) {
        raf.current = 0;
        return;
      }
      current.current += diff * 0.09;
      const turn = `rotate(${current.current.toFixed(2)}deg)`;
      if (needleRef.current) needleRef.current.style.transform = turn;
      /* Live compass: the whole dial turns with the needle, so N on the dial faces real north */
      if (liveRef.current && marksRef.current) marksRef.current.style.transform = turn;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      current.current = 0;
      if (needleRef.current) needleRef.current.style.transform = "rotate(0deg)";
    } else {
      kick(); // settle from the starting angle onto north
    }
    const el = wrapRef.current;
    const io = el ? new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "100px" }) : null;
    if (el && io) io.observe(el);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      io?.disconnect();
    };
  }, [kick]);

  /* Computers: follow the pointer while it is over the hero area */
  useEffect(() => {
    if (live) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const zone = wrapRef.current?.closest("section") || document.body;
    const onMove = (e: PointerEvent) => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.width / 2);
      target.current = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      kick();
    };
    const onLeave = () => {
      target.current = 0;
      kick();
    };
    zone.addEventListener("pointermove", onMove as EventListener, { passive: true });
    zone.addEventListener("pointerleave", onLeave);
    return () => {
      zone.removeEventListener("pointermove", onMove as EventListener);
      zone.removeEventListener("pointerleave", onLeave);
    };
  }, [live, kick]);

  /* Phones and tablets: real heading from the compass sensor, started automatically */
  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) return;
    let stopped = false;
    let detach = () => {};

    const listen = () => {
      const absEvt = "ondeviceorientationabsolute" in window;
      const onOrient = (e: Event) => {
        const ev = e as OrientationEvt;
        const h = headingFrom(ev, absEvt || ev.absolute === true);
        if (h === null) return;
        target.current = -h; // the needle keeps pointing north as the device turns
        kick();
        const r = Math.round(h) % 360;
        if (shown.current !== r) {
          if (shown.current === null) {
            liveRef.current = true;
            setLive(true);
          }
          shown.current = r;
          setHeading(r);
        }
      };
      const name = absEvt ? "deviceorientationabsolute" : "deviceorientation";
      window.addEventListener(name, onOrient);
      detach = () => window.removeEventListener(name, onOrient);
    };

    const api = window.DeviceOrientationEvent as unknown as PermissionApi;
    if (typeof api.requestPermission !== "function") {
      listen(); // Android and others: no permission needed
    } else if (needsTapToStart()) {
      /* iPhone / iPad: Apple allows the compass only after a tap, so the first
         tap anywhere on the page switches it on. Scrolling does not count. */
      const arm = (on: boolean) => {
        const fn = on ? document.addEventListener : document.removeEventListener;
        fn.call(document, "touchend", ask, true);
        fn.call(document, "click", ask, true);
      };
      function ask() {
        arm(false);
        api.requestPermission!()
          .then((res) => {
            if (stopped) return;
            setAsked(true);
            if (res === "granted") listen();
          })
          .catch(() => !stopped && arm(true)); // not counted as a tap (e.g. end of a scroll): wait for the next one
      }
      arm(true);
      const prev = detach;
      detach = () => {
        prev();
        arm(false);
      };
    }
    return () => {
      stopped = true;
      detach();
    };
  }, [kick]);

  return (
    <div className={`${styles.compass} ${onScreen ? "" : styles.paused}`} ref={wrapRef}>
      <div className={styles.dial} aria-hidden="true">
        <span className={styles.face} />
        <span className={styles.breath} />
        <span className={`${styles.ring} ${styles.ring1}`} />
        <span className={`${styles.ring} ${styles.ring2}`} />
        <svg className={styles.marks} ref={marksRef} viewBox="0 0 400 400" focusable="false">
          <circle cx="200" cy="200" r="186" className={styles.ringOuter} />
          <circle cx="200" cy="200" r="150" className={styles.ringInner} />
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={t.major ? styles.tkMajor : styles.tk} />
          ))}
          <text x="200" y="76" className={`${styles.pt} ${styles.ptN}`}>N</text>
          <text x="324" y="208" className={styles.pt}>E</text>
          <text x="200" y="340" className={styles.pt}>S</text>
          <text x="76" y="208" className={styles.pt}>W</text>
        </svg>
        {live && <span className={styles.lubber} />}
        <div className={styles.needle} ref={needleRef} style={{ transform: "rotate(-48deg)" }}>
          <svg viewBox="0 0 400 400" focusable="false">
            <polygon points="200,92 211,200 189,200" className={styles.ndN} />
            <polygon points="200,308 211,200 189,200" className={styles.ndS} />
            <circle cx="200" cy="200" r="9" className={styles.hub} />
            <circle cx="200" cy="200" r="3" className={styles.hubDot} />
          </svg>
        </div>
      </div>

      <p className={styles.caption}>
        <span className={styles.b1}>{breathe}</span> {caption}
      </p>

      <div className={styles.live} aria-live="polite">
        {live && heading !== null ? (
          <p className={styles.reading}>
            {heading}° {cardinal(heading)}
          </p>
        ) : needsTap ? (
          <p className={styles.hint}>Tap anywhere to point it north</p>
        ) : null}
      </div>
    </div>
  );
}

/* iPhone and iPad: the compass needs one tap before Apple lets the page read it */
const noop = () => () => {};
const needsTapToStart = () =>
  "DeviceOrientationEvent" in window &&
  typeof (window.DeviceOrientationEvent as unknown as PermissionApi).requestPermission === "function" &&
  (navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);
