import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import type { Project, ProjectType } from "../types";
import api from "../api/client";

// ---- Types for analytics + contact submissions ----
interface AnalyticsSummary {
  totalViews: number;
  todayViews: number;
  last7DaysViews: number;
  byPath: { path: string; count: number }[];
  byDay: { date: string; count: number }[];
  byReferrer: { source: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number };
  recentVisits: { path: string; source: string; device: string; createdAt: string }[];
  byHour: { hour: number; count: number }[];
}

interface ProjectEngagement {
  projectId: string;
  projectTitle: string;
  projectType: string;
  views: number;
  demoClicks: number;
  githubClicks: number;
}

interface EngagementSummary {
  projectEngagement: ProjectEngagement[];
  conversionRate: number;
  totalMessages: number;
  totalPageViews: number;
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
  githubLink: "",
  developmentTime: "",
  technologies: "",
  projectType: "practice" as ProjectType,
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
  const [engagement, setEngagement] = useState<EngagementSummary | null>(null);

  // Contact messages
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "analytics" && !analytics) {
      setAnalyticsLoading(true);
      Promise.all([
        api.get<{ success: boolean; data: AnalyticsSummary }>("/api/analytics/summary"),
        api.get<{ success: boolean; data: EngagementSummary }>("/api/analytics/engagement"),
      ])
        .then(([summaryRes, engagementRes]) => {
          setAnalytics(summaryRes.data.data);
          setEngagement(engagementRes.data.data);
        })
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
      githubLink: project.githubLink ?? "",
      developmentTime: project.developmentTime ?? "",
      technologies: project.technologies.join(", "),
      projectType: project.projectType,
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
      githubLink: form.githubLink || undefined,
      developmentTime: form.developmentTime || undefined,
      technologies: form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      projectType: form.projectType,
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
                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Today", value: analytics.todayViews },
                    { label: "Last 7 days", value: analytics.last7DaysViews },
                    { label: "Last 30 days", value: analytics.byDay.reduce((s, d) => s + d.count, 0) },
                    { label: "All-time", value: analytics.totalViews },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white border border-[#E8E6E1] rounded-xl p-5">
                      <p className="text-[#888780] text-xs uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-[#2C2C2A] text-2xl font-semibold">{value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* ── Project engagement ── */}
                {engagement && (
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-[#2C2C2A] text-sm font-medium">Project engagement</h2>
                      <span className="text-[#B4B2A9] text-xs">
                        {engagement.conversionRate}% contact conversion
                        <span className="ml-1 text-[#E8E6E1]">·</span>
                        <span className="ml-1">{engagement.totalMessages} message{engagement.totalMessages !== 1 ? "s" : ""}</span>
                      </span>
                    </div>
                    <p className="text-[#B4B2A9] text-xs mb-4">Modal opens · demo & GitHub clicks</p>
                    {engagement.projectEngagement.length === 0 ? (
                      <p className="text-[#B4B2A9] text-sm">No project interactions recorded yet.</p>
                    ) : (
                      <div className="space-y-0 divide-y divide-[#F5F4F0]">
                        {engagement.projectEngagement.map((p) => {
                          const maxViews = engagement.projectEngagement[0]?.views ?? 1;
                          const barPct = Math.round((p.views / maxViews) * 100);
                          const typeColors: Record<string, string> = {
                            featured: "bg-[#E1F5EE] text-[#0F6E56]",
                            research: "bg-[#EEF0FF] text-[#3D4EBF]",
                            practice: "bg-[#F5F0E1] text-[#8A6A00]",
                          };
                          return (
                            <div key={p.projectId} className="py-3 flex items-center gap-3">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${typeColors[p.projectType] ?? "bg-[#F5F4F0] text-[#888780]"}`}>
                                {p.projectType}
                              </span>
                              <span className="text-[#2C2C2A] text-xs truncate flex-1 min-w-0">{p.projectTitle}</span>
                              <div className="w-20 bg-[#F5F4F0] rounded-full h-1.5 overflow-hidden flex-shrink-0 hidden sm:block">
                                <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${barPct}%` }} />
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 text-xs text-[#888780]">
                                <span title="Modal opens">{p.views} view{p.views !== 1 ? "s" : ""}</span>
                                {p.demoClicks > 0 && (
                                  <span className="text-[#0F6E56]" title="Demo link clicks">↗ {p.demoClicks}</span>
                                )}
                                {p.githubClicks > 0 && (
                                  <span title="GitHub link clicks">⌥ {p.githubClicks}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Traffic sources + Device breakdown ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Traffic sources */}
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
                    <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Traffic sources</h2>
                    {analytics.byReferrer.length === 0 ? (
                      <p className="text-[#B4B2A9] text-sm">No referrer data yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.byReferrer.map((row) => {
                          const total = analytics.byReferrer.reduce((s, r) => s + r.count, 0);
                          const pct = Math.round((row.count / (total || 1)) * 100);
                          return (
                            <div key={row.source} className="flex items-center gap-3">
                              <span className="text-[#2C2C2A] text-xs w-24 truncate flex-shrink-0">{row.source}</span>
                              <div className="flex-1 bg-[#F5F4F0] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-[#1D9E75] rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[#B4B2A9] text-xs w-8 text-right flex-shrink-0">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Device breakdown */}
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
                    <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Devices</h2>
                    {(() => {
                      const { mobile, desktop } = analytics.deviceBreakdown;
                      const total = mobile + desktop || 1;
                      const mobilePct = Math.round((mobile / total) * 100);
                      const desktopPct = 100 - mobilePct;
                      return (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-[#2C2C2A]">Desktop</span>
                              <span className="text-[#888780]">{desktop.toLocaleString()} ({desktopPct}%)</span>
                            </div>
                            <div className="bg-[#F5F4F0] rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-[#2C2C2A] rounded-full" style={{ width: `${desktopPct}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-[#2C2C2A]">Mobile</span>
                              <span className="text-[#888780]">{mobile.toLocaleString()} ({mobilePct}%)</span>
                            </div>
                            <div className="bg-[#F5F4F0] rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${mobilePct}%` }} />
                            </div>
                          </div>
                          <p className="text-[#B4B2A9] text-xs pt-1">{total.toLocaleString()} total views tracked</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ── 30-day trend + Hourly activity ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Daily trend */}
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
                    <h2 className="text-[#2C2C2A] text-sm font-medium mb-1">30-day trend</h2>
                    <p className="text-[#B4B2A9] text-xs mb-4">Page views per day</p>
                    {analytics.byDay.length === 0 ? (
                      <p className="text-[#B4B2A9] text-sm">No data yet.</p>
                    ) : (
                      <div className="flex items-end gap-0.5 h-24">
                        {analytics.byDay.map((d) => {
                          const maxCount = Math.max(...analytics.byDay.map((x) => x.count), 1);
                          const heightPct = (d.count / maxCount) * 100;
                          const label = new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
                          return (
                            <div
                              key={d.date}
                              title={`${label}: ${d.count} view${d.count !== 1 ? "s" : ""}`}
                              className="flex-1 bg-[#1D9E75] rounded-sm hover:bg-[#0F6E56] transition-colors cursor-default"
                              style={{ height: `${heightPct}%`, minHeight: 3 }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hourly activity — shows when people browse (recruiter hours) */}
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
                    <h2 className="text-[#2C2C2A] text-sm font-medium mb-1">Activity by hour</h2>
                    <p className="text-[#B4B2A9] text-xs mb-4">Last 7 days · local time</p>
                    {analytics.byHour.length === 0 ? (
                      <p className="text-[#B4B2A9] text-sm">No data yet.</p>
                    ) : (
                      <>
                        <div className="flex items-end gap-0.5 h-24">
                          {Array.from({ length: 24 }, (_, h) => {
                            const entry = analytics.byHour.find((x) => x.hour === h);
                            const count = entry?.count ?? 0;
                            const maxCount = Math.max(...analytics.byHour.map((x) => x.count), 1);
                            const heightPct = (count / maxCount) * 100;
                            const label = `${h.toString().padStart(2, "0")}:00 – ${count} view${count !== 1 ? "s" : ""}`;
                            return (
                              <div
                                key={h}
                                title={label}
                                className={`flex-1 rounded-sm transition-colors cursor-default ${count > 0 ? "bg-[#1D9E75] hover:bg-[#0F6E56]" : "bg-[#F5F4F0]"}`}
                                style={{ height: count > 0 ? `${heightPct}%` : "8px", minHeight: count > 0 ? 3 : 8 }}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[#B4B2A9] text-[10px]">12am</span>
                          <span className="text-[#B4B2A9] text-[10px]">6am</span>
                          <span className="text-[#B4B2A9] text-[10px]">12pm</span>
                          <span className="text-[#B4B2A9] text-[10px]">6pm</span>
                          <span className="text-[#B4B2A9] text-[10px]">11pm</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Recent visits feed ── */}
                <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
                  <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Recent visits</h2>
                  {analytics.recentVisits.length === 0 ? (
                    <p className="text-[#B4B2A9] text-sm">No visits recorded yet.</p>
                  ) : (
                    <div className="space-y-0 divide-y divide-[#F5F4F0]">
                      {analytics.recentVisits.map((visit, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0"
                            style={visit.device === "mobile"
                              ? { background: "#E1F5EE", color: "#0F6E56", borderColor: "#C3EBD8" }
                              : { background: "#F5F4F0", color: "#5F5E5A", borderColor: "#E8E6E1" }}
                          >
                            {visit.device === "mobile" ? "Mobile" : "Desktop"}
                          </span>
                          <span className="text-[#2C2C2A] text-xs font-mono truncate flex-1">{visit.path}</span>
                          <span className="text-[#B4B2A9] text-xs flex-shrink-0 hidden sm:block">{visit.source}</span>
                          <span className="text-[#B4B2A9] text-xs flex-shrink-0">
                            {new Date(visit.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))}
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

              <Field label="Live demo link (optional)">
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className={inputCls}
                  placeholder="https://my-project.example.com"
                  type="url"
                />
              </Field>

              <Field label="GitHub link (optional)">
                <input
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  className={inputCls}
                  placeholder="https://github.com/user/repo"
                  type="url"
                />
              </Field>

              <Field label="Development time (optional)">
                <input
                  value={form.developmentTime}
                  onChange={(e) => setForm({ ...form, developmentTime: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 3 weeks, 2 months"
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
