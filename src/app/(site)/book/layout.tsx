import { headers } from "next/headers";

/* Booking and payment pages render per request so Next.js can stamp its scripts with
   this request's CSP nonce (set in src/proxy.ts). This is the strictest policy on the
   site, kept where personal details and payments are handled. */
export default async function BookLayout({ children }: { children: React.ReactNode }) {
  await headers();
  return children;
}
