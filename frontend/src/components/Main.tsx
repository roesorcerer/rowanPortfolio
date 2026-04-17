import useBreakpoint from "../utils/ScreenSize";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";

// --- Hero Section ---
// The intro text at the top of the page. Static content, not from the API.

function HeroMobile() {
  return (
    <header
      className="content-stretch flex flex-col gap-[19px] items-start max-w-[300px] py-[40px] relative shrink-0 w-[314px]"
      data-name="Text"
    >
      <div className="shrink-0 size-[100px]" />
      <p className="absolute font-['Josefin_Sans:SemiBold',sans-serif] font-semibold h-[27px] leading-[1.2] left-0 text-[20px] text-black top-[0.21px] tracking-[-1.00px] w-[345px]">
        {`I'm Rowan Stratton, CS Master's student and explorer of HCI methods with games. I'm passionate about understanding how different disciplines intersect to create mental health software that is meaningful, supported by the users they are made for.`}
      </p>
    </header>
  );
}

function HeroTablet() {
  return (
    <header
      className="max-w-[1500px] relative shrink-0 w-full"
      data-name="Text"
    >
      <div className="content-stretch flex flex-col gap-[19px] items-start max-w-[inherit] pb-[80px] pr-[80px] pt-[200px] relative w-full">
        <div className="shrink-0 size-[100px]" />
        <p className="absolute font-['Josefin_Sans:SemiBold',sans-serif] font-semibold h-[180px] leading-[1.2] right-[640px] text-[30px] text-black text-justify top-[121px] tracking-[-2.25px] translate-x-full w-[600px]">
          {`I'm Rowan Stratton, CS Master's student and explorer of HCI methods with games. I'm passionate about understanding how different disciplines intersect to create mental health software that is meaningful, supported by the users they are made for.`}
        </p>
      </div>
    </header>
  );
}

function HeroDesktop() {
  return (
    <header
      className="h-[479px] max-w-[1500px] relative shrink-0 w-full"
      data-name="Text"
    >
      <div className="content-stretch flex flex-col gap-[19px] items-start max-w-[inherit] pb-[80px] pr-[100px] pt-[200px] relative size-full">
        <div className="shrink-0 size-[100px]" />
        <p className="absolute font-['Josefin_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] left-[60px] text-[32px] text-black top-[121px] tracking-[-2.25px] w-[1080px]">
          {`I'm Rowan Stratton, CS Master's student and explorer of HCI methods with games. I'm passionate about understanding how different disciplines intersect to create mental health software that is meaningful, supported by the users they are made for.`}
        </p>
      </div>
    </header>
  );
}

// --- Closing CTA ---
// The call-to-action section at the bottom of the page.

function ClosingMobile() {
  return (
    <div
      className="content-stretch flex flex-col gap-[50px] items-start max-w-[300px] pb-[120px] pt-[30px] relative shrink-0 w-full"
      data-name="Text"
    >
      <p className="font-['Josefin_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] min-w-full relative shrink-0 text-[16px] text-black tracking-[-1.00px] w-[min-content]">
        {`I'm dedicated to crafting meaningful software through human centered needs. `}
      </p>
      <a
        className="cursor-pointer relative shrink-0"
        data-name="button"
        href="/about"
        target="_self"
      >
        <div
          aria-hidden="true"
          className="absolute border border-black border-solid inset-0 pointer-events-none"
        />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center pb-[7px] pt-[4px] px-[10px] relative">
            <p className="font-['Lato:Light',sans-serif] leading-[1.03] not-italic relative shrink-0 text-[16px] text-black text-left tracking-[-0.72px] whitespace-nowrap">
              Discover my skills and passions
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}

function ClosingTabletDesktop({ isDesktop }: { isDesktop: boolean }) {
  return (
    <div
      className="max-w-[1500px] relative shrink-0 w-full"
      data-name="Text"
    >
      <div
        className={`content-stretch flex flex-col gap-[50px] items-start max-w-[inherit] pb-[120px] pr-[${isDesktop ? "120px" : "80px"}] pt-[30px] relative w-full`}
      >
        <p
          className={`font-['Josefin_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] ${isDesktop ? "w-[855px]" : "min-w-full w-[min-content]"} relative shrink-0 text-[32px] text-black tracking-[-2.25px]`}
        >
          {`I'm dedicated to crafting meaningful software through human centered needs. `}
        </p>
        <a
          className="cursor-pointer relative shrink-0"
          data-name="button"
          href="/about"
          target="_self"
        >
          <div
            aria-hidden="true"
            className="absolute border border-black border-solid inset-0 pointer-events-none"
          />
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex items-center justify-center pb-[7px] pt-[4px] px-[10px] relative">
              <p className="font-['Lato:Light',sans-serif] leading-[1.03] not-italic relative shrink-0 text-[16px] text-black text-left tracking-[-0.72px] whitespace-nowrap">
                Discover my skills and passions
              </p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

// --- Main Component ---
// Fetches projects from the API and renders them with the appropriate
// breakpoint layout. Loading and error states are handled gracefully.

function Main() {
  const { breakpoint } = useBreakpoint();
  const { data: projects, isLoading, error } = useProjects();

  // Pick the right hero for the breakpoint
  const Hero =
    breakpoint === "mobile"
      ? HeroMobile
      : breakpoint === "tablet"
        ? HeroTablet
        : HeroDesktop;

  return (
    <div
      className="content-stretch flex flex-col items-start relative size-full"
      data-name="Main"
    >
      <Hero />

      {isLoading && (
        <div className="flex items-center justify-center w-full py-20">
          <p className="font-['Josefin_Sans:SemiBold',sans-serif] text-[20px] text-gray-400">
            Loading projects...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center w-full py-20">
          <p className="font-['Josefin_Sans:SemiBold',sans-serif] text-[20px] text-red-500">
            Failed to load projects. Is the backend running?
          </p>
        </div>
      )}

      {projects?.map((project, index) => (
        <ProjectCard
          key={project._id}
          project={project}
          index={index}
          breakpoint={breakpoint}
        />
      ))}

      {breakpoint === "mobile" ? (
        <ClosingMobile />
      ) : (
        <ClosingTabletDesktop isDesktop={breakpoint === "desktop"} />
      )}
    </div>
  );
}

export default Main;
