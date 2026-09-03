/**
 * Two merges in one pass:
 *
 *   link / githubLink / relatedResearchLink  ->  links[] with a `kind`
 *   technologies[]                           ->  folded into category[]
 *
 * Safe to run more than once. A document is only converted if it still has
 * something to convert, and the legacy fields are unset only after their
 * values have been written into the new shape.
 *
 * `strict: false` is required on the write: the fields being unset are no
 * longer in the schema, and Mongoose's strict mode silently DROPS unknown
 * paths from an update — a strict $unset here is a no-op that reports success.
 *
 * Run from the backend/ directory:
 *   npm run migrate:links -- --dry-run
 *   npm run migrate:links
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";

// The kind each old column becomes. Order is render order: the demo first,
// because it is the one a visitor most often wants.
const LINK_COLUMNS = [
  { field: "link", kind: "demo" },
  { field: "githubLink", kind: "github" },
  { field: "relatedResearchLink", kind: "research" },
] as const;

const LEGACY_FIELDS = [...LINK_COLUMNS.map((c) => c.field), "technologies"];

type LegacyDoc = Record<string, unknown> & {
  _id: mongoose.Types.ObjectId;
  title: string;
  category?: unknown;
  technologies?: unknown;
  links?: unknown[];
};

function linksFrom(doc: LegacyDoc) {
  const links = [];
  for (const column of LINK_COLUMNS) {
    const raw = doc[column.field];
    if (typeof raw !== "string") continue;
    const url = raw.trim();
    if (!url) continue;
    links.push({ kind: column.kind, url });
  }
  return links;
}

/**
 * Tags and stack in one list. De-duplicated case-insensitively because the two
 * arrays genuinely overlapped — "Co-Design" and "Research" each appeared in
 * both on real records. The casing that was typed first wins.
 */
function categoryFrom(doc: LegacyDoc) {
  const toArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : typeof value === "string"
        ? [value]
        : [];

  const seen = new Map<string, string>();
  for (const tag of [...toArray(doc.category), ...toArray(doc.technologies)]) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  const docs = (await ProjectModel.find().lean()) as unknown as LegacyDoc[];

  let converted = 0;
  let skipped = 0;

  for (const doc of docs) {
    const stale = LEGACY_FIELDS.filter((field) => field in doc);
    const needsLinks = !Array.isArray(doc.links);

    if (stale.length === 0 && !needsLinks) {
      skipped += 1;
      continue;
    }

    const links = needsLinks ? linksFrom(doc) : undefined;
    const category = categoryFrom(doc);

    const set: Record<string, unknown> = { category };
    if (links) set.links = links;

    const summary = [
      links ? `${links.length} link(s) [${links.map((l) => l.kind).join(", ")}]` : null,
      `${category.length} tag(s)`,
      stale.length ? `dropping ${stale.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`${dryRun ? "[dry-run] " : ""}${doc.title}: ${summary}`);

    if (!dryRun) {
      await ProjectModel.updateOne(
        { _id: doc._id },
        {
          $set: set,
          $unset: Object.fromEntries(LEGACY_FIELDS.map((f) => [f, 1])),
        },
        { strict: false }
      );
    }

    converted += 1;
  }

  console.log(
    `\n${dryRun ? "Would convert" : "Converted"} ${converted} project(s), ` +
      `skipped ${skipped} already current.`
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
