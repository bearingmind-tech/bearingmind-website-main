import { getBooking, getHome, getPosts, getSite } from "@/lib/content";
import { feeText, minText } from "@/lib/booking";

export const revalidate = 3600;

/* A plain-text summary of the practice for AI assistants (llmstxt.org). Built from the same CMS content as the site. */
export async function GET() {
  const [site, home, booking, posts] = await Promise.all([getSite(), getHome(), getBooking(), getPosts()]);
  const u = (p: string) => new URL(p, site.siteUrl).toString();
  const a = site.address;
  const lines = [
    `# ${site.legalName}`,
    "",
    `> ${site.seoDescription}`,
    "",
    `- Address: ${a.street}, ${a.locality} ${a.postalCode}, ${a.region}, India (${a.landmark})`,
    `- Phone and WhatsApp: ${site.phone}`,
    `- Email: ${site.email}`,
    `- Book online: ${u("/book")}`,
    `- Languages: ${home.faq.items.find((f) => /language/i.test(f.question))?.answer || "English"}`,
    "",
    "## About",
    `${home.about.name}, ${home.about.role}. ${home.about.intro}`,
    ...home.about.credentials.map((c) => `- ${c}`),
    ...home.about.registrations.map((r) => `- ${r.label}: ${r.value}`),
    "",
    home.about.disclaimer,
    "",
    "## Approach",
    home.approach.lede,
    ...home.approach.areas.map((ar) => `- ${ar.title}: ${ar.items.join("; ")}`),
    "",
    home.approach.note,
    "",
    booking.showFeesPublicly ? "## Sessions and fees" : "## Sessions",
    ...booking.sessionTypes.flatMap((t) => [
      `### ${t.label}`,
      `For: ${t.forWho}. Mode: ${t.modeText}. Slots: ${t.slotsText}. ${t.note} Book: ${u(`/book/${t.slug}`)}`,
      ...t.options.map((o) => `- ${o.label}: ${minText(o)}${booking.showFeesPublicly ? `, ${feeText(booking, o)}` : ""}`),
    ]),
    "",
    booking.showFeesPublicly ? home.sessions.feeNote : home.sessions.feeHiddenNote,
    "",
    "## For organisations",
    `${home.organisations.lede} ${home.organisations.body}`,
    ...home.organisations.offerings.map((o) => `- ${o}`),
    "",
    "## Questions",
    ...home.faq.items.flatMap((f) => [`### ${f.question}`, f.answer]),
    "",
    "## Privacy",
    home.privacy.intro,
    "",
    "## Pages",
    `- [Home](${u("/")})`,
    `- [About](${u("/about")})`,
    `- [Approach](${u("/approach")})`,
    `- [Sessions](${u("/sessions")})`,
    `- [For organisations](${u("/organisations")})`,
    `- [Questions](${u("/faq")})`,
    `- [Your privacy](${u("/privacy")})`,
    `- [Book a session](${u("/book")})`,
    `- [Blog](${u("/blog")})`,
    `- [Articles](${u("/articles")})`,
    ...posts.map((p) => `- [${p.title}](${u(`/${p.kind === "article" ? "articles" : "blog"}/${p.slug}`)})${p.excerpt ? `: ${p.excerpt}` : ""}`),
    "",
    site.footerCrisis,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
