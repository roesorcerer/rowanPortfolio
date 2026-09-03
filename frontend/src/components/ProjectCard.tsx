import { Link, useNavigate } from "react-router-dom";
import type { Project } from "../types";
import { datesLabel, researchStatusOf } from "./project/projectFacts";
import { CARD_COPY, leadTextFor } from "./project/cardCopy";
import { linkLabel, linkOfKind, projectPath } from "../lib/projectLinks";
import { DETAIL_KEYS, detailValue } from "../lib/projectDetails";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A project's row in a list — the overview a visitor scans to decide whether
 * to read the whole thing.
 *
 * Clicking through goes straight to the project's page. There is no
 * intermediate modal: the card already carries what you need to decide, and a
 * second summary in a dialog only stood between the visitor and the write-up.
 *
 * Two layouts, not five. Research reads as a citation because a paper has no
 * cover image and does have authors and a venue. Everything else is the same
 * media card, and the per-type wording lives in `cardCopy.ts`.
 */
interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const copy = CARD_COPY[project.projectType];

  // Clicking anywhere on the card follows the title link. Inner links stop the
  // event so "Code" doesn't quietly become "open the project page".
  const openProject = () => navigate(projectPath(project));
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  const onCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProject();
    }
  };

  const titleLink = (
    <Link
      to={projectPath(project)}
      onClick={stop}
      className="hover:text-accent-dark transition-colors"
    >
      {project.title}
    </Link>
  );

  const exploreLink = (
    <Link
      to={projectPath(project)}
      onClick={stop}
      className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
    >
      Explore project
      <span className="text-xs">→</span>
    </Link>
  );

  const githubLink = linkOfKind(project, "github");
  const demoLink = linkOfKind(project, "demo");

  const outboundLinks = (
    <>
      {githubLink && (
        <a
          href={githubLink.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
          aria-label={`View ${project.title} source on GitHub`}
          className="inline-flex items-center gap-1.5 text-ink text-xs hover:text-accent-dark transition-colors"
        >
          Code
        </a>
      )}
      {demoLink && (
        <a
          href={demoLink.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
          aria-label={`Open ${project.title} ${linkLabel(demoLink, copy.demoLabel).toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
        >
          {linkLabel(demoLink, copy.demoLabel)}
        </a>
      )}
    </>
  );

  // --- Citation layout: a paper, not a product ---
  if (copy.layout === "citation") {
    const status = researchStatusOf(project) ?? "published";
    const year = citationYear(project);
    const venue =
      detailValue(project, DETAIL_KEYS.venue) || (project.category ?? []).join(" · ");
    const manuscriptLink = demoLink ?? linkOfKind(project, "research");

    return (
      <article
        className="bg-white border border-rule p-5 md:p-6 cursor-pointer hover:border-accent transition-colors"
        onClick={openProject}
        onKeyDown={onCardKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Explore ${project.title}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={cn(
              "inline-flex items-center border px-2.5 py-1 text-[11px] uppercase tracking-wide",
              status === "published"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            )}
          >
            {status === "published" ? "Published" : "Developing manuscript"}
          </span>
          {year && <span className="text-faint text-xs">{year}</span>}
        </div>

        <div className="border-l-2 border-rule pl-4 md:pl-5">
          <p className="text-faint text-xs md:text-sm leading-relaxed">
            {citationAuthors(project)}
            {year ? ` (${year}).` : "."}
          </p>
          <h3 className="text-ink text-base md:text-lg font-medium tracking-tight leading-snug mt-1">
            {titleLink}
          </h3>

          <p className="text-body text-sm mt-1 italic">{venue}</p>

          {project.description && (
            <p className="text-muted text-sm leading-relaxed mt-3">{project.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {exploreLink}
            {/* For a paper the manuscript is the point, so a research link
                reads with the type's own demo copy ("Read manuscript") unless
                it carries a label of its own. */}
            {manuscriptLink && (
              <a
                href={manuscriptLink.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stop}
                className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
              >
                {manuscriptLink.label?.trim() || copy.demoLabel}
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  // --- Media layout: everything with a cover image ---
  return (
    <article className="bg-white overflow-hidden border border-rule w-full max-w-[860px] mx-auto">
      <div
        className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-3 md:gap-5 p-4 md:p-5 cursor-pointer hover:border-accent transition-colors"
        onClick={openProject}
        onKeyDown={onCardKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Explore ${project.title}`}
      >
        <div className="border border-rule-soft overflow-hidden flex items-center justify-center">
          <img
            alt={project.title}
            src={project.image}
            className="h-[170px] md:h-[220px] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="min-h-0 flex flex-col gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {copy.badge && (
              <span
                className={cn(
                  "inline-flex w-fit px-2.5 py-1 rounded-md text-[11px] md:text-xs uppercase tracking-[0.12em]",
                  copy.badgeClass
                )}
              >
                {copy.badge}
              </span>
            )}
            {(project.category ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex w-fit px-2.5 py-1 rounded-md bg-accent-soft text-accent-dark text-[11px] md:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-xl md:text-2xl font-light tracking-tight text-ink text-pretty leading-tight">
            {titleLink}
          </h3>

          <CardSection label={copy.leadLabel}>
            <p className="text-sm md:text-base font-light tracking-tight text-muted leading-relaxed line-clamp-4">
              {leadTextFor(project)}
            </p>
          </CardSection>

          <CardSection label={copy.datesLabel}>
            <p className="text-xs md:text-sm text-body">{datesLabel(project)}</p>
          </CardSection>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {exploreLink}
            {outboundLinks}
          </div>
        </div>
      </div>
    </article>
  );
}

/** A labelled block, or a bare paragraph when the label is omitted. */
function CardSection({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  if (!label) return <>{children}</>;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

function citationYear(project: Project): string | number | null {
  const year = detailValue(project, DETAIL_KEYS.year);
  if (year) return year;

  const parsed = new Date(project.updatedAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getFullYear();
}

function citationAuthors(project: Project): string {
  const names = (project.collaborators ?? []).map((c) => c.name.trim()).filter(Boolean);
  return names.length === 0 ? "Rowan Stratton" : names.join(", ");
}

export default ProjectCard;
