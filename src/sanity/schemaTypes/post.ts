import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "Google & AI search" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (r) => r.required().max(110) }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      group: "content",
      description: "Click Generate. This becomes the link, e.g. bearingmind.com/blog/managing-burnout",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kind",
      title: "Section",
      type: "string",
      group: "content",
      options: { list: [{ title: "Blog", value: "blog" }, { title: "Article", value: "article" }], layout: "radio" },
      initialValue: "blog",
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }], group: "content" }),
    defineField({ name: "reviewedBy", title: "Reviewed by (optional)", type: "string", group: "content" }),
    defineField({ name: "publishedAt", title: "Published on", type: "datetime", group: "content", initialValue: () => new Date().toISOString(), validation: (r) => r.required() }),
    defineField({ name: "updatedAt", title: "Last updated (optional)", type: "datetime", group: "content" }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Image description", type: "string" })],
    }),
    defineField({
      name: "excerpt",
      title: "Short summary",
      type: "text",
      rows: 3,
      group: "content",
      description: "Two or three sentences. Shown in lists, and used by Google and AI assistants.",
      validation: (r) => r.max(300),
    }),
    defineField({
      name: "body",
      title: "Text",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Image description", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "Questions and answers (optional)",
      description: "Short Q&As at the end of the post. These help Google and AI assistants quote you.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", type: "string", title: "Question" }),
            defineField({ name: "answer", type: "text", rows: 3, title: "Answer" }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    defineField({
      name: "sources",
      title: "Sources (optional)",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          fields: [defineField({ name: "title", type: "string", title: "Source" }), defineField({ name: "url", type: "url", title: "Link" })],
          preview: { select: { title: "title", subtitle: "url" } },
        }),
      ],
    }),
    defineField({ name: "seoTitle", title: "Title in Google (optional)", type: "string", group: "seo", validation: (r) => r.max(65) }),
    defineField({ name: "seoDescription", title: "Description in Google (optional)", type: "text", rows: 2, group: "seo", validation: (r) => r.max(160) }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "kind", media: "mainImage" } },
});
