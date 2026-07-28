import { useState } from "react";
import type { Project, ProjectType } from "../types";
import ProjectModal from "./ProjectModal";
import { useAnalytics } from "../analytics";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: ProjectType;
}

function ProjectCard({ project, variant = "featured" }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  const getResearchStatus = (): "published" | "rejected" => {
    if (project.researchStatus) return project.researchStatus;
    if (
      project.rejectedVenue ||
      project.improvedIntoTitle ||
      project.improvedIntoLink ||
      project.improvementSummary
    ) {
      return "rejected";
    }
    return "published";
  };

  const citationYear = () => {
    if (project.researchYear) return project.researchYear;
    const parsed = new Date(project.updatedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
    return null;
  };

  const citationAuthors = () => {
    const collaboratorNames = (project.collaborators ?? [])
      .map((c) => c.name.trim())
      .filter(Boolean);

    if (collaboratorNames.length === 0) return "Rowan Stratton";
    return collaboratorNames.join(", ");
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const datesLabel = () => {
    if (project.developmentTime?.trim()) return project.developmentTime;

    const created = formatDate(project.createdAt);
    const updated = formatDate(project.updatedAt);

    if (created && updated && created !== updated) {
      return `${created} - ${updated}`;
    }

    return updated ?? created ?? "Not specified";
  };

  const openModal = () => {
    setIsOpen(true);
    analytics.projectView(project);
  };
  const closeModal = () => setIsOpen(false);

  // --- Research variant: compact horizontal row, no large image ---
  if (variant === "research") {
    const status = getResearchStatus();
    const year = citationYear();
    const venue = project.researchVenue?.trim() || project.category;
    const statusClass =
      status === "published"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-800 border-amber-200";

    return (
      <>
        <article
          className="bg-white border border-rule p-5 md:p-6 cursor-pointer hover:border-accent transition-colors"
          onClick={openModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openModal()}
          aria-label={`Explore ${project.title}`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className={cn("inline-flex items-center border px-2.5 py-1 text-[11px] uppercase tracking-wide", statusClass)}>
              {status === "published" ? "Published" : "Developing manuscript"}
            </span>
            {year && <span className="text-faint text-xs">{year}</span>}
          </div>

          <div className="border-l-2 border-rule pl-4 md:pl-5">
            <p className="text-faint text-xs md:text-sm leading-relaxed">
              {citationAuthors()}
              {year ? ` (${year}).` : "."}
            </p>
            <h3 className="text-ink text-base md:text-lg font-medium tracking-tight leading-snug mt-1">
              {project.title}
            </h3>

            <p className="text-body text-sm mt-1 italic">{venue}</p>

            {project.description && <p className="text-muted text-sm leading-relaxed mt-3">{project.description}</p>}

            {status === "rejected" && (
              <div className="mt-4 border border-amber-200 bg-amber-50/40 p-3 space-y-1.5">
                <p className="text-amber-900 text-xs uppercase tracking-wider">Revision trail</p>
                <p className="text-body text-sm">
                  Original submission: {project.rejectedVenue?.trim() || "Venue not listed"}
                </p>
                <p className="text-body text-sm">
                  Improved into:{" "}
                  {project.improvedIntoLink ? (
                    <a
                      href={project.improvedIntoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={stop}
                      className="text-accent-dark hover:text-accent-darker"
                    >
                      {project.improvedIntoTitle?.trim() || "Revised manuscript"}
                    </a>
                  ) : (
                    <span>{project.improvedIntoTitle?.trim() || "Not listed"}</span>
                  )}
                </p>
                {project.improvementSummary?.trim() && (
                  <p className="text-muted text-sm">{project.improvementSummary}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                type="button"
                onClick={openModal}
                aria-label={`Explore ${project.title}`}
                className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
              >
                Open details
                <span className="text-xs">→</span>
              </button>

              {project.relatedResearchLink && (
                <a
                  href={project.relatedResearchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stop}
                  className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
                >
                  Read manuscript
                </a>
              )}
            </div>
          </div>
        </article>
        {isOpen && <ProjectModal project={project} onClose={closeModal} />}
      </>
    );
  }

  // --- Practice variant: compact grid card ---
  if (variant === "practice") {
    const purpose = project.practicePurpose?.trim() || project.description;

    return (
      <>
        <article
          className="bg-white overflow-hidden border border-rule w-full max-w-[860px] mx-auto"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-3 md:gap-5 p-4 md:p-5 cursor-pointer hover:border-accent transition-colors"
            onClick={openModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal()}
            aria-label={`Explore ${project.title}`}
          >
            <div className="border border-rule-soft overflow-hidden p-0 flex items-center justify-center bg-ink-deep">
              <img
                alt={project.title}
                className="h-[170px] md:h-[220px] w-full object-cover"
                src={project.image}
              />
            </div>

            <div className="min-h-0 flex flex-col gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-[#F5F0E1] text-[#8A6A00] text-[11px] md:text-xs uppercase tracking-[0.12em]">
                  Practice
                </span>
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-accent-soft text-accent-dark text-[11px] md:text-xs">
                  {project.category}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-light tracking-tight text-ink text-left text-pretty leading-tight">
                {project.title}
              </h3>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Practice purpose</p>
                <p className="text-sm md:text-base font-light tracking-tight text-muted leading-relaxed line-clamp-3">
                  {purpose}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Technologies</p>
                <p className="text-xs md:text-sm text-body leading-relaxed">
                  {project.technologies.length > 0 ? project.technologies.join(" • ") : "Not listed"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={openModal}
                  aria-label={`Explore ${project.title}`}
                  className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
                >
                  Open details
                  <span className="text-xs">→</span>
                </button>

                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 text-ink text-xs hover:text-accent-dark transition-colors"
                    aria-label={`View ${project.title} source on GitHub`}
                  >
                    Code
                  </a>
                )}

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
                    aria-label={`Open ${project.title} live demo`}
                  >
                    Live demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
        {isOpen && <ProjectModal project={project} onClose={closeModal} />}
      </>
    );
  }

  if (variant === "gameDev") {
    const gameplayFocus = project.practicePurpose?.trim() || project.description;

    return (
      <>
        <article className="bg-white overflow-hidden border border-rule w-full max-w-[860px] mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 md:gap-5 p-4 md:p-5 cursor-pointer hover:border-accent transition-colors"
            onClick={openModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal()}
            aria-label={`Explore ${project.title}`}
          >
            <div className="border border-rule-soft overflow-hidden bg-ink-deep">
              <img
                alt={project.title}
                className="h-[170px] md:h-[220px] w-full object-cover"
                src={project.image}
              />
            </div>

            <div className="min-h-0 flex flex-col gap-3 md:gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-[#EAF7F4] text-[#0E6E58] text-[11px] md:text-xs uppercase tracking-[0.12em]">
                  Game Development
                </span>
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-accent-soft text-accent-dark text-[11px] md:text-xs">
                  {project.category}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-light tracking-tight text-ink text-pretty leading-tight">
                {project.title}
              </h3>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">What this build explores</p>
                <p className="text-sm md:text-base font-light tracking-tight text-muted leading-relaxed line-clamp-3">
                  {gameplayFocus}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Stack and tools</p>
                <p className="text-xs md:text-sm text-body leading-relaxed">
                  {project.technologies.length > 0 ? project.technologies.join(" • ") : "Not listed"}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Timeline</p>
                <p className="text-xs md:text-sm text-body">{datesLabel()}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={openModal}
                  aria-label={`Explore ${project.title}`}
                  className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
                >
                  Open details
                  <span className="text-xs">→</span>
                </button>

                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 text-ink text-xs hover:text-accent-dark transition-colors"
                    aria-label={`View ${project.title} source on GitHub`}
                  >
                    Code
                  </a>
                )}

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
                    aria-label={`Open ${project.title} playable build`}
                  >
                    Play build
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
        {isOpen && <ProjectModal project={project} onClose={closeModal} />}
      </>
    );
  }

  if (variant === "art") {
    return (
      <>
        <article className="bg-white overflow-hidden border border-rule w-full max-w-[860px] mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 md:gap-5 p-4 md:p-5 cursor-pointer hover:border-accent transition-colors"
            onClick={openModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal()}
            aria-label={`Explore ${project.title}`}
          >
            <div className="border border-rule-soft overflow-hidden bg-paper">
              <img
                alt={project.title}
                className="h-[170px] md:h-[220px] w-full object-cover"
                src={project.image}
              />
            </div>

            <div className="min-h-0 flex flex-col gap-3 md:gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-[#FFF1E9] text-[#A84B12] text-[11px] md:text-xs uppercase tracking-[0.12em]">
                  Art
                </span>
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-rule-soft text-body text-[11px] md:text-xs">
                  {project.category}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-light tracking-tight text-ink text-pretty leading-tight">
                {project.title}
              </h3>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">About this piece</p>
                <p className="text-sm md:text-base font-light tracking-tight text-muted leading-relaxed line-clamp-4">
                  {project.description}
                </p>
              </div>

              <div className="space-y-1.5 border border-rule-soft bg-paper/60 p-3">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Medium and process</p>
                <p className="text-xs md:text-sm text-body leading-relaxed">
                  {project.technologies.length > 0 ? project.technologies.join(" • ") : "Not listed"}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Date</p>
                <p className="text-xs md:text-sm text-body">{datesLabel()}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={openModal}
                  aria-label={`Explore ${project.title}`}
                  className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
                >
                  Open details
                  <span className="text-xs">→</span>
                </button>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
                    aria-label={`Open ${project.title}`}
                  >
                    View full piece
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
        {isOpen && <ProjectModal project={project} onClose={closeModal} />}
      </>
    );
  }

  // Featured: square card with compact project overview.
  return (
    <>
      <article className="bg-white overflow-hidden border border-rule w-full max-w-[860px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-3 md:gap-5 p-4 md:p-5">
          <div className="border border-rule-soft overflow-hidden p-0 flex items-center justify-center">
            <img
              alt={project.title}
              className="h-[170px] md:h-[220px] w-full object-contain"
              src={project.image}
            />
          </div>

          <div className="min-h-0 flex flex-col gap-3 md:gap-4">
            <h3 className="text-xl md:text-2xl font-light tracking-tight text-ink text-left text-pretty leading-tight">
              {project.title}
            </h3>

            <p className="text-sm md:text-base font-light tracking-tight text-muted leading-relaxed line-clamp-4">
              {project.description}
            </p>

            <div className="space-y-1.5">
              <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Technologies</p>
              <p className="text-xs md:text-sm text-body leading-relaxed">
                {project.technologies.join(" • ")}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Tags</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-accent-soft text-accent-dark text-[11px] md:text-xs">
                  {project.category}
                </span>
                <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-rule-soft text-body text-[11px] md:text-xs uppercase">
                  {project.projectType}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-faint">Dates</p>
              <p className="text-xs md:text-sm text-body">{datesLabel()}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={openModal}
                aria-label={`Explore ${project.title}`}
                className={cn(buttonVariants({ variant: "link", size: "sm" }))}
              >
                Explore project
                <span className="text-xs">→</span>
              </button>

              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stop}
                  className="inline-flex items-center gap-1.5 text-ink text-xs hover:text-accent-dark transition-colors"
                  aria-label={`View ${project.title} source on GitHub`}
                >
                  Code
                </a>
              )}

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stop}
                  className="inline-flex items-center gap-1.5 text-accent-dark text-xs hover:text-accent-darker transition-colors"
                  aria-label={`Open ${project.title} live demo`}
                >
                  Live demo
                </a>
              )}
            </div>
          </div>
        </div>
      </article>

      {isOpen && <ProjectModal project={project} onClose={closeModal} />}
    </>
  );
}

export default ProjectCard;
