import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";

// Dumps the raw projects collection to a timestamped JSON file, so a schema
// migration has a restore path. Reads through the driver rather than Mongoose
// so documents come out exactly as stored, pre-migration shapes included.
//
//   npx ts-node backend/src/scripts/backup-projects.ts
//
// Restore with restore-projects.ts, passing the file path.

const BACKUP_DIR = path.resolve(__dirname, "../../backups");

async function backup() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const docs = await ProjectModel.collection.find({}).toArray();

    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(BACKUP_DIR, `projects-${stamp}.json`);

    fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf8");

    console.log(`Wrote ${docs.length} project(s) to:`);
    console.log(`  ${file}`);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Done.");
  }
}

backup();
