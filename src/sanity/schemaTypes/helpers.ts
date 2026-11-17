import { defineArrayMember, defineField } from "sanity";

export const str = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: "string", description });

export const txt = (name: string, title: string, rows = 3, description?: string) =>
  defineField({ name, title, type: "text", rows, description });

export const strList = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: "array", of: [defineArrayMember({ type: "string" })], description });

export const time = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    description: "24-hour time, e.g. 18:45",
    validation: (r) => r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:MM" }),
  });

export const weekdays = (name = "days", title = "Days") =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "number" })],
    options: {
      layout: "grid",
      list: [
        { title: "Mon", value: 1 },
        { title: "Tue", value: 2 },
        { title: "Wed", value: 3 },
        { title: "Thu", value: 4 },
        { title: "Fri", value: 5 },
        { title: "Sat", value: 6 },
        { title: "Sun", value: 0 },
      ],
    },
  });

export const textBlock = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineArrayMember({
    name,
    title,
    type: "object",
    fields,
    preview: { select: { title: fields[0].name, subtitle: fields[1]?.name } },
  });
