/**
 * Renames the link kind "github" to "source", in both places it is stored:
 *
 *   projects  links[].kind  "github"  ->  "source"
 *   events    linkType      "github"  ->  "source"
 *
 * "github" named a host, not a role: a GitLab or itch.io source link had to
 * be filed under it or drop out of the engagement report's source column.
 *
 * Deploy first, then run this. The code that understands "source" has to
 * be live before the data says it: code from before the rename only knows
 * "github", so migrating ahead of the deploy would drop source links from
 * the cards and from the engagement report until the deploy caught up.
 * The other way round is safe: until this runs, the new code reads a
 * stored "github" link as "source" (usableLinks in
 * frontend/src/lib/projectLinks.ts, fromProject in the admin form) and
 * the engagement report counts both names (analytics-report.ts).
 *
 * Writes through the driver, not the models, so the documents change only
 * where named: Mongoose would also bump each project's `updatedAt`, which
 * the sitemap publishes as the page's last edit, and nothing a visitor
 * reads has changed.
 *
 * Safe to run more than once: a second run finds no "github" left and
 * writes nothing. Run `npm run backup:projects` first, as for any script
 * that writes to production data.
 *
 * Run from the backend/ directory, and check MONGODB_URI first:
 *   npm run migrate:link-kinds -- --dry-run
 *   npm run migrate:link-kinds
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";

type Db = NonNullable<typeof mongoose.connection.db>;

export const OLD_KIND = "github";
export const NEW_KIND = "source";

export interface LinkKindReport {
  /** Projects with at least one link of the old kind. */
  projects: number;
  /** Links of the old kind, across those projects. */
  links: number;
  /** Link-click events recorded under the old kind. */
  events: number;
}

export async function renameLinkKinds(
  db: Db,
  opts: { dryRun: boolean }
): Promise<LinkKindReport> {
  const projects = db.collection("projects");
  const events = db.collection("events");
  const hasOld = { "links.kind": OLD_KIND };
  // Only clicks carry a link kind; another event that somehow has one
  // isn't this script's to change.
  const oldClicks = { eventType: "link_click", linkType: OLD_KIND };

  const [linkCount] = await projects
    .aggregate<{
      n: number;
    }>([
      { $match: hasOld },
      { $unwind: "$links" },
      { $match: hasOld },
      { $count: "n" },
    ])
    .toArray();

  const report: LinkKindReport = {
    projects: await projects.countDocuments(hasOld),
    links: linkCount?.n ?? 0,
    events: await events.countDocuments(oldClicks),
  };

  if (!opts.dryRun) {
    // Every matching element of the array, not just the first ($[link]
    // with a filter, rather than the positional $), so a project that
    // somehow carries two source links has both renamed.
    await projects.updateMany(
      hasOld,
      { $set: { "links.$[link].kind": NEW_KIND } },
      { arrayFilters: [{ "link.kind": OLD_KIND }] }
    );
    await events.updateMany(oldClicks, { $set: { linkType: NEW_KIND } });
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
  const r = await renameLinkKinds(db, { dryRun });
  const verb = dryRun ? "would be renamed" : "renamed";
  console.log(
    `projects: ${r.links} "${OLD_KIND}" link(s) in ${r.projects} project(s) ${verb} "${NEW_KIND}"`
  );
  console.log(`events: ${r.events} link click(s) ${verb} "${NEW_KIND}"`);

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
