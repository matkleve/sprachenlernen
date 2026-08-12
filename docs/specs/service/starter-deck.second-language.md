# Starter deck — a second language

<!-- parent: SPEC-service-starter-deck -->

Italian ships at the same tier as Spanish (stage 2: **2000** meaning-recall
lemmas + form-recall pool). Investigated 2026-08-11; built 2026-08-12.

## What shipped

| Artefact | Path |
| --- | --- |
| Meaning-recall pool | `data/starter/it-meaning-recall.json` (2000 cards) |
| Form-recall pool | `data/starter/it-form-recall.json` (1542 cards) |
| Companions | `.overrides.json`, `.exclusions.json`, `.cognates.json` |
| Regenerator | `node scripts/build-starter-deck.mjs it` |
| Form-recall build | `node scripts/build-form-recall-pool.mjs it` |
| Loader | `loadItalianMeaningRecallDeck()` in `lib/starter-deck.ts` |

Gloss source: **kaikki.org** Italian dictionary (CC BY-SA 3.0), cached at
`.cache/gloss/kaikki-it.jsonl`. Provenance recorded in `data/README.md`.

## Blockers resolved since 2026-08-11

**1. Gloss source.** kaikki.org Italian dictionary is reachable; glosses are
fetched at build time and cached locally.

**2. Accent folding.** Lemma-level summing via `data/lemma/it.json` already merges
accent variants (`perche`/`perché`/`perchè` → `perché`). The ranked list is
correct at the top (`il, essere, e, avere, non, che …`). No manual per-group
frequency merge was needed — the lemma table handles it.

**3. Multi-learning language.** Shipped via `learner_language`, the language
picker, switcher, and per-language `heldCount`.

## Build pipeline

Same as Spanish stage 2:

```bash
node scripts/expand-pool-companions.mjs it   # companion expansion
node scripts/build-starter-deck.mjs it       # meaning-recall pool
node scripts/build-form-recall-pool.mjs it   # form-recall pool
```

Companion expansion excludes English proper names and inflected forms from the
subtitle corpus, lists cognates, and machine-shortens overrides where possible.
Hand-checked overrides cover high-frequency function words (`essere`, `e`, `di`,
`a`, `o`) and clitics (`dimmi`, `dimmelo`, …).
