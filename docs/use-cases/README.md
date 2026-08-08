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

| ID | Use case | Studie |
| --- | --- | --- |
| [UC-004](UC-004-know-where-i-stand.md) | Know where I stand, and whether I am getting better | [03](../studie/03-level-modell.md) |
| [UC-005](UC-005-trust-the-review-schedule.md) | Understand why a card is in front of me right now | [04](../studie/04-karteikarten-srs.md) |
| [UC-006](UC-006-come-back-after-a-break.md) | Come back after two weeks away without drowning | [04](../studie/04-karteikarten-srs.md), [08](../studie/08-motivation.md) |
| [UC-007](UC-007-read-something-at-my-level.md) | Read something I can almost understand | [05](../studie/05-input-lesen-hoeren.md) |
| [UC-008](UC-008-listen-while-my-hands-are-busy.md) | Listen while walking, cooking or commuting | [05](../studie/05-input-lesen-hoeren.md) |
| [UC-009](UC-009-practise-away-from-the-screen.md) | Practise on paper, and have it count | [07](../studie/07-offline-papier.md) |
| [UC-010](UC-010-choose-how-to-practise-today.md) | Choose how to practise today, without choosing badly | [12](../studie/12-methodenkarten.md) |
