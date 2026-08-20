# Exercise mobile fit-frame — one screen for every method

**Status:** owner direction 2026-08-19. Implements
[`exercise-runner.layout.md`](../specs/feature/exercise-runner.layout.md) § Fit-frame
density and [`practice-surface.md`](../specs/feature/practice-surface.md).

## Invariant

> On `/practice` with a built recipe, the **page never scrolls**. Short-profile
> steps must **fit inside the body zone** without an inner scrollbar — for
> **every** hosted Method. Only **reading** steps scroll inside the body.

| Scroll allowed | Components |
| --- | --- |
| Yes (body only) | `text-display`, `parallel-text`, `material-preview` |
| No | everything else — prepare, type, capture, gap-fill, offers, … |

## Frame math (mobile)

Vertical stack from `100svh`:

```
100svh
├─ Shell float top     ~5.5rem  (--spacing-shell-float-top)
├─ Shell float bottom  ~5.5rem  (pill + version + Safari inset)
│  = --height-review-session  (~32rem on typical iPhone)
│
├─ Runner mobile header     2.75rem  step strip + stop — NO image
├─ Runner gaps              1rem
├─ Runner mobile footer     4.25rem  progress bar + ◀ ▶ + primary
└─ BODY (flex-1)            ~24rem+  task content — dynamic, no scroll
```

Implementation: `lib/exercise-runner/frame-budget.ts` mirrors CSS tokens in
`app/globals.css`:

| Token | rem | Role |
| --- | --- | --- |
| `--height-practice-mobile-header` | 2.75 | Mobile strip |
| `--height-practice-footer` | 4.25 | Footer + progress |
| `--height-practice-hero` | 5 | Desktop belt only (`md+`) |

`typicalMobileBodyBudgetRem()` ≈ 30rem — enough for intro + 2 prep rows + field.

`prepareChecklistFitsMobileBudget(2)` must stay `true`; 3 rows + long intro is
tight and may need recipe trim or scroll profile.

## Element inventory (what can appear)

### Shell (outside runner — always on mobile)

| Element | Height | Notes |
| --- | --- | --- |
| Back chip | in float top | Drill-in `/practice` |
| Account chip | in float top | |
| Destination pill | in float bottom | Not hidden during exercise |
| Version label | in float bottom | |

### Runner chrome

| Element | Mobile | Desktop |
| --- | --- | --- |
| Hero WebP belt | **hidden** | 5rem + section + Methoden + title + step |
| Mobile strip | step label + stop | hidden |
| Progress bar | **footer** (thin, no duplicate label) | under hero + label |
| Timer pill | footer when `wait` | under progress |
| Footer ◀ ▶ + primary | one row | two rows |

### Step bodies (short profile — must fit body budget)

| Component | Typical slots |
| --- | --- |
| `checklist` | intro (clamp 3 lines) + ≤2 prep rows |
| `type-with-word` | prompt + gloss + 3-row field + hint |
| `timed-write` | prompt + meta + 3-row field (md: tall) |
| `prompt` | one lead block |
| `gap-fill` | audio + inline gaps |
| `capture` | field + file + small preview |
| `self-mark` | copy + token chips (wrap) |
| `reveal-answer` | compare copy |
| `offers` | ≤2 buttons + decline |
| `wait` | timer message |

### Step bodies (scroll profile — body scrolls)

| Component | When |
| --- | --- |
| `text-display` | Extensive reading passage |
| `material-preview` | Long source preview |
| `parallel-text` | Side-by-side reading |

## System rules (not per-method CSS)

1. `practice-fit-frame` on runner root — one class, all Methods.
2. `exerciseStepContentProfile()` — only gate for `overflow-y-auto` on body.
3. `SHORT_STEP_BUDGET` + `frame-budget.ts` — recipe author limits.
4. Mobile typography via `max-md:` on practice-surface + steps — not a `compact` prop.
5. Desktop keeps hero belt + progress above body — more vertical room.

## Verification

- `npm test -- frame-budget exercise-runner practice-surface`
- LIVE CHECK: `/practice?method=build-a-sentence` on phone — no page scroll, no body
  scroll on prepare; progress bar above footer controls; no hero image.
