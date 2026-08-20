# Scheduler — algorithm detail

Split child of [`scheduler.md`](scheduler.md). Normative for the formulas; the
contract, states and acceptance criteria live in the parent. Nothing here
repeats a rule from there.

Source: FSRS (Free Spaced Repetition Scheduler), the model Anki ships since
23.10. Rationale for choosing it over SM-2 — including that its variables are
the ones a human can be *shown* — is in
[`../../study/STUDY-004-flashcards-srs.md`](../../study/STUDY-004-flashcards-srs.md).

## The three memory variables

| Variable | Means | Range |
| --- | --- | --- |
| **Stability** `S` | Days until recall probability decays to the target | > 0, grows |
| **Difficulty** `D` | How hard this item is for this learner | 1 … 10 |
| **Retrievability** `R` | Probability of recall right now | 0 … 1 |

`R` is **not stored**. It is a function of `S` and elapsed time, which is why the
review log can be the only source of truth.

## Forgetting curve

```
R(t, S) = (1 + FACTOR · t / S) ^ DECAY
```

with `DECAY = -0.5` and `FACTOR = 19/81`. This power function replaced the
exponential curve of earlier versions because it fits observed review data
better in the tails — the region that decides long intervals.

## Interval from a target retention

Inverting the curve gives the interval at which recall probability equals the
requested retention `r`:

```
I(r, S) = (S / FACTOR) · (r ^ (1 / DECAY) − 1)
```

Consequences that AC-4 and AC-7 pin down: at `r = 0.9` the interval is close to
`S`; raising `r` shortens every interval; lowering it lengthens them.

**Whole-day rounding is conditional.** Learners think in days, so intervals land
on whole days — but only while doing so keeps retrievability inside
`retentionTolerance`. Near a stability of one day, rounding moved actual
retrievability by more than the entire tolerance, so short intervals keep sub-day
precision. Stating the rule in terms of the budget rather than as a length
threshold is what makes AC-4 true by construction instead of by luck.

Rounding happens **once**, at the end, never on intermediate values.

## Updating after a review

Applied in this order; the order matters because difficulty feeds stability.

1. **Difficulty** moves toward its grade-implied value, with `again` raising it
   most and `easy` lowering it. `D₀(G) = w₄ − (G−3)·w₅` is **linear** in
   FSRS-4.5; the exponential form belongs to FSRS-5. Clamped to 1 … 10, and —
   per AC-6 — a lapse never *decreases* it.
   The **post-update** difficulty is what steps 2 and 3 consume. Passing the
   pre-update value makes the ordering inert and mis-schedules every subsequent
   review; it is worth up to two weeks of interval on a mature card.
2. **Stability** on success grows by a factor that increases with `S`, decreases
   with `D`, and increases as `R` at review time was *lower* — recalling
   something you had nearly forgotten is worth more than recalling something
   fresh. This is the model's expression of desirable difficulty
   ([`../../study/STUDY-002-evidence.md`](../../study/STUDY-002-evidence.md) E1).
3. **Stability** on a lapse drops to a post-lapse value driven by `D` and the
   `S` it had. Clamped on **both** sides: never above the `S` it already had,
   and never below `S₀(again) = w₀`. Without the lower bound, repeated lapses
   drive stability toward zero — and the forgetting curve divides by it.
4. **State** transitions per the parent's map.

## Weights

17 trainable parameters. Defaults ship as a named constant table with a version
number, because changing them changes every future interval — a calibration
event under
[`../../study/STUDY-003-level-model.md`](../../study/STUDY-003-level-model.md) rule 4, so
the version is recorded next to the review that used it.

Per-user optimisation against the learner's own log is out of scope for now: the
defaults already predict recall better than SM-2 for practically all users.

## What this module must not do

- **Never read a clock.** `now` is a parameter. A scheduler that calls
  `Date.now()` internally cannot be tested for AC-8 or AC-9.
- **Never mutate an input.** Projections (parent behavior row 4) require computing
  four futures without committing any of them.
- **Never persist a derived value as truth.** `S`, `D`, `due` and `state` may be
  cached for speed, but the log is authoritative and AC-9 proves it.
- **Never discard an answer.** A grade the machine cannot apply is reported, not
  dropped (AC-12, AC-13). A silently rejected review leaves the persisted log and
  the state derived from it disagreeing about what happened.
- **Never let the projection and the outcome diverge.** `project` runs the same
  guards as `applyReview`, including the refusals (AC-14).
- **Never round intermediate values** — rounding twice produces intervals that
  drift from the projection the learner was shown, which breaks AC-8 in a way
  that looks like a rounding nit and reads to the learner as a lie.
