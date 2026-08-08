# 10 · Anti-patterns: what we deliberately do not build

The exclusion list is the cheapest part of a study and the one that prevents the
most rework. Every point also names **what it costs** — an exclusion with no
stated price is self-deception.

---

## A1 · Activity metrics in a prominent place

**Not:** streak, XP, minutes, leagues as a primary display.
**Because:** what is displayed prominently gets optimised. Activity metrics are
cheaper to raise through activity than through learning — and then users
rationally optimise past the language ([01](01-duolingo.md), D1).
**Costs us:** probably usage frequency. Duolingo's mechanics demonstrably work;
our alternative is reasoned but unproven ([08](08-motivation.md), the honesty
caveat).

## A2 · Punishing errors

**Not:** hearts, lives, session termination after too many mistakes.
**Because:** an error during a retrieval attempt is the learning process, not its
failure ([02](02-evidence.md), E1). An app that punishes errors makes users
choose easier tasks — the exact opposite of [02](02-evidence.md), E6.
**Costs us:** a source of tension. Error-freeness as a goal is emotionally
satisfying.

## A3 · The backlog counter

**Not:** "871 cards overdue."
**Because:** the commonest exit route from SRS apps, and a pure display problem
([04](04-flashcards-srs.md), the backlog trap). The number does not inform, it
shames.
**Costs us:** no information — the horizon (F03) shows the same data usefully.
But Anki switchers will miss the number and will ask for it.

## A4 · A single progress bar

**Not:** "You are 34 % through the Spanish course."
**Because:** it measures content traversed, not competence. Two users with the
same bar can be a year apart. And it has an end, which is wrong: after the
course, you cannot speak Spanish.
**Costs us:** a very satisfying display. People like bars that fill; a level
profile is harder to grasp.

## A5 · Generated content without checks

**Not:** LLM texts, sentences and translations straight to learners.
**Because:** the learner is by definition unable to judge whether a
target-language sentence is correct — that is why they are learning. A wrong
sentence is memorised with exactly the care a right one gets. Duolingo's 2025
"AI-first" announcement spoke openly of accepting "small hits on quality"; for
generated *learning content* that is the wrong trade-off
([01](01-duolingo.md), D6).
**Instead:** automatic checks against frequency, level and grammar criteria;
native-speaker sampling per language; a visible reporting route in every item
(F85); provenance labelling.
**Costs us:** real ongoing money. This is the most expensive item on this list
and the one most likely to be economised on.

## A6 · Pronunciation grading you cannot trust

**Not:** ✓/✗ on a spoken sentence.
**Because:** inaccurate feedback is worse than none — it confirms errors and
damages trust in every other signal ([01](01-duolingo.md), D4).
**Costs us:** a feature that demos well.

## A7 · Translation without a retrieval attempt

**Not:** tapping shows the translation immediately.
**Because:** no retrieval attempt, no learning ([02](02-evidence.md), E1). The
app would become a pleasant dictionary with a progress bar.
**Instead:** a short delay or a second tap (F34), switchable off.
**Costs us:** some convenience, and the brake will feel wrong at first.

## A8 · Grammar as a chapter up front

**Not:** "Lesson 4: The perfect tense" as a required station before practice.
**Because:** explicit explanation works ([02](02-evidence.md), E5) — but at the
point of error, where an open question exists. Up front it is text nobody reads.
**Costs us:** structure. Some learners — especially the school-conditioned — want
exactly that and will miss it. Compromise: available, but not in the way.

## A9 · A placement test before the first exercise

**Not:** ten minutes of testing before anything is learned.
**Because:** the low barrier to entry is Duolingo's greatest strength
([01](01-duolingo.md), S1). A test is an examination as a greeting.
**Instead:** practise first, offer the test after; skipping it means being placed
continuously from behaviour.
**Costs us:** worse initial calibration for advanced learners, who will have
tedious first sessions with material that is too easy.

## A10 · Flashcards as an empty shell

**Not:** "Create your first card."
**Because:** this is exactly where flashcard apps fail. Card design is a learnable
skill and nobody wants to learn it before learning Spanish
([01](01-duolingo.md), S3).
**Costs us:** editorial work on the starter decks per language (F07).

## A11 · Making everything configurable

**Not:** interval modifier, ease bonus, lapse multiplier in the main menu.
**Because:** Anki's power is the reason most people do not use it. Defaults must
hold without being understood.
**Costs us:** the power-user audience will complain.
**Not to be confused with:** visibility. The schedule is fully *shown* (F02,
F03) — it is merely not *adjustable* everywhere. Showing and allowing adjustment
are different things, and confusing them is why transparent systems often end up
over-configured.

## A12 · Voice commands as conversation

**Not:** free speech understanding to control the audiobook.
**Because:** a fixed, small command list is reliable, fast and possible offline;
free understanding is none of those. And a command that thinks for three seconds
is never used again ([05](05-input-reading-listening.md)).
**Costs us:** a demo wow feature. The command list has to be learned.

## A13 · Voice as the only route

**Not:** functions that exist only via voice command.
**Because:** voice control is unusable on a bus, in an office and in company —
that is, in the majority of real learning situations.
**Costs us:** double implementation of every listening function.

## A14 · Selling streak protection

**Not:** purchasable exemptions from your own metric.
**Because:** a metric you can buy measures nothing. And it is the clearest
possible statement about what the product optimises for.
**Costs us:** a demonstrably effective revenue stream.

## A15 · Sorting practice methods out by popularity

**Not:** removing a method or zeroing it because the user rates it badly.
**Because:** preference and effect are partly opposed. Kornell & Bjork showed
learners rate blocked practice as more effective than interleaved — **even
after** taking a test that showed the opposite. A system optimising on thumbs
therefore converges on the pleasantest and weakest methods
([12](12-method-cards.md)).
**Instead:** preference governs form (length, timing, framing, share), effect
governs selection; every method has a reasoned floor its share does not fall
below.
**Costs us:** users will occasionally be offered something they dislike, and may
read that as their feedback being ignored. Hence the floor must justify itself
and negotiate over length.

> **Boundary (decided 2026-08-08):** this anti-pattern forbids **the algorithm**
> from sorting out. It does **not** forbid the user from deliberately hiding a
> method — that is allowed, with friction, and the rules are in
> [12](12-method-cards.md). A conscious decision is different from a
> self-reinforcing frequency statistic.

---

## The rule behind all fifteen

> **What is displayed gets optimised. So only what is useful to optimise may be
> displayed prominently.**

That is the sentence every new feature is checked against. It belongs in
[`../CONSTITUTION.md`](../CONSTITUTION.md) as a product rule — see
[11](11-roadmap-open-questions.md), question 8.
