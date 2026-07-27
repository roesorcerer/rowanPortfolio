import mongoose from "mongoose";

function getTestMongoUri(): string {
  const testUri = process.env.MONGODB_URI_TEST;
  const appUri = process.env.MONGODB_URI;

  if (!testUri) {
    throw new Error(
      "MONGODB_URI_TEST is required for tests. Set it to a dedicated test database URI."
    );
  }

  if (appUri && testUri === appUri) {
    throw new Error(
      "Unsafe test configuration: MONGODB_URI_TEST must not equal MONGODB_URI."
    );
  }

  if (!/test/i.test(testUri)) {
    throw new Error(
      "Unsafe test configuration: MONGODB_URI_TEST must clearly target a test database (include 'test' in URI)."
    );
  }

  return testUri;
}

// Connect once before all test files, disconnect after all are done.
// Each test file handles its own data cleanup.

export async function connectTestDb() {
  await mongoose.connect(getTestMongoUri());
}

export async function disconnectTestDb() {
  await mongoose.connection.close();
}

// Drop all documents from all collections.
// Called between test suites to ensure a clean slate.
export async function clearDatabase() {
  const dbName = mongoose.connection.name;
  if (!/test/i.test(dbName)) {
    throw new Error(
      `Refusing to clear non-test database '${dbName}'. Check MONGODB_URI_TEST.`
    );
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
