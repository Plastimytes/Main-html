const TOGGLE_KEY = 'isShortsFilterEnabled';
const toggleSwitch = document.getElementById('toggleSwitch');
const statusText = document.getElementById('statusText');

/**
 * Updates the text displayed below the switch in the popup.
 * @param {boolean} isEnabled - The current state of the filter.
 */


// 1. Load the initial state when the popup opens
chrome.storage.local.get([TOGGLE_KEY], (result) => {
    // Default to true (enabled) if no value is found in storage
    const isEnabled = result[TOGGLE_KEY] !== false; 
    
    toggleSwitch.checked = isEnabled;
    updateStatusText(isEnabled);
});


// 2. Add an event listener to save the new state when the switch is toggled
toggleSwitch.addEventListener('change', () => {
    const isEnabled = toggleSwitch.checked;
    
    // Save the new state to local storage
    chrome.storage.local.set({ [TOGGLE_KEY]: isEnabled }, () => {
        updateStatusText(isEnabled);
        
        // Optional: Notify the currently active YouTube tab to refresh/re-check the setting
        // This is necessary because content-script.js only checks storage on load,
        // so it won't react immediately to the change unless it has a listener.
        chrome.tabs.query({active: true, currentWindow: true, url: "*://*.youtube.com/*"}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleStateChange", isEnabled: isEnabled });
            }
        });
    });
});