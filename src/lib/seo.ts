/* JSON-LD builders. One consistent identity (@id) is reused everywhere,
   so Google and AI assistants see a single, well-described practice. */
import type { BookingContent, HomeContent, Post, SiteSettings } from "@/content/types";
import { feeOf, minText, toMin } from "./booking";

export const abs = (site: SiteSettings, path = "/") => new URL(path, site.siteUrl).toString();
const ids = (site: SiteSettings) => ({
  org: abs(site, "/#organization"),
  person: abs(site, "/#founder"),
  website: abs(site, "/#website"),
});

export function organizationSchema(site: SiteSettings, home: HomeContent, booking: BookingContent) {
  const id = ids(site);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": id.org,
    name: site.legalName,
    alternateName: site.practiceName,
    url: abs(site),
    logo: abs(site, "/icon-512.png"),
    image: [abs(site, "/og-image.png"), abs(site, "/images/m-h-sharieff.jpg")],
    description: site.schemaDescription,
    telephone: site.phone.replace(/\s/g, ""),
    email: site.email,
    /* Prices go to Google and AI assistants only when the client shows them on the site */
    priceRange: booking.showFeesPublicly
      ? `₹${Math.min(...booking.sessionTypes.flatMap((t) => t.options.map((o) => o.fee))).toLocaleString("en-IN")}+`
      : undefined,
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit card, Debit card, Net banking",
    areaServed: site.areaServed,
    knowsLanguage: ["en", "kn", "hi", "ta"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    hasMap: site.mapUrl,
    geo: site.geo?.lat && site.geo?.lng ? { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } : undefined,
    openingHoursSpecification: openingHours(booking),
    founder: { "@id": id.person },
    employee: { "@id": id.person },
    knowsAbout: site.knowsAbout,
    sameAs: site.sameAs.length ? site.sameAs : undefined,
    identifier: home.about.registrations.map((r) => ({ "@type": "PropertyValue", name: r.label, value: r.value })),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone.replace(/\s/g, ""),
      email: site.email,
      contactType: "customer service",
      availableLanguage: ["English", "Kannada", "Hindi", "Tamil"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Sessions",
      itemListElement: booking.sessionTypes.map((t) => ({
        "@type": "OfferCatalog",
        name: t.label,
        description: t.note,
        itemListElement: t.options.map((o) => ({
          "@type": "Offer",
          name: `${t.label}: ${o.label}`,
          ...(booking.showFeesPublicly ? { price: feeOf(o, o.members ? o.members[0] : 0), priceCurrency: "INR" } : {}),
          availability: "https://schema.org/InStock",
          url: abs(site, `/book?type=${t.key}`),
          itemOffered: {
            "@type": "Service",
            name: `${t.label}: ${o.label}`,
            description: `${t.modeText} ${minText(o)}.`,
            provider: { "@id": id.org },
            audience: { "@type": "Audience", audienceType: t.forWho },
          },
        })),
      })),
    },
  };
}

/* Opening hours, worked out from the real booking slots so they always match the
   calendar: each slot runs from its start to the end of the longest session in it. */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function openingHours(booking: BookingContent) {
  const byDay: [number, number][][] = DAY_NAMES.map(() => []);
  for (const t of booking.sessionTypes) {
    const longest = Math.max(...t.options.map((o) => o.minutes));
    if (t.slots === "diningSlots") {
      for (const sl of booking.diningSlots) for (const d of sl.days) byDay[d].push([toMin(sl.start), toMin(sl.end)]);
    } else {
      const src = booking[t.slots];
      for (const time of src.times) for (const d of src.days) byDay[d].push([toMin(time), toMin(time) + longest]);
    }
  }
  /* Merge windows per day (gaps of two hours or less count as one sitting), then group days that share identical hours */
  const groups = new Map<string, { days: string[]; opens: string; closes: string }>();
  byDay.forEach((ranges, d) => {
    const merged: [number, number][] = [];
    for (const r of ranges.sort((a, b) => a[0] - b[0])) {
      const last = merged[merged.length - 1];
      if (last && r[0] - last[1] <= 120) last[1] = Math.max(last[1], r[1]);
      else merged.push([...r]);
    }
    for (const [o, c] of merged) {
      const key = `${o}-${c}`;
      const g = groups.get(key) || { days: [], opens: hhmm(o), closes: hhmm(Math.min(c, 23 * 60 + 59)) };
      g.days.push(DAY_NAMES[d]);
      groups.set(key, g);
    }
  });
  return [...groups.values()].map((g) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: g.days, opens: g.opens, closes: g.closes }));
}

/* A named service the practice offers (organisations, approach). */
export function serviceSchema(site: SiteSettings, opts: { name: string; description: string; path: string; serviceType: string; audience?: string; offers?: string[] }) {
  const id = ids(site);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": abs(site, `${opts.path}#service`),
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: abs(site, opts.path),
    provider: { "@id": id.org },
    areaServed: site.areaServed,
    audience: opts.audience ? { "@type": "Audience", audienceType: opts.audience } : undefined,
    hasOfferCatalog: opts.offers?.length
      ? { "@type": "OfferCatalog", name: opts.name, itemListElement: opts.offers.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o } })) }
      : undefined,
  };
}

export function founderSchema(site: SiteSettings, home: HomeContent) {
  const id = ids(site);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": id.person,
    name: site.founder.name,
    honorificSuffix: "PhD",
    jobTitle: site.founder.jobTitle,
    worksFor: { "@id": id.org },
    image: home.about.portraitUrl || abs(site, "/images/m-h-sharieff.jpg"),
    description: home.about.intro,
    hasCredential: site.founder.credentials.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c })),
    memberOf: { "@type": "Organization", name: site.founder.memberOf },
    knowsAbout: site.knowsAbout,
    url: abs(site, "/#about"),
  };
}

export function websiteSchema(site: SiteSettings) {
  const id = ids(site);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": id.website,
    url: abs(site),
    name: site.legalName,
    inLanguage: "en-IN",
    publisher: { "@id": id.org },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };
}

export function breadcrumbSchema(site: SiteSettings, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(site, it.path) })),
  };
}

export function postSchema(site: SiteSettings, post: Post, path: string) {
  const id = ids(site);
  const author = post.author?.name
    ? post.author.name === site.founder.name
      ? { "@id": id.person }
      : { "@type": "Person", name: post.author.name, jobTitle: post.author.role }
    : { "@id": id.org };
  return {
    "@context": "https://schema.org",
    "@type": post.kind === "article" ? "Article" : "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.imageUrl ? [post.imageUrl] : [abs(site, "/og-image.png")],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author,
    reviewedBy: post.reviewedBy ? { "@type": "Person", name: post.reviewedBy } : undefined,
    publisher: { "@id": id.org },
    mainEntityOfPage: abs(site, path),
    inLanguage: "en-IN",
    isPartOf: { "@id": id.website },
    citation: post.sources?.map((s) => s.url || s.title),
  };
}
