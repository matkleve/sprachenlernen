# Form-recall pool

<!-- id: SPEC-service-form-recall-pool -->
<!-- use-case: UC-041 -->
<!-- status: active -->

Build-time pool of **form-recall** Tasks for the card engine — one inflected
surface form per meaning-recall lemma, tagged with its paradigm cell. Answers
UC-041's requirement that practice items carry where a form sits in the paradigm.

Parent: [`starter-deck.md`](starter-deck.md) (meaning-recall pool),
[`lexicon.md`](lexicon.md) (form→lemma + cell lookup),
[`method-engines.md`](method-engines.md).

## Scope

- **In:** `data/starter/es-form-recall.json` and `data/starter/it-form-recall.json`,
  `scripts/build-form-recall-pool.mjs`, `lib/form-recall-pool.ts` (load + validate);
  staging rule — a form-recall Task enters the session queue only when the sibling
  **meaning-recall** Task for the same `wordId` is **held** (stability above
  graduation — [`vocabulary-snapshot.md`](vocabulary-snapshot.md)).
- **Out:** form-mastery signal on Progress — see
  [`form-mastery-signal.md`](form-mastery-signal.md); audio recall;
  choosing the cell at review time; paradigm-table method (`paradigm-tables-mixed`);
  UI copy for every cell name (v1 uses a single prompt line).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Shipped `es-form-recall.json` | Validates; returns cards with `taskType` `form-recall` |
| 2 | Build script run | One card per meaning-recall lemma where a distinct inflected form exists in the lemma table with a documented cell |
| 3 | Lemma with no inflected form (only `el`, etc.) | Omitted from the form-recall pool — not an error |
| 4 | Session build, meaning-recall not held | Form-recall Tasks for that `wordId` are excluded from the schedulable pool |
| 5 | Session build, meaning-recall held | Form-recall Tasks compete with meaning-recall under the same FSRS rules |

## Data

Extends the starter card shape:

| Field | Type | Notes |
| --- | --- | --- |
| `taskId` | `string` | `es:{lemma}:{surfaceForm}:form-recall` |
| `wordId` | `string` | `es:{lemma}` — same Word as meaning-recall ([ADR-0004](../../adr/0004-word-task-data-model.md)) |
| `lemma` | `string` | Dictionary lemma |
| `surfaceForm` | `string` | The form the learner must produce |
| `paradigmCell` | `string` | Canonical cell from [`lemma-table.ts`](../../../lib/lemma-table.ts) |
| `front` | `string` | English gloss + produce prompt |
| `back` | `string` | `surfaceForm` |
| `frequencyRank` | `number` | Copied from the meaning-recall card (lemma rank) |

**Form selection (build script):** for each lemma in `es-meaning-recall.json`,
scan `data/lemma/es.json` for surface forms whose primary analysis matches the
lemma, have a non-null `paradigmCell`, and differ from the lemma. Prefer
`ind.pres.*` cells, then other finite indicative, then other moods, then
non-finite forms; within a tier pick the highest frequency in `data/frequency/es.txt`.
Gloss comes from the meaning-recall card's `back`.

## Acceptance criteria

- [ ] Given the shipped Spanish form-recall pool, when loaded, then every card
      has `taskType` `form-recall`, a documented `paradigmCell`, and a `taskId`
      ending in `:form-recall`.
- [ ] Given `es:hablar:hablo:form-recall`, when the lemma table is consulted,
      then `hablo` resolves to lemma `hablar` with cell `ind.pres.1sg`.
- [ ] Given a learner whose `es:hablar:meaning-recall` is not held, when a
      session is built, then no `es:hablar:*:form-recall` Task is in the queue.
- [ ] Given the same learner after meaning-recall becomes held, when a session
      is built, then the form-recall Task may appear.
- [ ] **Negative:** form-recall Tasks never appear before the meaning-recall
      Task for the same `wordId` has at least one Review.

## Check

`npm test -- form-recall-pool`
