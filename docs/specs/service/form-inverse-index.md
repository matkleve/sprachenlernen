# Form inverse index

<!-- id: SPEC-service-form-inverse-index -->
<!-- use-case: UC-041 -->
<!-- status: active -->

`(lemma, paradigmCell) → accepted surface forms` for form practice and grading.
Parent: [`lexicon.md`](lexicon.md) (`form → analyses`),
[`form-practice.md`](form-practice.md).

## Scope

- **In:** `buildFormInverseIndex` in `lib/form-inverse-index.ts`; quarantine rules
  for table noise; primary ordering by shipped frequency; variety labels on
  alternates.
- **Out:** runtime morphological analysis; generating forms from patterns; choosing
  which cell a card practises at review time (legacy surface-form pool remains
  for mixed/meaning decks; `deck=form` uses cell ids from `lib/form-cell-catalog.ts`).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Loaded `LemmaTable` | Map keyed `lemma\|cell` → `{ lemma, cell, forms[] }` |
| 2 | Form maps to `(lemma, cell)` in the table | Surface listed under that key |
| 3 | Several surfaces for one key | Exactly one `primary: true` — highest frequency in the shipped list; others `primary: false` |
| 4 | Alternate surface | `variety` label when detectable (`voseo` for `hablás`-style 2sg); else `alternate` |
| 5 | Quarantined surface | Omitted from `forms` — never offered as correct |
| 6 | Lookup `acceptedForms(lemma, cell)` | Returns primary first, then alternates by frequency |

**Quarantine** (table noise the grader must not accept):

1. Surface length `< 2` for a finite verb cell.
2. Unaccented duplicate — when `stripDiacritics(surface)` equals another accepted
   surface's bare form and the accented sibling is also in the candidate set
   (e.g. `estan` when `están` exists).

## Acceptance criteria

- [ ] Given `es` lemma table, when `buildFormInverseIndex` runs, then
      `hablar|ind.pres.2sg` lists `hablas` and `hablás` and not `habla`.
- [ ] Given `estar|ind.pres.3pl`, when indexed, then `están` is primary and
      `estan` is quarantined.
- [ ] Given `haber|ind.pres.3sg`, when indexed, then `a` is quarantined and
      `ha` / `hay` remain.
- [ ] Given a cell with multiple accepted forms, when `gradeFormAnswer` is called
      with any listed surface, then result is correct.
- [ ] **Negative:** quarantined surfaces never appear in `forms`.

## Check

`npm test -- form-inverse-index`
