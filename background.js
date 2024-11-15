// background.js

let isTracking = false;
let trackingTabId = null;

// On installation, initialize storage and set the daily reset timer
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ timeSpent: 0 }); // Reset timeSpent to 0
  resetDailyTimer(); // Schedule a reset timer for daily tracking
});

// Function to set up a timer that resets time tracking at midnight
function resetDailyTimer() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0); // Set time to midnight (12:00 AM) of the next day

  const millisecondsUntilMidnight = tomorrow - now;

  // Create a Chrome alarm to reset daily at midnight
  chrome.alarms.create("resetDaily", {
    when: Date.now() + millisecondsUntilMidnight,
    periodInMinutes: 24 * 60,
  });
}

// Listener for the daily reset alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetDaily") {
    chrome.storage.local.set({ timeSpent: 0 }); // Reset the daily time spent
  }
});

// Listener for tab activation (when the user switches to another tab)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateTracking(tab.url, activeInfo.tabId);
});

// Listener for tab updates (e.g., when the URL of the current tab changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateTracking(changeInfo.url, tabId);
  }
});

function isTwitterUrl(url) {
  return url && (url.includes("twitter.com") || url.includes("x.com"));
}

// Update tracking state based on the tab's URL
function updateTracking(url, tabId) {
  if (isTwitterUrl(url)) {
    if (!isTracking || trackingTabId !== tabId) {
      isTracking = true; // Start tracking
      trackingTabId = tabId; // Save the tab ID being tracked
      startTracking(); // Begin tracking time
    }
  } else if (trackingTabId === tabId) {
    isTracking = false; // Stop tracking if the tracked tab is no longer a Twitter tab
    trackingTabId = null; // Clear the tracked tab ID
  }
}

function startTracking() {
  const trackingInterval = setInterval(() => {
    // Stop tracking if the state changes
    if (!isTracking) {
      clearInterval(trackingInterval); // Stop the interval
      return; // Exit the function
    }

    chrome.tabs.get(trackingTabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        isTracking = false; // Stop tracking
        trackingTabId = null;
        clearInterval(trackingInterval);
        return;
      }

      chrome.storage.local.get(["timeSpent", "timeLimit"], function (data) {
        const newTimeSpent = (data.timeSpent || 0) + 1;
        chrome.storage.local.set({ timeSpent: newTimeSpent });

        if (data.timeLimit && newTimeSpent >= data.timeLimit * 60) {
          chrome.tabs.sendMessage(trackingTabId, { action: "showOverlay" }); // Send an overlay message
        }
      });
    });
  }, 1000); // Repeat every 1 second
}
