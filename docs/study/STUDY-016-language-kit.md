# 18 · The language kit: any language, honestly graded

<!-- id: STUDY-016 -->
<!-- type: correction -->
<!-- status: active -->
<!-- spawns: UC-035, UC-036, UC-037, UC-040 -->

## Thesis

Each language is code plus data, shipped with an honest quality tier — never implied fluency.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

Your question: *"How different can it really be whether I learn Spanish,
Italian, Norwegian or German? Just fix it and then automatic translators / AI set
the course up. I don't know, maybe I'm dreaming."*

**You are not dreaming.** The answer is roughly 80 % yes, and the remaining 20 %
is very concretely nameable. Under question 2 I gave the impression that
languages are uniformly expensive — that was too coarse, and this chapter
corrects it.

---

## The decisive split: code or data?

Almost everything that makes up this app is **language-independent code**:

| Language-independent (built once) | Needed per language (data, not code) |
| --- | --- |
| Scheduler, FSRS, task model ([ADR-0004](../adr/0004-word-task-data-model.md)) | Frequency list |
| Coverage calculator, level model, skill status | Lemmatiser model |
| Method engine, floors, daily menu | CEFR calibration |
| Review horizon, atlas, milestone map | TTS voice(s) |
| Dictation, partial dictation, reading surface, player | Starter decks |
| The entire interface | — |
| | **Per language *pair*:** contrast list (HVPT), translation quality |

That is the good news: **a language profile is a data file, not a module.**
Adding a language means filling in six fields — not extending the app.

---

## What the tooling actually provides

I described lemmatisation as expensive. That is no longer accurate:

**Stanza** (Stanford NLP) covers over **70 languages** with a uniform
architecture following the Universal Dependencies scheme — tokenisation,
multiword-token expansion, POS and morphological tagging, lemmatisation. Across
100 UD treebanks in 66 languages it performs consistently better than or equal to
UDPipe and spaCy, whose multilingual coverage is considerably narrower and uneven
across language families.

Frequency lists exist from open corpora (subtitles, Wikipedia) for most of those
languages. Usable TTS likewise.

**So:** for around 70 languages the basic equipment is obtainable without anyone
doing linguistics. That is the part of your dream that is simply true.

---

## Where it genuinely differs — and why

Not all languages cost the same, but the dividing line runs elsewhere than one
expects. **Norwegian is morphologically simpler than Spanish.** Your intuition is
right for European languages; it breaks on exactly four properties:

### U1 · What counts as "one word"? — the most expensive difference

The whole level model rests on "known words, counted against frequency rank"
([03](STUDY-003-level-model.md)). That quantity does not mean the same thing in every
language:

| | Example | Consequence |
| --- | --- | --- |
| **Fusional** | Spanish, Italian, German | ~50 verb forms per lemma. Lemma counting works |
| **Weakly inflecting** | Norwegian, English, Dutch | Simplest case. Forms ≈ lemmas |
| **Agglutinative** | Finnish, Turkish, Hungarian | Thousands of forms per lemma. "Vocabulary size" is a **different concept** — the CEFR anchors from [03](STUDY-003-level-model.md) do not transfer |
| **Isolating + segmentation** | Chinese, Japanese, Thai | **No word boundaries in the text.** Tokenisation is itself a model, and the coverage calculator depends on it |

That is the point where "just fix it and let the AI do the rest" genuinely fails
— not on effort, but because the **measured quantity changes its meaning**. A
Finnish learner with "2,000 words" is not where a Spanish learner with 2,000 is.

### U2 · Script

Cyrillic, Greek, Arabic, Hebrew, CJK, Devanagari. This affects card input
(keyboard), handwriting exercises ([07](STUDY-007-offline-and-paper.md), where the
evidence is strongest precisely here), typography — and, for Arabic and Hebrew,
that the vowels **are not written at all** in normal text.

### U3 · Sound system relative to the source language

The HVPT contrast list ([13](STUDY-011-pronunciation-perception.md)) is **per pair**,
not per language. German → Spanish has few hard contrasts; German → Chinese has
tone, a feature that carries no meaning in German at all. Effort grows with the
number of pairs, not of languages.

### U4 · Translation quality

Machine translation German ↔ Spanish is excellent. German ↔ Icelandic or
Georgian considerably worse. Since translation is the *meaning side of every
card*, poor MT strikes directly at learning quality.

---

## The language profile **[D]**

One declarative file per language. None of them contains code:

```
  language           it
  script             latin
  morphology         fusional
  countingUnit       lemma            ← what "one word" means here (U1)
  frequency          source + version
  lemmatiser         stanza:it
  cefrCalibration    anchors per level, dated   ← [03], honesty rule 4
  voices             voice ids
  qualityTier        A
```

Plus one file per **pair** (de→it) for the contrast list and translation quality.

---

## The quality tier — and why it must be visible

Here is the critical part of your idea. "The AI sets up the course" is exactly
what [01](STUDY-001-duolingo.md), D6 describes and what
[10](STUDY-009-antipatterns.md), A5 forbids — with an argument that cannot be waved
away: **the learner cannot judge whether the target-language sentence is
correct. That is why they are learning.** A wrong sentence is memorised with
exactly the care a right one gets.

For a **tool for you** (question 1) that is a risk you may knowingly take. As a
product promise it is not. The way out is not to forgo it but to **label** it:

| Tier | What exists | What the app shows |
| --- | --- | --- |
| **A** | + a **dated calibration** of the anchors | Everything. Level with normal uncertainty |
| **B** | + a **form→lemma table** carrying paradigm cells | Everything, but level with a **wider band** |
| **C** | Frequency list only — no lemma table | Cards and input yes. **No level value** — skill status "not measured" ([03](STUDY-003-level-model.md)) |

Tier C is the honest handling of U1: where we cannot say what a word is, we
cannot claim a vocabulary size. The app still works — it just claims less.

**Correction of 2026-08-08.** This table used to define tier B as "anchors
estimated, content generated and unchecked" and tier A as additionally having
"checked starter decks + contrast list". That mixed two independent axes — how
good the *lexical data* is, and whether the *content* has been checked — into one
letter, and the implementation settled the question: the tier is derived purely
from what the language's data contains
([`../specs/service/lexicon.md`](../specs/service/lexicon.md)), because that is
the only version a program can compute rather than assert. Whether generated
content has been checked is a real and separate obligation, and it is marked on
the content itself ([10](STUDY-009-antipatterns.md), A5) — never inferred from a tier.
Spanish and Italian reached **tier B on 2026-08-08** with no generated deck in
existence, which is what exposed the conflation.

**That is the answer to your question.** Every language: yes. Every language with
the same authority: no, and showing that is more honest than hiding it.

---

## The bootstrap sequence for a new language

1. Create the profile and obtain the frequency list → tier C exists. Cards and
   reading work; no level is claimed.
2. Generate the **form→lemma table with paradigm cells** from the morphological
   resources at build time → tier B, level with a wide band.
3. Calibrate the anchors against real data and date the calibration → tier A.

Steps 1 and 2 are automatable — **that is your dream, and it works**: both
shipped languages went through them on 2026-08-08. Step 3 is not automatable,
because a calibration needs learners, and it is the difference between "usable"
and "trustworthy".

Content work — generated decks, MT translations, TTS audio, the contrast list for
the pair — runs alongside this sequence and is *not* what the tier measures. See
the correction above.

---

## What goes into a spec

- The language profile as a **validated schema**. A language without a counting
  unit must not be loadable — otherwise the level model computes silently wrongly,
  and precisely in the languages where it is least noticeable.
- The quality tier as a value **derived** from what the profile contains — not a
  hand-set field. A field someone sets to "A" is not a quality statement.
- How skill status is set at tier C — the same mechanism as in
  [14](STUDY-012-accessibility.md), triggered for a different reason.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-035 — [use-cases/README.md](../use-cases/README.md)
- UC-036 — [use-cases/README.md](../use-cases/README.md)
- UC-037 — [use-cases/README.md](../use-cases/README.md)
- UC-040 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
