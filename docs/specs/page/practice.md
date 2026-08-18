# Practice route

<!-- id: SPEC-page-practice -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-046 -->
<!-- status: draft -->

Thin route at `/practice`. Hosts the **exercise runner**
([`../feature/exercise-runner.md`](../feature/exercise-runner.md)) for Methods
that are not the card engine.

## Scope

- **In:** route, query params, layout mode, error surfaces (unknown method, recipe
  missing, not built).
- **Out:** recipe authoring; material setup (lives on method detail).

## Query params

| Param | Required | Meaning |
| --- | --- | --- |
| `method` | yes | Catalogue method id |
| `sourceId` | when method has `materialModes` | Resolved Source from setup |

## Behaviour

| # | Condition | Response |
| --- | --- | --- |
| 1 | `method=srs-session` | Redirect to `/words/review?method=srs-session` |
| 2 | Hosted exercise method, recipe exists | Mount exercise runner with recipe |
| 3 | Hosted, engine not built | Honest not-built surface; link to method detail |
| 4 | Unknown `method` | 404 or honest error |

## Layout

`one-screen-exercise` while the runner is active — anchored footer on mobile and
desktop; body scrolls inside the frame. Contract:
[`page-layout.md`](../feature/page-layout.md),
[`exercise-runner.layout.md`](../feature/exercise-runner.layout.md).

## Acceptance criteria

- [ ] Given a signed-in learner and a built exercise method, when `/practice?method=…`
      opens, then the runner mounts without a client-only recipe fetch flash.
- [ ] Given `method=srs-session`, when `/practice` opens, then the browser lands
      on Words review.

## Check

`npm test -- exercise-runner`
