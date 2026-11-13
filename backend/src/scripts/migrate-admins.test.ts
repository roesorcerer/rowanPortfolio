import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb } from "../test/setup";
import { migrateAdmins } from "./migrate-admins";

// Runs against the real test database, because the behaviour under test is
// MongoDB's: renaming a collection, replacing an empty target, unsetting a
// field. clearDatabase only empties collections a model registered, and
// `users` no longer has a model, so this file drops both collections itself.

function db() {
  const handle = mongoose.connection.db;
  if (!handle) throw new Error("not connected");
  // setup.ts's guard checks the URI; this checks where we actually landed
  // before dropping anything.
  if (!/test/i.test(mongoose.connection.name)) {
    throw new Error(
      `Refusing to drop collections in '${mongoose.connection.name}'`
    );
  }
  return handle;
}

async function drop(name: string) {
  const found = await db().listCollections({ name }).toArray();
  if (found.length > 0) await db().dropCollection(name);
}

const legacyAdmin = {
  email: "rowan@example.com",
  password: "hash",
  name: "Rowan",
  role: "admin",
};
const stranger = {
  email: "stranger@example.com",
  password: "hash",
  name: "S",
  role: "user",
};

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await drop("users");
  await drop("admins");
  await disconnectTestDb();
});

beforeEach(async () => {
  await drop("users");
  await drop("admins");
});

describe("migrateAdmins", () => {
  it("moves the admin to admins, drops role, and deletes non-admin accounts", async () => {
    await db()
      .collection("users")
      .insertMany([{ ...legacyAdmin }, { ...stranger }]);

    const report = await migrateAdmins(db(), { dryRun: false });

    expect(report).toEqual({
      moved: ["rowan@example.com"],
      deleted: ["stranger@example.com"],
      rolesDropped: 1,
    });
    const admins = await db().collection("admins").find().toArray();
    expect(admins).toHaveLength(1);
    expect(admins[0]).toMatchObject({
      email: "rowan@example.com",
      password: "hash",
    });
    expect(admins[0]).not.toHaveProperty("role");
    expect(
      await db().listCollections({ name: "users" }).toArray()
    ).toHaveLength(0);
  });

  // The new code's model creates an empty admins collection when it starts,
  // so if the deploy lands before the migration, the target already exists.
  it("replaces an empty admins collection left by the new code starting first", async () => {
    await db().createCollection("admins");
    await db()
      .collection("users")
      .insertOne({ ...legacyAdmin });

    await migrateAdmins(db(), { dryRun: false });

    expect(await db().collection("admins").countDocuments()).toBe(1);
  });

  it("refuses to merge when both collections hold accounts", async () => {
    await db()
      .collection("users")
      .insertOne({ ...legacyAdmin });
    await db()
      .collection("admins")
      .insertOne({ email: "new@example.com", name: "N" });

    await expect(migrateAdmins(db(), { dryRun: false })).rejects.toThrow(
      /Resolve by hand/
    );
    expect(await db().collection("users").countDocuments()).toBe(1);
    expect(await db().collection("admins").countDocuments()).toBe(1);
  });

  it("changes nothing on a dry run, but reports what it would do", async () => {
    await db()
      .collection("users")
      .insertMany([{ ...legacyAdmin }, { ...stranger }]);

    const report = await migrateAdmins(db(), { dryRun: true });

    expect(report).toEqual({
      moved: ["rowan@example.com"],
      deleted: ["stranger@example.com"],
      rolesDropped: 1,
    });
    expect(await db().collection("users").countDocuments()).toBe(2);
    expect(
      await db().listCollections({ name: "admins" }).toArray()
    ).toHaveLength(0);
  });

  it("is a no-op the second time", async () => {
    await db()
      .collection("users")
      .insertOne({ ...legacyAdmin });
    await migrateAdmins(db(), { dryRun: false });

    const again = await migrateAdmins(db(), { dryRun: false });

    expect(again).toEqual({ moved: [], deleted: [], rolesDropped: 0 });
    expect(await db().collection("admins").countDocuments()).toBe(1);
  });
});
