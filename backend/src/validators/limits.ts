// Field-length limits, shared by Zod request validators and Mongoose schemas
// so a single change keeps both layers in agreement. If a value lives here, no
// other file should re-declare it — Zod and Mongoose both import from here.

export const LIMITS = {
  user: {
    nameMax: 100,
    passwordMin: 8,
    passwordMax: 128,
  },
  project: {
    titleMax: 200,
    devTimeMax: 60,
  },
  contact: {
    nameMax: 100,
    subjectMax: 200,
    messageMin: 10,
    messageMax: 5000,
  },
  event: {
    typeMax: 64,
    projectIdMax: 64,
    projectTitleMax: 256,
    projectTypeMax: 32,
    linkTypeMax: 32,
  },
  tracking: {
    referrerMax: 512,
    userAgentMax: 512,
    pathMax: 512,
  },
} as const;
