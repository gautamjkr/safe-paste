# SafePaste Chrome Extension (React + Vite + Tailwind)

This is the **Chrome Extension** that:

- Intercepts `paste` events on AI textareas (`chatgpt.com`, `gemini.google.com`).
- Sends clipboard text to the **Gateway**, which forwards to the Python **Processor**.
- Displays a **Ghost Overlay** (glassmorphism UI) showing how many secrets were found.
- Lets the user choose **Paste Masked** or **Paste Original**.

---

## 1. Prerequisites

- Node.js 18+ and npm
- Chrome-based browser that supports **Manifest V3**

---

## 2. Install dependencies

```powershell
cd extension
npm install
```

---

## 3. Build the extension

```powershell
cd extension
npm run build
```

This will produce a build using Vite and output compiled scripts:

- `src/contentScript.js` – main content script
- `src/overlayMount.js` – React overlay entry
- `background.js` – background service worker

---

## 4. Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `extension` folder (or the `dist` folder, depending on your Vite output structure).

> If Chrome complains about file paths, point it to the folder that contains `manifest.json`.

---

## 5. How it works (high level)

1. **Content Script** (`src/contentScript.tsx`):
   - Listens for `paste` events (`window.addEventListener("paste", ..., true)`).
   - If the target is a `textarea`, `input[type="text"]`, or `[contenteditable="true"]`:
     - Calls `event.preventDefault()`.
     - Captures the pasted text and cursor position.
     - Shows the Ghost Overlay near the cursor in a dark, cyber aesthetic.
     - Sends the text to the Gateway at `POST /proxy/anonymize`.

2. **Overlay**:
   - Displays **“X secrets detected”** with counts per entity type.
   - Shows **[Paste Masked]** and **[Paste Original]**.
   - On **Paste Masked**: inserts the anonymized text into the DOM.
   - On **Paste Original**: inserts the raw text.
   - Displays a **Ghost Map** section (placeholder → original value), only in-memory.

3. **Configuration**:
   - By default, the content script points to:

     ```ts
     const GATEWAY_BASE_URL = "http://localhost:8080";
     ```

   - You can change this at build time using `SAFEPASTE_GATEWAY_URL` env for Vite if needed.

---

## 6. Permissions

The `manifest.json` requests:

- `clipboardRead` – to access pasted text.
- `storage` – extension storage for future settings.
- `host_permissions` – limited to:
  - `https://chatgpt.com/*`
  - `https://gemini.google.com/*`


