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
| 11 | A method carrying `reviewAfterDays` | Refused — a method is completed, not reviewed |
| 12 | Two files declaring one section, or two presets sharing an id | Refused |
| 13 | A method with alternative requirement sets | Fits if **any** set fits |

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

One set of requirements is **and** across dimensions, **or** within one. That
cannot express "touch **or** voice", which is what
[21](../../study/21-method-catalogue-and-context.md) gives the SRS session, so a
method may instead list alternative sets and fits if any of them does. Without
it the one method with a daily floor was unofferable in four of the seven
presets — a floor the learner has no way to act on is worse than no floor.

## Data

| Field | Shape | Both types |
| --- | --- | --- |
| `id` | lowercase kebab-case, unique across the catalogue | ● |
| `name`, `summary`, `trains` | non-empty strings. `summary` is the card's subtitle — what you do, one line. `trains` is prose, never parsed | ● |
| `section` | one of eight; taken from the file, not repeated per entry | ● |
| `skills` | subset of `reading listening speaking writing`, may be empty | ● |
| `targetSignal` | one of the seven layer-1 signals, or `null` | ● |
| `evidence` | `A B C D` | ● |
| `demanding` | "avoided by engagement-optimised apps", not "hard for you" | ● |
| `hosted` | whether the app runs it | ● |
| `doesNotDo` | the honest half of the info page. **Required** | ● |
| `intensity` | `1 2 3`, anchored below | method |
| `durations` | ascending minutes, or `null` for open-ended | method |
| `requires` | dimension → permitted values, or a list of alternative sets of those. **Non-empty** | method |
| `offerEveryDays` | the floor, in days, or `null` | method |
| `reviewAfterDays` | when the one quiet "still doing this?" fires | commitment |

Context dimensions: `eyes hands voice writingSurface sound attention company`,
plus `time` on a context but never on an entry. Seven presets ship; a preset is
a full context under a name, because asking four questions before someone may
learn rebuilds the barrier to entry from
[01](../../study/01-duolingo.md) S1. The context model lives in
`lib/learning-context.ts` — a context describes a person and a moment, an entry
describes a way of practising, and keeping them in one module is how the
"cannot perform" quantity and the "may not perform" one start to look alike.

**Intensity is cognitive load, not duration** ([12](../../study/12-method-cards.md)),
and it is anchored so that the same number means the same thing across
fifty-three entries: **1** can be done tired or distracted, **2** needs
attention but not effort, **3** will leave you tired. Duration is a separate
field and they come apart often — a two-minute card review is a 2, and a
forty-five-minute audiobook is a 1.

`offerEveryDays` bounds what the app **offers**, never what the learner owes
([12](../../study/12-method-cards.md), corrected 2026-08-08). Five entries carry
one; the other forty-eight do not, and a floor is never invented to fill the
column.

## Provenance

Which fields were transcribed from the study, which were authored, and the six
reconciliations between chapters — in
[`method-catalogue.provenance.md`](method-catalogue.provenance.md).

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
- ~~**⚠ SPEC GAP: `SKILLS` has no `vocabulary` value**~~ **Decided 2026-08-17:**
  `vocabulary` is a fifth skill value. Vocabulary-section methods carry it;
  `bySkill` includes the app's core loop. Methods without a built engine set
  `hosted: false` rather than advertising a dead Start button.
- **⚠ SPEC GAP: chapter 21 contradicts itself about the kitchen.** Cooking from
  a recipe is given the context "kitchen", and the kitchen preset is defined as
  eyes and hands gone. Reading a recipe needs eyes, so the one entry the chapter
  places in the kitchen is the one entry the kitchen cannot offer. Pinned by a
  test rather than resolved, because either direction is a rule nobody decided.
- **⚠ SPEC GAP: what happens when no entry fits the current context** — carried
  over from [21](../../study/21-method-catalogue-and-context.md). The loader
  returns an empty list and says nothing about it. Every shipped preset yields
  something today, which is why this is not yet urgent and is also why it will
  be discovered late.
- **No preset can reach *translate a song***, because it needs a keyboard and an
  open block and the seven presets have no such combination — "At the computer"
  is fifteen minutes, "At the desk" is paper. Pinned by a test so the list
  cannot grow unnoticed. An eighth preset would fix it and is not this spec's
  decision to take.
- **The off-app share is 34%, where [12](../../study/12-method-cards.md) thesis
  9 says about half.** Either the catalogue is short of off-app entries or the
  thesis overstates. Recorded because the acceptance criterion that watches this
  ratio is otherwise a threshold with no meaning behind it.
- **⚠ SPEC GAP: whether a preset may be edited or created by the learner.**
  [21](../../study/21-method-catalogue-and-context.md) says presets are
  editable; nothing here writes, so they are constants.
- `demanding` is a boolean and
  [21](../../study/21-method-catalogue-and-context.md) marks two entries **very
  hard**. The distinction is lost; the card spec will need it back.
