// Loads .env, which carries MONGODB_URI_TEST. The route tests get this for
// free by importing the app; a store-level test has to ask for it.
import "../config";

import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import * as store from "./projects-store";

// A raw document can be missing the fields the Mongoose schema defaults.
// `updateOne` does not apply schema defaults to paths it does not touch, so a
// record last written by a migration script can genuinely lack an array the
// schema would have supplied — one of the live records is exactly that.
//
// The wire contract promises these are always present, so `toProject` is where
// that promise is kept. These tests exist because the fallbacks were briefly
// deleted on the reasoning that the schema guaranteed them; it does not.

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await clearDatabase();
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearDatabase();
});

/** Writes straight through the driver, bypassing the schema and its defaults. */
async function insertRaw(doc: Record<string, unknown>) {
  const collection = mongoose.connection.db!.collection("projects");
  const result = await collection.insertOne({
    slug: "bare-project",
    title: "Bare project",
    description: "Written by a migration, not by the model",
    image: "/assets/bare.png",
    projectType: "product",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...doc,
  });
  return String(result.insertedId);
}

describe("reading a document that predates its defaults", () => {
  it("hands back arrays for every defaulted list", async () => {
    await insertRaw({ status: "published" });

    const [project] = await store.list();

    expect(project.media).toEqual([]);
    expect(project.links).toEqual([]);
    expect(project.details).toEqual([]);
    expect(project.collaborators).toEqual([]);
    expect(project.category).toEqual([]);
  });

  it("hands back the scalar defaults too", async () => {
    const id = await insertRaw({ status: "published" });

    const project = await store.findById(id);

    expect(project?.featured).toBe(false);
    expect(project?.order).toBe(0);
  });

  it("treats a document with no status as a draft, and hides it", async () => {
    // Mongo's `$ne: "draft"` matches a document that has no `status` at all, so
    // the public filter asks for "published" by name. Otherwise an
    // unclassifiable record would be listed publicly while reporting itself as
    // a draft — the query and the mapper disagreeing about the same document.
    const id = await insertRaw({});

    expect(await store.findById(id)).toMatchObject({ status: "draft" });
    expect(await store.list()).toEqual([]);
    expect(await store.findByIdOrSlug("bare-project")).toBeNull();
  });

  it("never leaks Mongo internals onto the wire", async () => {
    await insertRaw({ status: "published", __v: 7, secretInternalField: "nope" });

    const [project] = await store.list();

    expect(project).not.toHaveProperty("__v");
    expect(project).not.toHaveProperty("secretInternalField");
  });
});
