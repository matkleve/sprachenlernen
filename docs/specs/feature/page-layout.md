# Page layout — how signed-in pages are built

<!-- id: SPEC-feature-page-layout -->
<!-- use-case: UC-063 -->
<!-- status: active -->

The contract for stacking **shell chrome**, **scrims**, and **page content** on
every signed-in route. Answers: who owns padding, when the page scrolls, and
when content must fit one screen. **Parent:** [`app-shell.md`](app-shell.md),
[`mobile-nav-v2.md`](mobile-nav-v2.md). **Reasoning:**
[`../../study/28-mobile-desktop-layout.md`](../../study/28-mobile-desktop-layout.md). **Reasoning:**
[`../../study/28-mobile-desktop-layout.md`](../../study/28-mobile-desktop-layout.md).

## Scope

- **In:** three **layout modes**; responsibility split between shell, route, and
  feature; mobile vs desktop; token names; scrim and tap-shield rules; Safari /
  PWA viewport behaviour.
- **Out:** marketing routes (no shell); desktop header composition (see
  `app-shell.md`); review-session FSM; method-menu filter behaviour.

## Industry patterns (why we chose this)

Mobile web shells usually pick one of two architectures:

| Pattern | How it works | Trade-off |
| --- | --- | --- |
| **Flex shell** | `h-dvh overflow-hidden` on the root; header and bottom nav are flex children; only `<main>` scrolls | Stable on iOS standalone PWAs; nav is not visually "floating" |
| **Fixed overlay chrome** | Header and bottom nav are `position: fixed`; `<main>` gets padding reserves; optional `visualViewport` JS for dynamic browser chrome | Matches native tab bars; needs tap shields and measured insets |

**We use fixed overlay chrome** on `< md` because the product spec calls for
floating pills, blur scrims, and a centred title that scales on scroll — a flex
child nav cannot sit above scrolling content with the same visual. **`env(safe-area-inset-*)`**
handles the home indicator and notch; it does **not** hide Safari's in-browser
bottom toolbar — that needs the **`visualViewport` API**
(`useVisualViewportBottomInset`) or the toolbar is simply present.

**Rejected for this app:**

- `interactive-widget: resizes-content` — reserves space for Safari's toolbar on
  every page; see [`../../TRAPS.md`](../../TRAPS.md).
- A fixed `3rem` bottom lift — wrong when the toolbar is absent (`/methods`).
- Flex-only shell without overlays — conflicts with floating pill + scrim design.
- `position: fixed` on `body` — iOS clips nested scrollers; our scroll stays on
  `document` / `<main>`.

## Layout modes

Each `(app)` route declares exactly one mode. The registry lives in
[`lib/shell-page-layout.ts`](../../../lib/shell-page-layout.ts) (plan:
[`../../plans/page-layout.md`](../../plans/page-layout.md)).

| Mode | Routes (v1) | Scroll | Mobile chrome |
| --- | --- | --- | --- |
| `scrollable-destination` | `/methods`, `/words`, `/progress` | Page scrolls inside `<main>` | Language chip + pill; header scrim on scroll |
| `scrollable-drill-in` | `/methods/[id]` | Page scrolls | Back chip + pill; no language chip |
| `one-screen-runner` | `/words/review` while `?method=srs-session` is active | **No page scroll** on `< md` | Back chip + pill; session uses `--height-review-session` |

Marketing routes and error-only states on `/words/review` (unknown method, not
built) use **`scrollable-drill-in`** rhythm — they scroll like a drill-in page.

## Responsibility split

```
┌─────────────────────────────────────────────┐
│  Shell (AppShell + FloatingShellChrome)     │
│  · min-h-svh root                           │
│  · <main> pt/pb shell float tokens (mobile) │
│  · fixed header title + corner chips        │
│  · fixed bottom pill + FooterScrim          │
│  · useVisualViewportBottomInset (mobile)    │
└─────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│  Route (app/(app)/…/page.tsx)               │
│  · thin — fetch, validate, pick feature     │
│  · applies mode wrapper classes only        │
└─────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│  Feature component (`ShellPageContent`)       │
│  · scrollable: max-width + pt-page-top        │
│    pb-page-bottom (horizontal px-6)           │
│  · runner: h-review-session + overflow      │
│    hidden on < md                           │
└─────────────────────────────────────────────┘
```

**Reuse:** `ShellPageContent` in `features/app-shell/` implements the feature
wrapper layer below.

**Shell owns** top/bottom **reserve** so floats never cover content.
**Features own** horizontal padding and **page rhythm** (`pt-page-top`,
`pb-page-bottom`). Features must **not** add their own bottom padding for the
destination pill or Safari toolbar.

## Tokens (`app/globals.css`)

| Token | Owner | Purpose |
| --- | --- | --- |
| `--spacing-page-top`, `--spacing-page-bottom` | Feature wrappers | Vertical rhythm inside the scroll area |
| `--spacing-shell-float-top`, `--shell-float-top-active` | Shell | Top reserve under floating title/chips |
| `--spacing-shell-float-bottom` | Shell | Bottom reserve above pill + browser chrome |
| `--shell-visual-viewport-bottom-inset` | `useVisualViewportBottomInset` | Dynamic Safari toolbar height |
| `--height-review-session` | Runner routes | `100svh − top − bottom` on mobile |

When the mobile title wraps to two lines, `ShellPageTitle` sets
`--shell-float-top-active` to `--spacing-shell-float-top-expanded`.

## Scrims and tap shield

| Surface | Component | Behaviour |
| --- | --- | --- |
| Header | `DesktopShellHeader` / title stack | Blur + tint; fades in on scroll |
| Footer | `FooterScrim` | Blur + tint behind pill; **pointer-events** on dead zones block taps to content underneath |

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Scrolls a scrollable destination on mobile | Content moves; floats stay fixed; header scrim intensifies |
| 2 | Opens `/words/review?method=srs-session` on mobile | Session body height is `--height-review-session`; no vertical page scroll |
| 3 | Opens `/words/review` without a session | Scrollable drill-in layout; unknown-method copy scrolls normally |
| 4 | Resizes visual viewport (Safari toolbar, keyboard) | Bottom pill repositions via `--shell-visual-viewport-bottom-inset` |
| 5 | Viewport ≥ `md` | Flat sticky top header (desktop **and iPad**); no floating pill; runner may scroll on desktop/tablet |

## Breakpoints (owner 2026-08-15)

| Viewport | Chrome | Nav style |
| --- | --- | --- |
| `< md` (phone) | Floating overlay | Bottom icon pill + corner chips |
| `≥ md` (desktop, iPad) | Flat sticky header | Labelled top links; no bottom pill |

iPad is a **first-class** target at the `≥ md` tier — same shell as desktop, with
iPad Safari in manual QA. Floating chrome does not extend to tablet width.

## Acceptance criteria

- [ ] Given a scrollable destination on mobile, when content is taller than the
      viewport, then `<main>` scrolls and floats remain visible without covering
      the first or last line of content.
- [ ] Given `/words/review?method=srs-session` on viewport &lt; `md`, when a card
      is shown, then the page does not scroll vertically (one-screen runner).
- [ ] Given viewport &lt; `md`, when the learner taps the bottom pill's scrim
      dead zone, then underlying page content does not receive the tap.
- [ ] Given any signed-in feature page using scrollable mode, then content uses
      `pt-page-top pb-page-bottom` and does **not** add extra bottom padding for
      shell chrome.
- [ ] Given iOS Safari with its bottom toolbar visible, when the shell renders,
      then the destination pill sits above the toolbar (measured inset, not a
      fixed offset).

## Check

`npm test -- shell-page` — layout mode registry and `ShellPageContent` wrapper classes.
