# UC-067 — choose how the app should feel

<!-- id: UC-067 -->
<!-- specs: SPEC-page-design-explorer -->

**Who:** a product owner or designer deciding the app's visual identity
**Wants to:** compare a small set of coherent design directions side by side
**So that:** they can pick type, color, radius and border weight with confidence
before tokens are locked into `app/globals.css`

## Today

Design decisions live as prose in `docs/DESIGN-SYSTEM.md` and as one token set in
`app/globals.css`. Comparing alternatives means imagining them or mocking in an
external tool — disconnected from real components.

## Success looks like

- Five named directions, each with a distinct font family, palette, corner radius
  and border weight
- Each direction previews real primitives (buttons, fields, cards, badges) under
  its tokens
- A single selection is remembered between visits so comparison is not restarted

## Out of scope

- Applying a chosen theme to the live app (this page is exploration only)
- Dark-mode variants per direction (light only for now)
- Custom theme editing or exporting token files
