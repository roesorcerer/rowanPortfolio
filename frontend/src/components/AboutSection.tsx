import useBreakpoint from "../utils/ScreenSize";

// --- About Section ---
// Eudaimonic design: Warm, reflective, human-centered
// Scroll target: #about

function AboutMobile() {
  return (
    <section id="about" className="px-5 py-16 border-t border-[#E8E6E1]">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">About me</span>
      </div>

      {/* Bio */}
      <div className="mb-12">
        <h2 className="text-[#2C2C2A] text-2xl font-normal leading-[1.4] tracking-tight mb-5">
          I believe technology should nurture, not overwhelm.
        </h2>
        <div className="space-y-4 text-[#5F5E5A] text-base leading-[1.75]">
          <p>
            I'm Rowan Stratton, a Computer Science Master's student specializing in Human-Computer Interaction. My work sits at the intersection of games, interactive storytelling, and mental health—exploring how we can design software that genuinely supports human flourishing.
          </p>
          <p>
            Before grad school, I discovered that the most impactful tools aren't the most feature-rich—they're the ones that meet people where they are, respect their autonomy, and create space for reflection.
          </p>
        </div>
      </div>

      {/* Philosophy */}
      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6">
        <h3 className="text-[#2C2C2A] text-lg font-medium tracking-tight mb-4">
          My approach
        </h3>
        <ul className="space-y-4">
          <PhilosophyItem
            title="Eudaimonic design"
            description="Designing for meaning and growth, not just engagement metrics."
          />
          <PhilosophyItem
            title="Participatory process"
            description="Working with communities, not just for them. Users shape the tools they'll use."
          />
          <PhilosophyItem
            title="Gentle interactions"
            description="Interfaces that breathe—unhurried, forgiving, and respectful of attention."
          />
        </ul>
      </div>

      {/* Contact nudge */}
      <div className="mt-10 pt-8 border-t border-[#E8E6E1]">
        <p className="text-[#888780] text-sm mb-4">
          Interested in collaborating or chatting about HCI research?
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
        >
          Get in touch
          <span className="text-xs">→</span>
        </a>
      </div>
    </section>
  );
}

function AboutTabletDesktop({ isDesktop }: { isDesktop: boolean }) {
  return (
    <section
      id="about"
      className={`${isDesktop ? 'px-10 py-24' : 'px-10 py-20'} border-t border-[#E8E6E1] max-w-[1400px] mx-auto w-full`}
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">About me</span>
      </div>

      <div className={`grid ${isDesktop ? 'grid-cols-2 gap-16' : 'grid-cols-1 gap-12'}`}>
        {/* Bio - Left column */}
        <div>
          <h2 className="text-[#2C2C2A] text-3xl font-normal leading-[1.35] tracking-tight mb-6">
            I believe technology should nurture, not overwhelm.
          </h2>
          <div className="space-y-5 text-[#5F5E5A] text-[17px] leading-[1.75]">
            <p>
              I'm Rowan Stratton, a Computer Science Master's student specializing in Human-Computer Interaction. My work sits at the intersection of games, interactive storytelling, and mental health—exploring how we can design software that genuinely supports human flourishing.
            </p>
            <p>
              Before grad school, I discovered that the most impactful tools aren't the most feature-rich—they're the ones that meet people where they are, respect their autonomy, and create space for reflection.
            </p>
          </div>

          {/* Contact nudge */}
          <div className="mt-10 pt-8 border-t border-[#E8E6E1]">
            <p className="text-[#888780] text-sm mb-4">
              Interested in collaborating or chatting about HCI research?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-[#0F6E56] text-base hover:text-[#085041] transition-colors"
            >
              Get in touch
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Philosophy - Right column */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 h-fit">
          <h3 className="text-[#2C2C2A] text-xl font-medium tracking-tight mb-6">
            My approach
          </h3>
          <ul className="space-y-6">
            <PhilosophyItem
              title="Eudaimonic design"
              description="Designing for meaning and growth, not just engagement metrics. Software should help people become who they want to be."
            />
            <PhilosophyItem
              title="Participatory process"
              description="Working with communities, not just for them. The people who use these tools should shape how they work."
            />
            <PhilosophyItem
              title="Gentle interactions"
              description="Interfaces that breathe—unhurried, forgiving, and respectful of attention. No dark patterns, no anxiety-inducing notifications."
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

// --- Philosophy Item Component ---
function PhilosophyItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-4">
      <div className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full mt-2.5 shrink-0" />
      <div>
        <h4 className="text-[#2C2C2A] text-base font-medium mb-1">{title}</h4>
        <p className="text-[#888780] text-sm leading-[1.6]">{description}</p>
      </div>
    </li>
  );
}

// --- Main Export ---
function AboutSection() {
  const { breakpoint } = useBreakpoint();

  if (breakpoint === "mobile") return <AboutMobile />;
  return <AboutTabletDesktop isDesktop={breakpoint === "desktop"} />;
}

export default AboutSection;
