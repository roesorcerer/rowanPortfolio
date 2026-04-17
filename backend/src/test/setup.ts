import mongoose from "mongoose";
import config from "../config";

// Connect once before all test files, disconnect after all are done.
// Each test file handles its own data cleanup.

export async function connectTestDb() {
  await mongoose.connect(config.mongoUri);
}

export async function disconnectTestDb() {
  await mongoose.connection.close();
}

// Drop all documents from all collections.
// Called between test suites to ensure a clean slate.
export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
