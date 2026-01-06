import React from "react";

type EntitySummary = {
  entity_type: string;
  count: number;
};

type GhostMap = Record<string, string>;

export type GhostOverlayProps = {
  visible: boolean;
  loading: boolean;
  entitySummaries: EntitySummary[];
  ghostMap: GhostMap;
  maskedText: string;
  position: { x: number; y: number } | null;
  onPasteMasked: (maskedText: string) => void;
  onPasteOriginal: () => void;
};

export const GhostOverlay: React.FC<GhostOverlayProps> = ({
  visible,
  loading,
  entitySummaries,
  ghostMap,
  maskedText,
  position,
  onPasteMasked,
  onPasteOriginal,
}) => {
  if (!visible || !position) return null;

  const totalSecrets = entitySummaries.reduce(
    (sum, e) => sum + e.count,
    0
  );

  return (
    <div
      style={{
        position: "fixed",
        top: position.y + 12,
        left: position.x + 12,
        zIndex: 2147483647,
      }}
      className="pointer-events-auto"
    >
      <div className="rounded-2xl border border-white/10 bg-ghost-bg/70 backdrop-blur-md shadow-ghost-glow px-4 py-3 min-w-[260px] max-w-sm text-xs text-gray-100">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-ghost-accent animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
            <span className="font-semibold tracking-wide text-ghost-accent">
              SafePaste
            </span>
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            {loading ? "SCANNING..." : "SCAN COMPLETE"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-ghost-accent border-t-transparent" />
            <span>Looking for secrets in your paste...</span>
          </div>
        ) : (
          <>
            <div className="mb-2 text-xs text-gray-200">
              <span className="font-semibold text-ghost-accent">
                {totalSecrets}
              </span>{" "}
              secrets detected.
            </div>

            <div className="mb-2 flex flex-wrap gap-1">
              {entitySummaries.map((e) => (
                <span
                  key={e.entity_type}
                  className="rounded-full border border-ghost-accent/40 bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ghost-accent"
                >
                  {e.entity_type}: {e.count}
                </span>
              ))}
              {entitySummaries.length === 0 && (
                <span className="text-[11px] text-gray-400">
                  No obvious secrets found.
                </span>
              )}
            </div>

            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                onClick={() => onPasteMasked(maskedText)}
                className="flex-1 rounded-lg bg-ghost-accent/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-black hover:bg-ghost-accent transition"
              >
                Paste Masked
              </button>
              <button
                onClick={onPasteOriginal}
                className="flex-1 rounded-lg border border-gray-600/80 bg-black/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-200 hover:border-ghost-accent/70 transition"
              >
                Paste Original
              </button>
            </div>

            {Object.keys(ghostMap).length > 0 && (
              <div className="border-t border-white/5 pt-2 mt-1">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-gray-400">
                  Ghost Map (local only)
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 text-[10px]">
                  {Object.entries(ghostMap).map(([placeholder, value]) => (
                    <div
                      key={placeholder}
                      className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-1"
                    >
                      <span className="font-mono text-ghost-accent">
                        {placeholder}
                      </span>
                      <span className="truncate text-gray-300">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


