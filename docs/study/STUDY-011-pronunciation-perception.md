# 13 · Pronunciation and perception: the overlooked lever

<!-- id: STUDY-011 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-014 -->

The strongest single method in this study, and the one with the largest gap
between evidence and adoption. It is called **High Variability Phonetic Training
(HVPT)**, has been well supported since the 1990s — and virtually no consumer app
does it.

---

## The problem it solves

A German native speaker does not reliably hear the difference between English
*ship* and *sheep*. Not from inattention, but because their sound system locked
onto German categories in the first years of life. Perceptually, the contrast
barely exists for them.

That starts a chain most learners never see through:

```
  category not audible
        ↓
  word not recognised in speech       →  "they talk so fast"
        ↓
  card stays written-only             →  vocabulary with no sound form ([04](STUDY-004-flashcards-srs.md))
        ↓
  category not producible             →  "an accent"
```

The point is the direction: **the pronunciation problem starts in the ear, not
the mouth.** Someone who cannot hear a category cannot reliably hit it and cannot
check whether they did.

This is exactly why Duolingo's approach — repeat a sentence, get a binary verdict
from unreliable recognition ([01](STUDY-001-duolingo.md), D4) — is aimed at the wrong
place. It measures production badly instead of training perception.

---

## What HVPT is **[A]**

Not repetition. A **discrimination task** with immediate feedback:

```
  🔊  (audio: "sheep", speaker 4 of 12)

      [ ship ]        [ sheep ]

  ✓  correct — speaker 4, female, British
     hear it again · same speaker: "ship"
```

The active ingredient is in the name: **high variability**. Training uses **many
different speakers**, many phonetic environments and many words. That variability
forces the brain to extract the *invariant* feature rather than memorise one
person's voice. Training with a single speaker works considerably worse and does
not transfer to new voices.

### The numbers

A meta-analysis across 79 studies of L2 speech perception finds:

| Comparison | Effect size |
| --- | --- |
| Pre-test → post-test | **g ≈ 0.92** |
| Training group vs. control | **g ≈ 0.67** |

Medium to large effects — on the order of the best findings in this study
([02](STUDY-002-evidence.md), E1). Three further properties rarely occur together:

1. **Durable.** The perceptual gains persist over longer periods.
2. **Generalising.** They transfer to **new words and new speakers** that never
   appeared in training. So the category is learned, not the examples.
3. **It radiates into production.** A second meta-analysis across 31 studies
   finds small-to-medium effects of pure *perception* training on **pronunciation**:
   ~10.5 % improvement on trained words, ~4.5 % on untrained ones. You become
   measurably easier to understand without once speaking into a microphone.

### The limits, honestly

Effectiveness is bounded by the learner's perceptual abilities, their first
language, and the nature of the target categories. Some contrasts are
extraordinarily hard for some L1 backgrounds, and HVPT does not turn that into
native-level perception but into a clear improvement. Effect sizes also depend on
training duration, task type, response options and **number of speakers** —
those are design parameters, not incidentals.

---

## Why this is nearly free for us

HVPT needs no LLM, no speech recognition, no grading of user audio — none of what
is expensive and unreliable in [06](STUDY-006-production.md). It needs:

- a list of the **difficult contrasts for this language pair** (finite, small,
  well documented — around a dozen for German → English),
- word pairs per contrast,
- **recordings from many speakers** (at least ~6–12, varied genders and
  varieties),
- a two-choice task with immediate feedback.

The recordings are the only real cost. **[D]** For V2, probably feasible with
several high-quality TTS voices; for the final version real speakers are
preferable, because natural variability is precisely the active ingredient and
synthetic voices tend to be too clean and too similar. That is an open question,
not a settled one.

Time cost for the learner: on the order of 10–15 minutes, a few times a week,
over a few weeks. After that the contrast is done and returns only for
refreshing.

---

## How it fits in

| Connection | How |
| --- | --- |
| **As a method** ([12](STUDY-010-method-cards.md)) | Its own method card: intensity ●●○, 12 min, headphones, target signal "audio-recall stability for affected words". Floor **[D]** 2×/week while unsolved contrasts exist — zero after |
| **As a diagnosis** | A short contrast screening shows *which* categories this user lacks. It is the only pronunciation diagnosis in this study that is defensible |
| **To the cards** ([04](STUDY-004-flashcards-srs.md)) | Words containing an unsolved contrast are systematically disadvantaged in audio recall. After training, exactly those cards should improve — a cleanly checkable effect |
| **To the level** ([03](STUDY-003-level-model.md)) | Solved contrasts are a layer-1 signal for listening, and an unusually clean one: a genuine ability threshold, not a frequency statistic |
| **To production** ([06](STUDY-006-production.md)) | Replaces unreliable pronunciation grading with something that demonstrably works. A6 in [10](STUDY-009-antipatterns.md) says what we do *not* do; this chapter says what we do instead |

---

## Self-comparison as a complement

For the production side [06](STUDY-006-production.md) stands: your own recording next
to the native speaker's, no score. The connection with this chapter is the
interesting part — **self-comparison only works once the contrast is audible.**
Someone who cannot distinguish *ship* from *sheep* will not hear what was wrong
in their own recording either.

Order, then: perception first, then self-comparison, then — if at all —
automatic feedback.

---

## What goes into a spec

- The **contrast list per language pair** as data, not code. It is the core of
  the feature and differs for every L1 → L2.
- The speaker pool per contrast, with a minimum count. **Training with too few
  speakers looks like HVPT and does nothing** — that is the most dangerous
  economy in this feature and belongs in the spec as an invariant, not in a note.
- The state of a contrast (unchecked → detected weak → in training → solved →
  refresh), with **solved** as a quasi-terminal state — see
  [`../STATE.md`](../STATE.md).
- The stopping condition: how does the system know a contrast has stuck and needs
  no more training? Without that rule the feature runs forever and burns exactly
  the time that was its advantage.
