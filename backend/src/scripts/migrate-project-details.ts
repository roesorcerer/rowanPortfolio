/**
 * Folds the pre-`details` columns into `project.details`, and lifts each
 * case-study step's single image into its `media` gallery.
 *
 * Safe to run more than once: a document that already has a `details` array is
 * skipped, and the legacy columns are only unset once their values have been
 * written into it. Reads stay correct before, during and after — `toDetails`
 * in the store falls back to the columns for any document not yet converted.
 *
 * Run from the backend/ directory:
 *   npm run migrate:details -- --dry-run
 *   npm run migrate:details
 */
import dotenv from "dotenv";
import path from "path";

// Must run before anything reads process.env — hence the import split, which
// matches seed.ts and createAdmin.ts.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";

const LEGACY_COLUMNS = [
  { field: "researchVenue", key: "venue", label: "Venue", kind: "text" },
  { field: "researchYear", key: "year", label: "Year", kind: "text" },
  { field: "rejectedVenue", key: "originalvenue", label: "Originally submitted to", kind: "text" },
  { field: "improvedIntoTitle", key: "improvedinto", label: "Improved into", kind: "text" },
  { field: "improvedIntoLink", key: "improvedintolink", label: "Revised manuscript", kind: "url" },
  { field: "improvementSummary", key: "improvementsummary", label: "What changed", kind: "text" },
  { field: "practicePurpose", key: "purpose", label: "Purpose", kind: "text" },
] as const;

type LegacyDoc = Record<string, unknown> & {
  _id: mongoose.Types.ObjectId;
  title: string;
  details?: unknown[];
  caseStudy?: { sections?: Record<string, unknown>[] };
};

function detailsFrom(doc: LegacyDoc) {
  const details = [];
  for (const column of LEGACY_COLUMNS) {
    const raw = doc[column.field];
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    if (!value) continue;
    details.push({ key: column.key, label: column.label, value, kind: column.kind });
  }
  return details;
}

/** Returns the rewritten sections, or null when nothing needed lifting. */
function sectionsFrom(doc: LegacyDoc) {
  const sections = doc.caseStudy?.sections;
  if (!sections?.length) return null;

  let touched = false;
  const next = sections.map((section) => {
    const { mediaSrc, mediaAlt, ...rest } = section;
    if (Array.isArray(section.media) && section.media.length > 0) return rest;
    if (mediaSrc === undefined && mediaAlt === undefined) return section;

    touched = true;
    const src = typeof mediaSrc === "string" ? mediaSrc.trim() : "";
    return {
      ...rest,
      media: src ? [{ type: "image", src, alt: mediaAlt || undefined }] : [],
    };
  });

  return touched ? next : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  const docs = (await ProjectModel.find().lean()) as unknown as LegacyDoc[];

  let converted = 0;
  let liftedMedia = 0;
  let cleaned = 0;
  let skipped = 0;

  for (const doc of docs) {
    const needsDetails = !Array.isArray(doc.details);
    const nextSections = sectionsFrom(doc);
    // Tracked separately from `needsDetails`: a document converted by an
    // earlier run can still be carrying the columns, because the first version
    // of this script issued a strict $unset that Mongoose silently discarded.
    const staleColumns = LEGACY_COLUMNS.map((c) => c.field).filter(
      (field) => field in doc
    );

    if (!needsDetails && !nextSections && staleColumns.length === 0) {
      skipped += 1;
      continue;
    }

    const details = needsDetails ? detailsFrom(doc) : undefined;
    const set: Record<string, unknown> = {};
    if (details) set.details = details;
    if (nextSections) set["caseStudy.sections"] = nextSections;

    const unset = Object.fromEntries(LEGACY_COLUMNS.map((c) => [c.field, 1]));

    const summary = [
      needsDetails ? `${details?.length ?? 0} detail(s)` : null,
      nextSections ? "step media lifted" : null,
      staleColumns.length ? `dropping ${staleColumns.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`${dryRun ? "[dry-run] " : ""}${doc.title}: ${summary}`);

    if (!dryRun) {
      // `strict: false` is load-bearing. The columns being unset are no longer
      // in the schema, and Mongoose's strict mode silently DROPS unknown paths
      // from an update — so a strict $unset here is a no-op that reports
      // success. The $set content is safe either way: it is built above from
      // known fields, not from request input.
      await ProjectModel.updateOne(
        { _id: doc._id },
        {
          // Mongo rejects an empty $set, and a cleanup-only pass has nothing
          // to write — only columns to drop.
          ...(Object.keys(set).length > 0 ? { $set: set } : {}),
          $unset: unset,
        },
        { strict: false }
      );
    }

    if (needsDetails) converted += 1;
    if (nextSections) liftedMedia += 1;
    if (staleColumns.length) cleaned += 1;
  }

  console.log(
    `\n${dryRun ? "Would convert" : "Converted"} ${converted} project(s) to details[], ` +
      `lifted step media on ${liftedMedia}, dropped legacy columns from ${cleaned}, ` +
      `skipped ${skipped} already current.`
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
