import React from "react";
import { RedactionLog } from "../App";

type EntityTableProps = {
  logs: RedactionLog[];
  loading: boolean;
};

const EntityTable: React.FC<EntityTableProps> = ({ logs, loading }) => {
  // Sort by count descending
  const sortedLogs = [...logs].sort((a, b) => b.count - a.count);

  const formatEntityType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const total = logs.reduce((sum, log) => sum + log.count, 0);

  if (loading && logs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-ghost-dark/70 backdrop-blur-md shadow-ghost-glow-sm p-12">
        <div className="flex items-center justify-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ghost-accent border-t-transparent" />
          <p className="text-gray-400">Loading redaction logs...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-ghost-dark/70 backdrop-blur-md shadow-ghost-glow-sm p-12">
        <div className="text-center">
          <div className="text-4xl mb-4">👻</div>
          <p className="text-xl font-semibold text-gray-300 mb-2">No Redactions Yet</p>
          <p className="text-sm text-gray-400">
            Start using SafePaste to see redaction statistics here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ghost-dark/70 backdrop-blur-md shadow-ghost-glow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <span className="text-ghost-accent">📋</span>
          Redaction Statistics
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Entity Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Count
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Percentage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Visual
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log, index) => {
              const percentage = getPercentage(log.count, total);
              const isEven = index % 2 === 0;

              return (
                <tr
                  key={log.entity_type}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    isEven ? "bg-white/2" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-ghost-accent animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                      <span className="font-medium text-gray-200">
                        {formatEntityType(log.entity_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-ghost-accent font-semibold">
                      {log.count.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{percentage}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-xs h-2 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-ghost-accent to-ghost-accentPurple rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Showing <span className="text-ghost-accent font-semibold">{logs.length}</span> entity types
          </span>
          <span className="text-gray-400">
            Total: <span className="text-ghost-accent font-semibold">{total.toLocaleString()}</span> redactions
          </span>
        </div>
      </div>
    </div>
  );
};

export default EntityTable;

