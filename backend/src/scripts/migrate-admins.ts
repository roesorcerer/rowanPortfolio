/**
 * Moves the account data from the old User model to the Admin model:
 *
 *   users collection  ->  admins collection
 *   role field        ->  dropped
 *
 * Accounts whose role was not "admin" are deleted, not moved. They could only
 * have come from the public /register route before it was removed, and they
 * could do nothing. Moving them would be dangerous: with no role left, every
 * account in `admins` can sign in and edit the site. A dry run lists them by
 * email first.
 *
 * Safe to run more than once. With no `users` collection left, a run only
 * makes sure no admin still carries a role.
 *
 * Order relative to the deploy: running this first keeps the admin's current
 * session working until the new code ships (the old code checks the token,
 * not the database, on every admin request). Either order works; between the
 * two steps, signing in fails, because each version looks in a collection the
 * other one has emptied.
 *
 * Run from the backend/ directory, and check MONGODB_URI first:
 *   npm run migrate:admins -- --dry-run
 *   npm run migrate:admins
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";

type Db = NonNullable<typeof mongoose.connection.db>;

export type MigrateAdminsReport = {
  moved: string[];
  deleted: string[];
  rolesDropped: number;
};

async function exists(db: Db, name: string): Promise<boolean> {
  return (await db.listCollections({ name }).toArray()).length > 0;
}

export async function migrateAdmins(
  db: Db,
  opts: { dryRun: boolean }
): Promise<MigrateAdminsReport> {
  const report: MigrateAdminsReport = {
    moved: [],
    deleted: [],
    rolesDropped: 0,
  };

  if (await exists(db, "users")) {
    const users = db.collection("users");
    const all = await users
      .find({}, { projection: { email: 1, role: 1 } })
      .toArray();
    report.moved = all
      .filter((u) => u.role === "admin")
      .map((u) => String(u.email));
    report.deleted = all
      .filter((u) => u.role !== "admin")
      .map((u) => String(u.email));

    // The new code's model creates an empty `admins` collection (and its
    // email index) the first time it starts, so an empty target is expected
    // and gets replaced. A non-empty one means someone already ran
    // `npm run admin` against the new code; merging the two sets of
    // accounts is a decision for a person, not this script.
    if (await exists(db, "admins")) {
      const already = await db.collection("admins").countDocuments();
      if (already > 0) {
        throw new Error(
          `Both users and admins hold accounts (admins has ${already}). ` +
            "Resolve by hand: nothing was changed."
        );
      }
    }

    if (!opts.dryRun) {
      if (report.deleted.length > 0) {
        await users.deleteMany({ role: { $ne: "admin" } });
      }
      await users.rename("admins", { dropTarget: true });
    }
  }

  // After a dry run the documents are still in `users`, so count roles there
  // to report what a real run would drop.
  const target =
    opts.dryRun && (await exists(db, "users")) ? "users" : "admins";
  if (await exists(db, target)) {
    const filter =
      target === "users" ? { role: "admin" } : { role: { $exists: true } };
    report.rolesDropped = await db.collection(target).countDocuments(filter);
    if (!opts.dryRun && report.rolesDropped > 0) {
      await db.collection("admins").updateMany({}, { $unset: { role: "" } });
    }
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
  const report = await migrateAdmins(db, { dryRun });

  const verb = dryRun ? "Would" : "Did";
  console.log(
    `${verb} move ${report.moved.length} admin(s): ${report.moved.join(", ") || "none"}`
  );
  console.log(
    `${verb} delete ${report.deleted.length} non-admin account(s): ` +
      `${report.deleted.join(", ") || "none"}`
  );
  console.log(`${verb} drop role from ${report.rolesDropped} document(s).`);

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
