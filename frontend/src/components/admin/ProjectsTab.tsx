import { useState } from "react";
import type { Project, ProjectType } from "../../types";
import { useDeleteProject, useProjects } from "../../hooks/useProjects";
import LoadingPulse from "../LoadingPulse";
import ProjectForm from "./ProjectForm";
import { buttonVariants } from "@/components/ui/button";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  featured: "Featured",
  research: "Research",
  practice: "Practice",
};

const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  featured: "bg-accent-soft text-accent-dark",
  research: "bg-[#EEF0FF] text-[#3D4EBF]",
  practice: "bg-[#F5F0E1] text-[#8A6A00]",
};

function ProjectsTab() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  // null when closed, undefined when creating, Project when editing.
  const [editing, setEditing] = useState<Project | null | undefined>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject.mutateAsync(id);
    } catch {
      alert("Failed to delete project");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-ink text-xl font-medium tracking-tight">
            Projects
          </h1>
          <p className="text-faint text-sm mt-0.5">
            {projects?.length ?? 0} total
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

      {!isLoading && (
        <div className="space-y-2">
          {projects?.map((project) => (
            <div
              key={project._id}
              className="bg-white border border-rule rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-ink-deep overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded ${PROJECT_TYPE_COLORS[project.projectType]}`}
                  >
                    {PROJECT_TYPE_LABELS[project.projectType]}
                  </span>
                  <span className="text-faint text-xs">#{project.order}</span>
                </div>
                <p className="text-ink text-sm font-medium truncate">
                  {project.title}
                </p>
                <p className="text-faint text-xs truncate">{project.category}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(project)}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project._id)}
                  disabled={
                    deleteProject.isPending &&
                    deleteProject.variables === project._id
                  }
                  className={buttonVariants({ variant: "destructive", size: "sm" })}
                >
                  {deleteProject.isPending &&
                  deleteProject.variables === project._id
                    ? "…"
                    : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ProjectForm
          initialProject={editing ?? null}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

export default ProjectsTab;
