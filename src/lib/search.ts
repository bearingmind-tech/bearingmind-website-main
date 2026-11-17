/* Site search: a small index built from the same CMS content as the pages. */
import "server-only";
import { getBooking, getHome, getPosts } from "./content";

export type SearchHit = { title: string; path: string; snippet: string; score: number };

type Doc = { title: string; path: string; text: string };

async function buildIndex(): Promise<Doc[]> {
  const [home, booking, posts] = await Promise.all([getHome(), getBooking(), getPosts()]);
  const docs: Doc[] = [
    { title: home.hero.heading, path: "/", text: home.hero.lede },
    { title: `${home.about.heading}: ${home.about.name}`, path: "/about", text: [home.about.role, home.about.intro, ...home.about.credentials, home.about.disclaimer].join(" ") },
    { title: home.approach.heading, path: "/approach", text: [home.approach.lede, ...home.approach.areas.flatMap((a) => [a.title, ...a.items]), home.approach.note].join(" ") },
    { title: home.organisations.heading, path: "/organisations", text: [home.organisations.subheading, home.organisations.lede, home.organisations.body, ...home.organisations.offerings].join(" ") },
    { title: home.how.heading, path: "/approach#how", text: home.how.steps.map((s) => `${s.title} ${s.text}`).join(" ") },
    { title: home.privacy.heading, path: "/privacy", text: [home.privacy.intro, ...home.privacy.notice.map((n) => `${n.label} ${n.text}`)].join(" ") },
    { title: home.research.heading, path: "/approach#research", text: home.research.notes.map((n) => `${n.text} ${n.source}`).join(" ") },
    { title: booking.copy.heading, path: "/book", text: booking.copy.lede },
    ...booking.sessionTypes.map((t) => ({
      title: t.label,
      path: "/sessions",
      text: [t.short, t.forWho, t.modeText, t.slotsText, t.note, ...t.options.map((o) => `${o.label} ${o.minutes} min${booking.showFeesPublicly ? ` ₹${o.fee}` : ""}`)].join(" "),
    })),
    ...home.faq.items.map((q) => ({ title: q.question, path: "/faq", text: q.answer })),
    ...posts.map((p) => ({ title: p.title, path: `/${p.kind === "article" ? "articles" : "blog"}/${p.slug}`, text: p.excerpt || "" })),
  ];
  return docs;
}

export async function searchSite(raw: string): Promise<SearchHit[]> {
  const q = raw.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").trim().slice(0, 80);
  const terms = q.split(/\s+/).filter((t) => t.length > 1).slice(0, 8);
  if (!terms.length) return [];
  const docs = await buildIndex();
  const hits: SearchHit[] = [];
  for (const d of docs) {
    const title = d.title.toLowerCase();
    const text = d.text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 5;
      const n = text.split(t).length - 1;
      score += Math.min(n, 5);
    }
    if (!score) continue;
    const at = Math.max(0, text.indexOf(terms[0]));
    const start = Math.max(0, at - 60);
    const snippet = (start > 0 ? "…" : "") + d.text.slice(start, start + 180).trim() + (start + 180 < d.text.length ? "…" : "");
    hits.push({ title: d.title, path: d.path, snippet, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 20);
}
