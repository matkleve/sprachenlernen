# Card example sentence — acceptance criteria

Split child of [`card-example-sentence.md`](card-example-sentence.md).

- [x] Given active world `politics` and two comfortable sentences for a lemma —
      one `world: politics`, one untagged — when the card renders, then the
      politics-tagged sentence is **more likely** but an untagged sentence may
      still appear.
- [x] Given Spanish with held lemmas covering 95% of a bank sentence containing
      the lemma, when the meaning-recall card renders, then that sentence (or one
      in the same comfort band) appears on the front.
- [x] Given no sentence for a lemma reaches the comfort band, when the card
      renders, then the UI matches today's lemma-only card — no broken layout.
- [x] Given `spoken_language` `de`, when the sentence translation is resolved,
      then it is German — not English from the bank file.
- [x] Given the learner flips, when the back renders, then the sentence remains
      visible and the gloss is in the spoken language.
- [x] Given two sessions the same day, when the same `taskId` appears, then the
      same sentence is chosen (stable salt).
