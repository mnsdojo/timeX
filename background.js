let isTracking = false;
let trackingTabId = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ timespent: 0 });
  resetDailyTimerAtMidNight();
});

// resetAt MidNight
function resetDailyTimerAtMidNight() {
  const now = new Date();
  const tmrw = new Date(now);

  // next day at midnight
  tmrw.setHours(24, 0, 0, 0);

  const millisecondsUntilMidnight = tmrw - now;

  chrome.alarms.create("resetDaily", {
    when: Date.now() + millisecondsUntilMidnight,
    periodInMinutes: 24 * 60,
  });
}
chrome.alarms.onalarm.addListener((alarm) => {
  if (alarm.name === "resetDaily") {
    chrome.storage.local.set({ timeSpent: 0 });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetDaily") {
    chrome.storage.local.set({ timeSpent: 0 });
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateTracking(tab.url, activeInfo.tabId);
});

// Event listener for when the URL of a tab is updated (e.g., navigating to a different page).
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the URL has changed, update the tracking status based on the new URL.
  if (changeInfo.url) {
    updateTracking(changeInfo.url, tabId);
  }
});
function isTwitterUrl(url) {
  return (url && url.includes("twitter.com")) || url.includes("x.com");
}

// update tracking based on the tab's url

function updateTracking(url, tabId) {
  if (isTwitterUrl(url)) {
    if (!isTracking || trackingTabId !== tabId) {
      isTracking = true;
      trackingTabId = tabId;
      startTracking(); // Begin tracking time on this tab.
    } else if (trackingTabId === tabId) {
      isTracking = false;
      trackingTabId = null;
    }
  }
}

function startTracking() {
  const trackingInterval = setInterval(() => {
    if (!isTracking) {
      clearInterval(trackingInterval);
      return;
    }

    chrome.storage.local.get(
      (["timeSpent", "timeLimit"],
      function (data) {
        const newTimeSpent = (data.timeSpent || 0) + 1; // Increment time spent by 1 second.
        chrome.storage.local.set({ timeSpent: newTimeSpent }); // Update time spent in storage.
        if (data.timeLimit && newTimeSpent >= data.timeLimit * 60) {
          // Send a message to the content script to show an overlay warning.
          chrome.tabs.sendMessage(trackingTabId, { action: "showOverlay" });
        }
      }),
    );
  }, 1000);
}
