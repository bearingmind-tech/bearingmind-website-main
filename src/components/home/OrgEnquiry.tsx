"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { istToday } from "@/lib/booking";
import styles from "./OrgEnquiry.module.css";

const TIMES = ["Morning, 9 AM to 12 PM", "Afternoon, 12 to 4 PM", "Evening, 4 to 7 PM"];
type Errors = Partial<Record<"name" | "org" | "phone" | "email" | "date" | "time" | "consent", string>>;

export function OrgEnquiry({ cta, initiallyOpen = false }: { cta: string; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || "").trim();
    const data = { name: v("name"), org: v("org"), phone: v("phone"), email: v("email"), date: v("date"), time: v("time"), need: v("need"), website: v("website") };
    const errs: Errors = {};
    if (data.name.length < 2) errs.name = "Enter the contact person's name.";
    if (data.org.length < 2) errs.org = "Enter the organisation's name.";
    if (!/^\+?[\d\s\-()]{8,18}$/.test(data.phone)) errs.phone = "Enter an office or mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errs.email = "Enter a valid email address.";
    if (!data.date || data.date < istToday()) errs.date = "Choose a day from today onwards.";
    if (!data.time) errs.time = "Choose a time.";
    if (!f.get("consent")) errs.consent = "Tick the box to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then((r) => r.json())
      .catch(() => ({ ok: false }));
    setSending(false);
    if (!res.ok) {
      setErrors({
        consent: res.error === "too_many" ? "We have already received your enquiry. We will be in touch." : "Could not send. Please email contact@bearingmind.com.",
      });
      return;
    }
    const when = new Date(`${data.date}T00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    setDone(`Thank you, ${data.name}. We will contact you on ${when}, ${data.time.toLowerCase()}. A confirmation has been sent to ${data.email}.`);
  }

  if (done) return <p className={styles.done} role="status">{done}</p>;

  return (
    <>
      <p className={styles.cta}>
        <button className={open ? "btn ghost" : "btn"} type="button" aria-expanded={open} aria-controls="orgForm" onClick={() => setOpen((o) => !o)}>
          {cta}
        </button>
      </p>
      <form id="orgForm" className={styles.form} hidden={!open} noValidate onSubmit={submit}>
        <div className={styles.grid}>
          <Field id="oName" name="name" label="Contact person" error={errors.name} autoComplete="name" />
          <Field id="oOrg" name="org" label="Organisation" error={errors.org} autoComplete="organization" />
          <Field id="oPhone" name="phone" label="Phone, office or mobile" type="tel" error={errors.phone} autoComplete="tel" placeholder="+91 80 0000 0000" />
          <Field id="oEmail" name="email" label="Email" type="email" error={errors.email} autoComplete="email" />
          <Field id="oDate" name="date" label="Best day to contact you" type="date" error={errors.date} min={istToday()} />
          <div className="field">
            <label className="label" htmlFor="oTime">Best time</label>
            <select className="input" id="oTime" name="time" defaultValue="">
              <option value="">Choose one</option>
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="err">{errors.time}</div>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="oNeed">
            What are you looking for? <span className="optional">(optional)</span>
          </label>
          <textarea className="input" id="oNeed" name="need" rows={2} />
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden="true" />
        <label className="check">
          <input type="checkbox" name="consent" />
          <span>
            I agree to be contacted about this enquiry, as described in our <Link href="/privacy">privacy policy</Link>.
          </span>
        </label>
        <div className="err">{errors.consent}</div>
        <button className={`btn ${styles.send}`} type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send enquiry"}
        </button>
      </form>
    </>
  );
}

function Field({ id, label, error, ...rest }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <input className="input" id={id} type={rest.type || "text"} aria-invalid={!!error} {...rest} />
      <div className="err">{error}</div>
    </div>
  );
}
