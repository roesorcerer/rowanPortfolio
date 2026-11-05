import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAnalytics } from "../analytics";
import { useProjects } from "../hooks/useProjects";
import { hasCaseStudy, projectPath, usableLinks } from "../lib/projectLinks";
import { researchStatusOf } from "../components/project/projectFacts";
import type { Project, ProjectType } from "../types";
import Sprite from "./Sprite";

type TabKey = "featured" | ProjectType;

const TABS: [TabKey, string][] = [
  ["featured", "Featured"],
  ["product", "Product"],
  ["research", "Research"],
  ["practice", "Practice"],
  ["gameDev", "Game Dev"],
  ["art", "Art"],
];

const SPRITE_FOR: Record<ProjectType, string> = {
  product: "chest",
  research: "tome",
  practice: "robot",
  gameDev: "bug",
  art: "void",
};

const inTab = (project: Project, tab: TabKey) =>
  tab === "featured" ? project.featured : project.projectType === tab;

/** A skill is only useful as a filter if more than one project shares it. */
function sharedSkills(projects: Project[]) {
  const counts = new Map<string, number>();
  projects.forEach((project) =>
    (project.category ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
  );
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function WorkCard({ project }: { project: Project }) {
  const analytics = useAnalytics();
  const source = usableLinks(project).find((link) => link.kind === "github");
  const research = researchStatusOf(project);

  return (
    <article className="work-card">
      <div className="thumb">
        {project.image ? (
          <img src={project.image} alt="" loading="lazy" />
        ) : (
          <Sprite name={SPRITE_FOR[project.projectType]} className="card-sprite" />
        )}
      </div>
      <div className="work-body">
        <h3 className="d work-title">
          <Link to={projectPath(project)}>{project.title}</Link>
        </h3>
        {research === "in-revision" && <p className="work-note">Developing manuscript</p>}
        <p className="work-text">{project.description}</p>
        {(project.category ?? []).length > 0 && (
          <p className="work-tags">{project.category.join(", ")}</p>
        )}
        <p className="work-links">
          <Link className="link" to={projectPath(project)}>
            {hasCaseStudy(project.caseStudy) ? "Read the case study" : "View project"}
          </Link>
          {source && (
            <a
              className="link"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.linkClick(project, source.kind)}
            >
              View source
            </a>
          )}
        </p>
      </div>
    </article>
  );
}

function WorkSection() {
  const { data: projects, isLoading, error } = useProjects();
  const [tab, setTab] = useState<TabKey>("featured");
  const [skill, setSkill] = useState<string | null>(null);

  const skills = useMemo(() => sharedSkills(projects ?? []), [projects]);
  const shown = (projects ?? []).filter((project) =>
    skill ? (project.category ?? []).includes(skill) : inTab(project, tab)
  );
  const tabs = TABS.map(([key, label]) => ({
    key,
    label,
    count: (projects ?? []).filter((project) => inTab(project, key)).length,
  })).filter((entry) => entry.count > 0);

  const status = skill
    ? `${shown.length} ${shown.length === 1 ? "project uses" : "projects use"} ${skill}. Select it again to clear.`
    : `${shown.length} ${shown.length === 1 ? "project" : "projects"}`;

  return (
    <section id="work" className="sec" aria-labelledby="work-h">
      {/* Older links and the resume point at #projects. */}
      <span id="projects" />
      <h2 id="work-h" className="d strip">
        Work
      </h2>
      <div className="sec-body stack">
        {isLoading && <p>Loading projects...</p>}

        {error && (
          <p>
            Projects could not be loaded. Refresh the page, or see the code on{" "}
            <a className="link" href="https://github.com/roesorcerer">
              GitHub
            </a>
            .
          </p>
        )}

        {projects && (
          <>
            <div className="tabs" role="group" aria-label="Project type">
              {tabs.map((entry) => {
                const on = !skill && tab === entry.key;
                return (
                  <button
                    key={entry.key}
                    className={on ? "tab on" : "tab"}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setTab(entry.key);
                      setSkill(null);
                    }}
                  >
                    {entry.label} {entry.count}
                  </button>
                );
              })}
            </div>

            {skills.length > 0 && (
              <div>
                <h3 className="plain-h">Find projects by skill</h3>
                <div className="skills" role="group" aria-label="Filter by skill">
                  {skills.map(([name, count]) => (
                    <button
                      key={name}
                      className={skill === name ? "skill on" : "skill"}
                      type="button"
                      aria-pressed={skill === name}
                      onClick={() => setSkill(skill === name ? null : name)}
                    >
                      {name} {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="work-status" aria-live="polite">
              {status}
            </p>

            <div className="work-grid">
              {shown.map((project) => (
                <WorkCard key={project._id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default WorkSection;
