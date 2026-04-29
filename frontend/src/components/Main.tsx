import { useState } from "react";
import useBreakpoint from "../utils/ScreenSize";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import type { ProjectType } from "../types";

// --- Hero Section ---
// Eudaimonic design: warm, purposeful, human-centered

function HeroMobile() {
  return (
    <header className="px-5 pt-12 pb-16 max-w-[600px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Open to fullstack roles</span>
      </div>

      <h1 className="text-[#2C2C2A] text-2xl font-normal leading-[1.4] tracking-tight mb-5">
        Fullstack developer building thoughtful software in React, TypeScript, and Django.
      </h1>

      <p className="text-[#888780] text-base leading-[1.75] mb-8">
        Just finished my MS at UMN Duluth, where I led development on an active research platform. Looking for fullstack engineering roles where craft and care both matter.
      </p>

      <div className="flex flex-col gap-4">
        <a
          href="#projects"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          See my work
        </a>
        <a
          href="#about"
          className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
        >
          About me
          <span className="text-xs">→</span>
        </a>
      </div>
    </header>
  );
}

function HeroTablet() {
  return (
    <header className="px-10 pt-16 pb-20 max-w-[700px]">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Open to fullstack roles</span>
      </div>

      <h1 className="text-[#2C2C2A] text-[32px] font-normal leading-[1.35] tracking-tight mb-6">
        Fullstack developer building thoughtful software in React, TypeScript, and Django.
      </h1>

      <p className="text-[#888780] text-[17px] leading-[1.75] mb-10 max-w-[560px]">
        Just finished my MS at UMN Duluth, where I led development on an active research platform. Looking for fullstack engineering roles where craft and care both matter.
      </p>

      <div className="flex items-center gap-4">
        <a
          href="#projects"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          See my work
        </a>
        <a
          href="#about"
          className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
        >
          About me
          <span className="text-xs">→</span>
        </a>
      </div>
    </header>
  );
}

function HeroDesktop() {
  return (
    <header className="px-10 pt-16 pb-20 max-w-[720px]">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Open to fullstack roles</span>
      </div>

      <h1 className="text-[#2C2C2A] text-4xl font-normal leading-[1.35] tracking-tight mb-7">
        Fullstack developer building thoughtful software in React, TypeScript, and Django.
      </h1>

      <p className="text-[#888780] text-[17px] leading-[1.75] mb-10 max-w-[560px]">
        Just finished my MS at UMN Duluth, where I led development on an active research platform. Looking for fullstack engineering roles where craft and care both matter.
      </p>

      <div className="flex items-center gap-4">
        <a
          href="#projects"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          See my work
        </a>
        <a
          href="#about"
          className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
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
  isMobile,
}: {
  activeTab: ProjectType;
  counts: Record<ProjectType, number>;
  onChange: (t: ProjectType) => void;
  isMobile: boolean;
}) {
  return (
    <div className={`${isMobile ? "px-5" : "px-10"} mb-7`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#2C2C2A] text-sm font-medium tracking-widest uppercase">
          Selected work
        </h2>
        <span className="text-[#B4B2A9] text-sm">
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
                ? "bg-[#2C2C2A] text-[#FAF9F7]"
                : "bg-white text-[#888780] border border-[#E8E6E1] hover:border-[#2C2C2A] hover:text-[#2C2C2A]"
            }`}
          >
            {label}
            {counts[type] > 0 && (
              <span className={`ml-1.5 text-xs ${activeTab === type ? "text-[#B4B2A9]" : "text-[#B4B2A9]"}`}>
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
function ClosingMobile() {
  return (
    <footer className="px-5 py-16 border-t border-[#E8E6E1]">
      <p className="text-[#2C2C2A] text-xl leading-[1.4] tracking-tight mb-8 max-w-[340px]">
        Currently looking for fullstack engineering roles.
      </p>
      <a
        href="#contact"
        className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
      >
        Get in touch
        <span className="text-xs">→</span>
      </a>
    </footer>
  );
}

function ClosingTabletDesktop() {
  return (
    <footer className="px-10 py-20 border-t border-[#E8E6E1] w-full">
      <p className="text-[#2C2C2A] text-2xl md:text-3xl leading-[1.35] tracking-tight mb-10 max-w-[680px]">
        Currently looking for fullstack engineering roles where craft and care both matter.
      </p>
      <a
        href="#contact"
        className="inline-flex items-center gap-2 text-[#0F6E56] text-base hover:text-[#085041] transition-colors"
      >
        Get in touch
        <span>→</span>
      </a>
    </footer>
  );
}

// --- Site Footer ---
function SiteFooter({ isMobile }: { isMobile: boolean }) {
  return (
    <div className={`${isMobile ? 'px-5 py-6' : 'px-10 py-8 w-full'} flex justify-between items-center border-t border-[#E8E6E1]`}>
      <p className="text-[#B4B2A9] text-sm">Crafted with intention</p>
      <div className="flex gap-5 md:gap-6">
        <a href="https://github.com/roesorcerer" target="_blank" rel="noopener noreferrer" className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors">
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/rowan-stratton-611247247" target="_blank" rel="noopener noreferrer" className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors">
          LinkedIn
        </a>
        <a href="#contact" className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors">
          Say hello
        </a>
      </div>
    </div>
  );
}

// --- Main Component ---
function Main() {
  const { breakpoint } = useBreakpoint();
  const { data: projects, isLoading, error } = useProjects();
  const isMobile = breakpoint === "mobile";
  const [activeTab, setActiveTab] = useState<ProjectType>("featured");

  const Hero =
    breakpoint === "mobile"
      ? HeroMobile
      : breakpoint === "tablet"
        ? HeroTablet
        : HeroDesktop;

  const counts: Record<ProjectType, number> = {
    featured: projects?.filter((p) => p.projectType === "featured").length ?? 0,
    research: projects?.filter((p) => p.projectType === "research").length ?? 0,
    practice: projects?.filter((p) => p.projectType === "practice").length ?? 0,
  };

  const visibleProjects = projects?.filter((p) => p.projectType === activeTab) ?? [];

  return (
    <main className="flex flex-col bg-[#FAF9F7] min-h-screen">
      <Hero />

      {/* Projects Section */}
      <section id="projects" className="pb-12">
        {isLoading && (
          <div className="flex items-center justify-center w-full py-20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
              <p className="text-[#888780] text-base">Loading projects...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center w-full py-20 px-5">
            <p className="text-[#888780] text-base text-center">
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
              isMobile={isMobile}
            />

            {/* Featured: full stacked cards */}
            {activeTab === "featured" && (
              <div className={`${isMobile ? "px-5" : "px-10"} space-y-6`}>
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    breakpoint={breakpoint}
                    variant="featured"
                  />
                ))}
              </div>
            )}

            {/* Research: compact list rows */}
            {activeTab === "research" && (
              <div className={`${isMobile ? "px-5" : "px-10"} space-y-3`}>
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    breakpoint={breakpoint}
                    variant="research"
                  />
                ))}
              </div>
            )}

            {/* Practice: 2-column grid */}
            {activeTab === "practice" && (
              <div className={`${isMobile ? "px-5" : "px-10"} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                {visibleProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    breakpoint={breakpoint}
                    variant="practice"
                  />
                ))}
              </div>
            )}

            {visibleProjects.length === 0 && (
              <div className={`${isMobile ? "px-5" : "px-10"} py-16`}>
                <p className="text-[#B4B2A9] text-sm">No projects in this category yet.</p>
              </div>
            )}
          </>
        )}
      </section>

      <AboutSection />

      <ContactSection />

      {isMobile ? <ClosingMobile /> : <ClosingTabletDesktop />}
      <SiteFooter isMobile={isMobile} />
    </main>
  );
}

export default Main;