import { useState } from "react";
import type { Project, ProjectType } from "../types";
import ProjectModal from "./ProjectModal";
import { useAnalytics } from "../analytics";

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: ProjectType;
}

function ProjectCard({ project, variant = "featured" }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();

  const openModal = () => {
    setIsOpen(true);
    analytics.projectView(project);
  };
  const closeModal = () => setIsOpen(false);

  // --- Research variant: compact horizontal row, no large image ---
  if (variant === "research") {
    return (
      <>
        <article
          className="bg-white rounded-xl border border-[#E8E6E1] p-5 flex gap-4 items-start cursor-pointer hover:border-[#1D9E75] transition-colors"
          onClick={openModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openModal()}
          aria-label={`Explore ${project.title}`}
        >
          {/* Small thumbnail */}
          <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-[#1a1a1a] overflow-hidden">
            <img
              alt={project.title}
              className="w-full h-full object-cover"
              src={project.image}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-1 bg-[#E1F5EE] text-[#0F6E56] text-xs rounded mb-2">
              {project.category}
            </span>
            <h3 className="text-[#2C2C2A] text-sm font-medium tracking-tight leading-snug mb-1">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-[#888780] text-xs leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <span className="text-[#0F6E56] text-xs flex-shrink-0 mt-1">→</span>
        </article>
        {isOpen && <ProjectModal project={project} onClose={closeModal} />}
      </>
    );
  }

  // --- Practice variant: compact grid card ---
  if (variant === "practice") {
    return (
      <>
        <article
          className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden cursor-pointer hover:border-[#1D9E75] transition-colors"
          onClick={openModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openModal()}
          aria-label={`Explore ${project.title}`}
        >
          <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
            <img
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
              src={project.image}
            />
          </div>
          <div className="p-4">
            <span className="inline-block px-2 py-1 bg-[#E1F5EE] text-[#0F6E56] text-xs rounded mb-2">
              {project.category}
            </span>
            <h3 className="text-[#2C2C2A] text-sm font-medium tracking-tight leading-snug mb-2">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="text-[#B4B2A9] text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </article>
        {isOpen && <ProjectModal project={project} onClose={closeModal} />}
      </>
    );
  }

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  const metaRow = () => {
    const hasMeta = project.developmentTime || project.githubLink || project.link;
    if (!hasMeta) return null;
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 md:mt-5">
        {project.developmentTime && (
          <span className="inline-flex items-center gap-1.5 text-[#5F5E5A] text-xs">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Built in {project.developmentTime}
          </span>
        )}
        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            className="inline-flex items-center gap-1.5 text-[#2C2C2A] text-xs hover:text-[#0F6E56] transition-colors"
            aria-label={`View ${project.title} source on GitHub`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.84 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            Code
          </a>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            className="inline-flex items-center gap-1.5 text-[#0F6E56] text-xs hover:text-[#085041] transition-colors"
            aria-label={`Open ${project.title} live demo`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Live demo
          </a>
        )}
      </div>
    );
  };

  // Featured: stacked on mobile (image on top), 2-col grid on md+ (image right, content left).
  return (
    <>
      <article className="bg-white rounded-2xl overflow-hidden border border-[#E8E6E1] md:grid md:grid-cols-2 md:max-w-[1200px]">
        {/* Image — first in DOM so mobile reads it on top; placed in the right column on md+. */}
        <div className="aspect-video md:aspect-auto md:min-h-[260px] md:col-start-2 bg-[#1a1a1a] relative overflow-hidden">
          <img
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            src={project.image}
          />
          {/* Subtle overlay for polish — only on md+. */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-transparent to-black/10 pointer-events-none" />
        </div>

        {/* Content — placed in the left column on md+, same row as the image. */}
        <div className="p-5 md:p-8 lg:p-9 md:col-start-1 md:row-start-1 md:flex md:flex-col md:justify-between">
          <div>
            <span className="inline-block px-3 py-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs rounded-md mb-4 md:mb-5">
              {project.category}
            </span>

            <h3 className="text-[#2C2C2A] text-xl md:text-2xl font-medium tracking-tight mb-2 md:mb-3">
              {project.title}
            </h3>

            {project.description && (
              <p className="text-[#888780] text-sm md:text-[15px] leading-relaxed md:leading-[1.65] mb-2 md:mb-0">
                {project.description}
              </p>
            )}

            {metaRow()}
          </div>

          <button
            type="button"
            onClick={openModal}
            aria-label={`Explore ${project.title}`}
            className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors mt-5 md:mt-7"
          >
            Explore project
            <span className="text-xs">→</span>
          </button>
        </div>
      </article>

      {isOpen && <ProjectModal project={project} onClose={closeModal} />}
    </>
  );
}

export default ProjectCard;
