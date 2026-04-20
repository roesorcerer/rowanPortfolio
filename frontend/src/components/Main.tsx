import useBreakpoint from "../utils/ScreenSize";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";

// --- Hero Section ---
// Eudaimonic design: warm, purposeful, human-centered

function HeroMobile() {
  return (
    <header className="px-5 pt-12 pb-16 max-w-[600px]">
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Designing for well-being</span>
      </div>
      
      {/* Main headline */}
      <h1 className="text-[#2C2C2A] text-2xl font-normal leading-[1.4] tracking-tight mb-5">
        I create mental health software that meets people where they are—through games, stories, and thoughtful interaction.
      </h1>
      
      {/* Subtitle */}
      <p className="text-[#888780] text-base leading-[1.75] mb-8">
        CS Master's student exploring how HCI methods can make supportive tools that feel genuinely meaningful to the people who use them.
      </p>
      
      {/* CTAs */}
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
          Learn about my approach
          <span className="text-xs">→</span>
        </a>
      </div>
    </header>
  );
}

function HeroTablet() {
  return (
    <header className="px-10 pt-16 pb-20 max-w-[700px]">
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Designing for well-being</span>
      </div>
      
      {/* Main headline */}
      <h1 className="text-[#2C2C2A] text-[32px] font-normal leading-[1.35] tracking-tight mb-6">
        I create mental health software that meets people where they are—through games, stories, and thoughtful interaction.
      </h1>
      
      {/* Subtitle */}
      <p className="text-[#888780] text-[17px] leading-[1.75] mb-10 max-w-[520px]">
        CS Master's student exploring how HCI methods can make supportive tools that feel genuinely meaningful to the people who use them.
      </p>
      
      {/* CTAs */}
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
          Learn about my approach
          <span className="text-xs">→</span>
        </a>
      </div>
    </header>
  );
}

function HeroDesktop() {
  return (
    <header className="px-10 pt-16 pb-20 max-w-[680px]">
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Designing for well-being</span>
      </div>
      
      {/* Main headline */}
      <h1 className="text-[#2C2C2A] text-4xl font-normal leading-[1.35] tracking-tight mb-7">
        I create mental health software that meets people where they are—through games, stories, and thoughtful interaction.
      </h1>
      
      {/* Subtitle */}
      <p className="text-[#888780] text-[17px] leading-[1.75] mb-10 max-w-[480px]">
        CS Master's student exploring how HCI methods can make supportive tools that feel genuinely meaningful to the people who use them.
      </p>
      
      {/* CTAs */}
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
          Learn about my approach
          <span className="text-xs">→</span>
        </a>
      </div>
    </header>
  );
}

// --- Projects Section Header ---
function ProjectsSectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-baseline justify-between mb-7 px-5 md:px-10">
      <h2 className="text-[#2C2C2A] text-sm font-medium tracking-widest uppercase">
        Selected work
      </h2>
      <span className="text-[#B4B2A9] text-sm">
        {count} {count === 1 ? 'project' : 'projects'}
      </span>
    </div>
  );
}

// --- Closing CTA ---
function ClosingMobile() {
  return (
    <footer className="px-5 py-16 border-t border-[#E8E6E1]">
      <p className="text-[#2C2C2A] text-xl leading-[1.4] tracking-tight mb-8 max-w-[300px]">
        I'm dedicated to crafting meaningful software through human-centered design.
      </p>
      <a 
        href="/about"
        className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
      >
        Discover my approach
        <span className="text-xs">→</span>
      </a>
    </footer>
  );
}

function ClosingTabletDesktop() {
  return (
    <footer className="px-10 py-20 border-t border-[#E8E6E1] max-w-[1400px] mx-auto w-full">
      <p className="text-[#2C2C2A] text-2xl md:text-3xl leading-[1.35] tracking-tight mb-10 max-w-[600px]">
        I'm dedicated to crafting meaningful software through human-centered design.
      </p>
      <a 
        href="/about"
        className="inline-flex items-center gap-2 text-[#0F6E56] text-base hover:text-[#085041] transition-colors"
      >
        Discover my approach
        <span>→</span>
      </a>
    </footer>
  );
}

// --- Site Footer ---
function SiteFooter({ isMobile }: { isMobile: boolean }) {
  return (
    <div className={`${isMobile ? 'px-5 py-6' : 'px-10 py-8 max-w-[1400px] mx-auto w-full'} flex justify-between items-center border-t border-[#E8E6E1]`}>
      <p className="text-[#B4B2A9] text-sm">Crafted with intention</p>
      <div className="flex gap-5 md:gap-6">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors">
          GitHub
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors">
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

  const Hero =
    breakpoint === "mobile"
      ? HeroMobile
      : breakpoint === "tablet"
        ? HeroTablet
        : HeroDesktop;

  return (
    <main className="flex flex-col bg-[#FAF9F7] min-h-screen">
      <Hero />

      {/* Projects Section */}
      <section id="projects" className="pb-12">
        {!isLoading && !error && projects && (
          <ProjectsSectionHeader count={projects.length} />
        )}

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

        <div className={`${isMobile ? 'px-5' : 'px-10'} space-y-6`}>
          {projects?.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              index={index}
              breakpoint={breakpoint}
            />
          ))}
        </div>
      </section>

      <AboutSection />

      <ContactSection />

      {isMobile ? <ClosingMobile /> : <ClosingTabletDesktop />}
      <SiteFooter isMobile={isMobile} />
    </main>
  );
}

export default Main;