import { CalendarIcon } from "@sanity/icons/Calendar";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { HomeIcon } from "@sanity/icons/Home";
import { UserIcon } from "@sanity/icons/User";
import type { StructureResolver } from "sanity/structure";

const single = (S: Parameters<StructureResolver>[0], type: string, title: string, icon: typeof CogIcon) =>
  S.listItem().title(title).id(type).icon(icon).child(S.document().schemaType(type).documentId(type).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("BearingMind")
    .items([
      single(S, "homePage", "Home page", HomeIcon),
      single(S, "bookingSettings", "Sessions & booking", CalendarIcon),
      single(S, "siteSettings", "Website settings", CogIcon),
      S.divider(),
      S.listItem()
        .title("Blog")
        .icon(DocumentTextIcon)
        .child(
          S.documentList()
            .title("Blog")
            .filter('_type == "post" && kind == "blog"')
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
            .initialValueTemplates([S.initialValueTemplateItem("post-blog")]),
        ),
      S.listItem()
        .title("Articles")
        .icon(DocumentTextIcon)
        .child(
          S.documentList()
            .title("Articles")
            .filter('_type == "post" && kind == "article"')
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
            .initialValueTemplates([S.initialValueTemplateItem("post-article")]),
        ),
      S.documentTypeListItem("author").title("Authors").icon(UserIcon),
    ]);
