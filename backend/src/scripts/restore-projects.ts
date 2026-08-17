import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";

// Restores the projects collection from a backup-projects.ts dump, putting
// documents back in exactly the shape they were saved in.
//
//   npx ts-node backend/src/scripts/restore-projects.ts backups/projects-….json
//
// This REPLACES the collection: every current project is deleted first, so a
// project created after the backup was taken is lost. Pass --dry to see what
// would happen without writing.

const DRY_RUN = process.argv.includes("--dry");
const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));

async function restore() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }
  if (!fileArg) {
    console.error("Usage: restore-projects.ts <backup.json> [--dry]");
    process.exit(1);
  }

  const file = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(file)) {
    console.error(`Backup file not found: ${file}`);
    process.exit(1);
  }

  const docs = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>[];
  if (!Array.isArray(docs)) {
    console.error("Backup file is not a JSON array.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB.${DRY_RUN ? "  (dry run — no writes)" : ""}`);

    const current = await ProjectModel.collection.countDocuments();
    console.log(`Current collection: ${current} project(s).`);
    console.log(`Backup file:        ${docs.length} project(s).`);

    if (DRY_RUN) {
      console.log("Dry run — nothing written. Re-run without --dry to apply.");
      return;
    }

    await ProjectModel.collection.deleteMany({});
    // _id values come back as strings from JSON; cast them so they restore
    // under their original ids rather than fresh ones.
    const restored = docs.map((doc) => ({
      ...doc,
      _id: new mongoose.Types.ObjectId(String(doc._id)),
    }));
    await ProjectModel.collection.insertMany(restored as never);

    console.log(`Restored ${restored.length} project(s).`);
  } catch (error) {
    console.error("Restore failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Done.");
  }
}

restore();
