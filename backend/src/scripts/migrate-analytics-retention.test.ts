import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb } from "../test/setup";
import {
  ANALYTICS_RETENTION_DAYS,
  ANALYTICS_RETENTION_SECONDS,
} from "../models/analytics-retention";
import {
  ANALYTICS_COLLECTIONS,
  applyRetention,
} from "./migrate-analytics-retention";

// Against the real test database: what's under test is MongoDB's handling of
// an existing index with different options. Drops the two analytics
// collections itself, after checking where it is connected.

function db() {
  const handle = mongoose.connection.db;
  if (!handle) throw new Error("not connected");
  if (!/test/i.test(mongoose.connection.name)) {
    throw new Error(
      `Refusing to drop collections in '${mongoose.connection.name}'`
    );
  }
  return handle;
}

async function dropAnalytics() {
  for (const name of ANALYTICS_COLLECTIONS) {
    const found = await db().listCollections({ name }).toArray();
    if (found.length > 0) await db().dropCollection(name);
  }
}

async function ttlOf(name: string) {
  const indexes = await db().collection(name).indexes();
  return indexes.find((i) => Object.keys(i.key).join() === "createdAt")
    ?.expireAfterSeconds;
}

// Far in the future, so rows "older than the window" relative to NOW are still
// recent by the real clock: MongoDB's TTL monitor would otherwise be free to
// delete them mid-test and make the counts flaky.
const NOW = new Date("2099-06-01T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);
const person =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36";
const bot =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.0 Safari/537.36";

beforeAll(connectTestDb);
afterAll(async () => {
  await dropAnalytics();
  await disconnectTestDb();
});
beforeEach(dropAnalytics);

describe("applyRetention", () => {
  // The shape production is in: page views have a plain createdAt index
  // that Mongoose can't turn into a TTL one; events have none.
  async function seedProductionShape() {
    await db().collection("pageviews").createIndex({ createdAt: -1 });
    await db()
      .collection("pageviews")
      .insertMany([
        { path: "/", userAgent: person, createdAt: daysAgo(1) },
        {
          path: "/",
          userAgent: person,
          createdAt: daysAgo(ANALYTICS_RETENTION_DAYS + 30),
        },
        { path: "/", userAgent: bot, createdAt: daysAgo(1) },
      ]);
    await db()
      .collection("events")
      .insertMany([
        { eventType: "project_view", userAgent: person, createdAt: daysAgo(2) },
        {
          eventType: "project_view",
          userAgent: "AhrefsBot/7.0;",
          createdAt: daysAgo(2),
        },
      ]);
  }

  it("puts a TTL index on both collections and deletes bot rows", async () => {
    await seedProductionShape();

    const report = await applyRetention(db(), { dryRun: false, now: NOW });

    expect(report).toEqual({
      pageviews: { index: "replaced", expiring: 1, botsDeleted: 1 },
      events: { index: "created", expiring: 0, botsDeleted: 1 },
    });
    expect(await ttlOf("pageviews")).toBe(ANALYTICS_RETENTION_SECONDS);
    expect(await ttlOf("events")).toBe(ANALYTICS_RETENTION_SECONDS);
    // Bots gone now; the old row is left for MongoDB's TTL monitor.
    expect(await db().collection("pageviews").countDocuments()).toBe(2);
    expect(await db().collection("events").countDocuments()).toBe(1);
  });

  it("reports without changing anything on a dry run", async () => {
    await seedProductionShape();

    const report = await applyRetention(db(), { dryRun: true, now: NOW });

    expect(report.pageviews).toEqual({
      index: "replaced",
      expiring: 1,
      botsDeleted: 1,
    });
    expect(await ttlOf("pageviews")).toBeUndefined();
    expect(await db().collection("pageviews").countDocuments()).toBe(3);
  });

  it("leaves a correct index alone the second time", async () => {
    await seedProductionShape();
    await applyRetention(db(), { dryRun: false, now: NOW });

    const again = await applyRetention(db(), { dryRun: false, now: NOW });

    expect(again.pageviews.index).toBe("unchanged");
    expect(again.events.index).toBe("unchanged");
    expect(again.pageviews.botsDeleted).toBe(0);
  });

  it("works on a database that has no analytics yet", async () => {
    const report = await applyRetention(db(), { dryRun: false, now: NOW });

    expect(report.pageviews.index).toBe("created");
    expect(await ttlOf("pageviews")).toBe(ANALYTICS_RETENTION_SECONDS);
  });
});
