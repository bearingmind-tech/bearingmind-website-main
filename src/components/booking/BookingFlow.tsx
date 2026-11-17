"use client";
import Link from "next/link";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { BookingContent, SiteSettings } from "@/content/types";
import {
  bookingWindow,
  dayOfWeek,
  feeOf,
  findMode,
  findOption,
  findType,
  formatDate,
  inr,
  istToday,
  minText,
  sessionText,
  slotsWithState,
  typeFee,
  whenText,
  type SlotState,
} from "@/lib/booking";
import { telHref, waHref } from "@/lib/links";
import { withTokens } from "@/lib/tokens";
import { CheckIcon, ClockIcon, LockIcon, PrintIcon, ShieldIcon } from "../ui/Icons";
import styles from "./BookingFlow.module.css";

type Stage = "schedule" | "details" | "pay" | "done";
type Payment =
  | { method: "razorpay"; keyId: string; orderId: string; amount: number; holdMinutes: number }
  | { method: "upi"; upiId: string; payee: string };
type Hold = { ref: string; fee: number; when: string; session: string; modeSummary: string; holdMinutes: number; demo: boolean; payment: Payment };
type RzpFailure = { error?: { description?: string; reason?: string } };

const ERRORS: Record<string, string> = {
  slot_taken: "This time was just taken by someone else. Please choose another time.",
  too_soon: "This time is now too close to book online. Please choose another, or call us.",
  too_many: "Too many booking attempts. Please wait a little, or call or WhatsApp us.",
  guardian_required: "For children, a parent or guardian needs to make the booking.",
  payment_unavailable: "Online payment is unavailable right now. Please try again shortly, or WhatsApp us.",
  network: "We could not reach our system. Please try again.",
};
const errorText = (code?: string) => (code && ERRORS[code]) || "Something went wrong. Please try again, or call or WhatsApp us.";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const post = (url: string, body: unknown) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then((r) => r.json())
    .catch(() => ({ ok: false, error: "network" }));

/* Wall-clock read, used only inside event handlers and timers */
const clock = () => Date.now();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mmss = (ms: number) => {
  const t = Math.ceil(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};
/* Errors worth retrying (our system was briefly unreachable); a bad signature is never retried. */
const RETRYABLE = new Set(["network", "verify_failed", "confirm_failed", "backend_error"]);

const noopSubscribe = () => () => {};
const readTypeParam = () => new URLSearchParams(window.location.search).get("type");

const upiLink = (id: string, payee: string, fee: number, ref: string) =>
  `upi://pay?pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(payee)}&am=${fee.toFixed(2)}&cu=INR&tn=${encodeURIComponent("BearingMind " + ref)}`;

export function BookingFlow({ cfg, site }: { cfg: BookingContent; site: SiteSettings }) {
  const copy = cfg.copy;
  const [stage, setStage] = useState<Stage>("schedule");
  const topRef = useRef<HTMLDivElement>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  /* ---- schedule: only raw picks are stored; dependent values are derived ---- */
  /* "Book this session" links here with ?type=… ; read after hydration so server and browser agree */
  const wanted = useSyncExternalStore(noopSubscribe, readTypeParam, () => null);
  const [pickedType, setTypeKey] = useState("");
  const type = findType(cfg, pickedType) || findType(cfg, wanted || "") || findType(cfg, cfg.defaultType) || cfg.sessionTypes[0];
  const typeKey = type.key;
  const [optKey, setOptKey] = useState("");
  const option = findOption(type, optKey) || type.options[0];
  const [pickedMembers, setMembers] = useState(4);
  const members = option.members ? (option.members.includes(pickedMembers) ? pickedMembers : option.members[0]) : 0;
  const [pickedMode, setMode] = useState("");
  const mode = option.modes.includes(pickedMode) ? pickedMode : option.modes[0];
  const [guardian, setGuardian] = useState(false);
  const [booked, setBooked] = useState<string[]>([]);
  const [pickedDate, setDate] = useState<string | null>(null);
  const [pickedStart, setPickedStart] = useState<string | null>(null);

  /* ---- details ---- */
  const [name, setName] = useState("");
  const [cc, setCc] = useState("+91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  /* ---- payment ---- */
  const [hold, setHold] = useState<Hold | null>(null);
  const [qr, setQr] = useState("");
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [doneText, setDoneText] = useState("");
  const [heldAt, setHeldAt] = useState(0);
  const [now, setNow] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [payNote, setPayNote] = useState("");
  const [paid, setPaid] = useState<{ paymentId: string; meetLink: string } | null>(null);

  /* Live countdown for the held slot, only while on the payment step */
  useEffect(() => {
    if (stage !== "pay" || !heldAt) return;
    const tick = () => setNow(clock());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [stage, heldAt]);

  const loadBooked = useCallback(
    () =>
      fetch("/api/slots", { cache: "no-store" })
        .then((x) => x.json())
        .then((r) => {
          if (r?.ok && Array.isArray(r.booked)) setBooked(r.booked);
        })
        .catch(() => {}),
    [],
  );
  useEffect(() => {
    loadBooked();
  }, [loadBooked]);

  const days = useMemo(
    () =>
      bookingWindow(cfg).map((key) => {
        const slots = slotsWithState(cfg, type, option, key, booked);
        return { key, open: slots.some((s) => !s.taken), slots };
      }),
    [cfg, type, option, booked],
  );
  const date = days.find((d) => d.key === pickedDate && d.open)?.key || days.find((d) => d.open)?.key || null;
  const daySlots = days.find((d) => d.key === date)?.slots || [];
  const slot: SlotState | null = daySlots.find((s) => s.start === pickedStart && !s.taken) || null;
  const fee = feeOf(option, members);
  const modeInfo = findMode(cfg, mode);

  const go = (s: Stage) => {
    setStage(s);
    setErrs({});
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  /* ---------- actions ---------- */
  function toDetails() {
    if (type.guardian && !guardian) return setErrs({ schedule: "For children, a parent or guardian needs to make the booking." });
    if (!slot) return setErrs({ schedule: "Choose a date and time to continue." });
    go("details");
  }

  async function toPayment() {
    const digits = phone.replace(/\D/g, "");
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter a name of at least 2 letters.";
    const phoneOk = cc.trim() === "+91" ? /^[6-9]\d{9}$/.test(digits) : /^\d{6,13}$/.test(digits);
    if (!/^\+\d{1,4}$/.test(cc.trim())) next.phone = "Enter a valid country code, e.g. +91.";
    else if (!phoneOk) next.phone = "Enter a valid mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (!topic) next.topic = "Choose your main concern so the session can be prepared.";
    if (!consent) next.consent = "Tick the box to continue.";
    setErrs(next);
    if (Object.keys(next).length || !date || !slot) return;

    setBusy(true);
    const r = await post("/api/booking/hold", {
      name: name.trim(),
      phone: cc.trim() + digits,
      email: email.trim(),
      consent,
      type: type.key,
      option: option.key,
      members: option.members ? members : undefined,
      mode,
      date,
      time: slot.start,
      topic,
      notes,
      guardian,
    });
    setBusy(false);
    if (!r.ok) {
      if (r.error === "slot_taken" || r.error === "too_soon") {
        loadBooked();
        setPickedStart(null);
        setStage("schedule");
        setErrs({ schedule: errorText(r.error) });
        return;
      }
      return setErrs({ details: errorText(r.error) });
    }
    setHold(r as Hold);
    setHeldAt(clock());
    setPaid(null);
    setPayNote("");
    if (r.payment.method === "upi") {
      QRCode.toDataURL(upiLink(r.payment.upiId, r.payment.payee, r.fee, r.ref), {
        width: 400,
        margin: 1,
        color: { dark: "#16251F", light: "#ffffff" },
        errorCorrectionLevel: "M",
      })
        .then(setQr)
        .catch(() => setQr(""));
    } else {
      loadRazorpay();
    }
    go("pay");
  }

  function changeBooking() {
    if (hold) post("/api/booking/release", { ref: hold.ref }).then(loadBooked);
    setHold(null);
    go("schedule");
  }

  async function payOnline() {
    if (!hold || hold.payment.method !== "razorpay") return;
    const pay = hold.payment;
    const left = heldAt + hold.holdMinutes * 60_000 - clock();
    if (left <= 0) return;
    setErrs({});
    setPayNote("");
    setBusy(true);
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setBusy(false);
      return setErrs({ pay: errorText("payment_unavailable") });
    }
    const rzp = new window.Razorpay({
      key: pay.keyId,
      amount: pay.amount,
      currency: "INR",
      order_id: pay.orderId,
      name: site.legalName,
      description: `${hold.session} · ${hold.ref}`,
      image: `${window.location.origin}/icon-512.png`,
      prefill: { name: name.trim(), email: email.trim(), contact: cc.trim() + phone.replace(/\D/g, "") },
      notes: { ref: hold.ref },
      theme: { color: "#1F4D3A" },
      /* Checkout closes itself before the hold ends, so nobody can pay for a slot that was released */
      timeout: Math.max(60, Math.floor((left - 30_000) / 1000)),
      retry: { enabled: true, max_count: 3 },
      remember_customer: false,
      handler: async (resp: Record<string, string>) => {
        setVerifying(true);
        let r: { ok: boolean; error?: string; status?: string; meetLink?: string } = { ok: false };
        for (let attempt = 0; attempt < 3; attempt++) {
          r = await post("/api/booking/verify", { ref: hold.ref, ...resp });
          if (r.ok || !RETRYABLE.has(r.error || "")) break;
          await sleep(1500 * (attempt + 1));
        }
        setVerifying(false);
        setBusy(false);
        if (!r.ok) {
          setErrs({
            pay: `Your payment was received, but we could not confirm the booking automatically. Your money is safe and your booking will be confirmed by email shortly. If you do not hear from us within an hour, WhatsApp ${site.phoneDisplay} with reference ${hold.ref}.`,
          });
          return;
        }
        setPaid({ paymentId: resp.razorpay_payment_id || "", meetLink: r.meetLink || "" });
        finish("online", r.status === "Paid – needs attention");
      },
      modal: {
        ondismiss: () => {
          setBusy(false);
          setPayNote("Payment not completed. Your time is still held, so you can try again.");
        },
      },
    });
    rzp.on("payment.failed", (f: unknown) => {
      const e = (f as RzpFailure).error;
      setErrs({
        pay: `${e?.description || "The payment did not go through."} You can try again or choose another method. If any amount was debited, it will be reversed to your account automatically.`,
      });
    });
    rzp.open();
  }

  async function submitUtr() {
    if (!hold) return;
    const clean = utr.replace(/\s/g, "");
    if (!/^[A-Za-z0-9]{10,35}$/.test(clean)) return setErrs({ utr: "Enter the UPI transaction reference from your payment app." });
    setErrs({});
    setBusy(true);
    const r = await post("/api/booking/upi", { ref: hold.ref, utr: clean });
    setBusy(false);
    if (!r.ok) return setErrs({ utr: `We could not reach our system. Please try again, or WhatsApp your UTR to ${site.phone}.` });
    finish("upi", false);
  }

  function finish(kind: "online" | "upi", conflict: boolean) {
    if (!hold) return;
    const venue =
      mode === "dining"
        ? " The hotel details will be shared with your confirmation."
        : mode === "inperson"
          ? " Our associate consultant will share the venue with your confirmation."
          : "";
    setDoneText(
      kind === "upi"
        ? `We will confirm by email to ${email.trim()} once your payment is verified, usually within a few hours.${venue}`
        : conflict
          ? "Your payment was received, but this time was taken while you were paying. We will contact you shortly to arrange a time that suits you."
          : `A confirmation${mode === "meet" ? " and calendar invite with your Google Meet link" : ""} has been sent to ${email.trim()}.${venue}`,
    );
    go("done");
  }

  /* ---------- render ---------- */
  const isOnline = hold?.payment.method === "razorpay";
  const remaining = hold && heldAt ? Math.max(0, heldAt + hold.holdMinutes * 60_000 - (now || heldAt)) : 0;
  const expired = Boolean(hold && heldAt && now && remaining === 0);
  const order: Stage[] = ["schedule", "details", "pay"];
  const curIndex = stage === "done" ? 3 : order.indexOf(stage);
  const whenLabel = date && slot ? whenText(type, date, slot) : null;

  const showBar = stage === "schedule" || stage === "details";

  return (
    <div className={styles.page} ref={topRef}>
      <div className={`wrap ${styles.intro}`}>
        <div>
          <h1 className={styles.title}>{copy.heading}</h1>
          <p className={styles.lede}>{copy.lede}</p>
        </div>
        <p className={styles.speak}>
          {withTokens(copy.preferToSpeak, {
            call: <a href={telHref(site)}>Call</a>,
            whatsapp: (
              <a href={waHref(site)} target="_blank" rel="noopener">
                WhatsApp
              </a>
            ),
            phone: site.phoneDisplay,
          })}
        </p>
      </div>

      <div className="wrap">
        <ol className={styles.stepper} aria-label="Booking progress">
          {copy.steps.map((st, i) => {
            const state = i < curIndex ? "done" : i === curIndex ? "on" : "";
            return (
              <li key={st.title} className={state === "done" ? styles.stepDone : state === "on" ? styles.stepOn : ""} aria-current={state === "on" ? "step" : undefined}>
                <span className={styles.dot}>{state === "done" ? <CheckIcon size={14} /> : i + 1}</span>
                <span className={styles.stepText}>
                  <b>{st.title}</b>
                  <small>{st.text}</small>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`wrap ${styles.layout} ${stage === "done" ? styles.single : ""}`}>
        <div className={styles.main}>
          {hold?.demo && stage !== "schedule" && (
            <p className={styles.demo}>Demo mode: the booking system is not connected yet, so nothing is saved or charged.</p>
          )}

          {stage === "schedule" && (
            <div className={`${styles.card} ${styles.withBar}`}>
              <h2 className={styles.h2}>{copy.scheduleHeading}</h2>

              <fieldset className={styles.block}>
                <legend className={styles.legend}>{copy.sessionTypeLabel}</legend>
                <div className={styles.types}>
                  {cfg.sessionTypes.map((t) => (
                    <label key={t.key} className={styles.type}>
                      <input
                        type="radio"
                        name="stype"
                        checked={t.key === typeKey}
                        onChange={() => {
                          setTypeKey(t.key);
                          setOptKey("");
                          setPickedStart(null);
                        }}
                      />
                      <span>
                        <b>{t.label}</b>
                        <small>{t.short}</small>
                        <em>{typeFee(cfg, t)}</em>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {type.options.length > 1 && (
                <fieldset className={styles.block}>
                  <legend className={styles.legend}>{copy.sessionForLabel}</legend>
                  <div className={styles.rows}>
                    {type.options.map((o) => (
                      <label key={o.key} className={styles.row}>
                        <input
                          type="radio"
                          name="who"
                          checked={o.key === option.key}
                          onChange={() => {
                            setOptKey(o.key);
                            setPickedStart(null);
                          }}
                        />
                        <span>
                          <b>{o.label}</b>
                          <small>
                            <ClockIcon size={14} /> {minText(o)}
                          </small>
                          <em>
                            {inr(cfg, o.fee)}
                            {o.perPerson ? <small> + {inr(cfg, o.perPerson)} per person</small> : null}
                          </em>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {option.members && (
                <div className={styles.block}>
                  <span className={styles.legend} id="members-label">{copy.membersLabel}</span>
                  <div className={styles.counter} role="group" aria-labelledby="members-label">
                    <button type="button" aria-label="Fewer members" onClick={() => setMembers(Math.max(option.members![0], members - 1))} disabled={members <= option.members[0]}>
                      −
                    </button>
                    <output aria-live="polite">{members}</output>
                    <button
                      type="button"
                      aria-label="More members"
                      onClick={() => setMembers(Math.min(option.members![option.members!.length - 1], members + 1))}
                      disabled={members >= option.members[option.members.length - 1]}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <fieldset className={styles.block}>
                <legend className={styles.legend}>{copy.formatLabel}</legend>
                <div className={styles.pills}>
                  {option.modes.map((m) => {
                    const info = findMode(cfg, m);
                    return (
                      <label key={m} className={styles.pill}>
                        <input type="radio" name="mode" checked={m === mode} onChange={() => setMode(m)} />
                        <span>
                          <b>{info?.label || m}</b>
                          {info?.sub && <small>{info.sub}</small>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {type.guardian && (
                <label className={`check ${styles.guardian}`}>
                  <input type="checkbox" checked={guardian} onChange={(e) => setGuardian(e.target.checked)} /> {copy.guardianLabel}
                </label>
              )}

              <div className={styles.block}>
                <div className={styles.when}>
                  <div>
                    <span className={styles.legend} id="date-label">{copy.dateLabel}</span>
                    <Calendar
                      days={days}
                      selected={date}
                      hint={copy.calendarHint}
                      onPick={(k) => {
                        setDate(k);
                        setPickedStart(null);
                      }}
                    />
                  </div>
                  <div>
                    <span className={styles.legend} id="time-label">{copy.timeLabel}</span>
                    {date ? (
                      <>
                        <p className={styles.dayLabel}>{formatDate(date, { weekday: "long", day: "numeric", month: "long" })}</p>
                        <div className={styles.times} role="group" aria-labelledby="time-label">
                          {daySlots.map((s) => (
                            <button key={s.start} type="button" className={styles.time} disabled={s.taken} aria-pressed={slot?.start === s.start} onClick={() => setPickedStart(s.start)}>
                              <span>{s.label}</span>
                              {s.taken && <small>Unavailable</small>}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className={styles.empty}>{copy.noSlots}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="err" role="alert">{errs.schedule}</div>
              <div className={styles.cardFoot}>
                <span className={styles.footHint}>{whenLabel || "Choose a date and time"}</span>
                <button className="btn" type="button" onClick={toDetails}>
                  {copy.detailsButton}
                </button>
              </div>
            </div>
          )}

          {stage === "details" && (
            <form
              className={`${styles.card} ${styles.withBar}`}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                toPayment();
              }}
            >
              <h2 className={styles.h2}>{copy.detailsHeading}</h2>
              <div className={styles.formGrid}>
                <div className={`field ${styles.full}`}>
                  <label className="label" htmlFor="name">{copy.nameLabel}</label>
                  <input className="input" id="name" autoComplete="nickname" placeholder={copy.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errs.name} />
                  <span className="hint">{copy.nameHint}</span>
                  <div className="err">{errs.name}</div>
                </div>
                <div className="field">
                  <label className="label" htmlFor="phone">{copy.phoneLabel}</label>
                  <div className={styles.phoneRow}>
                    <input className={`input ${styles.cc}`} aria-label="Country code" value={cc} onChange={(e) => setCc(e.target.value)} />
                    <input className="input" id="phone" type="tel" autoComplete="tel-national" inputMode="numeric" placeholder={copy.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errs.phone} />
                  </div>
                  <div className="err">{errs.phone}</div>
                </div>
                <div className="field">
                  <label className="label" htmlFor="email">{copy.emailLabel}</label>
                  <input className="input" id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />
                  <div className="err">{errs.email}</div>
                </div>
                <div className={`field ${styles.full}`}>
                  <label className="label" htmlFor="topic">{copy.concernLabel}</label>
                  <select className="input" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} aria-invalid={!!errs.topic}>
                    <option value="">Choose one</option>
                    {cfg.concerns.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <div className="err">{errs.topic}</div>
                </div>
                <div className={`field ${styles.full}`}>
                  <label className="label" htmlFor="notes">
                    {copy.notesLabel} <span className="optional">(optional)</span>
                  </label>
                  <textarea className="input" id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
                </div>
              </div>
              <label className="check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{withTokens(copy.consent, { privacy: <Link href="/privacy">Your privacy</Link> })}</span>
              </label>
              <div className="err">{errs.consent}</div>
              <div className="err" role="alert">{errs.details}</div>
              <div className={styles.cardFoot}>
                <button className="linkbtn" type="button" onClick={() => go("schedule")}>
                  Back
                </button>
                <button className="btn" type="submit" disabled={busy}>
                  {busy ? "Holding your slot…" : copy.toPayButton}
                </button>
              </div>
            </form>
          )}

          {stage === "pay" && hold && (
            <div className={`${styles.card} ${styles.payCard}`}>
              <div className={styles.payHead}>
                <div>
                  <h2 className={styles.h2Tight}>{isOnline ? copy.payHeadingOnline : copy.payHeadingUpi}</h2>
                  <p className={styles.paySub}>{copy.paySub}</p>
                </div>
                <p className={`${styles.timer} ${remaining < 120_000 ? styles.timerLow : ""} ${expired ? styles.timerOut : ""}`}>
                  <ClockIcon size={16} />
                  {expired ? (
                    <span>Hold ended</span>
                  ) : (
                    <span>
                      Slot held <b>{mmss(remaining)}</b>
                    </span>
                  )}
                </p>
              </div>

              {/* Itemised amount: always the server's figure */}
              <div className={styles.invoice}>
                <div className={styles.invLine}>
                  <span>
                    {hold.session}
                    <small>{hold.modeSummary} · {hold.when}</small>
                  </span>
                  <span>{inr(cfg, option.perPerson ? option.fee : hold.fee)}</span>
                </div>
                {option.perPerson ? (
                  <div className={styles.invLine}>
                    <span>
                      Additional family members
                      <small>{members} × {inr(cfg, option.perPerson)}</small>
                    </span>
                    <span>{inr(cfg, hold.fee - option.fee)}</span>
                  </div>
                ) : null}
                <div className={styles.invTotal}>
                  <span>
                    Total due
                    <small>Inclusive of all taxes</small>
                  </span>
                  <strong>{inr(cfg, hold.fee)}</strong>
                </div>
              </div>

              {hold.payment.method === "upi" ? (
                <>
                  <div className={styles.upi}>
                    <div className={styles.qr} aria-label="UPI QR code">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {qr ? <img src={qr} alt="UPI QR code" width={200} height={200} /> : <p className="hint">Use the UPI ID to pay</p>}
                    </div>
                    <div>
                      <div className={styles.upiId}>
                        <span>UPI ID</span>
                        <code>{hold.payment.upiId}</code>
                        <button
                          className="linkbtn"
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText((hold.payment as { upiId: string }).upiId);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          }}
                        >
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <a className="btn" href={upiLink(hold.payment.upiId, hold.payment.payee, hold.fee, hold.ref)}>
                        Pay with a UPI app
                      </a>
                      <p className="hint">{copy.upiHint}</p>
                    </div>
                  </div>
                  {expired && (
                    <p className={styles.payNote}>Your held time has ended. If you have already paid, enter the UTR below and we will confirm your booking by hand.</p>
                  )}
                  <div className={`field ${styles.utr}`}>
                    <label className="label" htmlFor="utr">{copy.utrLabel}</label>
                    <input className="input" id="utr" inputMode="numeric" placeholder={copy.utrPlaceholder} maxLength={35} value={utr} onChange={(e) => setUtr(e.target.value)} />
                    <span className="hint">{copy.utrHint}</span>
                    <div className="err" role="alert">{errs.utr}</div>
                  </div>
                  <div className={styles.cardFoot}>
                    <button className="linkbtn" type="button" onClick={changeBooking}>
                      {copy.changeBooking}
                    </button>
                    <button className="btn" type="button" onClick={submitUtr} disabled={busy}>
                      {busy ? "Sending…" : copy.paidButton}
                    </button>
                  </div>
                </>
              ) : expired ? (
                <div className={styles.expired} role="alert">
                  <p>
                    <b>Your held time has been released.</b> To keep booking fair for everyone, a time is held for {hold.holdMinutes} minutes while you pay. Nothing has been charged.
                  </p>
                  <button className="btn" type="button" onClick={changeBooking}>
                    Choose a time again
                  </button>
                </div>
              ) : (
                <>
                  <p className={styles.methodsLabel}>{copy.payOnlineBody}</p>
                  <ul className={styles.methods} aria-label="Accepted payment methods">
                    {["UPI", "Debit and credit cards", "Net banking", "Wallets"].map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>

                  {payNote && !errs.pay && <p className={styles.payNote}>{payNote}</p>}
                  {errs.pay && (
                    <p className={styles.payError} role="alert">
                      {errs.pay}
                    </p>
                  )}

                  <button className={`btn ${styles.payBtn}`} type="button" onClick={payOnline} disabled={busy}>
                    <LockIcon size={18} /> {busy ? "Opening secure checkout…" : `Pay ${inr(cfg, hold.fee)} securely`}
                  </button>
                  <p className={styles.secure}>
                    <ShieldIcon size={16} />
                    <span>
                      Payments are processed by Razorpay, a PCI DSS compliant payment gateway. We never see or store your card or bank details.
                    </span>
                  </p>
                  <div className={styles.cardFoot}>
                    <button className="linkbtn" type="button" onClick={changeBooking} disabled={busy}>
                      {copy.changeBooking}
                    </button>
                    <span className={styles.ref}>
                      Reference <b>{hold.ref}</b>
                    </span>
                  </div>
                </>
              )}
              {!isOnline && (
                <p className={styles.ref}>
                  Booking reference: <b>{hold.ref}</b>
                </p>
              )}

              {verifying && (
                <div className={styles.verifying} role="status" aria-live="polite">
                  <span className={styles.spinner} aria-hidden="true" />
                  <p>
                    <b>Confirming your payment…</b>
                    <span>Please do not close or refresh this page.</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {stage === "done" && hold && (
            <div className={`${styles.card} ${styles.done}`} role="status">
              <div className={styles.printHead}>
                <p className={styles.printName}>{site.legalName}</p>
                <p>
                  {site.address.street}, {site.address.locality} {site.address.postalCode} · {site.phoneDisplay} · {site.email}
                </p>
                <p className={styles.printTitle}>{isOnline ? "Payment receipt" : "Booking acknowledgement"}</p>
              </div>
              <span className={`${styles.doneIcon} ${styles.noPrint}`}>
                <CheckIcon size={30} />
              </span>
              <h2 className={`${styles.doneTitle} ${styles.noPrint}`}>{isOnline ? copy.doneHeadingOnline : copy.doneHeadingUpi}</h2>
              <dl className={styles.doneList}>
                <div><dt>Reference</dt><dd>{hold.ref}</dd></div>
                {paid?.paymentId && <div><dt>Payment ID</dt><dd>{paid.paymentId}</dd></div>}
                <div><dt>Session</dt><dd>{hold.session}</dd></div>
                <div><dt>Format</dt><dd>{hold.modeSummary}</dd></div>
                <div><dt>When</dt><dd>{hold.when}</dd></div>
                <div><dt>Name</dt><dd>{name.trim()}</dd></div>
                <div className={styles.doneAmount}>
                  <dt>{isOnline ? "Amount paid" : "Amount"}</dt>
                  <dd>
                    {inr(cfg, hold.fee)} <small>inclusive of all taxes</small>
                  </dd>
                </div>
                {isOnline && <div><dt>Status</dt><dd>Paid</dd></div>}
              </dl>
              <p className={styles.doneText}>{doneText}</p>
              {paid?.meetLink && (
                <p className={`${styles.doneText} ${styles.noPrint}`}>
                  <a href={paid.meetLink} target="_blank" rel="noopener">Your Google Meet link</a> is also in your calendar invite.
                </p>
              )}
              <div className={`${styles.doneActions} ${styles.noPrint}`}>
                <button className="btn ghost" type="button" onClick={() => window.print()}>
                  <PrintIcon size={18} /> {isOnline ? "Print or save receipt" : "Print or save"}
                </button>
                <Link className="btn" href="/">
                  {copy.backHome}
                </Link>
              </div>
            </div>
          )}
        </div>

        {stage !== "done" && (
          <aside className={styles.summary} aria-label="Booking summary">
            <h2 className={styles.sumTitle}>Your booking</h2>
            <dl className={styles.sumList}>
              <div><dt>Session</dt><dd>{sessionText(cfg, type, option, members)}</dd></div>
              <div><dt>Format</dt><dd>{modeInfo?.summary}</dd></div>
              <div><dt>When</dt><dd>{whenLabel || <span className={styles.muted}>Not chosen yet</span>}</dd></div>
              {stage !== "schedule" && name.trim() && <div><dt>Name</dt><dd>{name.trim()}</dd></div>}
            </dl>
            <div className={styles.total}>
              <span>Fee</span>
              <strong>{inr(cfg, fee)}</strong>
            </div>
            {option.perPerson ? (
              <p className={styles.breakdown}>
                {inr(cfg, option.fee)} + {members} × {inr(cfg, option.perPerson)}
              </p>
            ) : null}
            <ul className={styles.policy}>
              {copy.policy.map((p) => (
                <li key={p.label}>
                  <CheckIcon size={15} />
                  <span>
                    <b>{p.label}</b> {p.text}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {showBar && (
        <div className={styles.mobileBar}>
          <div>
            <strong>{inr(cfg, fee)}</strong>
            <small>{whenLabel || "Choose a date and time"}</small>
          </div>
          <button className="btn" type="button" onClick={() => (stage === "schedule" ? toDetails() : toPayment())} disabled={busy}>
            {stage === "schedule" ? copy.detailsButton : busy ? "Holding your slot…" : copy.toPayButton}
          </button>
        </div>
      )}
    </div>
  );
}

function Calendar({ days, selected, hint, onPick }: { days: { key: string; open: boolean }[]; selected: string | null; hint: string; onPick: (k: string) => void }) {
  const first = days[0]?.key || istToday();
  const last = days[days.length - 1]?.key || first;
  const m1 = formatDate(first, { month: "long" });
  const m2 = formatDate(last, { month: "long", year: "numeric" });
  const title = m1 === formatDate(last, { month: "long" }) ? m2 : `${m1} – ${m2}`;
  const lead = (dayOfWeek(first) + 6) % 7;
  return (
    <div className={styles.cal}>
      <div className={styles.calHead}>
        <b>{title}</b>
        <span>{hint}</span>
      </div>
      <div className={styles.calGrid} role="group" aria-labelledby="date-label">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className={styles.dow} aria-hidden="true">
            {d}
          </div>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <div key={`p${i}`} />
        ))}
        {days.map((d, i) => {
          const dayNum = Number(d.key.slice(8));
          const showMonth = i === 0 || dayNum === 1;
          return (
            <button
              key={d.key}
              type="button"
              className={`${styles.day} ${i === 0 ? styles.today : ""}`}
              disabled={!d.open}
              aria-pressed={selected === d.key}
              aria-label={formatDate(d.key, { weekday: "long", day: "numeric", month: "long" }) + (d.open ? "" : ", unavailable")}
              onClick={() => onPick(d.key)}
            >
              {showMonth && <small>{formatDate(d.key, { month: "short" })}</small>}
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
