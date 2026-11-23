// Loads backend/.env, where MONGODB_URI_TEST lives locally (CI sets it in
// the environment). Route tests get this through app.ts; this file calls
// the report directly, so it imports config itself.
import "../config";
import { clearDatabase, connectTestDb, disconnectTestDb } from "../test/setup";
import { EventModel } from "../models/event.model";
import * as analyticsReport from "./analytics-report";

beforeAll(connectTestDb);
afterAll(async () => {
  await clearDatabase();
  await disconnectTestDb();
});
beforeEach(clearDatabase);

const viewed = (projectId: string) => ({
  eventType: "project_view",
  projectId,
  projectTitle: `Project ${projectId}`,
  projectType: "product",
});

const clicked = (projectId: string, linkType: string) => ({
  eventType: "link_click",
  projectId,
  projectTitle: `Project ${projectId}`,
  linkType,
});

describe("engagement", () => {
  it("counts source and demo clicks per viewed project", async () => {
    await EventModel.create([
      viewed("a"),
      viewed("a"),
      clicked("a", "source"),
      clicked("a", "demo"),
      clicked("a", "research"),
    ]);

    const { projectEngagement } = await analyticsReport.engagement();

    expect(projectEngagement).toEqual([
      {
        projectId: "a",
        projectTitle: "Project a",
        projectType: "product",
        views: 2,
        demoClicks: 1,
        sourceClicks: 1,
      },
    ]);
  });

  // Clicks recorded before `migrate:link-kinds` carry the old kind; they
  // count as source whether or not the migration has run.
  it("counts clicks stored under the old github kind as source", async () => {
    await EventModel.create([
      viewed("a"),
      clicked("a", "github"),
      clicked("a", "source"),
    ]);

    const { projectEngagement } = await analyticsReport.engagement();

    expect(projectEngagement[0]?.sourceClicks).toBe(2);
  });
});
