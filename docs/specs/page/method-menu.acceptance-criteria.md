# Method menu — acceptance criteria

<!-- parent: SPEC-page-method-menu -->

- [ ] Given no filter params, when the page renders, then every Method appears
      exactly once, grouped under its section.
- [ ] Given any filter change, when the learner taps a filter pill or releases
      the time slider, then the list updates **without a full page navigation**
      and the scroll position is preserved.
- [ ] Given the time slider, when the learner moves it, then the displayed
      budget snaps to the nearest step in
      [`../service/time-scale.md`](../service/time-scale.md) — not an arbitrary
      minute between steps.
- [ ] Given `?minutes=2`, then only Methods whose shortest duration is at most
      2 minutes appear.
- [ ] Given `?minutes=endless`, then every Method appears regardless of duration
      (no time filter).
- [ ] Given a legacy `?minutes=37`, then the budget snaps to the nearest scale
      step (40) for filtering and slider display.
- [ ] Given `?skill=reading`, then only Methods whose `skills` includes reading
      appear.
- [ ] Given `?energy=low`, then only Methods with intensity 1 appear.
- [ ] Given `?hands=none` in refine, then only Methods performable hands-free
      appear.
- [ ] Given a hosted Method card, then it links to the session route.
- [ ] Given an off-app Method card, then it links to `/methods/{id}`.
- [ ] Given any rendered Method card, then chips and `doesNotDo` prose appear.
- [ ] Given filters that match nothing, then the gap is named and no list renders.
- [ ] Given the route `app/(app)/methods/page.tsx`, then it has no `"use client"`;
      `MethodMenu` is a client island that filters in memory. Filter pills are
      buttons, not links.
- [ ] The rendered surface has no axe-core violations.
