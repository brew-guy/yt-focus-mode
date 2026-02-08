// Popup script for YouTube Focus Mode extension

const toggleBtn = document.getElementById("toggleBtn");
const autoActivateCheckbox = document.getElementById("autoActivate");
const blockScrollCheckbox = document.getElementById("blockScroll");

// Default settings
const DEFAULT_SETTINGS = {
  autoActivate: false,
  blockScroll: true,
};

// Load settings from chrome.storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    autoActivateCheckbox.checked = result.autoActivate;
    blockScrollCheckbox.checked = result.blockScroll;
    return result;
  } catch (error) {
    console.error("Error loading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to chrome.storage
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set(settings);

    // Notify content script of settings change
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      chrome.tabs
        .sendMessage(tab.id, {
          type: "updateSettings",
          settings: settings,
        })
        .catch(() => {
          // Content script might not be ready yet
        });
    }
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Handle checkbox changes
function updatePreferences() {
  const settings = {
    autoActivate: autoActivateCheckbox.checked,
    blockScroll: blockScrollCheckbox.checked,
  };
  saveSettings(settings);
}

autoActivateCheckbox.addEventListener("change", updatePreferences);
blockScrollCheckbox.addEventListener("change", updatePreferences);

// Query the active tab and get focus mode state
async function updateUIState() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Only work on YouTube watch pages
    if (!tab.url || !tab.url.includes("youtube.com/watch")) {
      toggleBtn.disabled = true;
      toggleBtn.textContent = "Open a YouTube video";
      toggleBtn.classList.add("inactive");
      toggleBtn.classList.remove("active");
      return;
    }

    // Get current focus mode state from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "getFocusState",
    });

    if (response.isActive) {
      toggleBtn.textContent = "Exit Focus Mode";
      toggleBtn.classList.add("active");
      toggleBtn.classList.remove("inactive");
    } else {
      toggleBtn.textContent = "Activate Focus Mode";
      toggleBtn.classList.add("inactive");
      toggleBtn.classList.remove("active");
    }
    toggleBtn.disabled = false;
  } catch (error) {
    console.error("Error updating UI state:", error);
    toggleBtn.disabled = true;
    toggleBtn.textContent = "Reload page to enable";
  }
}

// Toggle focus mode when button is clicked
toggleBtn.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab.url && tab.url.includes("youtube.com/watch")) {
      await chrome.tabs.sendMessage(tab.id, { type: "toggleFocusMode" });

      // Update UI after toggle
      setTimeout(updateUIState, 100);
    }
  } catch (error) {
    console.error("Error toggling focus mode:", error);
  }
});

// Update state when popup opens
loadSettings();
updateUIState();

// Listen for state changes from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "focusModeState") {
    updateUIState();
  }
});
