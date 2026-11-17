import { revalidatePath, revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { json } from "@/lib/http";
import { serverEnv } from "@/lib/serverEnv";

export const dynamic = "force-dynamic";

/** Sanity calls this when the client publishes a change, so the site updates within seconds. */
export async function POST(req: Request) {
  const secret = serverEnv.sanityRevalidateSecret;
  if (!secret) return json({ ok: false, error: "not_configured" }, 503);
  let isValidSignature: boolean | null = false;
  try {
    ({ isValidSignature } = await parseBody(req as never, secret));
  } catch {
    isValidSignature = false;
  }
  if (!isValidSignature) return json({ ok: false, error: "invalid_signature" }, 401);
  revalidateTag("sanity", { expire: 0 });
  revalidatePath("/", "layout");
  return json({ ok: true, revalidated: Date.now() });
}
