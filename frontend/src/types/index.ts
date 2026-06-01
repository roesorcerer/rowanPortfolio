// Frontend's view of the shared API contracts. Anything new should be
// declared in /shared/contracts.d.ts and re-exported here so existing
// imports like `import { Project } from "../types"` keep working.

export type {
  ApiResponse,
  Project,
  ProjectType,
} from "../../../shared/contracts";
