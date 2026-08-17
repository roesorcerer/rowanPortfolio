import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Project } from "../../../types";
import { cn } from "@/lib/utils";
import { ProjectRow, SortableProjectRow } from "./ProjectRow";
import type { ProjectGroup } from "./useProjectListView";

/**
 * The new id order after dropping `activeId` onto `overId`, or null when the
 * drop is a no-op. Split out from the component because it's the part worth
 * asserting on — jsdom has no layout, so a real drag can't be simulated.
 */
export function reorderIds(
  ids: string[],
  activeId: string,
  overId: string
): string[] | null {
  if (activeId === overId) return null;

  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from === -1 || to === -1) return null;

  return arrayMove(ids, from, to);
}

interface ProjectGroupSectionProps {
  group: ProjectGroup;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Whether rows should carry their own type badge (grouping doesn't imply it). */
  showType: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  /** Receives the group's full id list in its new order. */
  onReorder: (ids: string[]) => void;
}

function ProjectGroupSection({
  group,
  collapsed,
  onToggleCollapsed,
  showType,
  onEdit,
  onDelete,
  deletingId,
  onReorder,
}: ProjectGroupSectionProps) {
  const sensors = useSensors(
    // A small activation distance keeps the number cell clickable-ish and
    // stops an accidental twitch from firing a reorder write.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = group.projects.map((p) => p._id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const next = reorderIds(ids, String(active.id), String(over.id));
    if (next) onReorder(next);
  }

  const renderRows = (Row: typeof ProjectRow | typeof SortableProjectRow) =>
    group.projects.map((project, index) => (
      <Row
        key={project._id}
        project={project}
        position={index + 1}
        showType={showType}
        onEdit={onEdit}
        onDelete={onDelete}
        deleting={deletingId === project._id}
      />
    ));

  return (
    <section className="mb-7">
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-ink text-sm hover:text-accent-dark transition-colors"
        >
          <span
            aria-hidden
            className={cn(
              "text-faint text-[10px] transition-transform",
              collapsed ? "-rotate-90" : "rotate-0"
            )}
          >
            ▼
          </span>
          {group.label}
          <span className="text-faint text-xs tabular-nums">
            {group.projects.length}
            {group.projects.length !== group.total && ` / ${group.total}`}
          </span>
        </button>

        <span className="flex-1 h-px bg-rule" />

        <span className="text-faint text-xs">
          {group.reorderable ? "drag to reorder" : ""}
        </span>
      </div>

      {!collapsed && (
        <div className="bg-white border border-rule rounded-xl overflow-hidden">
          {group.reorderable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {renderRows(SortableProjectRow)}
              </SortableContext>
            </DndContext>
          ) : (
            renderRows(ProjectRow)
          )}
        </div>
      )}
    </section>
  );
}

export default ProjectGroupSection;
