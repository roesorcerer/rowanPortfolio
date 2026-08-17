import { useState } from "react";
import type { Project } from "../../types";
import { ApiError } from "../../api/client";
import {
  useAllProjects,
  useDeleteProject,
  useReorderProjects,
} from "../../hooks/useProjects";
import LoadingPulse from "../LoadingPulse";
import ProjectForm from "./ProjectForm";
import ProjectGroupSection from "./projects/ProjectGroupSection";
import {
  PROJECT_TYPE_CHIP_LABELS,
  collectTags,
} from "./projects/projectTaxonomy";
import {
  useProjectListView,
  type ChipFilter,
  type GroupBy,
  type SortBy,
} from "./projects/useProjectListView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The admin list reads `GET /api/projects/all`, which is newer than the public
 * endpoint. A 404 there almost always means the running server predates the
 * route rather than that anything is genuinely missing — worth saying, because
 * the fix is "rebuild and restart the backend", not "re-add your projects".
 */
function describeLoadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "The server doesn't recognise /api/projects/all. It's probably running an older build — rebuild and restart the backend.";
    }
    if (error.status === 401) return "Your session has expired. Sign in again.";
    if (error.status === 403) return "This account isn't an admin.";
    if (error.status === 0) return "Couldn't reach the server. Is the backend running?";
    return error.message;
  }
  return "Something went wrong loading the project list.";
}

function chipLabel(filter: ChipFilter): string {
  if (filter === "all") return "All";
  if (filter === "featured") return "Featured";
  if (filter === "drafts") return "Drafts";
  return PROJECT_TYPE_CHIP_LABELS[filter];
}

function ProjectsTab() {
  // The admin list is the one place drafts are visible.
  const { data: projects, isLoading, error, refetch } = useAllProjects();
  const deleteProject = useDeleteProject();
  const reorder = useReorderProjects();

  // null when closed, undefined when creating, Project when editing.
  const [editing, setEditing] = useState<Project | null | undefined>(null);

  const view = useProjectListView(projects);
  const knownTags = collectTags(projects ?? []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject.mutateAsync(id);
    } catch {
      alert("Failed to delete project");
    }
  }

  const deletingId = deleteProject.isPending
    ? (deleteProject.variables ?? null)
    : null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ink text-xl font-medium tracking-tight">Projects</h1>
          <p className="text-faint text-sm mt-0.5">
            {view.total} total
            {view.drafts > 0 && ` · ${view.drafts} draft${view.drafts === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(undefined)}
          className={buttonVariants({ size: "sm" })}
        >
          + New project
        </button>
      </div>

      {isLoading && <LoadingPulse />}

      {/* An empty list and a failed request look identical otherwise, and
          "No projects yet" is a bad lie to tell when the request 404'd. */}
      {!isLoading && error && (
        <div className="bg-white border border-red-200 rounded-xl px-5 py-6">
          <p className="text-ink text-sm font-medium">Couldn't load projects</p>
          <p className="text-muted text-sm mt-1">{describeLoadError(error)}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="search"
              value={view.search}
              onChange={(e) => view.setSearch(e.target.value)}
              placeholder="Search title, category, tech…"
              aria-label="Search projects"
              className="flex-1 px-3 py-2 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors"
            />
            <select
              value={view.groupBy}
              onChange={(e) => view.setGroupBy(e.target.value as GroupBy)}
              aria-label="Group projects by"
              className={selectCls}
            >
              <option value="type">Group: type</option>
              <option value="status">Group: status</option>
              <option value="none">Group: none</option>
            </select>
            <select
              value={view.sortBy}
              onChange={(e) => view.setSortBy(e.target.value as SortBy)}
              aria-label="Sort projects by"
              className={selectCls}
            >
              <option value="order">Sort: order</option>
              <option value="updated">Sort: recently updated</option>
              <option value="title">Sort: title</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {view.chipCounts.map(({ filter, count }) => (
              <button
                key={filter}
                type="button"
                onClick={() => view.setChip(filter)}
                aria-pressed={view.chip === filter}
                className={cn(
                  "px-3 py-1 rounded-full border text-xs transition-colors",
                  view.chip === filter
                    ? "border-accent bg-accent-soft text-accent-dark"
                    : "border-rule text-muted hover:border-accent hover:text-accent-dark"
                )}
              >
                {chipLabel(filter)}{" "}
                <span className="text-faint tabular-nums">{count}</span>
              </button>
            ))}
          </div>

          {view.availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              <span className="text-faint text-xs mr-0.5">Filter by tag</span>
              {view.availableTags.map((tag) => {
                const active = view.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      view.setTags(
                        active
                          ? view.tags.filter((t) => t !== tag)
                          : [...view.tags, tag]
                      )
                    }
                    className={cn(
                      "px-2 py-0.5 rounded-md text-xs transition-colors",
                      active
                        ? "bg-accent-soft text-accent-dark"
                        : "text-faint hover:text-accent-dark"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {view.groups.length === 0 && (
            <div className="bg-white border border-rule rounded-xl px-5 py-10 text-center">
              <p className="text-muted text-sm">
                {view.total === 0
                  ? "No projects yet. Create your first one."
                  : "Nothing matches those filters."}
              </p>
              {view.isFiltered && (
                <button
                  type="button"
                  onClick={view.clearFilters}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-3")}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {view.groups.map((group) => (
            <ProjectGroupSection
              key={group.key}
              group={group}
              collapsed={view.collapsed[group.key] ?? false}
              onToggleCollapsed={() => view.toggleCollapsed(group.key)}
              // Grouping by type already says what each row is; any other
              // grouping doesn't, so the row carries its own badge.
              showType={view.groupBy !== "type" || group.key === "featured"}
              onEdit={setEditing}
              onDelete={handleDelete}
              deletingId={deletingId}
              onReorder={(ids) => reorder.mutate(ids)}
            />
          ))}

          {reorder.isError && (
            <p className="text-red-500 text-xs mt-2">
              Couldn't save the new order. The list has been put back.
            </p>
          )}
        </>
      )}

      {editing !== null && (
        <ProjectForm
          initialProject={editing ?? null}
          knownTags={knownTags}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

const selectCls =
  "px-3 py-2 bg-white border border-rule rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors";

export default ProjectsTab;
