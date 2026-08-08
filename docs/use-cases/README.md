# Use cases

What a person is trying to accomplish — in their words, before any decision
about screens or components. One file per use case, `UC-NNN-slug.md`.

A use case is not a feature. "Filter the list by status" is a feature; "find the
one order I need to act on today" is a use case, and it might be answered by
sorting, a saved view, or a notification instead. Keeping the two apart is what
lets you notice that the requested feature is not the cheapest answer.

## Format

```markdown
# UC-NNN — <one line, from the user's side>

<!-- id: UC-NNN -->
<!-- specs: SPEC-feature-slug -->

**Who:** …
**Wants to:** …
**So that:** …

## Today

How they do it now, and what it costs them.

## Success looks like

Observable outcomes. If none of these can be observed from outside, the use case
is really a technical task — put it in an issue, not here.

## Out of scope

The adjacent things a reader would assume are included.
```

The `specs:` comment lists the specs that implement it. `npm run check:specs`
verifies every ID resolves in both directions — a use case with no spec is an
unkept promise, a spec with no use case is a solution looking for a problem.

## Index

**UC-001 to UC-003 are the Grundriss starter's worked examples.** They document
the primitives in `components/ui/` and stay until this project's own features
demonstrate the same patterns.

| ID | Use case | Specs |
| --- | --- | --- |
| [UC-001](UC-001-inspect-one-item-from-a-list.md) | Inspect one item from a list | `SPEC-feature-item-picker`, `SPEC-component-button` |
| [UC-002](UC-002-fill-in-a-form-without-getting-stuck.md) | Fill in a form without getting stuck | `SPEC-component-field`, `SPEC-component-select`, `SPEC-component-dialog` |
| [UC-003](UC-003-scan-a-table-of-records.md) | Scan a table of records | `SPEC-component-table` |

Ours, derived from [`../studie/`](../studie/). All are **drafts** — none has a
spec yet, which is why `check:specs` warns about them. That warning is correct
and should stay until each is specified.

The **Stage** column is the roadmap stage in
[`../studie/11-roadmap-offene-fragen.md`](../studie/11-roadmap-offene-fragen.md).
It is the order to specify them in. A use case whose stage has not been reached
is a promise, not a queue item — do not start writing its spec early just
because it is interesting.

| ID | Use case | Stage | Studie |
| --- | --- | --- | --- |
| [UC-011](UC-011-start-in-the-first-minute.md) | Start learning in the first minute, without deciding anything | 1 | [01](../studie/01-duolingo.md) |
| [UC-005](UC-005-trust-the-review-schedule.md) | Understand why a card is in front of me right now | 1 | [04](../studie/04-karteikarten-srs.md) |
| [UC-006](UC-006-come-back-after-a-break.md) | Come back after two weeks away without drowning | 1 | [04](../studie/04-karteikarten-srs.md), [08](../studie/08-motivation.md) |
| [UC-012](UC-012-capture-a-word-i-just-met.md) | Turn a word I just met into practice | 1 | [04](../studie/04-karteikarten-srs.md) |
| [UC-021](UC-021-learn-without-relying-on-fluent-reading.md) | Learn without relying on fluent reading and spelling | 1 · Querschnitt | [14](../studie/14-barrierefreiheit.md) |
| [UC-024](UC-024-take-my-history-with-me.md) | Take my learning history with me | 1 · Querschnitt | [`CONSTITUTION`](../CONSTITUTION.md) §2 |
| [UC-004](UC-004-know-where-i-stand.md) | Know where I stand, and whether I am getting better | 2 | [03](../studie/03-level-modell.md) |
| [UC-020](UC-020-learn-without-relying-on-hearing.md) | Learn the language without relying on hearing | 2 | [14](../studie/14-barrierefreiheit.md) |
| [UC-007](UC-007-read-something-at-my-level.md) | Read something I can almost understand | 3 | [05](../studie/05-input-lesen-hoeren.md) |
| [UC-022](UC-022-understand-a-rule-when-i-get-it-wrong.md) | Understand a rule at the moment I get it wrong | 3 | [02](../studie/02-evidenz.md) E5 |
| [UC-023](UC-023-report-something-wrong.md) | Report something the app got wrong | 3 · Querschnitt | [10](../studie/10-antipatterns.md) A5 |
| [UC-014](UC-014-hear-a-difference-i-cannot-hear.md) | Hear a difference I currently cannot hear | 4 (first) | [13](../studie/13-aussprache-hoerwahrnehmung.md) |
| [UC-008](UC-008-listen-while-my-hands-are-busy.md) | Listen while walking, cooking or commuting | 4 | [05](../studie/05-input-lesen-hoeren.md) |
| [UC-018](UC-018-keep-learning-with-no-connection.md) | Keep learning with no connection | 4 | F82 |
| [UC-010](UC-010-choose-how-to-practise-today.md) | Choose how to practise today, without choosing badly | 4b | [12](../studie/12-methodenkarten.md) |
| [UC-013](UC-013-stop-losing-time-on-one-card.md) | Stop losing time on the card I keep failing | 4b | [04](../studie/04-karteikarten-srs.md) |
| [UC-015](UC-015-speak-without-being-judged.md) | Say something in the language without an audience | 5 | [06](../studie/06-produktion.md) |
| [UC-017](UC-017-get-a-correction-i-can-act-on.md) | Write something and get a correction I can act on | 5 | [06](../studie/06-produktion.md) |
| [UC-009](UC-009-practise-away-from-the-screen.md) | Practise on paper, and have it count | 5 | [07](../studie/07-offline-papier.md) |
| [UC-019](UC-019-learn-for-something-specific.md) | Learn for the thing I actually need it for | 5 | [08](../studie/08-motivation.md) M7 |
| [UC-025](UC-025-learn-a-second-language.md) | Learn a second language without disturbing the first | 6 | F84 |
| [UC-026](UC-026-prepare-for-a-real-conversation.md) | Prepare for a conversation that is actually happening | 6 | [07](../studie/07-offline-papier.md) Ü5 |
| [UC-016](UC-016-find-out-what-i-avoid.md) | Find out what I have been avoiding | 6 | [06](../studie/06-produktion.md) |

**Not yet written**, and deliberately: use cases for content production (adding a
language pair, recording a talker pool, curating texts). Those are operator
tasks, not learner goals, and putting them here would blur what a use case is.
They need their own home once question 1 in the roadmap is answered.
