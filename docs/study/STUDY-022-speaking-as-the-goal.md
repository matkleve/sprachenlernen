# 24 · Speaking as the goal, stalling, and the demonstrated level

<!-- id: STUDY-022 -->
<!-- type: correction -->
<!-- status: active -->
<!-- corrected-by: STUDY-019 -->
<!-- spawns: UC-050, UC-051, UC-052, UC-053 -->

## Thesis

Speaking may lead the headline without rewriting what the level model measures.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

Four things from the user, and three of them changed after looking up the
research. This chapter answers: what it means to make speaking the primary goal,
how the app notices that progress has stalled, what the landing screen should
show, and where a microphone honestly helps.

---

## S1 · Speaking as the main goal

> *"The goal of the app should mainly be speaking, but also to get the 20/80 out
> of it. No idea how you serve such different goals."*

The tension is real, and it has a clean resolution once it is named:

> **Input is the precondition. Speaking is the goal. These are not competing
> priorities — they are different positions in the same chain.**

You cannot say what you cannot retrieve, and you cannot retrieve what you have
not met often enough. That is why the cheap, measurable, high-leverage work
(vocabulary, coverage-based input) comes first in the roadmap: not because it
matters more, but because speaking practice without it is frustration
([11](../backlog/BL-011-roadmap-open-questions.md), stage 5).

The 20/80 answer is therefore concrete rather than vague:

| Phase | Highest leverage | Why |
| --- | --- | --- |
| Early | Frequency blocks 1–3, listening at coverage | The first 1,000 words buy more comprehension than the next 9,000 ([19](STUDY-017-milestones-and-map.md)) |
| Middle | 4/3/2, shadowing, form mastery | Fluency comes from repetition and automatisation, not from more words ([20](STUDY-018-speaking-and-sentences.md)) |
| Later | Free production with correction, avoidance analysis | The remaining gap is what you route around ([06](STUDY-006-production.md)) |

### How the goal is served without corrupting the measurement **[D]**

The temptation is to reweight the level model toward speaking. That would be
wrong: the measurement must stay honest regardless of what you want
([03](STUDY-003-level-model.md)).

Instead the goal changes **three things, and not the fourth**:

| Goal changes | Goal does **not** change |
| --- | --- |
| Which skill leads the **headline display** | How any skill is measured |
| Which methods get a **floor**, and how high | The overall level formula |
| Which content is selected (topics, registers) | The honesty rules |

So with speaking as the goal, the home surface leads with the speaking level and
the gap to it — *"Speaking A2.4. Your reading is at B1.3; the gap is the
thing to work on"* — while the overall level still follows the second-lowest
rule. The goal decides what is foregrounded, never what is true.

**Consequence for the floors:** with speaking as the goal, free production and
4/3/2 move from "1× per week" to a materially higher floor, and the app says why.
That is the mechanism from [12](STUDY-010-method-cards.md) doing exactly what it was
built for.

---

## S2 · The demonstration sentence on **Home** **[B — and better than you proposed]**

> *"Maybe a sentence on the landing screen that gets harder as your level rises,
> and it says: look, you can already read this, that's level such-and-such."*

> **⚠ Renamed 2026-08-08.** This section said "landing screen" throughout, and
> "landing" has since been claimed by the **public landing page** — the signed-out
> surface a visitor sees, which exists because an account is required
> ([ADR-0006](../adr/0006-require-an-account.md)). Two different surfaces cannot
> share a name (`AGENT-PITFALLS.md` §4), so: **Home** is the signed-in first
> screen this section is about, and the sentence is the **demonstration
> sentence**.

This is a good idea and the research supports it — with one correction that makes
it considerably stronger.

### Why it works

The **CEFR-SP corpus** (Arase et al., EMNLP 2022) contains 17,000 English
sentences annotated with CEFR levels by education professionals, together with a
sentence-level assessment model reaching a macro-F1 of 84.5 % — outperforming
readability baselines. So sentence-level difficulty is a quantity that can be
estimated well enough to build on.

The reason this beats a number: **it is a demonstration rather than a claim.**
[03](STUDY-003-level-model.md) computes a level from review data; this shows you the
level. And that matters because of a second finding — self-assessment against
CEFR can-do statements is a valid instrument overall, but **lower-proficiency
learners systematically overestimate themselves and advanced learners
underestimate**. A shown sentence sidesteps that bias entirely: you either
understand it or you do not.

It also fits your own framing exactly — *"I don't want unnecessary motivation. I
want to see for myself: okay, I don't understand this sentence, I can already
read something like this."* That is a competence moment
([08](STUDY-008-motivation.md), M5) available on every app open, at zero cost.

### The correction: do not ask "do you understand this?"

Asking is a self-report, and self-reports inherit the overestimation bias the
research just described. Make it **checkable** instead:

```
  "Aunque llovía, decidimos salir de todos modos."

  Tap any word you are not sure about.        [ I've got this ]
```

Three things happen at once:

1. **A demonstration.** Nothing tapped and confirmed → you read a B1 sentence.
2. **A measurement.** This is an item with a known difficulty and an observed
   response — in other words, an IRT item. The adaptive placement test (F24)
   partly builds itself out of these, one sentence per day, without ever staging
   a test ([01](STUDY-001-duolingo.md), S1: no exam as a greeting).
3. **Cards, if wanted.** A tapped word is already a capture (UC-012).

**[D]** The sentence sits **slightly above** the current estimate, not at it. At
your level it is confirmation; just above it, it is information — and either
outcome is useful. Failing it is not framed as failure: *"not yet — that one is
B1.4."*

### The honest limits

- The corpus above is **English**. For Spanish and Italian, level-labelled
  sentences must be built or estimated ourselves, which lands in the language
  profile and its quality tier ([18](STUDY-016-language-kit.md)). At tier C the sentence
  can still be shown by coverage — but without a CEFR label attached.
- Sentence difficulty is **not** the same as text difficulty. A short sentence
  with one rare word is a poor level signal. Selection needs the same coverage
  logic as everything else.
- One sentence is a weak measurement. Its value comes from repetition across
  weeks, not from any single day.

---

## S3 · When progress stalls **[B]**

> *"I'd also like the app to notice when progress stagnates and give hints —
> hey, you should also do methods of this kind or you'll never learn to speak."*

Right, and the research gives better markers than "the curve is flat".

Stagnation in L2 learning is a documented phenomenon — the **plateau effect**,
and in its persistent form **fossilization**, which affects virtually every
learner and hits the intermediate levels hardest. The literature names concrete
markers, and this is the useful part:

| Marker | What we can already see |
| --- | --- |
| **Steady below-norm accuracy** on a structure | Error rate per paradigm cell ([03](STUDY-003-level-model.md)) |
| **Fluctuation** — correct and incorrect use of the *same* structure | The same cell alternating pass/fail across reviews |
| **Backsliding** — something previously solid getting worse | Falling stability on cards that were mature |
| **De-acceleration** | The trend curve per skill flattening |

The second one is the interesting find. **Alternating success and failure on one
structure is a sharper signal than a flat curve**, because a flat curve has a
dozen innocent explanations (a busy month, a holiday) and alternation on a single
cell has very few. And we have that data already, per task, per cell.

### What the app does about it **[D]**

Three rules, and the third is the one that keeps it from becoming nagging:

1. **Name the observation, not a verdict.** *"Ser and estar have been alternating
   for six weeks — right about as often as wrong. That is not a memory problem,
   it is a distinction problem."*
2. **Offer the method that addresses that specific marker**, not "practise more":
   alternation → minimal pairs; backsliding → the schedule already handles it;
   a flat speaking curve with no speaking data → *"you have no speaking data at
   all. Nothing here can tell you whether you are improving."*
3. **It falls under the same cap as everything else**: at most one prompt a day,
   and it says its reason from the learner's own data
   ([12](STUDY-010-method-cards.md)). Stagnation detection is a floor with a trigger, not
   a new notification channel.

**The most valuable case is the one with no data at all.** A learner who never
speaks does not have a low speaking level — they have none
([03](STUDY-003-level-model.md)). Saying that plainly, once, is the single most useful
stagnation message the app can send, and it is the one your example was about.

---

## S4 · Standing commitments — a second kind of entry **[D]**

> *"How about methods like: write to a buddy who speaks the language, from now on
> everything you can in that language? Immersion methods — maybe more like tips
> or perks you can pick, present at the start? Or under a heading, 'how can I
> increase my learning effect?'"*

This exposes a structural gap in [21](STUDY-019-method-catalogue-and-context.md): every
entry there is a **session** — it has a duration, a context, a completion. What
you are describing has none of those. It is either on or off, and it runs in the
background of your life.

So the catalogue needs a second entry type:

| | **Method** | **Commitment** |
| --- | --- | --- |
| Shape | a session with a start and end | a standing rule |
| Duration | minutes | weeks or permanent |
| Completion | done / not done | active / inactive |
| Measured | via its target signal | not directly; visible in the aggregate |
| Chosen | daily, from three | once, deliberately, few at a time |

Examples: switch your phone's language. Write to one friend only in the target
language. Label the flat. Watch one series exclusively with target-language
audio. Think through your shopping list in the target language.

**Why they belong in the product rather than in a blog post:** they are the
highest-leverage thing a learner can do and they cost nothing, but nobody does
them because nobody suggests them at the moment they would land. And they fit the
ideal self ([16](STUDY-014-further-findings.md), W4) — *"you could be the person who
does their whole shopping list in Italian"* is a self-image, not a duty.

**Design rules [D]:**

- **At most two or three active at once.** Commitments compete for the same
  attention; a list of twelve is a list of zero.
- **Presented as "how do I get more out of this?"**, exactly as you framed it —
  not as tasks, and not on the daily menu, which is for sessions.
- **No completion tracking, no streak.** A commitment that gets ticked daily is a
  method with extra steps, and ticking it is exactly the activity metric
  [10](STUDY-009-antipatterns.md), A1 forbids.
- **A quiet review.** After a few weeks: *"still writing to Marco in Italian?"* —
  once, with keeping, changing or dropping all equally normal outcomes.

---

## S5 · Making the hard methods measurable

> *"We have hard but hard-to-measure or unmeasurable methods — or maybe
> measurable after all, if we bring in microphone recordings when reading a text
> aloud."*

Correct instinct, and the principle generalises:

> **A hard method becomes measurable not by grading it, but by capturing a
> by-product that is objectively checkable.**

| Method | The by-product | What it measures |
| --- | --- | --- |
| Reading aloud | ASR transcript vs. the source text | Word-level intelligibility — how much of what you said was recoverable |
| Dictation | your answer vs. the key | Sound-form recall, per word |
| Partial dictation | the gaps | The same, targeted |
| 4/3/2 | words per minute and pause count across the three rounds | Fluency change within one session |
| Back-translation | diff against the reference | Structure and avoidance |
| Free production | error categories over weeks | Which error type is receding |

Reading aloud is the strongest of these and the one your idea unlocks: the text
is known, so the ASR output can be compared against ground truth. That is not an
opinion about your pronunciation, it is a count.

---

## S6 · The microphone — and what it must not claim **[B]**

> *"What would be cool is if the phone is in listen mode and shows 'hearing you
> well' or badly."*

Here I have to push back, and the research is unusually clear.

Automated assessment of L2 speech distinguishes three constructs:
**intelligibility** (were the words recoverable), **comprehensibility** (how much
effort did understanding cost) and **accentedness**. A recent evaluation using
human leave-one-out agreement as the benchmark (r = .46–.73 across dimensions)
found that **no large audio language model reached human-level performance on any
dimension**, with only limited correlations on individual dimensions. And ASR
recognition of L2 speech mirrors L1 listeners' intelligibility judgments only
**partially**, varying by speaker and speech type.

Two things follow, and they point in opposite directions:

**Against a score.** "Hearing you well / badly" is a comprehensibility rating,
and that is exactly the dimension machines are worst at. It would repeat
[10](STUDY-009-antipatterns.md), A6 — inaccurate feedback confirms errors and damages
trust in every other signal.

**In favour of something better.** Note what the human benchmark itself is:
r = .46–.73 means *human raters do not agree with each other very well either*.
So the honest move is not a better score. It is to stop scoring.

### What we build instead **[D]**

**Show what the machine heard.**

```
  You read:   "Aunque llovía, decidimos salir."
  I heard:    "Aunque lloviera, decidimos salir."
                        ▲
```

No grade. No band. A concrete, falsifiable observation the learner can
immediately judge for themselves — and if the recogniser is wrong, that is
obvious to them rather than hidden inside a number.

Three properties make this the right answer:

1. **It cannot lie in the dangerous direction.** A wrong transcript is visibly
   wrong; a wrong score is invisibly wrong.
2. **It is actionable.** A mismatched word is a card, or a contrast for HVPT
   ([13](STUDY-011-pronunciation-perception.md)).
3. **It degrades honestly.** Poor audio produces obvious nonsense, and the learner
   knows to try again — no threshold logic required.

A live "listen mode" is still fine as an **input indicator** — is the microphone
picking you up, is the level adequate. That is a signal about the device, not a
judgement about the person, and confusing the two is what made this idea worth
examining.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-050 — [use-cases/README.md](../use-cases/README.md)
- UC-051 — [use-cases/README.md](../use-cases/README.md)
- UC-052 — [use-cases/README.md](../use-cases/README.md)
- UC-053 — [use-cases/README.md](../use-cases/README.md)
- Corrects `STUDY-019` — see that chapter's inline amendments.
- Normative contracts: [specs/README.md](../specs/README.md)
