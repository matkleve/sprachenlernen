# Scheduler — algorithm detail

Split child of [`scheduler.md`](scheduler.md). Normative for the formulas; the
contract, states and acceptance criteria live in the parent. Nothing here
repeats a rule from there.

Source: FSRS (Free Spaced Repetition Scheduler), the model Anki ships since
23.10. Rationale for choosing it over SM-2 — including that its variables are
the ones a human can be *shown* — is in
[`../../studie/04-karteikarten-srs.md`](../../studie/04-karteikarten-srs.md).

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

Consequences that the parent's AC-4 and AC-7 pin down: at `r = 0.9` the interval
is close to `S`; raising `r` shortens every interval; lowering it lengthens them.
The interval is then clamped to at least one day for tasks in `review`, and
rounded — rounding happens **once**, at the end, never on intermediate values.

## Updating after a review

Applied in this order; the order matters because difficulty feeds stability.

1. **Difficulty** moves toward its grade-implied value, with `again` raising it
   most and `easy` lowering it. It is clamped to 1 … 10, and — per AC-6 — a
   lapse never *decreases* it.
2. **Stability** on success grows by a factor that increases with `S`, decreases
   with `D`, and increases as `R` at review time was *lower* — recalling
   something you had nearly forgotten is worth more than recalling something
   fresh. This is the model's expression of desirable difficulty
   ([`../../studie/02-evidenz.md`](../../studie/02-evidenz.md) E1).
3. **Stability** on a lapse drops to a post-lapse value driven by `D` and the
   `S` it had, and never below the initial stability for that grade.
4. **State** transitions per the parent's map.

## Weights

17 trainable parameters. Defaults ship as a named constant table with a version
number, because changing them changes every future interval — a calibration
event under
[`../../studie/03-level-modell.md`](../../studie/03-level-modell.md) rule 4, so
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
- **Never round intermediate values** — rounding twice produces intervals that
  drift from the projection the learner was shown, which breaks AC-8 in a way
  that looks like a rounding nit and reads to the learner as a lie.
