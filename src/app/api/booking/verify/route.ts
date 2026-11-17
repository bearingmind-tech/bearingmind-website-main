import { callBackend } from "@/lib/backend";
import { guard, readJsonCapped } from "@/lib/apiGuard";
import { json } from "@/lib/http";
import { razorpayEnabled, settlePayment, verifyPaymentSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

type Body = { ref: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

/* Step 2 of paying: the browser reports success; we verify Razorpay's signature,
   confirm the payment with Razorpay itself, then confirm the booking. */
export async function POST(req: Request) {
  const refused = guard(req, { method: "POST", name: "verify", limit: 20, windowMs: 600000, maxBytes: 2000 });
  if (refused) return refused;
  if (!razorpayEnabled) return json({ ok: false, error: "payment_unavailable" }, 400);
  const b = await readJsonCapped<Body>(req, 2000);
  if (!b?.ref || !b.razorpay_order_id || !b.razorpay_payment_id) return json({ ok: false, error: "bad_request" }, 400);
  if (!verifyPaymentSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
    return json({ ok: false, error: "invalid_signature" }, 400);
  }
  try {
    const p = await settlePayment(b.razorpay_payment_id, b.razorpay_order_id);
    const r = await callBackend("confirm", {
      ref: b.ref,
      paymentId: p.id,
      orderId: p.order_id,
      amount: p.amount / 100,
      method: p.method,
      source: "checkout",
    });
    if (!r.ok) return json({ ok: false, error: r.error || "confirm_failed" }, 502);
    return json({ ok: true, status: r.status, meetLink: r.meetLink || "" });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "verify_failed" }, 502);
  }
}
