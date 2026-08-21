# Learner world — acceptance criteria

<!-- id: SPEC-service-learner-world-ac -->
<!-- parent: SPEC-service-learner-world -->
<!-- status: draft -->

- [ ] Given a new Account adds Spanish, when `getWorld('es')` runs before any
      set, then `worldId` is `general`.
- [ ] Given `setWorld('es', 'politics')`, when persisted and read back, then
      `worldId` is `politics` and `setAt` is set.
- [ ] Given active world `politics` and two due candidates — one tagged
      `politics`, one untagged — when `worldMatch` is computed, then the
      politics-tagged candidate has factor `γ` and the other has `1`.
- [ ] Given active world `general`, when `worldMatch` runs for any candidate,
      then the factor is always `1`.
- [ ] Given a lemma tagged `business` and `politics`, when active world is
      `politics`, then `worldMatch` uses `γ`.
- [ ] Given world switch from `politics` to `nature`, when review log is read,
      then all prior grades and `due` values are unchanged.
- [ ] **Negative:** `applyReview` and stored `due` are never modified by
      `setWorld` or `worldMatch` alone.
