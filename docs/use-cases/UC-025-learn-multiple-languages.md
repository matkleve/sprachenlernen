# UC-025 — Learn multiple languages, each fully separate

<!-- id: UC-025 -->
<!-- specs: SPEC-service-learning-languages, SPEC-page-language-picker, SPEC-feature-app-shell, SPEC-feature-mobile-nav-v2, SPEC-component-language-flag, SPEC-component-language-list-row -->

**Who:** someone using the app for one or more languages who starts another —
their second, third, or twelfth; the count never matters.
**Wants to:** keep every one of them running, each with its own progress and
its own daily load.
**So that:** adding a new language never disturbs any language already in
progress, no matter how many there are.

Derived from [`../backlog/BL-009-feature-catalogue.md`](../backlog/BL-009-feature-catalogue.md)
F84 and question 6 in
[`../backlog/BL-011-roadmap-open-questions.md`](../backlog/BL-011-roadmap-open-questions.md).

## Today

Apps handle several languages by simply adding them: a full daily load and a
full set of notifications per language, and a level display that either mixes
them or shows only one. The predictable result is that the newest language
crowds out the older ones, which quietly decay.

**Corrected 2026-08-12 — the fix is isolation, not a shared budget.** An earlier
version of this use case tried to solve the crowding-out problem by giving every
learning language a slice of one combined daily allotment, so scheduling would
consider all of them at once. **Rejected by the owner, in full.** Learning
languages are not one system with a shared resource — each is a separate thing
you can be doing, the same way switching between courses on another platform
puts you fully in one and not partly in several. There is nothing here for a
budget to divide, because there is no shared pool to divide it from, no matter
how many languages the account holds.

## Success looks like

- Levels, vocabulary estimates and calibration are **per language**, never
  pooled, regardless of how many languages the account is learning. A B2 in one
  says nothing about any other.
- **A review session belongs to exactly one language, always.** No two
  languages' cards ever appear in the same session, share a queue, or get
  scheduled against each other — true whether the account holds two languages
  or ten. If you are learning Spanish, you are practising Spanish — full stop,
  never "mostly Spanish with some of whatever else I'm learning mixed in by
  whatever the scheduler decided was due."
- Switching which language you are working with is exactly like switching
  which course you are in — one action from a **destination root** (tap the
  top-left flag, pick a row or **Add a language**) or from `/profile` on any
  route. On mobile drill-in screens the top-left is the back control only; go
  back to a destination root or open profile to switch language.
- Each language can independently be put in maintenance: enough review to hold
  what exists, no new material, no pressure (related to UC-006). Still per
  language, still never shared with any other language's schedule, no matter
  how many are in maintenance at once.
- Method floors ([`../study/STUDY-010-method-cards.md`](../study/STUDY-010-method-cards.md))
  apply per language, same as everything else here — no global, cross-language
  version of anything, regardless of language count.

## Out of scope

Learning one language from another (Spanish via French); any claim about
optimal ordering or spacing of languages; **any mechanism that looks at more
than one learning language at once** — a combined daily budget, a shared
notification, a cross-language confusion detector — all explicitly rejected
above, not merely undecided, and not reintroduced just because the account
happens to hold two similar languages. A future use case may propose one of
these again, but it would need its own justification from scratch; this one
does not carry it forward as "later."
