# Plan — page layout (shell chrome + scroll modes)

**Status:** spec + registry + `ShellPageContent` shipped on signed-in surfaces.
**Change class:** Standard (docs + small helper).

Contract: [`../specs/feature/page-layout.md`](../specs/feature/page-layout.md).
Layer diagram: [`../specs/feature/page-layout.layers.md`](../specs/feature/page-layout.layers.md).

## Decisions (2026-08-15)

1. **Three layout modes** — `scrollable-destination`, `scrollable-drill-in`,
   `one-screen-runner`. One mode per route; registry in `lib/shell-page-layout.ts`.
2. **Fixed overlay chrome on mobile** — floating pill + scrims stay; flex-only
   shell rejected (see spec § Industry patterns).
3. **Shell owns vertical reserves** — `<main>` `pt`/`pb` float tokens; features
   own `pt-page-top` / `pb-page-bottom` only.
4. **Safari toolbar** — cannot be hidden in-browser; `useVisualViewportBottomInset`
   adapts pill position. Home Screen PWA may differ; not a separate mode.
5. **Runner height** — `--height-review-session` on mobile; desktop may scroll.
6. **Chrome families (owner 2026-08-15)** — floating pill `< md` only; flat top
   nav `≥ md` (desktop + iPad). Review keeps destination pill visible.
7. **iPad** — first-class at `≥ md`; no separate rail layout in v1.

## Files

| File | Role |
| --- | --- |
| `docs/specs/feature/page-layout.md` | Normative contract |
| `lib/shell-page-layout.ts` | Route → mode registry |
| `lib/shell-page-layout.test.ts` | Registry tests |
| `features/app-shell/ShellPageContent.tsx` | Feature page wrapper (`pt-page-top`, runner height) |
| `features/app-shell/FooterScrim.tsx` | Footer tap shield |
| `features/app-shell/useVisualViewportBottomInset.ts` | Dynamic bottom inset |
| `app/globals.css` | Shell + page + runner tokens |
| `app/(app)/words/review/page.tsx` | Runner wrapper (`h-review-session`) |

## Follow-up (optional, Track A)

**T-SHELL-04 · Decouple footer scrim from pill** — **shipped 2026-08-15**

- Scrim zone: `bottom: 0`, height grows with `--shell-visual-viewport-bottom-inset`
- Pill: `shell-float-nav-pill` with `--spacing-shell-float-nav-pad-y`

**T-SHELL-03 · iPad shell QA**

- **Class:** Standard
- **Scope:** iPad Safari portrait + landscape — flat top nav, touch targets on
  `NavLink`, review runner height, language popover
- **Done when:** LIVE CHECK steps pass on iPad; any failures filed as bugs

**T-SHELL-02 · Lint against double bottom padding**

- **Class:** Trivial
- **Idea:** `check:tokens` or a small script flags `pb-shell-float-bottom` outside
  `AppShell.tsx` — features must not reserve shell space twice

## LIVE CHECK (you)

1. Phone &lt; 768px — open `/words`, scroll to bottom; last content clears the pill.
2. `/words/review?method=srs-session` — card + grades visible without page scroll.
3. `/words/review` with no `method` — page scrolls; back chip present.
4. `/methods` vs `/words` in iOS Safari — pill sits above toolbar when visible,
   normal bottom when not.
5. **iPad** (`≥ md`) — flat top nav with labelled Methods / Words / Progress; no
   bottom pill; review session scrolls; language switcher inline in header.
