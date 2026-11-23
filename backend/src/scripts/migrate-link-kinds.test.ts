import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb } from "../test/setup";
import { renameLinkKinds } from "./migrate-link-kinds";

// Against the real test database, with documents written the way production
// holds them: through the driver, so nothing a model would add or default
// is present unless production has it too.
//
// No model is imported, so clearDatabase() (which empties the collections
// of registered models) wouldn't touch these; the two collections are
// emptied here instead, after the same check on where we're connected.

function db() {
  const handle = mongoose.connection.db;
  if (!handle) throw new Error("not connected");
  if (!/test/i.test(mongoose.connection.name)) {
    throw new Error(
      `Refusing to write to '${mongoose.connection.name}': not a test database`
    );
  }
  return handle;
}

async function clear() {
  await db().collection("projects").deleteMany({});
  await db().collection("events").deleteMany({});
}

const edited = new Date("2026-09-04T12:00:00Z");

async function seedProductionShape() {
  await db()
    .collection("projects")
    .insertMany([
      {
        title: "The Archive",
        status: "published",
        links: [
          { kind: "demo", url: "https://archive.example" },
          { kind: "github", url: "https://github.com/roesorcerer/archive" },
          { kind: "research", url: "https://doi.org/10.0000/x" },
        ],
        updatedAt: edited,
      },
      // A source link hosted somewhere else, filed under "github" because
      // that was the only kind the form offered.
      {
        title: "Fill the Cup",
        status: "published",
        links: [
          { kind: "github", url: "https://gitlab.com/roesorcerer/cup" },
          { kind: "itch", url: "https://roesorcerer.itch.io/cup" },
        ],
        updatedAt: edited,
      },
      { title: "A paper", status: "published", links: [], updatedAt: edited },
    ]);
  await db()
    .collection("events")
    .insertMany([
      { eventType: "link_click", projectId: "a", linkType: "github" },
      { eventType: "link_click", projectId: "a", linkType: "github" },
      { eventType: "link_click", projectId: "a", linkType: "demo" },
      { eventType: "project_view", projectId: "a", linkType: "" },
      // Not a click: not the migration's to touch, even with the old kind.
      { eventType: "project_view", projectId: "a", linkType: "github" },
    ]);
}

async function kinds() {
  const projects = await db().collection("projects").find().toArray();
  return projects.map((p) =>
    (p.links as { kind: string }[]).map((link) => link.kind)
  );
}

async function linkTypes() {
  const events = await db().collection("events").find().toArray();
  return events.map((e) => e.linkType as string);
}

beforeAll(connectTestDb);
afterAll(async () => {
  await clear();
  await disconnectTestDb();
});
beforeEach(async () => {
  await clear();
  await seedProductionShape();
});

describe("renameLinkKinds", () => {
  it("reports what a dry run would rename, and writes nothing", async () => {
    const report = await renameLinkKinds(db(), { dryRun: true });

    expect(report).toEqual({ projects: 2, links: 2, events: 2 });
    expect(await kinds()).toEqual([
      ["demo", "github", "research"],
      ["github", "itch"],
      [],
    ]);
    expect(await linkTypes()).toEqual([
      "github",
      "github",
      "demo",
      "",
      "github",
    ]);
  });

  it("renames every github link and click to source, and nothing else", async () => {
    await renameLinkKinds(db(), { dryRun: false });

    expect(await kinds()).toEqual([
      ["demo", "source", "research"],
      ["source", "itch"],
      [],
    ]);
    expect(await linkTypes()).toEqual([
      "source",
      "source",
      "demo",
      "",
      "github",
    ]);
  });

  // The sitemap publishes updatedAt as each page's last edit, and a renamed
  // kind isn't an edit anyone would see.
  it("leaves each project's updatedAt alone", async () => {
    await renameLinkKinds(db(), { dryRun: false });

    const projects = await db().collection("projects").find().toArray();
    expect(projects.map((p) => p.updatedAt)).toEqual([edited, edited, edited]);
  });

  it("finds nothing to do on a second run", async () => {
    await renameLinkKinds(db(), { dryRun: false });
    const second = await renameLinkKinds(db(), { dryRun: false });

    expect(second).toEqual({ projects: 0, links: 0, events: 0 });
    expect(await kinds()).toEqual([
      ["demo", "source", "research"],
      ["source", "itch"],
      [],
    ]);
  });
});
