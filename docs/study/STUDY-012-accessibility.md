# 14 · Accessibility

<!-- id: STUDY-012 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-020, UC-021 -->

## Thesis

Accessibility is computed across skills and routes, not a single display mode.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

## Product consequences

The gap [STUDY-sources.md](STUDY-sources.md) flagged in itself. It is filled in here because
[`../CONSTITUTION.md`](../CONSTITUTION.md) §3 makes accessibility a requirement
rather than a phase — and because an app whose core is audio and text has more to
decide here than an ordinary interface.

Important: this is **not** the same as WCAG conformance. Contrast, keyboard and
focus are already checked by `npm run verify`. This chapter is about something
else — several of the app's core mechanisms presuppose an ability not every user
has.

---

## The core conflict

| Mechanism | Presupposes |
| --- | --- |
| Flashcards by typing | fluent reading and writing |
| Coverage-based text selection | reading as the main channel |
| Audiobook with transcript | hearing |
| Dictation | hearing **and** writing |
| HVPT ([13](STUDY-011-pronunciation-perception.md)) | hearing fine contrasts |
| Voice commands | speaking, and being understood |
| Level model | that all of the above produce data |

If one of these abilities is absent, more than a feature drops out — **the level
model then computes wrongly.** A deaf user would permanently have a low listening
level in [03](STUDY-003-level-model.md) and therefore a depressed overall level, though
their language competence does not warrant it. That is not a display error but an
arithmetic one.

> **Product rule [D]:** the skill profile is **configurable**. Deselecting a
> skill shows it as "not part of your profile", and the overall level is formed
> from the remainder.
>
> The exact status and the formula for fewer than four skills live in
> [03](STUDY-003-level-model.md), "The status of a skill" — **there and only there**.
> "Not in profile" is explicitly different from "not measured": one is a
> decision, the other a gap.

---

## Dyslexia **[B]**

The commonest relevant condition and the one most tied to foreign language
learning: difficulties in the first language predict difficulties in the second
well, because both rest on phonological processing.

The evidenced answer is **multisensory structured language instruction** (MSL).
Studies with at-risk learners in foreign language classes find gains in
phonology, vocabulary, verbal memory and foreign language aptitude. Two things
about that are notable:

1. **Explicit and structured** works particularly strongly here — the same
   direction as [02](STUDY-002-evidence.md), E5, only more pronounced.
2. It benefits more than the target group. That is the usual accessibility
   finding: the adaptation becomes a general improvement.

**What follows — and what explicitly does not:**

| Do | Do not |
| --- | --- |
| Make typeface, line spacing, line length and background tone adjustable | Sell a "dyslexia font" as the solution — the evidence for it is weak |
| Audio for **every** text, always, not only for listening content | Leave reading as the only route to a card |
| Offer reading-while-listening as a default ([02](STUDY-002-evidence.md), E11) | Build time pressure into retrieval tasks |
| Explicit sound-to-spelling correspondence as its own content | Quietly mix spelling into the vocabulary measurement |
| Allow cards to be answered aloud | |

The last item on the left is the most important and costs almost nothing:
**typing must not be the only way to answer a retrieval task.** Speaking or
selecting must count equally — otherwise the app measures spelling and calls it
vocabulary.

---

## Hearing impairment

The case that affects the architecture most, because two whole chapters drop out
([05](STUDY-005-input-reading-listening.md)'s listening half, and
[13](STUDY-011-pronunciation-perception.md)).

- Skill profile without listening (see the product rule above).
- **The transcript is required content, not an extra.** Every audio item has one
  — which is already true for other reasons, and here is why that decision
  becomes non-negotiable.
- Audio-recall cards are switched off in the profile, without the associated
  words counting as weak.
- With residual hearing: frequency response and speed are settings, not fixed
  values.
- **Open question [D]:** sign languages are languages in their own right with
  their own grammar. Treating them here would be a different product, and
  pretending it is an adaptation would be disrespectful. Explicitly out of scope.

---

## Vision impairment

The cheapest case, because the app needs a fully screen-free mode anyway
([05](STUDY-005-input-reading-listening.md), voice commands) — a decision taken for an
entirely different reason that pays off here.

- Screen reader completeness for all core flows, not just navigation.
  Particularly the displays from [03](STUDY-003-level-model.md) and
  [04](STUDY-004-flashcards-srs.md): a progress curve and a vocabulary atlas must have a
  textual equivalent, or the app's core information is visual-only.
- Braille output only works if content is real text. **No vocabulary in images**,
  no text inside graphics.
- The paper part ([07](STUDY-007-offline-and-paper.md)) drops out or becomes the pure
  audio part (Ü4).

---

## Further situations, briefly

| | Adaptation |
| --- | --- |
| **Motor impairment** | Large targets, no swipe gestures as the only route, no time pressure, voice control as a full alternative |
| **ADHD / attention** | Short units with a visible end already exist (S2); additionally: low-stimulus mode, no auto-playing animation, break mode without punishment (F78) |
| **Fear of speaking** | See [16](STUDY-014-further-findings.md) — writing is the asynchronous route, and the conversation partner has no audience |
| **Older learners** | Type sizes, contrast, slower default audio speed. The spacing and retrieval effects hold across ages |

---

## What this means for the process

`npm run verify` checks contrast and keyboard operability. It does **not** check
whether a feature has an alternative route. That is a spec requirement, not a
gate requirement:

> **[D]** Every spec that binds a task to a skill (hearing, reading, writing,
> speaking) names the alternative route — or gives a one-sentence reason why
> there is none.

Cheap when it happens while the spec is written, and very expensive afterwards:
retrofitting alternative routes means opening up the task model from
[04](STUDY-004-flashcards-srs.md) after user data hangs off it.

## What we reject

Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## Related

- UC-020 — [use-cases/README.md](../use-cases/README.md)
- UC-021 — [use-cases/README.md](../use-cases/README.md)
- Normative contracts: [specs/README.md](../specs/README.md)
