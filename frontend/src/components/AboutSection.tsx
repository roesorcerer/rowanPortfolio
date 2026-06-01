// --- About Section ---
// Two-column on lg: bio + contact nudge on the left, tech stack + approach
// stacked on the right. Single column below lg, content in column order:
// bio → contact nudge → tech stack → approach.
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
    title: "Consistently learning",
    description: "Through research and iteratively improving projects. Building products that mean something. ",
  },
  {
    title: "Built with users",
    description: "Co-design work with users to built supportive software systems. ",
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

function AboutSection() {
  return (
    <section
      id="about"
      className="px-5 md:px-10 py-16 md:py-20 lg:py-24 border-t border-[#E8E6E1] max-w-[1400px] mx-auto w-full"
    >
      <div className="flex items-center gap-2 mb-10 md:mb-12">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">About me</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left column: bio + contact nudge */}
        <div>
          <h2 className="text-[#2C2C2A] text-2xl lg:text-3xl font-normal leading-[1.4] lg:leading-[1.35] tracking-tight mb-5 lg:mb-6">
            I build full-stack production software, and I research the features that matter.
          </h2>
          <div className="space-y-4 lg:space-y-5 text-[#5F5E5A] text-base lg:text-[17px] leading-[1.75]">
            <p>
              I'm Rowan Stratton, a fullstack developer with a recently completed MS in Computer Science from UMN Duluth. For the past two years I've led a Research through Design project to create an application for stress management to support college students. This was a three phase community driven project where we had over +100 participants contribute to this research. These findings informed the development of the research artifact built with Django + React Native as a mobile app with 140+ REST endpoints. This research is concluded and the findings will be presented in June. All research papers published center around this project and the insights gathered from the research.
            </p>
            <p>
              I am flexible and have experiences working across stacks. TypeScript and Javascript knowlege provides me the flexibility to work with React realted technologies and Angular. This also allows me to develop backend stacks with Express.js. My python background gives me flexibility in Django and game development. Outside the research role, I've TA'd intro programming for three semesters leading interactive labs based on industry standard practices. I have also developed and shipped software such as a time-management solution for a local organization and a habit tracker with AI reminders to customize habit adoption.
            </p>
            <p>
              Coming from HCI, I'm comfortable working with users through the development process. This is demonstratrated through my work in running participatory design sessions, iterating on feedback, and continous development with stakeholders. I'm looking for fullstack development roles and research opportunities where craft and care both matter.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-[#E8E6E1]">
            <p className="text-[#888780] text-sm mb-4">Hiring, collaborating, or just want to talk shop?</p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-[#0F6E56] text-sm lg:text-base hover:text-[#085041] transition-colors"
            >
              Get in touch
              <span className="text-xs">→</span>
            </a>
          </div>
        </div>

        {/* Right column: tech stack + approach */}
        <div className="space-y-6">
          <TechStackCard />
          <ApproachCard />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
