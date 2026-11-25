import type { NextConfig } from "next";

/* Safety net: a secret must never be given a NEXT_PUBLIC_ name (those are sent to browsers). */
for (const key of Object.keys(process.env)) {
  if (key.startsWith("NEXT_PUBLIC_") && /SECRET|TOKEN|PASSWORD|PRIVATE|WEBHOOK/i.test(key)) {
    throw new Error(`${key} looks like a secret but is public. Rename it without NEXT_PUBLIC_.`);
  }
}

/* The public site's Content Security Policy is set per request (with a nonce) in src/proxy.ts. */

/* Sanity Studio (behind Sanity's own login) needs to talk to Sanity's APIs. */
const studioCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.api.sanity.io wss://*.api.sanity.io",
  "frame-src 'self' https://*.sanity.io",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join("; ");

const common = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), browsing-topics=(), usb=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com"), accelerometer=(self), gyroscope=(self), magnetometer=(self)',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  /* The proxy (src/proxy.ts) handles trailing slashes and letter case in a single redirect */
  skipTrailingSlashRedirect: true,
  experimental: {
    sri: { algorithm: "sha256" },
    /* CSS is small; inlining it removes render-blocking requests (faster first paint on phones) */
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/((?!studio).*)",
        headers: [...common, { key: "X-Frame-Options", value: "DENY" }],
      },
      {
        source: "/studio/:path*",
        headers: [...common, { key: "Content-Security-Policy", value: studioCsp }, { key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
