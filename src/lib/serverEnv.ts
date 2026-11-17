/* Every secret the site uses, read in ONE place that can only ever run on the server.
   "server-only" makes the build fail if any browser code imports this file, so keys
   can never end up in the JavaScript sent to visitors. None of these use NEXT_PUBLIC_. */
import "server-only";

const read = (name: string) => (process.env[name] || "").trim();

export const serverEnv = {
  appsScriptUrl: read("APPS_SCRIPT_URL"),
  appsScriptSecret: read("APPS_SCRIPT_SECRET"),
  razorpayKeyId: read("RAZORPAY_KEY_ID"),
  razorpayKeySecret: read("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: read("RAZORPAY_WEBHOOK_SECRET"),
  sanityRevalidateSecret: read("SANITY_REVALIDATE_SECRET"),
} as const;

if (serverEnv.appsScriptUrl && !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(serverEnv.appsScriptUrl)) {
  throw new Error("APPS_SCRIPT_URL must be a https://script.google.com/macros/s/…/exec address");
}
