# Brand explorer — compare logo and PWA icon directions

<!-- id: SPEC-page-brand-explorer -->
<!-- use-case: UC-075 -->
<!-- status: active -->

A dev-facing page at `/dev/brand` where a product owner or designer compares
five app-mark directions at favicon, header, and Home Screen sizes before
promoting one to `public/icon.svg`. Serves
[UC-075](../../use-cases/UC-075-choose-a-logo-and-app-icon.md).

**Reuse: Button** — choose control matches the design explorer pattern.

## Scope

- **In:** five logo directions from `data/brand/logo-directions.json`; per-direction
  preview at four sizes; mono mark in a header lockup mock; maskable safe-zone
  overlay; one selectable direction in `localStorage`; shipped badge on the
  current production mark.
- **Out:** auto-updating `public/icon.svg` from the page (use
  `scripts/sync-brand-assets.mjs` instead); dark-canvas mark variants; animated
  marks; navigation entry in the app shell (URL only). Account required: **no** —
  `/dev/*` is public like `/dev/design`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/dev/brand` | Five direction cards in a responsive grid |
| 2 | Reads a card | Sees name, tagline, rationale, basis chip, size previews, header lockup |
| 3 | Clicks **Choose this direction** | Card shows selected state; choice persists in `localStorage` |
| 4 | Returns later | Previously chosen card is still selected |
| 5 | Reads shipped badge | The direction marked `shipped: true` in data shows a **Shipped** chip |

## States

| State | Trigger | Visual / behavioral effect | Terminal? |
| --- | --- | --- | --- |
| browsing | initial / no stored choice | No card marked selected | no |
| selected | user chooses a direction | One card has selected styling; key written to `localStorage` | no |

Loading, error and empty do not apply — directions are static data.

## Data

| Field | Source | Owner |
| --- | --- | --- |
| Direction definitions | `data/brand/logo-directions.json` | build-time data |
| Source SVGs | `design/logo/directions/` (served from `public/design/logo/`) | design workspace |
| `brand-explorer-choice` | `localStorage` | client |

## Acceptance criteria

- [ ] Given a signed-out visitor, when `/dev/brand` is requested, then the page
  renders without redirecting to sign-in.
- [ ] Given a first visit, when `/dev/brand` loads, then five direction cards
  are visible.
- [ ] Given any direction card, when the user reads it, then favicon, header,
  Home Screen, and store size previews are visible.
- [ ] Given any direction card, when the user reads it, then a header lockup
  shows the mono mark beside the wordmark **Sprachenlernen**.
- [ ] Given the shipped direction, when `/dev/brand` loads, then that card shows
  a **Shipped** chip.
- [ ] Given no stored choice, when the user clicks **Choose this direction** on
  card B, then only card B shows selected state.
- [ ] Given card B was chosen, when the user reloads the page, then card B still
  shows selected state.

## Check

`npm test -- features/brand-explorer`
