# Content ingestion — acceptance criteria

<!-- parent: SPEC-service-content-ingestion -->

- [ ] Given a catalogue Source without `licence.kind`, when the validator runs,
      then the entry is refused.
- [ ] Given a learner paste with opt-in, when saved, then `origin` is `learner`
      and the row is account-scoped.
- [x] Given a CC BY catalogue Source, when detail renders, then attribution text
      is visible.
- [x] Given a partner-tos catalogue Source, when detail or material setup renders,
      then partner attribution and original link are visible as text.
- [ ] Given a paywalled fetch failure, when intake runs, then the UI offers
      manual paste — no silent empty source.
- [x] Given a generated catalogue Source (`generated: true`), when material setup
      or source detail renders, then the generated honesty label is visible as text.
