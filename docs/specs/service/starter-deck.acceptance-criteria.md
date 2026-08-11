# Starter deck — acceptance criteria

<!-- parent: SPEC-service-starter-deck -->

- [ ] Given the shipped `es-meaning-recall.json`, when
      `loadSpanishMeaningRecallDeck` runs, then it returns **500** cards with
      unique `taskId`s, unique lemmas, consecutive `frequencyRank`s from 1, and
      language `es`.
- [ ] Given the first card, then `frequencyRank` is 1 and `taskId` is
      `es:el:meaning-recall` (most frequent lemma in the aggregated list).
- [ ] Given any card, then `front`, `back` and `lemma` are non-empty and `back`
      is at most **60** characters.
- [ ] Given any card, then `taskId` is `es:{lemma}:meaning-recall` and `wordId`
      is `es:{lemma}` — the ids stay derivable from the lemma.
- [ ] Given any card whose `back` equals its `lemma`, then that lemma appears in
      `es-meaning-recall.cognates.json` — and every lemma in that file appears
      in the deck. A gloss equal to the front is otherwise a failed lookup.
- [ ] Given an object missing `cards`, when `validateStarterDeck` runs, then
      it returns errors and no deck.
- [ ] Given the shipped deck, then no lemma listed in
      `es-meaning-recall.exclusions.json` appears in it, and no card's `back` is
      a grammar note (`third-person singular … of`, `apocopic form of`,
      `Senses relating to …`, `a surname`) — both checked in the gate, because
      the build script is not part of `npm run verify`.
- [ ] Given the build script and its gloss sources, when
      `node scripts/build-starter-deck.mjs` runs, then it regenerates the JSON
      and every one of the 500 cards has a gloss.
- [ ] Given a machine gloss that shapes to empty, to over 60 characters, to the
      lemma without a cognate entry, or to a grammar note, when the build runs,
      then it **fails** naming that lemma rather than shipping the card.
- [ ] Given `es-meaning-recall.exclusions.json` written as an array, or
      `es-meaning-recall.cognates.json` written as an object, when the build
      runs, then it **fails** — a companion file in the wrong shape must not
      silently filter nothing.
