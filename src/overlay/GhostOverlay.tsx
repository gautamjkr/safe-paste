import React, { useState, useEffect } from "react";
import { DetectedEntity } from "../piiDetector";

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
  entities?: DetectedEntity[];
  selectedEntityIds?: Set<number>;
  onPasteMasked: (maskedText: string) => void;
  onPasteOriginal: () => void;
  onPasteCustom?: (selectedIds: Set<number>) => void;
};

export const GhostOverlay: React.FC<GhostOverlayProps> = ({
  visible,
  loading,
  entitySummaries,
  ghostMap,
  maskedText,
  position,
  entities = [],
  selectedEntityIds = new Set(),
  onPasteMasked,
  onPasteOriginal,
  onPasteCustom,
}) => {
  const [showCustomSelect, setShowCustomSelect] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<number>>(
    new Set(selectedEntityIds)
  );

  // Reset custom select state when overlay becomes visible
  useEffect(() => {
    if (visible) {
      setShowCustomSelect(false);
      setLocalSelectedIds(new Set(selectedEntityIds));
    }
  }, [visible, selectedEntityIds]);

  if (!visible || !position) return null;

  const totalSecrets = entitySummaries.reduce(
    (sum, e) => sum + e.count,
    0
  );

  const handleToggleEntity = (index: number) => {
    const newSelected = new Set(localSelectedIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setLocalSelectedIds(newSelected);
  };

  const handlePasteCustom = () => {
    if (onPasteCustom) {
      onPasteCustom(localSelectedIds);
    }
  };

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

            {!showCustomSelect ? (
              <div className="mb-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
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
                {entities.length > 0 && onPasteCustom && (
                  <button
                    onClick={() => setShowCustomSelect(true)}
                    className="w-full rounded-lg border border-ghost-accent/50 bg-black/30 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-ghost-accent hover:border-ghost-accent hover:bg-black/50 transition"
                  >
                    Custom Select
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">
                    Select entities to redact
                  </span>
                  <button
                    onClick={() => setShowCustomSelect(false)}
                    className="text-[10px] text-gray-400 hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-white/5 rounded-lg p-2 bg-black/20">
                  {entities.map((entity, index) => {
                    const isSelected = localSelectedIds.has(index);
                    return (
                      <label
                        key={index}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-[10px]"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleEntity(index)}
                          className="w-3 h-3 rounded border-ghost-accent/50 bg-black/50 text-ghost-accent focus:ring-ghost-accent focus:ring-1"
                        />
                        <span className="flex-1">
                          <span className="font-mono text-ghost-accent uppercase">
                            {entity.entity_type}
                          </span>
                          <span className="text-gray-400 ml-2 truncate block">
                            {entity.value.length > 30
                              ? entity.value.substring(0, 30) + "..."
                              : entity.value}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLocalSelectedIds(new Set(entities.map((_, i) => i)));
                    }}
                    className="flex-1 rounded-lg border border-gray-600/50 bg-black/30 px-2 py-1 text-[10px] font-medium text-gray-300 hover:border-gray-500 transition"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setLocalSelectedIds(new Set())}
                    className="flex-1 rounded-lg border border-gray-600/50 bg-black/30 px-2 py-1 text-[10px] font-medium text-gray-300 hover:border-gray-500 transition"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handlePasteCustom}
                    disabled={localSelectedIds.size === 0}
                    className="flex-1 rounded-lg bg-ghost-accent/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-black hover:bg-ghost-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Paste ({localSelectedIds.size})
                  </button>
                </div>
              </div>
            )}

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


