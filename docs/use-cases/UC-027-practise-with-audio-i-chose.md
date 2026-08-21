# UC-027 — Practise with audio I actually wanted to listen to

<!-- id: UC-027 -->
<!-- specs: SPEC-service-content-ingestion, SPEC-service-coverage, SPEC-feature-content-traceability -->

**Who:** a learner who already follows podcasts, channels or audiobooks in the
target language — and understands maybe two thirds of them.
**Wants to:** use that material as practice instead of as a monthly
disappointment.
**So that:** the thing they were motivated to listen to anyway becomes the thing
that teaches them.

Derived from [`../study/STUDY-015-own-content.md`](../study/STUDY-015-own-content.md),
[`../study/archive/ARCH-048-content-licensing-and-adaptation.md`](../study/archive/ARCH-048-content-licensing-and-adaptation.md).

**Note (owner 2026-08-20):** **text articles** are always read in **full**
(UC-007). **Audio** may still use a **transcript window** for one session when
the episode is longer than the time available — that is not the same as cutting
a reading article.

## Today

Real audio sits far above any learner's level — often 70–85 % known words where
95 % is the floor for comfortable understanding. Learners either give up on it or
listen without understanding and call it immersion. Meanwhile the app offers
generated material they have no interest in.

## Success looks like

- The learner adds their own sources: an RSS feed, a file, a link. **No**
  entertainment podcast catalogue — intake is learner-private
  ([`content-ingestion.md`](../specs/service/content-ingestion.md) lane A).
- Every added item shows its coverage for this learner before it is opened.
- Where an episode is too hard as a whole, the app may offer the **best
  transcript window** for one listening session — coverage over a sliding window
  ([`coverage.md`](../specs/service/coverage.md)) — **audio only**, not reading.
- Items from one series or one speaker are grouped and suggested together (narrow
  listening).
- A second or third pass over the same item removes support rather than
  repeating identically: translation, then transcript only, then audio alone.
- An item with no transcript states plainly that coverage, dictation and
  sentence-level commands are unavailable for it.
- Words the learner replayed repeatedly are offered as cards afterwards.
- Optional: TTS of an **adapted full text** (UC-030) when studio audio is missing
  — **⚠ SPEC GAP:** voice quality bar.

## Out of scope

A curated podcast catalogue without partner licences; recommendations from other
learners; generating a transcript where none exists (later); adapting and
**republishing** learner audio to other users.
