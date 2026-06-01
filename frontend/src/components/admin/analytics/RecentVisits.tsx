import type { AnalyticsSummary } from "../../../api/analytics";

type Visit = AnalyticsSummary["recentVisits"][number];

interface Props {
  visits: Visit[];
}

function RecentVisits({ visits }: Props) {
  return (
    <div className="bg-white border border-rule rounded-xl p-6">
      <h2 className="text-ink text-sm font-medium mb-4">Recent visits</h2>
      {visits.length === 0 ? (
        <p className="text-faint text-sm">No visits recorded yet.</p>
      ) : (
        <div className="space-y-0 divide-y divide-rule-soft">
          {visits.map((visit, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${
                  visit.device === "mobile"
                    ? "bg-accent-soft text-accent-dark border-[#C3EBD8]"
                    : "bg-rule-soft text-body border-rule"
                }`}
              >
                {visit.device === "mobile" ? "Mobile" : "Desktop"}
              </span>
              <span className="text-ink text-xs font-mono truncate flex-1">
                {visit.path}
              </span>
              <span className="text-faint text-xs flex-shrink-0 hidden sm:block">
                {visit.source}
              </span>
              <span className="text-faint text-xs flex-shrink-0">
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
