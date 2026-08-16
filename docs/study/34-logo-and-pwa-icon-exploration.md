# 34 · Logo and PWA icon — designer exploration

**Status:** exploration — directions shipped to `/dev/brand` · **2026-08-16**

Companion to [UC-073](../use-cases/UC-073-choose-a-logo-and-app-icon.md) and
[`brand-explorer.md`](../specs/page/brand-explorer.md). Visual tokens from
**Warm Scholar** (chosen 2026-08-09 via `/dev/design`).

---

## Problem

The PWA scaffold shipped a placeholder three-bar mark (`public/icon.svg`) in
accent on canvas. Warm Scholar tokens are locked, but the mark was never
reviewed at favicon (32px), header (40px), or iOS Home Screen (120–180px)
sizes. Learners see this icon on their phone — it is part of the product promise.

---

## Constraints (from study/22 and DESIGN-SYSTEM)

| Rule | Implication for the mark |
| --- | --- |
| G1 — colour carries meaning | Mark uses **accent** on **canvas**; no extra palette in the icon |
| Not a game | No mascots, confetti shapes, or Duolingo-green energy |
| Text-heavy product | Marks that echo text (columns, stacks, folio) fit better than abstract swooshes |
| WCAG | Mono variant must read on `surface` without the canvas fill |
| Maskable PWA | Critical shape inside centre 80% circle — preview overlay on `/dev/brand` |

---

## UX designer review

### Verdict on five directions

| Direction | Favicon (32px) | Home Screen | Header lockup | Notes |
| --- | --- | --- | --- | --- |
| **Scholar bars** | ✓ Strong | ✓ | ✓ | **Default ship** — refined placeholder; three weights read as columns |
| **Open folio** | △ Spine vanishes | ✓ | ✓ | Literary; test on real device before replacing bars |
| **SL monogram** | ✗ Letters merge | △ | ✓✓ | Best beside wordmark; weak alone at 32px |
| **Language orbit** | ✓ Centre dot | ✓ | ✓ | Distinct; arcs may clip on tight masks — check safe zone |
| **Text stack** | △ Lines thin | ✓ | ✓ | Editorial; horizontal rules need 2px min at favicon |

### Recommendation

1. **Ship Scholar bars now** — lowest risk; honest evolution of the placeholder.
2. **Keep Open folio and Language orbit** in the explorer for owner A/B on device.
3. **Do not ship SL monogram** as the standalone PWA icon — use only in header
   lockups if the wordmark drops to an icon+text pattern later.
4. **Defer Text stack** until a designer vectors thicker rules for 32px.

### Header lockup (future — not in this change)

```
[ mono mark 40px ]  Sprachenlernen
```

Wordmark stays **Source Serif 4** semibold, `text-ink`. Mono mark on
`bg-surface` — no canvas fill behind the mark in the header.

### PWA manifest

| Asset | Path | Notes |
| --- | --- | --- |
| SVG icon | `public/icon.svg` | `purpose: maskable` in manifest |
| Next favicon | `app/icon.svg` | Must match `public/icon.svg` |
| Apple | `app/icon.svg` via Next metadata | iOS reads favicon chain |

Promote a direction: `node scripts/sync-brand-assets.mjs <direction-id>`.

---

## Source files

| Path | Role |
| --- | --- |
| `design/logo/directions/*.svg` | Designer source (512 artboard, rx 96) |
| `public/design/logo/directions/*.svg` | Served to `/dev/brand` previews |
| `data/brand/logo-directions.json` | Direction metadata |

---

## Open for designer

- [ ] Dark-canvas mark variant for `prefers-color-scheme: dark` Home Screen?
- [ ] PNG fallbacks (192, 512) for Android install UI?
- [ ] Replace text wordmark in `PublicHeader` with mark + text lockup?
- [ ] Wordmark as custom SVG paths (currently text in explorer mock only)?

## Check

Designer: open `/dev/brand` on phone and desktop — each direction readable at
32px and 120px; safe-zone overlay does not clip the mark. Run sync script after
sign-off.
