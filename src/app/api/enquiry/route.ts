import { callBackend } from "@/lib/backend";
import { EMAIL_RE } from "@/lib/booking";
import { guard, readJsonCapped } from "@/lib/apiGuard";
import { clip, json } from "@/lib/http";

export const dynamic = "force-dynamic";

type Body = { name: string; org: string; phone: string; email: string; date: string; time: string; need?: string; website?: string };

export async function POST(req: Request) {
  const refused = guard(req, { method: "POST", name: "enquiry", limit: 4, windowMs: 3600000, maxBytes: 4000 });
  if (refused) return refused;
  const b = await readJsonCapped<Body>(req, 4000);
  if (!b) return json({ ok: false, error: "bad_request" }, 400);
  if (b.website) return json({ ok: true }); // spam trap: pretend success
  const d = {
    name: clip(b.name, 80),
    org: clip(b.org, 120),
    phone: clip(b.phone, 20),
    email: clip(b.email, 120).toLowerCase(),
    date: clip(b.date, 10),
    time: clip(b.time, 40),
    need: clip(b.need, 1500),
  };
  if (d.name.length < 2 || d.org.length < 2 || !/^\+?[\d\s\-()]{8,18}$/.test(d.phone) || !EMAIL_RE.test(d.email) || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !d.time) {
    return json({ ok: false, error: "missing_fields" }, 400);
  }
  const r = await callBackend("org_enquiry", d);
  return json({ ok: r.ok, error: r.error }, r.ok ? 200 : 400);
}
