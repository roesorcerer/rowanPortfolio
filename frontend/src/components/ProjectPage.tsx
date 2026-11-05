import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useProject } from "../hooks/useProjects";
import { useAnalytics } from "../analytics";
import type { Project } from "../types";
import CaseStudy from "./CaseStudy";
import ProjectMediaCarousel from "./project/ProjectMediaCarousel";
import ProjectFacts from "./project/ProjectFacts";
import ProjectLinks from "./project/ProjectLinks";
import { ProjectTags, ResearchStatusLine } from "./project/ProjectHeading";
import { hasCaseStudy } from "../lib/projectLinks";

/**
 * The `/projects/:slug` permalink — the page a resume link lands on, and the
 * only place the full case study is rendered.
 *
 * Someone arriving from a PDF has no card they clicked and no tab to go back
 * to, so this is a document rather than a dialog: it prints, it scrolls
 * normally, and it stands on its own.
 */
function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProject(slug);

  return (
    <div className="doc">
      {isLoading && <p className="doc-status">Loading project...</p>}

      {!isLoading && (error || !project) && <NotFound slug={slug} />}

      {!isLoading && project && <ProjectDocument project={project} />}
    </div>
  );
}

function NotFound({ slug }: { slug?: string }) {
  return (
    <div className="px-5 md:px-10 py-24 max-w-[720px] mx-auto">
      <h1 className="text-ink text-2xl md:text-3xl font-medium tracking-tight mb-4">
        No project at this link
      </h1>
      <p className="text-body text-[15px] leading-[1.7] mb-2">
        Nothing is published at{" "}
        <span className="text-ink">/projects/{slug ?? ""}</span>. The link may be
        mistyped, or the project may have been renamed.
      </p>
      <p className="text-muted text-sm mb-8">
        Every project on the site is listed on the home page.
      </p>
      <Link to="/#work" className="cmd primary inline-flex">
        Browse all projects
      </Link>
    </div>
  );
}

function ProjectDocument({ project }: { project: Project }) {
  const analytics = useAnalytics();
  const [copied, setCopied] = useState(false);

  const caseStudy = hasCaseStudy(project.caseStudy) ? project.caseStudy : null;

  // Every card leads here, and so does every resume link, so this is the one
  // place a project view is counted.
  useEffect(() => {
    analytics.projectView(project);
  }, [analytics, project]);

  // The tab title is what gets bookmarked and what shows in a shared link's
  // preview, so it carries the project name rather than the site's.
  useEffect(() => {
    document.title = `${project.title} | Rowan Stratton`;
  }, [project.title]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the URL bar still has the link.
    }
  };

  return (
    <article className="px-5 md:px-10 py-8 md:py-12 max-w-[900px] mx-auto">
      <Link
        to="/#work"
        className="doc-back inline-flex items-center gap-2 text-muted text-sm hover:text-ink transition-colors mb-8 print:hidden"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      {project.status === "draft" && (
        <p className="border border-amber-200 bg-amber-50/60 text-amber-900 text-sm px-4 py-3 mb-6">
          Draft — visible to you because you're signed in. This link 404s for
          everyone else until the project is published.
        </p>
      )}

      <header className="mb-8">
        <ProjectTags project={project} />

        <h1 className="text-ink text-3xl md:text-4xl font-light tracking-tight mb-3">
          {project.title}
        </h1>

        <ResearchStatusLine project={project} />

        {project.description && (
          <p className="text-body text-base md:text-lg leading-[1.75] whitespace-pre-line max-w-[70ch]">
            {project.description}
          </p>
        )}
      </header>

      <ProjectMediaCarousel
        project={project}
        frameClassName="h-[260px] sm:h-[380px] md:h-[460px]"
        className="border border-rule mb-8"
      />

      <ProjectFacts project={project} />

      {caseStudy ? (
        <section className="border-t border-rule mt-10 pt-10">
          <h2 className="text-ink text-sm uppercase tracking-widest font-medium mb-8">
            How it was made
          </h2>
          <CaseStudy caseStudy={caseStudy} density="page" />
        </section>
      ) : (
        <p className="border border-rule bg-surface text-muted text-sm p-4 mt-10">
          The write-up for this project is still being drafted.
        </p>
      )}

      <footer className="border-t border-rule mt-12 pt-8">
        <ProjectLinks project={project}>
          <button
            type="button"
            onClick={copyLink}
            className="cmd"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </ProjectLinks>
      </footer>
    </article>
  );
}

export default ProjectPage;
