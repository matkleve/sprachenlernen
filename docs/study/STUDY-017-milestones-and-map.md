# 19 · Milestones and the map

<!-- id: STUDY-017 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-031, UC-032, UC-033, UC-034 -->

## Thesis

Learners need a map of reachable milestones, not only a compass saying keep going.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

Your sentence: *"I often lack the overview to see how what I learn and have
understood actually feeds into everything."*

That is the best observation in your message and it describes a problem no
product in [15](STUDY-013-landscape.md) solves. They all show a **compass** — direction,
progress, keep going. None shows a **map**: where am I, what is reachable from
here, and what did the last month open up for me.

---

## Why vocabulary can be thought of in blocks

Word frequency is extremely unevenly distributed. The most frequent words carry
the bulk of any text, and the return falls steeply after that:

| Block | Rough gain in coverage | Cumulative |
| --- | --- | --- |
| The first 1,000 | ~72–80 % | ~72–80 % |
| The second 1,000 | **+~8** | ~80–88 % |
| The third 1,000 | **+3–5** | ~85–90 % |
| Up to 5,000 | +~3 | ~92 % |
| Up to 10,000 | +~4 | ~96 % |

Two things sit in that table, and both belong in the product:

**1. The beginning is extraordinarily productive.** The first thousand words buy
more comprehension than the following nine thousand. That is the most motivating
fact in language learning, and nobody tells beginners.

**2. After that it gets hard, and that must be said.** Block 7 might yield two
percentage points. A milestone system pretending all blocks are worth the same is
a lie — and it is exactly where learners give up between B1 and B2
([03](STUDY-003-level-model.md)).

### Careful with these numbers **[C]**

The literature disagrees: some works reach 95 % coverage at 2,000–3,000 units,
others only at 4,000–5,000 ([02](STUDY-002-evidence.md), E4). The difference comes not
from bad research but from the **counting unit** — lemma or word family — from
the corpus, and from whether proper nouns are counted.

**Consequence [D]:** block boundaries are defined **in our counting unit**
([18](STUDY-016-language-kit.md), U1) and **calibrated per language**, not copied from a
table. And the calibration is dated, like everything else
([03](STUDY-003-level-model.md), rule 4).

---

## The milestones

**[D]** Eight blocks, each with its *actual* cost and yield:

```
  Block 4 · Ranks 1001–2000
  ████████████░░░░░░░  1,240 / 2,000 stable

  What it buys you    +8 points of coverage  →  ~85 % of ordinary text
  What is left        760 words · at your pace ~7 weeks
  After that          Block 5 only adds +4. The jump gets smaller.
```

The last line is deliberate. It pre-empts the disappointment of the next block
rather than letting it arrive.

**What counts is stable knowledge, not cards seen** — stability from the
scheduler, not card count ([04](STUDY-004-flashcards-srs.md)). Otherwise the bar becomes
an activity metric, and then [10](STUDY-009-antipatterns.md), A1 applies.

Incidentally: this is one of the few numbers in this product where **optimising
it is exactly right**. Closing the next frequency block does mean learning the
most useful words. It is the exception that confirms A1's rule: you may display
what is useful to optimise.

---

## The map: four questions, one surface

### K1 · Where am I?

The vocabulary atlas (F08) — frequency rank on one axis, stability on the other.
The mastered zone on the left, the holes in it, the edge currently being worked.
**This is hereby promoted from "prettiest picture in the app" to a primary
display.**

### K2 · What has that made reachable?

The answer to your question, and the part nobody builds. Not as a number but
against **your** content ([17](STUDY-015-own-content.md)):

> This month **4 podcast episodes** and **9 texts** moved from demanding to
> comfortable. *Radio Ambulante · episode 214* was at 84 % coverage in May, now
> at 95 %.

That is experienced competence rather than asserted competence
([08](STUDY-008-motivation.md), M5) — with the difference that here it arises
automatically, because coverage for all saved content is computed anyway.

### K3 · What is missing between me and *that*?

The strongest single idea in this chapter, and it reverses the direction. Instead
of "learn vocabulary, eventually you will understand more":

> *Radio Ambulante · episode 219* — you are at 91 %. **These 23 words** separate
> you from 95 %. Learn them as a set? (~4 days)

Vocabulary learning stops being abstract. You are not learning "vocabulary", you
are **unlocking a particular episode**. The goal is concrete, visibly close, and
the success is checkable: you listen to it afterwards and notice the difference.

Technically it is nearly free — it is the coverage calculator read backwards.

### K4 · What did today's session move?

At the end of each session, two lines: which words moved from shaky to stable,
and what that shifted on the map. Not a score — a position.

---

## The connection the map makes visible

The real reason you lack the overview: the parts of the system are connected, but
the connection is never **shown**. The map is the surface on which it becomes
visible:

```
        you learn a word
                 ↓
     frequency rank → block advances       (K1)
                 ↓
     coverage of your content rises        (K2)
                 ↓
     content slides into the 95–98 % band  ([05], [17])
                 ↓
     more comprehensible input
                 ↓
     more words learned incidentally       (E4)
                 ↓
        you learn a word
```

This loop is the project's thesis ([15](STUDY-013-landscape.md), K3). So far it existed
only in the study. **It belongs on the screen** — not as a diagram, but by each
display naming the next one.

A word is therefore traceable in both directions:

- *"What is* sin embargo *good for?"* → it appears in 4 of your podcasts and 3
  texts, rank 812, part of block 3.
- *"Why did this card come up?"* → the scheduler already says (UC-005).

---

## What goes into a spec

- Block boundaries as **language profile data** ([18](STUDY-016-language-kit.md)), not
  constants in code.
- The yield per block computed from **our own corpus**, not taken from the
  literature — otherwise the app shows English figures to an Italian learner.
- The reverse query from K3 (which words are missing for this item) as its own
  function of the coverage calculator.
- **Sensitive:** K2 compares historical coverage values. Those need a timestamp
  and the calibration in force at the time — otherwise a recalibration displays
  progress that did not happen ([03](STUDY-003-level-model.md), rule 4).

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-031 — [use-cases/README.md](../use-cases/README.md)
- UC-032 — [use-cases/README.md](../use-cases/README.md)
- UC-033 — [use-cases/README.md](../use-cases/README.md)
- UC-034 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
