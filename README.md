# Better Tabs

**A searchable command palette for your open tabs.**

Better Tabs helps you rediscover useful live tabs without bookmarks, history sync, or a second tab manager. Press `Option/Alt + Space` to open TabControls, search by title, hostname, or URL, then activate or close a result.

## Features

- Searches every open tab in the active window.
- Empty search is prioritized by active state and current-session recency.
- Keyboard navigation with Arrow Up/Down, Enter, Delete, and Escape.
- Click-to-activate and temporary five-second Undo after closing.
- Refreshes safely when tabs are created, updated, activated, or closed elsewhere.
- Works with protected pages by keeping activation in the background layer.
- No Ctrl+Tab interception, screenshots, network calls, analytics, or telemetry.

## Local installation

Build the target you want, then load the generated folder as a temporary extension.

```sh
npm install
npm run build:firefox
```

In Firefox or Zen, open `about:debugging`, choose **This Firefox** or **This Zen**, select **Load Temporary Add-on**, and choose `dist/firefox/manifest.json`.

For Chrome or Chromium:

```sh
npm run build:chrome
```

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `dist/chrome`.

The extension is temporary during local development. Rebuild and reload it after changes. The shortcut can be changed in the browser's extension shortcut settings.

## Scope and privacy

TabControls includes only live tabs in the active browser window. It does not search other windows, bookmarks, browsing history, recently closed tabs, or archives. Recency metadata is held in memory and resets when the browser restarts; closed-tab metadata is removed immediately.

**Better Tabs collects no data.** No browsing data leaves the browser.

## Development

```sh
npm run check
npm run build:firefox
npm run build:chrome
```

Test multiple windows, 2/5/20/50+ tabs, duplicate titles, loading/unloaded tabs, pinned/hidden tabs, protected pages, keyboard-only navigation, external tab closure, Delete/Undo, reloads, restarts, reduced motion, and shortcut conflicts.

Runtime dependencies are zero. The repository uses Vite, Preact, and TypeScript as development/build tooling; the shipped extension contains only bundled code and browser APIs.

## Compatibility

Primary targets are desktop Firefox, Zen Browser, Chrome, and Chromium-derived browsers on macOS, Windows, and Linux. Browser API calls are isolated behind a small internal compatibility adapter for Firefox Promise APIs and Chromium callback APIs.

Better Tabs is an independent open-source project and is not affiliated with or endorsed by the Zen Browser team.

## Contributing and license

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Better Tabs is released under the MIT license; see [`LICENSE`](LICENSE).
