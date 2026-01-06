const GATEWAY_BASE_URL = "http://localhost:8080";

chrome.runtime.onInstalled.addListener(() => {
  console.log("🔵 SafePaste background service worker installed.");
});

// Handle messages from content script to proxy API requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "anonymize") {
    console.log("🔵 SafePaste background: Proxying anonymize request");
    
    fetch(`${GATEWAY_BASE_URL}/proxy/anonymize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message.text }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Gateway error: ${res.status}`);
        }
        const data = await res.json();
        console.log("🟢 SafePaste background: API response received");
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error("🔴 SafePaste background: API error", err);
        sendResponse({ success: false, error: err.message });
      });

    // Return true to indicate we'll send a response asynchronously
    return true;
  }
  
  return false;
});


