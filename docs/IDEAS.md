# Ideas

Raw ideas that are not yet a use case. A use case is a person's goal, tested by
whether its outcomes are observable — an idea is a **mechanism** someone
noticed working elsewhere, before anyone has checked whether it serves a goal
this product actually has. That check is the whole reason this file is
separate from `use-cases/`: writing "Success looks like: session shows five
colours of dot" would smuggle a UI decision into a use case before the goal
behind it was named.

**An idea graduates when:** someone names the use case(s) it would serve, checks
it against existing specs for conflicts, and either writes the use case + spec,
or records why it was rejected, in this file.

**An idea is rejected, not deleted**, when it conflicts with a settled decision
— rejection with a reason is the record that stops it resurfacing identically
in six months.

---

## Status legend

`🆕 unevaluated` · `🔍 in evaluation` · `✅ graduated → UC-NNN` · `❌ rejected`

---

## 2026-08-12 — Same-session card requeueing + per-card status dots

**Status:** 🆕 unevaluated.

**Source:** owner, observing other vocabulary apps' session UX.

### The mechanism, as described

- Grading a card **"medium"** (Hard) sends it to the **end of the current run**
  — not tomorrow, *later in the same session*. Grading **"hard"**/failing sends
  it back **~5 cards ahead**, sooner than the end.
- A card can therefore appear **more than once in one run**.
- A row of small rectangles at the bottom shows every card's status **for this
  run**, left to right:
  - light grey — not worked yet
  - dark green — done (graded well, not queued again)
  - light green — requeued for a repeat later in the run (seeing it turns it
    light green immediately; it only turns **dark** green after being answered
    well **again** on the repeat)
  - orange — medium
  - red — not known at all
- Seeing that a light-green card is coming back is treated as acceptable, even
  though the learner then "knows" a specific card is 5 slots away — the idea
  notes this tension itself.

### How the feedback would be saved — resolved 2026-08-12

Asked and answered: **no new persistence, and the cross-session half of this
is already built.**

- Every graded attempt — first look or a same-run repeat — is just one more
  `{ taskId, at, grade }` row appended to `review_log`. Same shape as today,
  written more than once per card within a run instead of once. No schema
  change.
- "A card that needed more tries comes back sooner" is not a feature to add —
  it is `stabilityAfterLapse` in `lib/scheduler.ts` (already shipped): an
  `again`/`hard` grade lowers `stability`, which shortens `intervalDays`,
  which moves `due` closer. Once the repeat's grades land in the log via the
  point above, FSRS produces exactly this outcome for free.
- The opposite proposal — "all cards that finish a run get 3 or 8 days ±
  randomness, regardless of tries" — would be a **downgrade**: it discards the
  per-card difficulty signal that is the documented reason this app uses FSRS
  over a cruder scheduler ([`study/04-flashcards-srs.md`](study/04-flashcards-srs.md)).
- What genuinely has no existing equivalent: the **within-run** gap ("back in
  ~5 cards"). FSRS's shortest native interval is fractional *days* (its
  `again` weight is ≈0.49 days) — it cannot express "N cards from now" at any
  setting. That half must be **session-local, client-only state** (the
  review-session FSM's queue/position, already thrown away at session end
  today) — never sent through the scheduler.
- So: two tracks, not one mechanism — (1) every attempt still writes a normal
  review row, unchanged; (2) which cards are still pending this run, and how
  many times each has repeated, lives only in client session state. They do
  not need to be reconciled with each other because they answer different
  questions (this run's order vs. tomorrow's date).

### Why this is not a small addition

It touches three things this project already has opinions about:

1. **`buildSession` builds a fixed queue once**
   ([`session-builder.md`](specs/service/session-builder.md)) with no concept
   of inserting a card mid-run. This is a real gap to close, but — see above —
   it does **not** conflict with FSRS's due dates, because those are never
   shown to the user anywhere (`docs/specs/feature/review-session.md`,
   `docs/specs/feature/words-home.md`, `docs/specs/page/words.md`,
   [UC-006](use-cases/UC-006-come-back-after-a-break.md) all forbid a due
   count, badge, or backlog figure). One visible clock only — the run in
   front of you — so a same-run repeat has nothing to compete with for trust.
2. **UC-039 already claims "the count never grows while the learner is working
   through it."** A same-run repeat does not grow the *total* (the card was
   already counted), but `position of total` stops meaning "how far through a
   list of distinct items you are" — position 12 of 15 could be a card's third
   appearance. That is a real UX-copy conflict to resolve, not just an
   implementation detail.
3. **UC-013 (the leech trap) already has an answer for "keeps failing"** —
   suspend after *n* failures and offer a **diagnosis + repair** (confusion with
   another word, too many meanings, no context), explicitly **not** "more
   repetition". A same-run bring-it-back-in-5 is exactly the "more repetition"
   response UC-013 was written to replace for the *cross-session* leech case.
   Does a same-run repeat count toward the failure count that trips suspension,
   or is it a separate, gentler mechanism for use *within* one sitting before
   the cross-session leech logic ever engages? Undecided.
4. **The five-colour dot strip needs design tokens that do not exist yet.**
   `app/globals.css` today has exactly three semantic scales: `accent`,
   `danger`, `success` (plus neutrals). There is no `warning`/orange token, and
   "light green vs dark green" is not two shades either token currently
   defines. AGENTS.md boundary 3 (no raw colours in components) means the token
   set would need to grow *before* this could ship, which is itself a design
   decision (does orange mean the same thing everywhere it might appear later,
   e.g. a future warning banner?).

### Open question, unresolved

**⚠ Does grading a card "Hard" or "Again" mid-session requeue it within the
same run, in addition to (or instead of) affecting its next-day FSRS due
date?** No use case states this goal yet, so there is nothing to write
acceptance criteria against. Two different products are hiding inside one
description:

- **(a) A within-run rehearsal buffer** — closer to Anki's "again" queue or
  Duolingo's per-lesson retry loop. Session-scoped, thrown away at session end,
  orthogonal to FSRS.
- **(b) A visible session-progress indicator** — replacing or supplementing
  `copy.progress(position, total)` text with a per-card status strip. Could
  ship **independently** of (a): dots could show *bucket* (new/shaky/held) for
  today's queue without any within-run requeueing existing at all.

These do not have to be one feature. Splitting them is itself a decision worth
making explicitly before either becomes a use case.

### Where this would land if it graduates

- (a) extends [`session-builder.md`](specs/service/session-builder.md) +
  [`review-session.states.md`](specs/feature/review-session.states.md) — the
  FSM's `advancing` transition would need to sometimes re-insert rather than
  only advance an index, and [UC-013](use-cases/UC-013-stop-losing-time-on-one-card.md)
  would need to say how it relates.
- (b) is a `review-session` UI change plus a token addition, and would need its
  own acceptance criteria for what each colour claims — see UC-064's insistence
  that a shown figure "states what counts as having one" plainly.

### Related, do not conflate

- [UC-005](use-cases/UC-005-trust-the-review-schedule.md) — trusting the
  cross-session schedule. Checked 2026-08-12: no conflict, because the
  schedule this use case protects is never rendered as a date/count/badge
  anywhere the learner can compare it against a same-run mechanic.
- [UC-039](use-cases/UC-039-see-todays-session-before-starting.md) — session
  composition and progress visibility; the "count never grows" rule lives here
  and any change to what `position`/`total` mean must be checked against it.
- [UC-013](use-cases/UC-013-stop-losing-time-on-one-card.md) — the cross-session
  leech trap; the diagnosis-and-repair answer this use case already commits to.
