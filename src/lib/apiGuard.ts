/* Gatekeeper for the public API routes (booking, enquiry, slots).
   - Same-origin only: requests from other websites are refused (no CORS, no "*").
   - JSON only, small bodies only.
   - Rate limits per visitor, so scripts cannot flood bookings or emails.
   Webhooks (Razorpay, Sanity) do not use this; they are verified by signature instead. */
import "server-only";
import { NextResponse } from "next/server";
import { siteDefaults } from "@/content/defaults";

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

function allowedOrigins(): Set<string> {
  const list = new Set<string>();
  const add = (u?: string) => {
    if (!u) return;
    try {
      const o = new URL(u.startsWith("http") ? u : `https://${u}`);
      list.add(o.origin);
      if (o.hostname.startsWith("www.")) list.add(`${o.protocol}//${o.hostname.slice(4)}`);
      else list.add(`${o.protocol}//www.${o.hostname}`);
    } catch {
      /* ignore malformed */
    }
  };
  add(siteDefaults.siteUrl);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_BRANCH_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCALHOST === "1") {
    ["http://localhost:3000", "http://localhost:3100", "http://127.0.0.1:3000"].forEach((o) => list.add(o));
  }
  return list;
}
const ORIGINS = allowedOrigins();

export function clientKey(req: Request) {
  return (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

function rateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return false;
  }
  b.count++;
  return b.count > limit;
}

const deny = (status: number, error: string) =>
  NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });

type Options = { method: "GET" | "POST"; limit: number; windowMs?: number; maxBytes?: number; name: string };

/** Returns a refusal response, or null when the request may proceed. */
export function guard(req: Request, o: Options): NextResponse | null {
  if (req.method !== o.method) return deny(405, "method_not_allowed");

  /* Browsers always send Sec-Fetch-Site; reject anything not from our own pages */
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return deny(403, "forbidden");
  const origin = req.headers.get("origin");
  if (o.method === "POST") {
    /* A browser on our own pages sends either our Origin or "Sec-Fetch-Site: same-origin" (which page scripts cannot fake) */
    const fromOurPages = origin ? ORIGINS.has(origin) : site === "same-origin";
    if (!fromOurPages) return deny(403, "forbidden");
    if (!(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return deny(415, "unsupported_media_type");
    const len = Number(req.headers.get("content-length") || 0);
    if (len > (o.maxBytes || 8_000)) return deny(413, "payload_too_large");
  } else if (origin && !ORIGINS.has(origin)) {
    return deny(403, "forbidden");
  }

  if (rateLimited(`${o.name}:${clientKey(req)}`, o.limit, o.windowMs || 60_000)) return deny(429, "too_many");
  return null;
}

/** Reads a JSON body with a hard size cap (even when Content-Length is missing or wrong). */
export async function readJsonCapped<T>(req: Request, maxBytes = 8_000): Promise<T | null> {
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? (data as T) : null;
  } catch {
    return null;
  }
}
