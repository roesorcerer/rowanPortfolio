import type { AnalyticsSummary } from "../../../api/analytics";

interface Props {
  breakdown: AnalyticsSummary["deviceBreakdown"];
}

function DeviceBreakdown({ breakdown }: Props) {
  const { mobile, desktop } = breakdown;
  const total = mobile + desktop || 1;
  const mobilePct = Math.round((mobile / total) * 100);
  const desktopPct = 100 - mobilePct;

  return (
    <div className="bg-white border border-rule rounded-xl p-6">
      <h2 className="text-ink text-sm font-medium mb-4">Devices</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-ink">Desktop</span>
            <span className="text-muted">
              {desktop.toLocaleString()} ({desktopPct}%)
            </span>
          </div>
          <div className="bg-rule-soft rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-ink rounded-full"
              style={{ width: `${desktopPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-ink">Mobile</span>
            <span className="text-muted">
              {mobile.toLocaleString()} ({mobilePct}%)
            </span>
          </div>
          <div className="bg-rule-soft rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${mobilePct}%` }}
            />
          </div>
        </div>
        <p className="text-faint text-xs pt-1">
          {total.toLocaleString()} total views tracked
        </p>
      </div>
    </div>
  );
}

export default DeviceBreakdown;
