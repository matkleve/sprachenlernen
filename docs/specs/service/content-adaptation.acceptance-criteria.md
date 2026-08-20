# Content adaptation — acceptance criteria

<!-- parent: SPEC-service-content-adaptation -->

- [ ] Given a catalogue source and target level A2, when adaptation runs twice,
      then the second call reads from cache — no second LLM request.
- [ ] Given adapted output, when coverage is computed, then result is ≥ 95 %
      for the active learner's held set OR the job fails honestly.
- [ ] Given any adapted source detail, when rendered, then adaptation label is
      visible and `sourceUrl` links to original when lane B.
- [ ] Given learner upload without processing consent, when opened, then only
      original text is shown.
