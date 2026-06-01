import type { AnalyticsSummary } from "../../../api/analytics";

type Hour = AnalyticsSummary["byHour"][number];

interface Props {
  hours: Hour[];
}

function HourlyActivity({ hours }: Props) {
  const maxCount = Math.max(...hours.map((x) => x.count), 1);

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
      <h2 className="text-[#2C2C2A] text-sm font-medium mb-1">
        Activity by hour
      </h2>
      <p className="text-[#B4B2A9] text-xs mb-4">Last 7 days · local time</p>
      {hours.length === 0 ? (
        <p className="text-[#B4B2A9] text-sm">No data yet.</p>
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
                  className={`flex-1 rounded-sm transition-colors cursor-default ${count > 0 ? "bg-[#1D9E75] hover:bg-[#0F6E56]" : "bg-[#F5F4F0]"}`}
                  style={{
                    height: count > 0 ? `${heightPct}%` : "8px",
                    minHeight: count > 0 ? 3 : 8,
                  }}
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
  );
}

export default HourlyActivity;
