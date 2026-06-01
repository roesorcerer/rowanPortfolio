import type { EngagementSummary } from "../../../api/analytics";

interface Props {
  engagement: EngagementSummary;
}

const TYPE_COLORS: Record<string, string> = {
  featured: "bg-[#E1F5EE] text-[#0F6E56]",
  research: "bg-[#EEF0FF] text-[#3D4EBF]",
  practice: "bg-[#F5F0E1] text-[#8A6A00]",
};

function ProjectEngagement({ engagement }: Props) {
  const { projectEngagement, conversionRate, totalMessages } = engagement;
  const maxViews = projectEngagement[0]?.views ?? 1;

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[#2C2C2A] text-sm font-medium">
          Project engagement
        </h2>
        <span className="text-[#B4B2A9] text-xs">
          {conversionRate}% contact conversion
          <span className="ml-1 text-[#E8E6E1]">·</span>
          <span className="ml-1">
            {totalMessages} message{totalMessages !== 1 ? "s" : ""}
          </span>
        </span>
      </div>
      <p className="text-[#B4B2A9] text-xs mb-4">
        Modal opens · demo & GitHub clicks
      </p>

      {projectEngagement.length === 0 ? (
        <p className="text-[#B4B2A9] text-sm">
          No project interactions recorded yet.
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-[#F5F4F0]">
          {projectEngagement.map((p) => {
            const barPct = Math.round((p.views / maxViews) * 100);
            return (
              <div
                key={p.projectId}
                className="py-3 flex items-center gap-3"
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${TYPE_COLORS[p.projectType] ?? "bg-[#F5F4F0] text-[#888780]"}`}
                >
                  {p.projectType}
                </span>
                <span className="text-[#2C2C2A] text-xs truncate flex-1 min-w-0">
                  {p.projectTitle}
                </span>
                <div className="w-20 bg-[#F5F4F0] rounded-full h-1.5 overflow-hidden flex-shrink-0 hidden sm:block">
                  <div
                    className="h-full bg-[#1D9E75] rounded-full"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-[#888780]">
                  <span title="Modal opens">
                    {p.views} view{p.views !== 1 ? "s" : ""}
                  </span>
                  {p.demoClicks > 0 && (
                    <span className="text-[#0F6E56]" title="Demo link clicks">
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
