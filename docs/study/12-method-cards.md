# 12 · Method cards and the daily choice

Your idea: a choice of different methods each day, each as a card with its
intensity and what it mainly gives you. Thumbs up or down after the session, an
algorithm learns from it — but can still say: *"this is important once a week
anyway."*

The proposal is good, and the addition at the end is the genuinely important
part. Without it you build a system that systematically degrades itself. This
chapter explains why, and what the mechanism has to look like instead.

---

## The catch: the thumb points the wrong way

Kornell & Bjork had participants learn paintings blocked (one artist after
another) or interleaved. Interleaved performed better on the test. Participants
nonetheless considered **blocked practice more effective** — and did so **after**
taking the test on which they had demonstrably done better with the interleaved
version.

That is not a small matter but a systematic error with a known cause: **ease
during practice is read as learning.** Precisely the techniques with the largest
effects — retrieval, spacing, interleaving ([02](02-evidence.md), E1/E2/E6) —
feel worse in the doing than their ineffective alternatives. And a follow-up
paper is titled *On the Difficulty of Mending Metacognitive Illusions*: showing
people their own contradicting data corrects the misjudgement only partly and
not at all reliably.

From that follows this chapter's central sentence:

> **The thumb measures preference, not effect. The two quantities are partly
> opposed. An algorithm optimising on thumbs ends up serving the pleasantest and
> weakest methods — which is exactly the Duolingo error
> ([01](01-duolingo.md), D1) in a new disguise.**

The thumb is valuable nonetheless. It is simply responsible for something other
than one first thinks.

---

## Two ledgers that are never netted

**[D]** The load-bearing architectural decision of this chapter:

| | **Preference** (thumb) | **Effect** (measured) |
| --- | --- | --- |
| Source | one tap after the session | level movement per hour invested, per method ([03](03-level-model.md), V3) |
| Answers | Will I do this again voluntarily? | Does it get me anywhere? |
| Governs | **Form**: timing, length, order, framing, share | **Whether at all**: selection and frequency |
| May alone cause | a method to come less often and shorter | a method to come more often |
| May **never** alone cause | a method to disappear | — |

Preference is not the weaker quantity. It decides whether any practice happens at
all, and an exercise not done has an effect size of zero. It is simply not
responsible for the question of what works.

---

## The method card

```
┌─────────────────────────────────────────────┐
│  Dictation                       ●●○  medium│
│  Listen and write along, sentence by sentence│
│                                             │
│  ⏱ 12 min      🎧 headphones + pen & paper   │
│                                             │
│  Trains        Listening ▰▰▰▰ · Writing ▰▰  │
│  mainly        the sound form of words you   │
│                so far know only in writing   │
│                                             │
│  For you       Listening grows about twice as│
│                fast in weeks with dictation  │
│                (6 weeks of data — uncertain) │
│                                             │
│  Last done     9 days ago                    │
└─────────────────────────────────────────────┘
```

Seven fields, each with a reason:

| Field | Why |
| --- | --- |
| **Intensity** ●●○ | Cognitive load, not duration. Answers "can I manage this now?" — the question most sessions founder on |
| **Duration** | Must be fixed in advance and be true ([01](01-duolingo.md), S2) |
| **Setting** | Headphones / paper / quiet / hands free. Filters brutally: half the list drops out on a bus |
| **Trains mainly** | The link to the level model. A method without a named target skill does not belong in the catalogue |
| **For you** | The measured effect — only once there is enough data, **with** an uncertainty statement |
| **Last done** | Makes neglect visible without nagging |
| *(no field)* | **No thumbs percentage.** How others rate a method is precisely the information that produces herding (Mogavi et al. 2022) |

---

## The daily menu

**[B/D]** **Three cards to choose from, not fifteen.**

Freedom of choice supports autonomy and thereby motivation
([02](02-evidence.md), E7). But the same literature says learners with little
prior knowledge or weak self-regulation are **overwhelmed** by too much choice —
which is exactly beginners. Duolingo's strength S3 was not asking at all.

Three is the compromise: real choice, no decision load. Composed by four rules:

1. **Always one low-intensity option.** Otherwise on tired days nothing gets done
   instead of something small.
2. **Always one with high measured effect**, even if it is unpopular.
3. **Context filters first, not third.** ⚠ Corrected in
   [21](21-method-catalogue-and-context.md): the order is
   **context → floor → effect → preference**. A method that cannot be performed
   right now has an effect of zero — it does not belong in the menu, not even
   greyed out.
4. **Variety across the week**, not within the day. Interleaving *within* a
   session is a task matter ([02](02-evidence.md), E6); method variety across days
   is something else and less well evidenced — **[C]**. It is here mainly because
   it creates variation and serves different skills, not because variety as such
   is demonstrated to work.

Above it, a filter that asks the actual question:

```
   How much time today?     [ 5 min ]  [ 15 min ]  [ 30 min ]
   And how much head?       [ tired ]  [  okay  ]  [ sharp  ]
```

That is more honest than a daily goal and autonomy-supporting in the sense of E7:
the user says what is possible rather than being told what they owe.

---

## What the thumb triggers

A bare thumbs-down is nearly worthless, because it can mean four completely
different things — with four different repairs:

| Follow-up (one, optional) | Repair |
| --- | --- |
| "too hard" | Material one level easier — **not** removing the method. Usually the coverage is wrong, not the method |
| "too easy" | Harder. Often a signal for "ready for the next card stage" |
| "too long" | Offer the short variant. The commonest case, and the cheapest to fix |
| "boring" | Different topic, different content, same method |
| "I don't see the point" | The explanation was missing, not the motivation |

**[D]** Only when someone rejects the same method after *all* repair attempts
does its share fall — down to its floor, never below.

And: a thumbs-up for a method that measurably moves **nothing** for this user
does not raise its share. It merely keeps it in the menu. Popularity is a right
to exist, not grounds for promotion.

---

## The floor

Your *"this is important once a week anyway"* — and the reason the whole system
does not tip over.

**[D]** Every method carries a minimum frequency that follows from its role, not
from its popularity:

| Method | Floor | Because |
| --- | --- | --- |
| Flashcards | daily | The schedule demands it; that is not a choice |
| Listening at level 1 (no transcript) | 2× / week | Otherwise there are no listening data and the listening level is guessed ([03](03-level-model.md)) |
| Free production | 1× / week | The only source of production signals — and the only exercise that exposes avoidance ([06](06-production.md)) |
| Dictation | 1× / 10 days | Finds words that exist only in writing ([07](07-offline-and-paper.md)) |
| Reading at coverage | 2× / week | Activates cards in context ([04](04-flashcards-srs.md)) |

Two properties separate a floor from nagging:

**It justifies itself.** Not *"time for your dictation!"* but:

> Dictation was due 10 days ago. It is the only exercise that reveals which words
> you read but do not hear — currently 41 of them for you.

**It negotiates over length, never over existence.** If declined, the next
question is not "please do" but:

> 6 minutes instead of 15? Or tomorrow?

That is the difference between a rule and a streak. A floor you can click away is
not one; a floor you cannot escape is controlling ([02](02-evidence.md), E7).
Shorter rather than rarer is the exit that avoids both.

**And it has a hard cap:** at most **one** floor prompt per day. A system that
flags four neglected methods in one day gets switched off.

---

## Hiding: decided **[D — user decision, 2026-08-08]**

Question 11 from [11](11-roadmap-open-questions.md) is answered: **a method may
be hidden.** Autonomy trumps completeness here — consistent with point 4 of the
persuasion question below ("do not argue").

The justification is not that A15 was wrong. It is that A15 covers a different
case: **the algorithm must not sort out by itself.** A human making an explicit
decision is different from a self-reinforcing frequency statistic. One is
autonomy, the other is impoverishment by the back door.

So that the decision stays a decision rather than becoming a click-away:

| Rule | Why |
| --- | --- |
| **Not reachable from the session flow.** Settings only, a route with friction | Hiding in frustration after a bad session is a mood, not a decision |
| **A one-off note on what it costs** — concrete and from their own data, not as a warning | "Dictation is the only exercise that finds your 41 read-only words. Without it your listening level stays an estimate." |
| **It stays visible that something is hidden.** A quiet line in the method area, not a reminder | Otherwise in six months you forget it was you and not the app |
| **Restorable at any time, without comment** | The likeliest case is that someone feels differently in three months |
| **The consequence for the level is drawn, not hidden** | Hiding every method feeding a skill gives that skill the status **"not measured"** — never a low number. Defined in [03](03-level-model.md), "The status of a skill" |

The last rule is the important one and easy to miss: hiding is **not** a reason
to keep pretending the measurement is complete. Someone who switches off
dictation and audio recall does not have a low listening level — they have
**none**.

---

## How the algorithm actually learns

**[D]** — and with an honest warning, because this is the part routinely
overstated in product descriptions.

### The statistical problem

Finding out which method works *for this one user* is hard:

- **Tiny sample.** A user might do 200 sessions a year, spread across 10 methods.
- **Massive confounders.** People with more time do the intensive methods *and*
  do more overall. The method then looks effective because diligent people choose
  it.
- **Self-selection.** People who like a method do it more attentively.
- **Slow feedback.** The effect on listening level shows over weeks, not sessions.

A naive "method X correlates with progress" is, under those conditions, almost
always self-confirmation.

### What is nonetheless possible

1. **Start from population values.** New users get the effects that hold on
   average. The personal estimate displaces those starting values gradually
   rather than replacing them on day one. While own data are thin the average
   dominates — and the app says so.
2. **Explore, not only exploit.** A fixed share of menus (on the order of 10–20 %)
   contains a method the system would **not** have chosen. Without that deliberate
   deviation there is no causal foothold, only a self-confirming loop: what is
   often suggested is often done, therefore looks effective, and is suggested more.
3. **Measure against specific signals, not the overall level.** Dictation is
   measured on audio-recall stability, not on overall progress. The narrower the
   target quantity, the less noise.
4. **Show and tolerate uncertainty.** *"6 weeks of data — still uncertain"*
   belongs on the card. A number without error bars is an invention here.

### What is not possible

Claiming the app knows after two weeks what works *for you*. It does not, and
claiming it burns exactly the trust the glass-walled schedule
([04](04-flashcards-srs.md)) builds.

---

## The info page per method **[D]**

A user idea, and it closes a gap I had missed: the method card says *what* a
method trains, but not **why it works**. That is the information that separates
"the app tells me to do dictation" from "I know what dictation is for".

There is an evidence reason too: learners explicitly taught *how* to use a method
benefit measurably more than those who work it out themselves
([02](02-evidence.md), E10) — and they arrive with wrong prior beliefs, see the
learning-styles myth in [16](16-further-findings.md), W1.

Six sections, and the fourth is the important one:

| Section | Content |
| --- | --- |
| **What it is** | One sentence, no jargon |
| **Why it works** | The mechanism. Not "it helps your listening" but "it forces attention onto sound form, which is what you lack for words you know only from reading" |
| **How sure we are** | The same **[A]–[D]** mark as in this study, with one sentence on what it rests on |
| **What it does *not* do** | The limits. Dictation improves encoding, not retention ([02](02-evidence.md), E9) |
| **Variants** | Your idea: shorter, harder, with other people, on paper, on the move |
| **What you need for it** | Setting, duration, materials |

**The rule that separates an info page from advertising:** the "what it does not
do" section is **mandatory**. A page that only sells a method is an
advertisement with footnotes — and it damages exactly the trust the glass-walled
schedule builds.

For honesty: showing people the evidence corrects their misjudgement only partly
([02](02-evidence.md), E13). The info page is right nonetheless — not because it
reliably persuades, but because the alternative behaviour, "just trust us", is
not available to a product with these honesty rules.

---

## Methods beyond the app **[D]**

The second part of the user idea, and it changes what this product is.

> *"What bothers me is that a lot of apps only ever say: hey, learn with this
> app."*

The method catalogue also contains **methods the app does not itself run**.
Writing and performing a play. Finding a tandem partner. Cooking from a recipe in
the target language. Keeping a diary in it for a week. Watching a film with
friends who speak it.

For these the app does three things — and explicitly not a fourth:

| | |
| --- | --- |
| **Propose** | As a full method card, with info page and evidence grade like any other. Drama has evidence ([20](20-speaking-and-sentences.md), S5) |
| **Prepare** | The vocabulary, the phrases, the sheet for the occasion — the mechanism from [07](07-offline-and-paper.md), Ü5 and UC-026 |
| **Debrief** | "What could you not say?" → cards. The highest-value card source there is, because the need is demonstrated |
| **Not: measure** | It claims no number about something it did not observe |

### The trap that creates

And it is serious: in this chapter **measured effect** governs selection. A method
that cannot be measured has no effect estimate — and would therefore be sorted
structurally downwards. That is the same mechanism as
[01](01-duolingo.md), D1: **what is measurable displaces what counts.**

**Solution:** methods beyond the app hold their position through a **floor**, not
through an effect estimate. Their presence in the menu is a stipulation, not a
derivation — and that stipulation is precisely the statement that the app is not
the whole thing.

Self-reported completion is marked **self-reported** and does not feed layer 1 of
the level model ([03](03-level-model.md)). Someone who spends a month doing
theatre and barely opens the app sees no growth there — and the app says so
honestly rather than claiming or concealing it.

### Why this is more than modesty

Three reasons beyond likeability:

1. **It is honest.** No app makes anyone fluent. Claiming otherwise is the
   industry's founding untruth.
2. **It supports autonomy** ([02](02-evidence.md), E7) and the ideal self
   ([16](16-further-findings.md), W4). "You could put on a play" is an ideal-self
   statement; "you have not learned today" is the opposite.
3. **It is the structural antidote** to the vocabulary pull this study diagnosed
   in itself: vocabulary is the easiest thing to measure, so the product drifts
   there. A catalogue that contains the unmeasurable with its own floor works
   against that, at the point where it counts.

---

## The persuasion question

What do you do with someone who hates dictation although their data say it moves
the most for them?

The obvious move is to show them the data. That is right and honest — and the
*Mending Illusions* work says it works only to a limited extent. The
misjudgement holds even against personally experienced counter-evidence.

**[D]** So, in this order:

1. **Lower friction, do not argue.** Shorter, better timed, more interesting
   content, paired with a liked method. Most "I hate X" cases are really "X takes
   too long and comes at the wrong time".
2. **Show the data once**, calmly and without a demand. Once, not weekly.
3. **Hold the floor** and let the rest go.
4. **Do not persuade.** A user who deletes the app over the nagging does zero
   dictations. That is worse than one every ten days.

---

## What goes into a spec

- A method as a catalogue entry with a fixed structure: target skill, target
  signal, intensity, duration variants, setting requirements, floor. A method
  without a named target signal cannot be admitted — otherwise its effect is by
  definition unmeasurable.
- Menu composition as a pure function of (daily budget, context, floor state,
  effect estimate, preference, exploration share) — testable without a user
  interface, and the place where the four rules above become checkable.
- The cap: at most one floor prompt per day, system-wide.
- **Sensitive:** preference and effect are stored separately and never netted
  into one value. The moment they land in one number the distinction is gone and
  nobody notices.
