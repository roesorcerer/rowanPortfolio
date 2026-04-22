import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import type { Project, ProjectType } from "../types";
import api from "../api/client";

// ---- Types for analytics + contact submissions ----
interface AnalyticsSummary {
  totalViews: number;
  byPath: { path: string; count: number }[];
  byDay: { date: string; count: number }[];
}

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

type AdminTab = "projects" | "analytics" | "messages";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  featured: "Featured",
  research: "Research",
  practice: "Practice",
};

const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  featured: "bg-[#E1F5EE] text-[#0F6E56]",
  research: "bg-[#EEF0FF] text-[#3D4EBF]",
  practice: "bg-[#F5F0E1] text-[#8A6A00]",
};

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  image: "",
  link: "",
  technologies: "",
  projectType: "practice" as ProjectType,
  featured: false,
  order: 0,
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { data: projects, isLoading, refetch } = useProjects();

  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Contact messages
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "analytics" && !analytics) {
      setAnalyticsLoading(true);
      api
        .get<{ success: boolean; data: AnalyticsSummary }>("/api/analytics/summary")
        .then((r) => setAnalytics(r.data.data))
        .catch(() => undefined)
        .finally(() => setAnalyticsLoading(false));
    }
    if (activeTab === "messages" && messages.length === 0) {
      setMessagesLoading(true);
      api
        .get<{ success: boolean; data: ContactSubmission[] }>("/api/contact/submissions")
        .then((r) => setMessages(r.data.data))
        .catch(() => undefined)
        .finally(() => setMessagesLoading(false));
    }
  }, [activeTab]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/admin/login");
  }

  function openNew() {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      image: project.image,
      link: project.link ?? "",
      technologies: project.technologies.join(", "),
      projectType: project.projectType,
      featured: project.featured,
      order: project.order,
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProject(null);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      image: form.image,
      link: form.link || undefined,
      technologies: form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      projectType: form.projectType,
      featured: form.featured,
      order: form.order,
    };

    try {
      if (editingProject) {
        await api.put(`/api/projects/${editingProject._id}`, payload);
      } else {
        await api.post("/api/projects", payload);
      }
      await refetch();
      closeForm();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to save project";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/projects/${id}`);
      await refetch();
    } catch {
      alert("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Top bar */}
      <div className="px-6 py-4 bg-white border-b border-[#E8E6E1] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/justme.jpg"
            alt="Rowan Stratton"
            className="w-7 h-9 object-cover rounded-[50%] border border-[#E8E6E1]"
          />
          <span className="text-[#2C2C2A] text-sm font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors">
            ← View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-6 bg-white border-b border-[#E8E6E1]">
        <div className="flex gap-1 max-w-[900px] mx-auto">
          {(["projects", "analytics", "messages"] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#1D9E75] text-[#0F6E56] font-medium"
                  : "border-transparent text-[#888780] hover:text-[#2C2C2A]"
              }`}
            >
              {tab}
              {tab === "messages" && messages.length > 0 && (
                <span className="ml-1.5 text-xs bg-[#E1F5EE] text-[#0F6E56] px-1.5 py-0.5 rounded-full">
                  {messages.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-10">

        {/* ---- PROJECTS TAB ---- */}
        {activeTab === "projects" && (<>
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#2C2C2A] text-xl font-medium tracking-tight">Projects</h1>
            <p className="text-[#B4B2A9] text-sm mt-0.5">{projects?.length ?? 0} total</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            + New project
          </button>
        </div>

        {/* Project list */}
        {isLoading && (
          <div className="flex items-center gap-2 py-10">
            <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
            <span className="text-[#888780] text-sm">Loading…</span>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-2">
            {projects?.map((project) => (
              <div
                key={project._id}
                className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#1a1a1a] overflow-hidden">
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
                    <span className="text-[#B4B2A9] text-xs">#{project.order}</span>
                  </div>
                  <p className="text-[#2C2C2A] text-sm font-medium truncate">{project.title}</p>
                  <p className="text-[#B4B2A9] text-xs truncate">{project.category}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    className="text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project._id)}
                    disabled={deletingId === project._id}
                    className="text-[#888780] text-sm hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    {deletingId === project._id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>)}

        {/* ---- ANALYTICS TAB ---- */}
        {activeTab === "analytics" && (
          <>
            <h1 className="text-[#2C2C2A] text-xl font-medium tracking-tight mb-8">Analytics</h1>

            {analyticsLoading && (
              <div className="flex items-center gap-2 py-10">
                <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
                <span className="text-[#888780] text-sm">Loading…</span>
              </div>
            )}

            {!analyticsLoading && analytics && (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
                    <p className="text-[#888780] text-xs uppercase tracking-wide mb-1">All-time views</p>
                    <p className="text-[#2C2C2A] text-3xl font-semibold">{analytics.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
                    <p className="text-[#888780] text-xs uppercase tracking-wide mb-1">Last 30 days</p>
                    <p className="text-[#2C2C2A] text-3xl font-semibold">
                      {analytics.byDay.reduce((s, d) => s + d.count, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
                    <p className="text-[#888780] text-xs uppercase tracking-wide mb-1">Unique pages tracked</p>
                    <p className="text-[#2C2C2A] text-3xl font-semibold">{analytics.byPath.length}</p>
                  </div>
                </div>

                {/* Top pages */}
                <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 mb-6">
                  <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Top pages</h2>
                  <div className="space-y-3">
                    {analytics.byPath.map((row) => {
                      const max = analytics.byPath[0]?.count ?? 1;
                      const pct = Math.round((row.count / max) * 100);
                      return (
                        <div key={row.path} className="flex items-center gap-3">
                          <span className="text-[#2C2C2A] text-sm w-32 truncate flex-shrink-0">{row.path}</span>
                          <div className="flex-1 bg-[#F5F4F0] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-[#1D9E75] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[#888780] text-xs w-10 text-right flex-shrink-0">
                            {row.count.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily views bar chart */}
                <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
                  <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Views per day (last 30 days)</h2>
                  {analytics.byDay.length === 0 ? (
                    <p className="text-[#B4B2A9] text-sm">No data yet.</p>
                  ) : (
                    <div className="flex items-end gap-1 h-28">
                      {analytics.byDay.map((d) => {
                        const maxCount = Math.max(...analytics.byDay.map((x) => x.count), 1);
                        const heightPct = (d.count / maxCount) * 100;
                        return (
                          <div
                            key={d.date}
                            title={`${d.date}: ${d.count}`}
                            className="flex-1 bg-[#1D9E75] rounded-sm hover:bg-[#0F6E56] transition-colors cursor-default"
                            style={{ height: `${heightPct}%`, minHeight: 4 }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ---- MESSAGES TAB ---- */}
        {activeTab === "messages" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-[#2C2C2A] text-xl font-medium tracking-tight">Contact messages</h1>
              <span className="text-[#888780] text-sm">{messages.length} total</span>
            </div>

            {messagesLoading && (
              <div className="flex items-center gap-2 py-10">
                <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
                <span className="text-[#888780] text-sm">Loading…</span>
              </div>
            )}

            {!messagesLoading && messages.length === 0 && (
              <p className="text-[#B4B2A9] text-sm py-10">No messages yet.</p>
            )}

            {!messagesLoading && messages.length > 0 && (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isExpanded = expandedMessage === msg._id;
                  return (
                    <div
                      key={msg._id}
                      className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-[#FAFAF8] transition-colors"
                        onClick={() => setExpandedMessage(isExpanded ? null : msg._id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[#2C2C2A] text-sm font-medium">{msg.name}</span>
                            <span className="text-[#B4B2A9] text-xs">·</span>
                            <span className="text-[#888780] text-xs">{msg.email}</span>
                          </div>
                          <p className="text-[#5F5E5A] text-sm truncate">{msg.subject}</p>
                          {!isExpanded && (
                            <p className="text-[#B4B2A9] text-xs truncate mt-0.5">{msg.message}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                          <span className="text-[#B4B2A9] text-xs">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[#B4B2A9] text-xs">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-[#F0EEE9]">
                          <p className="text-[#2C2C2A] text-sm whitespace-pre-wrap pt-4">{msg.message}</p>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="inline-block mt-3 text-xs text-[#0F6E56] hover:underline"
                          >
                            Reply via email →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>

      {/* Edit / Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-16 px-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E8E6E1] w-full max-w-[560px] p-7 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#2C2C2A] text-base font-medium">
                {editingProject ? "Edit project" : "New project"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-[#B4B2A9] hover:text-[#2C2C2A] transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Title" required>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                  placeholder="Project title"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" required>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Web App"
                  />
                </Field>
                <Field label="Type" required>
                  <select
                    value={form.projectType}
                    onChange={(e) =>
                      setForm({ ...form, projectType: e.target.value as ProjectType })
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
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls}
                  placeholder="Short description"
                />
              </Field>

              <Field label="Image path" required>
                <input
                  required
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className={inputCls}
                  placeholder="/assets/myimage.png"
                />
              </Field>

              <Field label="Link (optional)">
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className={inputCls}
                  placeholder="https://..."
                  type="url"
                />
              </Field>

              <Field label="Technologies (comma-separated)">
                <input
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  className={inputCls}
                  placeholder="React, Node.js, MongoDB"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Display order">
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Featured">
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 accent-[#1D9E75]"
                    />
                    <span className="text-[#5F5E5A] text-sm">Mark as featured</span>
                  </label>
                </Field>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingProject ? "Save changes" : "Create project"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 border border-[#E8E6E1] text-[#888780] text-sm rounded-lg hover:border-[#2C2C2A] hover:text-[#2C2C2A] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#1D9E75] transition-colors";

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
      <label className="block text-[#5F5E5A] text-xs mb-1.5">
        {label}
        {required && <span className="text-[#1D9E75] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default AdminDashboard;
