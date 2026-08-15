# 29 · iOS Safari bottom inset by route — why `/methods` looks different

Investigation report (2026-08-15). **Question:** why does `/methods` appear to have
**no inset** for iOS Safari controls while `/words` and `/progress` do?

**Short answer:** the app applies the **same** bottom-inset mechanism on every
signed-in route. The difference you see is almost entirely **Safari deciding
whether to show its bottom toolbar** on that page at that moment — not different
shell code per route.

**Normative shell contract:**
[`../specs/feature/page-layout.md`](../specs/feature/page-layout.md),
[`../specs/feature/page-layout.layers.md`](../specs/feature/page-layout.layers.md).
**Prior trap:**
[`../TRAPS.md`](../TRAPS.md) — `interactive-widget` / fixed lift.

---

## Executive summary

| Claim | Verdict |
| --- | --- |
| `/methods` uses different inset CSS than `/words` | **False** — identical classes and hooks |
| `/methods` skips `useVisualViewportBottomInset` | **False** — runs in `FloatingShellChrome` on every route |
| Safari bottom toolbar is absent more often on `/methods` | **True** — observed behaviour, environmental |
| A fixed bottom lift would “fix” Methods | **Wrong** — caused the original bug (pill floated too high when toolbar absent) |
| Per-route content height affects toolbar visibility | **Plausible** — scroll and page length influence Safari heuristics |

When `--shell-visual-viewport-bottom-inset` is `0px`, the pill sits at
`safe-area + gap` only — that is **correct** for “no Safari toolbar”. When Safari
shows back/share/refresh, the hook measures ~50px and the pill lifts; the footer
scrim **grows** with that inset but stays anchored to `bottom: 0`.

---

## Why `/methods` often shows no bottom inset

### 1. One code path for all signed-in routes

Every `(app)` page renders through the same layout:

```
app/(app)/layout.tsx
  └─ AppShell
       ├─ DesktopShellHeader        (≥ md only)
       ├─ FloatingShellChrome       (< md)
       │    ├─ useVisualViewportBottomInset()   ← sets CSS var on <html>
       │    ├─ HeaderScrim + corner chips + ShellPageTitle
       │    └─ FooterScrim + destination pill
       └─ <main> pt/pb shell float tokens
            └─ {children} → feature (often ShellPageContent)
```

There is **no** `if (pathname === '/methods')` branch for insets, padding, or
footer positioning.

**Source files (shared):**

| Concern | File |
| --- | --- |
| Hook | `features/app-shell/useVisualViewportBottomInset.ts` |
| Invoked from | `features/app-shell/FloatingShellChrome.tsx` |
| Footer scrim + pill | `features/app-shell/FooterScrim.tsx` |
| Main reserves | `features/app-shell/AppShell.tsx` |
| Tokens + classes | `app/globals.css` (`.shell-float-footer-scrim`, `.shell-float-nav-pill`) |

### 2. What the hook actually measures

```ts
const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
document.documentElement.style.setProperty("--shell-visual-viewport-bottom-inset", `${inset}px`);
```

- **`inset === 0`** — layout viewport extends to the physical bottom (no Safari
  bottom toolbar in the measured gap).
- **`inset > 0`** — browser chrome (typically Safari’s bottom toolbar) occupies
  space below the layout viewport.

`env(safe-area-inset-bottom)` is **always** applied on top of this for the home
indicator; it does **not** replace toolbar measurement.

### 3. Safari shows the toolbar inconsistently — not per our route table

Documented in [`../TRAPS.md`](../TRAPS.md):

> Words and Progress showed Safari's back/share/refresh bar under the app nav;
> Methods did not.

That entry describes **browser behaviour**, fixed by dynamic measurement instead
of a fixed `3rem` lift or `interactive-widget: resizes-content` (removed from
`app/layout.tsx` viewport export — it forced toolbar reservation on some pages
and not others).

**Why `/methods` is often toolbar-free at rest:**

| Factor | `/methods` | `/words`, `/progress` |
| --- | --- | --- |
| Typical content length | Long catalogue, but filter UI is compact at top | Long scrollable dashboards (orbit, tables, charts) |
| Scroll on first paint | May not scroll immediately | Often scrolls to read content → Safari more likely to expose toolbar |
| Navigation pattern | Default landing; user may not have scrolled yet | Tab switches after scrolling elsewhere |
| Toolbar persistence | Safari hides toolbar when idle at bottom | Toolbar often stays after scroll interaction |

None of these are implemented as app rules — they are **heuristics inside Mobile
Safari** that QA has observed across routes.

### 4. What is *not* the cause

| Ruled out | Evidence |
| --- | --- |
| Methods omits `ShellPageContent` | `MethodMenu` wraps content in `ShellPageContent width="wide"` — same padding tokens as Words/Progress |
| Different `pb` on `<main>` | `AppShell` applies `pb-shell-float-bottom` on all routes |
| Footer scrim not full-bleed on Methods | Post–PR #67: scrim uses `bottom: 0`; height includes inset term |
| Per-route layout mode affects bottom inset | `shellPageLayout()` only changes feature wrapper (`h-review-session` etc.), not shell chrome |

---

## Full layer stack (mobile `< md`)

Z-order increases downward. **Browser layers are not DOM nodes** but matter for
inset measurement.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ B0  Safari URL / top chrome                              [browser]         │
├──────────────────────────────────────────────────────────────────────────┤
│ L1  Skip link (#main)                                    sr-only / focus │
├──────────────────────────────────────────────────────────────────────────┤
│ L2  HeaderScrim                                          fixed top z-50  │
│     · header-scrim-blur + header-scrim-tint (on scroll)                  │
│     · safe-area top: pt-[max(1rem, env(safe-area-inset-top))]            │
│     · corner chips: Language OR Back | ShellPageTitle | Account          │
├──────────────────────────────────────────────────────────────────────────┤
│ L3  <main id="main">                                     document scroll │
│     · pt: var(--shell-float-top-active)   ← 5.5rem or 6.5rem if 2-line   │
│     · pb: var(--spacing-shell-float-bottom) ← pill + pad + inset + gap   │
│     └─ ShellPageContent (feature)                                          │
│          · mode classes (scroll / drill-in / runner)                     │
│          · px-6 pt-page-top pb-page-bottom (except runner mobile)        │
│        └─ Feature body (MethodMenu, WordsHome, …)                        │
├──────────────────────────────────────────────────────────────────────────┤
│ L4  FooterScrim root (.shell-float-footer-scrim)         fixed bottom 0  │
│     · height grows with inset + safe-area + pill + pad + fade            │
│     · blur + tint + tap shield (pointer-events on scrim layer)           │
│     └─ .shell-float-nav-pill (absolute, bottom = safe-area + inset + gap)│
│          └─ destination pill (3 icon chips)                              │
├──────────────────────────────────────────────────────────────────────────┤
│ L5  CookieConsent (if shown)                             fixed z-40      │
│     · bottom: var(--spacing-shell-float-bottom) — clears pill            │
├──────────────────────────────────────────────────────────────────────────┤
│ B1  Safari bottom toolbar (back / share / tabs)          [browser]       │
│     measured into --shell-visual-viewport-bottom-inset when visible      │
└──────────────────────────────────────────────────────────────────────────┘
```

### CSS token roles (bottom)

| Token / class | Anchors to | Grows when Safari toolbar appears? |
| --- | --- | --- |
| `--shell-visual-viewport-bottom-inset` | Measured gap | Set by JS (0 or ~50px) |
| `.shell-float-footer-scrim` `bottom` | Viewport bottom (`0`) | Height **yes**; position **no** |
| `.shell-float-nav-pill` `bottom` | Above toolbar | **Yes** |
| `--spacing-shell-float-bottom` on `<main>` | Content reserve | **Yes** (via inset term in calc) |

---

## Per-route comparison

Shell chrome is **identical** across rows. Differences are header chip, title,
layout mode, content width, and feature body — not inset logic.

| Route | Layout mode | `ShellPageContent` width | Top-left chip | Page title (mobile) | Title top reserve | Feature body |
| --- | --- | --- | --- | --- | --- | --- |
| `/methods` | `scrollable-destination` | `wide` (`max-w-5xl`) | Language | “Ways of practising” | Default or **expanded** if 2-line wrap | `MethodMenu` — filter + standing + method cards |
| `/words` | `scrollable-destination` | `wide` | Language | “Words” | Usually **default** (short title) | `WordsHome` — orbit, horizon chart, review CTA |
| `/progress` | `scrollable-destination` | `wide` | Language | “Where you stand” | May use **expanded** if 2-line wrap | `ProgressReport` — signals table, dose bands |
| `/methods/[id]` | `scrollable-drill-in` | `narrow` (`max-w-2xl`) | **Back** | Method name | Per title length | `MethodDetail` — badges, prose, session CTA |
| `/words/review` (idle / error) | `scrollable-drill-in` | `narrow` | **Back** | Review title | Default | Error / not-built copy |
| `/words/review?method=srs-session` | `one-screen-runner` | `narrow` | **Back** | Review title | **Pinned compact** (no scroll collapse) | `ReviewSession` — `h-review-session`, no page scroll on mobile |
| `/profile` | `scrollable-destination` | `narrow` | Language | Profile title | Per title | Profile form |
| `/languages/choose` | `scrollable-destination` | `default` (`max-w-3xl`) | Language | Picker title | Per title | `LanguagePicker` |

### Layout mode — what actually changes

| Mode | Mobile scroll | `ShellPageContent` classes | Shell bottom inset |
| --- | --- | --- | --- |
| `scrollable-destination` | Page scrolls | `px-6 pt-page-top pb-page-bottom` | **Same** |
| `scrollable-drill-in` | Page scrolls | Same rhythm | **Same** |
| `one-screen-runner` | **No** page scroll (`h-review-session`) | `px-4`, flex column, overflow hidden | **Same** — pill still visible (UC-063) |

### Desktop / iPad (`≥ md`) — same routes, different stack

| Layer | Mobile | Desktop / iPad |
| --- | --- | --- |
| Primary nav | Bottom pill | Top `Destinations` links with labels |
| Footer scrim + pill | Yes | **Hidden** (`display: none` in CSS) |
| `useVisualViewportBottomInset` | Runs (harmless at ≥ md) | Footer chrome hidden |
| `<main>` shell padding | `pt` / `pb` float tokens | `md:pt-0 md:pb-0` |
| Language | Floating chip | Inline switcher |
| Back | Top chip on drill-in | In-page link on method detail only |

---

## Top inset — the other per-page difference

Bottom inset is Safari-driven. **Top** reserve can differ by route:

- `--shell-float-top-active` defaults to `--spacing-shell-float-top` (5.5rem).
- `ShellPageTitle` sets **`--spacing-shell-float-top-expanded` (6.5rem)** when the
  mobile title wraps to two lines at rest (“Ways of practising”, “Where you stand”).
- `/words/review` sets **`pinnedCompact`** — title stays small; no scroll-driven
  title scaling.

This affects **header clearance**, not Safari bottom toolbar measurement.

---

## Historical bug (for context)

| Era | Behaviour |
| --- | --- |
| `interactive-widget: resizes-content` | Toolbar space reserved on Words/Progress, not Methods — **asymmetric** |
| Fixed `3rem` bottom lift | Pill too high on Methods when toolbar absent |
| **Current** | `useVisualViewportBottomInset` — `0` when no toolbar, measured when present |

---

## Verification checklist

Automated: `npm run verify` (includes `footer-scrim.test.tsx`, `mobile-nav-v2.test.tsx`).

**LIVE CHECK (iOS Safari, real device):**

1. Open `/methods` fresh — note pill position; DevTools → `:root` style
   `--shell-visual-viewport-bottom-inset` (often `0px`).
2. Open `/words`, scroll content — toolbar often appears; inset becomes non-zero;
   pill rises; scrim band grows; scrim still touches physical bottom.
3. Return to `/methods` without scrolling — toolbar may hide; inset returns to `0`;
   pill lowers — **expected**, not a regression.
4. Compare computed `bottom` on `.shell-float-nav-pill` — formula identical on
   both routes; only the CSS variable value differs.

---

## Related docs

- [`../specs/feature/page-layout.layers.md`](../specs/feature/page-layout.layers.md) — scrim vs pill handoff
- [`28-mobile-desktop-layout.md`](28-mobile-desktop-layout.md) — breakpoint split
- [`../TRAPS.md`](../TRAPS.md) — Safari / visualViewport trap (second entry)
