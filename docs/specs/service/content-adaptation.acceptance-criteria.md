# Content adaptation — acceptance criteria

<!-- parent: SPEC-service-content-adaptation -->

- [ ] Given a catalogue source and target level A2, when adaptation runs twice,
      then the second call reads from cache — no second LLM request.
- [x] Given band-level T2 output, when personal coverage is computed for the
      active learner's held set on the **shown** body, then Start follows the
      delivery gate (≥ 95 % enable; 80–94 % T1 path; &lt; 80 % block with honest
      copy).
- [ ] Given adapted output after personal rewrite (T3), when coverage is computed,
      then result is ≥ 95 % for that learner's held set OR the job fails honestly.
- [x] Given any adapted source detail, when rendered, then adaptation label is
      visible, personal coverage % is shown, and `sourceUrl` links to original
      when lane B.
- [x] Given learner upload without processing consent, when opened, then only
      original text is shown.
