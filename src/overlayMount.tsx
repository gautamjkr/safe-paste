import React from "react";
import ReactDOM from "react-dom/client";
import { GhostOverlay, GhostOverlayProps } from "./overlay/GhostOverlay";
import "./styles.css";

// This file mounts a singleton React overlay into the page.

type OverlayState = Omit<
  GhostOverlayProps,
  "onPasteMasked" | "onPasteOriginal" | "onPasteCustom"
> & {
  onPasteMasked?: GhostOverlayProps["onPasteMasked"];
  onPasteOriginal?: GhostOverlayProps["onPasteOriginal"];
  onPasteCustom?: GhostOverlayProps["onPasteCustom"];
};

let root: ReactDOM.Root | null = null;
let currentState: OverlayState = {
  visible: false,
  loading: false,
  entitySummaries: [],
  ghostMap: {},
  maskedText: "",
  position: null,
  entities: [],
  selectedEntityIds: new Set(),
};

function ensureRoot() {
  if (root) return;

  const container = document.createElement("div");
  container.id = "safepaste-overlay-root";
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "2147483647";
  document.documentElement.appendChild(container);

  root = ReactDOM.createRoot(container);
}

function render() {
  if (!root) return;
  root.render(
    <React.StrictMode>
      <GhostOverlay
        {...(currentState as GhostOverlayProps)}
        onPasteMasked={(text) =>
          currentState.onPasteMasked && currentState.onPasteMasked(text)
        }
        onPasteOriginal={() =>
          currentState.onPasteOriginal && currentState.onPasteOriginal()
        }
        onPasteCustom={(selectedIds) =>
          currentState.onPasteCustom && currentState.onPasteCustom(selectedIds)
        }
      />
    </React.StrictMode>
  );
}

export function updateOverlay(partial: Partial<OverlayState>) {
  ensureRoot();
  currentState = { ...currentState, ...partial };
  render();
}

export function hideOverlay() {
  updateOverlay({ 
    visible: false, 
    loading: false, 
    position: null,
    entities: [],
    selectedEntityIds: new Set(),
  });
}


