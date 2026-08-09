# Method menu — acceptance criteria

<!-- parent: SPEC-page-method-menu -->

- [ ] Given no filter params, when the page renders, then every Method appears
      exactly once, grouped under its section.
- [ ] Given `?minutes=2`, then only Methods whose shortest duration is at most
      2 minutes appear.
- [ ] Given `?skill=reading`, then only Methods whose `skills` includes reading
      appear.
- [ ] Given `?energy=low`, then only Methods with intensity 1 appear.
- [ ] Given `?hands=none` in refine, then only Methods performable hands-free
      appear.
- [ ] Given a hosted Method card, then it links to the session route.
- [ ] Given an off-app Method card, then it links to `/methods/{id}`.
- [ ] Given any rendered Method card, then chips and `doesNotDo` prose appear.
- [ ] Given filters that match nothing, then the gap is named and no list renders.
- [ ] The menu root has no `"use client"`; only the time slider is a client island.
- [ ] The rendered surface has no axe-core violations.
