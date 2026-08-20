# 04 · Flashcards with a visible memory model

<!-- id: STUDY-004 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-005, UC-006, UC-012, UC-013 -->

## Thesis

SRS works when the learner trusts the schedule; trust comes from visibility, not secrecy.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

Classic flashcards, except the schedule is not a black box. Your phrasing was:
*"where it can also show what exactly is happening and when which cards will come
up."* That is the second big difference from everything that exists — Anki can
do it in principle but shows it only to insiders; Duolingo shows it to nobody.

---

## The algorithm: FSRS, not SM-2 **[A]**

| | SM-2 (the Anki classic, 1987) | FSRS (Free Spaced Repetition Scheduler) |
| --- | --- | --- |
| Memory model | one value per card ("ease factor", starting at 2.5) | three quantities: **stability**, **difficulty**, **retrievability** |
| Adaptation | fixed rules for everyone | 17 trainable parameters, optimised against *your own* review history |
| Target quantity | interval | desired probability of recall (e.g. 90 %) |

Evidence: the founding work (Ye, KDD 2022) reports roughly 12.6 % improvement
over existing methods; benchmarks across millions of reviews show FSRS more
accurate than SM-2 even **without** personal optimisation, for practically every
user tested. Practical effect: about **20–30 % fewer reviews for the same
retention**. Bundled natively in Anki since 23.10.

Three reasons this matters to us beyond the percentage:

1. **It is explainable.** "Probability of recall today: 91 %" is a sentence a
   human understands. "Ease factor 2.35" is not. The algorithm that computes
   better happens also to be the one that displays better — and that is the real
   reason for choosing it.
2. **It has a dial with meaning.** Target retention (say 85 % instead of 90 %) is
   a genuine user trade-off between effort and security, and its consequence is
   predictable and displayable.
3. **It supplies the level measurement.** Per-card stability is exactly the
   quantity from which [03](STUDY-003-level-model.md) computes the difference between
   "seen" and "known".

**Open question:** own implementation or one of the open FSRS libraries. See
[11](../backlog/BL-011-roadmap-open-questions.md), question 4.

---

## The glass-walled schedule

Four views. Together they are the distinguishing feature.

### G1 · This card — "why now?"

Available on any card without leaving the session:

```
  casa · house
  ─────────────────────────────────────────────
  Last seen:      12 days ago  ✓ correct, 1.4 s
  Stability:      23 days        ▁▂▃▅▆  (growing)
  Recall today:   89 %         ← which is why it is here
  If "good":      back in 34 days
  If "hard":      back in 9 days
  Seen:           7× · 1 failure (3 months ago)
```

The two lines "if good / if hard" are the most important part: they turn
self-assessment into a **decision with a visible consequence** rather than a
guessing game. Otherwise users click systematically wrongly, because they do not
know what their answer does.

### G2 · The coming days — the review horizon

A bar chart of cards due over the next 30 days, plus a line of plain text:

> Next week there will be fewer (avg. 34/day rather than 51). The peak on the
> 14th comes from the 60 cards you added on the 2nd.

The **causal line** is the point. A chart alone produces anxiety; a chart with an
explanation produces understanding of the link between "lots of new cards today"
and "lots of work in two weeks". That is the lesson Anki users typically learn
only after their first collapse.

### G3 · The vocabulary atlas

Every card, arranged by **frequency rank** (x) and **stability** (y). One look
shows:

- the contiguous mastered zone on the left,
- the holes in it — frequent words not yet secure; these are the most valuable
  cards there are,
- the edge you are currently working on.

Direct connection to [03](STUDY-003-level-model.md): this picture *is* the vocabulary
estimate, made visible.

### G4 · The review — "what actually happened?"

Weekly, phrased informationally: what was added, what moved from unstable to
stable, which cards keep defeating you ("leeches"), and how the level moved as a
result.

---

## Card types

From [02](STUDY-002-evidence.md), E3 it follows that there is no single card for a
word, but several tasks on separate schedules.

| Type | Task | Trains | Introduced |
| --- | --- | --- | --- |
| **Recognition** | L2 → 4 options | first impression | first 1–2 times only |
| **Meaning recall** | *casa* → ? | reading, listening | from repetition 2 |
| **Form recall** | "house" → ? | speaking, writing | once meaning recall is stable |
| **Audio recall** | audio → ? | listening; exposes words known only in *writing* | from A1, for every word |
| **Cloze sentence** | "Vivo en una ___ grande." | form in context, collocation | from A2 |
| **Production sentence** | build a sentence with the target word | free production | from B1, less often |
| **Minimal pair** | distinguish *ser* / *estar* | the typical error class ([02](STUDY-002-evidence.md), E6) | when a confusion is detected |

Important: **audio recall for every word, from the start.** The commonest silent
defect of vocabulary apps is a vocabulary that exists only in writing. Someone
who reads *ciudad* and understands it but does not recognise it in speech has
learned the card for nothing. That is also a statement about level: such words
count toward "reading", not "listening".

### Where cards come from

Making your own is the hurdle flashcard apps die on. Hence, in this order:

1. **Shipped**, frequency-ordered per language and level — you can start on day
   one without a single decision ([01](STUDY-001-duolingo.md), S3).
2. **Generated from errors.** Every word misheard in an audiobook, every
   dictation word, every correction from a conversation is offered. This is the
   best source, because relevance is demonstrated.
3. **Tapped while reading** ([05](STUDY-005-input-reading-listening.md)) — one tap, one
   card, with the sentence as context.
4. **Written yourself**, with suggestions and warnings about known traps (two
   languages on one card; a card with five meanings).

---

## The three traps that kill flashcard apps

### The backlog trap

Two weeks away → 900 cards due → delete app. This is the most common exit route
from Anki, and it is a pure display problem.

**Solution [D]:** There is **no backlog counter**. A session has a fixed
user-chosen length (say 15 minutes or 40 cards). What fits is prioritised by
urgency — most overdue and most frequent first. The rest is silently
redistributed. Instead of "871 overdue" it reads:

> You were away for two weeks. The most important 40 come first; I will work the
> rest back in over the next 10 days.

The cards have not vanished — G2 still shows them. But the number that produces
shame is not a primary display.

### The leech trap

A few cards fail again and again and consume disproportionate time. Almost
always the **card** is bad, not the head: too many meanings, no context,
confusion with a neighbouring word.

**Solution:** after n failures the card is suspended automatically and proposed
for repair — with a diagnosis ("you are confusing it with *X*" → minimal-pair
card) rather than more repetitions.

### The one-way-street trap

Cards are learned and never used. Vocabulary without encounters in context stays
exam knowledge.

**Solution:** the input side ([05](STUDY-005-input-reading-listening.md)) preferentially
selects texts that **contain recently learned cards**. The card is not merely
repeated, it is *met* — and that is the moment vocabulary stops being vocabulary.

---

## What goes into a spec

- A state diagram for the card (new → learning → young → mature → suspended →
  archived) with **terminal states** — see [`../STATE.md`](../STATE.md).
- The prioritisation rule for session composition (the backlog trap is a
  Sensitive change: it decides what a user does *not* get to see).
- How cards for the same word in different directions relate — one word card with
  several tasks, or several independent cards? That is the most expensive data
  model decision in the project. See
  [11](../backlog/BL-011-roadmap-open-questions.md), question 4.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-005 — [use-cases/README.md](../use-cases/README.md)
- UC-006 — [use-cases/README.md](../use-cases/README.md)
- UC-012 — [use-cases/README.md](../use-cases/README.md)
- UC-013 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
