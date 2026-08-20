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
- [ ] Given `?skill=reading,listening`, then Methods whose `skills` includes
      **either** reading or listening appear.
- [ ] Given `?energy=low`, then only Methods with intensity 1 appear.
- [ ] Given `?energy=low,high`, then Methods with intensity 1 **or** intensity 3
      appear (OR of each energy bucket’s max intensity).
- [ ] Given skill or energy filter pills, when they render, then each option shows
      a Lucide icon before the label (decorative; label is the accessible name).
- [ ] Given two skill pills active, when one is tapped again, then it deselects
      and the other stays active — no full page reload.
- [ ] Given `?hands=none` in refine, then only Methods performable hands-free
      appear.
- [ ] Given a hosted Method card for `srs-session`, then it links to
      `/words/review?method=srs-session`.
- [ ] Given a hosted Method card for a **built exercise-runner** id, then it
      links to `/methods/{id}` (overview) — not `/practice`.
- [ ] Given a hosted Method card for any other id, then it links to
      `/methods/{id}` (detail), not `/words/review`.
- [ ] Given an off-app Method card, then it links to `/methods/{id}`.
- [ ] Given any rendered Method card, then a section header graphic appears above
      the title; the card has uniform border radius with no left accent stripe.
- [ ] Given any rendered Method card, then the badge row (skill marks, plain
      evidence label, plain effort label) appears above logistics chips; `doesNotDo`
      prose appears below.
- [ ] Given any rendered Method card, then logistics chips include duration (one)
      and every requirement value from the catalogue — **no** hosted/off-app chip.
- [ ] Given a built exercise-runner Method card, then it links to
      `/methods/{id}` (overview), not `/practice`.
- [ ] Given evidence C on a method card, when it renders, then the badge shows
      "Thin evidence" — not "Evidence C" or a bare letter.
- [ ] Given intensity 1 on a method card, when it renders, then the effort badge
      shows "Light effort" — not a dot scale.
- [ ] Given any rendered Method card, then evidence and intensity are not
      rendered as multi-line accent chips.
- [ ] Given filters that match nothing, then the gap is named and no list renders.
- [ ] Given the route `app/(app)/methods/page.tsx`, then it has no `"use client"`;
      `MethodMenu` is a client island that filters in memory. Filter pills are
      buttons, not links.
- [ ] Given no review history, when `/methods` renders, then standing says
      nothing is recorded yet and links to the review session.
- [ ] Given review history, when standing renders, then it names the pool-local
      held count and links to `/progress`, with no CEFR label.
- [ ] Given a review-log read error, when `/methods` renders, then the
      catalogue still appears and standing is omitted.
- [ ] Given at least three methods in the filtered catalogue, when `/methods`
      renders, then a daily-three section shows exactly three method cards above
      the filters, including one low-intensity option.
- [ ] Given any day, when filters change, then the daily three recompose from
      the filtered pool without a full page reload.
- [ ] The rendered surface has no axe-core violations.
