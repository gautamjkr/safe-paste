import { hideOverlay, updateOverlay } from "./overlayMount";

console.log("🔵 SafePaste content script loaded at", new Date().toISOString());

type ProcessorEntity = {
  entity_type: string;
  start: number;
  end: number;
  score: number;
};

type AnonymizeResponse = {
  masked_text: string;
  ghost_map: Record<string, string>;
  entities: ProcessorEntity[];
};

let lastPasteTarget: HTMLTextAreaElement | HTMLElement | null = null;

function isEditable(target: EventTarget | null): target is
  | HTMLTextAreaElement
  | HTMLInputElement
  | HTMLElement {
  if (!target) return false;
  
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) return true;
  
  if (target instanceof HTMLElement) {
    // Check closest parent for contenteditable
    const element = target.closest('[contenteditable="true"], textarea, input[type="text"]');
    if (element) return true;
    
    // Check element itself
    if (target.isContentEditable) return true;
    if (target.getAttribute("contenteditable") === "true") return true;
  }
  
  return false;
}

function insertTextAtCursor(el: HTMLElement, text: string) {
  console.log("🔵 SafePaste: Inserting text", { tagName: el.tagName, isContentEditable: el.isContentEditable });
  
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + text + after;
    const newPos = before.length + text.length;
    el.selectionStart = el.selectionEnd = newPos;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (el.isContentEditable || el.getAttribute("contenteditable") === "true") {
    // For contenteditable elements (like Gemini uses)
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // No selection, append to end
      el.textContent = (el.textContent || "") + text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input event for React/other frameworks
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    console.warn("🔴 SafePaste: Unknown element type for text insertion", el);
  }
}

async function handlePaste(event: ClipboardEvent) {
  console.log("🔵 SafePaste: Paste event detected", {
    target: event.target,
    activeElement: document.activeElement,
    composedPath: event.composedPath().slice(0, 3).map(n => (n as HTMLElement)?.tagName || String(n))
  });
  
  // Try to find editable element using multiple methods
  let editableTarget: HTMLElement | null = null;
  
  // Method 1: Check event target
  if (isEditable(event.target)) {
    editableTarget = event.target as HTMLElement;
    console.log("🟢 SafePaste: Found editable target via event.target");
  }
  
  // Method 2: Check active element (where cursor is)
  if (!editableTarget && isEditable(document.activeElement)) {
    editableTarget = document.activeElement as HTMLElement;
    console.log("🟢 SafePaste: Found editable target via document.activeElement");
  }
  
  // Method 3: Check composed path (for shadow DOM)
  if (!editableTarget) {
    const path = event.composedPath();
    for (const node of path) {
      if (isEditable(node)) {
        editableTarget = node as HTMLElement;
        console.log("🟢 SafePaste: Found editable target via composedPath");
        break;
      }
    }
  }
  
  if (!editableTarget) {
    console.log("🔴 SafePaste: No editable target found, allowing default paste");
    return; // Don't intercept if we can't find editable element
  }

  const text = event.clipboardData?.getData("text/plain");
  if (!text) {
    console.log("🔴 SafePaste: No text in clipboard");
    return;
  }

  console.log("🟢 SafePaste: Intercepting paste", { 
    textLength: text.length, 
    preview: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
    target: editableTarget.tagName 
  });

  event.preventDefault();
  event.stopPropagation();
  lastPasteTarget = editableTarget;

  const position = { x: event.clientX || 0, y: event.clientY || 0 };

  updateOverlay({
    visible: true,
    loading: true,
    position,
    entitySummaries: [],
    ghostMap: {},
    maskedText: text,
    onPasteMasked: (masked) => {
      if (lastPasteTarget) {
        insertTextAtCursor(lastPasteTarget as HTMLElement, masked);
      }
      hideOverlay();
    },
    onPasteOriginal: () => {
      if (lastPasteTarget) {
        insertTextAtCursor(lastPasteTarget as HTMLElement, text);
      }
      hideOverlay();
    },
  });

  try {
    console.log("🔵 SafePaste: Sending anonymize request via background service worker");
    
    // Send message to background service worker to proxy the request
    // This avoids CORS issues with localhost from content scripts
    chrome.runtime.sendMessage(
      { type: "anonymize", text },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("🔴 SafePaste: Runtime error", chrome.runtime.lastError);
          // Graceful fallback: paste original text
          if (lastPasteTarget) {
            insertTextAtCursor(lastPasteTarget as HTMLElement, text);
          }
          hideOverlay();
          return;
        }

        if (!response || !response.success) {
          console.error("🔴 SafePaste: API error", response?.error);
          // Graceful fallback: paste original text
          if (lastPasteTarget) {
            insertTextAtCursor(lastPasteTarget as HTMLElement, text);
          }
          hideOverlay();
          return;
        }

        const data = response.data as AnonymizeResponse;

        console.log("🟢 SafePaste: API response received", {
          entitiesFound: data.entities.length,
          maskedTextLength: data.masked_text.length
        });

        const summaryMap: Record<string, number> = {};
        for (const ent of data.entities) {
          summaryMap[ent.entity_type] = (summaryMap[ent.entity_type] || 0) + 1;
        }

        updateOverlay({
          loading: false,
          maskedText: data.masked_text,
          ghostMap: data.ghost_map,
          entitySummaries: Object.entries(summaryMap).map(
            ([entity_type, count]) => ({ entity_type, count })
          ),
        });
      }
    );
  } catch (err) {
    console.error("🔴 SafePaste: failed to contact gateway", err);
    // Graceful fallback: paste original text
    if (lastPasteTarget) {
      insertTextAtCursor(lastPasteTarget as HTMLElement, text);
    }
    hideOverlay();
  }
}

window.addEventListener("paste", handlePaste, true);
console.log("🔵 SafePaste: Paste listener attached to window");


