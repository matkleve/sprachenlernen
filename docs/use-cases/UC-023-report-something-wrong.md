# UC-023 — Report something the app got wrong

<!-- id: UC-023 -->
<!-- specs: SPEC-service-broken-card-detection -->

**Who:** any learner who hits a sentence that is odd, a translation that is
wrong, or audio that does not match its text.
**Wants to:** say so in one action and move on.
**So that:** wrong content gets fixed instead of memorised — and the people
running the app find out how good their generated material actually is.

Derived from [`../study/10-antipatterns.md`](../study/10-antipatterns.md) A5
and [`../study/01-duolingo.md`](../study/01-duolingo.md) D6.

## Today

Generated content is shipping into language courses across the industry, with
quality trade-offs stated openly. The learner is structurally unable to judge
whether a target-language sentence is correct — that is why they are learning —
so a wrong sentence is memorised with exactly the care a right one gets. And
where a report button exists, nothing visibly comes back.

## Success looks like

- Every piece of content — card, sentence, text, audio clip, translation — can
  be reported from where it appears, in one action, without leaving the session.
- The report needs no category and no explanation, though both can be given.
- The item is **flagged for this learner immediately**: it stops being
  scheduled **starting the next session**, rather than continuing to appear
  for weeks. It is not pulled out from underneath a session already in
  progress — the same fixed-queue behaviour
  [`session-builder.md`](../specs/service/session-builder.md) already gives a
  card that gets suspended mid-run (a session's queue is built once, at
  `preparing`, and never revisited until the next one). A card that just
  vanished mid-session would read as a bug, not a feature — checked
  2026-08-12, this needs no new mechanism, the existing one already behaves
  this way. **⚠ Watch this reasoning, not just the outcome, once
  [UC-071](UC-071-get-a-wrong-card-back-before-the-session-ends.md) ships:**
  the queue stops being "never revisited" the moment same-session requeue
  exists (it will re-insert cards mid-run). The *outcome* this bullet wants —
  a flagged card never disappears out from under an in-progress session — can
  likely still hold, but it will need a new reason (an explicit rule in the
  requeue spec), not this one, which will no longer be true.
- The learner is told what happened to their report.
- Content is marked with where it came from, so a learner can weigh a generated
  sentence differently from a checked one.
- Reports accumulate into a signal that is actually looked at — repeated reports
  on one item, or a spike for one generator or language, are visible to whoever
  maintains the content.
- **The report is scoped to one (Word, Spoken language) pair, not to the Word
  in the abstract.** "The translation is wrong" is a claim about one specific
  description text, in one specific spoken language, describing one specific
  word — see **Spoken language** and **Learning language** in
  [`../GLOSSARY.md`](../GLOSSARY.md). Once a second spoken language ships
  description text (UC-069 — word identity and description text are separate
  records, keyed by (word, spoken language)), the same word's English and
  German descriptions are independent texts that can each be right or wrong
  on their own; a report must say which one it is about, never flag "this
  word" as a whole.

## Out of scope

A public correction forum, learner-submitted replacement content, and
crowd-voting on what is correct. A moderator **role** or a review-queue UI —
v1 is a flag the person maintaining the content can query directly; a
dedicated review workflow, if it is ever needed, is a later increment on top
of the same flag, not a redesign of it.

## Undecided

Unblocked 2026-08-12: UC-069 settled the shape a report's key needs — word
identity and description text are separate records, keyed by (`wordId`,
spoken language). A report can use that same key directly. What is still
open is smaller and specific to this use case:

- **⚠ SPEC GAP: does a report point at the whole description, or one part of
  it** (once UC-069's "single string vs. split parts" question resolves) —
  deferred until that one is decided, since it changes what "which part is
  wrong" can even mean.
