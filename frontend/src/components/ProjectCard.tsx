import { useState } from "react";
import type { Project } from "../types";
import ProjectModal from "./ProjectModal";

interface ProjectCardProps {
  project: Project;
  index: number;
  breakpoint: "mobile" | "tablet" | "desktop";
}

function ProjectCard({ project, breakpoint }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = breakpoint === "mobile";

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const exploreButton = (
    <button
      type="button"
      onClick={openModal}
      aria-label={`Explore ${project.title}`}
      className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors mt-7"
    >
      Explore project
      <span className="text-xs">→</span>
    </button>
  );

  if (isMobile) {
    return (
      <>
        <article className="bg-white rounded-2xl overflow-hidden border border-[#E8E6E1]">
          {/* Image */}
          <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
            <img
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
              src={project.image}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category tag */}
            <span className="inline-block px-3 py-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs rounded-md mb-4">
              {project.category}
            </span>

            {/* Title */}
            <h3 className="text-[#2C2C2A] text-xl font-medium tracking-tight mb-2">
              {project.title}
            </h3>

            {/* Description */}
            {project.description && (
              <p className="text-[#888780] text-sm leading-relaxed mb-5">
                {project.description}
              </p>
            )}

            {/* Trigger */}
            <button
              type="button"
              onClick={openModal}
              aria-label={`Explore ${project.title}`}
              className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
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

  // Tablet and Desktop: Side-by-side layout
  return (
    <>
      <article className="bg-white rounded-2xl overflow-hidden border border-[#E8E6E1] grid grid-cols-2 max-w-[1200px]">
        {/* Content */}
        <div className="p-8 md:p-9 flex flex-col justify-between">
          <div>
            {/* Category tag */}
            <span className="inline-block px-3 py-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs rounded-md mb-5">
              {project.category}
            </span>

            {/* Title */}
            <h3 className="text-[#2C2C2A] text-2xl font-medium tracking-tight mb-3">
              {project.title}
            </h3>

            {/* Description */}
            {project.description && (
              <p className="text-[#888780] text-[15px] leading-[1.65]">
                {project.description}
              </p>
            )}
          </div>

          {exploreButton}
        </div>

        {/* Image */}
        <div className="bg-[#1a1a1a] relative min-h-[260px] flex items-center justify-center overflow-hidden">
          <img
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            src={project.image}
          />

          {/* Subtle overlay for polish */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 pointer-events-none" />
        </div>
      </article>

      {isOpen && <ProjectModal project={project} onClose={closeModal} />}
    </>
  );
}

export default ProjectCard;
