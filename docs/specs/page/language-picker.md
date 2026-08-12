# Language picker

<!-- id: SPEC-page-language-picker -->
<!-- use-case: UC-025 -->
<!-- status: active -->

Where an Account chooses what to learn — at first run, and later from
[`profile.md`](profile.md). **Standard**; the write it performs belongs to
[`learning-languages.md`](../service/learning-languages.md).

## Scope

- **In:** `/languages/choose`, the tiles, and the copy that keeps them honest.
- **Out:** the public [`language-status.md`](language-status.md) page, which is
  about **data quality** and is not a control; goals, minutes-per-day or any
  other onboarding questionnaire — the time slider on `/methods` already asks
  that at the moment it matters; the optional calibration test, which
  [`study/03`](../../study/03-level-model.md) places **after** the first
  exercise and never before.

**Reuse: `SubmitButton`** for the tiles' action. **Gap: none** — a tile is a heading,
two lines of copy and an action, all of which exist.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Arrives with no language chosen | Tiles for every language the app knows, one per language |
| 2 | Taps an available tile | The language is added and becomes active; lands on `/methods` |
| 3 | Taps an unavailable tile | Nothing. It is not an action, and it does not look like one |
| 4 | Arrives from Profile with a language already chosen | Languages already learned are marked as such and are not offered again |
| 5 | Add fails | The error surface; no partial state, and the picker still renders |

## States

No client machine. A Server Component; choosing is a server action.

## Data

A tile exists for every language with a profile in `data/languages/`, but
**availability is derived from `data/starter/`** — from whether a pool actually
ships, never from a second list someone can edit independently. That is what
stops a language becoming selectable months before it has anything to teach.

Today: Spanish is available, Italian is not
([`starter-deck.second-language.md`](../service/starter-deck.second-language.md)).

The endonym is the primary label with the English name beneath — `Español` /
*Spanish*. **A flag is never the identifier**; Spanish is not Spain.

## Copy, and why it is shaped this way

```
Which language do you want to learn?
You can add another later. Nothing here locks you in.
```

| State | Second line |
| --- | --- |
| Not started | `500 words in the starter set` |
| Already learning | `500 words in the starter set` — see below |
| Not available | `Not available yet — we don't have a word set for Italian we'd stand behind` |

⚠ **The holdings line ships** when the learner has reviewed meaning-recall in
that language — `347 of 500 starter words held stably` and
`0 of 500 starter words held stably` are real lines; before the first review
the tile shows the pool size only.

Once, below the grid — not repeated per tile:

```
These counts are about the starter set only. Nothing here is a claim
about the language as a whole.
```

Three rules the copy is carrying:

1. **A count shown to a learner is in "words", never "lemmas".**
   [`GLOSSARY.md`](../../GLOSSARY.md) gives `Card` as the user-facing word for
   `Task` and gives lemma none, so the unit of a count gets the same treatment.
   The **artefact** keeps its name: `data/lemma/<code>.json` is a lemma table on
   [`language-status.md`](language-status.md), which is a page about data
   provenance and not a count. An earlier version of this rule banned the word
   outright, which would have renamed a file in prose.
2. **Name the denominator.** A bare "of 500" reads as a finish line; "starter
   set" does the scoping that the number alone cannot.
3. **Zero is a measurement.** When the count arrives, `0 of 500` renders exactly
   as [`progress.md`](progress.md) already requires — it is not an empty state.

## Acceptance criteria

- [ ] Given no chosen language, when the picker renders, then one tile per known
      language appears, Spanish is actionable and Italian is not.
- [ ] Given a tap on Spanish, then it is added, becomes active, and the learner
      lands on `/methods`.
- [ ] Given a language already being learned, then its tile is marked and offers
      no second add.
- [ ] Given a holdings count, when a tile renders it, then it reads
      `{held} of {pool} starter words held stably`, including at zero.
- [ ] Given an unavailable language, then the tile carries the reason and has no
      control a pointer or a screen reader can activate.
- [ ] Given the add fails, then the error surface renders and the picker is
      still usable.
- [ ] **Negative:** no progress bar, meter or ring appears against the starter
      set. The denominator is a shipped set, not a goal — a bar would promise a
      finish line the product does not have, and refusing it is the same
      refusal as refusing the streak.
- [ ] **Negative:** no goal, level or minutes-per-day question appears here.

## Check

`npm test -- language-picker`

## Open

- **The picker was built before a second pool existed**, against the design
  review's advice, on the owner's decision. The risk it accepted: a chooser with
  one real option is the defect `/languages` already has. Revisit once Italian
  is buildable — if the answer is still one option, that is evidence the review
  was right.
