import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel, orderGroupKey } from "../models/project.model";

// Migrates project documents to the split-featured schema:
//
//   1. projectType "featured"  -> "product", featured: true
//      projectType stops encoding promotion; the boolean is the only way
//      something gets promoted, so grouping and filtering stop lying.
//   2. researchStatus "rejected" -> "in-revision"
//      The value now matches the label the UI has always shown.
//   3. category: string -> string[]
//      Comma- and slash-separated values are split into separate tags.
//   4. status: absent -> "published"
//      Everything that already existed was live, so it stays live. Only
//      newly created projects default to "draft".
//   5. order: renumbered contiguously from 0 within each display group
//      (featured, or the projectType), preserving current relative order.
//
// Idempotent: running it twice is a no-op. Run with --dry to print the plan
// without writing:
//
//   npx tsx backend/src/scripts/migrate-projects.ts --dry

const DRY_RUN = process.argv.includes("--dry");

type LegacyDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  category?: string | string[];
  featured?: boolean;
  projectType?: string;
  researchStatus?: string;
  status?: string;
  order?: number;
};

/** "Web App, Research / HCI" -> ["Web App", "Research", "HCI"] */
function splitCategory(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.map((t) => t.trim()).filter(Boolean);
  if (!value) return [];
  return value
    .split(/[,/]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB.${DRY_RUN ? "  (dry run — no writes)" : ""}`);

    // Read raw so legacy shapes survive the Mongoose casting layer.
    const docs = (await ProjectModel.collection
      .find({})
      .sort({ order: 1 })
      .toArray()) as unknown as LegacyDoc[];

    console.log(`Found ${docs.length} projects.`);

    // --- Pass 1: field-level rewrites -------------------------------------
    const migrated = docs.map((doc) => {
      const wasFeaturedType = doc.projectType === "featured";

      return {
        doc,
        next: {
          projectType: wasFeaturedType ? "product" : (doc.projectType ?? "practice"),
          featured: wasFeaturedType ? true : (doc.featured ?? false),
          category: splitCategory(doc.category),
          researchStatus:
            doc.researchStatus === "rejected" ? "in-revision" : doc.researchStatus,
          status: doc.status ?? "published",
        },
      };
    });

    // --- Pass 2: renumber order within each display group ------------------
    // docs arrived sorted by the old global order, so pushing into per-group
    // buckets preserves the relative order you already had.
    const groups = new Map<string, typeof migrated>();
    for (const entry of migrated) {
      const key = orderGroupKey({
        featured: entry.next.featured,
        projectType: entry.next.projectType as never,
      });
      const bucket = groups.get(key) ?? [];
      bucket.push(entry);
      groups.set(key, bucket);
    }

    // Typed against the raw driver, not Mongoose — we write through
    // ProjectModel.collection so legacy shapes aren't cast on the way in.
    const operations: mongoose.mongo.AnyBulkWriteOperation[] = [];

    for (const [group, entries] of groups) {
      console.log(`\n  ${group} (${entries.length})`);

      entries.forEach((entry, index) => {
        const set: Record<string, unknown> = {
          projectType: entry.next.projectType,
          featured: entry.next.featured,
          category: entry.next.category,
          status: entry.next.status,
          order: index,
        };
        // Leave researchStatus absent rather than writing undefined.
        if (entry.next.researchStatus !== undefined) {
          set.researchStatus = entry.next.researchStatus;
        }

        const changes = describeChanges(entry.doc, set);
        console.log(
          `    ${index}. ${entry.doc.title}${changes.length ? `  [${changes.join(", ")}]` : "  (unchanged)"}`
        );

        if (changes.length > 0) {
          operations.push({
            updateOne: { filter: { _id: entry.doc._id }, update: { $set: set } },
          });
        }
      });
    }

    console.log(`\n${operations.length} document(s) need changes.`);

    if (DRY_RUN) {
      console.log("Dry run — nothing written. Re-run without --dry to apply.");
    } else if (operations.length > 0) {
      const result = await ProjectModel.collection.bulkWrite(operations);
      console.log(`Updated ${result.modifiedCount} document(s).`);
    } else {
      console.log("Nothing to do — already migrated.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Done.");
  }
}

/** Human-readable diff, also used to skip no-op writes. */
function describeChanges(doc: LegacyDoc, set: Record<string, unknown>): string[] {
  const changes: string[] = [];

  if (doc.projectType !== set.projectType) {
    changes.push(`type ${doc.projectType ?? "—"} → ${set.projectType}`);
  }
  if ((doc.featured ?? false) !== set.featured) {
    changes.push(`featured → ${set.featured}`);
  }
  // Compare against the RAW value, not its normalized form — normalizing both
  // sides would compare the target to itself and never report a conversion,
  // which would also skip the write for a doc that needs only this change.
  const nextCategory = set.category as string[];
  const categoryUnchanged =
    Array.isArray(doc.category) &&
    doc.category.length === nextCategory.length &&
    doc.category.every((tag, i) => tag === nextCategory[i]);
  if (!categoryUnchanged) {
    changes.push(`category → [${nextCategory.join(" | ")}]`);
  }
  if (doc.researchStatus !== set.researchStatus && set.researchStatus !== undefined) {
    changes.push(`researchStatus ${doc.researchStatus} → ${set.researchStatus}`);
  }
  if (doc.status !== set.status) {
    changes.push(`status → ${set.status}`);
  }
  if ((doc.order ?? 0) !== set.order) {
    changes.push(`order ${doc.order ?? 0} → ${set.order}`);
  }

  return changes;
}

migrate();
