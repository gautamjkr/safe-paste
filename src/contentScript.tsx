import { hideOverlay, updateOverlay } from "./overlayMount";
import { detectEntities, anonymizeText, DetectedEntity } from "./piiDetector";

console.log("🔵 SafePaste content script loaded at", new Date().toISOString());

let lastPasteTarget: HTMLTextAreaElement | HTMLElement | null = null;
let lastPastedText: string = "";
let lastDetectedEntities: DetectedEntity[] = [];
let isSafePasteShortcut = false; // Track if SafePaste shortcut is active

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

async function processSafePaste(text: string, editableTarget: HTMLElement, position: { x: number; y: number }) {
  lastPasteTarget = editableTarget;
  lastPastedText = text;

  // Show loading overlay
  updateOverlay({
    visible: true,
    loading: true,
    position,
    entitySummaries: [],
    ghostMap: {},
    maskedText: text,
    entities: [],
    selectedEntityIds: new Set(),
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
    onPasteCustom: (selectedIds) => {
      if (lastPasteTarget && lastDetectedEntities.length > 0) {
        const { masked_text } = anonymizeText(lastPastedText, lastDetectedEntities, selectedIds);
        insertTextAtCursor(lastPasteTarget as HTMLElement, masked_text);
      }
      hideOverlay();
    },
  });

  // Perform local PII detection
  try {
    console.log("🔵 SafePaste: Detecting PII locally...");
    
    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      const entities = detectEntities(text);
      lastDetectedEntities = entities;

      console.log("🟢 SafePaste: Detection complete", {
        entitiesFound: entities.length,
      });

      // Create summary map
      const summaryMap: Record<string, number> = {};
      for (const ent of entities) {
        summaryMap[ent.entity_type] = (summaryMap[ent.entity_type] || 0) + 1;
      }

      // Anonymize with all entities selected by default
      const { masked_text, ghost_map } = anonymizeText(text, entities);

      updateOverlay({
        loading: false,
        maskedText: masked_text,
        ghostMap: ghost_map,
        entitySummaries: Object.entries(summaryMap).map(
          ([entity_type, count]) => ({ entity_type, count })
        ),
        entities: entities,
        selectedEntityIds: new Set(entities.map((_, index) => index)),
      });
    }, 50); // Small delay for UI responsiveness
  } catch (err) {
    console.error("🔴 SafePaste: Detection error", err);
    // Graceful fallback: paste original text
    if (lastPasteTarget) {
      insertTextAtCursor(lastPasteTarget as HTMLElement, text);
    }
    hideOverlay();
  }
}

async function handlePaste(event: ClipboardEvent) {
  // Only intercept if SafePaste shortcut was used
  if (!isSafePasteShortcut) {
    return; // Let normal paste work
  }

  console.log("🔵 SafePaste: Paste event detected (shortcut activated)", {
    target: event.target,
    activeElement: document.activeElement,
  });
  
  // Reset the flag
  isSafePasteShortcut = false;
  
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

  const position = { x: event.clientX || 0, y: event.clientY || 0 };
  await processSafePaste(text, editableTarget, position);
}

// Listen for keyboard shortcut: Ctrl+Alt+V
function handleKeyDown(event: KeyboardEvent) {
  // Check for Ctrl+Alt+V (or Cmd+Alt+V on Mac)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
  
  if (ctrlKey && event.altKey && event.key.toLowerCase() === 'v') {
    console.log("🔵 SafePaste: Shortcut detected (Ctrl+Alt+V)");
    
    // Check if we're in an editable element
    const activeElement = document.activeElement;
    if (!isEditable(activeElement)) {
      console.log("🔴 SafePaste: Not in an editable element, ignoring shortcut");
      return;
    }
    
    // Prevent default paste behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Set flag to intercept the next paste event
    isSafePasteShortcut = true;
    
    // Try to read clipboard and trigger SafePaste
    navigator.clipboard.readText()
      .then((text) => {
        if (!text) {
          console.log("🔴 SafePaste: No text in clipboard");
          isSafePasteShortcut = false;
          return;
        }
        
        const editableTarget = activeElement as HTMLElement;
        const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        processSafePaste(text, editableTarget, position);
        isSafePasteShortcut = false;
      })
      .catch((err) => {
        console.error("🔴 SafePaste: Failed to read clipboard", err);
        isSafePasteShortcut = false;
        // Fallback: trigger a paste event programmatically
        // This will be caught by handlePaste if clipboard access fails
        document.execCommand('paste');
      });
  }
}

// Listen for keyboard events
window.addEventListener("keydown", handleKeyDown, true);

// Also listen for paste events (as fallback if clipboard API fails)
window.addEventListener("paste", handlePaste, true);

console.log("🔵 SafePaste: Keyboard shortcut listener attached (Ctrl+Alt+V)");
console.log("🔵 SafePaste: Paste listener attached to window");


