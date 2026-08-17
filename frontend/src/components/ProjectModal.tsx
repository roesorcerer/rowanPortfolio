import { useEffect, useMemo, useState } from "react";
import type { Project, ResearchStatus } from "../types";
import { useAnalytics } from "../analytics";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

function ProjectModal({ project, onClose }: ProjectModalProps) {
  const analytics = useAnalytics();
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const researchStatus: ResearchStatus | null =
    project.projectType === "research"
      ? project.researchStatus ??
        (project.rejectedVenue || project.improvedIntoTitle || project.improvedIntoLink || project.improvementSummary
          ? "in-revision"
          : "published")
      : null;

  const mediaItems = useMemo(() => {
    if (project.media && project.media.length > 0) {
      return project.media;
    }

    return [
      {
        type: "image" as const,
        src: project.image,
        alt: project.title,
      },
    ];
  }, [project.image, project.media, project.title]);

  const activeMedia = mediaItems[activeMediaIndex] ?? mediaItems[0];

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

  const showCarouselControls = mediaItems.length > 1;

  const goPrev = () => {
    setActiveMediaIndex((current) => (current - 1 + mediaItems.length) % mediaItems.length);
  };

  const goNext = () => {
    setActiveMediaIndex((current) => (current + 1) % mediaItems.length);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [project._id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`project-modal-title-${project._id}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
      />

      {/* Dialog */}
      <div className="relative bg-paper w-full max-w-[980px] max-h-[92vh] overflow-hidden border border-rule shadow-2xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "absolute top-4 right-4 z-20")}
        >
          <span className="text-lg leading-none">×</span>
        </button>

        <div className="overflow-y-auto">
          {/* Media */}
          <div className="border-b border-rule bg-white">
            <div className="relative h-[280px] sm:h-[360px] md:h-[440px] lg:h-[500px] overflow-hidden flex items-center justify-center p-3 md:p-5">
              {activeMedia.type === "video" ? (
                <video
                  key={activeMedia.src}
                  src={activeMedia.src}
                  poster={activeMedia.poster}
                  controls
                  playsInline
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  key={activeMedia.src}
                  alt={activeMedia.alt ?? project.title}
                  src={activeMedia.src}
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {showCarouselControls && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous media"
                    className="absolute left-3 md:left-4 h-9 w-9 bg-black/60 text-white border border-white/20 hover:bg-black/70 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next media"
                    className="absolute right-3 md:right-4 h-9 w-9 bg-black/60 text-white border border-white/20 hover:bg-black/70 transition-colors"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {showCarouselControls && (
              <div className="px-4 md:px-6 pb-4 md:pb-5">
                <div className="flex flex-wrap gap-2">
                  {mediaItems.map((media, index) => (
                    <button
                      key={`${media.src}-${index}`}
                      type="button"
                      onClick={() => setActiveMediaIndex(index)}
                      className={cn(
                        "px-2.5 py-1 text-xs border transition-colors",
                        index === activeMediaIndex
                          ? "border-accent-dark text-accent-dark bg-accent-soft"
                          : "border-rule text-body bg-paper hover:border-accent"
                      )}
                      aria-label={`Show media ${index + 1}`}
                    >
                      {media.type === "video" ? `Video ${index + 1}` : `Image ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {(project.category ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1.5 bg-accent-soft text-accent-dark text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2
                id={`project-modal-title-${project._id}`}
                className="text-ink text-2xl md:text-3xl font-medium tracking-tight mb-4"
              >
                {project.title}
              </h2>

              {researchStatus && (
                <p className="text-xs uppercase tracking-[0.2em] text-faint mb-4">
                  {researchStatus === "published" ? "Published work" : "Developing manuscript"}
                </p>
              )}

              {project.description && (
                <p className="text-body text-[15px] md:text-base leading-[1.7] mb-6 whitespace-pre-line">
                  {project.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="border border-rule bg-white p-4">
                  <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-2">Dates</h3>
                  <p className="text-body text-sm">{datesLabel()}</p>
                </section>

                <section className="border border-rule bg-white p-4">
                  <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-2">Technologies used</h3>
                  {project.technologies && project.technologies.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <li key={tech} className="px-2.5 py-1 border border-rule-soft text-ink text-xs bg-paper">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body text-sm">Not listed</p>
                  )}
                </section>

                {project.projectType === "research" && (
                  <section className="border border-rule bg-white p-4">
                    <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-2">Publication details</h3>
                    <div className="space-y-1">
                      <p className="text-body text-sm">
                        Status: {researchStatus === "in-revision" ? "Developing manuscript" : "Published"}
                      </p>
                      <p className="text-body text-sm">Venue: {project.researchVenue?.trim() || "Not listed"}</p>
                      <p className="text-body text-sm">
                        Year: {project.researchYear ? String(project.researchYear) : "Not listed"}
                      </p>
                    </div>
                  </section>
                )}

                {project.projectType === "research" && researchStatus === "in-revision" && (
                  <section className="border border-amber-200 bg-amber-50/40 p-4">
                    <h3 className="text-amber-900 text-xs uppercase tracking-widest font-medium mb-2">Revision trail</h3>
                    <div className="space-y-1">
                      <p className="text-body text-sm">
                        Original submission: {project.rejectedVenue?.trim() || "Not listed"}
                      </p>
                      <p className="text-body text-sm">
                        Improved into:{" "}
                        {project.improvedIntoLink ? (
                          <a
                            href={project.improvedIntoLink}
                            target="_blank"
                            rel="noopener noreferrer"
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
                  </section>
                )}

                {project.projectType === "practice" && (
                  <section className="border border-rule bg-white p-4 md:col-span-2">
                    <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-3">Practice purpose</h3>
                    <p className="text-body text-sm leading-relaxed">
                      {project.practicePurpose?.trim() || project.description || "Not listed"}
                    </p>
                  </section>
                )}

                <section className="border border-rule bg-white p-4">
                  <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-3">Worked on by</h3>
                  {project.collaborators && project.collaborators.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {project.collaborators.map((collaborator) => (
                        <li key={`${collaborator.name}-${collaborator.socialLink}`}>
                          <a
                            href={collaborator.socialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 border border-rule-soft text-ink text-xs hover:border-accent transition-colors"
                          >
                            <span>{collaborator.name}</span>
                            {collaborator.role && <span className="text-muted">({collaborator.role})</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body text-sm">Not listed</p>
                  )}
                </section>

                <section className="border border-rule bg-white p-4">
                  <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-3">Project links</h3>
                  {(project.link || project.githubLink || project.relatedResearchLink) ? (
                    <div className="flex flex-wrap gap-2.5">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => analytics.linkClick(project, "demo")}
                          className={buttonVariants({ size: "sm" })}
                        >
                          Live demo
                          <span className="text-xs">→</span>
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => analytics.linkClick(project, "github")}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.84 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                          </svg>
                          View source
                        </a>
                      )}
                      {project.relatedResearchLink && (
                        <a
                          href={project.relatedResearchLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Related research
                          <span className="text-xs">→</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-body text-sm">No external links yet</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
