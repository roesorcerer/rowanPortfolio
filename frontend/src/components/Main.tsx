import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { useProjects } from "../hooks/useProjects";
import type { Project, ProjectType } from "../types";
import ProjectCard from "./ProjectCard";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroImage {
  src: string;
  alt: string;
  srcDark?: string;
}

interface HeroButtonConfig {
  text: string;
  url: string;
  icon?: ReactNode;
}

interface HeroButtons {
  primary?: HeroButtonConfig;
  secondary?: HeroButtonConfig;
}

interface HeroBadgeConfig {
  text: string;
  announcement?: string;
  url?: string;
}

interface HeroBasicProps {
  badge?: HeroBadgeConfig;
  headingPrefix: string;
  headingWords: string[];
  description: string;
  buttons?: HeroButtons;
  image: HeroImage;
  className?: string;
}

type Hero1Props = Partial<HeroBasicProps>;

const defaultHeroProps: HeroBasicProps = {
  badge: {
    text: "Hi, I'm Rowan!",
    announcement: "Available for 2026 engineering opportunities",
  },
  headingPrefix: "I'm a...",
  headingWords: ["Developer", "Researcher", "Teacher", "Game Developer", "Artist"],
  description:
    "A Minnesota based developer. I believe that technology can be created to support and enrich people's lives. My work seeks to find that balance of creating systems that fulfill that purpose. ",
  buttons: {
    primary: {
      text: "See my work",
      url: "#projects",
    },
    secondary: {
      text: "About me",
      url: "#about",
    },
  },
  image: {
    src: "https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61ivdcRlDPgqtuCYzNZPokO0AeRFT3Ml6cBshjy",
    alt: "Ocean waves background",
  },
};

function FlipWords({ words, intervalMs = 2200 }: { words: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, words]);

  const currentWord = words[index] ?? "Developer";

  return (
    <span className="inline-block min-w-[11ch] align-baseline">
      <span
        key={currentWord}
        className="inline-block animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
      >
        {currentWord}
      </span>
    </span>
  );
}

function Hero1(props: Hero1Props) {
  const { badge, headingPrefix, headingWords, description, buttons, image, className } = {
    ...defaultHeroProps,
    ...props,
  };

  return (
    <header id="top" className={cn("pt-4 pb-8 md:pt-5 md:pb-10", className)}>
      <div className="mx-auto w-full px-6">
        <div className="relative h-[min(820px,calc(100vh-9rem))] min-h-[520px] w-full overflow-hidden border-2 border-ink/35 bg-paper shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition-colors transition-shadow duration-200 hover:border-ink/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] dark:border-white/30 dark:hover:border-white/45 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-30 brightness-110 dark:opacity-60 dark:brightness-95"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          >
            <source src={image.src} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white/65 dark:bg-black/25" aria-hidden="true" />

          <div className="relative z-10 px-5 py-16 md:px-10 md:py-20 lg:px-14">
            <div className="grid h-full grid-rows-[1fr_auto] gap-10">
              <div className="flex flex-col items-start gap-5 text-left">
                {badge && (
                  <Badge variant="outline" className="inline-flex items-center gap-2">
                    {badge.text}
                    <ArrowUpRight className="size-4" />
                  </Badge>
                )}
                <h1 className="max-w-xl text-4xl font-light tracking-tight text-pretty md:text-5xl lg:max-w-3xl lg:text-6xl">
                  <span className="block">{headingPrefix}</span>
                  <span className="mt-1 block">
                    <FlipWords words={headingWords} />
                  </span>
                </h1>
              </div>

              <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-12">
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  {buttons?.primary && (
                    <a
                      href={buttons.primary.url}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full sm:w-auto"
                      )}
                    >
                      {buttons.primary.text}
                      <ArrowRight className="size-4" />
                    </a>
                  )}
                  {buttons?.secondary && (
                    <a
                      href={buttons.secondary.url}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full sm:w-auto"
                      )}
                    >
                      {buttons.secondary.text}
                    </a>
                  )}
                  <Link
                    to="/resume"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full sm:w-auto"
                    )}
                  >
                    Resume
                  </Link>
                </div>

                <p className="max-w-md justify-self-start font-light text-balance text-muted-foreground italic lg:justify-self-end lg:text-right lg:text-xl">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const TAB_LABELS: { type: ProjectType; label: string; description: string }[] = [
  { type: "featured", label: "Featured", description: "Selected work" },
  { type: "research", label: "Research", description: "Papers & studies" },
  { type: "practice", label: "Practice", description: "Experiments & builds" },
  { type: "gameDev", label: "Game Dev", description: "Playable systems" },
  { type: "art", label: "Art", description: "Visual explorations" },
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
        <h2 className="text-ink text-sm font-medium tracking-widest uppercase">Selected work</h2>
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
            aria-expanded={activeTab === type}
            className={buttonVariants({ 
              variant: activeTab === type ? "outline" : "ghost",
              size: "sm"
            })}
          >
            {label}
            {counts[type] > 0 && (
              <span className="ml-1.5 text-xs">
                {counts[type]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Closing() {
  return (
    <footer className="px-5 md:px-10 py-16 md:py-20 border-t border-rule md:w-full">
      <p className="text-ink text-xl md:text-2xl lg:text-3xl leading-[1.4] md:leading-[1.35] tracking-tight mb-8 md:mb-10 max-w-[340px] md:max-w-[680px]">
        Currently looking for fullstack engineering roles
        <span className="hidden md:inline"> where craft and care both matter</span>.
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

function SiteFooter() {
  return (
    <div className="px-5 md:px-10 py-6 md:py-8 md:w-full flex justify-between items-center border-t border-rule">
      <p className="text-faint text-sm">Crafted with intention</p>
      <div className="flex gap-5 md:gap-6">
        <a
          href="https://github.com/roesorcerer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted text-sm hover:text-ink transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/rowan-stratton-611247247"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted text-sm hover:text-ink transition-colors"
        >
          LinkedIn
        </a>
        <Link to="/resume" className="text-muted text-sm hover:text-ink transition-colors">
          Resume
        </Link>
        <a href="#contact" className="text-muted text-sm hover:text-ink transition-colors">
          Say hello
        </a>
      </div>
    </div>
  );
}

function Main() {
  const { data: projects, isLoading, error } = useProjects();
  const [activeTab, setActiveTab] = useState<ProjectType>("featured");

  const getResearchStatus = (project: Project): "published" | "rejected" => {
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

  const counts: Record<ProjectType, number> = {
    featured: projects?.filter((p) => p.projectType === "featured").length ?? 0,
    research: projects?.filter((p) => p.projectType === "research").length ?? 0,
    practice: projects?.filter((p) => p.projectType === "practice").length ?? 0,
    gameDev: projects?.filter((p) => p.projectType === "gameDev").length ?? 0,
    art: projects?.filter((p) => p.projectType === "art").length ?? 0,
  };

  const visibleProjects = projects?.filter((p) => p.projectType === activeTab) ?? [];
  const publishedResearch =
    activeTab === "research"
      ? visibleProjects.filter((project) => getResearchStatus(project) === "published")
      : [];
  const rejectedResearch =
    activeTab === "research"
      ? visibleProjects.filter((project) => getResearchStatus(project) === "rejected")
      : [];

  return (
    <main className="flex flex-col bg-paper min-h-screen">
      <Hero1 />

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
            <ProjectsFilter activeTab={activeTab} counts={counts} onChange={setActiveTab} />

            {activeTab === "featured" && (
              <div className="px-5 md:px-10 space-y-6">
                {visibleProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} variant="featured" />
                ))}
              </div>
            )}

            {activeTab === "research" && (
              <div className="px-5 md:px-10 space-y-8">
                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-ink text-xs uppercase tracking-[0.2em]">Published works</h3>
                    <span className="text-faint text-xs">{publishedResearch.length}</span>
                  </div>
                  <div className="space-y-3">
                    {publishedResearch.map((project, index) => (
                      <ProjectCard key={project._id} project={project} index={index} variant="research" />
                    ))}
                    {publishedResearch.length === 0 && (
                      <p className="text-faint text-sm border border-rule bg-white p-4">No published works added yet.</p>
                    )}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-ink text-xs uppercase tracking-[0.2em]">Developing manuscripts</h3>
                    <span className="text-faint text-xs">{rejectedResearch.length}</span>
                  </div>
                  <div className="space-y-3">
                    {rejectedResearch.map((project, index) => (
                      <ProjectCard key={project._id} project={project} index={index} variant="research" />
                    ))}
                    {rejectedResearch.length === 0 && (
                      <p className="text-faint text-sm border border-rule bg-white p-4">
                        No developing manuscripts added yet. Add one with a revision trail to show where it was submitted and how it evolved.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "practice" && (
              <div className="px-5 md:px-10 space-y-6">
                {visibleProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} variant="practice" />
                ))}
              </div>
            )}

            {activeTab === "gameDev" && (
              <div className="px-5 md:px-10 space-y-6">
                {visibleProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} variant="gameDev" />
                ))}
              </div>
            )}

            {activeTab === "art" && (
              <div className="px-5 md:px-10 space-y-6">
                {visibleProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} variant="art" />
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
