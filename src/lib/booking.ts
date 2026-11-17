/* Booking rules shared by the browser and the server.
   All dates and times are Indian Standard Time, whatever the visitor's
   own device clock says, so a slot means the same thing everywhere. */
import type { BookingContent, SessionOption, SessionType } from "@/content/types";

export type Slot = { start: string; end: string; label: string };

const IST_OFFSET_MIN = 330;
const pad = (n: number) => String(n).padStart(2, "0");

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const fmtTime = (m: number) => {
  let h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad(mm)} ${ap}`;
};

const minToHHMM = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

/** Today's date in India, as YYYY-MM-DD. */
export function istToday(now = Date.now()): string {
  const d = new Date(now + IST_OFFSET_MIN * 60_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function dayOfWeek(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Milliseconds since epoch for an IST date and time. */
export function slotEpoch(key: string, time: string): number {
  const [y, m, d] = key.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, h, mi) - IST_OFFSET_MIN * 60_000;
}

export function dateParts(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export const formatDate = (key: string, opts: Intl.DateTimeFormatOptions) =>
  dateParts(key).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });

export const findType = (cfg: BookingContent, key: string) => cfg.sessionTypes.find((t) => t.key === key);
export const findOption = (t: SessionType | undefined, key: string) => t?.options.find((o) => o.key === key);
export const findMode = (cfg: BookingContent, key: string) => cfg.modes.find((m) => m.key === key);

export const isNamedSlots = (t: SessionType) => t.slots === "diningSlots";

export const inr = (cfg: BookingContent, n: number) => cfg.currency + n.toLocaleString("en-IN");
export const minText = (o: SessionOption) => `${o.minutesText || o.minutes} min`;
export const feeText = (cfg: BookingContent, o: SessionOption) =>
  inr(cfg, o.fee) + (o.perPerson ? ` + ${inr(cfg, o.perPerson)} per person` : "");

export function feeOf(o: SessionOption, members: number): number {
  return o.fee + (o.perPerson ? o.perPerson * members : 0);
}

export function typeFee(cfg: BookingContent, t: SessionType): string {
  const fees = t.options.map((o) => o.fee);
  const lo = Math.min(...fees);
  const from = fees.some((f) => f !== lo) || t.options.some((o) => o.perPerson);
  return (from ? "From " : "") + inr(cfg, lo);
}

/** All slots offered on a date for a session type and option (ignores bookings). */
export function slotsFor(cfg: BookingContent, t: SessionType, o: SessionOption, key: string): Slot[] {
  const dow = dayOfWeek(key);
  const dur = o.minutes;
  if (isNamedSlots(t)) {
    return cfg.diningSlots
      .filter((p) => p.days.includes(dow))
      .map((p) => {
        const end = Math.max(toMin(p.end), toMin(p.start) + dur);
        return {
          start: p.start,
          end: minToHHMM(end),
          label: `${p.label}, ${fmtTime(toMin(p.start))} to ${fmtTime(end)}`,
        };
      });
  }
  const set = cfg[t.slots] as { times: string[]; days: number[] };
  if (!set.days.includes(dow)) return [];
  return set.times.map((s) => ({ start: s, end: minToHHMM(toMin(s) + dur), label: fmtTime(toMin(s)) }));
}

export type SlotState = Slot & { taken: boolean };

export function slotsWithState(
  cfg: BookingContent,
  t: SessionType,
  o: SessionOption,
  key: string,
  booked: string[],
  now = Date.now(),
): SlotState[] {
  const soon = now + cfg.minNoticeHours * 3600_000;
  return slotsFor(cfg, t, o, key).map((s) => ({
    ...s,
    taken: booked.includes(`${key} ${s.start}`) || slotEpoch(key, s.start) < soon,
  }));
}

export function bookingWindow(cfg: BookingContent, now = Date.now()): string[] {
  const first = istToday(now);
  return Array.from({ length: cfg.bookingWindowDays }, (_, i) => addDays(first, i));
}

/** Human-readable "when", e.g. "Tuesday 21 October, 6:45 PM to 7:30 PM". */
export function whenText(t: SessionType, key: string, slot: Slot): string {
  const day = formatDate(key, { weekday: "long", day: "numeric", month: "long" });
  return `${day}, ${isNamedSlots(t) ? slot.label : `${fmtTime(toMin(slot.start))} to ${fmtTime(toMin(slot.end))}`}`;
}

export function sessionText(cfg: BookingContent, t: SessionType, o: SessionOption, members: number): string {
  return `${t.label}: ${o.label}${o.members ? ` (${members} members)` : ""}, ${minText(o)}`;
}

export type BookingRequest = {
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  type: string;
  option: string;
  members?: number;
  mode: string;
  date: string;
  time: string;
  topic: string;
  notes?: string;
  guardian?: boolean;
};

export type ValidBooking = {
  type: SessionType;
  option: SessionOption;
  members: number;
  slot: Slot;
  fee: number;
  when: string;
  session: string;
  modeSummary: string;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+\d{1,4}\d{6,13}$/;

/** Full server-side check: never trust the fee, slot or format sent by the browser. */
export function validateBooking(
  cfg: BookingContent,
  b: BookingRequest,
  now = Date.now(),
): { ok: true; value: ValidBooking } | { ok: false; error: string } {
  const name = (b.name || "").trim();
  if (name.length < 2 || name.length > 80) return { ok: false, error: "invalid_name" };
  if (!PHONE_RE.test((b.phone || "").replace(/\s/g, ""))) return { ok: false, error: "invalid_phone" };
  if (!EMAIL_RE.test((b.email || "").trim())) return { ok: false, error: "invalid_email" };
  if (!b.consent) return { ok: false, error: "consent_required" };
  const type = findType(cfg, b.type);
  const option = findOption(type, b.option);
  if (!type || !option) return { ok: false, error: "invalid_session" };
  if (type.guardian && !b.guardian) return { ok: false, error: "guardian_required" };
  if (!option.modes.includes(b.mode)) return { ok: false, error: "invalid_mode" };
  const members = option.members ? Number(b.members) : 0;
  if (option.members && !option.members.includes(members)) return { ok: false, error: "invalid_members" };
  if (!cfg.concerns.includes(b.topic)) return { ok: false, error: "invalid_topic" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !bookingWindow(cfg, now).includes(b.date))
    return { ok: false, error: "invalid_date" };
  const slot = slotsFor(cfg, type, option, b.date).find((s) => s.start === b.time);
  if (!slot) return { ok: false, error: "invalid_time" };
  if (slotEpoch(b.date, slot.start) < now + cfg.minNoticeHours * 3600_000) return { ok: false, error: "too_soon" };
  return {
    ok: true,
    value: {
      type,
      option,
      members,
      slot,
      fee: feeOf(option, members),
      when: whenText(type, b.date, slot),
      session: sessionText(cfg, type, option, members),
      modeSummary: findMode(cfg, b.mode)?.summary || b.mode,
    },
  };
}

export function newRef(now = Date.now()): string {
  const today = istToday(now).slice(2).replace(/-/g, "");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((n) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32])
    .join("");
  return `BM${today}${rand}`;
}
