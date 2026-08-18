# 39 · Material units, gap-fill shapes, and listening defer

**Date:** 2026-08-18  
**Triggers:** owner asked how methods get data at different scales (one sentence,
paragraph, five minutes of audio, half-filled listen-and-type); round-table
(data scientist, UX designer, language teacher) on the content pipeline; Duolingo-style
*"I can't listen now"* defer.  
**Normative specs:**
[`material-unit.md`](../specs/service/material-unit.md),
[`listening-defer.md`](../specs/feature/listening-defer.md),
[`method-material-setup.md`](../specs/feature/method-material-setup.md).

---

## Problem

One **Source** can serve many session shapes. Learners and methods care about
*how much* material and *what interaction* — not only which article was picked.
Without declared units, partial dictation uses a demo hack (every second word)
and Start hides the real pipeline.

---

## Round-table synthesis (2026-08-18)

| Voice | Keep | Fix |
| --- | --- | --- |
| **Data scientist** | One Source + computed coverage; greedy gap-to-95 % | Thin catalogue; duplicate demo sentences; placeholder gap rules; audio windows unused |
| **UX designer** | Topic chips; library vs session setup split | Chips not shipped; two chrome patterns; reading split across `/content` vs method name |
| **Language teacher** | Coverage-aligned input; honest `doesNotDo` | Gaps must target forms/contrast/content words; lemma coverage ≠ heard-in-noise |

**Consensus:** architecture is sound; ship **setup preview + principled units/gaps**
before adding more catalogue method names.

---

## Material units (owner + discussion)

A **material unit** is a slice of a resolved Source the app picks for one session.

| Unit `id` | Typical use | Resolved from |
| --- | --- | --- |
| `sentence` | Cloze, one-shot dictation, demo | One sentence, substantial, skip frequency stubs |
| `paragraph` | Intensive reading, short dictation block | One paragraph or ≤ N tokens |
| `window` | Listening, partial dictation on audio | Best transcript window by coverage (default **300 s** / 5 min; method may set 60–600 s) |
| `full` | Extensive reading | Entire `body` or transcript |

Methods declare `materialUnits: [{ id, default? }]` — learner may switch when
the method allows more than one (e.g. short vs long session).

**Not stored in JSON per exercise** — computed at session start from Source +
held lemmas + method rules.

---

## Gap-fill listen shape (owner)

Half-filled target sentence: learner **listens** and fills blanks by **typing**
or **speaking** (when sound is available).

| Input mode | When |
| --- | --- |
| `type` | Default when listening allowed |
| `speak` | Optional when microphone + sound context |
| `type-only` | When listening defer active — same gaps, no audio step |

Gap **selection** (not alternating words): content words the learner holds in
writing but not by ear; recent lemmas; optional phonological contrast targets
(UC-028). v1 may ship subset; spec forbids random/alternating-only rules.

---

## Listening defer (owner)

*"I can't listen now"* — situational, not a profile exclusion (UC-020).

- **Duration:** 15 minutes (session preference, default).
- **Effect:** in mixed-stack sessions, listening steps offer **type-only** variant
  or are skipped; copy confirms defer end time. Method-menu filter removed
  2026-08-18 — premature without mixed stacks.
- **Not:** scoring listening skills low; permanent opt-out.

Inspired by Duolingo-style honesty when environment cannot use audio.

---

## Decisions [D]

| # | Decision |
| --- | --- |
| 1 | Material units are **data + resolver**, not per-method sentence files |
| 2 | Gap rules are **method-specific algorithms** on shared unit text |
| 3 | Demonstration sentences stay **method preview only** — do not duplicate Sources |
| 4 | Listening defer is **temporary** — distinct from UC-020 skill exclusion |
| 5 | Preview before Start shows **unit + coverage + time** (study/37 wireframe) |

---

## Open

- Catalogue authoring at scale (tagging, QA, no frequency-list prefixes in real text).
- ASR grading for `speak` input mode.
- Chain same Source across methods (read → dictate → retell) — session handoff spec gap.
