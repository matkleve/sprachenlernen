# UC-019 — Learn for the thing I actually need it for

<!-- id: UC-019 -->
<!-- specs: SPEC-service-learner-world, SPEC-feature-learner-world-setup, SPEC-service-session-sampling, SPEC-feature-card-example-sentence, SPEC-feature-content-traceability, SPEC-feature-method-material-setup, SPEC-page-profile -->

**Who:** someone with a reason — a move, a job, a family, an exam, a book they
want to read.
**Wants to:** have that reason change what they are taught.
**So that:** the words they learn are the words they will need, and the goal
they gave the app is not just an onboarding question.

Derived from [`../study/08-motivation.md`](../study/08-motivation.md) M7,
[`../study/01-duolingo.md`](../study/01-duolingo.md) D7,
[`../study/16-further-findings.md`](../study/16-further-findings.md) W4, and
[`../study/56-lernwelt-single-choice.md`](../study/56-lernwelt-single-choice.md).

## Today

Apps ask why you are learning and then teach everyone the same course. The
answer changes a welcome message and nothing else. Meanwhile a course built for
no one in particular spends a learner's first months on vocabulary they will not
use for years.

## Success looks like

- The learner picks **one Lernwelt** (Business, Alltag, Technik, Politik, Natur
  & Garten, or Allgemein) — a flat choice, not register plus topic, not hidden
  situation tags ([`56`](../study/56-lernwelt-single-choice.md) W1).
- The choice **weights** what appears: new words in a session, example sentences,
  reading catalogue picks, and method material — via probability, **not** fixed
  card quotas or a 100% exclusive filter.
- **FSRS stays honest:** due dates and grades follow memory only; Lernwelt affects
  session composition, not `applyReview` ([`56`](../study/56-lernwelt-single-choice.md)
  W9, UC-005).
- The learner can **see and change** the active Lernwelt in Profile; switching
  shows a one-time confirmation that held words are kept — no reset.
- A learner with no particular goal picks **Allgemein** or skips; the
  frequency-ordered path remains legitimate.
- **Transparency without nagging:** the app does **not** repeat *"because you
  chose Politik"* on every session, Home banner, or card — the learner already
  knows what they picked ([`56`](../study/56-lernwelt-single-choice.md) W2).
- Changing the Lernwelt does not discard what was already learned; reviews for
  words from a previous world still run when due.

## Out of scope

Exam-specific coaching for particular certificates, curriculum import, promising
a level by a date (UC-004 handles projections, with uncertainty), Duolingo-style
visible unit progress, and per-world retention dials (v2 ⚠ SPEC GAP).
