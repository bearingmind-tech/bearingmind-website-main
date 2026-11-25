/* Talks to the Google Apps Script web app (the Google Sheet "database").
   Only the server calls it, with a shared secret, so the sheet can never be
   written to directly from a browser. */
import "server-only";
import { serverEnv } from "./serverEnv";

const URL = serverEnv.appsScriptUrl;
const SECRET = serverEnv.appsScriptSecret;
export const backendConfigured = Boolean(URL && SECRET);

export type BackendResult = { ok: boolean; error?: string; [k: string]: unknown };

export async function callBackend(action: string, payload: Record<string, unknown> = {}): Promise<BackendResult> {
  if (!backendConfigured) return demo(action, payload);
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, secret: SECRET, ...payload }),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    });
    const text = await res.text();
    try {
      return JSON.parse(text) as BackendResult;
    } catch {
      console.error("Apps Script returned non-JSON:", res.status, text.slice(0, 300));
      return { ok: false, error: "backend_error" };
    }
  } catch (err) {
    console.error("Apps Script request failed:", err);
    return { ok: false, error: "network" };
  }
}

/* ---------- Demo mode (no Apps Script URL yet): keeps holds in memory ---------- */
const demoHolds = new Map<string, { slot: string; status: string }>();

function demo(action: string, p: Record<string, unknown>): BackendResult {
  console.log(`[demo backend] ${action}`, { ...p, notes: p.notes ? "(hidden)" : undefined });
  const slot = `${p.type} ${p.date} ${p.time}`;
  switch (action) {
    case "slots":
      return { ok: true, booked: [...demoHolds.values()].map((h) => h.slot), demo: true };
    case "hold":
      if ([...demoHolds.values()].some((h) => h.slot === slot)) return { ok: false, error: "slot_taken" };
      demoHolds.set(String(p.ref), { slot, status: "Pending payment" });
      return { ok: true, demo: true };
    case "release":
      demoHolds.delete(String(p.ref));
      return { ok: true };
    case "confirm":
    case "upi_submit": {
      const h = demoHolds.get(String(p.ref));
      if (!h) return { ok: false, error: "not_found" };
      h.status = action === "confirm" ? "Confirmed" : "Payment to verify";
      return { ok: true, demo: true };
    }
    default:
      return { ok: true, demo: true };
  }
}
