import type { CSSProperties, HTMLAttributes } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Project } from "../../../types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PROJECT_TYPE_COLORS,
  PROJECT_TYPE_LABELS,
  RESEARCH_STATUS_COLORS,
  RESEARCH_STATUS_LABELS,
  projectGaps,
  projectMetaParts,
} from "./projectTaxonomy";

export interface ProjectRowProps {
  project: Project;
  /** 1-based position within the rendered group. */
  position: number;
  /** Shown when the grouping doesn't already imply the type. */
  showType: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

interface DragProps {
  handleProps?: HTMLAttributes<HTMLElement>;
  style?: CSSProperties;
  isDragging?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
}

/**
 * Presentational row. Kept free of drag hooks so it can render outside a
 * DndContext — grouping by status, or sorting by title, has no meaningful
 * manual order to drag.
 */
export function ProjectRow({
  project,
  position,
  showType,
  onEdit,
  onDelete,
  deleting,
  handleProps,
  style,
  isDragging,
  setNodeRef,
}: ProjectRowProps & DragProps) {
  const meta = projectMetaParts(project);
  const gaps = projectGaps(project);
  const draggable = handleProps !== undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 bg-white",
        "border-b border-rule-soft last:border-b-0",
        isDragging && "relative z-10 rounded-lg shadow-lg opacity-90"
      )}
    >
      <span
        {...handleProps}
        aria-label={draggable ? `Reorder ${project.title}` : undefined}
        className={cn(
          "w-5 shrink-0 text-center text-faint text-xs tabular-nums select-none",
          draggable
            ? "cursor-grab active:cursor-grabbing hover:text-ink focus-visible:outline-none focus-visible:text-accent-dark"
            : "cursor-default"
        )}
      >
        {position}
      </span>

      <div className="w-9 h-9 shrink-0 rounded-md bg-rule-soft overflow-hidden">
        {project.image && (
          <img
            src={project.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-ink text-sm truncate">{project.title}</p>

          {project.status === "draft" && (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[11px] bg-[#FDF0D5] text-[#8A6A00]">
              Draft
            </span>
          )}

          {project.projectType === "research" && project.researchStatus && (
            <span
              className={cn(
                "shrink-0 px-1.5 py-0.5 rounded text-[11px]",
                RESEARCH_STATUS_COLORS[project.researchStatus]
              )}
            >
              {RESEARCH_STATUS_LABELS[project.researchStatus]}
            </span>
          )}

          {showType && (
            <span
              className={cn(
                "shrink-0 px-1.5 py-0.5 rounded text-[11px]",
                PROJECT_TYPE_COLORS[project.projectType]
              )}
            >
              {PROJECT_TYPE_LABELS[project.projectType]}
            </span>
          )}
        </div>

        <p className="text-faint text-xs truncate">
          {meta.join(" · ")}
          {meta.length > 0 && gaps.length > 0 && " · "}
          {gaps.length > 0 && (
            <span className="text-[#B4770B]">{gaps.slice(0, 2).join(" · ")}</span>
          )}
          {meta.length === 0 && gaps.length === 0 && "—"}
        </p>
      </div>

      {/* Kept mounted rather than hover-only so the row stays reachable by
          keyboard and on touch; it just recedes until you're on the row. */}
      <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(project)}
          className={buttonVariants({ variant: "ghost", size: "xs" })}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(project._id)}
          disabled={deleting}
          className={buttonVariants({ variant: "destructive", size: "xs" })}
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

/** Only rendered inside a DndContext + SortableContext. */
export function SortableProjectRow(props: ProjectRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.project._id });

  return (
    <ProjectRow
      {...props}
      setNodeRef={setNodeRef}
      handleProps={{ ...attributes, ...listeners }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      isDragging={isDragging}
    />
  );
}

export default ProjectRow;
