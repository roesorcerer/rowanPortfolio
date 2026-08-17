import { useState } from "react";
import type { Project, ProjectStatus, ProjectType } from "../../types";
import { ApiError } from "../../api/client";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { useProjectFormState } from "../../hooks/useProjectFormState";
import TagInput from "./projects/TagInput";
import { PROJECT_TYPE_LABELS, PROJECT_TYPES } from "./projects/projectTaxonomy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectFormProps {
  initialProject: Project | null; // null = new project
  /** Tags already used elsewhere, offered as autocomplete. */
  knownTags: string[];
  onSaved: () => void;
  onCancel: () => void;
}

function ProjectForm({
  initialProject,
  knownTags,
  onSaved,
  onCancel,
}: ProjectFormProps) {
  const { form, setField, payload } = useProjectFormState(initialProject);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateProject();
  const update = useUpdateProject();
  const saving = create.isPending || update.isPending;

  const addMediaItem = () => {
    setField("media", [
      ...form.media,
      { type: "image", src: "", alt: "", poster: "", caption: "" },
    ]);
  };

  const removeMediaItem = (index: number) => {
    setField(
      "media",
      form.media.filter((_, i) => i !== index)
    );
  };

  const setMediaField = (
    index: number,
    key: "type" | "src" | "alt" | "poster" | "caption",
    value: string
  ) => {
    setField(
      "media",
      form.media.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const addCollaborator = () => {
    setField("collaborators", [
      ...form.collaborators,
      { name: "", role: "", socialLink: "", socialLabel: "" },
    ]);
  };

  const removeCollaborator = (index: number) => {
    setField(
      "collaborators",
      form.collaborators.filter((_, i) => i !== index)
    );
  };

  const setCollaboratorField = (
    index: number,
    key: "name" | "role" | "socialLink" | "socialLabel",
    value: string
  ) => {
    setField(
      "collaborators",
      form.collaborators.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type" required>
              <select
                value={form.projectType}
                onChange={(e) =>
                  setField("projectType", e.target.value as ProjectType)
                }
                className={inputCls}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PROJECT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Visibility" required>
              <select
                value={form.status}
                onChange={(e) =>
                  setField("status", e.target.value as ProjectStatus)
                }
                className={inputCls}
              >
                <option value="draft">Draft — hidden from the site</option>
                <option value="published">Published — live on the site</option>
              </select>
            </Field>
          </div>

          <Field label="Tags">
            <TagInput
              value={form.category}
              onChange={(tags) => setField("category", tags)}
              suggestions={knownTags}
              placeholder="e.g. Web App — press Enter to add"
            />
          </Field>

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

          <Field label="Related research link (optional)">
            <input
              value={form.relatedResearchLink}
              onChange={(e) => setField("relatedResearchLink", e.target.value)}
              className={inputCls}
              placeholder="https://paper-or-study.example.com"
              type="url"
            />
          </Field>

          {form.projectType === "research" && (
            <section className="border border-rule rounded-lg p-4 space-y-3">
              <h3 className="text-ink text-sm font-medium">Research metadata</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Status">
                  <select
                    value={form.researchStatus}
                    onChange={(e) =>
                      setField(
                        "researchStatus",
                        e.target.value as "" | "published" | "in-revision"
                      )
                    }
                    className={inputCls}
                  >
                    <option value="">Select status</option>
                    <option value="published">Published</option>
                    <option value="in-revision">In revision</option>
                  </select>
                </Field>

                <Field label="Publication year (optional)">
                  <input
                    value={form.researchYear}
                    onChange={(e) => setField("researchYear", e.target.value)}
                    className={inputCls}
                    placeholder="2026"
                    type="number"
                    min={1900}
                    max={2100}
                  />
                </Field>
              </div>

              <Field label="Venue (optional)">
                <input
                  value={form.researchVenue}
                  onChange={(e) => setField("researchVenue", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. CHI EA 2026"
                />
              </Field>

              <Field label="Original submission venue (optional)">
                <input
                  value={form.rejectedVenue}
                  onChange={(e) => setField("rejectedVenue", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. CSCW 2025"
                />
              </Field>

              <Field label="Improved into manuscript title (optional)">
                <input
                  value={form.improvedIntoTitle}
                  onChange={(e) => setField("improvedIntoTitle", e.target.value)}
                  className={inputCls}
                  placeholder="Revised manuscript title"
                />
              </Field>

              <Field label="Improved manuscript link (optional)">
                <input
                  value={form.improvedIntoLink}
                  onChange={(e) => setField("improvedIntoLink", e.target.value)}
                  className={inputCls}
                  placeholder="https://new-manuscript.example.com"
                  type="url"
                />
              </Field>

              <Field label="Improvement summary (optional)">
                <textarea
                  rows={3}
                  value={form.improvementSummary}
                  onChange={(e) => setField("improvementSummary", e.target.value)}
                  className={inputCls}
                  placeholder="How reviewer feedback was incorporated"
                />
              </Field>
            </section>
          )}

          {form.projectType === "practice" && (
            <section className="border border-rule rounded-lg p-4 space-y-3">
              <h3 className="text-ink text-sm font-medium">Practice learning context</h3>

              <Field label="What this practice project is for">
                <textarea
                  rows={3}
                  value={form.practicePurpose}
                  onChange={(e) => setField("practicePurpose", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Build fluency with distributed systems patterns through a small production-like service"
                />
              </Field>
            </section>
          )}

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

          <section className="border border-rule rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-ink text-sm font-medium">Media carousel</h3>
              <button
                type="button"
                onClick={addMediaItem}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                + Add media
              </button>
            </div>

            {form.media.length === 0 && (
              <p className="text-faint text-xs">No media items yet. Add images or videos for the modal carousel.</p>
            )}

            {form.media.map((item, index) => (
              <div key={`media-${index}`} className="border border-rule-soft rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body text-xs font-medium">Item {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeMediaItem(index)}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Type">
                    <select
                      value={item.type}
                      onChange={(e) => setMediaField(index, "type", e.target.value)}
                      className={inputCls}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </Field>
                  <Field label="Source URL/path" required>
                    <input
                      value={item.src}
                      onChange={(e) => setMediaField(index, "src", e.target.value)}
                      className={inputCls}
                      placeholder="/assets/project-shot.png or https://..."
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Alt text (optional)">
                    <input
                      value={item.alt}
                      onChange={(e) => setMediaField(index, "alt", e.target.value)}
                      className={inputCls}
                      placeholder="Describe this image"
                    />
                  </Field>
                  <Field label="Video poster (optional)">
                    <input
                      value={item.poster}
                      onChange={(e) => setMediaField(index, "poster", e.target.value)}
                      className={inputCls}
                      placeholder="/assets/video-poster.png"
                    />
                  </Field>
                </div>

                <Field label="Caption (optional)">
                  <input
                    value={item.caption}
                    onChange={(e) => setMediaField(index, "caption", e.target.value)}
                    className={inputCls}
                    placeholder="What this media item shows"
                  />
                </Field>
              </div>
            ))}
          </section>

          <section className="border border-rule rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-ink text-sm font-medium">Collaborators</h3>
              <button
                type="button"
                onClick={addCollaborator}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                + Add collaborator
              </button>
            </div>

            {form.collaborators.length === 0 && (
              <p className="text-faint text-xs">No collaborators listed. Add names and social links to show in the modal.</p>
            )}

            {form.collaborators.map((person, index) => (
              <div key={`collab-${index}`} className="border border-rule-soft rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body text-xs font-medium">Person {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(index)}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Name" required>
                    <input
                      value={person.name}
                      onChange={(e) => setCollaboratorField(index, "name", e.target.value)}
                      className={inputCls}
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label="Role (optional)">
                    <input
                      value={person.role}
                      onChange={(e) => setCollaboratorField(index, "role", e.target.value)}
                      className={inputCls}
                      placeholder="Designer"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Social link" required>
                    <input
                      value={person.socialLink}
                      onChange={(e) => setCollaboratorField(index, "socialLink", e.target.value)}
                      className={inputCls}
                      placeholder="https://linkedin.com/in/..."
                      type="url"
                    />
                  </Field>
                  <Field label="Social label (optional)">
                    <input
                      value={person.socialLabel}
                      onChange={(e) => setCollaboratorField(index, "socialLabel", e.target.value)}
                      className={inputCls}
                      placeholder="LinkedIn"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </section>

          {/* No display-order input: order is scoped to a display group and
              set by dragging rows in the list. */}
          <Field label="Featured">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-body text-sm">
                Promote to the Featured section
              </span>
            </label>
            <p className="text-faint text-xs mt-1.5">
              Promoting moves this project to the end of the Featured group; it
              still appears under {PROJECT_TYPE_LABELS[form.projectType]} on the
              site.
            </p>
          </Field>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={cn(buttonVariants({ size: "sm" }), "flex-1")}
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
              className={buttonVariants({ variant: "outline", size: "sm" })}
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
