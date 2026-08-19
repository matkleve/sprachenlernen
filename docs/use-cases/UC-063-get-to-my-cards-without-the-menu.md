# UC-063 — Get to my cards without going through today's menu

<!-- id: UC-063 -->
<!-- specs: SPEC-feature-app-shell, SPEC-component-nav-link, SPEC-page-words-review, SPEC-page-words, SPEC-feature-words-home, SPEC-feature-review-horizon, SPEC-feature-vocabulary-orbit, SPEC-feature-mobile-nav, SPEC-feature-mobile-nav-v2, SPEC-feature-page-layout, SPEC-service-session-builder -->

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
  method: why this card is due now, the horizon of what is coming (collapsed
  by default for daily habit — expand on demand or when UC-006 / UC-005
  relevance triggers fire), and the vocabulary orbit (with **Show list** for the
  full deck).
- Words home offers **separate one-tap paths** for meaning review, form review,
  and mixed review ([UC-078](UC-078-practise-forms-without-mixed-review.md)) —
  still one destination, still no due counts.
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

## Decided

Both gaps below closed on 2026-08-09 with
[ADR-0009](../adr/0009-three-destinations.md): **three destinations — Methods,
Words, Progress** — with Methods as the default route. The destination is named
for the material, which is what this use case asked for, and the count stays
banned in every form.

~~**⚠ SPEC GAP: the app has no navigation model at all.**~~ Answered.
~~**⚠ SPEC GAP: three destinations or four.**~~ Three. The fourth would have
been a profile or settings tab, which is a link in a corner rather than a fifth
of the screen.
