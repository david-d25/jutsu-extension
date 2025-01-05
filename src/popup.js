document.addEventListener("DOMContentLoaded", () => {
    const toggleCheckbox = document.getElementById("toggle-script");
  
    chrome.storage.local.get(["enabled"], (result) => {
        toggleCheckbox.checked = result.enabled || false;
    });
  
    toggleCheckbox.addEventListener("change", () => {
        const isEnabled = toggleCheckbox.checked;
        chrome.storage.local.set({ enabled: isEnabled }, () => {
            console.log(`Jut.su extension ${isEnabled ? "enabled" : "disabled"}`);
        });
    });
});