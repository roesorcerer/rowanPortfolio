// How long page views and events are kept, and how they are kept that long.
//
// 396 days is thirteen months: enough to set any month beside the same month
// a year earlier, which is the longest comparison the dashboard is ever likely
// to want, and no more. Analytics older than that answers no question this
// site asks, and keeping it forever was a finding in the design doc (F14).
//
// MongoDB enforces it, not this app: each collection has a TTL index on
// `createdAt`, and the database deletes a document once it is this old (its
// TTL monitor runs about once a minute). There is no job to schedule and no
// process that has to stay up for it to happen.
export const ANALYTICS_RETENTION_DAYS = 396;

export const ANALYTICS_RETENTION_SECONDS =
  ANALYTICS_RETENTION_DAYS * 24 * 60 * 60;

// Both schemas declare the same index, and src/scripts/migrate-analytics-
// retention.ts reconciles it in a database that already holds the old one.
// That script is needed because Mongoose's automatic index build cannot do
// it: `createIndex` refuses a key that already exists with different options
// (page views already had a plain `{ createdAt: -1 }` index), and Mongoose
// reports that refusal as an "index" event, not an error: the server starts,
// writes work, and retention silently isn't happening. reportIndexFailure
// below listens for that event so it shows in the logs instead. Changing the
// number above needs the same script run again, for the same reason.
export const TTL_INDEX = {
  key: { createdAt: -1 },
  options: { expireAfterSeconds: ANALYTICS_RETENTION_SECONDS },
} as const;

// Typed by what it uses rather than as a Mongoose Model, which would need
// each model's own document type to be accepted here.
type IndexedModel = {
  modelName: string;
  on(event: "index", listener: (error?: Error) => void): unknown;
};

export function reportIndexFailure(model: IndexedModel): void {
  model.on("index", (error) => {
    if (!error) return;
    console.error(
      `[analytics] ${model.modelName} indexes not built, so the ` +
        `${ANALYTICS_RETENTION_DAYS}-day retention is not in effect. ` +
        `Run \`npm run migrate:retention\`. (${error.message})`
    );
  });
}
