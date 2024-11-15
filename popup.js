document.addEventListener("DOMContentLoaded", function () {
  const timeLimitInput = document.getElementById("timeLimit");
  const timeRemainingSpan = document.getElementById("timeRemaining");
  const saveLimitButton = document.getElementById("saveLimit");
  const resetTimeButton = document.getElementById("resetTime");
  const dailyStats = document.getElementById("dailyStats");

  function updateDisplay() {
    chrome.storage.local.get(["timeLimit", "timeSpent"], function (data) {
      if (data.timeLimit) {
        timeLimitInput.value = data.timeLimit;
      }
      updateTimeDisplay(data.timeLimit, data.timeSpent || 0);
      updateStats(data.timeSpent || 0);
    });
  }

  updateDisplay();
  setInterval(updateDisplay, 1000);

  saveLimitButton.addEventListener("click", function () {
    const limit = parseInt(timeLimitInput.value);
    if (limit > 0 && limit <= 1440) {
      chrome.storage.local.set({ timeLimit: limit }, function () {
        alert("Time limit saved successfully!");
        updateDisplay();
      });
    } else {
      alert("Please enter a valid time limit.");
    }
  });

  resetTimeButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to reset the timer?")) {
      chrome.storage.local.set({ timeSpent: 0 }, function () {
        updateDisplay();
      });
    }
  });

  function updateTimeDisplay(limit, spent) {
    if (!limit) {
      timeRemainingSpan.textContent = "--:--";
      return;
    }
    const remaining = Math.max(0, limit * 60 - spent);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    timeRemainingSpan.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function updateStats(timeSpent) {
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    dailyStats.textContent = `Time spent today: ${minutes}m ${seconds}s`;
  }
});
