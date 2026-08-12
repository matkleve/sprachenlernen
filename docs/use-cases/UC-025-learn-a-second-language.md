# UC-025 — Learn a second language without disturbing the first

<!-- id: UC-025 -->
<!-- specs: SPEC-service-learning-languages, SPEC-page-language-picker -->

**Who:** someone already using the app for one language who starts another.
**Wants to:** keep both running, with separate progress and a sane daily load.
**So that:** starting a new language does not wreck the habit they built on the
old one.

Derived from [`../study/09-feature-catalogue.md`](../study/09-feature-catalogue.md)
F84 and question 6 in
[`../study/11-roadmap-open-questions.md`](../study/11-roadmap-open-questions.md).

## Today

Apps handle several languages by simply adding them: two full daily loads, two
sets of notifications, and a level display that either mixes them or shows only
one. The predictable result is that the newer language crowds out the older one,
which quietly decays.

**Corrected 2026-08-12 — the fix is isolation, not a shared budget.** An earlier
version of this use case tried to solve the crowding-out problem by giving every
learning language a slice of one combined daily allotment, so scheduling would
consider all of them at once. **Rejected by the owner, in full.** Two learning
languages are not one system with a shared resource — they are two separate
things you can each be doing, the same way switching between two courses on
another platform means you are simply in a different course now, not in both
courses' material at once. There is nothing here for a budget to divide, because
there is no shared pool to divide it from.

## Success looks like

- Levels, vocabulary estimates and calibration are **per language**, never
  pooled. A B2 in one language says nothing about the other. This was already
  true and stays true.
- **A review session belongs to exactly one language, always.** Cards from two
  different learning languages never appear in the same session, never share a
  queue, and are never scheduled against each other. If you are learning
  Spanish, you are practising Spanish — full stop, not "mostly Spanish with some
  Italian mixed in by whatever the scheduler decided was due."
- **Switching which language you are working with is exactly like switching
  which course you are in** — one action, from the profile. It changes what you
  see and what you practise next; it changes nothing about the other language's
  stored progress, which is exactly where you left it whenever you switch back.
- The learner can put a language in maintenance: enough review to hold what
  exists, no new material, no pressure (related to UC-006). Still per language,
  still never shared with any other language's schedule.
- Method floors ([`../study/12-method-cards.md`](../study/12-method-cards.md))
  apply per language, same as everything else here — no global, cross-language
  version of anything.

## Out of scope

Learning two languages from each other (Spanish via French); any claim about
optimal ordering or spacing of languages; **any mechanism that looks at more
than one learning language at once** — a combined daily budget, a shared
notification, a cross-language confusion detector — all explicitly rejected
above, not merely undecided. A future use case may propose one of these again,
but it would need its own justification from scratch; this one does not carry
it forward as "later."
