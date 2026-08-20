# Words — review route

<!-- id: SPEC-page-words-review -->
<!-- use-case: UC-063 -->
<!-- use-case: UC-078 -->
<!-- status: active -->

Thin route at `/words/review`. Dispatches to the hosted session for a method id
in the query string. Layout modes: [`../feature/page-layout.md`](../feature/page-layout.md).
**Standard**.

## Scope

- **In:** `app/(app)/words/review/page.tsx` — reads `?method=` and optional
  `?deck=` (`meaning` | `form` | `mixed`, default `mixed`), validates against
  the method catalogue, renders [`ReviewSession`](../feature/review-session.md)
  for `srs-session`, honest "not built" for other hosted methods.
- **Out:** method menu composition; duration picker; runner chrome shared across
  methods.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words/review` with no `method` | Unknown-method message + link to Methods |
| 2 | Opens with `method=srs-session` | Server builds the 15-card queue for `deck=mixed` (default), then mounts review session with the first card ready — no second client-side prepare step |
| 2b | Opens with `method=srs-session&deck=form` | Queue contains **form-recall Tasks only** (after staging); empty queue → honest "nothing to review" |
| 2c | Opens with `method=srs-session&deck=meaning` | Queue contains **meaning-recall Tasks only** |
| 3 | Opens with a valid but unbuilt hosted method | Not-built message from catalogue |
| 4 | Opens with an unknown id | Unknown-method message |

## States

No page-level machine — delegates to the feature FSM.

## Acceptance criteria

- [ ] Given `?method=srs-session` and a signed-in Account, when the page renders,
      then the review session feature mounts with **no in-page back link** on
      mobile (shell back chip to Words is sufficient), including on load error.
- [ ] Given viewport &lt; `md` and `?method=srs-session`, when a card is shown,
      then the session body does not scroll (one-screen layout).
- [ ] Given `?method=srs-session&deck=form` and held form-recall Tasks due,
      when the page renders, then every card in the queue is form-recall.
- [ ] Given `?method=srs-session&deck=meaning`, when the page renders, then no
      form-recall card appears in the queue.
- [ ] Given an unknown `deck` value, when the page renders, then behaviour
      matches `deck=mixed`.
- [ ] Given no `method` param, when the page renders, then no session mounts and
      unknown-method copy appears.

## Check

`npm test -- review-session words-review`
