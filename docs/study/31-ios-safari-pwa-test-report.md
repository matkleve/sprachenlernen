# 31 · iOS Safari / PWA — Issue report & test plan

**Status:** open — PWA asymmetry unresolved · **Created:** 2026-08-15 · **Build:** `v0.5.1` (revert of failed `v0.5.0` fix)

This document consolidates everything we investigated, shipped, rejected, and
still need to verify on a **real iPhone**. It supersedes scattered chat notes;
technical detail also lives in [`29-ios-inset-by-route.md`](29-ios-inset-by-route.md).

---

## Owner QA result (2026-08-15)

Tested in **true PWA** (Home Screen icon):

| Route | Safari toolbar / phantom inset |
| --- | --- |
| `/methods` | Never appears — pill low ✓ |
| `/methods-mirror` | Never appears — pill low ✓ |
| `/words` | Appears — pill sits higher ✗ |
| `/progress` | Appears — pill sits higher ✗ |

**Conclusion:** Not session-only. Methods and mirror share the same body; Words
and Progress share different bodies. The asymmetry is **real** in true PWA — still
open.

### Failed fix (reverted on main, `v0.5.0` → `v0.5.1`)

We tried forcing `--shell-visual-viewport-bottom-inset` to `0px` in standalone
PWA (`isStandaloneDisplay()`). **Owner QA: did not fix asymmetry** and **made
nav-pill taps worse**.

**Why forcing inset `0` hurts taps:** the measured inset is not only “toolbar
height” — it also keeps the pill **above** the iOS home-indicator band and
bottom-edge gesture zone. Pinning the pill to `safe-area + gap` only leaves
icons in a region where iOS competes for touches. **Do not zero the inset in
PWA** without a replacement tap-target strategy.

**Lesson for agents:** never ship inset changes without a LIVE CHECK for **pill
tap reliability** on every destination, not just visual position.

---

## Terminology (read this first)

| Term | What it is | What we want |
| --- | --- | --- |
| **Safari toolbar** | Apple's browser chrome: URL bar (top) and ← Share ↻ Compass row (bottom) | **Hidden** — we no longer rely on it for reloads |
| **Nav pill** | Our floating destination bar (Methods · Mirror · Words · Progress icons) | **Always visible** — this is app UI, not Safari |
| **PWA / standalone** | App opened from **Home Screen** icon (`display-mode: standalone`) | **Target mode** — no Safari toolbar by definition |
| **Safari tab** | Normal bookmark or URL in Mobile Safari | Toolbar may appear after bottom taps — **not fixable in code** |

If you see a URL bar at the top, you are **not** in standalone PWA mode.

---

## Problem statement (owner)

On iPhone, `/methods` often looks correct: nav pill sits low, Safari bottom
toolbar seems absent. On `/words` and `/progress`, the Safari bottom toolbar
(← Share ↻ Compass) often stays visible and the pill sits higher.

**Desired end state:**

1. Safari toolbar **not** visible (like Methods on a good session).
2. Nav pill **always** visible on all destination routes.
3. Updates via **Profile → App** and the green footer version — not via Safari reload.

---

## What we proved (investigation summary)

| # | Finding | Verdict |
| --- | --- | --- |
| 1 | Different shell / inset code per route | **False** — identical `AppShell` → `FloatingShellChrome` → `useVisualViewportBottomInset` on every signed-in route |
| 2 | `/methods` is shorter → less toolbar | **False** — Methods is ~18,000 px; Words/Progress ~1,500–1,800 px |
| 3 | Per-route CSS identity causes asymmetry | **False** — `/methods-mirror` (same body, different URL) behaves like `/methods` |
| 4 | Nested horizontal scroll on Words/Progress | **Likely contributor** — iOS Safari treats `overflow-x-auto` regions differently from document-only scroll |
| 5 | Safari toolbar can be forced hidden per URL | **False** — no web API; Apple controls via session/gestures |
| 6 | Fixed `rem` bottom lift | **Rejected** — pill floated too high when toolbar was already hidden |
| 7 | Per-route inset hacks | **Rejected** (owner policy) — keep one measurement path |

**Working theory (revised):** asymmetry is **Safari session/gesture state** plus
**nested scroll regions** on Words/Progress. The scroll unification fix addresses
(4); (5) still applies in Safari **tabs**.

---

## What we shipped (2026-08-15)

### Scroll unification (PR #76, main)

| Route | Before | After |
| --- | --- | --- |
| `/words` | 30-day horizon in `overflow-x-auto` | `ReviewHorizonField` — `grid-cols-4` / `grid-cols-7`, no horizontal scroll wrapper |
| `/progress` | `Table` default `layout="scroll"` | `Table layout="fit"` — wrapping cells, no `overflow-x-auto` |

**Automated guard:** `words.test.tsx` and `progress.test.tsx` assert no
`.overflow-x-auto` on destination pages.

**Regression fix (commit `23e51db`):** horizon v2 had reintroduced
`overflow-x-auto` — restored grid layout.

### Methods mirror debug route (PR #81, main)

- `/methods-mirror` — fourth nav pill (Copy icon), same catalogue as `/methods`
- Purpose: A/B Safari toolbar behaviour without changing page body
- **Cleanup pending:** remove when investigation closes (see § Open items)

### App update system (PR #84 + #87, main — `v0.4.1`)

Replaces reliance on Safari toolbar for reload after deploy.

| Piece | Path |
| --- | --- |
| API | `app/api/app-version/route.ts` — `{ version }`, `Cache-Control: no-store` |
| Compare | `lib/app-version.ts` — `isDeployedVersionNewer()` |
| Shared state | `features/app-shell/AppUpdateProvider.tsx` — footer + profile stay in sync |
| Footer UI | `features/app-shell/AppVersionLabel.tsx` — green `vX.Y.Z` + `ArrowDownCircle` when stale |
| Profile UI | `features/profile/ProfileAppSection.tsx` — running version, Check for updates, reload row |
| Spec | `docs/specs/feature/app-update.md` (UC-072) |

**Checks trigger on:** mount, `visibilitychange`, `pageshow`, `focus`, 5-minute interval.

### Other same-day fixes (main)

- Weekly reflection deck on `/progress` (F76 v1)
- Mobile page-top ghost space — `ShellPageContent` uses `md:pt-page-top` only on mobile
- Version branching — no Pride bumps on feature branches (`scripts/check-version-branch.mjs`)

---

## What we explicitly rejected

| Approach | Why |
| --- | --- |
| Per-route bottom inset / padding | Same shell on all routes; pathname is not the cause |
| Fixed `rem` bottom lift on Methods | Wrong when Safari toolbar already hidden |
| Scroll hacks to auto-hide Safari toolbar | Unreliable since iOS 15; no API |
| `interactive-widget: resizes-content` on iOS | Not implemented in iOS Safari (WebKit #259770) |
| Force Safari toolbar visible for updates | Owner decision: own update flow instead |

---

## Body bisect (2026-08-15)

Progressive routes isolate which page section triggers the PWA bottom asymmetry.
Each level adds one more section from the real Words/Progress body. The banner
shows a live **`Bottom inset`** readout (`--shell-visual-viewport-bottom-inset`).

| Route | Purpose |
| --- | --- |
| `/safari-bisect` | Hub with links |
| `/words-bisect?level=0` … `?level=5` | Words body bisect |
| `/progress-bisect?level=0` … `?level=5` | Progress body bisect |

### Words levels

| Level | Adds |
| --- | --- |
| 0 | Intro paragraph only (Methods-shaped) |
| 1 | Review CTA card |
| 2 | Vocabulary counts |
| 3 | Frequency blocks |
| 4 | Review horizon |
| 5 | Vocabulary orbit (full Words) |

### Progress levels

| Level | Adds |
| --- | --- |
| 0 | Intro paragraph only |
| 1 | Weekly reflection entry |
| 2 | Skills table |
| 3 | Signals table |
| 4 | Dose bands table |
| 5 | Gap section (full Progress) |

### LIVE CHECK — bisect (owner, PWA)

1. Open PWA → **Methods** (baseline — pill low, note inset readout if on bisect page).
2. Open **`/safari-bisect`** or **`/words-bisect?level=0`** directly (type URL or bookmark).
3. Compare pill height + **Bottom inset** value to Methods.
4. If **level 0 is already wrong** → cause is **route/shell title**, not body sections below.
5. Tap **Next level** until pill jumps — **report the first failing level** and inset value.
6. Repeat for **`/progress-bisect?level=0`** … `5`.

Record: `Words breaks at level N (inset Xpx)` / `Progress breaks at level N`.

---

## Open items (not done)

| # | Item | Priority |
| --- | --- | --- |
| 1 | **Owner LIVE CHECK** on real iPhone with `v0.4.1` (matrix below) | **Blocker** |
| 2 | Remove `/methods-mirror` from nav when QA passes | Cleanup |
| 3 | Optional: Profile hint “Add to Home Screen” under App section | Nice-to-have |
| 4 | If true standalone PWA still asymmetric after cache clear → bisect Words/Progress body components | **In progress** — `/words-bisect`, `/progress-bisect` |
| 5 | Update study/29 executive summary with “toolbar hidden preferred; updates via App” | Docs |

---

## Pre-test checklist (before you start)

Do all of these **before** judging toolbar symmetry:

- [ ] **Hard refresh / reinstall** — old bundles (`v0.0.8`–`v0.1.0`) invalidate results
- [ ] Confirm footer shows **`v0.4.1`** (grey = current) or green when stale
- [ ] Confirm **Profile → App** shows the same running version
- [ ] Decide mode: **Home Screen icon** (PWA) vs **Safari tab** — record which

---

## LIVE CHECK — Test matrix (owner, iPhone)

Copy this section into an issue comment or tick boxes as you go.

### A · Confirm install mode

| Step | Action | Expected | Pass? |
| --- | --- | --- | --- |
| A1 | Open app from **Home Screen** icon (not bookmark, not Safari URL bar) | No URL bar at top; no ← Share ↻ Compass at bottom | ☐ |
| A2 | If URL bar visible | You are in a **Safari tab** — toolbar behaviour is Apple-controlled, not a PWA bug | ☐ |
| A3 | Settings → Safari → Advanced → Web Inspector (optional) | Enables `--shell-visual-viewport-bottom-inset` inspection | ☐ |

### B · Version & cache

| Step | Action | Expected | Pass? |
| --- | --- | --- | --- |
| B1 | Look at mobile footer version label | `v0.4.1` in muted grey (or green if deploy ahead) | ☐ |
| B2 | Open **Profile** → **App** section | Running version matches footer | ☐ |
| B3 | Tap **Check for updates** | No error; if server newer → green reload row **and** footer turns green | ☐ |

### C · Toolbar symmetry (true PWA, `v0.4.1`, fresh open)

Record for each route: **Safari toolbar visible?** · **Nav pill visible?** · **Pill height feels same?**

| Step | Action | Safari toolbar | Nav pill | Same as Methods? | Pass? |
| --- | --- | --- | --- | --- | --- |
| C1 | Fresh open → land on `/methods` | ☐ hidden ☐ visible | ☐ yes | baseline | ☐ |
| C2 | Tap **Words** in pill (do **not** scroll page) | ☐ hidden ☐ visible | ☐ yes | vs C1 | ☐ |
| C3 | Tap **Progress** | ☐ hidden ☐ visible | ☐ yes | vs C1 | ☐ |
| C4 | Tap **Methods** again | ☐ hidden ☐ visible | ☐ yes | vs C1 | ☐ |
| C5 | On Words: expand horizon + open a week column | ☐ hidden ☐ visible | ☐ yes | vs C1 | ☐ |
| C6 | On Progress: open weekly reflection deck | ☐ hidden ☐ visible | ☐ yes | vs C1 | ☐ |

**Pass criterion for C:** In standalone PWA, all routes show **no extra bottom
gap** and **nav pill visible** at the **same vertical position as Methods** —
and pill icons remain **easy to tap** on every destination.

### D · App update flow

Requires a deploy with version bump (or staging with higher `/api/app-version`).

| Step | Action | Expected | Pass? |
| --- | --- | --- | --- |
| D1 | After new deploy, resume app (background → foreground) | Green `vX.Y.Z` in footer without manual check | ☐ |
| D2 | Open Profile → App | Green reload row names deployed version | ☐ |
| D3 | Tap reload (footer or profile) | Page reloads; version matches server; grey label | ☐ |
| D4 | Tap Check for updates when current | No false green prompt | ☐ |

### E · Safari tab (secondary — document only)

| Step | Action | Expected | Pass? |
| --- | --- | --- | --- |
| E1 | Open same build in Safari tab (URL bar visible) | Toolbar may appear after bottom pill taps | ☐ documented |
| E2 | aA → Hide Toolbar (if offered) | `--shell-visual-viewport-bottom-inset` → `0px`; pill drops | ☐ |
| E3 | Compare inset across routes after E2 | Same formula on all routes; only CSS variable differs | ☐ |

### F · Methods mirror A/B (debug)

| Step | Action | Expected | Pass? |
| --- | --- | --- | --- |
| F1 | Alternate **Methods** (Library) and **Mirror** (Copy) pills | Same toolbar state if HTML identical | ☐ |
| F2 | If Methods ≠ Mirror while body is same | Cause is navigation/session — not page CSS | ☐ |

---

## If tests fail — decision tree

```
True PWA (A1 pass) + v0.4.1 (B1 pass) + C still asymmetric?
  ├─ YES → Open issue: bisect Words/Progress body (F4 contingency)
  │         Attach: screenshots per route, inset values if available
  └─ NO  → Safari tab only (A2) → Not a code bug; optional Add-to-Home hint

Footer version wrong / old bundle?
  └─ Hard reload, delete PWA, reinstall from latest deploy URL

Green update prompt never appears?
  └─ Check /api/app-version returns higher version; Profile manual check;
     confirm AppUpdateProvider wraps shell (not duplicate hook instances)
```

---

## Key files (for agents)

| Area | Path |
| --- | --- |
| Inset hook | `features/app-shell/useVisualViewportBottomInset.ts` |
| Shell chrome | `features/app-shell/FloatingShellChrome.tsx`, `FooterScrim.tsx` |
| Nav destinations (+ mirror) | `features/app-shell/destinations.ts` |
| Words horizon | `features/words/ReviewHorizonField.tsx` |
| Progress tables | `features/progress/ProgressReport.tsx`, `components/ui/Table.tsx` |
| App update | `features/app-shell/AppUpdateProvider.tsx`, `AppVersionLabel.tsx` |
| Profile App block | `features/profile/ProfileAppSection.tsx` |
| Page layout policy | `docs/specs/feature/page-layout.md` § Safari toolbar |
| Traps | `docs/TRAPS.md` — Safari bottom toolbar section |
| Prior report | `docs/study/29-ios-inset-by-route.md` |

---

## PR / commit reference

| Change | Ref | Status |
| --- | --- | --- |
| Scroll unification | PR #76 | Merged |
| Methods mirror debug | PR #81 | Merged — remove after QA |
| Horizon `overflow-x-auto` regression | `23e51db` | Merged |
| App update prompt | PR #84 | Merged |
| Profile App section | PR #87 | Merged |
| AppUpdateProvider sync fix | main | Merged |
| This test report | study/31 | This doc |
| PWA standalone inset fix (`isStandaloneDisplay`) | `v0.5.0` | **Reverted** — no visual fix; worse taps |

---

## Related docs

- [`29-ios-inset-by-route.md`](29-ios-inset-by-route.md) — technical investigation
- [`28-mobile-desktop-layout.md`](28-mobile-desktop-layout.md) — phone vs iPad chrome
- [`../specs/feature/app-update.md`](../specs/feature/app-update.md) — update spec
- [`../specs/feature/page-layout.md`](../specs/feature/page-layout.md) — scroll policy
- [`../diary/2026-08-15.md`](../diary/2026-08-15.md) — session log
