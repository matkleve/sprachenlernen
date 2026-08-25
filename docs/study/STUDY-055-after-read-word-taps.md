# 55 · After reading: word taps vs the Durchsehen screen

<!-- id: STUDY-055 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-007 -->

## Thesis

Post-read self-assessment questions are weak retrieval and weak card capture;
word tapping during reading is the honest loop UC-007 describes.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

**Date:** 2026-08-22  
**Triggers:** owner on Italian fixture extensive-reading — German chrome, English
fallback questions, three sentences for a twenty-minute package, clipped option
shadows, and intent to tap unknown words instead of answering "Did you follow the
main idea?"  
**Normative specs:**
[`reading-surface.md`](../specs/feature/reading-surface.md),
[`exercise-recipe-composer.methods.md`](../specs/service/exercise-recipe-composer.methods.md),
[`material-unit.md`](../specs/service/material-unit.md).

---

## What the shipped screen actually does

| Piece | Today | Problem |
| --- | --- | --- |
| Read step | Plain `text-display` — no taps | Readable text exists on `/content/[id]` only |
| Review step | `comprehension-questions` | Fallback is UI-locale self-report, not text retrieval |
| Decide step | Inert offers | "Save a word as a card" does not queue a card |
| Material | `full` unit on short fixtures | `it-fixture-bar` is three sentences for a 20 min package |

The **Durchsehen** label is accurate chrome — it is a review step — but the
content does not review *what was read*. It asks meta questions in the wrong
language when no source-specific checks exist.

---

## Benefit of answering vs benefit of tapping (five ways word-first helps)

These are product consequences, not a claim that self-report is useless.

1. **Exact unknowns, not vibes.** Taps name lemmas the learner did not know *in
   context*. "Partly" does not tell the schedule which items to reinforce.
   ([`STUDY-005`](STUDY-005-input-reading-listening.md), tapping loop;
   [`UC-007`](../use-cases/UC-007-read-something-at-my-level.md).)

2. **Retrieval practice on the text [A].** Source-specific comprehension
   questions force recall of *what the passage said*. Reflective fallbacks
   ("Could you follow the main idea?") measure comfort, not memory of content —
   [`STUDY-002-evidence.md`](STUDY-002-evidence.md) E1. Dictation beat
   comprehension questions on immediate tests; reflective MCQs are weaker still.

3. **Card pipeline with context.** A tapped word can carry the sentence it appeared
   in — the card the learner wanted when they tapped. Self-assessment does not
   produce card candidates; the decide offer promised it without implementing it.

4. **Honest difficulty signal.** Tap count + coverage delta beats self-report for
   readiness and material ranking — [`STUDY-024-readiness-and-difficulty.md`](STUDY-024-readiness-and-difficulty.md).
   "Too hard" is subjective; "tapped twelve words in ninety seconds" is measurable.

5. **Translation on the *next* screen, not during flow.** Owner intent: mark
   unknowns while reading, then see glosses or sentence translations on a follow-up
   pass. That preserves a retrieval attempt during the first pass
   ([`STUDY-005`](STUDY-005-input-reading-listening.md) delay rule [D]) while
   still giving help before the session ends.

**When reflective questions still help [D]:** no fixture questions, learner on
authentic text without tap UI yet, or a quick comfort check *after* taps are
recorded — not as a substitute for them.

---

## Content length: why three sentences feel like a broken promise

| Cause | Detail |
| --- | --- |
| Short fixture | `it-fixture-bar` body is three sentences |
| `full` unit | Catalogue default for extensive-reading — entire body, not window |
| Package honesty | Method ships 20 and 45 min packages; G7 expects wall estimate in band |
| No pagination | `text-display` scrolls one blob; no 15-screen walkthrough |

**Directions (not mutually exclusive):**

| Option | Learner experience | Build cost |
| --- | --- | --- |
| **A · Paginated read** | 15 short screens inside runner; footer stays anchored | `paginated` profile + turns |
| **B · One long text + tap pass** | Single scroll; unknown words highlighted in `accent` | Reuse `ReadableText` in runner |
| **C · Pre-mark unknowns** | Show new lemmas in primary colour before read | Coverage + token styling |
| **D · Honest packages** | Drop 20 min until catalogue has full articles per language | Catalogue + G7 only |
| **E · Replace Durchsehen** | Tap review recap → gloss sheet for tapped words | Runner step swap |

Owner preference from session: **B or E** over the current comprehension screen.

---

## What we reject

- Keeping English fallback strings in recipes — gate: `check-i18n-recipe-copy`.
- Pretending offers schedule cards until queueing exists.
- Stretching three sentences across twenty minutes with filler questions.

## Open questions

- Persist tapped tokens across runner steps (Sensitive — session state).
- Source-specific comprehension for every catalogue language vs tap-only review.
- Whether reflective fallback stays as a secondary signal when taps = 0.

## Related

- [`STUDY-005-input-reading-listening.md`](STUDY-005-input-reading-listening.md)
- [`STUDY-021-how-an-exercise-runs.md`](STUDY-021-how-an-exercise-runs.md)
- [`UC-007-read-something-at-my-level.md`](../use-cases/UC-007-read-something-at-my-level.md)
- [`reading-surface.md`](../specs/feature/reading-surface.md)
- [`DR-042-method-usefulness-ux-audit.md`](../reviews/design/DR-042-method-usefulness-ux-audit.md)
