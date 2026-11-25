/* =====================================================================
   Legal pages: privacy policy, terms, cancellation and refunds.
   Written for India: Digital Personal Data Protection Act, 2023 and
   DPDP Rules, 2025; Information Technology Act, 2000 and the SPDI Rules,
   2011 (health and financial data are sensitive personal data).
   Contact details come from Website settings so they always match.
   Changes to these texts should be reviewed by the practice before publishing.
   ===================================================================== */
import type { SiteSettings } from "./types";

export type LegalSection = { heading: string; body?: string[]; points?: string[]; after?: string[] };
export type LegalDoc = { slug: string; title: string; sub: string; seoTitle: string; seoDescription: string; updated: string; sections: LegalSection[] };

export const LEGAL_UPDATED = "2026-11-26";

const contactLines = (s: SiteSettings) => [
  `**${s.founder.name}**, Grievance Officer, ${s.legalName}`,
  `${s.address.street}, ${s.address.locality} ${s.address.postalCode}, ${s.address.region}, India`,
  `Email: [${s.email}](mailto:${s.email}) · Phone and WhatsApp: [${s.phoneDisplay}](tel:${s.phone.replace(/\s/g, "")})`,
];

export function legalDocs(s: SiteSettings): LegalDoc[] {
  const who = `${s.legalName} ("BearingMind", "we", "us")`;
  return [
    {
      slug: "privacy",
      title: "Privacy policy",
      sub: "How we collect, use and protect your personal data, and your rights under Indian law.",
      seoTitle: "Privacy Policy",
      seoDescription: `How ${s.legalName} handles your personal data under India's Digital Personal Data Protection Act, 2023: what we collect, why, your rights, and our Grievance Officer.`,
      updated: LEGAL_UPDATED,
      sections: [
        {
          heading: "1. Who we are",
          body: [
            `${who} provides counselling and coaching from ${s.address.street}, ${s.address.locality}, ${s.address.region}, and online. For your personal data, we are the Data Fiduciary under the Digital Personal Data Protection Act, 2023 ("DPDP Act").`,
            `The person responsible for your personal data and for answering any question about it is **${s.founder.name}**. His contact details are in section 12.`,
          ],
        },
        {
          heading: "2. What this policy covers",
          body: [
            "This policy applies to this website, online booking and payment, counselling and coaching sessions (online and in person), and enquiries from organisations. It is written in line with the DPDP Act and the Digital Personal Data Protection Rules, 2025, and with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.",
          ],
        },
        {
          heading: "3. Personal data we collect",
          body: ["We collect only what we need. Specifically:"],
          points: [
            "**When you book:** your name (a first name or an assumed name is fine), mobile number, email address, the plan, date, time and format you choose, your main concern, and anything you choose to write in the notes. For Children with Parents sessions, the parent or guardian's confirmation that they are booking for the child.",
            "**When you pay:** the amount, a payment reference (Razorpay payment ID or UPI transaction reference) and the payment method. Card, UPI and bank details are entered on Razorpay's secure checkout or in your UPI app; we never see or store them.",
            "**During your sessions:** a short intake form, brief session notes and short progress questionnaires. These relate to your mental and emotional wellbeing and are treated as sensitive personal data.",
            "**When an organisation enquires:** the contact person's name, organisation, phone, email, preferred time to talk and what they are looking for.",
            "**Technical data:** your IP address is used briefly to protect the booking system from abuse and is not stored with your booking. Our hosting provider keeps standard server logs for security.",
          ],
        },
        {
          heading: "4. Why we use it",
          points: [
            "To hold your chosen time, confirm your booking, and send confirmations, calendar invitations and Google Meet links.",
            "To take payment and issue receipts.",
            "To provide your sessions and measure your progress with you.",
            "To share the venue for in-person and dinner sessions, and to reschedule if you need to.",
            "To reply to enquiries from organisations.",
            "To meet our legal, tax and accounting obligations, and to keep our systems secure.",
          ],
          after: [
            "We do not use your data for advertising, we do not build profiles, and we **never sell or rent your personal data**.",
          ],
        },
        {
          heading: "5. Your consent",
          body: [
            "We process your personal data on the basis of your consent, which you give by ticking the consent box when you book or enquire, after being shown this notice. Your consent covers only the purposes above.",
            `You can withdraw consent at any time, as easily as you gave it, by writing to [${s.email}](mailto:${s.email}). Withdrawal does not affect processing already done. After withdrawal we stop processing and erase your data, except records we must keep by law (such as payment records for tax).`,
          ],
        },
        {
          heading: "6. Children",
          body: [
            "Children with Parents sessions are booked by a parent or lawful guardian, who gives consent on the child's behalf and takes part in the sessions. We process a child's personal data only with that consent and only to provide the sessions. We do not track or monitor children's behaviour and do not direct any advertising at children.",
          ],
        },
        {
          heading: "7. Who we share it with",
          body: ["Only with service providers who help us run the practice, each bound to protect your data and use it only on our instructions:"],
          points: [
            "**Google** (Google Workspace): email, booking records, calendar invitations and Google Meet video sessions.",
            "**Razorpay:** online payments, under the Reserve Bank of India's rules for payment aggregators.",
            "**Vercel:** hosting of this website.",
            "**Our associate consultant** for Children with Parents sessions, who receives only what is needed to provide them.",
          ],
        },
        {
          heading: "8. Where your data is stored",
          body: [
            "Some of these providers store data on servers outside India. Such transfers are permitted under the DPDP Act, and we do not transfer personal data to any country restricted by the Government of India.",
          ],
        },
        {
          heading: "9. How long we keep it",
          points: [
            "**Session notes and intake forms:** only as long as needed for your sessions, then securely deleted.",
            "**Booking and payment records:** for as long as tax and accounting laws require.",
            "**Organisation enquiries:** until the enquiry is concluded, then deleted unless an engagement follows.",
            "**Server logs:** for a short period, for security.",
          ],
          after: ["When the purpose is served and no law requires us to keep the data, we erase it."],
        },
        {
          heading: "10. How we protect it",
          points: [
            "The website is served only over encrypted connections (HTTPS), with strict security settings.",
            "Booking records are held in access-controlled accounts; only your counsellor can see your notes.",
            "Payments are verified directly with Razorpay, a PCI DSS compliant payment gateway, before a booking is confirmed.",
            "Session notes are encrypted.",
          ],
          after: [
            "If a personal data breach occurs, we will inform you and the Data Protection Board of India without delay, as the law requires, with what happened, its likely impact, and what we are doing about it.",
          ],
        },
        {
          heading: "11. Your rights",
          body: ["Under the DPDP Act you have the right to:"],
          points: [
            "**Access:** get a summary of the personal data we hold about you, how we use it, and who we have shared it with.",
            "**Correction and erasure:** have your data corrected, completed, updated or erased.",
            "**Withdraw consent** at any time.",
            "**Grievance redressal:** raise a complaint with us and have it resolved.",
            "**Nominate** someone to exercise these rights for you in the event of death or incapacity.",
          ],
        },
        {
          heading: "12. Grievance Officer and contact",
          body: [
            "To exercise any right, ask a question or make a complaint about your personal data, contact:",
            ...contactLines(s),
            "We will acknowledge your request promptly and resolve it within 30 days. We may ask you to confirm your identity first, to protect your data.",
            "If you are not satisfied with our response, you may complain to the **Data Protection Board of India**.",
          ],
        },
        {
          heading: "13. Cookies",
          body: [
            "This website does not use advertising or analytics cookies and does not track you across other websites. Razorpay's checkout may use cookies of its own to process your payment securely.",
          ],
        },
        {
          heading: "14. Changes to this policy",
          body: [
            "We may update this policy as the law or our services change. The date at the top shows the latest version. If a change affects how we use your data, we will tell you before it applies.",
          ],
        },
        {
          heading: "Not for emergencies",
          body: ["This service is not for emergencies. If you or someone you know is in crisis, call **Tele-MANAS on 14416** (free, 24 hours) or go to the nearest hospital."],
        },
      ],
    },
    {
      slug: "terms",
      title: "Terms of service",
      sub: "The terms on which we provide counselling and coaching, and on which you use this website.",
      seoTitle: "Terms of Service",
      seoDescription: `Terms for booking and using counselling and coaching sessions with ${s.legalName}: the service, bookings, payments, confidentiality and your responsibilities.`,
      updated: LEGAL_UPDATED,
      sections: [
        {
          heading: "1. About these terms",
          body: [
            `These terms apply when you use this website or book a session with ${who}. By booking, you agree to them. If you do not agree, please do not book.`,
          ],
        },
        {
          heading: "2. Our services",
          body: [
            "We provide non-clinical counselling and coaching using Cognitive Behavioural Therapy (CBT) tools, for individuals, couples, families and organisations, online and in person in Bangalore.",
            "Our counselling and coaching is **not a substitute for clinical therapy or psychiatric treatment**. It does not involve diagnosis or medication. Where clinical care is needed, we work alongside your doctor or psychiatrist, or refer you to one. We cannot guarantee any particular outcome.",
          ],
        },
        {
          heading: "3. Who can book",
          body: [
            "You must be 18 or older to book for yourself. Sessions for children are booked by a parent or lawful guardian, who takes part in them.",
          ],
        },
        {
          heading: "4. Bookings and payment",
          points: [
            "Fees are shown before you pay, are in Indian Rupees, inclusive of all taxes, and non-refundable. Sessions can be rescheduled instead.",
            "Payment is taken in advance. Your session is confirmed once payment is received (online payments) or verified (UPI transfers).",
            "While you pay, your chosen time is held for a few minutes. If payment is not completed, the time is released.",
            "Online payments are processed by Razorpay. We never see or store your card, UPI or bank details.",
          ],
        },
        {
          heading: "5. Cancellations and refunds",
          body: ["Fees are not refunded; if you need to cancel, your session is rescheduled to a later date of your choice. See our [cancellation and refund policy](/cancellation-and-refunds)."],
        },
        {
          heading: "6. Confidentiality",
          body: [
            "What you share in sessions is confidential and handled as set out in our [privacy policy](/privacy). We do not confirm to anyone that you are a client without your written permission. The only exceptions are where the law requires disclosure, or where there is a serious risk to your life or someone else's.",
          ],
        },
        {
          heading: "7. Online sessions",
          body: [
            "For online sessions you are responsible for a private space, a working device and a stable internet connection. Sessions must not be recorded by either side without the other's written agreement.",
          ],
        },
        {
          heading: "8. In-person and dinner sessions",
          body: [
            "The venue is shared once your booking is confirmed. For Public Figures sessions, dinner is included in the fee. Please arrive on time; a late start may not extend the session.",
          ],
        },
        {
          heading: "9. Respectful conduct",
          body: [
            "We may decline or end a booking where there is abusive or unsafe behaviour, or where the service is clearly not suitable, and will help you find appropriate support where we can.",
          ],
        },
        {
          heading: "10. Website content",
          body: [
            "Articles and information on this website are for general information only and are not personal advice. The text, design and logo belong to BearingMind and may not be copied without permission.",
          ],
        },
        {
          heading: "11. Liability",
          body: [
            "We provide our services with reasonable care and skill. To the extent the law allows, we are not liable for indirect losses, or for interruptions caused by internet, video-call or payment services outside our control. Nothing in these terms limits any right you have under the Consumer Protection Act, 2019.",
          ],
        },
        {
          heading: "12. Governing law",
          body: ["These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have jurisdiction."],
        },
        {
          heading: "13. Contact",
          body: contactLines(s),
        },
      ],
    },
    {
      slug: "cancellation-and-refunds",
      title: "Cancellation and refund policy",
      sub: "Sessions are not refunded, but can always be rescheduled to a later date.",
      seoTitle: "Cancellation and Refund Policy",
      seoDescription: `Fees for sessions with ${s.legalName} are non-refundable; sessions can be rescheduled to a later date at no extra cost. How to reschedule.`,
      updated: LEGAL_UPDATED,
      sections: [
        {
          heading: "No refunds",
          body: [
            "All fees are paid in advance and are **non-refundable**. Instead of a refund, your session can be **rescheduled to a later date of your choice**, at no extra cost.",
          ],
        },
        {
          heading: "How to reschedule",
          body: [
            `Please tell us as early as you can, by email to [${s.email}](mailto:${s.email}) or on phone or WhatsApp at [${s.phoneDisplay}](tel:${s.phone.replace(/\s/g, "")}), with your booking reference, and we will agree a new date with you.`,
          ],
        },
        {
          heading: "If we need to cancel",
          body: ["If we have to cancel or cannot hold your session, we reschedule it to a date of your choice, at no extra cost."],
        },
        {
          heading: "Payment problems",
          points: [
            "**Paid, but the time was taken:** if your chosen time was booked by someone else while you were paying, we contact you to arrange another time.",
            "**Charged twice, or charged for a failed payment:** this is a payment error, not a session fee. Any duplicate or wrongly debited amount is returned to your original payment method, as banking rules require; failed payments are usually reversed automatically by your bank or Razorpay.",
          ],
        },
        {
          heading: "Questions",
          body: contactLines(s),
        },
      ],
    },
  ];
}
