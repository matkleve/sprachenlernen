# UC-073 — choose a logo and app icon

<!-- id: UC-075 -->
<!-- specs: SPEC-page-brand-explorer -->

**Who:** a product owner or designer deciding the app's mark and PWA icon
**Wants to:** compare logo directions at real sizes (favicon, header, Home Screen)
**So that:** they can pick an app mark with confidence before it ships to
`public/icon.svg` and the web manifest

## Today

The PWA ships a placeholder three-bar mark in accent on canvas. Warm Scholar
tokens are locked, but the mark was never reviewed at favicon or Home Screen
sizes. Comparing alternatives means opening SVGs in isolation.

## Success looks like

- Five named directions, each with rationale tied to the chosen Warm Scholar theme
- Each direction previews at favicon, header, Home Screen, and store sizes
- Mono variant shown in a header lockup beside the wordmark
- A single selection persists between visits
- A script promotes the chosen SVG to `public/icon.svg` and `app/icon.svg`

## Out of scope

- Animated logos or full brand guidelines PDF
- Replacing the text wordmark in `PublicHeader` automatically (designer picks,
  then a separate change updates the header)
- Android `beforeinstallprompt` icon variants beyond the manifest SVG
