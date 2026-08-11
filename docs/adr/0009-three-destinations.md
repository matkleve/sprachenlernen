# ADR-0009 — Three destinations: Methods, Words, Progress

**Status:** accepted · 2026-08-09
**Context:** [`../use-cases/UC-063-get-to-my-cards-without-the-menu.md`](../use-cases/UC-063-get-to-my-cards-without-the-menu.md),
[`../study/21-method-catalogue-and-context.md`](../study/21-method-catalogue-and-context.md),
[`../study/12-method-cards.md`](../study/12-method-cards.md)

## Context

Nothing in the repository specified global navigation. The app shell is the
first component of any UI, so this blocked every screen, and UC-063 recorded it
as a question about **prominence** rather than reachability: the learner wants a
fast path to their cards without walking through a menu.

The obvious answer is a tab called **Flashcards**, and it is the wrong one. A
bottom tab is the strongest statement of structure an app makes. A tab named
after one of fifty-three methods makes that method a structural peer of the
whole catalogue — which is precisely the framing the user corrected on
2026-08-08: *"Flashcards is also just a method, it's nothing special."* The
catalogue would then be one of two things the app is, instead of what the app
is.

But the underlying need is real. Cards are the only method with a **daily**
floor, they are the only one with a queue that grows while you are away, and
routing them through a filter every day is friction on the highest-frequency
action in the product.

## Decision

**Three destinations.**

| Destination | What it is | Why it is a destination |
| --- | --- | --- |
| **Methods** | The front door: current standing, the demonstration sentence, the context filter, and the methods that fit | It is what the product *is*. Everything else is reached from a choice made here |
| **Words** | Everything about the learner's vocabulary: what is due now, what is held, what is shaky | A **noun**, not a method. Reviewing is one thing you do here; browsing what you know is another |
| **Progress** | The level model drilled down to signals, the dose ledger, the honest "not measured" | Study 03's honesty rules need somewhere to live that is not a badge on the front page |

**The second destination is named for the material, not for the exercise.** That
is the whole of the decision. "Words" is a place your vocabulary lives; opening
it and finding 40 due is a fast path to the SRS session without the tab claiming
that flashcards are half of language learning.

Four destinations were considered and rejected. The fourth would have been a
profile or settings tab, which is a link in a corner, not a fifth of the screen.

## Consequences

- The app shell is unblocked, and with it every screen.
- **Methods is the default route.** `/` is the menu, not a dashboard.
- Cards are reachable in two taps from anywhere and are never the front page.
  Someone who only ever does cards will see the catalogue every time they open
  the app, which is deliberate and is the only nudge in the design that costs
  the learner nothing.
- **Progress must be able to render "nothing measured yet"** with dignity, since
  that is the state of every new account. Study 08 already names a palette that
  flatters cheerful states and fails the honest ones as a real risk; this is
  where it gets tested first.
- A method a learner is *doing* is not a destination — the runner is a surface
  pushed over the tab, and leaving it is an explicit act. Otherwise a stray tab
  tap abandons a session silently.
- UC-063 is answered. The open question in the roadmap about the navigation
  model closes with it.

## Alternatives

**A Flashcards tab.** Rejected above: it contradicts a correction the user made
explicitly, and it is the single clearest signal an app sends about what it
thinks it is.

**Two destinations — Methods and Words.** Tempting, and it fails the level
model. Study 03 requires that every number opens into what produced it, and
there is no room for that inside a header on the methods page. Buried, the
honesty apparatus becomes a footnote about honesty.

**Five, one per skill.** Rejected: it presumes the learner thinks in the four
skills. They think in "what can I do right now", which is the context filter,
which is on Methods already.
