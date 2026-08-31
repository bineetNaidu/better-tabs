# Better Tabs project guide

## Purpose

Better Tabs is a zero-runtime-dependency WebExtension for desktop Firefox, Zen Browser, and Chromium browsers. It provides one focused way to find and act on live tabs without replacing native tab switching.

## Product glossary

- **TabControls** — the Raycast-style command palette opened with Alt/Option + Space. It searches all live tabs in the current window and supports activation, closing, and temporary Undo.
- **Activation history** — in-memory, per-window recency used to rank candidates. It resets when the browser restarts and is never uploaded.
- **Content script** — the small page-side UI layer. It may be unavailable on protected browser pages; tab activation must never depend on it.
- **Background** — the privileged extension layer that owns tab queries, sessions, commands, recency, activation, closing, and Undo.

## Engineering rules

- Keep runtime dependencies at zero: vanilla JavaScript, CSS, and WebExtension APIs only.
- Keep browser API calls isolated in `src/background.ts` and fail safely.
- Do not intercept or modify Ctrl+Tab.
- Do not query or rebuild the whole tab list on every key press.
- Do not add screenshots, telemetry, network calls, frameworks, or content-script interception of Ctrl+Tab.
- Preserve the `better-tabs-` CSS namespace. The user-facing product is TabControls.
- Run `npm run check` before changes are handed off.
