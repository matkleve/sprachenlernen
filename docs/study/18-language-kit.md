# 18 · The language kit: any language, honestly graded

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
([03](03-level-model.md)). That quantity does not mean the same thing in every
language:

| | Example | Consequence |
| --- | --- | --- |
| **Fusional** | Spanish, Italian, German | ~50 verb forms per lemma. Lemma counting works |
| **Weakly inflecting** | Norwegian, English, Dutch | Simplest case. Forms ≈ lemmas |
| **Agglutinative** | Finnish, Turkish, Hungarian | Thousands of forms per lemma. "Vocabulary size" is a **different concept** — the CEFR anchors from [03](03-level-model.md) do not transfer |
| **Isolating + segmentation** | Chinese, Japanese, Thai | **No word boundaries in the text.** Tokenisation is itself a model, and the coverage calculator depends on it |

That is the point where "just fix it and let the AI do the rest" genuinely fails
— not on effort, but because the **measured quantity changes its meaning**. A
Finnish learner with "2,000 words" is not where a Spanish learner with 2,000 is.

### U2 · Script

Cyrillic, Greek, Arabic, Hebrew, CJK, Devanagari. This affects card input
(keyboard), handwriting exercises ([07](07-offline-and-paper.md), where the
evidence is strongest precisely here), typography — and, for Arabic and Hebrew,
that the vowels **are not written at all** in normal text.

### U3 · Sound system relative to the source language

The HVPT contrast list ([13](13-pronunciation-perception.md)) is **per pair**,
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
what [01](01-duolingo.md), D6 describes and what
[10](10-antipatterns.md), A5 forbids — with an argument that cannot be waved
away: **the learner cannot judge whether the target-language sentence is
correct. That is why they are learning.** A wrong sentence is memorised with
exactly the care a right one gets.

For a **tool for you** (question 1) that is a risk you may knowingly take. As a
product promise it is not. The way out is not to forgo it but to **label** it:

| Tier | What exists | What the app shows |
| --- | --- | --- |
| **A** | Frequency list + lemmatiser + calibrated anchors + checked starter decks + contrast list | Everything. Level with normal uncertainty |
| **B** | Frequency list + lemmatiser, anchors **estimated**, content generated and unchecked | Everything, but level with a **wider band**, content marked as generated |
| **C** | Frequency list only, no reliable lemmatisation | Cards and input yes. **No level value** — skill status "not measured" ([03](03-level-model.md)) |

Tier C is the honest handling of U1: where we cannot say what a word is, we
cannot claim a vocabulary size. The app still works — it just claims less.

**That is the answer to your question.** Every language: yes. Every language with
the same authority: no, and showing that is more honest than hiding it.

---

## The bootstrap sequence for a new language

1. Create the profile, obtain the frequency list and lemmatiser → tier C exists.
2. Generate a starter deck from the top frequency ranks, translations by MT,
   TTS audio → tier B, level with a wide band.
3. Calibrate anchors once enough own data exists; have samples checked; build the
   contrast list for the pair → tier A.

Steps 1 and 2 are automatable — **that is your dream, and it works.** Step 3 is
work, and it is the difference between "usable" and "trustworthy".

---

## What goes into a spec

- The language profile as a **validated schema**. A language without a counting
  unit must not be loadable — otherwise the level model computes silently wrongly,
  and precisely in the languages where it is least noticeable.
- The quality tier as a value **derived** from what the profile contains — not a
  hand-set field. A field someone sets to "A" is not a quality statement.
- How skill status is set at tier C — the same mechanism as in
  [14](14-accessibility.md), triggered for a different reason.
