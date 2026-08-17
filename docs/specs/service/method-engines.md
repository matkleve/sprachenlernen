# Method engines

<!-- id: SPEC-service-method-engines -->
<!-- use-case: UC-046 -->
<!-- status: active -->

Which catalogue Methods the app can **run** today, on which routes, and what
data they read and write. The catalogue lists fifty-three ways to practise;
engines are the runnable subset.

Parent contract: [`practice-model.md`](practice-model.md). Catalogue schema:
[`method-catalogue.md`](method-catalogue.md).

## Scope

- **In:** the engine concept; the shipped **card engine** (`srs-session` on
  `/words/review`); the **exercise runner** (draft —
  [`exercise-runner.md`](../feature/exercise-runner.md) on `/practice`);
  routing rules (`lib/method-session.ts`); what feeds Progress and Words today.
- **Out:** menu composition (method-menu); individual session FSMs
  (review-session, exercise-runner); building every catalogue Method.

## The three layers

| Layer | What it is | Ships today |
| --- | --- | --- |
| **Method catalogue** | Data — every named way to practise, hosted or off-app | 53 methods, browsable at `/methods` |
| **Method engine** | Code that turns one Method into a session | **One built:** card engine (`srs-session`). **One specced:** exercise runner (UC-049) |
| **Destination** | Where a learner goes for a kind of work — Methods, Words, Progress | Three (ADR-0009) |

A **hosted** catalogue entry (`hosted: true`) means the product intends to run it
in-app. It does **not** mean a session exists yet. Thirty-four methods are
hosted; one engine is built.

## Card engine (shipped)

| Field | Value |
| --- | --- |
| Method id | `srs-session` |
| Route | `/words/review?method=srs-session` |
| Pool | [`starter-deck.md`](starter-deck.md) — meaning-recall Tasks |
| Scheduler | [`scheduler.md`](scheduler.md) (FSRS) |
| Writes | [`review-log.md`](review-log.md) |
| Home surface | [`words-home.md`](../feature/words-home.md) at `/words` |

Future card-based Methods (form recall, audio recall, cloze …) extend this
engine on the same route. **Form-recall** Tasks ship in
[`form-recall-pool.md`](form-recall-pool.md) — staged after meaning-recall is
held for the same Word.

## Exercise runner (draft)

| Field | Value |
| --- | --- |
| Methods | Multi-step: dictation, free writing, 4/3/2, … |
| Route | `/practice?method=…` ([`practice.md`](../page/practice.md)) |
| Step model | prepare · do · wait · submit · review · decide |
| Recipes | Data — ordered steps + components ([`exercise-runner.md`](../feature/exercise-runner.md)) |
| Writes | Session log (future); `decide` may create cards — never silently |

Build order: [`plans/exercise-runner.md`](../../plans/exercise-runner.md).

## Routing

| Catalogue state | From method menu card | From method detail |
| --- | --- | --- |
| Hosted, card engine (`srs-session`) | Opens Words review directly | Start → Words review |
| Hosted, exercise runner (when built) | Detail page (or direct if daily three) | Start → `/practice?method=…` |
| Hosted, engine not built | Detail page | Honest not-built copy; no Start |
| Off-app (`hosted: false`) | Detail page | Off-app copy; no Start |

Implementation: `usesWordsReview`, `cardHrefForMethod`, `sessionHrefForMethod`
in `lib/method-session.ts`.

## What feeds learner readings today

Only **card-engine Reviews** produce data Progress and Words can read:

- pool-local vocabulary (`held` / `fragile` / `new`)
- recall-stability signal on `/progress`
- method-menu **current standing**

Input methods (extensive reading, listening …), off-app methods, and hosted
methods without engines produce **no** layer-1 signals yet. That is expected
until their engines ship — not a bug in the catalogue.

## Engine queue

Order is load-bearing — see IMPLEMENTATION-PLAN § Track B engine phase and
[`plans/exercise-runner.md`](../../plans/exercise-runner.md):

1. ~~Spanish starter pool (2000 lemmas)~~ — shipped
2. Form→lemma tables — pool and signal shipped. Card-side form practice:
   [`form-practice.md`](form-practice.md) (still blocked on inverse index)
3. **Exercise runner** (T-E1–E8) — platform for dictation, writing, listening
   drills; first real method after T-W7 coverage
4. T-B3 remainder (extrapolation + per-skill levels)
5. Offline / PWA
6. T-B10b remainder (readiness)
7. T-B4 numerator (guided hours practised)

## Acceptance criteria

- [ ] Given any hosted method other than `srs-session`, when the menu card is
      tapped, then the detail page opens — not Words review.
- [ ] Given `srs-session`, when the menu card is tapped, then Words review opens
      without passing through detail.
- [ ] Given review history from `srs-session` only, when Progress renders, then
      pool-local vocabulary and recall stability may have data and all four
      skills remain *not measured*.
- [ ] Given the catalogue, when `hosted: true` is read, then no code path may
      assume a session exists — only `usesWordsReview` may open a runner, and no
      surface builds `?method=…` by hand. Enforced by a test that greps
      `app/` and `features/` for the literal, because three surfaces had already
      done it when this criterion was written.

## Check

`npm test -- method-session progress`

Two files, because the criteria are in two places: the routing rules are in
`lib/method-session.test.ts`, and "skills stay *not measured* on card-engine
Reviews alone" can only be observed where Progress is rendered. A `Check` that
named only the first would have left that criterion unverified while looking
covered.
