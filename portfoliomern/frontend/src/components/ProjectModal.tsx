import { useEffect } from "react";
import type { Project } from "../types";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

function ProjectModal({ project, onClose }: ProjectModalProps) {
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

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Visit project
                <span className="text-xs">→</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
