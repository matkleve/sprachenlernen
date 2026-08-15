# 29 · iOS Safari bottom inset by route — why `/methods` looks different

Investigation report (2026-08-15, revised same day). **Question:** why does
`/methods` appear to have **no inset** for iOS Safari controls while `/words`
and `/progress` do?

**Short answer:** the app applies the **same** bottom-inset mechanism on every
signed-in route. The difference is **Safari's toolbar state in that browser
session** — not different shell code and **not** page length.

**Policy:** **do not** add per-route inset hacks. **Do** keep
`useVisualViewportBottomInset` and the footer-scrim split. See
[`../specs/feature/page-layout.md`](../specs/feature/page-layout.md) § Safari
bottom toolbar.

---

## Executive summary

| Claim | Verdict |
| --- | --- |
| `/methods` uses different inset CSS than `/words` | **False** — identical classes and hooks |
| `/methods` skips `useVisualViewportBottomInset` | **False** — runs in `FloatingShellChrome` on every route |
| Safari bottom toolbar is absent more often on `/methods` at first glance | **True** — observed; environmental |
| Words/Progress are longer pages → more toolbar | **False** — `/methods` is ~10× taller (~18k vs ~1.8k px) |
| A fixed bottom lift would “fix” Methods | **Wrong** — pill floated too high when toolbar absent |
| Per-route code can normalise toolbar visibility | **False** — no web API; Apple documents this as intended |

When `--shell-visual-viewport-bottom-inset` is `0px`, the pill sits at
`safe-area + gap` only — **correct** when Safari's toolbar is hidden. When Safari
shows back/share/tabs, the hook measures ~50px and the pill lifts; the footer
scrim **grows** with that inset but stays anchored to `bottom: 0`.

---

## What we do and do not do

### Do (shipped — keep)

| Action | Why |
| --- | --- |
| `useVisualViewportBottomInset` on every signed-in mobile route | Only signal Safari exposes (`visualViewport` resize/scroll) |
| Dynamic `--shell-visual-viewport-bottom-inset` | `0` when no toolbar; measured when present |
| Footer scrim at `bottom: 0`; pill in `.shell-float-nav-pill` | Scrim full-bleeds; pill lifts independently |
| Document + LIVE CHECK | Prevents agents “fixing” Methods with per-route lifts |

### Do not (rejected)

| Action | Why |
| --- | --- |
| Per-route bottom inset or padding | Same shell on all routes; pathname is not the cause |
| Fixed `rem` bottom lift | Wrong when toolbar absent (original Methods bug) |
| Scroll hacks to hide Safari toolbar | Apple: no reliable auto-collapse on scroll (iOS 15+ stable); no API |
| `interactive-widget: resizes-content` on iOS | **Not supported** in iOS Safari ([WebKit #259770](https://bugs.webkit.org/show_bug.cgi?id=259770)); removed from `app/layout.tsx` anyway |
| Force toolbar visible/hidden per URL | Impossible in Mobile Safari |

### Optional later (out of scope)

- **Add to Home Screen** — standalone mode has no in-browser Safari toolbar; different chrome, not a bug in in-browser shell.
- **iPad `≥ md`** — flat top nav; footer pill hidden.

---

## Page length (corrected)

Estimated mobile scroll height (390px wide, single column, component model):

| Route | Approx. content height | ~iPhone screens |
| --- | ---: | ---: |
| `/methods` | **~18,000 px** (53 method cards + filters) | **~21** |
| `/words` | ~1,800 px (CTA, counts, blocks, chart, orbit) | ~2 |
| `/progress` | ~1,500 px (tables + prose) | ~2 |

**Methods is the longest page.** Toolbar visibility does **not** correlate with
“more scrollable content” on Words/Progress.

---

## Why `/methods` often shows no bottom inset

### 1. One code path for all signed-in routes

```
app/(app)/layout.tsx
  └─ AppShell
       ├─ FloatingShellChrome
       │    ├─ useVisualViewportBottomInset()
       │    ├─ HeaderScrim + corner chips + ShellPageTitle
       │    └─ FooterScrim + destination pill
       └─ <main> pt/pb shell float tokens → ShellPageContent → feature
```

No `if (pathname === '/methods')` for insets.

### 2. What the hook measures

```ts
const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
```

- `inset === 0` — no measured gap below layout viewport (toolbar hidden).
- `inset > 0` — browser chrome (typically ~50px bottom toolbar) present.

`env(safe-area-inset-bottom)` covers the home indicator only — not Safari's toolbar.

### 3. Safari controls the toolbar — not the app

**External references:**

| Source | Finding |
| --- | --- |
| [Ben Frain (2016, still cited)](https://benfrain.com/the-ios-safari-menu-bar-is-hostile-to-web-apps-discuss/) | No API/meta to load with toolbar hidden; bottom ~44px is a special tap zone |
| [Ionic #19081 — Apple to Ionic](https://github.com/ionic-team/ionic-framework/issues/19081#issuecomment-948987368) | iOS 15+ stable: URL/toolbar does **not** auto-collapse on scroll in many web apps; **aA → Hide Toolbar** is the documented workaround |
| [WebKit #259770](https://bugs.webkit.org/show_bug.cgi?id=259770) | `interactive-widget` not implemented on iOS Safari |
| [SO #60804268](https://stackoverflow.com/questions/60804268/how-to-know-when-bottom-nav-bar-is-visible-in-mobile-safari) | Detect via `visualViewport` resize, not a dedicated API |

**Why it looks route-specific (revised):**

| Factor | Effect |
| --- | --- |
| **Session state** | Toolbar visibility persists across Next.js navigations in one Safari tab |
| **Bottom pill taps** | Switching destinations taps near the bottom — a gesture that **reveals** Safari chrome |
| **Methods as landing** | Often first page at scroll 0 before bottom taps |
| **Fixed bottom pill** | Competes with Safari's bottom touch zone on **every** route equally |

**Not the cause:** page length, per-route CSS, or `interactive-widget` on iOS.

### 4. Historical bugs (fixed)

| Era | Problem | Fix |
| --- | --- | --- |
| Fixed `3rem` bottom lift | Pill too high on Methods when toolbar hidden | Removed |
| `interactive-widget: resizes-content` in viewport | Suspected asymmetry during mobile nav work; **not supported on iOS Safari** | Removed; dynamic measure regardless |
| Scrim tied to pill container | Scrim stopped above Safari toolbar | PR #67 — split scrim / pill anchors |

---

## Full layer stack (mobile `< md`)

See [`../specs/feature/page-layout.layers.md`](../specs/feature/page-layout.layers.md).

---

## Per-route comparison

Shell chrome is **identical**. Rows differ in header chip, title, layout mode,
width, and feature body — not inset logic.

| Route | Layout mode | Width | Top-left | Notes |
| --- | --- | --- | --- | --- |
| `/methods` | scrollable-destination | wide | Language | Longest page (~53 cards) |
| `/words` | scrollable-destination | wide | Language | Short dashboard |
| `/progress` | scrollable-destination | wide | Language | Short tables |
| `/methods/[id]` | scrollable-drill-in | narrow | Back | — |
| `/words/review` (active SRS) | one-screen-runner | narrow | Back | No page scroll on mobile |

---

## Verification

**Automated:** `npm run verify` (footer-scrim, mobile-nav-v2 tests).

**LIVE CHECK (iOS Safari, real device):**

1. Fresh tab → `/methods` → `:root` `--shell-visual-viewport-bottom-inset` often `0px`.
2. Tap **Words** in bottom pill (do not scroll) → inset may become non-zero from the tap alone.
3. Tap **Methods** again → toolbar may **still** be visible; inset non-zero — **not a Methods bug**.
4. On any route: **aA → Hide Toolbar** or scroll per Safari → inset returns to `0` when toolbar hides.
5. Confirm `.shell-float-nav-pill` `bottom` formula is identical on all routes; only the CSS variable differs.

---

## Related docs

- [`../specs/feature/page-layout.md`](../specs/feature/page-layout.md) — § Safari bottom toolbar
- [`../specs/feature/page-layout.layers.md`](../specs/feature/page-layout.layers.md)
- [`../TRAPS.md`](../TRAPS.md) — Safari / visualViewport
- [`28-mobile-desktop-layout.md`](28-mobile-desktop-layout.md)
