let overlay = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showOverlay") {
    createOverlay();
  }
});

function createOverlay() {
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.className = "twitter-guardian-overlay";

  const message = document.createElement("div");
  message.className = "twitter-guardian-message";
  message.innerHTML = `
    <h2>Time's Up!</h2>
    <p>You've reached your daily Twitter time limit.</p>
    <p>Take a break or adjust your limit in the extension settings.</p>
    <button id="dismissOverlay">Dismiss</button>
  `;

  overlay.appendChild(message);
  document.body.appendChild(overlay);

  document.getElementById("dismissOverlay").addEventListener("click", () => {
    overlay.remove();
    overlay = null;
  });
}
