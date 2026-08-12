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

### Why this is not a small addition

It touches four things this project already has opinions about, and none of
them obviously say yes:

1. **Two different "repeat" mechanisms would coexist.** FSRS (`lib/scheduler.ts`)
   already decides "when does this come back" — in **days**, cross-session,
   from `stability`/`difficulty`. A same-run requeue is a **third** time scale
   nothing today models: not "due", not "new", but "again before the run ends".
   `buildSession` builds a **fixed** queue once ([`session-builder.md`](specs/service/session-builder.md))
   and has no concept of inserting a card mid-run.
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
  cross-session schedule; a same-run mechanic must not make that schedule feel
  arbitrary by comparison.
- [UC-039](use-cases/UC-039-see-todays-session-before-starting.md) — session
  composition and progress visibility; the "count never grows" rule lives here
  and any change to what `position`/`total` mean must be checked against it.
- [UC-013](use-cases/UC-013-stop-losing-time-on-one-card.md) — the cross-session
  leech trap; the diagnosis-and-repair answer this use case already commits to.
