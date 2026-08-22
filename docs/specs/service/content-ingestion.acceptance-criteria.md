# Content ingestion — acceptance criteria

<!-- parent: SPEC-service-content-ingestion -->

- [ ] Given a catalogue Source without `licence.kind`, when the validator runs,
      then the entry is refused.
- [ ] Given a learner paste with opt-in, when saved, then `origin` is `learner`
      and the row is account-scoped.
- [ ] Given a CC BY catalogue Source, when detail renders, then attribution text
      is visible.
- [ ] Given a paywalled fetch failure, when intake runs, then the UI offers
      manual paste — no silent empty source.
- [ ] Given a generated catalogue Source (`generated: true`), when material setup
      or source detail renders, then the generated honesty label is visible as text.
