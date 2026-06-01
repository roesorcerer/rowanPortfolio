import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import StatCards from "./analytics/StatCards";
import ProjectEngagement from "./analytics/ProjectEngagement";
import TrafficSources from "./analytics/TrafficSources";
import DeviceBreakdown from "./analytics/DeviceBreakdown";
import DailyTrend from "./analytics/DailyTrend";
import HourlyActivity from "./analytics/HourlyActivity";
import RecentVisits from "./analytics/RecentVisits";

function AnalyticsTab() {
  const { summary, engagement, isLoading } = useAdminAnalytics();

  return (
    <>
      <h1 className="text-[#2C2C2A] text-xl font-medium tracking-tight mb-8">
        Analytics
      </h1>

      {isLoading && (
        <div className="flex items-center gap-2 py-10">
          <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
          <span className="text-[#888780] text-sm">Loading…</span>
        </div>
      )}

      {!isLoading && summary && (
        <>
          <StatCards summary={summary} />

          {engagement && <ProjectEngagement engagement={engagement} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <TrafficSources byReferrer={summary.byReferrer} />
            <DeviceBreakdown breakdown={summary.deviceBreakdown} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <DailyTrend days={summary.byDay} />
            <HourlyActivity hours={summary.byHour} />
          </div>

          <RecentVisits visits={summary.recentVisits} />
        </>
      )}
    </>
  );
}

export default AnalyticsTab;
