import type { AnalyticsSummary } from "../../../api/analytics";

interface Props {
  summary: Pick<AnalyticsSummary, "todayViews" | "last7DaysViews" | "totalViews" | "byDay">;
}

// The four KPI cards along the top of the analytics tab.
// "Last 30 days" is summed from the byDay slice; the other three are
// pre-computed by the backend.
function StatCards({ summary }: Props) {
  const last30Days = summary.byDay.reduce((s, d) => s + d.count, 0);
  const cards = [
    { label: "Today", value: summary.todayViews },
    { label: "Last 7 days", value: summary.last7DaysViews },
    { label: "Last 30 days", value: last30Days },
    { label: "All-time", value: summary.totalViews },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white border border-rule rounded-xl p-5"
        >
          <p className="text-muted text-xs uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-ink text-2xl font-semibold">
            {value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StatCards;
