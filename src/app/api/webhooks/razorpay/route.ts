import { callBackend } from "@/lib/backend";
import { json } from "@/lib/http";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

type Entity = { id: string; order_id?: string; amount: number; method?: string; notes?: Record<string, string> };

/* Safety net: if the patient pays and closes the tab before the site hears back,
   Razorpay tells us here and the booking is still confirmed. Safe to receive twice. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 200_000) return json({ ok: false, error: "payload_too_large" }, 413);
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") || "")) {
    return json({ ok: false, error: "invalid_signature" }, 400);
  }
  let evt: {
    event: string;
    payload: { payment?: { entity: Entity }; order?: { entity: { id: string; notes?: Record<string, string> } } };
  };
  try {
    evt = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (!["payment.captured", "order.paid"].includes(evt.event)) return json({ ok: true, ignored: evt.event });

  const pay = evt.payload.payment?.entity;
  const ref = evt.payload.order?.entity?.notes?.ref || pay?.notes?.ref;
  if (!pay || !ref || !/^BM\d{6}[A-Z0-9]{4}$/.test(ref)) return json({ ok: true, ignored: "no_reference" });

  const r = await callBackend("confirm", {
    ref,
    paymentId: pay.id,
    orderId: pay.order_id || evt.payload.order?.entity?.id || "",
    amount: pay.amount / 100,
    method: pay.method || "",
    source: "webhook",
  });
  // A non-200 makes Razorpay retry later, which is what we want if the sheet was unreachable.
  return r.ok ? json({ ok: true }) : json({ ok: false, error: r.error }, 502);
}
