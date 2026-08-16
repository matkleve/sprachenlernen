# Words destination

<!-- id: SPEC-page-words -->
<!-- use-case: UC-063 -->
<!-- use-case: UC-005 -->
<!-- use-case: UC-006 -->
<!-- status: active -->

The `/words` destination — **home for the card engine**, not for every Method
in the catalogue (UC-063, ADR-0009). Today that is `srs-session` only; future
card-based Methods share this route. Reading, listening, and off-app Methods
belong in the catalogue ([`method-menu.md`](method-menu.md)), not here.

Thesis **3** ([`study/12`](../../study/12-method-cards.md)): SRS and input are
both required long-term. Words is the SRS pillar's surface; it does not subsume
the other fifty-two Methods.

Product contract: [`../service/practice-model.md`](../service/practice-model.md).
Mobile layer stack: [`../feature/page-layout.layers.md`](../feature/page-layout.layers.md).

## Scope

- **In:** `app/(app)/words/page.tsx` — ADR-0009 intent copy, decorative review
  header graphic on the raised action card, **Start review**, held/fragile/new
  counts, frequency bands, review horizon
  ([`review-horizon.md`](../feature/review-horizon.md)), vocabulary orbit.
  See [`words-home.md`](../feature/words-home.md) and
  [`vocabulary-orbit.md`](../feature/vocabulary-orbit.md).
- **Out:** due count anywhere; session-length picker; choosing a method other
  than a **built card-engine** Method from this page; surfaces for Methods whose
  engines live elsewhere (when those engines ship).

**Reuse: `Button`** as the start control (link-styled or `asChild` pattern).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Title, intent copy in a vocabulary-tinted raised card with a decorative header graphic, Start review, snapshot sections |
| 2 | Taps Start review | Navigates to `/words/review?method=srs-session` without passing through Methods |

## States

No client machine.

## Acceptance criteria

- [ ] Given a signed-in Account on `/words`, when the page renders, then a Start
      review control is present linking to `srs-session` review.
- [ ] Given the starter deck, when the page renders, then held, fragile, new,
      frequency bands, horizon (per [`review-horizon.md`](../feature/review-horizon.md))
      and vocabulary orbit sections are present.
- [ ] **The negative UC-063 exists for:** given `/words`, then no due count,
      badge or backlog figure appears anywhere.

## Check

`npm test -- words vocabulary-orbit vocabulary-snapshot`
