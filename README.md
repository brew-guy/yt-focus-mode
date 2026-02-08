# YouTube Focus Mode

A lightweight Chrome extension that transforms YouTube into a distraction-free viewing experience by hiding sidebars, comments, recommendations, and endscreens while expanding the video player to fill your entire viewport.

## Features

- **Instant Focus Mode**: Click the toolbar icon or press `Escape` to toggle distraction-free viewing
- **Auto-Activate**: Automatically enable focus mode when videos start playing
- **Keyboard Shortcuts**:
  - `Escape` - Exit focus mode
  - `Alt + F` - Toggle focus mode
- **Scroll Control**: Optional setting to block page scrolling while in focus mode
- **Smart Video Detection**: Automatically resets when navigating to new videos
- **Persistent Settings**: Your preferences sync across Chrome sessions

## Installation

### From Source

1. Clone this repository or download the ZIP file:

   ```bash
   git clone https://github.com/yourusername/yt-focus-mode.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked** and select the extension folder

5. The YouTube Focus icon should now appear in your toolbar

### From Chrome Web Store

_Coming soon..._

## Usage

### Basic Usage

1. Navigate to any YouTube video
2. Click the extension icon in your toolbar
3. Click **Activate Focus Mode** in the popup
4. The player expands to fullscreen while hiding all distracting elements
5. Press `Escape` to exit focus mode

### Settings

Open the extension popup to configure:

- **Auto-activate on video play**: Automatically enters focus mode when a video starts playing
- **Block page scrolling**: Prevents scrolling while focus mode is active

### What Gets Hidden

When focus mode is active, the following elements are removed:

- Top navigation bar
- Sidebar recommendations
- Comments section
- Video suggestions
- Endscreen overlays
- All other YouTube UI elements except the player controls

## Development

### Project Structure

```
yt-focus-mode/
├── manifest.json       # Extension configuration
├── content.js          # Main content script (focus mode logic)
├── popup.html          # Extension popup UI
├── popup.js            # Popup interaction logic
├── styles.css          # Focus mode styles
├── icons/              # Extension icons (16px, 48px, 128px)
└── README.md           # This file
```

### Key Files

- **[manifest.json](manifest.json)**: Declares permissions, content scripts, and popup configuration
- **[content.js](content.js)**: Toggles focus mode class, handles keyboard shortcuts, and manages auto-activate behavior
- **[styles.css](styles.css)**: CSS rules that hide YouTube elements when `body.uw-focus-mode` is active
- **[popup.html](popup.html)** / **[popup.js](popup.js)**: User interface for settings and manual toggle

### Making Changes

1. Edit the relevant files
2. Navigate to `chrome://extensions/`
3. Click the reload icon on the extension card
4. Refresh any open YouTube tabs to load the updated code

### Icon Generation

Chrome extensions require PNG icons in multiple sizes (16px, 48px, 128px) for the manifest. The **[convert_icons.html](convert_icons.html)** utility simplifies this process:

1. Open `convert_icons.html` in your browser
2. The page displays preview canvases for each required icon size
3. Click the **Download** button next to each size to save the PNG file
4. Place the downloaded files in the `icons/` directory

**How it works:**

- Contains an embedded SVG icon definition (blue rounded rectangle with play button and frame)
- Converts the SVG to PNG at each required size using HTML5 Canvas
- Generates properly sized icons that match Chrome's extension requirements

**To customize the icon:**

1. Edit the SVG code in [convert_icons.html](convert_icons.html) (lines 41-61)
2. Refresh the page to see your changes
3. Download the updated PNG files

### Testing

1. Load the extension in Chrome (see Installation)
2. Navigate to a YouTube video
3. Test each feature:
   - Manual toggle via popup
   - Keyboard shortcut (`Escape`)
   - Auto-activate setting
   - Scroll blocking setting
4. Verify focus mode works after navigating to different videos

### Common Development Issues

- **Styles not applying**: Check YouTube's DOM structure hasn't changed; update selectors in [styles.css](styles.css)
- **Player doesn't resize**: Verify the `resize` event dispatch in [content.js](content.js)
- **Settings not persisting**: Check `chrome.storage.sync` permissions in [manifest.json](manifest.json)

## Technical Details

### How It Works

1. **Content Script Injection**: [content.js](content.js) is injected into all YouTube watch pages
2. **CSS Toggle**: Adds/removes `uw-focus-mode` class on `<body>` element
3. **Element Hiding**: [styles.css](styles.css) uses `display: none !important` to hide distracting elements
4. **Player Resize**: Dispatches a `resize` event to trigger YouTube's internal responsive layout logic
5. **Message Passing**: Popup and content script communicate via Chrome's message passing API
6. **Auto-Activate**: MutationObserver watches for video element creation and play events

### Browser Compatibility

- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)
- Other Chromium browsers with extension support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Reporting Issues

If you encounter bugs or have feature requests:

1. Check existing issues first
2. Provide browser version and extension version
3. Include steps to reproduce the issue
4. Screenshots are helpful!

## License

MIT License - feel free to use and modify as needed.

## Version History

### v1.0.0 (2026-02-03)

- Initial release
- Focus mode toggle via popup and keyboard shortcuts
- Auto-activate on video play
- Scroll blocking option
- Smart video change detection

---

**Enjoy distraction-free YouTube viewing!** 🎬✨
