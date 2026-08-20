# Method session budget — acceptance criteria

<!-- parent: SPEC-service-method-session-budget -->

- [ ] Given menu `?minutes=15`, when a learner opens a method detail page, then
      the menu minutes are **not** present on the Start URL unless the learner
      selected a 15 min variant chip.
- [ ] Given menu filter 15 min and `durations: [8, 15]`, when detail renders,
      then both variant chips appear and **15** is the default selection.
- [ ] Given menu filter 5 min and `durations: [8, 15]`, when the catalogue
      filters, then that method is **absent**.
- [ ] Given `durations.length === 1`, when detail renders, then no variant
      chips appear and Start uses that sole package.
- [ ] Given a method with three values in `durations`, when the catalogue
      validator runs, then it **refuses** the entry.
- [ ] Given `partial-dictation` package `8`, when the recipe composes, then
      wall estimate is within 85–115 % of 8 minutes — independent of menu filter.
- [ ] Given `free-production` package `10`, when the recipe composes, then
      `timed-write.durationSec` matches the fixed 10 min package definition.
- [ ] Given `srs-session` package `10`, when the session builds, then card count
      is the fixed count for that package — not derived from menu filter.
- [ ] Given any hosted package after T-MV5, when `estimateWallClock` runs, then
      result is within tolerance of that package's `variantMinutes`.
