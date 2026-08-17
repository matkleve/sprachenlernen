# Practice model — product contract

<!-- id: SPEC-service-practice-model -->
<!-- use-case: UC-010 -->
<!-- status: active -->

How practice is supposed to work in this product: catalogue breadth, engine
depth, and which surface owns which question. When a spec and this file
disagree, fix whichever is wrong — both must match.

Research: [`study/12`](../../study/12-method-cards.md) (methods and floors),
[`study/README.md`](../../study/README.md) thesis **3** (SRS **and** input).

## Scope

- **In:** the product-level split between browsing methods, running built
  engines, and reading progress; what ships in stage 1.
- **Out:** individual Method copy; scheduler algorithm; menu filter UX.

## Contract

1. **The catalogue is the full honest set** — ~53 Methods plus Commitments.
   Off-app Methods are listed alongside hosted ones without visual demotion
   (UC-046, thesis 9).
2. **Engines ship one at a time** — stage 1 runs the **card engine**
   (`srs-session`). The **exercise runner** (prepare → submit → review → …)
   is specced for multi-step Methods ([`exercise-runner.md`](../feature/exercise-runner.md)).
   `hosted: true` is intent, not capability.
3. **Three destinations, three questions** (ADR-0009):
   - **Methods** (`/methods`) — *what could I do today?* Filters the catalogue.
   - **Words** (`/words`) — *how are my cards doing?* Card-engine home only.
   - **Progress** (`/progress`) — *what can the app claim I know?* Signals from
     built engines only.
4. **Floors govern offers, not identity** — `offerEveryDays` keeps SRS in the
   daily three; it does not make flashcards the product (thesis 12, study/12).
5. **SRS and input are both required long-term** (thesis 3). Words is the SRS
   pillar's home; reading and listening Methods are catalogue entries waiting on
   engines — not absent from the product's model.
6. **Progress never guesses** — meaning-recall Reviews feed vocabulary and
   stability signals, not skill levels. Skills stay *not measured* until
   Methods that produce their signals exist (UC-004).

## Shipped vs catalogue (2026-08-11)

| | Count |
| --- | ---: |
| Catalogue methods | 53 |
| Hosted (`hosted: true`) | 34 |
| Built engines | 1 (`srs-session`) |
| Exercise runner | specced, not built (UC-049) |
| Off-app | 19 |

## Where detail lives

| Question | Owner spec |
| --- | --- |
| Catalogue schema and validation | [`method-catalogue.md`](method-catalogue.md) |
| Which engines exist and how they route | [`method-engines.md`](method-engines.md) |
| Exercise step runner (UC-049) | [`exercise-runner.md`](../feature/exercise-runner.md) |
| Menu filters, standing, daily three | [`page/method-menu.md`](../page/method-menu.md) |
| Words snapshot and Start review | [`words-home.md`](../feature/words-home.md) |
| Progress signals and pool-local vocab | [`page/progress.md`](../page/progress.md) |
| Starter pool (card engine content) | [`starter-deck.md`](starter-deck.md) |

## Acceptance criteria

⚠ This spec is a **product contract**, so two of its criteria are about what
other specs say rather than what code does. They are checked by reading, not by
`npm test`, and saying so is better than naming a test that does not cover them.

- [ ] *(by reading)* Given a contributor reading only specs, when they open
      Methods, Words, and Progress, then no spec claims Words is the home for
      all Methods or that `hosted` implies a runnable session.
- [ ] *(by reading)* Given thesis 3, when Words and Methods are described, then
      SRS is one pillar and input Methods remain first-class in the catalogue.
- [ ] Given UC-004, when Progress is described, then vocabulary and stability
      may show data while all four skills remain *not measured* until their
      signal Methods ship.

## Check

`npm test -- method-catalogue practice-model`

`practice-model.test.ts` pins the counts in the table above to the shipped
catalogue — the one part of this contract a test can hold. The two criteria
marked *(by reading)* are deliberately not claimed as covered.
