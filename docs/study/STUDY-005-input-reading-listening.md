# 05 · Input: reading and listening

<!-- id: STUDY-005 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-007, UC-008 -->

## Thesis

Comprehensible input builds fluency; flashcards build word knowledge — neither replaces the other.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

The second pillar beside flashcards. Cards build knowledge *about* words;
fluency comes only from volume ([README](README.md), thesis 3).

Your ideas — audiobooks with voice commands, short texts with
tap-to-translate, always at the right level — are worked out here and extended
with what the research says about them.

---

## The selection principle: 95–98 % known words

No level label decides what someone reads or hears; the **computed lexical
coverage for that specific user** does ([02](STUDY-002-evidence.md), E4). We know their
card holdings and we can tokenise any text — so we can say in advance: *"you know
96.2 % of the words in this text; the 41 unknown ones are these."*

> **Correction from [15](STUDY-013-landscape.md), K1:** the principle is not new — LingQ
> and Migaku have worked from a known-word inventory for years. Our difference
> lies in the three points below, not in the idea itself.

This solves three problems at once:

- **No level guessing.** Two B1 texts can have 90 % and 99 % coverage.
- **An honest preview.** Every text shows its coverage before you open it.
- **The loop back to the cards.** At equal coverage, the text containing the most
  **recently learned** cards wins ([04](STUDY-004-flashcards-srs.md), the one-way-street
  trap).

Concretely:

```
  The missing key                    6 min · 98 % known   ← comfortable
  News: elections in Chile           4 min · 91 % known   ← demanding
  Ana goes shopping                  3 min · 100 % known  ← speed practice
```

100 % is explicitly not an error. Texts with no unknown words train **speed and
automatisation** — the skill that makes the difference between B1 and B2 and
that vocabulary apps ignore entirely.

---

## Reading: short texts with tapping

### The translation layers

Your idea ("tap a sentence and it shows the language you understand") becomes
three separate layers, each switchable:

| Tapping a | Shows |
| --- | --- |
| **word** | Base form, meaning *in this context*, pronunciation, frequency rank, "add as card" |
| **sentence** | Translation of the whole sentence |
| **paragraph** | A summary — not a translation, but "what this is about" |

The *paragraph* layer is the interesting case: it helps without removing the
comprehension work. A word-by-word translation removes it.

**The delay rule [D]:** the translation appears only after a short moment or a
second tap. Without that brake, people tap before their head has even tried to
understand — and then the exercise is worthless ([02](STUDY-002-evidence.md), E1: no
retrieval attempt, no learning). The brake must be switchable off, but it must be
there by default.

### What is in a text

- **Pre-teaching**: the 5 most important unknown words up front, 20 seconds. Well
  established to raise comprehension substantially, and it costs almost nothing.
- **After reading**: 2–3 comprehension questions (retrieval practice, E1), then
  the offer to take the tapped words as cards.
- **Reading time measured**: words per minute is a layer-1 signal for
  [03](STUDY-003-level-model.md) and the only one that makes automatisation visible.

### Text sources **[D]**

Generated at first (see [10](STUDY-009-antipatterns.md), A5 on the quality obligation),
with curated original texts for higher levels in the medium term. For the upper
levels generated text is the wrong answer anyway — there, the irregular and
idiomatic is precisely the thing to be learned.

---

## Listening: audiobooks with voice control

The most ambitious part and the one that differs most from everything existing.

### The base mode: reading while listening

Audio plus a synchronised transcript, highlighted as it runs. Demonstrably
effective, because the audio segments the text into meaningful units — exactly
what beginners lack ("they speak so fast") ([02](STUDY-002-evidence.md), E11).

Three visibility levels, switchable at any time:

1. **Audio only** — the actual target skill.
2. **+ target-language transcript** (*captions*) — links sound and spelling.
3. **+ translation** (*subtitles*) — supports meaning.

The research is undecided about which level is superior when. Hence: switchable,
and the app **records** which level was used — material heard at level 1 counts
more toward "listening" than material heard at level 3. Otherwise the level model
measures reading and calls it listening.

### Voice commands

Your core idea: hands are free while listening, but attention is on the text. A
voice command interrupts the flow less than a glance at the display. The real
gain, though, is different: **it is the only mode in which learning can happen
while walking, cooking or commuting.**

| Command (examples) | Effect |
| --- | --- |
| "repeat" / "again" | last sentence once more |
| "slower" / "faster" | speed in steps |
| "translate" | read out the last sentence translated |
| "what does *X* mean?" | explain a single word |
| "save" / "card" | mark the last sentence + word as a card |
| "what was that?" | read out the transcript of the last sentence |
| "continue" | resume |

Four hard requirements, or it is unusable:

1. **Response in under a second.** A voice command that thinks for three seconds
   is never used again.
2. **Command recognition in the native language** — the learner should not spend
   cognitive capacity on operating the thing. (Optionally in the target language
   later, as its own exercise.)
3. **A fixed command list, not open conversation.** Recognising a small
   vocabulary is reliable and possible offline; free speech understanding is
   neither.
4. **Screen-free operation must be complete.** If any command requires a glance at
   the display, the whole usage scenario breaks.

### Buttons instead of voice

The same functions as large targets — including on the lock screen and, where
possible, on headphone and watch controls. Voice control is unusable on a bus or
in an office. **[D]** Both routes must cover the same set of functions; voice is
a mode of access, not a feature set.

### What listening gives back

- Words where "repeat" came several times → candidate cards. A behavioural signal
  for non-understanding that you cannot obtain any other way.
- Listening time at level 1 → a layer-1 signal for listening
  ([03](STUDY-003-level-model.md)).
- Passages with a high density of rewinds → the text is too hard there; this
  recalibrates the coverage estimate.

---

## Narrow listening / narrow reading **[B]**

An underrated principle: several texts on the **same topic**, one after another.
The vocabulary repeats itself, the world knowledge from text 1 carries text 2,
and perceived difficulty drops noticeably even though the material is no easier.
For learners that is a strong success experience, and it costs us only a sorting
rule.

**For us:** content arrives in thematic series of 4–6, not as an unrelated list.

---

## What goes into a spec

- The coverage calculator (tokenisation → lemmatisation → match against card
  holdings). Different per language, and non-trivial for morphology-rich ones.
- The player's state (playing / paused / explaining / awaiting command) with a
  transition table — a textbook case for [`../STATE.md`](../STATE.md).
- The transcript synchronisation contract: word timestamps or sentence
  timestamps? That decides whether "repeat" can work sentence-accurately.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-007 — [use-cases/README.md](../use-cases/README.md)
- UC-008 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
