# Learner world — acceptance criteria

<!-- id: SPEC-service-learner-world-ac -->
<!-- parent: SPEC-service-learner-world -->
<!-- status: draft -->

- [x] Given a new Account adds Spanish, when `getWorld('es')` runs before any
      set, then `worldId` is `general`.
- [x] Given `setWorld('es', 'politics')`, when persisted and read back, then
      `worldId` is `politics` and `setAt` is set.
- [x] Given active world `politics` and two due candidates — one tagged
      `politics`, one untagged — when `worldMatch` is computed, then the
      politics-tagged candidate has factor `γ` and the other has `1`.
- [x] Given active world `general`, when `worldMatch` runs for any candidate,
      then the factor is always `1`.
- [x] Given a lemma tagged `business` and `politics`, when active world is
      `politics`, then `worldMatch` uses `γ`.
- [x] Given world switch from `politics` to `nature`, when review log is read,
      then all prior grades and `due` values are unchanged.
- [x] **Negative:** `applyReview` and stored `due` are never modified by
      `setWorld` or `worldMatch` alone.
