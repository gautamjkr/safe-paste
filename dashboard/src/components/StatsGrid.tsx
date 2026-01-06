import React from "react";
import { RedactionLog } from "../App";

type StatsGridProps = {
  logs: RedactionLog[];
  totalRedactions: number;
};

const StatsGrid: React.FC<StatsGridProps> = ({ logs, totalRedactions }) => {
  const topEntity = logs.length > 0 
    ? logs.reduce((max, log) => (log.count > max.count ? log : max), logs[0])
    : null;

  const stats = [
    {
      label: "Total Redactions",
      value: totalRedactions.toLocaleString(),
      icon: "🔒",
      colorClass: "text-ghost-accent",
      dotClass: "bg-ghost-accent",
    },
    {
      label: "Entity Types",
      value: logs.length.toString(),
      icon: "📊",
      colorClass: "text-ghost-accentPurple",
      dotClass: "bg-ghost-accentPurple",
    },
    {
      label: "Most Redacted",
      value: topEntity ? topEntity.entity_type.replace(/_/g, " ") : "N/A",
      subValue: topEntity ? `${topEntity.count} times` : "",
      icon: "⚠️",
      colorClass: "text-ghost-accent",
      dotClass: "bg-ghost-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-ghost-dark/70 backdrop-blur-md shadow-ghost-glow-sm p-6 hover:border-ghost-accent/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{stat.icon}</div>
            <div className={`h-2 w-2 rounded-full ${stat.dotClass} animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]`} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${stat.colorClass} mb-1`}>
              {stat.value}
            </p>
            {stat.subValue && (
              <p className="text-sm text-gray-400">{stat.subValue}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;

