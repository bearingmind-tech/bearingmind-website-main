/* Copies the current website content into Sanity, so the client starts
   editing exactly what is on the site. Run once:  npm run seed
   Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.local.
   Safe to re-run with --force (it overwrites the settings documents and the built-in posts). */
import { createClient } from "next-sanity";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { bookingDefaults, homeDefaults, siteDefaults } from "../src/content/defaults";
import { defaultPosts } from "../src/content/posts";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Add NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN to .env.local first.");
  process.exit(1);
}
const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-10-01",
  token,
  useCdn: false,
});
const force = process.argv.includes("--force");

/* Sanity needs a _key on every object inside a list. */
function withKeys<T>(v: T): T {
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === "object" && !Array.isArray(x) ? { _key: randomUUID().slice(0, 12), ...withKeys(x) } : withKeys(x))) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withKeys(x)])) as T;
  return v;
}

async function put(id: string, type: string, data: object) {
  const exists = await client.fetch<number>(`count(*[_id == $id])`, { id });
  if (exists && !force) {
    console.log(`• ${type} already exists, skipped (use --force to overwrite)`);
    return false;
  }
  await client.createOrReplace({ _id: id, _type: type, ...withKeys(data) });
  console.log(`✓ ${type}`);
  return true;
}

async function main() {
  await put("siteSettings", "siteSettings", siteDefaults);

  const about = { ...homeDefaults.about };
  delete about.portraitUrl;
  const created = await put("homePage", "homePage", { ...homeDefaults, about });
  if (created) {
    const asset = await client.assets.upload("image", readFileSync("public/images/m-h-sharieff.jpg"), { filename: "m-h-sharieff.jpg" });
    await client.patch("homePage").set({ "about.portrait": { _type: "image", asset: { _type: "reference", _ref: asset._id } } }).commit();
    console.log("✓ portrait uploaded");
  }

  await put("bookingSettings", "bookingSettings", bookingDefaults);

  await put("author-sharieff", "author", {
    name: siteDefaults.founder.name,
    role: homeDefaults.about.role,
    bio: homeDefaults.about.intro,
    credentials: homeDefaults.about.credentials,
  });

  for (const p of defaultPosts) {
    const { slug, ...rest } = p;
    await put(`post-${slug}`, "post", {
      ...rest,
      /* the author is stored once as its own document and referenced here */
      slug: { _type: "slug", current: slug },
      author: { _type: "reference", _ref: "author-sharieff" },
    });
  }
  console.log("\nDone. Open /studio to edit.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
