import { callBackend } from "@/lib/backend";
import { guard, readJsonCapped } from "@/lib/apiGuard";
import { json } from "@/lib/http";
import { razorpayEnabled } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/** Manual UPI (used only until Razorpay is switched on): records the UTR for the doctor to check. */
export async function POST(req: Request) {
  const refused = guard(req, { method: "POST", name: "upi", limit: 6, windowMs: 600000, maxBytes: 1000 });
  if (refused) return refused;
  if (razorpayEnabled) return json({ ok: false, error: "use_online_payment" }, 400);
  const b = await readJsonCapped<{ ref: string; utr: string }>(req, 1000);
  const utr = String(b?.utr || "").replace(/\s/g, "");
  if (!b?.ref || !/^[A-Za-z0-9]{10,35}$/.test(utr)) return json({ ok: false, error: "invalid_utr" }, 400);
  const r = await callBackend("upi_submit", { ref: String(b.ref).slice(0, 20), utr });
  return json({ ok: r.ok, error: r.error }, r.ok ? 200 : 400);
}
