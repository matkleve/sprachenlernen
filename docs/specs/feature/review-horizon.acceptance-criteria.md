# Review horizon — acceptance criteria (supplement)

Split from [`review-horizon.md`](review-horizon.md) for size. Normative rules
live in the parent; this file is the exhaustive AC list only.

## Collapsed summary

- [ ] Given collapsed state, when rendered, then a single summary line describes
      the next four weeks in words (light / normal / peak) without showing tile
      stacks.
- [ ] Given collapsed state, when the learner activates expand, then the chart
      opens without navigation.

## Tiles and caps

- [ ] Given a week with more reviews than the tile cap, when rendered, then the
      stack shows the cap plus a “+N” overflow label and the true total in text.
- [ ] Given zero reviews in a week, when rendered, then the column shows a
      neutral empty baseline — not a reward state.

## Drill-down

- [ ] Given expanded state, when the learner taps week 2, then days 7–13 appear
      as labelled day stacks inline; tapping again collapses the week.

## Copy

- [ ] Given any state, when copy is shown, then it describes **scheduled**
      reviews, never obligation (“you must”) or streak language.

## Negative (UC-063 / A3)

- [ ] Given `/words`, when the horizon is collapsed or expanded, then no figure
      labelled due, overdue, or backlog appears anywhere on the page.
