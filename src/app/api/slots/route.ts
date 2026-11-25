import { callBackend } from "@/lib/backend";
import { guard } from "@/lib/apiGuard";
import { findType } from "@/lib/booking";
import { getBooking } from "@/lib/content";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Times already taken for one plan (confirmed, awaiting UPI check, or held while someone pays). */
export async function GET(req: Request) {
  const refused = guard(req, { method: "GET", name: "slots", limit: 60, windowMs: 60000 });
  if (refused) return refused;
  const type = findType(await getBooking(), new URL(req.url).searchParams.get("type") || "");
  if (!type) return json({ ok: false, booked: [] }, 400);
  const r = await callBackend("slots", { type: type.key });
  const booked = Array.isArray(r.booked)
    ? (r.booked as unknown[]).filter((k): k is string => typeof k === "string" && k.startsWith(`${type.key} `))
    : [];
  return json({ ok: r.ok, booked });
}
