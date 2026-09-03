import type { ProjectCaseStudy, ProjectMedia } from "../types";
import { cn } from "@/lib/utils";

/**
 * The process narrative, rendered identically in the project modal and on the
 * `/projects/:slug` permalink page.
 *
 * One component for both surfaces on purpose: the permalink is what a resume
 * points at, and a reader who lands there should see the same case study a
 * visitor sees after opening the modal — never a second, drifting version of
 * it. `density` only changes spacing and type scale, never what's shown.
 */
export type CaseStudyDensity = "compact" | "page";

interface CaseStudyProps {
  caseStudy: ProjectCaseStudy;
  density?: CaseStudyDensity;
  className?: string;
}

function CaseStudy({ caseStudy, density = "page", className }: CaseStudyProps) {
  const isPage = density === "page";

  const sections = (caseStudy.sections ?? []).filter(
    (section) => section.heading.trim() || section.body.trim()
  );
  const outcomes = (caseStudy.outcomes ?? []).filter((item) => item.trim());
  const lessons = (caseStudy.lessons ?? []).filter((item) => item.trim());

  const context = [
    { label: "My role", value: caseStudy.role?.trim() },
    { label: "The problem", value: caseStudy.problem?.trim() },
  ].filter((entry) => Boolean(entry.value));

  return (
    <div className={cn(isPage ? "space-y-10" : "space-y-6", className)}>
      {caseStudy.summary?.trim() && (
        <p
          className={cn(
            "text-body whitespace-pre-line",
            isPage
              ? "text-base md:text-lg leading-[1.75]"
              : "text-[15px] leading-[1.7]"
          )}
        >
          {caseStudy.summary}
        </p>
      )}

      {context.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {context.map((entry) => (
            <section key={entry.label} className="border border-rule bg-white p-4">
              <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-2">
                {entry.label}
              </h3>
              <p className="text-body text-sm leading-relaxed whitespace-pre-line">
                {entry.value}
              </p>
            </section>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <ol className={cn("list-none", isPage ? "space-y-10" : "space-y-6")}>
          {sections.map((section, index) => (
            <li key={`${section.heading}-${index}`}>
              {/* The step number is the point of an ordered process — it's
                  what turns a pile of headings into "and then". */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-faint text-xs tabular-nums shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  className={cn(
                    "text-ink font-medium tracking-tight",
                    isPage ? "text-lg md:text-xl" : "text-base"
                  )}
                >
                  {section.heading}
                </h3>
              </div>

              {/* Hangs the body off a rule aligned under the step number, so
                  a long process reads as one column rather than a stack. */}
              <div className="ml-1 pl-5 border-l border-rule">
                {section.body.trim() && (
                  <p
                    className={cn(
                      "text-body whitespace-pre-line",
                      isPage ? "text-[15px] md:text-base leading-[1.75]" : "text-sm leading-[1.7]"
                    )}
                  >
                    {section.body}
                  </p>
                )}

                <StepMedia media={section.media} heading={section.heading} />
              </div>
            </li>
          ))}
        </ol>
      )}

      {(outcomes.length > 0 || lessons.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomes.length > 0 && (
            <CaseStudyList label="What came out of it" items={outcomes} />
          )}
          {lessons.length > 0 && (
            <CaseStudyList label="What I'd carry forward" items={lessons} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A step's images.
 *
 * A lone image gets the full column — it's usually a diagram worth reading. A
 * set gets a two-up grid, because a set is nearly always a sequence of
 * sketches or wireframes being compared rather than studied one at a time.
 */
function StepMedia({
  media,
  heading,
}: {
  media: ProjectMedia[];
  heading: string;
}) {
  const items = (media ?? []).filter((item) => item.src?.trim());
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "mt-4 grid gap-3",
        items.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      )}
    >
      {items.map((item, index) => {
        const caption = item.caption?.trim() || item.alt?.trim();

        return (
          <figure
            key={`${item.src}-${index}`}
            className="border border-rule bg-white p-2"
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                poster={item.poster}
                controls
                preload="metadata"
                className="w-full max-h-[420px] object-contain"
              />
            ) : (
              <img
                src={item.src}
                alt={item.alt?.trim() || caption || heading}
                loading="lazy"
                className={cn(
                  "w-full object-contain",
                  items.length > 1 ? "max-h-[300px]" : "max-h-[420px]"
                )}
              />
            )}
            {caption && (
              <figcaption className="text-faint text-xs mt-2 px-1">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

function CaseStudyList({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="border border-rule bg-white p-4">
      <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-3">
        {label}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="text-body text-sm leading-relaxed flex gap-2.5"
          >
            <span className="text-accent-dark shrink-0" aria-hidden="true">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CaseStudy;
