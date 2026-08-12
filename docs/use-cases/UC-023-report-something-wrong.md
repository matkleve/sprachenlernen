# UC-023 — Report something the app got wrong

<!-- id: UC-023 -->
<!-- specs:  -->

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
  this way.
- The learner is told what happened to their report.
- Content is marked with where it came from, so a learner can weigh a generated
  sentence differently from a checked one.
- Reports accumulate into a signal that is actually looked at — repeated reports
  on one item, or a spike for one generator or language, are visible to whoever
  maintains the content.
- **The report is scoped to one (Learning language, Gloss language) pair, not
  to the Word in the abstract.** "The translation is wrong" is a claim about
  one specific gloss text in one specific gloss language attached to one
  specific learning language's card — see **Gloss language** and **Learning
  language** in [`../GLOSSARY.md`](../GLOSSARY.md). Once UC-070 ships more than
  one gloss language, the same card's English gloss and German gloss are
  independent texts that can each be right or wrong on their own; a report
  must say which one it is about, never flag "this card" as a whole.

## Out of scope

A public correction forum, learner-submitted replacement content, and
crowd-voting on what is correct. A moderator **role** or a review-queue UI —
v1 is a flag the person maintaining the content can query directly; a
dedicated review workflow, if it is ever needed, is a later increment on top
of the same flag, not a redesign of it.
