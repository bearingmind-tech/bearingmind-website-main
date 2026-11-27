import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType } from "sanity";
import { str, strList, textBlock, txt } from "./helpers";

const section = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineField({ name, title, type: "object", group: name, options: { collapsible: false }, fields });

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Top", default: true },
    { name: "aiBand", title: "No-AI line" },
    { name: "about", title: "About" },
    { name: "approach", title: "What we work on" },
    { name: "organisations", title: "Organisations" },
    { name: "band", title: "Statistics" },
    { name: "how", title: "How it works" },
    { name: "sessions", title: "Sessions" },
    { name: "proof", title: "Testimonial line" },
    { name: "privacy", title: "Privacy" },
    { name: "faq", title: "Questions" },
    { name: "research", title: "Research notes" },
  ],
  fields: [
    section("hero", "Top of the page", [
      str("heading", "Headline"),
      txt("lede", "Intro paragraph", 3),
      str("tagline", "Line under the intro paragraph (headline style)"),
      str("primaryCta", "Main button"),
      str("secondaryCta", "Second button"),
      str("compassBreathe", "Compass word"),
      str("compassCaption", "Compass caption"),
    ]),
    section("aiBand", "No-AI line", [
      str("line1", "First line"),
      str("line2Before", "Second line: start"),
      str("line2Emphasis", "Second line: highlighted word"),
      str("line2After", "Second line: end"),
    ]),
    section("about", "About", [
      str("heading", "Heading"),
      str("role", "Role (small caps)"),
      str("name", "Name"),
      txt("intro", "Introduction", 3),
      str("credentialsHeading", "Credentials heading"),
      strList("credentials", "Credentials"),
      defineField({ name: "portrait", title: "Portrait photo", type: "image", options: { hotspot: true } }),
      str("portraitAlt", "Photo description (for Google and screen readers)"),
      defineField({
        name: "registrations",
        title: "Registrations",
        type: "array",
        of: [textBlock("registration", "Registration", [str("label", "Name"), str("value", "Number"), str("badge", "Badge image path (optional, e.g. /images/mhfa-accredited.png)")])],
      }),
      txt("disclaimer", "Disclaimer", 2),
    ]),
    section("approach", "What we work on", [
      str("heading", "Heading"),
      txt("lede", "Intro paragraph", 4),
      defineField({
        name: "areas",
        title: "Areas",
        type: "array",
        of: [textBlock("area", "Area", [str("title", "Title"), strList("items", "Items")])],
      }),
      txt("note", "Note below", 3),
    ]),
    section("organisations", "For organisations", [
      str("heading", "Heading"),
      str("subheading", "Subheading"),
      txt("lede", "Intro", 3),
      txt("credentials", "Credentials line", 2),
      txt("body", "Paragraph", 3),
      strList("offerings", "What we offer"),
      str("cta", "Enquiry button"),
    ]),
    section("band", "Statistics band", [
      txt("figure", "Statistic", 2),
      str("source", "Source"),
      txt("strength", "Closing line", 2),
    ]),
    section("how", "How it works", [
      str("heading", "Heading"),
      defineField({
        name: "steps",
        title: "Steps",
        type: "array",
        of: [textBlock("step", "Step", [str("title", "Title"), txt("text", "Text", 2)])],
      }),
    ]),
    section("sessions", "Sessions section", [
      str("heading", "Heading"),
      str("subheading", "Subheading"),
      txt("feeNote", "Fee note", 2),
      txt("feeHiddenNote", "Fee note while fees are hidden", 2),
      str("feeNoteLink", "Fee note link text"),
      txt(
        "diningNote",
        "Dining note",
        3,
        "Write {call}, {whatsapp} and {phone} where the call link, WhatsApp link and phone number should appear.",
      ),
    ]),
    section("proof", "Testimonial line", [
      str("quote", "Large quote"),
      strList("lines", "Lines below"),
      txt("noQuote", "Explanation", 2),
      str("cta", "Button"),
    ]),
    section("privacy", "Your privacy", [
      str("heading", "Heading"),
      str("subheading", "Subheading"),
      txt("intro", "Paragraph", 4),
      str("noticeTitle", "Full notice: title"),
      defineField({
        name: "notice",
        title: "Full notice: paragraphs",
        type: "array",
        of: [textBlock("noticeParagraph", "Paragraph", [str("label", "Bold label"), txt("text", "Text", 4)])],
      }),
      str("grievanceTitle", "Grievance: title"),
      str("grievance", "Grievance: contact name", "The email address comes from Website settings."),
    ]),
    section("faq", "Questions", [
      str("heading", "Heading"),
      str("subheading", "Subheading"),
      defineField({
        name: "items",
        title: "Questions and answers",
        type: "array",
        of: [textBlock("faqItem", "Question", [str("question", "Question"), txt("answer", "Answer", 3)])],
      }),
    ]),
    section("research", "Research notes", [
      str("heading", "Heading"),
      str("subheading", "Subheading"),
      defineField({
        name: "notes",
        title: "Notes",
        type: "array",
        of: [defineArrayMember({
          name: "researchNote",
          type: "object",
          fields: [txt("text", "Finding", 2), str("source", "Source")],
          preview: { select: { title: "text", subtitle: "source" } },
        })],
      }),
    ]),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
