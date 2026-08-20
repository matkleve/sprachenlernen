# 21 · The method catalogue and the learning context

<!-- id: STUDY-019 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-045, UC-046, UC-047, UC-048, UC-057 -->

## Thesis

Context filters run before floor and effect; methods without context requirements are refused.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

[12](STUDY-010-method-cards.md) describes the **mechanism** — how selection works, what
the thumb does, what floors are for. It does not describe **what is actually in
the catalogue**. This chapter fills that in, and it corrects a simplification:
"setting" was a field with four values. The learning context is the wrong word
for something that governs selection more than anything else does.

---

## Why apps avoid the hard methods

The user named it: *"there are countless methods that language apps may not have
considered or want to avoid because they are hard."*

That is not an oversight; it follows from the business model. A method that is

- **slow** (dictation: ten minutes for six sentences),
- **error-producing** (free production: half of it is wrong),
- **unmeasurable** (reading a book),
- **outside the app** (talking to people),
- or **boring** (hearing the same piece three times),

lowers every metric an engagement-optimised app tracks: sessions per day, error
rate, time spent *in the app*. No product measured on return can offer them — not
out of malice, but because it would damage itself ([01](STUDY-001-duolingo.md), D1).

**That is our position.** If progress hangs on measured competence rather than
activity, the contradiction disappears. The hard methods are in the catalogue not
despite their hardness but because of it: they are what nobody else can offer.

> And that is exactly why the **floor** from [12](STUDY-010-method-cards.md) is the
> load-bearing mechanism of the whole product. Without it our catalogue also
> converges on the pleasant — just more slowly.
>
> Note what the floor does and does not bound (corrected 2026-08-08): it is a
> lower bound on how often a method is **offered**, which is what stops the
> convergence. It is not a lower bound on what the learner does. Declining is
> always available and costs nothing but the ability to measure that skill.

---

## The learning context is not a preference

Your second observation: *"at home I can get writing materials out and do
dictation, on the move less so, at the computer it is easier to fill in words."*

That matters more than the "setting" field represents, for a simple reason:

> **A perfect method you cannot perform right now has an effect of zero.**
> Context beats effect and preference — not because it is more important, but
> because it comes first.

That changes the ordering in the daily menu ([12](STUDY-010-method-cards.md)):
**filter by context first, then floor, then effect, then preference.** Previously
context sat third. That was wrong.

> **What this does not license, added 2026-08-08 by
> [26](STUDY-024-readiness-and-difficulty.md).** Context removes a method because the
> learner *cannot* perform it — no paper, no voice, two minutes. **Readiness** is a
> different quantity that looks superficially like it: whether the app can build
> material at a sensible band right now. Readiness never removes and never blocks;
> it demotes and annotates. Reading the two as one filter is how a context rule
> ("not performable") turns into a gate ("not permitted"), which is what the whole
> of chapter 26 exists to prevent.

### The context dimensions **[D]**

Not "where are you" but **what is available right now**:

| Dimension | Values |
| --- | --- |
| **Eyes** | free · occupied (walking, cooking, driving) |
| **Hands** | free · one · none |
| **Voice** | can speak aloud · only quietly · not at all |
| **Writing surface** | paper & pen · keyboard · touch only · none |
| **Sound** | speaker · headphones · silent |
| **Attention** | full · divided · fragmented |
| **Time** | 2 min · 15 min · 45 min · open |
| **Company** | alone · with people who speak the language · with people who do not |

### Which of these do you actually ask about? **[D]**

Eight dimensions are the model, not the interface. Asking eight questions before
someone may learn rebuilds the barrier to entry from [01](STUDY-001-duolingo.md), S1.

Checking the catalogue below for which dimensions actually **separate** leaves
four:

| Question | Why it separates |
| --- | --- |
| **How much time?** | Separates the two-minute cards from dictation and long sessions |
| **Eyes free?** | The sharpest boundary of all: pure audio against everything else |
| **Can you speak aloud?** | Separates the entire speaking section — and is otherwise never asked |
| **What do you write on?** paper · keyboard · touch only · nothing | Separates dictation, paradigm tables and handwriting from tapping exercises |

The other four drop out, for reasons:

- **Hands** is nearly identical to *writing surface* — no hands means no surface.
  Redundant.
- **Sound** is rarely the blocker; headphones are usually present. Stored as a
  property of the preset, not asked.
- **Attention** overlaps with intensity, and people judge their own attention
  badly. It effectively sits inside "how much time".
- **Company** concerns only a handful of methods. Not a standard field but a
  switch you **turn on** when you have people with you — which then opens a part
  of the catalogue you otherwise never see.

Four questions are still three too many for daily use. So they are asked **once**
and stored as a named preset:

```
  At the desk       eyes free · hands free · aloud · paper · open
  Walking           eyes busy · hands free · aloud · nothing · 15 min
  On transit        eyes free · one hand · silent · touch · 15 min
  At the computer   eyes free · hands free · quiet · keyboard · 15 min
  In bed            eyes free · one hand · quiet · nothing · 15 min
  Waiting           fragmented · one hand · silent · touch · 2 min
  Kitchen           eyes busy · hands busy · aloud · nothing · 45 min
```

**The kitchen is the interesting case.** Eyes and hands gone, but voice free and
plenty of time — the best context for an audiobook with voice commands
([05](STUDY-005-input-reading-listening.md)), shadowing and self-talk, and the worst for
everything else this app does. An app that only knows touch exercises has nothing
for the most productive forty-five minutes of the day.

Day to day it is therefore **one tap on "kitchen"**, not four questions. The four
questions appear only when creating a new preset or deliberately deviating.

**[D]** Context is **tapped, not sniffed out.** No location, no motion sensor, no
time-of-day profiling. The user says in one tap where they are; that is faster
than any detection and demands no access to their life.

---

## Favourites, and what data actually achieve here

User question: create favourites — or rather ask which method you like, and
compare that with learning success?

**Both, and it is exactly the two-ledger architecture from
[12](STUDY-010-method-cards.md).** A favourites list is a clean interface for the
**preference** ledger: explicit, changeable at any time, and the user knows what
they are doing — considerably more honest than preferences inferred from click
behaviour. It therefore governs **form and share**, never selection alone
([10](STUDY-009-antipatterns.md), A15).

The comparison with learning success is the whole point of the second ledger.
Three limitations belong with it, and they are uncomfortable:

1. **With one user the effect estimate is noise for months.** Tiny sample, massive
   confounders, slow feedback ([12](STUDY-010-method-cards.md), "How the algorithm
   actually learns"). For a tool for one person, the value of the data is above
   all **retrospect for you**, not model fitting.
2. **Without an exploration share the estimate is a loop** that confirms itself:
   what is suggested often is done often, looks effective, is suggested more (F95).
3. **The moment other people's data are involved it is a different regime.** While
   the app is yours, "collecting data" means "keeping your own history". The moment
   other people generate it, purpose limitation, consent and
   [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 apply — and whether a method
   rating needs to leave the device at all becomes a decision rather than an
   assumption.

> **[D]** Therefore: effect data are collected and evaluated **locally**.
> Aggregation across several people — which would be needed for population values
> — is a separate, explicitly obtained decision, not the default. That is question
> 1 from [11](../backlog/BL-011-roadmap-open-questions.md) in concrete form.

---

## The catalogue

Every method declares its requirements against the dimensions above. What follows
is the starting list — deliberately longer than what gets built, so that cutting
is a decision rather than an omission.

Marks as in [README](README.md). "Hard" means: avoided by engagement-optimised
apps.

### Reading

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| Extensive reading at coverage | reading, incidental vocabulary | eyes free | A | |
| Narrow reading (4–6 texts, one topic) | the same, faster | eyes free | B | |
| Intensive reading (one paragraph, exhaustively) | form, precision | eyes free, full | B | **hard** |
| Reading aloud | pronunciation, flow, segmentation | voice free | B | |
| Reading + listening simultaneously | listening, segmentation | eyes free, sound | B | |
| Re-reading something too hard months ago | competence moment | eyes free | D | |
| Parallel text (L1 beside L2) | structure, idiom | eyes free | C | |
| Reading a book you know in your own language | comprehension without a dictionary | eyes free, open | C | **hard** |

### Listening

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| Listening at level 1 (no transcript) | listening | sound, eyes irrelevant | B | **hard** |
| Narrow listening (one series, one speaker) | listening | sound | B | |
| Repeated listening with support removal | listening | sound | B | **hard** |
| Partial dictation | sound form, audio recall | sound + keyboard | B | **hard** |
| Full dictation on paper | sound form, orthography | sound + paper, full | B | **hard** |
| Dictogloss (reconstruct rather than transcribe) | listening + grammar | sound + paper, full | B | **hard** |
| Listening faster (1.25×) | processing speed | sound | C | |
| Background listening with no task | little | any | **C, weak** | honestly: barely any yield |

### Speaking

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| 4/3/2 | fluency | voice free | B | |
| Shadowing | prosody, flow | voice + sound | B | |
| Retelling what you just read | production, input→output link | voice free | B | **hard** |
| Self-talk: describe what you see | fluency under time pressure | voice free, eyes irrelevant | C | **hard** |
| Describing a picture | open vocabulary | voice + eyes | C | |
| A voice message to a real person | genuine communication | voice free | D | **hard** |
| Role play / drama | speaking without anxiety | company | B | **hard** |
| Reciting a memorised poem or monologue | prosody, chunks | voice free | C | **hard** |
| Singing along | prosody, chunks | voice + sound | C | |
| Interpreting for someone | everything at once | company | D | **very hard** |

### Writing

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| Build a sentence with a target word | production recall | keyboard/touch | A | |
| Diary, three sentences | genuine communicative intent | keyboard | B | |
| Summarising what you read | input→output | keyboard, full | B | **hard** |
| Back-translation with comparison | structure, makes avoidance visible | keyboard, full | B | **hard** |
| Copying out a good paragraph | orthography, phrases | paper | C | **hard** |
| Rewriting a text in your own words | reformulation | keyboard, full | C | **hard** |
| Captioning your own photos | vocabulary with a connection | touch | D | |
| Translating a song | idiom | keyboard, open | D | |
| Writing and performing a play | everything | open, company | B/C | **very hard** |

### Form and accuracy

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| Paradigm tables, **mixed** | automatisation ([03](STUDY-003-level-model.md)) | paper or keyboard | A | **hard** |
| Minimal pairs / HVPT | perception | headphones | A | |
| Cloze sentences | form in context | touch | A | |
| Sentence transformation (tense, negation, person) | flexibility | keyboard | B | **hard** |
| Working through your own error log | your own patterns | eyes free | C | **hard** |
| Rule explanation at the point of error | understanding | eyes free | A | |

### Vocabulary

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| SRS session | retention | touch or voice | A | |
| Audio cards, operable blind | retention on the move | sound + voice | B | |
| Mining sentences from your own content | demonstrated need | eyes free | C | |
| Collocation cards rather than single words | fluency | touch | B | |
| Sticky notes around the flat | everyday vocabulary | at home | C | |
| Closing a frequency block deliberately | coverage ([19](STUDY-017-milestones-and-map.md)) | touch | A | |
| Handwriting sheet of the 20 shakiest cards | encoding | paper | B | **hard** |

### Out in the world

| Method | Trains | Context | Ev. | |
| --- | --- | --- | --- | --- |
| Cooking from a recipe in the language | comprehension with consequences | kitchen | D | |
| Switching your phone's language | incidental everyday vocabulary | any | D | |
| Pursuing a hobby in the target language | everything, voluntarily | open | D | |
| A video game in the target language | reading under pressure | open | C | |
| Tandem / language café | real interaction | company | B | **hard** |
| Ordering, asking, complaining | the real thing | outdoors | D | **hard** |
| Watching a film you know by heart | listening with a safety net | sound + eyes | C | |

---

## What follows for the product

1. **The catalogue is data, not code.** A method is an entry with a target
   signal, context requirements, duration variants, a floor and an info page
   ([12](STUDY-010-method-cards.md)). Adding methods must not be development work — or
   the catalogue stops at ten entries.
2. **Context filters first.** Menu order: context → floor → effect → preference.
3. **About half the catalogue happens outside the app** and is not measured
   ([12](STUDY-010-method-cards.md), thesis 9). That is deliberate.
4. **"Hard" is labelled, not hidden.** Intensity is on the card, and the info page
   says why the effort is worth it.
5. **The weak methods are in there too** — background listening with an honest
   "barely any yield". Omitting something users ask about only produces the
   question again; including and placing it answers it.

## What goes into a spec

- The context model as **eight dimensions plus named presets**, where presets are
  editable and users can create their own.
- The method entry as a validated schema — a method without context requirements
  cannot be admitted, or it appears everywhere and filtering becomes worthless.
- When no catalogue entry fits the current context, the product must name the gap
  rather than show an unsuitable menu — see
  [`method-catalogue.md`](../specs/service/method-catalogue.md) (`## Open`).

**Corrected 2026-08-08 by [24](STUDY-022-speaking-as-the-goal.md) S4.** Everything above
assumes a catalogue entry is a **session** — duration, context, completion. That
excluded the highest-leverage entries there are: standing rules like *write to
one friend only in Italian*, which have no duration and no completion. The
catalogue therefore holds **two entry types**, and the schema has to admit both:
`method` (a session) and `commitment` (a standing rule, active or inactive, with
no completion tracking and no streak).

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-045 — [use-cases/README.md](../use-cases/README.md)
- UC-046 — [use-cases/README.md](../use-cases/README.md)
- UC-047 — [use-cases/README.md](../use-cases/README.md)
- UC-048 — [use-cases/README.md](../use-cases/README.md)
- UC-057 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
