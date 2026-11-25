import { callBackend } from "@/lib/backend";
import { newRef, validateBooking, type BookingRequest } from "@/lib/booking";
import { getBooking } from "@/lib/content";
import { guard, readJsonCapped } from "@/lib/apiGuard";
import { clientIp, clip, json } from "@/lib/http";
import { createOrder, razorpayEnabled, razorpayKeyId } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/* Step 1 of paying: checks everything, holds the slot in the sheet for a few
   minutes, and (when Razorpay is on) creates the payment order. The fee is
   always worked out here, never taken from the browser. */
export async function POST(req: Request) {
  const refused = guard(req, { method: "POST", name: "hold", limit: 8, windowMs: 600000, maxBytes: 8000 });
  if (refused) return refused;
  const body = await readJsonCapped<BookingRequest & { website?: string }>(req, 8000);
  if (!body || body.website) return json({ ok: false, error: "bad_request" }, 400);
  /* Only plain text values are accepted; anything else is rejected outright */
  const textFields = ["name", "phone", "email", "type", "option", "mode", "date", "time", "topic", "notes"] as const;
  if (textFields.some((k) => body[k] !== undefined && typeof body[k] !== "string")) return json({ ok: false, error: "bad_request" }, 400);

  const cfg = await getBooking();
  const check = validateBooking(cfg, { ...body, phone: clip(body.phone, 20).replace(/\s/g, "") });
  if (!check.ok) return json({ ok: false, error: check.error }, 400);
  const v = check.value;

  const ref = newRef();
  const hold = await callBackend("hold", {
    ref,
    type: v.type.key,
    name: clip(body.name, 80),
    phone: clip(body.phone, 20).replace(/\s/g, ""),
    email: clip(body.email, 120).toLowerCase(),
    session: v.session,
    members: v.option.members ? String(v.members) : "",
    mode: body.mode,
    modeLabel: v.modeSummary,
    date: body.date,
    time: v.slot.start,
    endTime: v.slot.end,
    when: v.when,
    topic: clip(body.topic, 120),
    notes: clip(body.notes, 2000),
    fee: v.fee,
    holdMinutes: cfg.holdMinutes,
    paymentMethod: razorpayEnabled ? "Razorpay" : "UPI",
    ip: clientIp(req),
  });
  if (!hold.ok) return json({ ok: false, error: hold.error || "hold_failed" }, hold.error === "slot_taken" ? 409 : 400);

  const base = { ok: true, ref, fee: v.fee, when: v.when, session: v.session, modeSummary: v.modeSummary, holdMinutes: cfg.holdMinutes, demo: Boolean(hold.demo) };

  if (!razorpayEnabled) {
    return json({ ...base, payment: { method: "upi", upiId: cfg.upi.id, payee: cfg.upi.payee } });
  }

  try {
    const order = await createOrder(v.fee, ref, { ref, session: v.session.slice(0, 250), when: v.when });
    return json({
      ...base,
      payment: { method: "razorpay", keyId: razorpayKeyId, orderId: order.id, amount: order.amount, holdMinutes: cfg.holdMinutes },
    });
  } catch (err) {
    console.error(err);
    await callBackend("release", { ref });
    return json({ ok: false, error: "payment_unavailable" }, 502);
  }
}
