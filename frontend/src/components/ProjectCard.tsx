import type { Project } from "../types";

// Color palette that cycles per project.
// These match the original design's accent colors.
const ACCENT_COLORS = ["#2e6f40", "#9eb8a0", "#68ba7f", "#253d2c", "#2e6f40"];
const BORDER_COLORS = ["#0034ad", "#ab0782", "#6e660a", "#5f00ad", "#0034ad"];
const BUTTON_COLORS = ["black", "#ab0782", "black", "black", "black"];

interface ProjectCardProps {
  project: Project;
  index: number;
  breakpoint: "mobile" | "tablet" | "desktop";
}

function ProjectCard({ project, index, breakpoint }: ProjectCardProps) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const border = BORDER_COLORS[index % BORDER_COLORS.length];
  const buttonColor = BUTTON_COLORS[index % BUTTON_COLORS.length];
  const isMobile = breakpoint === "mobile";

  return (
    <div
      className={`content-stretch flex ${isMobile ? "flex-col" : ""} gap-[50px] items-start ${isMobile ? "max-w-[300px]" : "max-w-[1500px]"} pb-[${isMobile ? "30px" : "80px"}] pt-[50px] relative shrink-0 w-full`}
      data-name={`Project ${index + 1}`}
    >
      {/* Top border accent */}
      <div
        aria-hidden="true"
        className="absolute border-solid border-t-[0.5px] inset-0 pointer-events-none"
        style={{ borderColor: border }}
      />

      {/* Text section */}
      <div
        className={`content-stretch flex ${isMobile ? "" : "flex-[1_0_0]"} flex-col gap-[19px] items-start ${isMobile ? "" : "min-h-px min-w-px"} relative ${isMobile ? "w-full" : ""}`}
        data-name="Text"
      >
        <h2
          className={`block decoration-solid font-['Playpen_Sans_Deva:Medium',sans-serif] font-medium leading-[1.03] ${isMobile ? "min-w-full" : ""} relative shrink-0 text-[16px] tracking-[-0.72px] underline ${isMobile ? "w-[min-content]" : "whitespace-nowrap"}`}
          style={{ color: accent }}
        >
          {project.category}
        </h2>
        <p
          className={`font-['Josefin_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] min-w-full relative shrink-0 text-[${isMobile ? "16px" : "32px"}] tracking-[${isMobile ? "-1.00px" : "-2.25px"}] w-[min-content]`}
          style={{ color: accent }}
        >
          {project.title}
        </p>
        <a
          aria-label={`Explore ${project.title}`}
          className="cursor-pointer relative shrink-0"
          data-name="button"
          href={project.link || `/project/${project._id}`}
          target="_self"
        >
          <div
            aria-hidden="true"
            className="absolute border border-solid inset-0 pointer-events-none"
            style={{ borderColor: buttonColor }}
          />
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex items-center justify-center pb-[7px] pt-[4px] px-[10px] relative">
              <p
                className="font-['Lato:Light',sans-serif] leading-[1.03] not-italic relative shrink-0 text-[16px] text-left tracking-[-0.72px] whitespace-nowrap"
                style={{ color: buttonColor }}
              >
                Explore
              </p>
            </div>
          </div>
        </a>
      </div>

      {/* Image section */}
      <div
        className={`aspect-square relative ${isMobile ? "w-full" : "flex-[1_0_0] min-h-px min-w-px"} rounded-[4px]`}
        data-name="Image"
      >
        <img
          alt={project.title}
          className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[4px] size-full"
          src={project.image}
        />
      </div>
    </div>
  );
}

export default ProjectCard;
