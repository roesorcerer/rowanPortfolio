import type { Project } from "../../types";
import { useAnalytics } from "../../analytics";
import { CARD_COPY } from "./cardCopy";
import { linkLabel, usableLinks } from "../../lib/projectLinks";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The row of outbound project links, with the analytics verbs attached.
 *
 * Just the row — no heading, no border. The modal boxes it as one more card in
 * the facts grid; the page runs it along a footer. Sharing the row keeps the
 * `link_click` verbs firing identically from both.
 *
 * This used to be three hardcoded blocks for three columns. Now it walks
 * `project.links`, so a project can carry an itch.io build or a Figma file
 * without this file changing — and every link fires an event, where the
 * related-research one used to be silently untracked.
 */
interface ProjectLinksProps {
  project: Project;
  className?: string;
  /** Rendered alongside the links — the page uses it for "Copy link". */
  children?: React.ReactNode;
}

function ProjectLinks({ project, className, children }: ProjectLinksProps) {
  const analytics = useAnalytics();
  const links = usableLinks(project);
  const { demoLabel } = CARD_COPY[project.projectType];

  if (links.length === 0 && !children) {
    return <p className="text-body text-sm">No external links yet</p>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {links.map((link, index) => {
        // The demo is the primary action; everything else is an outline, so a
        // long row still has exactly one thing pulling the eye.
        const isPrimary = link.kind === "demo";

        return (
          <a
            key={`${link.kind}-${link.url}-${index}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.linkClick(project, link.kind)}
            className={buttonVariants({
              variant: isPrimary ? "default" : "outline",
              size: "sm",
            })}
          >
            {link.kind === "github" && <GitHubMark />}
            {linkLabel(link, demoLabel)}
            {link.kind !== "github" && <span className="text-xs">→</span>}
          </a>
        );
      })}

      {children}
    </div>
  );
}

function GitHubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.84 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export default ProjectLinks;
