import useBreakpoint from "../utils/ScreenSize";

// --- About Section ---
// Two-column on desktop: bio + contact nudge on the left, tech stack + approach
// stacked on the right. Single column on mobile/tablet, content in the same order.
//
// The bio is grounded in concrete experience (research lead role, 140+ endpoints,
// three semesters TA, client work) so the page communicates ability level without
// resorting to proficiency bars or self-ratings.

const TECH_STACK: { category: string; items: string[] }[] = [
  {
    category: "Frontend",
    items: ["React", "React Native", "TypeScript", "JavaScript", "Tailwind", "Three.js", "GSAP", "Framer Motion"],
  },
  {
    category: "Backend",
    items: ["Django", "Django REST Framework", "Express", "Node.js", "REST APIs"],
  },
  {
    category: "Database",
    items: ["PostgreSQL", "SQLite"],
  },
  {
    category: "Tooling",
    items: ["Git", "Docker", "Vite", "pytest", "Jest", "CI/CD"],
  },
];

const PRINCIPLES: { title: string; description: string }[] = [
  {
    title: "Eudaimonic design",
    description: "Building for meaning and growth, not just engagement metrics.",
  },
  {
    title: "Built with users",
    description: "Design sessions before code, feedback throughout. Not for users — with them.",
  },
  {
    title: "Tested, not just shipped",
    description: "Pytest, Jest, and integration tests where they matter.",
  },
];

function TechStackCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 md:p-8">
      <h3 className="text-[#2C2C2A] text-lg md:text-xl font-medium tracking-tight mb-5">
        What I build with
      </h3>
      <dl className="space-y-4">
        {TECH_STACK.map(({ category, items }) => (
          <div key={category}>
            <dt className="text-[#5F5E5A] text-xs uppercase tracking-widest font-medium mb-2">
              {category}
            </dt>
            <dd className="text-[#2C2C2A] text-sm leading-[1.7]">
              {items.join(" · ")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ApproachCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 md:p-8">
      <h3 className="text-[#2C2C2A] text-lg md:text-xl font-medium tracking-tight mb-5">
        How I work
      </h3>
      <ul className="space-y-5">
        {PRINCIPLES.map(({ title, description }) => (
          <li key={title} className="flex gap-4">
            <div className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full mt-2.5 shrink-0" />
            <div>
              <h4 className="text-[#2C2C2A] text-base font-medium mb-1">{title}</h4>
              <p className="text-[#888780] text-sm leading-[1.6]">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BioContent({
  headingClass,
  paraClass,
}: {
  headingClass: string;
  paraClass: string;
}) {
  return (
    <>
      <h2 className={headingClass}>
        I build production software, and I think carefully about who uses it.
      </h2>
      <div className={paraClass}>
        <p>
          I'm Rowan Stratton, a fullstack developer with a recently completed MS in Computer Science from UMN Duluth. For the past two years I've led development on a research project there — a Django + React Native mobile app with 140+ REST endpoints, now running in an active longitudinal study with real participants.
        </p>
        <p>
          I work across the stack: React and TypeScript on the frontend, Django or Express on the backend, Postgres or SQLite underneath. Outside the research role, I've TA'd intro programming for three semesters and shipped a time-management mobile app to a real client.
        </p>
        <p>
          Coming from HCI, I'm comfortable working with users from the start — running participatory design sessions, iterating on feedback, and writing tests for what I ship. I'm looking for fullstack engineering roles where craft and care both matter.
        </p>
      </div>
    </>
  );
}

function ContactNudge({
  textClass,
  linkClass,
}: {
  textClass: string;
  linkClass: string;
}) {
  return (
    <div className="mt-10 pt-8 border-t border-[#E8E6E1]">
      <p className={textClass}>Hiring, collaborating, or just want to talk shop?</p>
      <a href="#contact" className={linkClass}>
        Get in touch
        <span className="text-xs">→</span>
      </a>
    </div>
  );
}

function AboutMobile() {
  return (
    <section id="about" className="px-5 py-16 border-t border-[#E8E6E1]">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">About me</span>
      </div>

      <div className="mb-10">
        <BioContent
          headingClass="text-[#2C2C2A] text-2xl font-normal leading-[1.4] tracking-tight mb-5"
          paraClass="space-y-4 text-[#5F5E5A] text-base leading-[1.75]"
        />
      </div>

      <div className="space-y-6">
        <TechStackCard />
        <ApproachCard />
      </div>

      <ContactNudge
        textClass="text-[#888780] text-sm mb-4"
        linkClass="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
      />
    </section>
  );
}

function AboutTabletDesktop({ isDesktop }: { isDesktop: boolean }) {
  return (
    <section
      id="about"
      className={`${isDesktop ? "px-10 py-24" : "px-10 py-20"} border-t border-[#E8E6E1] max-w-[1400px] mx-auto w-full`}
    >
      <div className="flex items-center gap-2 mb-12">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">About me</span>
      </div>

      <div className={`grid ${isDesktop ? "grid-cols-2 gap-16" : "grid-cols-1 gap-12"}`}>
        {/* Left: bio + contact nudge */}
        <div>
          <BioContent
            headingClass="text-[#2C2C2A] text-3xl font-normal leading-[1.35] tracking-tight mb-6"
            paraClass="space-y-5 text-[#5F5E5A] text-[17px] leading-[1.75]"
          />
          <ContactNudge
            textClass="text-[#888780] text-sm mb-4"
            linkClass="inline-flex items-center gap-2 text-[#0F6E56] text-base hover:text-[#085041] transition-colors"
          />
        </div>

        {/* Right: tech stack + approach */}
        <div className="space-y-6">
          <TechStackCard />
          <ApproachCard />
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { breakpoint } = useBreakpoint();
  if (breakpoint === "mobile") return <AboutMobile />;
  return <AboutTabletDesktop isDesktop={breakpoint === "desktop"} />;
}

export default AboutSection;
