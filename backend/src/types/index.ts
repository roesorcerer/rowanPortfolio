// Backend's view of the shared API contracts. Anything new should be
// declared in /shared/contracts.d.ts and re-exported here so existing
// imports like `import { ApiResponse } from "../types"` keep working.
//
// IProject (Mongoose Document with Date timestamps) lives in
// models/project.model.ts — that's the backend's internal representation,
// not the wire-format type.

export type { ApiResponse } from "../../../shared/contracts";

export interface AuthUser {
  userId: string;
  role: string;
}

// Augment Express's Request type so TypeScript knows about req.user.
// This is the standard pattern for extending third-party types.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
