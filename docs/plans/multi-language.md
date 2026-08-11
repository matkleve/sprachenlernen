# Plan — the learning language as a first-class choice

**Status:** not started. This is the record of a design conversation, not a
contract — no spec is written yet, and two decisions below are still the owner's.
**Change class:** Sensitive (persisted, auth-adjacent, changes the route model).

Anchor use case: [`UC-025`](../use-cases/UC-025-learn-a-second-language.md),
written and accepted, with **no specs attached to it** to this day.

---

## Why this exists

The owner expected a Duolingo-shaped structure — sign in, see your courses, pick
one — and was surprised it does not exist. That expectation came from somewhere
real: `/languages` shows Spanish and Italian side by side with a quality column,
and reads exactly like a course picker. It is a transparency page about **data
quality**, it sits in the public half, and it is wired to nothing.

That is a UX defect independent of everything below: a page that looks like a
control and is not one.

## What exists today

| | Reality on `main` |
| --- | --- |
| Navigation | Three destinations: Methods · Words · Progress ([ADR-0009](../adr/0009-three-destinations.md)) |
| Account surface | `/account` exists, **is not in the navigation**, holds only export + delete |
| Language choice | **Nowhere.** No account field, no column, no screen, no switcher |
| Which language is learned | Hard-wired: `loadSpanishMeaningRecallDeck()`, three call sites |
| Mobile navigation | Floating pill + corner chips, not a tab bar |
| After sign-in you land on | `/methods` |

**The one piece of luck:** every stored review already carries its language in
the key — `task_id = "es:el:meaning-recall"`. Progress can therefore be
partitioned per language **without a data migration**. That is the difference
between expensive and very expensive, and it was free.

## What the owner wants

- First sign-in asks **which language do you want to learn**, changeable later.
- Language selection as **large tiles** — label plus a line of text.
- Profile as a destination, containing profile data, the chosen language(s), and
  statistics.
- Three destinations: **Methods · Words · Profile** — so Progress moves into
  Profile and stops being a top-level destination.
- "Add another language" from the profile.

## What UC-025 already decided, and the sketch does not cover

The use case is more demanding than the sketch, and it is already accepted:

- **One combined daily budget**, split across languages — not a full session per
  language. This is the mechanism that stops the new language crowding out the
  old one, which is the whole point of the use case.
- **Maintenance mode** per language: enough review to hold, no new material.
- **Switching is one action.** A switcher that lives only in the profile is three
  taps and fails this outright.
- **Spanish/Italian confusions are their own diagnosable error type**, not
  ordinary failures — relevant for exactly this language pair.
- Notifications combined, never one per language.

## The terminology problem: there is no course

Duolingo's course is a **path** — units in order, a percentage through it. This
product has a frequency-ranked pool and a catalogue of 53 methods. There is no
ordering, no lesson index, no "you are at unit 7", and therefore no percentage.

A tile can honestly show `347 of 500 lemmas held stably` or `not started`. It
can never show `23% of the course`, because that number does not exist and
inventing one would be [thesis 1](../study/01-duolingo.md) inverted — activity
dressed as competence.

Recommendation: build the structure exactly as sketched, but call it **language**,
not **course**. [`GLOSSARY.md`](../GLOSSARY.md) governs terms, already defines
**Language profile**, and a new term promising a curriculum we do not have is
the kind of drift the glossary exists to prevent.

---

## What the science says about establishing a level

Asked directly, and the answer is already in [`study/03`](../study/03-level-model.md).
Recorded here because it decides what a tile may display.

**The CEFR is a competence description, not a measuring instrument.** Chapter 03
names three defects for an app: too coarse (A2→B1 is months), too
one-dimensional (learners have a profile, not a level), and not self-measurable
("can speak in simple connected sentences" cannot be derived from click data).

**So level is never measured directly — it is derived from measured signals.**
Three layers, and only the bottom one is measured:

```
Layer 3   Overall level      ← second-lowest of the skills that count
Layer 2   Skill levels       ← reading · listening · speaking · writing
Layer 1   Signals            ← the only thing actually recorded
```

Seven layer-1 signals: vocabulary size · form mastery · recall stability ·
lexical coverage · response time on correct recall · success by task difficulty ·
production quality. **We measure two of them** — vocabulary size (pool-local) and
recall stability. That is why every skill reads *not measured*, and it is honest
rather than unfinished.

**The owner's instinct — "it is not about lemmas" — is the study's own
position, twice over.** Chapter 03 says *Lemma ≠ word form*: knowing *go* does
not mean knowing *went*, so **form mastery is its own signal** and explicitly not
part of vocabulary size. The failure it prevents is someone who holds 2,000
lemmas, cannot conjugate, reads fine, does not speak — and is shown B1 across the
board. The glossary carries the same rule from the other side: vocabulary is not
a skill; the four skills are.

Vocabulary size is load-bearing anyway, for a narrower reason: it is the one
competence quantity that is **cheap and reasonably valid to estimate**, and it
bridges SRS data to level through frequency rank. Hold ranks 1–1,200 stably and
almost nothing past 2,000, and the boundary lies between — an adaptive test
distributed across ordinary use. The chapter is explicit about not rebuilding
LexTALE and preferring IRT-style adaptive testing.

**Two limits that block the level display today**, both recorded already:

1. The vocabulary→level anchor table is graded **[C]** — inconsistent across the
   literature, differs per language, "a calibration starting point, not truth".
2. Extrapolation needs a pool large enough to estimate a boundary rank. At 500
   lemmas it is not.

And the honesty rules that any tile inherits: the level **may fall**; uncertainty
is shown; every number opens to its derivation; calibration changes are dated and
visible.

**Cold start**, still open in the study: an optional five-minute adaptive test,
offered *after* the first exercise and never before. Skipping it starts at A1.1
with a wide band. This is the closest thing to "what does science say about
determining a level quickly", and the study's answer is that it is a starting
prior, not a measurement.

---

## What has to change, smallest first

| # | Change | Size | Notes |
| --- | --- | --- | --- |
| 1 | `/account` → Profile, and into the navigation | S | |
| 2 | Deck loading takes a language instead of `loadSpanishMeaningRecallDeck()` | S | mechanical |
| 3 | `/languages` stops looking like a picker, or becomes one | S | the defect that started this |
| 4 | Language choice as data — account column, default at signup, switcher | **M, Sensitive** | spec + red-test-first + fresh review |
| 5 | Picker screen with tiles, and the post-signup "no language yet" state | M | today you land on `/methods`, which would be empty |
| 6 | Progress, standing and Words filtered per language | M | free of migration thanks to the `es:` key prefix |
| 7 | Tab bar instead of the floating pill | M | breaks `mobile-nav-v2.md`; needs a spec change, not a quiet edit |
| 8 | Progress moves into Profile as the third destination | **M, ADR** | supersedes [ADR-0009](../adr/0009-three-destinations.md) |
| 9 | Combined daily budget across languages | L | UC-025's core mechanism |
| 10 | Maintenance mode per language | L | |
| 11 | Italian pool | L | separately blocked — see [`starter-deck.second-language.md`](../specs/service/starter-deck.second-language.md) |

## Specs this will touch

`page/language-status.md` · `feature/app-shell.md` · `feature/mobile-nav-v2.md` ·
`page/progress.md` · `page/method-menu.md` · `feature/words-home.md` ·
`feature/account-data.md` · `service/auth.md` · `service/starter-deck.md` ·
`service/session-builder.md` — plus a new page spec for the picker and one for
Profile, and `GLOSSARY.md` for whatever the chosen term turns out to be.

New ADR required: the route model changes (ADR-0009 and ADR-0010 both speak to
it), and "one active language or several" is a decision neither records.

## Open — owner decisions

1. **One active language at a time, or several running together?** UC-025 assumes
   several (combined budget, maintenance mode). The sketch says "Italian is
   selected", which reads like one. This decides roughly half the work above.
2. **Does Progress really leave the top level?** It is the surface the product
   argues for most strongly; behind a profile tab it is two taps further away.
3. **Course or language** as the user-facing word — see the terminology section.

⚠ **SPEC GAP: none of the three is decided, and no spec may guess them.**
