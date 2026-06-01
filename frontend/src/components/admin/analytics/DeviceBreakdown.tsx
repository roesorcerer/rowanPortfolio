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
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
      <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Devices</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#2C2C2A]">Desktop</span>
            <span className="text-[#888780]">
              {desktop.toLocaleString()} ({desktopPct}%)
            </span>
          </div>
          <div className="bg-[#F5F4F0] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#2C2C2A] rounded-full"
              style={{ width: `${desktopPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#2C2C2A]">Mobile</span>
            <span className="text-[#888780]">
              {mobile.toLocaleString()} ({mobilePct}%)
            </span>
          </div>
          <div className="bg-[#F5F4F0] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#1D9E75] rounded-full"
              style={{ width: `${mobilePct}%` }}
            />
          </div>
        </div>
        <p className="text-[#B4B2A9] text-xs pt-1">
          {total.toLocaleString()} total views tracked
        </p>
      </div>
    </div>
  );
}

export default DeviceBreakdown;
