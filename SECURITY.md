# Security

This site is built so that no visitor can change prices, bookings or content, and so that no secret ever reaches a browser. This page lists what is in place and the account settings that must stay on.

## What protects what

| Risk | Protection | Where |
| --- | --- | --- |
| Changing a price or fee | Fees are worked out on the server from the CMS. The browser's numbers are ignored. Razorpay is charged the server's amount, and the payment is checked against the booking again in the Sheet. | `src/lib/booking.ts` (`validateBooking`), `src/app/api/booking/hold` |
| Faking a payment | A booking is confirmed only after Razorpay's HMAC signature is verified **and** the payment is fetched from Razorpay and checked (order ID, captured, amount). The webhook is signature-verified too. | `src/lib/razorpay.ts`, `api/booking/verify`, `api/webhooks/razorpay` |
| Editing website content | Only through Sanity Studio, which requires a Sanity login. The website itself holds no write token. | Sanity project → Members |
| Writing to the bookings Sheet | Only the website's server can, using a long random secret checked in constant time. The Sheet link is never public. | `apps-script/Code.gs`, `src/lib/backend.ts` |
| Leaking API keys | All secrets live in `src/lib/serverEnv.ts`, marked `server-only`, so the build fails if browser code imports them. The build also refuses any `NEXT_PUBLIC_` variable that looks like a secret. | `src/lib/serverEnv.ts`, `next.config.ts` |
| Calls from other websites (CSRF, abuse) | API routes accept only requests from this site's own pages (Origin / Sec-Fetch-Site), JSON only, size-capped, with per-visitor rate limits. No CORS headers are sent, so other sites cannot read responses. | `src/lib/apiGuard.ts` |
| Spam bookings and enquiries | Honeypot field, server rate limits, per-email and per-IP limits in the Sheet script, and unpaid holds expire after 15 minutes. | `apiGuard.ts`, `Code.gs` |
| SQL injection | There is no SQL database. CMS queries use parameters (`$slug`), never string building. | `src/lib/content.ts` |
| Spreadsheet formula injection | Every value written to the Sheet is neutralised (`=`, `+`, `-`, `@` prefixed) and length-capped. | `Code.gs` (`clean`, `text`) |
| Cross-site scripting (XSS) | React escapes all text. No user input is rendered as HTML. Structured data is escaped. Blog links allow only http(s), mailto and tel. Emails escape every value. A strict Content Security Policy with a fresh nonce per request blocks injected scripts. | `src/proxy.ts`, `PostBody.tsx`, `Code.gs` (`esc`) |
| Clickjacking, sniffing, downgrade | `frame-ancestors 'none'` and `X-Frame-Options: DENY`, `nosniff`, HSTS with preload, strict referrer policy, Permissions-Policy. | `next.config.ts`, `src/proxy.ts` |
| Error details leaking | Error pages show a friendly message and a short reference only. Stack traces never reach visitors. | `app/(site)/error.tsx`, `app/global-error.tsx` |
| Search-engine leaks of test sites | Preview deployments send `noindex` and a blocking robots.txt. Studio and API are `noindex`. | `src/app/robots.ts`, `src/lib/env.ts` |

## Accounts: settings that must stay on

Most real-world break-ins come from stolen passwords, not code. Turn these on once and keep them on:

1. **Google Workspace (contact@bearingmind.com):** 2-Step Verification, ideally with a passkey or authenticator app. This account owns the Sheet, the script, the calendar and the email.
2. **Sanity:** log in with Google (so the 2-Step Verification above applies). Give the doctor the *Editor* role. Only you get *Administrator*. Under API → CORS origins, allow only `https://bearingmind.com` and `http://localhost:3000`. Never create a token for the website itself.
3. **Netlify:** two-factor authentication on. Secret environment variables marked *Contains secret values*. Only you as owner.
4. **Razorpay:** two-factor login on. Webhook secret set. Use test keys until going live.
5. **Domain registrar:** two-factor login and registrar lock on, so the domain cannot be moved.
6. **GitHub:** two-factor on and the repository private.

## Secrets (Netlify → Project configuration → Environment variables)

| Name | What it is | Public? |
| --- | --- | --- |
| `APPS_SCRIPT_URL` | Booking backend address | No |
| `APPS_SCRIPT_SECRET` | Key the server uses to talk to the Sheet | No |
| `RAZORPAY_KEY_ID` | Razorpay key ID (sent to checkout by the server) | Shown only in checkout |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | No |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies Razorpay webhooks | No |
| `SANITY_REVALIDATE_SECRET` | Verifies Sanity's publish webhook | No |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Public identifiers, not secrets | Yes |

To rotate a secret: change it in its service, update it in Netlify, and redeploy. For the Sheet secret, delete `SCRIPT_SECRET` in Apps Script → Project Settings → Script properties, run `setup` again, and copy the new value to Netlify.

## Dependencies

`npm audit --omit=dev` reports a few advisories inside the Sanity command-line tools (`braces`, `js-yaml` 3, `sprintf-js` via `@sanity/cli`). These run only on a developer's computer for CLI commands; they are not used by the live website and never handle visitor input. No fixed versions exist upstream yet. Re-check with `npm audit` when updating packages.

## Rate limits

API limits are kept in memory on each server instance, which stops casual flooding. Hard limits that hold across all instances are also enforced in the Sheet script (per email and per IP), and every booking still needs a real payment.

## Reporting a problem

Email contact@bearingmind.com with the subject "Security".
