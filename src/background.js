chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getEnabledState") {
        chrome.storage.local.get(["enabled"], (result) => {
            sendResponse({ enabled: result.enabled || false });
        });
        return true;
    }
});
