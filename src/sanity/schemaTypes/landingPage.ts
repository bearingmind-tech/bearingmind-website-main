import { DocumentsIcon } from "@sanity/icons/Documents";
import { defineArrayMember, defineField, defineType } from "sanity";
import { str, strList, textBlock, txt } from "./helpers";

const paragraphs = (name: string, title: string) =>
  defineField({ name, title, type: "array", of: [defineArrayMember({ type: "text", rows: 4 })] });

export const landingPage = defineType({
  name: "landingPage",
  title: "Landing page",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "plan",
      title: "Plan",
      description: "Which plan this page leads to (its colour, times and booking button come from Sessions & booking).",
      type: "string",
      options: {
        list: [
          { title: "Public Figures", value: "dining" },
          { title: "Employed Professionals", value: "professional" },
          { title: "Homemakers", value: "homemaker" },
          { title: "Children with Parents", value: "children" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "slug", title: "Page address", type: "slug", readOnly: true, description: "Fixed; changing it would break links from Google." }),
    str("title", "Heading"),
    txt("sub", "Subheading", 2),
    str("seoTitle", "Google title", "Under 60 characters."),
    txt("seoDescription", "Google description", 2, "Under 160 characters."),
    paragraphs("intro", "Introduction"),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [textBlock("section", "Section", [str("heading", "Heading"), paragraphs("body", "Paragraphs"), strList("points", "Bullet points (optional)")])],
    }),
    defineField({
      name: "readMore",
      title: "Further reading (optional)",
      description: "A link shown after the sections, e.g. this plan's blog guide.",
      type: "object",
      fields: [str("label", "Link text"), str("href", "Link address", "e.g. /blog/does-my-child-need-counselling")],
    }),
    defineField({
      name: "faq",
      title: "Questions",
      type: "array",
      of: [textBlock("question", "Question", [str("question", "Question"), txt("answer", "Answer", 3)])],
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
