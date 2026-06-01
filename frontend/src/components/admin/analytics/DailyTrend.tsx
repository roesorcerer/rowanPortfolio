import type { AnalyticsSummary } from "../../../api/analytics";

type Day = AnalyticsSummary["byDay"][number];

interface Props {
  days: Day[];
}

function DailyTrend({ days }: Props) {
  const maxCount = Math.max(...days.map((x) => x.count), 1);

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
      <h2 className="text-[#2C2C2A] text-sm font-medium mb-1">30-day trend</h2>
      <p className="text-[#B4B2A9] text-xs mb-4">Page views per day</p>
      {days.length === 0 ? (
        <p className="text-[#B4B2A9] text-sm">No data yet.</p>
      ) : (
        <div className="flex items-end gap-0.5 h-24">
          {days.map((d) => {
            const heightPct = (d.count / maxCount) * 100;
            const label = new Date(d.date + "T00:00:00").toLocaleDateString(
              undefined,
              { month: "short", day: "numeric" }
            );
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
  );
}

export default DailyTrend;
