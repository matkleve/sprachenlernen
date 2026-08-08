# UC-023 — Report something the app got wrong

<!-- id: UC-023 -->
<!-- specs:  -->

**Who:** any learner who hits a sentence that is odd, a translation that is
wrong, or audio that does not match its text.
**Wants to:** say so in one action and move on.
**So that:** wrong content gets fixed instead of memorised — and the people
running the app find out how good their generated material actually is.

Derived from [`../studie/10-antipatterns.md`](../studie/10-antipatterns.md) A5
and [`../studie/01-duolingo.md`](../studie/01-duolingo.md) D6.

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
- The item is **flagged for this learner immediately**: it stops being scheduled
  while under question, rather than continuing to appear for weeks.
- The learner is told what happened to their report.
- Content is marked with where it came from, so a learner can weigh a generated
  sentence differently from a checked one.
- Reports accumulate into a signal that is actually looked at — repeated reports
  on one item, or a spike for one generator or language, are visible to whoever
  maintains the content.

## Out of scope

A public correction forum, learner-submitted replacement content, and
crowd-voting on what is correct.
