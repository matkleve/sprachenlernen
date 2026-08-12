# UC-070 — Understand cards in my own language

<!-- id: UC-070 -->
<!-- specs:  -->

**Who:** a learner practising a target language whose **first language** (L1) is
not English — e.g. a German speaker doing Spanish meaning-recall and form-recall.
**Wants to:** see definitions, instructions and produce-prompts on cards in a
language they read fluently.
**So that:** a review session tests Spanish, not whether they can parse English
glosses and grammar labels.

Derived from [`../../data/README.md`](../../data/README.md) (starter pools ship English
glosses today), UC-041 (form prompts must name the paradigm cell eventually), and
[`../study/18-language-kit.md`](../study/18-language-kit.md) (German →
Spanish/Italian is a first-class pair).

## Today

Card text is **baked into shipped JSON** at build time and assumes **English L1**:

| Card type | What the learner sees | Where it lives |
| --- | --- | --- |
| Meaning-recall | Target lemma on front; **English** gloss on back | `data/starter/<lang>-meaning-recall.json` |
| Form-recall | **English** gloss + "write the Spanish/Italian form" on front; target surface form on back | `data/starter/<lang>-form-recall.json` |

Glosses come from Kaikki's English sense lines plus hand-checked overrides in
`*.overrides.json` (`data/README.md` calls these "hand-checked **English**
glosses"). The build script writes the full `front` string into the JSON — it is
not assembled from translatable parts at runtime.

**Changing the interface language (UC-069) would not fix this.** Menus could be
German while cards still say `to run — write the Spanish form`. Two separate
pipelines; conflating them is how hardcoded English ends up everywhere.

Reviews in the database store only `task_id` and grade — not the prompt text.
The card face is always read from the bundled pool file for that `task_id`. So
localizing cards is a **pool/content** problem, not a `review_log` migration.

## Success looks like

- The learner's **L1** (or chosen gloss language) is known to the app — stored
  explicitly, not silently assumed to match the interface language.
- Meaning-recall card backs show a gloss in that language.
- Form-recall card fronts show the gloss **and** the produce instruction in that
  language (e.g. German: *laufen — schreib die spanische Form*), including
  human-readable paradigm hints when the cell is part of the prompt (UC-041).
- Prompt assembly happens in **one place** — not by hand-editing thousands of
  `front` strings when a second L1 ships. Either:
  - separate pool files per L1×target pair (`de-es-meaning-recall.json`), or
  - lemma-keyed gloss tables resolved at load time from stable ids (`wordId` +
    gloss language), with only the target-language surface form in the shipped
    deck.
- `task_id` stays stable across gloss languages so review history does not
  orphan when L1 changes — the identity is the target-language item, not the
  English wording of the prompt.

## Out of scope

- Translating the **target-language** lemma or surface form on the card.
- Runtime machine translation of glosses on every card load (network,
  inconsistency, and no review workflow — see `I18N.md` stage 2+ for how
  quality is gated when machines write copy).
- Multiple L1s active at once for the same account (one gloss language is enough
  to start).

## Undecided

- **⚠ SPEC GAP: L1 source of truth** — account field, derived from interface
  locale, or asked once at onboarding?
- **⚠ SPEC GAP: storage shape** — duplicate starter decks per L1 vs one deck +
  parallel `gloss/<l1>/<target>.json` keyed by `wordId`?
- **⚠ SPEC GAP: form-recall prompt parts** — split `backGloss`, `paradigmHint`,
  and `produceInstruction` so each can be translated, vs one opaque `front`
  string per locale?
- **⚠ SPEC GAP: build pipeline** — Kaikki ships English senses; German glosses
  need a second lexical source, MT with review, or human overrides at scale.
  Provenance must be recorded per `data/README.md`.
- **⚠ SPEC GAP: relationship to UC-069** — may interface locale default gloss
  locale, but must be overridable (English interface + German glosses is a valid
  combination for expats).
