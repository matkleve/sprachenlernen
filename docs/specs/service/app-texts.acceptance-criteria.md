# App texts — acceptance criteria

<!-- parent: SPEC-service-app-texts -->

- [ ] Given `card.it:fare.meaning-recall.back` with English source and published
      German translation, when the snapshot is built, then `de.json` contains
      the German string and not the English source.
- [ ] Given only a `draft` German row, when the snapshot is built, then `de.json`
      omits that key (published-only export).
- [ ] Given published German missing for a key, when
      [`gloss-resolver.md`](gloss-resolver.md) resolves with `spoken_language`
      `de`, then the English `source_text` is returned — not a raw key, not
      empty silence.
- [ ] Given an Account switches `spoken_language` from `en` to `de`, when the
      same `taskId` renders, then only the description text changes — `taskId`,
      due date, and review history are unchanged.
- [x] Given seed import from starter pools, when `it:fare` is imported, then
      `text_key` is `card.it:fare.meaning-recall.back` and `source_text` matches
      today's shipped `back` field.
- [ ] Given Account A, when A reads `app_text_translations` with `status`
      `draft`, then zero draft rows are returned (RLS or resolver filter).
