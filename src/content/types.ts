/* Shapes of all editable content. The same shapes are used by the Sanity
   schemas, so whatever the client edits in the Studio lands here. */

export type Address = {
  street: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
  landmark: string;
};

export type SiteSettings = {
  practiceName: string;
  legalName: string;
  siteUrl: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  schemaDescription: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  address: Address;
  mapUrl: string;
  /** Map pin for local search (decimal degrees) */
  geo: { lat: number; lng: number };
  areaServed: string[];
  knowsAbout: string[];
  sameAs: string[];
  founder: {
    name: string;
    jobTitle: string;
    credentials: string[];
    memberOf: string;
  };
  nav: { label: string; href: string }[];
  bookLabel: string;
  footerCrisis: string;
  footerRights: string;
};

export type Area = { title: string; items: string[] };
export type Step = { title: string; text: string };
export type Faq = { question: string; answer: string };

/** A plan's landing page: the searchable page that leads to its booking page */
export type LandingPage = {
  /** Plan code from Sessions & booking */
  plan: string;
  slug: string;
  title: string;
  sub: string;
  seoTitle: string;
  seoDescription: string;
  intro: string[];
  sections: { heading: string; body: string[]; points?: string[] }[];
  faq: Faq[];
};
export type ResearchNote = { text: string; source: string };
export type Registration = { label: string; value: string; badge?: string };
export type LabelledParagraph = { label: string; text: string };

export type HomeContent = {
  hero: {
    heading: string;
    lede: string;
    primaryCta: string;
    secondaryCta: string;
    compassBreathe: string;
    compassCaption: string;
  };
  aiBand: { line1: string; line2Before: string; line2Emphasis: string; line2After: string };
  about: {
    heading: string;
    role: string;
    name: string;
    intro: string;
    credentialsHeading: string;
    credentials: string[];
    portraitAlt: string;
    portraitUrl?: string;
    registrations: Registration[];
    disclaimer: string;
  };
  approach: {
    heading: string;
    lede: string;
    areas: Area[];
    note: string;
  };
  organisations: {
    heading: string;
    subheading: string;
    lede: string;
    credentials: string;
    body: string;
    offerings: string[];
    cta: string;
  };
  band: { figure: string; source: string; strength: string };
  how: { heading: string; steps: Step[] };
  sessions: {
    heading: string;
    subheading: string;
    feeNote: string;
    /** Shown instead of the fee note while fees are hidden */
    feeHiddenNote: string;
    feeNoteLink: string;
    diningNote: string;
  };
  proof: { quote: string; lines: string[]; noQuote: string; cta: string };
  privacy: {
    heading: string;
    subheading: string;
    intro: string;
    noticeTitle: string;
    notice: LabelledParagraph[];
    grievanceTitle: string;
    grievance: string;
  };
  faq: { heading: string; subheading: string; items: Faq[] };
  research: { heading: string; subheading: string; notes: ResearchNote[] };
};

export type SessionOption = {
  key: string;
  label: string;
  minutes: number;
  minutesText?: string;
  fee: number;
  perPerson?: number;
  members?: number[];
  modes: string[];
};

export type PlanTheme = "gold" | "blue" | "purple" | "pink";

export type SessionType = {
  key: string;
  /** Booking page address: /book/{slug} */
  slug: string;
  label: string;
  short: string;
  forWho: string;
  modeText: string;
  slotsText: string;
  note: string;
  theme: PlanTheme;
  /** Private-dining style booking page */
  premium?: boolean;
  /** Start times (24-hour) and weekdays (0 = Sunday) this plan is offered */
  times: string[];
  days: number[];
  guardian?: boolean;
  options: SessionOption[];
  /** Search results only: the booking page's title and description in Google */
  seoTitle?: string;
  seoDescription?: string;
};

export type Mode = { key: string; label: string; sub: string; summary: string };

export type BookingContent = {
  currency: string;
  sessionTypes: SessionType[];
  modes: Mode[];
  bookingWindowDays: number;
  minNoticeHours: number;
  holdMinutes: number;
  /** Show fees on the Home and Sessions pages and in search data. Off: fees appear only inside the booking flow. */
  showFeesPublicly: boolean;
  concerns: string[];
  upi: { id: string; payee: string };
  copy: {
    heading: string;
    lede: string;
    preferToSpeak: string;
    steps: Step[];
    detailsHeading: string;
    nameLabel: string;
    nameHint: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    consent: string;
    detailsButton: string;
    scheduleHeading: string;
    sessionTypeLabel: string;
    sessionForLabel: string;
    membersLabel: string;
    guardianLabel: string;
    formatLabel: string;
    dateLabel: string;
    calendarHint: string;
    timeLabel: string;
    concernLabel: string;
    notesLabel: string;
    toPayButton: string;
    payHeadingUpi: string;
    payHeadingOnline: string;
    paySub: string;
    payOnlineBody: string;
    upiHint: string;
    policy: LabelledParagraph[];
    utrLabel: string;
    utrPlaceholder: string;
    utrHint: string;
    paidButton: string;
    changeBooking: string;
    doneHeadingUpi: string;
    doneHeadingOnline: string;
    backHome: string;
    noSlots: string;
  };
  /** Wording for the private-dining (premium) booking page; anything left out falls back to copy */
  premiumCopy: PremiumCopy;
};

export type BookingCopy = BookingContent["copy"];
export type PremiumCopy = Partial<BookingCopy> & {
  eveningLabel: string;
  ndaLabel: string;
};

export type Author = {
  name: string;
  role?: string;
  bio?: string;
  credentials?: string[];
  imageUrl?: string;
};

export type PostSummary = {
  title: string;
  slug: string;
  kind: "blog" | "article";
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl?: string;
  imageAlt?: string;
  authorName?: string;
};

export type Post = PostSummary & {
  body: unknown[];
  seoTitle?: string;
  seoDescription?: string;
  author?: Author;
  reviewedBy?: string;
  faqs?: Faq[];
  sources?: { title: string; url?: string }[];
};
