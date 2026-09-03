import { useEffect, useMemo, useState } from "react";
import type { Project } from "../../types";
import { mediaItemsOf } from "./projectFacts";
import { cn } from "@/lib/utils";

/**
 * The image/video carousel, shared by the project modal and the project page.
 *
 * Owns its own index rather than taking one as a prop: no surface has ever
 * needed to drive it from outside, and lifting the state would put the same
 * reset-on-project-change effect in both callers.
 */
interface ProjectMediaCarouselProps {
  project: Project;
  /** Frame height — the modal is bounded by the dialog, the page isn't. */
  frameClassName?: string;
  className?: string;
}

function ProjectMediaCarousel({
  project,
  frameClassName = "h-[280px] sm:h-[360px] md:h-[440px] lg:h-[500px]",
  className,
}: ProjectMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaItems = useMemo(() => mediaItemsOf(project), [project]);
  const activeMedia = mediaItems[activeIndex] ?? mediaItems[0];
  const showControls = mediaItems.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [project._id]);

  const goPrev = () =>
    setActiveIndex((current) => (current - 1 + mediaItems.length) % mediaItems.length);
  const goNext = () =>
    setActiveIndex((current) => (current + 1) % mediaItems.length);

  return (
    <div className={cn("bg-white", className)}>
      <div
        className={cn(
          "relative overflow-hidden flex items-center justify-center p-3 md:p-5",
          frameClassName
        )}
      >
        {activeMedia.type === "video" ? (
          <video
            key={activeMedia.src}
            src={activeMedia.src}
            poster={activeMedia.poster}
            controls
            playsInline
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            key={activeMedia.src}
            alt={activeMedia.alt ?? project.title}
            src={activeMedia.src}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {showControls && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous media"
              className="absolute left-3 md:left-4 h-9 w-9 bg-black/60 text-white border border-white/20 hover:bg-black/70 transition-colors"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next media"
              className="absolute right-3 md:right-4 h-9 w-9 bg-black/60 text-white border border-white/20 hover:bg-black/70 transition-colors"
            >
              →
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="px-4 md:px-6 pb-4 md:pb-5">
          <div className="flex flex-wrap gap-2">
            {mediaItems.map((media, index) => (
              <button
                key={`${media.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show media ${index + 1}`}
                className={cn(
                  "px-2.5 py-1 text-xs border transition-colors",
                  index === activeIndex
                    ? "border-accent-dark text-accent-dark bg-accent-soft"
                    : "border-rule text-body bg-paper hover:border-accent"
                )}
              >
                {media.type === "video" ? `Video ${index + 1}` : `Image ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMediaCarousel;
