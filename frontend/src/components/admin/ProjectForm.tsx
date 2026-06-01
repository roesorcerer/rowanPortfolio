import { useState } from "react";
import type { Project, ProjectType } from "../../types";
import { ApiError } from "../../api/client";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { useProjectFormState } from "../../hooks/useProjectFormState";

interface ProjectFormProps {
  initialProject: Project | null; // null = new project
  onSaved: () => void;
  onCancel: () => void;
}

function ProjectForm({ initialProject, onSaved, onCancel }: ProjectFormProps) {
  const { form, setField, payload } = useProjectFormState(initialProject);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateProject();
  const update = useUpdateProject();
  const saving = create.isPending || update.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (initialProject) {
        await update.mutateAsync({ id: initialProject._id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save project");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-16 px-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-rule w-full max-w-[560px] p-7 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-ink text-base font-medium">
            {initialProject ? "Edit project" : "New project"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-faint hover:text-ink transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input
              required
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className={inputCls}
              placeholder="Project title"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" required>
              <input
                required
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className={inputCls}
                placeholder="e.g. Web App"
              />
            </Field>
            <Field label="Type" required>
              <select
                value={form.projectType}
                onChange={(e) =>
                  setField("projectType", e.target.value as ProjectType)
                }
                className={inputCls}
              >
                <option value="featured">Featured</option>
                <option value="research">Research</option>
                <option value="practice">Practice</option>
              </select>
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className={inputCls}
              placeholder="Short description"
            />
          </Field>

          <Field label="Image path" required>
            <input
              required
              value={form.image}
              onChange={(e) => setField("image", e.target.value)}
              className={inputCls}
              placeholder="/assets/myimage.png"
            />
          </Field>

          <Field label="Live demo link (optional)">
            <input
              value={form.link}
              onChange={(e) => setField("link", e.target.value)}
              className={inputCls}
              placeholder="https://my-project.example.com"
              type="url"
            />
          </Field>

          <Field label="GitHub link (optional)">
            <input
              value={form.githubLink}
              onChange={(e) => setField("githubLink", e.target.value)}
              className={inputCls}
              placeholder="https://github.com/user/repo"
              type="url"
            />
          </Field>

          <Field label="Development time (optional)">
            <input
              value={form.developmentTime}
              onChange={(e) => setField("developmentTime", e.target.value)}
              className={inputCls}
              placeholder="e.g. 3 weeks, 2 months"
            />
          </Field>

          <Field label="Technologies (comma-separated)">
            <input
              value={form.technologies}
              onChange={(e) => setField("technologies", e.target.value)}
              className={inputCls}
              placeholder="React, Node.js, MongoDB"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Display order">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setField("order", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Featured">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField("featured", e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-body text-sm">Mark as featured</span>
              </label>
            </Field>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-ink text-paper text-sm rounded-lg hover:bg-ink-deep transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : initialProject
                  ? "Save changes"
                  : "Create project"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-rule text-muted text-sm rounded-lg hover:border-ink hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-body text-xs mb-1.5">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default ProjectForm;
