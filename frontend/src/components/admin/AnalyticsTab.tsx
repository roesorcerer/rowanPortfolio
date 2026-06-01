import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import LoadingPulse from "../LoadingPulse";
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
      <h1 className="text-ink text-xl font-medium tracking-tight mb-8">
        Analytics
      </h1>

      {isLoading && <LoadingPulse />}

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
