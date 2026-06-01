import type { AnalyticsSummary } from "../../../api/analytics";

type Hour = AnalyticsSummary["byHour"][number];

interface Props {
  hours: Hour[];
}

function HourlyActivity({ hours }: Props) {
  const maxCount = Math.max(...hours.map((x) => x.count), 1);

  return (
    <div className="bg-white border border-rule rounded-xl p-6">
      <h2 className="text-ink text-sm font-medium mb-1">
        Activity by hour
      </h2>
      <p className="text-faint text-xs mb-4">Last 7 days · local time</p>
      {hours.length === 0 ? (
        <p className="text-faint text-sm">No data yet.</p>
      ) : (
        <>
          <div className="flex items-end gap-0.5 h-24">
            {Array.from({ length: 24 }, (_, h) => {
              const entry = hours.find((x) => x.hour === h);
              const count = entry?.count ?? 0;
              const heightPct = (count / maxCount) * 100;
              const label = `${h.toString().padStart(2, "0")}:00 – ${count} view${count !== 1 ? "s" : ""}`;
              return (
                <div
                  key={h}
                  title={label}
                  className={`flex-1 rounded-sm transition-colors cursor-default ${count > 0 ? "bg-accent hover:bg-accent-dark" : "bg-rule-soft"}`}
                  style={{
                    height: count > 0 ? `${heightPct}%` : "8px",
                    minHeight: count > 0 ? 3 : 8,
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-faint text-[10px]">12am</span>
            <span className="text-faint text-[10px]">6am</span>
            <span className="text-faint text-[10px]">12pm</span>
            <span className="text-faint text-[10px]">6pm</span>
            <span className="text-faint text-[10px]">11pm</span>
          </div>
        </>
      )}
    </div>
  );
}

export default HourlyActivity;
