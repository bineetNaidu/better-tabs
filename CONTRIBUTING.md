# Contributing

Keep TabControls focused: a live, current-window tab palette. Do not add Ctrl+Tab interception, closed-tab archives, browsing-history persistence, screenshots, telemetry, network services, or runtime dependencies.

Browser API calls belong in `src/browser-api.ts` or `src/background.ts` and must fail safely. Keep UI classes under the `better-tabs-` namespace.

Before opening a pull request, run:

```sh
npm run check
npm run check-json
npm run build:firefox
npm run build:chrome
```

Test Firefox/Zen and Chrome/Chromium in disposable profiles with multiple windows, many tabs, duplicate titles, loading and protected pages, pinned/hidden tabs, title/hostname/URL search, keyboard navigation, activation, Delete/Undo, externally closed tabs disappearing, reloads, restarts, reduced motion, and shortcut conflicts.

Include the browser version, operating system, target build, and reproduction steps in bug reports.
