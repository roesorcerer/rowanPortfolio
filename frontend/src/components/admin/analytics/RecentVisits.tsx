import type { AnalyticsSummary } from "../../../api/analytics";

type Visit = AnalyticsSummary["recentVisits"][number];

interface Props {
  visits: Visit[];
}

function RecentVisits({ visits }: Props) {
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6">
      <h2 className="text-[#2C2C2A] text-sm font-medium mb-4">Recent visits</h2>
      {visits.length === 0 ? (
        <p className="text-[#B4B2A9] text-sm">No visits recorded yet.</p>
      ) : (
        <div className="space-y-0 divide-y divide-[#F5F4F0]">
          {visits.map((visit, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0"
                style={
                  visit.device === "mobile"
                    ? {
                        background: "#E1F5EE",
                        color: "#0F6E56",
                        borderColor: "#C3EBD8",
                      }
                    : {
                        background: "#F5F4F0",
                        color: "#5F5E5A",
                        borderColor: "#E8E6E1",
                      }
                }
              >
                {visit.device === "mobile" ? "Mobile" : "Desktop"}
              </span>
              <span className="text-[#2C2C2A] text-xs font-mono truncate flex-1">
                {visit.path}
              </span>
              <span className="text-[#B4B2A9] text-xs flex-shrink-0 hidden sm:block">
                {visit.source}
              </span>
              <span className="text-[#B4B2A9] text-xs flex-shrink-0">
                {new Date(visit.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentVisits;
