# Broken-card detection — acceptance criteria

<!-- parent: SPEC-service-broken-card-detection -->

- [ ] Given `pero` and `perro` in the same pool, when candidates are built,
      then each lists the other and distance is 1.
- [ ] Given lemmas shorter than 3 or longer than 8, when candidates are built,
      then they never appear as the source or target of a neighbour candidate.
- [ ] Given distance 2 only (e.g. `casa`/`cosa`), when candidates are built,
      then no pair is recorded.
- [ ] Given the shipped Spanish sidecar, when the check script runs, then it
      passes and `tightened` matches the ratio rule.
- [ ] Given a regenerated sidecar that differs from the committed file, when
      the check script runs, then it fails with a stale-data message.
- [ ] Given a flagged (`word_id`, `spoken_language`) pair, when the next session
      is built, then that word's tasks are not in the queue.
- [ ] Given a report during an in-progress session, when the learner continues,
      then the card remains in the current queue.
