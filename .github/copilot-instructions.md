# YouTube Focus - AI Agent Instructions

## Project Overview

A lightweight Chrome extension that enables focus mode on YouTube videos by hiding distractions (sidebar, comments, recommendations, endscreens) and expanding the player to fill the viewport. Activated via toolbar icon popup or `Escape` key to exit.

## Architecture

### Component Structure

- **[manifest.json](manifest.json)**: Declares extension metadata, permissions, content script injection, popup UI, and icons
- **[content.js](content.js)**: Runtime script injected into YouTube watch pages; handles focus mode toggle via messages and keyboard shortcuts
- **[styles.css](styles.css)**: CSS selectors targeting YouTube's DOM structure to hide/show elements and resize player
- **[popup.html](popup.html)**: Popup UI shown when clicking extension icon in toolbar
- **[popup.js](popup.js)**: Handles popup logic and message passing to content script
- **[icons/](icons/)**: SVG icons at 16px, 48px, 128px for toolbar and extension store

### Key Data Flow

1. **Icon activation**: User clicks extension icon → `popup.html` opens → `popup.js` sends `toggleFocusMode` message → `content.js` toggles `body.uw-focus-mode` class
2. **Keyboard exit**: User presses `Escape` on YouTube → `content.js` detects and exits focus mode if active
3. **Player resize**: After class toggle, `resize` event dispatched to notify YouTube's player of dimension changes
4. **State sync**: Content script sends `focusModeState` messages back to popup to update button UI

### Message Passing Architecture

**Popup → Content Script:**

- `{type: "toggleFocusMode"}` - Toggle focus mode on/off
- `{type: "getFocusState"}` - Query current focus mode state
- `{type: "updateSettings", settings: {...}}` - Update user preferences

**Content Script → Popup:**

- `{type: "focusModeState", isActive: boolean}` - Notify popup of state changes

### Settings & Storage

User preferences are persisted using `chrome.storage.sync`:

- **Auto-activate**: Automatically enable focus mode when video starts playing
- Settings loaded on popup open and content script initialization
- Changes trigger immediate `updateSettings` message to active tabs
- Default settings defined in [popup.js](popup.js) `DEFAULT_SETTINGS` object

## Critical Developer Patterns

### YouTube DOM Selectors

The extension targets specific YouTube elements that may change between YouTube versions:

- `#masthead-container` - Header bar
- `#secondary` - Sidebar recommendations
- `#primary` - Main video container
- `#player-container-outer` - Player wrapper
- `ytd-watch-flexy` - Flex layout container

**Important**: If focus mode breaks, first check YouTube's DOM structure for selector changes.

### CSS Strategy

- Uses `!important` flags to override YouTube's inline styles and specificity
- Applies `overflow: hidden` to body to prevent scroll during focus mode
- Sets viewport units (`100vw`, `100vh`) rather than percentages for true fullscreen feel

### Event Dispatch Pattern

After toggling the focus class, the extension dispatches a `resize` event to force YouTube's internal player to recalculate layout. This is critical for responsive player behavior.

### Auto-Activate Pattern

When auto-activate is enabled ([content.js](content.js)):

1. **Play event listener**: Detects when `<video>` element starts playing (bubbled with `capture: true`)
2. **MutationObserver**: Watches for new video elements (handles YouTube SPA navigation)
3. **Initial check**: Runs on page load to catch already-playing videos
4. **Smart activation**: Only activates if focus mode is not already active
5. **Teardown**: Observer disconnected when preference is disabled

## Testing & Debugging

### Manual Testing

1. Install extension in Chrome: `chrome://extensions/ > Developer mode > Load unpacked`
2. Select the extension folder
3. Navigate to any YouTube video
4. **Icon activation**: Click extension icon in toolbar → verify popup opens with "Activate Focus Mode" button
5. Click button or press `Escape` to toggle:
   - Distracting elements disappear
   - Player expands to fill screen
   - Video remains playable
   - Button updates to "Exit Focus Mode"
6. **Test auto-activate**: Enable "Auto-activate on video play" checkbox → navigate to new video → verify focus mode activates automatically
7. Press `Escape` to exit focus mode
8. **Reload test**: After modifying code, click reload icon on `chrome://extensions/` page

### Common Issues

- **Selectors not matching**: YouTube periodically changes DOM structure; inspect elements and update [styles.css](styles.css)
- **Player doesn't resize**: Verify `resize` event dispatch in [content.js](content.js) line 7
- **Popup not opening**: Check [manifest.json](manifest.json) `action.default_popup` points to correct file
- **Message passing fails**: Content script might not be injected yet; reload the YouTube page
- **Icons not showing**: SVG files must be in `icons/` directory and referenced in manifest
- **Auto-activate not working**: Check `chrome.storage` permission in manifest and verify MutationObserver setup
- **Settings not persisting**: Verify `storage` permission and check browser console for chrome.storage errors

## Modification Guidelines

### Adding New Hidden Elements

Edit [styles.css](styles.css) and add the selector under `body.uw-focus-mode`:

```css
body.uw-focus-mode #new-element {
  display: none !important;
}
```

### Changing the Shortcut Key

Modify [content.js](content.js) line 4:

- `e.altKey` - require Alt modifier
- `e.code === "KeyF"` - change to different key code (e.g., `"KeyX"`)

### Updating Permissions

If accessing background resources, update [manifest.json](manifest.json) `permissions` array.

### Adding Popup UI Features

Edit [popup.html](popup.html) for UI changes and [popup.js](popup.js) for logic:

- Add new preferences to `DEFAULT_SETTINGS` object
- Update UI with form elements (checkboxes, select dropdowns, etc.)
- Use `chrome.storage.sync` to persist user settings
- Send `updateSettings` message to content script via `chrome.tabs.sendMessage()`
- Load settings on popup open with `loadSettings()`

### Icon Customization

Replace SVG files in [icons/](icons/) directory:

- Maintain sizes: 16px (toolbar), 48px (management page), 128px (web store)
- Update paths in [manifest.json](manifest.json) if changing filenames
