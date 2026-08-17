import type { EngagementSummary } from "../../../api/analytics";
import { PROJECT_TYPE_COLORS } from "../projects/projectTaxonomy";

interface Props {
  engagement: EngagementSummary;
}

const TYPE_COLORS: Record<string, string> = {
  ...PROJECT_TYPE_COLORS,
  // Events recorded before projectType stopped meaning "promoted" still say
  // "featured". They're historical rows, so colour them rather than rewrite them.
  featured: "bg-accent-soft text-accent-dark",
};

function ProjectEngagement({ engagement }: Props) {
  const { projectEngagement, conversionRate, totalMessages } = engagement;
  const maxViews = projectEngagement[0]?.views ?? 1;

  return (
    <div className="bg-white border border-rule rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-ink text-sm font-medium">
          Project engagement
        </h2>
        <span className="text-faint text-xs">
          {conversionRate}% contact conversion
          <span className="ml-1 text-rule">·</span>
          <span className="ml-1">
            {totalMessages} message{totalMessages !== 1 ? "s" : ""}
          </span>
        </span>
      </div>
      <p className="text-faint text-xs mb-4">
        Modal opens · demo & GitHub clicks
      </p>

      {projectEngagement.length === 0 ? (
        <p className="text-faint text-sm">
          No project interactions recorded yet.
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-rule-soft">
          {projectEngagement.map((p) => {
            const barPct = Math.round((p.views / maxViews) * 100);
            return (
              <div
                key={p.projectId}
                className="py-3 flex items-center gap-3"
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${TYPE_COLORS[p.projectType] ?? "bg-rule-soft text-muted"}`}
                >
                  {p.projectType}
                </span>
                <span className="text-ink text-xs truncate flex-1 min-w-0">
                  {p.projectTitle}
                </span>
                <div className="w-20 bg-rule-soft rounded-full h-1.5 overflow-hidden flex-shrink-0 hidden sm:block">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted">
                  <span title="Modal opens">
                    {p.views} view{p.views !== 1 ? "s" : ""}
                  </span>
                  {p.demoClicks > 0 && (
                    <span className="text-accent-dark" title="Demo link clicks">
                      ↗ {p.demoClicks}
                    </span>
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
  );
}

export default ProjectEngagement;
