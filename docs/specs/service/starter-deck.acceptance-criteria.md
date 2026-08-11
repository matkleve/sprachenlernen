# Starter deck — acceptance criteria

<!-- parent: SPEC-service-starter-deck -->

- [ ] Given the shipped `es-meaning-recall.json`, when
      `loadSpanishMeaningRecallDeck` runs, then it returns **500** cards with
      unique `taskId`s, ascending `frequencyRank`, and language `es`.
- [ ] Given the first card, then `frequencyRank` is 1 and `taskId` is
      `es:el:meaning-recall` (most frequent lemma in the aggregated list).
- [ ] Given any card, then `front`, `back`, and `lemma` are non-empty strings
      and `back` is not equal to `lemma`.
- [ ] Given an object missing `cards`, when `validateStarterDeck` runs, then
      it returns errors and no deck.
- [ ] Given the build script and its gloss sources, when
      `node scripts/build-starter-deck.mjs` runs, then it regenerates the JSON
      and every one of the 500 cards has a gloss.
