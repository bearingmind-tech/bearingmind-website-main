import { callBackend } from "@/lib/backend";
import { guard, readJsonCapped } from "@/lib/apiGuard";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Frees a slot the visitor was holding when they go back to change their booking. Only unpaid holds can be released. */
export async function POST(req: Request) {
  const refused = guard(req, { method: "POST", name: "release", limit: 20, windowMs: 600000, maxBytes: 500 });
  if (refused) return refused;
  const b = await readJsonCapped<{ ref: string }>(req, 500);
  if (!b?.ref || !/^BM\d{6}[A-Z0-9]{4}$/.test(b.ref)) return json({ ok: false, error: "bad_request" }, 400);
  const r = await callBackend("release", { ref: b.ref });
  return json({ ok: r.ok });
}
