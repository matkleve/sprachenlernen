# 06 · Production: speaking and writing

<!-- id: STUDY-006 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-015, UC-016, UC-017 -->

The skills most people learn a language for, and the ones worst served in apps.
Duolingo has you repeat given sentences; that is pronunciation practice, not
production ([01](STUDY-001-duolingo.md), D4).

---

## Why production is more than input plus time **[B]**

Input alone produces comprehension, not speech. The explanation behind it
(Swain's output hypothesis, supported by noticing research): only when you have
to *say* something do you notice what you cannot say. That gap is what makes you
attend to exactly that in the next input you meet.

In practice: the value of a production exercise lies not in the utterance
produced but **in the failure and the correction that follows**. A production
exercise without feedback is nearly worthless.

---

## The conversation partner

An LLM-based conversation partner is the realistic solution. The meta-analysis
(Lyu et al. 2025) finds a medium effect (g ≈ 0.608) and names as active
ingredients: opportunity to speak without social anxiety, unlimited patience,
immediate feedback ([02](STUDY-002-evidence.md), E10).

And it names the weakness that determines the design: **LLMs prefer fluency over
accuracy.** They pass over subtle errors because that is conversationally polite
— and thereby entrench them.

### The correction dial **[D]**

Not a hidden system prompt but a visible setting with three positions,
switchable mid-conversation:

| Setting | Behaviour |
| --- | --- |
| **Let me talk** | No interruption. Errors are collected and shown **after** the conversation |
| **Gentle** | Correct reformulation inside the reply (recast), without breaking the flow |
| **Strict** | Immediate interruption on any error in the current target structure |

Research on corrective feedback (Lyster & Ranta and successors) finds **prompts**
— pushing the learner to self-correct — on average more effective than recasts
alone, because recasts often are not noticed as corrections. Hence: "gentle" is
the default *with* marking, not without.

### The debrief

The most valuable part, and the one no competing product does well:

```
  Conversation ended · 6 min · 41 utterances

  What went well
    · You used the perfect tense correctly 8× (last week: 3 of 9)

  Recurring errors
    · ser/estar — confused 4×               → minimal-pair cards created
    · adjective ending after feminine noun  → 3× → see the short explanation

  Steered around
    · You said "good" 5× where something more precise would have fitted
      → 6 alternatives as cards?
```

The **"steered around"** section is the most interesting idea in this chapter:
advanced learners become fluent by avoiding everything they cannot do. That is
invisible to any error count — the error rate falls while the vocabulary
stagnates. Recognising and naming avoidance is something a language teacher does
and an app so far does not.

### Briefing on the first use **[B]**

Learners explicitly taught *how* to work with the AI partner benefit measurably
more than those who work it out themselves ([02](STUDY-002-evidence.md), E10). So: a
60-second introduction ("ask for correction", "tell it your level", "let it
interrupt you"), once, skippable.

---

## Pronunciation: more honest than the competition

> **Addendum:** the real pronunciation lever is in
> [13](STUDY-011-pronunciation-perception.md) and works on **perception**, not
> production. This section describes what remains for the production side —
> deliberately little.

Loewen & Sato (2018) found Duolingo's speech recognition inaccurate enough to
hinder pronunciation development. Wrong pronunciation feedback is worse than
none: it confirms errors and damages trust in *every* other signal the app gives.

**Rules [D]:**

1. **No binary verdict.** Instead of ✓/✗, a confidence band: "understood well" /
   "with effort" / "not confidently recognised".
2. **Threshold honesty.** At low recognition confidence the app says so rather
   than guessing: "I could not judge that reliably."
3. **Point at sounds, not sentences.** "Your *ü* sounds like a *u*" is useful —
   for the handful of sounds known to be hard for this language pair. An overall
   score for a sentence is numerical cosmetics.
4. **Self-comparison over model comparison.** Your own recording playable right
   next to the native speaker's. Your own ear is a better instrument than a bad
   score — and it is free.

---

## Writing

Underused because unspectacular, but it has a decisive advantage: it is
**asynchronous** and can be corrected calmly. People who dare not speak, write.

| Format | Trains | Effort |
| --- | --- | --- |
| **Build a sentence with a target word** | activating fresh cards | minimal — belongs in the SRS ([04](STUDY-004-flashcards-srs.md)) |
| **Describe a picture** | free production, open vocabulary | small |
| **Diary, 3 sentences** | genuine intent to communicate — the strongest motivator there is | small |
| **Summarise what you read** | connecting input to output; very effective, very unpopular | small |
| **Back-translation** (L1 text → L2, then compare with the original) | structural differences; **the best format for spotting avoidance** | medium |

Back-translation deserves highlighting: comparing against a model answer shows
not only errors but **what you would have said differently** — the evasions from
the debrief, in written and therefore checkable form.

### How corrections are displayed

A diff view, not prose criticism. One category per change (grammar / word choice
/ idiom / style), because only categorised corrections can feed
[03](STUDY-003-level-model.md) and only they make visible which kind of error is
receding over weeks.

**Style last.** An A2 learner who receives a style correction stops writing.
Style notes from B1 onwards and always as a "you could also say" addition, never
marked as an error.

---

## What goes into a spec

- The conversation state (ready / user speaking / processing / replying /
  interrupting-to-correct) — [`../STATE.md`](../STATE.md).
- The error categories as a closed list in [`../GLOSSARY.md`](../GLOSSARY.md).
  Invented categories make the weekly comparison in [03](STUDY-003-level-model.md)
  worthless.
- **Sensitive:** audio recordings are personal data. Where are they processed,
  how long are they kept, do they leave the device?
  [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 applies, and the answer belongs
  in the spec before the first record button exists.
