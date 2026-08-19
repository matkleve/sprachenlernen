# Method session viability — acceptance criteria

<!-- parent: SPEC-service-method-session-viability -->

- [ ] Given a hosted runner recipe with one production `do` and `review: reveal-answer`
      without `exemplar` or `honestyKey`, when `assertSessionViable` runs, then it
      fails with gate G2.
- [ ] Given a runner recipe with one `type-with-word` and no loops, when
      `assertSessionViable` runs, then it fails with gate G3.
- [ ] Given `partial-dictation` composed with N≥3 sentences, when viability runs,
      then G3 passes and `learningUnits` equals N.
- [ ] Given `build-a-sentence` after T-MV2 ships, when composed, then viability
      passes and `learningUnits ≥ 3`.
- [ ] Given a hosted method with a viable recipe, when method detail renders, then
      the session contract (item count + feedback label) appears above Start.
- [ ] Given a recipe with only keyboard/touch requirements and
      `prepareRequired: false`, when composed, then there is no `prepare` step.
- [ ] Given `budgetMinutes: 15` and a viable hosted recipe, when
      `estimateWallClock` runs, then the result is between 85 % and 115 % of 15
      minutes.
- [ ] Given `build-a-sentence` at `budgetMinutes: 15` today, when viability runs,
      then gate G7 fails until T-MV2/T-MV5 ship.
