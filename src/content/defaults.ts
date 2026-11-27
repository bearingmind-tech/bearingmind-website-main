/* =====================================================================
   Default content: transcribed word for word from the client's index.html.
   The live site reads everything from Sanity; this file is the fallback
   and the source used to seed Sanity the first time (npm run seed).
   ===================================================================== */
import type { BookingContent, HomeContent, SiteSettings } from "./types";

export const siteDefaults: SiteSettings = {
  practiceName: "BearingMind",
  legalName: "BearingMind Health Services",
  siteUrl: "https://bearingmind.com",
  seoTitle: "CBT Counselling & Executive Coaching, Bangalore | BearingMind",
  seoDescription:
    "CBT-based counselling and coaching for leaders, professionals, couples and families, plus mental health training for organisations. Richmond Town, Bangalore.",
  ogTitle: "BearingMind Health Services | CBT Counselling & Coaching, Bangalore",
  ogDescription:
    "CBT-based counselling and coaching for leaders, professionals and families. Bangalore and online.",
  schemaDescription:
    "CBT-based counselling and coaching for personal development, career, mental health, stress, anxiety, resilience, relationships and family.",
  phone: "+91 9482223786",
  phoneDisplay: "+91 94822 23786",
  whatsapp: "919482223786",
  email: "contact@bearingmind.com",
  address: {
    street: "2 Rose Lane, Richmond Town",
    locality: "Bengaluru",
    region: "Karnataka",
    postalCode: "560025",
    country: "IN",
    landmark: "Near TV9 and Baldwin Boys'/Girls' School",
  },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=XJ73%2B9G9%2C+Rose+Ln%2C+Richmond+Town%2C+Bengaluru%2C+Karnataka+560025",
  /* Decoded from the Plus Code XJ73+9G9 in the Maps link above */
  geo: { lat: 12.963413, lng: 77.603859 },
  areaServed: ["Bengaluru", "India", "Online"],
  knowsAbout: [
    "Cognitive Behavioural Therapy",
    "Growth coaching",
    "Stress management",
    "Resilience",
    "Anxiety",
    "Relationship counselling",
    "Family counselling",
    "Behaviour modification",
    "Leadership mentoring",
    "Workplace mental health training",
  ],
  sameAs: [],
  founder: {
    name: "M H Sharieff",
    jobTitle: "Chief Counselling Psychologist and Executive Mentor",
    credentials: [
      "Ph.D. in Human Resources",
      "MBA",
      "Bachelor of Engineering",
      "Master's in Counselling Psychology",
      "Diploma in Community Mental Health, NIMHANS",
      "Certified Behaviour & Mentoring Analyst (CBMA)",
    ],
    memberOf: "American Psychological Association",
  },
  nav: [
    { label: "About", href: "/about" },
    { label: "Approach", href: "/approach" },
    { label: "Sessions", href: "/sessions" },
    { label: "Organisations", href: "/organisations" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  bookLabel: "Book a session",
  footerCrisis:
    "This service is not for emergencies. If you or someone you know is in crisis, call Tele-MANAS on 14416 or go to the nearest hospital.",
  footerRights: "BearingMind Health Services. All rights reserved.",
};

export const homeDefaults: HomeContent = {
  hero: {
    heading: "A calmer mind makes better decisions ..",
    lede:
      "Structured, CBT-based counselling and coaching for leaders, professionals and their families, in Bangalore and online. For people who are doing well on paper, and want to feel as well as they look.",
    tagline: ".. better Relations",
    primaryCta: "Book a session",
    secondaryCta: "How it works",
    compassBreathe: "Breathe.",
    compassCaption: "Find your bearing – your direction",
  },
  aiBand: {
    line1: "No AI in your CBT sessions",
    line2Before: "In CBT, we use your ",
    line2Emphasis: "real",
    line2After: " intelligence",
  },
  about: {
    heading: "About",
    role: "Chief Counselling Psychologist",
    name: "M H Sharieff, Ph.D.",
    intro:
      "Since 2017, mentoring and coaching senior executives at a multinational, and individuals, on professional and personal development.",
    credentialsHeading: "Credentials",
    credentials: [
      "Ph.D. in Human Resources",
      "Master's in Counselling Psychology",
      "Diploma in Community Mental Health, NIMHANS",
      "Certified Behaviour & Mentoring Analyst (CBMA)",
      "Member, American Psychological Association",
    ],
    portraitAlt: "M H Sharieff, Ph.D., Chief Counselling Psychologist, BearingMind Health Services",
    registrations: [
      { label: "Udyam Registration (MSME)", value: "UDYAM-KR-03-0772965", badge: "/images/msme.png" },
      {
        label: "National Commission for Allied and Healthcare Professions (NCAHP)",
        value: "Id No. 99-8872-0717-5516",
        badge: "/images/ncahp.png",
      },
      {
        label: "Mental Health First Aid India · Accredited Mental Health First Aider",
        value: "ID: MHFA5065",
        badge: "/images/mhfa-accredited.png",
      },
      { label: "American Psychological Association", value: "Member", badge: "/images/apa.svg" },
    ],
    disclaimer: "Our counselling and coaching is not a substitute for clinical therapy or psychiatric treatment.",
  },
  approach: {
    heading: "What we work on",
    lede:
      "Cognitive Behavioural Therapy gives you practical tools: noticing unhelpful thought patterns, testing them, and building habits that hold under pressure. Sessions are goal-led. Progress is measured with brief, standard questionnaires at the first and fourth sessions, so you can see the change yourself.",
    areas: [
      {
        title: "Work and direction",
        items: [
          "Personal development and growth mindset",
          "Peak daily performance",
          "Vision setting",
          "Burnout and work–life balance",
          "Office politics and workplace bullying",
        ],
      },
      {
        title: "Mind and resilience",
        items: [
          "Stress management",
          "Anxiety and low mood",
          "Sleep",
          "Building resilience",
          "Behaviour change, including OCD habits",
        ],
      },
      {
        title: "Relationships and family",
        items: [
          "Relationship dynamics (EFT and Gottman Method for couples)",
          "Family counselling",
          "Business families: harmony and succession",
          "Family vision setting",
        ],
      },
    ],
    note:
      "Our work is non-clinical and does not involve diagnosis or medication. We work alongside your doctor or psychiatrist, or refer you to a clinical psychologist. Children and teenagers are supported through BearingMind associates who are specialised in child therapy.",
  },
  organisations: {
    heading: "For organisations",
    subheading: "Leadership mentoring, coaching, mental health training and wellness workshops",
    lede:
      "We understand work from both sides of the table: the employee's state of mind, the quiet slide into burnout, and management's expectations of performance.",
    credentials:
      "Built on years in industry leadership roles, with an engineering degree, an MBA, a Master's in Counselling Psychology, a doctorate in Human Resources, and membership of the American Psychological Association.",
    body:
      "Leadership mentoring and mental health training for companies, in line with WHO and ILO guidance that managers be trained to prevent workplace stress and support colleagues in distress.",
    offerings: [
      "Leadership and executive mentoring",
      "Employee training: mental health at work",
      "Workshops on stress, burnout and resilience",
      "MHFA workshops for companies",
    ],
    cta: "Enquire for your organisation",
  },
  band: {
    figure:
      "One in eight people worldwide lives with a mental health condition. In India, 70–92% never receive treatment.",
    source: "WHO, 2025 · NIMHANS",
    strength: "Stigma keeps people silent. Silence keeps them struggling. Asking for help is a sign of strength.",
  },
  how: {
    heading: "How it works",
    steps: [
      { title: "Book and verify", text: "Choose a time and confirm your email. Pay in advance through our online payment platform." },
      { title: "A short intake form", text: "Confidential, before we meet, so your time is well spent." },
      { title: "Your first session", text: "We agree on your goals, and review progress together." },
    ],
  },
  sessions: {
    heading: "Sessions",
    subheading: "Practice and consultation options",
    feeNote: "All fees are final, inclusive of all taxes, and payable in advance via UPI.",
    feeHiddenNote: "Fees are shown when you choose your session, and are paid in advance to confirm your booking.",
    feeNoteLink: "Book a session",
    diningNote:
      "For Public Figures sessions (conversational dining), you may also {call} or {whatsapp} directly on {phone}. A confidentiality agreement is available on request.",
  },
  proof: {
    quote: "Experience is the only testimonial",
    lines: [
      "See it. Experience it. Believe it.",
      "The only proof you need is your own results.",
      "Science doesn't need a testimonial. Neither do we.",
    ],
    noQuote:
      "We do not publish client testimonials. Doing so would risk revealing who our clients are, and your privacy comes first.",
    cta: "Book a session",
  },
  privacy: {
    heading: "Your privacy",
    subheading: "Confidential by default, protected by law.",
    intro:
      "Everything you share is confidential, handled in line with India's Digital Personal Data Protection Act, 2023. Nothing is collected without your explicit consent, and session notes are encrypted and never shared without your written permission, except where the law requires it to protect life.",
    noticeTitle: "Full privacy notice",
    notice: [
      {
        label: "What we collect:",
        text:
          "your name, phone, email, a short intake form, brief session notes and payment records, only to arrange and provide your sessions. Notes are securely deleted after a limited period; payment records are kept as tax law requires. Only your counsellor sees your notes. We never sell or share your data for marketing.",
      },
      {
        label: "Your rights:",
        text:
          "to access, correct or erase your data, withdraw consent, nominate someone to act for you, and raise a grievance with us or the Data Protection Board of India.",
      },
    ],
    grievanceTitle: "Grievance contact",
    grievance: "M H Sharieff, BearingMind Health Services",
  },
  faq: {
    heading: "Questions",
    subheading: "FAQs",
    items: [
      { question: "Which languages do you counsel in?", answer: "English, Kannada and Hindi, with working Tamil." },
      {
        question: "What happens in the first session?",
        answer:
          "We understand what brings you, agree on two or three clear goals, and decide how we will measure progress. No diagnosis, no judgement.",
      },
      {
        question: "How many sessions will I need?",
        answer:
          "Many people see clear progress within four sessions, when we review it together. Some choose to continue from there.",
      },
      {
        question: "Will my family or employer know?",
        answer:
          "No. We do not confirm to anyone that you are a client without your written permission, including when your organisation arranges the sessions.",
      },
      {
        question: "How is this different from seeing a psychiatrist?",
        answer:
          "Psychiatrists are medical doctors who diagnose and prescribe. Our work is non-clinical and uses CBT tools for growth and change. Where needed, we work alongside your psychiatrist.",
      },
      {
        question: "Do you work with children and teenagers?",
        answer:
          "Yes, through trusted BearingMind associates who specialise in children and adolescents. Contact us and we will arrange it; we stay involved throughout.",
      },
      {
        question: "Can my spouse or family join?",
        answer:
          "Yes. Public Figures sessions can be booked for a couple: a private dinner for two, 120 minutes from 7:30 PM. Children with Parents sessions, 60 minutes on Sunday mornings, include a parent or guardian.",
      },
      { question: "What if I need to cancel?", answer: "Your session is rescheduled to a later date of your choice." },
    ],
  },
  research: {
    heading: "Research notes",
    subheading: "Brief findings from recent studies, for your benefit.",
    notes: [
      {
        text: "Online CBT works about as well as face-to-face CBT for anxiety and depression.",
        source: "Carlbring et al., Cognitive Behaviour Therapy, 2018",
      },
      {
        text: "CBT is as effective as antidepressants for depression, and combining the two works better than either alone.",
        source: "Cuijpers et al., World Psychiatry, 2023",
      },
      {
        text: "Walking, jogging, yoga and strength training each reduce depression, with larger benefits at higher intensity.",
        source: "Noetel et al., BMJ, 2024",
      },
      {
        text: "Improving sleep quality leads to measurable improvements in depression, anxiety and stress.",
        source: "Scott et al., Sleep Medicine Reviews, 2021",
      },
      {
        text: "Teenagers on social media more than three hours a day face double the risk of depression and anxiety symptoms.",
        source: "US Surgeon General's Advisory, 2023",
      },
      {
        text: "WHO now recommends mental health training for managers, to prevent stress and support staff in distress.",
        source: "WHO Guidelines on Mental Health at Work, 2022",
      },
    ],
  },
};

export const bookingDefaults: BookingContent = {
  currency: "₹",
  sessionTypes: [
    {
      key: "dining",
      seoTitle: "Counselling for Public Figures & HNIs in Bangalore",
      seoDescription:
        "Discreet one-to-one counselling and executive coaching for celebrities, HNIs and public figures, over a private dinner at a luxury hotel in Bangalore.",
      slug: "public-figures",
      label: "Public Figures",
      short: "A private consultation over dinner at a luxury hotel in Bangalore",
      forWho: "HNIs, celebrities and business leaders",
      modeText: "In person. Dinner included.",
      slotsText: "From 7:30 PM, Monday to Friday",
      note: "Hotel venue shared upon confirmation. A confidentiality agreement is available on request.",
      theme: "gold",
      premium: true,
      times: ["19:30"],
      days: [1, 2, 3, 4, 5],
      options: [
        { key: "individual", label: "Individual", minutes: 90, fee: 10000, modes: ["dining"] },
        { key: "couple", label: "Couple", minutes: 120, fee: 12000, modes: ["dining"] },
      ],
    },
    {
      key: "professional",
      seoTitle: "Online Counselling for Working Professionals",
      seoDescription:
        "CBT-based online counselling on Google Meet for employed professionals: stress, burnout, work-life balance and career direction. Weekday slots, 4 to 6 PM.",
      slug: "employed-professionals",
      label: "Employed Professionals",
      short: "Counselling that fits around your working day",
      hideCardIntro: true,
      forWho: "People in full-time or part-time jobs",
      modeText: "Online meet",
      slotsText: "4–5 PM or 5–6 PM, Monday to Friday",
      note: "Join from anywhere. Your meeting link arrives with your confirmation.",
      theme: "blue",
      times: ["16:00", "17:00"],
      days: [1, 2, 3, 4, 5],
      options: [{ key: "session", label: "Session", minutes: 60, fee: 5000, modes: ["meet"] }],
    },
    {
      key: "homemaker",
      seoTitle: "Counselling for Homemakers in Bangalore & Online",
      seoDescription:
        "Confidential CBT counselling for homemakers: stress, anxiety, relationships and time for yourself. Online on Google Meet or in person in Bangalore, Saturdays.",
      slug: "homemakers",
      label: "Homemakers",
      short: "Support for the one who looks after everyone else",
      forWho: "Anyone looking for time and space for themselves",
      modeText: "Online meet or in person",
      slotsText: "2–3 PM, 3–4 PM or 4–5 PM, Saturday only",
      note: "A calm hour set aside just for you.",
      theme: "purple",
      times: ["14:00", "15:00", "16:00"],
      days: [6],
      options: [{ key: "session", label: "Session", minutes: 60, fee: 4000, modes: ["meet", "inperson"] }],
    },
    {
      key: "children",
      seoTitle: "Child Counselling with Parents in Bangalore",
      seoDescription:
        "Counselling for children, with a parent or guardian, by a consultant specialised in children's counselling. Online or in person in Bangalore, Sunday mornings.",
      slug: "children",
      label: "Children with Parents",
      short: "Gentle, age-appropriate support",
      forWho: "Children and teenagers",
      modeText: "Online meet or in person",
      slotsText: "8–9 AM, 9–10 AM or 10–11 AM, Sundays only",
      note: "With our associate consultant, specialised in children's counselling. A parent or guardian makes the booking.",
      theme: "pink",
      times: ["08:00", "09:00", "10:00"],
      days: [0],
      guardian: true,
      options: [{ key: "child", label: "Child with parent", minutes: 60, fee: 3000, modes: ["meet", "inperson"] }],
    },
  ],
  modes: [
    { key: "meet", label: "Online", sub: "Online meet, video call", summary: "Online meet" },
    {
      key: "dining",
      label: "Private dinner",
      sub: "Luxury hotel, Bangalore. Dinner included",
      summary: "Private dinner at a luxury hotel, Bangalore",
    },
    { key: "inperson", label: "In person", sub: "Venue shared on confirmation", summary: "In person (venue shared on confirmation)" },
  ],
  bookingWindowDays: 30,
  minNoticeHours: 3,
  holdMinutes: 15,
  showFeesPublicly: false,
  concerns: [
    "Stress or burnout",
    "Anxiety or low mood",
    "Sleep",
    "Work, career or office politics",
    "Personal development and performance",
    "Leadership and decision-making",
    "Couple relationship",
    "Family or business-family matters",
    "Behaviour change or habits",
    "Not sure yet",
  ],
  upi: { id: "yourname@bank", payee: "BearingMind Health Services" },
  copy: {
    heading: "Book a session",
    lede: "Three short steps. You may use any name you are comfortable with.",
    preferToSpeak: "Prefer to speak first? {call} or {whatsapp} {phone}.",
    steps: [
      { title: "Schedule", text: "Choose format, date and time" },
      { title: "Your details", text: "Name, phone and email" },
      { title: "Pay", text: "Advance payment" },
    ],
    detailsHeading: "Your details",
    nameLabel: "Name",
    nameHint: "A first name or an assumed name is fine.",
    namePlaceholder: "Any name you prefer",
    phoneLabel: "Phone",
    phonePlaceholder: "10-digit mobile number",
    emailLabel: "Email",
    consent: "I agree to the {terms}, to be contacted about this booking, and to my details being handled as described in {privacy}.",
    detailsButton: "Continue",
    scheduleHeading: "Schedule",
    sessionTypeLabel: "Session type",
    sessionForLabel: "Session for",
    membersLabel: "Number of family members attending",
    guardianLabel: "I am the parent or guardian making this booking.",
    formatLabel: "Format",
    dateLabel: "Date",
    calendarHint: "Next 30 days · greyed dates are unavailable",
    timeLabel: "Time",
    concernLabel: "Your main concern",
    notesLabel: "Anything you'd like me to know",
    toPayButton: "Continue to payment",
    payHeadingUpi: "Pay by UPI",
    payHeadingOnline: "Pay securely",
    paySub: "Advance payment secures your session.",
    payOnlineBody: "Pay by UPI, card or netbanking. Your session is confirmed instantly once payment succeeds.",
    upiHint:
      "Scan the code with any UPI app (GPay, PhonePe, Paytm, BHIM or your bank), or tap the button on your phone.",
    policy: [
      {
        label: "Advance payment only.",
        text: "The amount shown is final and inclusive of all taxes. Your session is confirmed once payment is received.",
      },
      { label: "Cancellations", text: "can be rescheduled to a later date." },
    ],
    utrLabel: "UPI transaction reference (UTR)",
    utrPlaceholder: "12-digit number from your UPI app",
    utrHint: "You'll find it in your UPI app under the payment details.",
    paidButton: "I have paid",
    changeBooking: "Change booking",
    doneHeadingUpi: "Thank you. Your slot is held.",
    doneHeadingOnline: "Thank you. Your session is confirmed.",
    backHome: "Back to home",
    noSlots: "No open times in the next 30 days for this format. Call or email and we will find one.",
  },
  premiumCopy: {
    steps: [
      { title: "Your evening", text: "Guests and date" },
      { title: "Your details", text: "Held in confidence" },
      { title: "Reserve", text: "Secure payment" },
    ],
    scheduleHeading: "Your evening",
    sessionForLabel: "Reservation for",
    eveningLabel: "Choose an evening",
    detailsHeading: "Your details",
    ndaLabel: "I would like a confidentiality agreement before we meet.",
    detailsButton: "Continue",
    toPayButton: "Continue to secure payment",
    payHeadingOnline: "Confirm your reservation",
    payHeadingUpi: "Confirm your reservation",
    paySub: "Your evening is held for you while you complete payment.",
    doneHeadingOnline: "Your evening is reserved.",
    doneHeadingUpi: "Thank you. Your evening is held.",
    noSlots: "No evenings are open in the next 30 days. Call or WhatsApp and we will arrange one personally.",
    policy: [
      { label: "One inclusive fee.", text: "Dinner and consultation, final and inclusive of all taxes." },
      { label: "Venue", text: "details are shared privately once your reservation is confirmed." },
      { label: "Changes", text: "can be rescheduled to a later evening of your choice." },
    ],
  },
};
