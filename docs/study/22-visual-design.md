# 22 · Visual design: what the interface promises

No colour decision yet — that comes later and is yours
([`../../AGENTS.md`](../../AGENTS.md), boundary 6). What follows are the
**constraints**, so the later session does not start from zero, plus an argument
that narrows the choice more than it first appears.

---

## The interface makes a promise before anyone reads

Before a single word is read, the design has already said what kind of thing this
is. Strong colours, round shapes, bouncing characters say: *this is a game, it
will be easy, you will be rewarded.*

And then this product delivers: a dictation. A card you got wrong for the fourth
time. A level value that has fallen. A method card with the mandatory section
"what this does not do".

> **That is the real point: if the design promises a game and the product
> delivers work, every honest display reads as a broken promise.**

Duolingo's look is not accidental — it is exactly the right packaging for a
product measured on return ([01](01-duolingo.md), D1). Adopting it and omitting
the mechanics would be the worst combination: the appearance creates the
expectation the mechanics then disappoint.

The inverse is equally wrong. Sober, grey and academic produces the app that is
didactically right and that nobody opens — an outcome [08](08-motivation.md)
names explicitly as a real risk.

---

## So what do we design towards?

**[D]** The target feeling is neither *game* nor *textbook*, but:

> **A well-made tool that takes you seriously.**

Something that looks calm, treats text well, and then gets strong in exactly one
place. Your observation about a dynamic serif points the same way, and it fits
for a content reason: **this product is text-heavy.** Derivations, info pages,
explanations at the point of error, the causal line under the chart, the weekly
review in sentences. An interface that treats text badly makes half the study
unusable.

Four constraints that follow from earlier chapters and are not matters of taste:

### G1 · Colour carries meaning, not decoration

If everything is colourful, colour can no longer say anything. This app must
distinguish by colour: solid / shaky / new, measured / uncertain / not measured,
inside the coverage band / above / below. That is a lot of meanings — and they
need a calm environment to be legible.

**Proposal [D]:** a warm, muted base surface, **one** strong accent colour used
sparingly, plus the semantic pairs from
[`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md). Strong is allowed — but in few
places, and there properly.

### G2 · Never colour alone

From [14](14-accessibility.md) and
[`../CONSTITUTION.md`](../CONSTITUTION.md) §3: every meaning shown by colour also
has shape, position or text. The vocabulary atlas and the trend curves are the
hard case — they need a textual equivalent anyway (F106).

### G3 · The primary display belongs to what is useful to optimise

[10](10-antipatterns.md), A1 is a design rule before it is a product rule. What
is large and at the top gets optimised. So that is where the level profile and
the map go ([19](19-milestones-and-map.md)) — not a streak, not an activity
figure.

### G4 · No celebrating error-freeness, no punishing errors

An error is the learning process ([02](02-evidence.md), E1). The design must not
make it look like a misfortune — no red with an exclamation mark, no flinch.
Equally, no confetti moment for an error-free session: that trains avoidance.

---

## What is to be decided later

When the colour concepts come up, these are the open points — deliberately as
questions rather than as pre-empted answers:

1. **How strong?** Duolingo-bright, muted-warm, or near-monochrome with one
   strong accent. My inclination is the third, from G1 — but that is taste plus
   an argument, not a derivation.
2. **Serif for what?** Headings and learning text only, or throughout. For
   target-language text, legibility outranks aesthetics, and for non-Latin scripts
   the choice is a different one anyway ([18](18-language-kit.md), U2).
3. **What does a level that has fallen look like?** The test case for the whole
   stance. It must be visible without feeling like a punishment
   ([03](03-level-model.md), honesty rule 1).
4. **What does "not measured" look like?** Not like a gap, not like an error —
   like a factual statement.

Points 3 and 4 are the real touchstones. A palette that flatters cheerful states
is easy. One that renders the honest states with dignity is the job.

---

## What is already fixed

From [`../../AGENTS.md`](../../AGENTS.md) and the gates, independent of any
palette:

- All values as tokens in `app/globals.css`; no raw colours in components.
- WCAG AA in **both** themes, checked by `npm run check:contrast` — so the palette
  is designed against the gate rather than repaired after it.
- Every interactive element with all five states.
- No screen that becomes unusable without colour.
