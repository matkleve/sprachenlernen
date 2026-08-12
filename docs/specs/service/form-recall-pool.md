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

- **In:** `data/starter/es-form-recall.json`, `scripts/build-form-recall-pool.mjs`,
  `lib/form-recall-pool.ts` (load + validate), `lib/paradigm-cells.ts` (cell code
  → words); staging rule — a form-recall Task enters the session queue only when
  the sibling **meaning-recall** Task for the same `wordId` is **held**
  (stability above graduation — [`vocabulary-snapshot.md`](vocabulary-snapshot.md)).
- **Out:** form-mastery signal on Progress — see
  [`form-mastery-signal.md`](form-mastery-signal.md); Italian; audio recall;
  choosing the cell at review time; paradigm-table method (`paradigm-tables-mixed`);
  accepting more than one correct form per cell — the inverse index that would
  need is blocked in [`form-practice.md`](form-practice.md).

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
| `front` | `string` | English gloss, **and nothing else** — no instruction, no cell name |
| `back` | `string` | `surfaceForm` |
| `frequencyRank` | `number` | Copied from the meaning-recall card (lemma rank) |

**Form selection (build script):** for each lemma in `es-meaning-recall.json`,
scan `data/lemma/es.json` for surface forms whose primary analysis matches the
lemma, have a non-null `paradigmCell`, and differ from the lemma. Prefer
`ind.pres.*` cells, then other finite indicative, then other moods, then
non-finite forms; within a tier pick the highest frequency in `data/frequency/es.txt`.
Gloss comes from the meaning-recall card's `back`.

**A gloss that names a gender rules out the other one.** The gloss *is* the
prompt, so a gender it states is a promise the answer has to keep: `el`, glossed
"the (masc.)", may not ask for `la`. Candidate forms whose cell carries the
opposing gender are skipped before ranking, which moved `es:el` to `los` rather
than dropping the Word.

## What the row stores and what the card says

A row carries the **meaning** and the **cell code**. It never carries the
sentence the learner reads — the cell's wording comes from
[`paradigm-cells.ts`](../../../lib/paradigm-cells.ts), the instruction from
`features/review-session/content.ts`, and their arrangement from `ReviewCard`.

Two reasons, and only the second is about taste:

1. **A card that says only "to be" has no answer.** *soy · eres · es · era ·
   fue* all satisfy it. The prompt is answerable exactly because the cell is on
   screen, so the cell has to reach the screen as data.
2. **Presentation changes; 1,704 rows should not.** Wording, placement, and the
   language named in the instruction are all layout decisions. Baking
   `"to be — write the Spanish form"` into the data made every one of them a
   pool rebuild, and would have shipped the word *Spanish* into an Italian pool.

`paradigmCellLabel` composes rather than tabulating (69 codes, all built from
mood, tense, person, gender, number) and returns `null` for a code it does not
understand — an unlabelled cell shows no line rather than `ind.pres.3sg` on
screen. The test that walks every cell in the shipped lemma table is what makes
`null` unreachable in practice.

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
- [ ] Given any shipped form-recall card, when it is rendered, then the learner
      sees the cell in words ("he/she · present") and the row's `front` contains
      no instruction and no cell name.
- [ ] Given a cell in `data/lemma/es.json`, when `paradigmCellLabel` is called,
      then it returns a label — for **every** cell in the table, not only the
      twelve the current pool happens to use.
- [ ] **Negative:** no shipped card's gloss states a gender its `paradigmCell`
      contradicts.
- [ ] **Negative:** no card row carries an instruction, so the one that names
      the language is composed at render time and a second language reuses the
      card layout without regenerating its pool. (*Spanish* as the gloss of
      `español` is a meaning, not an instruction, and stays.)

## Check

`npm test -- form-recall-pool`, `npm test -- paradigm-cells`
