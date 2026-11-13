/**
 * Puts the analytics retention TTL in place on an existing database, and
 * clears out page views and events that automated agents already recorded.
 *
 *   pageviews, events  ->  TTL index on createdAt (ANALYTICS_RETENTION_DAYS)
 *   rows from bots     ->  deleted (same patterns intake now refuses)
 *
 * Why a script, when the schemas already declare the index: see
 * src/models/analytics-retention.ts. In short, Mongoose won't replace an
 * existing index whose options differ, and fails quietly when it tries.
 *
 * Once the TTL index exists, MongoDB itself deletes everything older than the
 * window within about a minute, including rows that were already that old.
 * The dry run reports how many that will be.
 *
 * Safe to run more than once: an index already at the right setting is left
 * alone, and a second purge finds nothing.
 *
 * Run from the backend/ directory, and check MONGODB_URI first:
 *   npm run migrate:retention -- --dry-run
 *   npm run migrate:retention
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import {
  ANALYTICS_RETENTION_SECONDS,
  TTL_INDEX,
} from "../models/analytics-retention";
import { AUTOMATED_AGENT_PATTERNS } from "../utils/automated-agent";

type Db = NonNullable<typeof mongoose.connection.db>;

// The collections Mongoose names for the PageView and Event models. Named
// here rather than read off the models, because importing a model makes
// Mongoose start its own index build against the same collection when the
// connection opens — the very build this script exists to stand in for.
export const ANALYTICS_COLLECTIONS = ["pageviews", "events"] as const;

export type RetentionAction = "created" | "replaced" | "unchanged";

export type RetentionReport = Record<
  (typeof ANALYTICS_COLLECTIONS)[number],
  { index: RetentionAction; expiring: number; botsDeleted: number }
>;

function isCreatedAtIndex(key: Record<string, unknown>): boolean {
  const fields = Object.keys(key);
  return fields.length === 1 && fields[0] === "createdAt";
}

async function exists(db: Db, name: string): Promise<boolean> {
  return (await db.listCollections({ name }).toArray()).length > 0;
}

export async function applyRetention(
  db: Db,
  opts: { dryRun: boolean; now?: Date }
): Promise<RetentionReport> {
  const now = opts.now ?? new Date();
  const cutoff = new Date(now.getTime() - ANALYTICS_RETENTION_SECONDS * 1000);
  const report = {} as RetentionReport;

  for (const name of ANALYTICS_COLLECTIONS) {
    const collection = db.collection(name);
    const indexes = (await exists(db, name)) ? await collection.indexes() : [];
    const current = indexes.find((index) => isCreatedAtIndex(index.key));

    let action: RetentionAction;
    if (!current) {
      action = "created";
    } else if (current.expireAfterSeconds === ANALYTICS_RETENTION_SECONDS) {
      action = "unchanged";
    } else {
      action = "replaced";
    }

    const bots = { userAgent: { $in: AUTOMATED_AGENT_PATTERNS } };
    const expiring = await collection.countDocuments({
      createdAt: { $lt: cutoff },
    });
    const botCount = await collection.countDocuments(bots);

    if (!opts.dryRun) {
      // Drop and recreate rather than collMod: collMod can only turn a plain
      // index into a TTL one on MongoDB 5.1 and later, and these collections
      // are small enough that a moment without the index costs nothing.
      if (action === "replaced" && current?.name) {
        await collection.dropIndex(current.name);
      }
      if (action !== "unchanged") {
        await collection.createIndex(TTL_INDEX.key, TTL_INDEX.options);
      }
      if (botCount > 0) await collection.deleteMany(bots);
    }

    report[name] = { index: action, expiring, botsDeleted: botCount };
  }

  return report;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("Connected, but no database handle");

  console.log(
    `Database: ${mongoose.connection.name}${dryRun ? " (dry run)" : ""}`
  );
  const report = await applyRetention(db, { dryRun });

  const would = dryRun ? "would be " : "";
  for (const [name, r] of Object.entries(report)) {
    console.log(
      `${name}: TTL index ${would}${r.index}; ` +
        `${r.botsDeleted} bot row(s) ${would}deleted; ` +
        `${r.expiring} row(s) older than the window ` +
        `${dryRun ? "will" : "will now"} expire.`
    );
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
