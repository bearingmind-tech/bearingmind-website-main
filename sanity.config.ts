"use client";
/* Sanity Studio, opened at bearingmind.com/studio */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  basePath: "/studio",
  name: "bearingmind",
  title: "BearingMind",
  projectId: projectId || "missing-project-id",
  dataset,
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => !singletonTypes.has(t.schemaType) && t.schemaType !== "landingPage" && t.id !== "post"),
      { id: "post-blog", title: "Blog post", schemaType: "post", value: { kind: "blog" } },
      { id: "post-article", title: "Article", schemaType: "post", value: { kind: "article" } },
    ],
  },
  document: {
    actions: (prev, { schemaType }) =>
      singletonTypes.has(schemaType) ? prev.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action)) : prev,
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
