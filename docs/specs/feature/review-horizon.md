# Review horizon

<!-- id: SPEC-feature-review-horizon -->
<!-- use-case: UC-005 -->
<!-- use-case: UC-006 -->
<!-- use-case: UC-063 -->
<!-- status: active -->

The 30-day **scheduled-review forecast** on `/words` — informational, not a
backlog counter. Shows when the scheduler has placed future reviews, with a
causal sentence when a peak is explainable (study/04 G2, F03).

**Not for daily routine users by default.** Collapsed until a relevance trigger
fires or the learner expands it (UC-063, UC-006).

Parent surface: [`words-home.md`](words-home.md). Data:
[`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md),
[`scheduler.md`](../service/scheduler.md).

## Scope

- **In:** collapsed/expanded presentation on `/words`; four week columns filled
  with discrete tiles in a fixed **4×6 grid** (count ∝ scheduled reviews); one
  causal line when a peak has a detectable cause; copy in `features/words/content.ts`; relevance
  triggers; week drill-down (seven day columns inside one week).
- **Out:** due or overdue counts as primary figures (A3, UC-063); streak or
  activity framing; colour as the only magnitude channel (G2); adjustable
  scheduler knobs (A11); per-card explanation (that is review-session / G1).

**Reuse:** snapshot `horizon` bins — no second schedule source.

## What it represents (algorithm fidelity)

Each tile stands for **scheduled reviews on a calendar day**, not random
appearance and not retrievability right now.

| Concept | Meaning |
| --- | --- |
| **Due date** | One deterministic `due` per task from FSRS — the day bin it lands in |
| **Retrievability** | Probability of recall *at review time* — shown on the card (G1), not here |
| **Target retention** | Default 90 % at the due date — why intervals grow (week → month) |

**Overdue tasks** (`due < now`) are **excluded** from horizon bins. They are
picked up by the session builder (`due <= now`) but must not be read from an
empty or small “today” column. Copy must not equate the chart with “work due
today”.

The chart is a **snapshot at page load**; each answered card shifts future bins.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` in **routine** state | Horizon **collapsed**: one summary line (e.g. next four weeks light / normal / peak in week 2) and a control to expand |
| 2 | Opens `/words` when a **relevance trigger** fires | Horizon **expanded** with four week columns, tile grids, and causal line when available |
| 3 | Taps expand / collapse | Toggles full horizon; expanded choice persists for the session |
| 4 | Taps a week column | Expands inline to seven day grids with date labels (rolling day offset from today) |
| 5 | Screen reader | Hears week totals and averages before tile metaphor — never colour alone |

### Relevance triggers (any one → start expanded)

| Trigger | Condition |
| --- | --- |
| **Return after gap** | No completed review session in the last **7** days (UC-006) |
| **Bulk add** | **≥ 30** new tasks entered the pool in the last **48** hours |
| **Peak week** | Max week total ≥ **2.5×** the mean of the other three week totals |
| **First week** | Fewer than **7** days since the learner's first review on this language |
| **Manual** | Learner expanded the horizon this session |

When none fire and the learner has reviewed on **≥ 5** of the last **7** days,
treat as **routine** → collapsed default.

### Week columns

- **Week 1** = day offsets 0–6, **Week 2** = 7–13, **Week 3** = 14–20,
  **Week 4** = 21–29 — aggregated from the 30 daily bins.
- Each column shows: **4×6 tile grid** (height fixed; fills bottom-up; capped
  with “+N” overflow), **total reviews**, **~avg/day** (rounded to whole
  numbers in copy).
- Peak week gets accent emphasis in copy only — not alarm colour (G4).

### Causal line

One plain sentence below the chart when a peak is explainable, e.g.:

> The peak in week 2 comes from the 60 cards you added on the 2nd.

Required when **expanded** and `peakWeek` trigger is true. Omit when no cause
is derivable — never invent one.

## States

| State | Trigger | Effect |
| --- | --- | --- |
| `collapsed` | routine default | Summary line + expand control only |
| `expanded` | trigger or user | Full four-week chart + causal line when applicable |
| `week-detail` | tap week column | One week inline; other weeks stay visible |

## Acceptance criteria

- [ ] Given a routine learner (≥ 5 review days in 7), when `/words` loads, then
      the horizon is collapsed and no due/backlog count appears.
- [ ] Given return after 7+ days away, when `/words` loads, then the horizon is
      expanded with a plan sentence (UC-006) and week columns.
- [ ] Given 30 daily bins, when the chart renders, then four week columns
      aggregate the correct totals and each tile grid reflects bin counts.
- [ ] Given overdue tasks, when the horizon renders, then they are not counted
      in any future bin and copy does not claim the chart equals today's session.
- [ ] Given a peak week after a bulk add, when expanded, then one causal
      sentence names the week and the add date.
- [ ] Given keyboard or screen reader, when the horizon is read, then each week
      exposes total and average in text, not colour alone.

## Check

`npm test -- words vocabulary-snapshot review-horizon`
