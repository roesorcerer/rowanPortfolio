import { useEffect } from "react";
import type { Project } from "../types";
import { useAnalytics } from "../analytics";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

function ProjectModal({ project, onClose }: ProjectModalProps) {
  const analytics = useAnalytics();
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
      <div className="relative bg-[#FAF9F7] w-full max-w-[900px] max-h-[90vh] rounded-2xl overflow-hidden border border-[#E8E6E1] shadow-2xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E8E6E1] flex items-center justify-center text-[#2C2C2A] transition-colors"
        >
          <span className="text-lg leading-none">×</span>
        </button>

        <div className="overflow-y-auto">
          {/* Image */}
          <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
            <img
              alt={project.title}
              src={project.image}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            <span className="inline-block px-3 py-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs rounded-md mb-5">
              {project.category}
            </span>

            <h2
              id={`project-modal-title-${project._id}`}
              className="text-[#2C2C2A] text-2xl md:text-3xl font-medium tracking-tight mb-5"
            >
              {project.title}
            </h2>

            {project.description && (
              <p className="text-[#5F5E5A] text-[15px] md:text-base leading-[1.75] mb-7 whitespace-pre-line">
                {project.description}
              </p>
            )}

            {project.technologies && project.technologies.length > 0 && (
              <div className="mb-7">
                <h3 className="text-[#2C2C2A] text-xs uppercase tracking-widest font-medium mb-3">
                  Built with
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#2C2C2A] text-xs rounded-md"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.developmentTime && (
              <div className="mb-7">
                <h3 className="text-[#2C2C2A] text-xs uppercase tracking-widest font-medium mb-2">
                  Development time
                </h3>
                <p className="text-[#5F5E5A] text-sm">{project.developmentTime}</p>
              </div>
            )}

            {(project.link || project.githubLink) && (
              <div className="flex flex-wrap gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.linkClick(project, "demo")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8E6E1] text-[#2C2C2A] text-sm rounded-lg hover:border-[#2C2C2A] transition-colors"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
