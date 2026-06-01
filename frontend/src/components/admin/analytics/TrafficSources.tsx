import type { AnalyticsSummary } from "../../../api/analytics";

type Referrer = AnalyticsSummary["byReferrer"][number];

interface Props {
  byReferrer: Referrer[];
}

function TrafficSources({ byReferrer }: Props) {
  const total = byReferrer.reduce((s, r) => s + r.count, 0);

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
      <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">
        Traffic sources
      </h2>
      {byReferrer.length === 0 ? (
        <p className="text-[#B4B2A9] text-sm">No referrer data yet.</p>
      ) : (
        <div className="space-y-3">
          {byReferrer.map((row) => {
            const pct = Math.round((row.count / (total || 1)) * 100);
            return (
              <div key={row.source} className="flex items-center gap-3">
                <span className="text-[#2C2C2A] text-xs w-24 truncate flex-shrink-0">
                  {row.source}
                </span>
                <div className="flex-1 bg-[#F5F4F0] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#1D9E75] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[#B4B2A9] text-xs w-8 text-right flex-shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TrafficSources;
