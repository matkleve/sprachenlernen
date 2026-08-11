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

## Success looks like

- Levels, vocabulary estimates and calibration are **per language**, never
  pooled. A B2 in one language says nothing about the other.
- The learner sets a **combined** daily budget, and it is divided between
  languages — rather than each language claiming a full session.
- The learner can put a language in maintenance: enough review to hold what
  exists, no new material, no pressure (related to UC-006).
- Switching languages is one action and does not lose session state.
- Notifications are combined into one, not one per language.
- Where two languages are close (Spanish and Italian), confusions between them
  are treated as a **diagnosable error type** with minimal-pair repair, not as
  ordinary failures (related to UC-013).
- Method floors ([`../study/12-method-cards.md`](../study/12-method-cards.md))
  apply per language but the daily prompt cap is global — one prompt a day
  across everything.

## Out of scope

Learning two languages from each other (Spanish via French), and any claim about
optimal ordering or spacing of languages.
