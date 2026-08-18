# Gloss resolver — acceptance criteria

<!-- parent: SPEC-service-gloss-resolver -->

- [ ] Given `spoken_language` `de` and a published German row for
      `card.it:fare.meaning-recall.back`, when meaning-recall back renders,
      then the learner sees the German gloss — not English `to do`.
- [ ] Given `spoken_language` `de` and no German row, when the back renders,
      then the learner sees the English source gloss — not `card.it:fare…` as
      visible text.
- [ ] Given the same `taskId` before and after a spoken-language switch, when
      only `spoken_language` changes, then scheduler state and `taskId` are
      identical.
- [ ] Given a content-gap list for a German speaker, when glosses render, then
      they match the same resolver output as on the review card for that lemma.
- [ ] Given batch resolve for a 15-card session, when measured in tests, then
      snapshot maps are loaded once per locale per call — not once per card.
