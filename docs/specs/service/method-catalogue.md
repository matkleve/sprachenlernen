# Method catalogue

<!-- id: SPEC-service-method-catalogue -->
<!-- use-case: UC-046 -->
<!-- status: active -->

The list of ways to practise, as data. Loading it, validating it, and answering
the one question the daily menu asks first: **what can be done right now.**
Framework-free.

Background: [`../../study/21-method-catalogue-and-context.md`](../../study/21-method-catalogue-and-context.md),
[`../../study/12-method-cards.md`](../../study/12-method-cards.md),
[`../../study/24-speaking-as-the-goal.md`](../../study/24-speaking-as-the-goal.md) S4.

## Scope

- **In:** the entry schema for both entry types; validating the shipped files;
  the eight context dimensions and the named presets; filtering by context and
  by skill; looking an entry up.
- **Out:** menu composition — which three of the fitting methods are shown, and
  in what order (floor state, effect estimate, preference, exploration share).
  Readiness. Running an exercise. Anything persisted.

Menu composition is out because it needs the review log and the two ledgers; it
gets its own spec. This one supplies its input.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | The shipped section files | A catalogue, or every validation error at once |
| 2 | A method with no context requirements | Refused — it would match everywhere |
| 3 | A commitment carrying a duration, intensity, floor or context | Refused |
| 4 | An entry with an empty `doesNotDo` | Refused |
| 5 | Two entries with one id | Refused, naming the id |
| 6 | A catalogue and a context | The methods performable in it, unordered |
| 7 | A context whose budget is shorter than a method's shortest variant | That method is absent |
| 8 | A method with no fixed length, and a bounded budget | Absent; present only in an open block |
| 9 | Any context | Never a commitment |
| 10 | A catalogue | Its commitments, separately |

## Two entry types, and why the schema refuses to blur them

A **method** is a session: it has duration variants, an intensity, context
requirements and a completion. A **commitment** is a standing rule — *write to
one friend only in Italian* — which has none of those and runs in the background
of a life ([24](../../study/24-speaking-as-the-goal.md) S4).

The validator enforces the difference rather than trusting authors to respect
it, because both failure modes are silent and expensive:

- A commitment with a duration becomes a session, gets offered in the menu, and
  acquires the completion tracking that [10](../../study/10-antipatterns.md) A1
  forbids. A commitment that gets ticked daily is a method with extra steps.
- A method without context requirements matches every preset. The menu still
  works, still looks right, and the filter the whole product's ordering rests on
  has stopped separating anything.

## Context is a hard filter and the only hard filter

A method you cannot perform right now has an effect of zero, so it is **absent**,
not greyed out ([21](../../study/21-method-catalogue-and-context.md)).

Readiness — whether the app can build material at a sensible band — looks like
the same quantity and is not. It **demotes and annotates, never removes**
([26](../../study/26-readiness-and-difficulty.md)). This module therefore has no
readiness input at all. Passing one in later, as a second filter, is how "cannot
comply" quietly becomes "may not", which is the failure chapter 26 exists to
prevent.

Time is not a requirement field. A method declares its duration variants and the
fit is computed; `durations: null` means open-ended and fits only an open block.
Stating a budget list per entry would have been the same information written
fifty-three times, and wrong in a different way each time it drifted.

## Data

| Field | Shape | Both types |
| --- | --- | --- |
| `id` | lowercase kebab-case, unique across the catalogue | ● |
| `name`, `trains` | non-empty strings — `trains` is prose, never parsed | ● |
| `section` | one of eight; taken from the file, not repeated per entry | ● |
| `skills` | subset of `reading listening speaking writing`, may be empty | ● |
| `targetSignal` | one of the seven layer-1 signals, or `null` | ● |
| `evidence` | `A B C D` | ● |
| `demanding` | "avoided by engagement-optimised apps", not "hard for you" | ● |
| `hosted` | whether the app runs it | ● |
| `doesNotDo` | the honest half of the info page. **Required** | ● |
| `intensity` | `1 2 3` | method |
| `durations` | ascending minutes, or `null` for open-ended | method |
| `requires` | dimension → permitted values. **Non-empty** | method |
| `offerEveryDays` | the floor, in days, or `null` | method |
| `reviewAfterDays` | when the one quiet "still doing this?" fires | commitment |

Context dimensions: `eyes hands voice writingSurface sound attention company`,
plus `time` on a context but never on an entry. Seven presets ship; a preset is
a full context under a name, because asking four questions before someone may
learn rebuilds the barrier to entry from
[01](../../study/01-duolingo.md) S1.

`offerEveryDays` bounds what the app **offers**, never what the learner owes
([12](../../study/12-method-cards.md), corrected 2026-08-08). Five entries carry
one; the other forty-eight do not, and a floor is never invented to fill the
column.

## What the shipped data is, and what was authored

Transcribed from [21](../../study/21-method-catalogue-and-context.md): the
entries themselves, their section, `trains`, `evidence`, `demanding`, and the
context requirements. From [12](../../study/12-method-cards.md): the five floors.
From [24](../../study/24-speaking-as-the-goal.md): the commitments.

**Authored, and therefore reviewable in one place:** `intensity`, `durations`,
`doesNotDo`, `targetSignal`, `hosted`, and `reviewAfterDays`. None of these is
derivable from the study; all of them are needed before a card can be rendered.
They live in the data files rather than inside the menu code precisely so that
disagreeing with one is an edit, not a pull request against a component.

Three reconciliations were made, listed here rather than performed quietly:

1. **Free production** is named in [12](../../study/12-method-cards.md)'s floor
   table and absent from [21](../../study/21-method-catalogue-and-context.md)'s
   tables. It is added to *Writing*, since [06](../../study/06-production.md)
   treats it as a method and the floor presupposes one.
2. **The dictation floor** (1× / 10 days) attaches to full dictation on paper,
   which is what [07](../../study/07-offline-and-paper.md) describes. Partial
   dictation carries none.
3. **Switch your phone's language**, **label the flat** and **pursue a hobby**
   appear as methods in [21](../../study/21-method-catalogue-and-context.md) and
   meet [24](../../study/24-speaking-as-the-goal.md)'s definition of a
   commitment. They are commitments, and appear once.

## Acceptance criteria

In [`method-catalogue.acceptance-criteria.md`](method-catalogue.acceptance-criteria.md).

## Check

`npm test -- method-catalogue`

## Open

- **⚠ SPEC GAP: twenty-one methods have no layer-1 signal**, as does every
  commitment. Shadowing trains
  prosody, minimal pairs train perception, reading aloud trains intelligibility
  — and [03](../../study/03-level-model.md)'s seven signals cover none of them.
  They currently carry `targetSignal: null`, which contradicts
  [12](../../study/12-method-cards.md) ("a method without a named target signal
  cannot be admitted"). Either the signal list is short by two or three, or that
  rule applies only to hosted methods. Both are decisions; neither is made.
- **⚠ SPEC GAP: what happens when no entry fits the current context** — carried
  over from [21](../../study/21-method-catalogue-and-context.md). The loader
  returns an empty list and says nothing about it. Every shipped preset yields
  something today, which is why this is not yet urgent and is also why it will
  be discovered late.
- **⚠ SPEC GAP: whether a preset may be edited or created by the learner.**
  [21](../../study/21-method-catalogue-and-context.md) says presets are
  editable; nothing here writes, so they are constants.
- `intensity` is authored on a 1–3 scale with no definition behind it. Before it
  reaches a card it needs one, or it is three shades of nothing.
