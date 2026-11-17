/* Runs before every page request.
   1. URL normalisation: /About, /about/ and //about all permanently redirect (308)
      to /about in one hop, so Google only ever sees one canonical address.
   2. Content Security Policy with a fresh random nonce per request: only scripts
      that carry this request's nonce (Next.js's own) or that they load (Razorpay
      checkout) may run. Injected scripts cannot. */
import { NextResponse, type NextRequest } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io",
    "font-src 'self'",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const original = url.pathname;

  let clean = original.replace(/\/{2,}/g, "/").toLowerCase();
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.replace(/\/+$/, "");
  if (clean !== original) {
    return NextResponse.redirect(new URL(clean + url.search, request.url), 308);
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /* Pages only: skip API, Studio, Next internals and files with an extension */
    {
      source: "/((?!api|studio|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
