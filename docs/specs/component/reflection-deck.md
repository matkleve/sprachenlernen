# Reflection deck

<!-- id: SPEC-component-reflection-deck -->
<!-- use-case: UC-004 -->
<!-- status: draft -->

A swipeable stack of one to five reflection cards inside a modal popover. Each
card pairs a short personal sentence with a derivable visual. Wired from
[`weekly-reflection.md`](../feature/weekly-reflection.md).

**Change class: Standard** when implemented — UI primitive with interaction states.

## Scope

- **In:** `components/ui/ReflectionDeck.tsx` (or `features/progress/` if only
  used there initially); copy labels in the caller's `content.ts`.
- **Out:** metric generation, which chart to pick, entry-point placement on
  `/progress` — those live in [`weekly-reflection.md`](../feature/weekly-reflection.md).

**Reuse: popover/scrim pattern** from `LanguageSwitcher` and `OrbitListPopover`
— blurred scrim, portal to `document.body`, Escape closes. Not `Dialog`: no
destructive confirmation footer; the deck is exploratory reading.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Caller sets `open` true with `cards` (1–5) | Scrim covers the page; deck centres on narrow viewports, anchors near trigger on wide when a `triggerRef` is passed |
| 2 | Views a card | Headline text on top; visual slot below (chart, diagram, or illustration supplied by caller) |
| 3 | Swipes left / taps **Next** / presses ArrowRight | Advances to the next card; wraps nowhere |
| 4 | Swipes right / taps **Previous** / presses ArrowLeft | Returns to the prior card |
| 5 | On the last card, taps **See the data** (when caller supplies `derivationHref`) | Closes the deck and navigates to the derivation surface |
| 6 | Presses Escape / taps scrim / taps **Close** | `onClose` fires; focus returns to the trigger |
| 7 | Uses a screen reader | Card `index + 1` of `total` is announced; swipe is not the only route |

## Card contract

Each card is data, not JSX in the spec:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable key; also names the metric slice for analytics |
| `headline` | yes | One or two sentences — personal tone, factual claim ([`study/30`](../../study/30-notifications-and-reflections.md)) |
| `visual` | yes | React node: sparkline, band chart, orbit excerpt, structure diagram — must match the headline |
| `derivationHref` | no | Usually only on the final card |

Headline and visual must describe the **same fact**. A pretty chart with a
generic sentence is out of scope.

## Layout

1. **Header** — period label (e.g. "This week") and **Close**.
2. **Card body** — `headline` (`text-lg font-medium text-ink`), then visual
   (`min-h` reserved so cards do not jump height when swiping).
3. **Footer** — dot pager (`aria-current` on active), **Previous** / **Next**
   text buttons; **See the data** on the last card when `derivationHref` is set.

Touch targets follow the app shell minimum. Horizontal swipe uses passive
listeners where the platform allows; buttons duplicate every swipe path.

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| closed | `open === false` | not mounted / not visible | no |
| open | `open === true` | scrim + deck; focus trapped inside | no |
| card *n* | navigation | one card visible; others `aria-hidden` | no |

`open` is the only source of truth ([`STATE.md`](../../STATE.md)).

## Accessibility

- `role="dialog"`; `aria-labelledby` on the period label.
- Swipe is an enhancement; **Previous** / **Next** always visible.
- Card change announced via `aria-live="polite"` with "Card 2 of 4".
- Visuals that are charts include a text summary in `aria-label` or visible
  caption — colour alone never carries the fact.

## Acceptance criteria

- [ ] Given one card, when the deck opens, then Previous is disabled and Next is
      hidden or disabled.
- [ ] Given five cards, when the deck opens, then all five are reachable by
      swipe and by buttons.
- [ ] Given card 3 of 5, when the user swipes left, then card 4 is shown and the
      pager updates.
- [ ] Given the last card with `derivationHref`, when **See the data** is
      activated, then `onClose` runs and navigation follows the href.
- [ ] Given Escape, then `onClose` fires and focus returns to the trigger.
- [ ] Given a screen reader, then the active card index and headline are
      announced on change.
- [ ] No axe-core violations while open.

## Check

`npm test -- reflection-deck`
