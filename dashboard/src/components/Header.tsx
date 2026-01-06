import React from "react";

type HeaderProps = {
  totalRedactions: number;
  uniqueEntityTypes: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading: boolean;
};

const Header: React.FC<HeaderProps> = ({
  totalRedactions,
  uniqueEntityTypes,
  lastUpdated,
  onRefresh,
  loading,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-ghost-accent animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-ghost-accent to-ghost-accentPurple bg-clip-text text-transparent">
            SafePaste Dashboard
          </h1>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-ghost-accent/40 bg-black/40 hover:bg-black/60 hover:border-ghost-accent/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-ghost-accent"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-ghost-accent border-t-transparent" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-ghost-dark/70 backdrop-blur-md shadow-ghost-glow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Last Updated</p>
            <p className="text-sm font-mono text-ghost-accent">{formatTime(lastUpdated)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ghost-accent animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <p className="text-sm font-medium text-ghost-accent">Live</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

