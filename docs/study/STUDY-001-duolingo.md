# 01 · Duolingo: what works, what does not, and why

<!-- id: STUDY-001 -->
<!-- type: reasoning -->
<!-- status: active -->

## Thesis

Duolingo's strength is habit; its weakness is optimizing return instead of measured competence.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

Duolingo is the yardstick this app is measured against — not because it is the
best way to learn, but because it is the only one millions of people voluntarily
use every day. That is a real achievement, and ignoring it builds a more correct
app that nobody opens.

The criticism here is therefore ordered on one principle: **first what we copy,
then what we do differently.** Reading only the weakness list draws the wrong
lesson.

---

## Part 1: The strengths — not negotiable

### S1 · The barrier to entry is effectively zero **[A]**

No purchase, no placement test, no textbook, no decision about method. You tap
"Spanish" and you are learning twenty seconds later. Every step we put between
"app opened" and "first exercise" costs a share of users permanently.

**For us:** the placement test ([03](STUDY-003-level-model.md)) must **not** come
before the first exercise. Learn first, then place — or better: the learning *is*
the placement.

### S2 · Sessions are short and have a visible end **[A]**

A lesson takes two to five minutes and you can see from the start how far it is.
That is the difference between "I'll quickly do one more" and "I should get back
to vocabulary some time". The goal-gradient effect — effort rises as the end
becomes visible — is among the most robust motivational findings there is.

**For us:** every exercise has a fixed length, visible in advance. An SRS pile
reading "347 cards due" is the exact opposite, and it is the main reason Anki
users quit (see [04](STUDY-004-flashcards-srs.md), "The backlog trap").

### S3 · It decides for you **[B]**

Duolingo never asks "which words would you like to learn?". For beginners that
is a blessing: decision load is where self-directed projects die. Anki is more
powerful and therefore unusable for most people — you have to learn card design
before you can learn Spanish.

**For us:** defaults must hold without anyone understanding them.
Configurability is a reward for advanced users, not a precondition. This is also
the antidote to the typical flashcard app: we **ship finished,
frequency-ordered decks per level** rather than handing over empty piles.

### S4 · Practice is productive by default, not receptive **[A]**

Duolingo makes you type, not tick — often enough, at least. That is the right
call psychologically and it is handled worse in many competing products.
Multiple-choice recognition overestimates real knowledge relative to gap-fill
tests by roughly 20 % (see [02](STUDY-002-evidence.md), E3).

**For us:** production is the default task; recognition is an entry rung for
brand-new cards only.

### S5 · It measures itself in public **[B]**

Duolingo publishes efficacy studies. The best known (Jiang et al. 2021) reports
that after the first five units of Spanish or French, learners' **reading and
listening** were comparable to four semesters of US university instruction.

That is a real result — and it carries four caveats that must be stated,
because they are typical of the whole field:

1. Conducted by internal researchers with external co-authorship.
2. **No pre-test** — starting competence was self-reported, not measured.
3. **Receptive skills only.** Speaking and writing were not tested.
4. It measured people who **completed** the units. That is the most successful
   subgroup; those who dropped out do not appear in the figure.

**For us:** we adopt the practice of measuring ourselves, but with a pre-test
and including the dropouts. See [11](../backlog/BL-011-roadmap-open-questions.md), "How we will
know whether the app works".

---

## Part 2: The weaknesses

### D1 · It optimises for return, not competence **[A — structural]**

This is the core finding, and everything below is a symptom of it. Streaks, XP,
leagues and push notifications are metrics for *session frequency*. None of them
stands in a demonstrated relationship to language competence. A user with a
900-day streak and twenty seconds a day has a perfect metric and no Spanish.

Mogavi et al. (2022, ACM Learning@Scale) — nine years of forum analysis plus 15
interviews — call this **"gamification misuse"**: users fixate on the game
mechanics and are *distracted* from learning. They identify competitiveness,
overindulgence in playfulness and herding as drivers, with compulsion and
perceived unfairness as amplifiers.

The concrete behaviours are familiar to any user:

- Repeating the easiest lesson because it maximises XP per minute.
- Buying a "streak freeze" instead of learning — the metric is purchased
  directly.
- Avoiding progress, because new material raises the error rate and lowers
  league standing. **The system punishes learning.**

> **Consequence for us:** any number we display prominently will be optimised.
> So only what is useful to optimise may be prominent. No streak in first place.
> See [08](STUDY-008-motivation.md).

### D2 · The practice plan is a path, not a memory model **[A]**

Duolingo does repeat material, but the order follows primarily from course
structure and internal heuristics rather than from a per-card memory model with
an explainable due date. The user cannot see *why* a word comes up now, when it
will return, or what they actually know stably.

For a product whose only durable benefit is "I will not forget it", that is the
most expensive omission. A memory model you can look at is this app's central
difference. See [04](STUDY-004-flashcards-srs.md).

### D3 · Too little context and too little explanation **[B]**

A recurring finding in the literature (including Van Deusen-Scholl & Friend
2019): Duolingo does not provide enough context or explanation for learners to
genuinely understand a new concept. Grammar appears implicitly, through pattern
exposure — and that is exactly where the evidence against the implicit approach
is clearest: Norris & Ortega (2000) and subsequent meta-analyses find **explicit
instruction more effective than implicit**, with durable effects.

The second half of the problem is the sentences themselves. Isolated, often
absurd sentences ("The bear drinks beer") are memorable but build no expectation
of how the language is actually used. What is missing is connected discourse —
precisely the material from which listening comprehension and reading speed grow.

**For us:** grammar gets short, explicit explanations *on demand* at the point
of error (not as a lecture up front), and input consists of connected texts
rather than sentence confetti. See [05](STUDY-005-input-reading-listening.md) and
[07](STUDY-007-offline-and-paper.md).

### D4 · Barely any real production, and pronunciation feedback you cannot trust **[B]**

Speaking in Duolingo means repeating a given sentence and receiving a binary
verdict. Loewen & Sato (2018) found the speech recognition inaccurate enough to
hinder rather than help pronunciation development. Inaccurate pronunciation
feedback is worse than none: it confirms errors and undermines trust in every
other signal the app gives.

Free production — forming your own thought, failing, being corrected — barely
happens. That is the skill most people learn a language for in the first place.

**For us:** honest uncertainty ("that was hard to make out, again?") beats a
green-tick lie. See [06](STUDY-006-production.md).

### D5 · No model of where the learner stands **[A]**

Duolingo shows XP, crown levels and course progress. None of that answers the
question every learner actually has: *what level am I, and am I improving?*
Course progress measures content traversed, and content you have passed through
is not content you know.

**For us:** this is the core of your idea and the second major difference. See
[03](STUDY-003-level-model.md).

### D6 · The content shrinks while the game layer grows **[C — trajectory]**

Over the years the explanatory and communal parts have gone (sentence discussion
forums, "Immersion", detailed grammar notes) while leagues, chests, hearts and
wagers expanded. This is not clumsiness but the consistent consequence of D1:
what is measured is return, so what grows is whatever produces return.

Since 2024/25, AI content generation has been added. Duolingo announced an
"AI-first" strategy in April 2025; the memo said the company could not wait for
the technology to be perfect and would take "occasional small hits on quality".
Roughly a tenth of contractors — mostly translators and exercise authors — had
already been cut. After a strong reaction the company walked the messaging back.

**For us:** we will use AI-generated content — material at every level for every
language is not financeable otherwise. But the lesson of D6 is that this creates
a **quality obligation**, not a saving: generated sentences and texts need
automatic checks against frequency and level criteria, and a visible way to
report errors. See [10](STUDY-009-antipatterns.md), A5.

### D7 · One course for every source language and every goal **[C]**

Duolingo's courses are built largely independently of the language pair. But for
a German speaker learning Italian, quite different things are hard than for an
English speaker. And someone about to work in Rome for three months needs
different vocabulary from someone who wants to read Dante.

**For us:** at least the card selection should be attachable to a goal (travel /
work / exam / reading). That is cheap, because it is only a different frequency
list. See [09](../backlog/BL-009-feature-catalogue.md), F14.

---

## The summary in one sentence

Duolingo solved the behaviour problem (people come back) and left the learning
problem open (they come back to collect points). This app tries to adopt the
behavioural solution and attach the reward to **measured competence** rather
than activity — that is the entire product idea in one sentence, and everything
else is execution.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- Normative contracts: [specs/README.md](../specs/README.md)
