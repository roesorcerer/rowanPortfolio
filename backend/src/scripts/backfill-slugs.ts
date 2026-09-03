import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";
import { slugify } from "../utils/slug";

// Gives every existing project a stored permalink slug.
//
// Reads already derive a slug from the title when none is stored, so links
// work before this runs — but a derived slug moves the moment the title is
// edited, and a resume can't be recalled. Storing it freezes the URL.
//
// Collisions get a numeric suffix in list order, so the first "Portfolio" keeps
// "portfolio" and the second becomes "portfolio-2".
//
// Idempotent: documents that already have a slug are left alone. Run with
// --dry to print the plan without writing:
//
//   npx tsx backend/src/scripts/backfill-slugs.ts --dry

const DRY_RUN = process.argv.includes("--dry");

const RESERVED_SLUGS = new Set(["all", "reorder"]);

type SlugDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug?: string;
};

async function backfill() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB.${DRY_RUN ? "  (dry run — no writes)" : ""}`);

    const docs = (await ProjectModel.collection
      .find({})
      .sort({ featured: -1, order: 1 })
      .toArray()) as unknown as SlugDoc[];

    console.log(`Found ${docs.length} projects.`);

    // Seeded with the slugs already stored, so a backfill run can't hand a
    // new document a slug that an untouched one is holding.
    const taken = new Set(
      docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
    );

    const operations: mongoose.mongo.AnyBulkWriteOperation[] = [];

    for (const doc of docs) {
      if (doc.slug) {
        console.log(`  ${doc.title}  (already /projects/${doc.slug})`);
        continue;
      }

      const slug = claim(slugify(doc.title) || "project", taken);
      taken.add(slug);
      console.log(`  ${doc.title}  →  /projects/${slug}`);

      operations.push({
        updateOne: { filter: { _id: doc._id }, update: { $set: { slug } } },
      });
    }

    console.log(`\n${operations.length} document(s) need a slug.`);

    if (DRY_RUN) {
      console.log("Dry run — nothing written. Re-run without --dry to apply.");
    } else if (operations.length > 0) {
      const result = await ProjectModel.collection.bulkWrite(operations);
      console.log(`Updated ${result.modifiedCount} document(s).`);
    } else {
      console.log("Nothing to do — every project already has a slug.");
    }
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Done.");
  }
}

/** `root`, or the first free `root-2`, `root-3`, … */
function claim(root: string, taken: Set<string>): string {
  for (let attempt = 1; ; attempt += 1) {
    const candidate = attempt === 1 ? root : `${root}-${attempt}`;
    if (!taken.has(candidate) && !RESERVED_SLUGS.has(candidate)) return candidate;
  }
}

backfill();
