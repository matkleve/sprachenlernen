# Learner world setup

<!-- id: SPEC-feature-learner-world-setup -->
<!-- use-case: UC-019 -->
<!-- use-case: UC-011 -->
<!-- status: draft -->

Onboarding popover and Profile control for the single **Lernwelt** choice.
Amends UC-011: one optional step **after language pair, before first
exercise** — still no deck, level, or survey beyond auth + language.

Study: [`56-lernwelt-single-choice.md`](../../study/56-lernwelt-single-choice.md)
W2, W5.

## Scope

- **In:** 2–3 screen popover on first learning-language attach; Profile edit per
  language row; switch confirmation dialog; copy keys in `lib/content.ts` /
  `messages/`; routes only as redirect targets — no new destination.
- **Out:** skill fork; register + topic chips; session intro banners; per-card
  G1 world labels; Duolingo-style unit tree; nagging *"because you chose…"*
  copy on Home or every review.

**Reuse: `Dialog`, `Button`, `PressableCard` (world pick rows), [`language-list-row.md`](../component/language-list-row.md)** — Profile sub-row for active world.

## Onboarding flow

Triggered when Account has **no** `learner_world` row for the language just
added (or first visit after language pick if row still `general` and never
prompted — ⚠ use `prompted_at` column or local flag; v1 may treat `general` +
missing row as prompt once).

| Step | Content |
| --- | --- |
| 1 · Hook | Short line: one Lernwelt shapes words, sentences, and texts — not all at once, but noticeably |
| 2 · Pick | Six options — same ids as [`learner-world.md`](../service/learner-world.md); **Erstmal allgemein** = `general` |
| 3 · Preview | One example sentence for the highlighted world only — no *"ab jetzt immer…"* |

**Skip:** step 2 defaults to `general` and continues to first exercise — same
path as tapping Allgemein.

**Timing:** after language pair is committed, **before** first `/words/review`
or method Start. Total ≤ 3 screens; reachable in well under a minute with signup
(UC-011).

## Profile

In **Languages** section, each learning-language row shows active Lernwelt
label beneath the held-count standing — e.g. *Lernwelt: Politik*. Tap opens
the same six-option picker (modal or inline sheet). Saving calls
`setWorld` — no navigation away from Profile.

## Switch confirmation

When `worldId` changes to a value ≠ previous (including from `general`):

> Deine bisher gelernten Wörter bleiben. Ab der nächsten Session bekommst du
> mehr Inhalte aus **[Neue Welt]**.

Shown **once per change** — not on every app open.

## Copy discipline (normative)

| Show | Do **not** show |
| --- | --- |
| Profile: active Lernwelt + change | Session intro *Heute lernst du in…* |
| Switch confirmation (above) | G1 on every card with world tag |
| Method detail when learner **overrides** topic chip | Home banner repeating the choice |

Optional G1 disclosure *only* when learner opens *Why this card?* — not default.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Finishes language pick, no world row | Popover step 1 |
| 2 | Picks Politik + continues | Preview sentence; `setWorld('politics')`; route to first session |
| 3 | Skips / Allgemein | `general`; first session — frequency path |
| 4 | Opens Profile → change world | Picker → confirmation → `setWorld` |
| 5 | Returns later | No popover; Profile shows current world |

## States

| State | Surface |
| --- | --- |
| `popover-step-1..3` | Full-screen or modal overlay before first exercise |
| `profile-idle` | World label on language row |
| `switch-confirm` | Dialog blocking save until acknowledged |

Popover and switch dialog are client components; persistence via server action
on [`learner-world.md`](../service/learner-world.md).

## Data

Reads/writes `learner_world` via service adapter. Preview sentences from
`data/example-sentences/{code}.json` filtered by `world` — one row per world for
onboarding preview only.

## Acceptance criteria

- [ ] Given first language attach, when popover completes with Politik, then
      first exercise starts without account/name/level questions and
      `getWorld` returns `politics`.
- [ ] Given skip on step 2, when first exercise starts, then `worldId` is
      `general` and UC-011 time budget still holds.
- [ ] Given world change in Profile, when user confirms, then prior review log
      rows are unchanged and Profile shows the new label.
- [ ] Given any review session, when cards render, then there is **no** session
      intro banner naming the Lernwelt.
- [ ] **Negative:** no per-card G1 line *Politik — deine Lernwelt* on every
      flip (default off).

## Check

Pending T-W23. Until `features/learner-world/` tests exist, verify via
`npm run check:specs` only.
