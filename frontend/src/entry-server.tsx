import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import {
  QueryClientProvider,
  dehydrate,
  type DehydratedState,
} from "@tanstack/react-query";
import { Site } from "./App";
import { createQueryClient } from "./queryClient";
import { PROJECTS_KEY, projectDetailKey } from "./hooks/useProjects";
import type { Project, ProjectSummary } from "./types";

// The prerender step's half of the app: renders one URL to HTML with its data
// already in the query cache, and hands back that cache so the browser can
// hydrate against exactly what was rendered. Built by `vite build --ssr` and
// driven by scripts/prerender.mjs; nothing in the browser bundle imports it.

export interface RenderInput {
  url: string;
  /** The published list, as GET /api/projects returns it. */
  projects: ProjectSummary[];
  /** The full record for a permalink, as GET /api/projects/:slug returns it. */
  project?: Project;
}

export interface RenderOutput {
  html: string;
  state: DehydratedState;
}

export async function render(input: RenderInput): Promise<RenderOutput> {
  const queryClient = createQueryClient();
  queryClient.setQueryData(PROJECTS_KEY, input.projects);
  if (input.project) {
    // Keyed by the URL segment, which is what useProject reads from the
    // route: the slug, or the id for a project without one (projectPath).
    const segment = input.project.slug || input.project._id;
    queryClient.setQueryData(projectDetailKey(segment), input.project);
  }

  const tree = (
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={input.url}>
        <Site />
      </StaticRouter>
    </QueryClientProvider>
  );

  // renderToString can't wait for lazy routes (the resume is one) and would
  // write their loading fallback. onAllReady waits for every Suspense
  // boundary, so the page is complete. The browser then hydrates it while
  // its own copy of the lazy chunk loads, keeping the server HTML on screen.
  const html = await new Promise<string>((resolve, reject) => {
    let failed: unknown = null;
    const { pipe } = renderToPipeableStream(tree, {
      onAllReady() {
        if (failed) return reject(failed);
        const sink = new PassThrough();
        const chunks: Buffer[] = [];
        sink.on("data", (chunk: Buffer) => chunks.push(chunk));
        sink.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        sink.on("error", reject);
        pipe(sink);
      },
      onShellError: reject,
      // A component throwing during render would otherwise be swallowed and
      // its Suspense fallback written into the page. Fail the build instead:
      // the previous deploy stays live.
      onError(error) {
        failed = error;
      },
    });
  });

  return { html, state: dehydrate(queryClient) };
}

// The script needs the page metadata too, and takes it from this bundle so
// it runs the same code the pages use for their titles.
export {
  HOME_META,
  RESUME_META,
  NOT_FOUND_META,
  projectMeta,
  headTags,
} from "./seo";
export { projectPath } from "./lib/projectLinks";
export { SITE_ORIGIN } from "./lib/site";
