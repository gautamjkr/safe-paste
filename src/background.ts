// Background service worker for SafePaste
// All PII detection is now done client-side in the content script
// This file is kept minimal for Chrome extension requirements

chrome.runtime.onInstalled.addListener(() => {
  console.log("🔵 SafePaste background service worker installed.");
});


