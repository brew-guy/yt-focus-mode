(function () {
  // Settings loaded from chrome.storage
  let settings = {
    autoActivate: false,
    blockScroll: true,
  };

  // State to track if user manually exited focus mode
  let manualExit = false;
  let lastVideoId = new URLSearchParams(window.location.search).get("v");
  let autoActivateObserver = null;

  // Helper function to check if we're on a new video
  function checkVideoChange() {
    const currentVideoId = new URLSearchParams(window.location.search).get("v");
    if (currentVideoId !== lastVideoId) {
      lastVideoId = currentVideoId;
      manualExit = false; // Reset manual exit for new video
      return true;
    }
    return false;
  }

  // Load settings on initialization
  chrome.storage.sync.get(
    { autoActivate: false, blockScroll: true },
    (result) => {
      settings = result;
      applySettings();
    },
  );

  function applySettings() {
    if (settings.autoActivate) {
      setupAutoActivate();
    } else {
      teardownAutoActivate();
    }

    // Toggle the no-scroll helper class on the body
    // This allows the CSS to conditionally apply overflow: hidden
    // only when both .uw-focus-mode AND .uw-no-scroll are present
    if (settings.blockScroll) {
      document.body.classList.add("uw-no-scroll");
    } else {
      document.body.classList.remove("uw-no-scroll");
    }
  }

  // Helper function to toggle focus mode
  function toggleFocusMode() {
    document.body.classList.toggle("uw-focus-mode");

    // Trigger a window resize event to force YouTube's
    // internal player logic to recalculate dimensions
    window.dispatchEvent(new Event("resize"));

    const isActive = document.body.classList.contains("uw-focus-mode");
    console.log("Focus Mode:", isActive ? "ON" : "OFF");

    if (!isActive) {
      manualExit = true; // User manually turned it off
    } else {
      manualExit = false; // User manually turned it on
    }

    // Send state back to popup if it exists
    try {
      chrome.runtime
        .sendMessage({
          type: "focusModeState",
          isActive: isActive,
        })
        .catch(() => {
          // Popup might not be open, ignore error
        });
    } catch (e) {
      // Extension context invalidated - ignore
    }
  }

  function setupAutoActivate() {
    // Check for existing video on page load
    const video = document.querySelector("video");

    // Ensure we check video change here too
    checkVideoChange();

    if (video && !video.paused && !manualExit) {
      activateFocusMode();
    }

    // Listen for play events on video elements
    document.addEventListener(
      "play",
      (e) => {
        checkVideoChange();

        if (
          e.target.tagName === "VIDEO" &&
          !document.body.classList.contains("uw-focus-mode") &&
          !manualExit
        ) {
          activateFocusMode();
        }
      },
      true,
    );

    // Watch for video element creation (SPA navigation)
    if (!autoActivateObserver) {
      autoActivateObserver = new MutationObserver(() => {
        checkVideoChange();

        const video = document.querySelector("video");
        if (
          video &&
          !video.paused &&
          !document.body.classList.contains("uw-focus-mode") &&
          !manualExit
        ) {
          activateFocusMode();
        }
      });

      autoActivateObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  function activateFocusMode() {
    if (manualExit) return;
    if (!document.body.classList.contains("uw-focus-mode")) {
      document.body.classList.add("uw-focus-mode");
      window.dispatchEvent(new Event("resize"));

      console.log("Focus Mode: AUTO-ACTIVATED");

      try {
        chrome.runtime
          .sendMessage({
            type: "focusModeState",
            isActive: true,
          })
          .catch(() => {});
      } catch (e) {
        // Extension context invalidated - ignore
      }
    }
  }

  function teardownAutoActivate() {
    if (autoActivateObserver) {
      autoActivateObserver.disconnect();
      autoActivateObserver = null;
    }
  }

  // Listen for keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    // Alt + F to toggle (legacy, but Chrome might conflict)
    if (e.altKey && e.code === "KeyF") {
      e.preventDefault();
      toggleFocusMode();
    }

    // Escape to exit focus mode
    if (
      e.code === "Escape" &&
      document.body.classList.contains("uw-focus-mode")
    ) {
      toggleFocusMode();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "toggleFocusMode") {
      toggleFocusMode();
      sendResponse({ success: true });
    } else if (message.type === "getFocusState") {
      sendResponse({
        isActive: document.body.classList.contains("uw-focus-mode"),
      });
    } else if (message.type === "updateSettings") {
      settings = message.settings;
      applySettings();
      sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
  });
})();
