# UC-063 — Get to my cards without going through today's menu

<!-- id: UC-063 -->
<!-- specs:  -->

**Who:** a learner who reviews every day and knows exactly what they came for.
**Wants to:** reach their due cards in one tap, from anywhere in the app.
**So that:** the daily habit does not have to be negotiated through a menu that
exists to help people who have not decided.

Derived from the owner's request for a flashcards destination in the navigation,
and from [`../study/04-flashcards-srs.md`](../study/04-flashcards-srs.md).
Constrained by [`../study/10-antipatterns.md`](../study/10-antipatterns.md) A3
(no backlog counter) and by the 2026-08-08 decision that flashcards are one
method among ~60, not a structural peer of the catalogue.

## Today

Two bad options. Flashcard apps open onto a backlog count, which
[`../study/04-flashcards-srs.md`](../study/04-flashcards-srs.md) calls the most
common exit route from Anki and a pure display problem. Method-first apps bury
the daily thing behind a chooser, which taxes the one behaviour that needs no
encouragement.

## Success looks like

- Reviewing is reachable in one tap from anywhere, without passing through the
  context filter or the daily menu.
- The destination is named for the **object**, not the method — words and their
  schedule — so reviewing is one of the things done there rather than the
  destination's identity.
- It carries the surfaces that belong to the card engine rather than to any
  method: why this card is due now, the horizon of what is coming, and the
  vocabulary atlas.
- **No count anywhere in the navigation.** No badge, no dot, no "12 due". A3
  forbids the backlog counter, UC-006 forbids an overdue count as a primary
  figure anywhere, and a tab badge is the most primary figure a phone has.
- Arriving there after two weeks away gives a session of the usual length and one
  sentence explaining the plan — never a backlog (UC-006).
- Its prominence does not imply priority. Nothing in the app states or implies
  that reviewing is the main thing or the thing owed today.

## Out of scope

Naming a navigation destination after a method; a review counter in any form; and
promoting flashcards above the catalogue in the daily menu's composition, which
is governed by [12](../study/12-method-cards.md) and unaffected by navigation.

## Undecided

- **⚠ SPEC GAP: the app has no navigation model at all.** Nothing in the
  repository specifies global navigation — no chapter, no feature, no use case
  mentions tabs or routes beyond `/` and `/languages`. This use case assumes a
  persistent bottom bar because the owner asked for one; the number of
  destinations, and whether this one is among them, is undecided.
- **⚠ SPEC GAP: three destinations or four.** A dedicated words destination is
  the owner's request; the alternative folds the card engine's surfaces into a
  progress destination and keeps the bar at three. Reachability is already
  guaranteed either way, since flashcards carry a daily offer rate — so what is
  at stake is prominence, which [`../study/22-visual-design.md`](../study/22-visual-design.md)
  G3 reserves for what is useful to optimise.
