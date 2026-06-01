import { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import type { ProjectType } from "../types";

// --- Hero Section ---
// Eudaimonic design: warm, purposeful, human-centered

function Hero() {
  return (
    <header className="px-5 md:px-10 pt-12 md:pt-16 pb-16 md:pb-20 max-w-[600px] md:max-w-[700px] lg:max-w-[720px]">
      <div className="flex items-center gap-2 mb-6 md:mb-8">
        <div className="w-2 h-2 bg-accent rounded-full" />
        <span className="text-accent-dark text-sm">Open to fullstack roles</span>
      </div>

      <h1 className="text-ink text-2xl md:text-[32px] lg:text-4xl font-normal leading-[1.4] md:leading-[1.35] tracking-tight mb-5 md:mb-6 lg:mb-7">
        Fullstack developer building thoughtful software in React, TypeScript, and Django.
      </h1>

      <p className="text-muted text-base md:text-[17px] leading-[1.75] mb-8 md:mb-10 md:max-w-[560px]">
        Just finished my MS at UMN Duluth, where I led development on an active research platform. Looking for fullstack engineering roles where craft and care both matter.
      </p>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <a
          href="#projects"
          className="inline-flex items-center justify-center px-6 py-3 bg-ink text-paper text-sm rounded-lg hover:bg-ink-deep transition-colors"
        >
          See my work
        </a>
        <a
          href="#about"
          className="inline-flex items-center gap-2 text-accent-dark text-sm hover:text-accent-darker transition-colors"
        >
          About me
          <span className="text-xs">→</span>
        </a>
      </div>
    </header>
  );
}

// --- Projects Section Header + Tab Filter ---
const TAB_LABELS: { type: ProjectType; label: string; description: string }[] = [
  { type: "featured", label: "Featured", description: "Selected work" },
  { type: "research", label: "Research", description: "Papers & studies" },
  { type: "practice", label: "Practice", description: "Experiments & builds" },
];

function ProjectsFilter({
  activeTab,
  counts,
  onChange,
}: {
  activeTab: ProjectType;
  counts: Record<ProjectType, number>;
  onChange: (t: ProjectType) => void;
}) {
  return (
    <div className="px-5 md:px-10 mb-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-ink text-sm font-medium tracking-widest uppercase">
          Selected work
        </h2>
        <span className="text-faint text-sm">
          {counts[activeTab]} {counts[activeTab] === 1 ? "project" : "projects"}
        </span>
      </div>
      <div className="flex gap-2">
        {TAB_LABELS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeTab === type
                ? "bg-ink text-paper"
                : "bg-white text-muted border border-rule hover:border-ink hover:text-ink"
            }`}
          >
            {label}
            {counts[type] > 0 && (
              <span className={`ml-1.5 text-xs ${activeTab === type ? "text-faint" : "text-faint"}`}>
                {counts[type]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Closing CTA ---
// Mobile uses a shorter blurb; the tail clause appears from md: up.
function Closing() {
  return (
    <footer className="px-5 md:px-10 py-16 md:py-20 border-t border-rule md:w-full">
      <p className="text-ink text-xl md:text-2xl lg:text-3xl leading-[1.4] md:leading-[1.35] tracking-tight mb-8 md:mb-10 max-w-[340px] md:max-w-[680px]">
        Currently looking for fullstack engineering roles<span className="hidden md:inline"> where craft and care both matter</span>.
      </p>
      <a
        href="#contact"
        className="inline-flex items-center gap-2 text-accent-dark text-sm md:text-base hover:text-accent-darker transition-colors"
      >
        Get in touch
        <span className="text-xs md:text-sm">→</span>
      </a>
    </footer>
  );
}

// --- Site Footer ---
function SiteFooter() {
  return (
    <div className="px-5 md:px-10 py-6 md:py-8 md:w-full flex justify-between items-center border-t border-rule">
      <p className="text-faint text-sm">Crafted with intention</p>
      <div className="flex gap-5 md:gap-6">
        <a href="https://github.com/roesorcerer" target="_blank" rel="noopener noreferrer" className="text-muted text-sm hover:text-ink transition-colors">
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/rowan-stratton-611247247" target="_blank" rel="noopener noreferrer" className="text-muted text-sm hover:text-ink transition-colors">
          LinkedIn
        </a>
        <a href="#contact" className="text-muted text-sm hover:text-ink transition-colors">
          Say hello
        </a>
      </div>
    </div>
  );
}

// --- Main Component ---
function Main() {
  const { data: projects, isLoading, error } = useProjects();
  const [activeTab, setActiveTab] = useState<ProjectType>("featured");

  const counts: Record<ProjectType, number> = {
    featured: projects?.filter((p) => p.projectType === "featured").length ?? 0,
    research: projects?.filter((p) => p.projectType === "research").length ?? 0,
    practice: projects?.filter((p) => p.projectType === "practice").length ?? 0,
  };

  const visibleProjects = projects?.filter((p) => p.projectType === activeTab) ?? [];

  return (
    <main className="flex flex-col bg-paper min-h-screen">
      <Hero />

      {/* Projects Section */}
      <section id="projects" className="pb-12">
        {isLoading && (
          <div className="flex items-center justify-center w-full py-20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <p className="text-muted text-base">Loading projects...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center w-full py-20 px-5">
            <p className="text-muted text-base text-center">
              Unable to load projects right now. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !error && projects && (
          <>
            <ProjectsFilter
              activeTab={activeTab}
              counts={counts}
              onChange={setActiveTab}
            />

            {/* Featured: full stacked cards */}
            {activeTab === "featured" && (
              <div className="px-5 md:px-10 space-y-6">
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    variant="featured"
                  />
                ))}
              </div>
            )}

            {/* Research: compact list rows */}
            {activeTab === "research" && (
              <div className="px-5 md:px-10 space-y-3">
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    variant="research"
                  />
                ))}
              </div>
            )}

            {/* Practice: 2-column grid */}
            {activeTab === "practice" && (
              <div className="px-5 md:px-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    variant="practice"
                  />
                ))}
              </div>
            )}

            {visibleProjects.length === 0 && (
              <div className="px-5 md:px-10 py-16">
                <p className="text-faint text-sm">No projects in this category yet.</p>
              </div>
            )}
          </>
        )}
      </section>

      <AboutSection />

      <ContactSection />

      <Closing />
      <SiteFooter />
    </main>
  );
}

export default Main;