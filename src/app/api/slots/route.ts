import { callBackend } from "@/lib/backend";
import { guard } from "@/lib/apiGuard";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Times already taken (confirmed, awaiting UPI check, or held while someone pays). */
export async function GET(req: Request) {
  const refused = guard(req, { method: "GET", name: "slots", limit: 60, windowMs: 60000 });
  if (refused) return refused;
  const r = await callBackend("slots");
  return json({ ok: r.ok, booked: Array.isArray(r.booked) ? r.booked : [] });
}
