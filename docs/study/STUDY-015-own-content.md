# 17 · Own content: podcasts, uploaded texts, simplification

<!-- id: STUDY-015 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-027, UC-028, UC-029, UC-030 -->

## Thesis

Learner-owned content is essential — with honest limits on simplification and rights.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

**Owner correction 2026-08-20:** for **catalogue topic news** (politics, daily),
**level-targeted adaptation** (*"this article at A2"*) is the **primary** path —
not the support ladder's last rung. Ladder remains for learner uploads they want
unadapted. See [`archive/ARCH-046-method-length-and-level-matched-content.md`](archive/ARCH-046-method-length-and-level-matched-content.md)
and UC-030.

Your ideas: pick from a set of audio (podcasts) and practise with it; upload a
text, have sentences translated, check it against your level first and simplify
if needed.

You asked for criticism. The short version: **the basic idea is right and solves
the project's biggest content problem. Two of the three implementations you
proposed I would build differently** — one because there is no evidence for it,
and one because it destroys the thing you picked the text for.

---

## Why the basic idea is strong

[15](STUDY-013-landscape.md) names as a real risk that we compete against specialists
with real content while having only generated material ourselves. Own content
reverses that: **the user brings the content.** That is cheaper than any
editorial operation, it solves the licensing problem (private use), and it hits
their interests better than any curated catalogue.

It also fits question 1 exactly (a tool for you first): a catalogue would be
editorial work; an RSS feed and a file upload are not.

**Consequence [D]:** we build **no podcast catalogue**. We build intake of
*your* sources — RSS, file, link. Our own catalogue is the expensive version of
the same idea and adds nothing didactically.

---

## The problem nobody likes to state

Real podcasts sit **far** above any learner's level. Where
[05](STUDY-005-input-reading-listening.md) requires 95–98 % known words, a normal
podcast delivers 70–85 % for a B1 learner. That is not a detail: at 80 %
coverage every fifth word is unknown, and comprehension collapses.

The common answer — "just listen a lot, it will come" — is exactly the sort of
untestable claim [02](STUDY-002-evidence.md), E4 criticises in Krashen. But there are
three evidenced ways out, and the trick is to combine them rather than believe
one.

### A1 · The unit is the passage, not the podcast

With a transcript we can compute coverage **per minute** rather than per episode.
An episode at 78 % overall coverage almost always contains passages at 92–95 % —
small talk, repetitions, the intro. The app proposes **the passage**, not the
episode.

That is the single most important thought in this chapter and it costs nothing
extra: the coverage calculator (F29) already exists; it merely has to run over a
window rather than a document.

### A2 · Narrow listening **[B]**

Several episodes of **the same series, the same speaker, the same topic**. The
vocabulary repeats, world knowledge carries over, and perceived difficulty drops
noticeably without the material getting easier. For podcasts this is especially
cheap, because a series is naturally exactly that.

### A3 · Repeated listening — with an honest caveat **[B]**

Hearing the same episode several times is demonstrably effective: it improves
picking out important content and overall comprehension. But the studies just as
consistently report that learners find it **boring**.

That is a textbook case for [12](STUDY-010-method-cards.md): effective and unpopular. So
it belongs there — with a floor, with a reason drawn from the learner's own data,
and with the escape route being length rather than existence. Not in a playback
loop nobody switches on.

**Concretely:** not the same episode three times in a row, but a ladder of
decreasing support — pass 1 with translation, pass 2 with transcript only, pass 3
audio alone. The same material, a different task each time. That is the
visibility level from [05](STUDY-005-input-reading-listening.md), unfolded over time.

---

## Your exercise idea: "correcting text" — here I disagree

You proposed "where you correct text, for example" as a method. I searched for it
and found **no evidence** that correcting someone else's or a machine's
transcript improves listening comprehension. It is plausible, it feels active —
and that is exactly the pattern [02](STUDY-002-evidence.md), E13 warns about.

**What is evidenced instead and looks almost identical: partial dictation.** You
get the transcript with gaps and fill them while listening. A study with
intermediate learners found a mean gain of 5.3 points for the dictation group
against 0.33 for controls, and in a head-to-head comparison partial dictation
even slightly outperformed dictogloss.

Why that is better than correcting:

| | Correcting a transcript | Partial dictation |
| --- | --- | --- |
| Requires a retrieval attempt? | no — you read and compare | **yes**, for every gap ([02](STUDY-002-evidence.md), E1) |
| Where is attention? | on the text | on the **sound** — the very skill being trained |
| What comes out of it? | nothing measurable | every wrong gap is a card |
| Effort for us | inserting errors artificially | setting gaps — **which we choose deliberately** |

The last point is the real gain: gaps are **not random**. They target words you
know in writing but whose sound form is not yet secure
([04](STUDY-004-flashcards-srs.md), audio recall) and words containing an unsolved
phonetic contrast ([13](STUDY-011-pronunciation-perception.md)). That turns a generic
exercise into a diagnosis.

---

## Uploading text

The uncontroversial part. File or link in, coverage computed, tap-to-translate
as in [05](STUDY-005-input-reading-listening.md), unknown words become cards.

Two points that must be in the spec:

- **The text stays local** as far as possible. An uploaded text may be an
  employment contract. [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 applies, and
  "I send it to an LLM for analysis" is a decision the user must see and make —
  not a default.
- **Coverage before opening**, like everything else (F30). An uploaded text is not
  a special case; it is a text with a different origin.

---

## Simplification — where I am most critical

Your idea: check the text, and if it is too hard, have it simplified. That sounds
obviously right and is the weakest idea in your message.

**The evidence is mixed.** Simplification improves literal comprehension — that
is established. But it removes precisely the features you picked a real text
for: idiom, register, complex syntax, the way the language is actually used. You
understand more of a text that contains less.

The alternative from the literature is **elaboration** (Long): *keep* the
original text and add redundancy — paraphrase, explanation, restatement. The
argument is that elaborated and especially "modified elaborated" input is the
better option, because it supports comprehension without clearing away the
language.

On top of that comes a risk from this study itself: an LLM simplification can
introduce errors the learner **structurally cannot notice** — they are learning
the language ([10](STUDY-009-antipatterns.md), A5).

### Hence: a support ladder rather than a rewrite **[D]**

```
  Rung 0   Original, nothing added
  Rung 1   Original + the 5–10 gap words pre-taught          ← pre-teaching
  Rung 2   Original + marginal glosses, sentence translation on tap
  Rung 3   Original + inserted paraphrase (elaboration)      ← text stays whole
  Rung 4   Rewritten, simplified version                     ← last rung
```

The app proposes the **lowest** rung that brings coverage into the 95–98 % band.
Rung 4 is not forbidden — it is merely not the first reach, and it is labelled as
*a different version*, not as the text.

And the simplification is **targeted**: not "make this A2" but "replace the words
*this* user does not know and leave the syntax alone". Generic level
simplification also throws away what they already had.

---

## What goes into a spec

- Coverage over a **sliding window** rather than a document (A1) — a change to
  the stage-3 coverage calculator, not a new component.
- Gap selection for partial dictation as a named rule: audio-recall gap, unsolved
  contrast, recently learned. Random gaps are explicitly wrong.
- Transcript sourcing: shipped, generated by ASR, or none. Without a transcript
  an audio item is **unusable** for us — no coverage calculator, no dictation, no
  sentence-level voice commands. That belongs stated clearly before anyone writes
  "support podcasts" into a spec.
- Origin and processing location of every uploaded item, visible.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-027 — [use-cases/README.md](../use-cases/README.md)
- UC-028 — [use-cases/README.md](../use-cases/README.md)
- UC-029 — [use-cases/README.md](../use-cases/README.md)
- UC-030 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
