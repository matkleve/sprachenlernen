# Method catalogue i18n — acceptance criteria

<!-- parent: SPEC-service-method-catalogue-i18n -->

- [ ] Given locale `de` and method `background-listening`, when a method card
      renders, then the title is German — not the English catalogue string
      "Background listening with no task".
- [ ] Given locale `de`, when the method detail page renders, then `name`,
      `summary`, `trains`, and `doesNotDo` are all German when translations
      exist — with no English residue on those four fields.
- [ ] Given locale `en`, when any method surface renders, then copy matches the
      shipped catalogue JSON (no regression).
- [ ] Given every shipped catalogue entry id, then `messages/en.json` and
      `messages/de.json` both contain `methodMenu.entries.<id>.{name,summary,trains,doesNotDo}`.
- [ ] Given a missing German field for one id, when that surface renders in
      `de`, then only that field falls back to English — not the whole card.
