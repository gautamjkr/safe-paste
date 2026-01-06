import React from "react";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import EntityTable from "./EntityTable";
import { RedactionLog } from "../App";

type DashboardProps = {
  logs: RedactionLog[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
};

const Dashboard: React.FC<DashboardProps> = ({
  logs,
  loading,
  error,
  lastUpdated,
  onRefresh,
}) => {
  const totalRedactions = logs.reduce((sum, log) => sum + log.count, 0);
  const uniqueEntityTypes = logs.length;

  return (
    <div className="min-h-screen bg-ghost-bg">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ghost-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ghost-accentPurple/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <Header
          totalRedactions={totalRedactions}
          uniqueEntityTypes={uniqueEntityTypes}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
          loading={loading}
        />

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-6 py-4 shadow-ghost-glow-sm">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-red-300 font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        <StatsGrid logs={logs} totalRedactions={totalRedactions} />

        <EntityTable logs={logs} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;

