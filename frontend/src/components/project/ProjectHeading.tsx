import type { Project } from "../../types";
import { researchStatusOf } from "./projectFacts";

// The two header fragments the modal and the page render identically. The
// headings themselves stay local to each surface — one is an <h2> carrying the
// dialog's accessible name, the other an <h1> at page scale — but everything
// around them is the same, and was drifting apart at two lines a time.

/** The project's tags, as chips. */
export function ProjectTags({ project }: { project: Project }) {
  const tags = project.category ?? [];
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-block px-3 py-1.5 bg-accent-soft text-accent-dark text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/** The eyebrow above a research project's title. Renders nothing otherwise. */
export function ResearchStatusLine({ project }: { project: Project }) {
  const status = researchStatusOf(project);
  if (!status) return null;

  return (
    <p className="text-xs uppercase tracking-[0.2em] text-faint mb-4">
      {status === "published" ? "Published work" : "Developing manuscript"}
    </p>
  );
}
