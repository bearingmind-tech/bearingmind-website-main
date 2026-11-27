# BearingMind Health Services: website

Next.js 16 website for bearingmind.com. Content is edited in Sanity, bookings live in a Google Sheet through Google Apps Script, and payments run through Razorpay, with manual UPI as the fallback until Razorpay is approved.

Everything runs on free plans. The only running cost is the domain.

## How it fits together

```
Visitor ── bearingmind.com (Next.js on Netlify)
              │  pages read content from ──► Sanity CMS (free plan, Studio at /studio)
              │  /api/* routes (server only)
              ├──► Razorpay  (create order, verify payment, webhook)
              └──► Google Apps Script web app (secret key)
                       ├── Google Sheet "Bookings" + "Organisation enquiries"
                       ├── Gmail: branded emails from contact@bearingmind.com
                       └── Google Calendar: invite + Google Meet link
```

- Fees, slots and session rules are worked out on the server. The browser cannot change a price.
- A slot is held for 15 minutes while the patient pays. Unpaid holds free themselves.
- A booking becomes "Confirmed" only after Razorpay's signature is verified and the payment is checked with Razorpay. The webhook confirms it too if the patient closes the tab.
- Main concern and notes stay in the Sheet. They are never emailed or put in calendar invites.

## Run locally

```bash
npm install && cp .env.example .env.local && npm run dev
```

The site works with no keys at all:
- With no Sanity keys, it shows the built-in content from `src/content/defaults.ts`, which is the client's exact text.
- With no Apps Script keys, bookings run in demo mode and nothing is saved.
- With no Razorpay keys, the payment step uses manual UPI with a UTR.

## Launch checklist (in this order)

1. **GitHub:** create a private repo and push this folder.
2. **Sanity:**
   - Create a free project at sanity.io/manage, dataset `production`.
   - Add the project ID to `.env.local`.
   - Create an *Editor* API token, put it in `SANITY_WRITE_TOKEN`, then run `npm run seed`. This copies all current content and the portrait into Sanity.
   - Under API → CORS origins, add `http://localhost:3000` and `https://bearingmind.com`, each with credentials allowed.
3. **Booking backend:** follow `apps-script/SETUP.md`. You get `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET`.
4. **Netlify:**
   - Import the repo from GitHub (every push to `main` deploys).
   - Under Project configuration → Environment variables, add the env vars from `.env.example`, except `SANITY_WRITE_TOKEN`.
   - Deploy.
   - Add the domain `bearingmind.com` as primary; `www.bearingmind.com` redirects to it.
   - DNS stays at Wix: an A record `@` → `75.2.60.5` and a CNAME `www` → `bearingmind-website-main.netlify.app`. Leave the Google MX and TXT records alone.
5. **Sanity webhook:** in sanity.io/manage → API → Webhooks, add:
   - URL `https://bearingmind.com/api/revalidate`
   - Trigger on create, update and delete
   - Secret the same as `SANITY_REVALIDATE_SECRET`

   Published edits then go live in seconds.
6. **Email authentication:** in Google Workspace admin, turn on DKIM. At the domain registrar, add SPF (`v=spf1 include:_spf.google.com ~all`) and DMARC (`v=DMARC1; p=none; rua=mailto:contact@bearingmind.com`). Without these, booking emails can land in spam.
7. **Razorpay (once the account is approved):**
   - Create live API keys and add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Netlify.
   - Under Settings → Webhooks, add `https://bearingmind.com/api/webhooks/razorpay` with events `payment.captured` and `order.paid`, and a secret that matches `RAZORPAY_WEBHOOK_SECRET`.
   - Redeploy. The payment step switches to Razorpay automatically.
   - Test first with test-mode keys.
8. **Search:**
   - Verify the site in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml` to both.
   - Create the Google Business Profile, then add its link (and LinkedIn and others) in Studio → Website settings → Google & AI search → Profiles elsewhere.

## SEO, AEO and GEO built in

- Every page is rendered on the server, so all text, fees, FAQs and research notes are readable by Google and by AI crawlers.
- Structured data (JSON-LD):
  - `ProfessionalService` with address, map, phone, registrations and every session as a priced `Offer`
  - `Person` for Dr. Sharieff with credentials
  - `WebSite` and `FAQPage`
  - `BlogPosting` or `Article` with author, reviewer and sources
  - `BreadcrumbList`
- Search and AI files:
  - `/sitemap.xml`, built automatically and including blog posts
  - `/robots.txt`, which welcomes Google, Bing and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others) and blocks `/studio` and `/api`
  - `/llms.txt`, a plain-text summary of the practice for AI assistants, rebuilt from CMS content
- Every page has its own canonical URL, title, description, Open Graph and Twitter card (`src/lib/pageMeta.ts`). Addresses are normalised in one 308 redirect: `/About`, `/about/` and `//about` all go to `/about` (`src/proxy.ts`).
- Preview deployments are `noindex` with a blocking robots.txt, so test sites never compete with the real one.
- Fonts are self-hosted and subset, images are optimised (AVIF/WebP), there is almost no client JavaScript on content pages, and security headers are set.
- Blog posts have optional Q&A and Sources fields that help AI answers quote and cite the practice.

## Project map

| Path | What it is |
| --- | --- |
| `src/content/defaults.ts` | Client's exact content (fallback and seed source) |
| `src/app/(site)/` | Pages: home, about, approach, sessions, organisations, faq, privacy, book, blog, articles |
| `src/components/home/` | One component and CSS Module per section (used on home and on its own page) |
| `src/components/site/` | Header (utility bar, full-screen mobile menu) and footer |
| `src/components/ui/` | Section heading, page header, icons |
| `src/components/booking/` | Booking flow |
| `src/lib/booking.ts` | Slot, fee and validation rules (IST), shared by browser and server |
| `src/app/api/` | Holds, payment verify, Razorpay webhook, UPI, enquiries, revalidate |
| `src/sanity/` + `sanity.config.ts` | CMS schemas and Studio layout |
| `src/proxy.ts` | URL normalisation and per-request Content Security Policy |
| `src/lib/apiGuard.ts`, `src/lib/serverEnv.ts` | API protection (same-origin, JSON only, size caps, rate limits) and server-only secrets |
| `src/app/not-found.tsx`, `(site)/error.tsx`, `global-error.tsx`, `(site)/search` | 404 with search, error pages, site search |
| `apps-script/` | Google Sheet backend and setup guide |
| `CLIENT-GUIDE.md` | Plain-language guide for the doctor |
| `SECURITY.md` | What protects what, account settings to keep on, secret rotation |

To test a production build on your own computer, run `npm run build` and then `ALLOW_LOCALHOST=1 npm start`. Without `ALLOW_LOCALHOST=1`, the API refuses requests from localhost in production mode.
