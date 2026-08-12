# Language status page

<!-- id: SPEC-page-language-status -->
<!-- use-case: UC-036 -->
<!-- status: active -->

For each shipped language, what the app can and cannot claim about it, and why.
Serves [UC-036](../../use-cases/UC-036-know-how-much-to-trust-this-language.md).
Route: `/languages`.

Every value on this page is **derived from data that already exists**. Nothing
here is authored per language, nothing is stored, and nothing is read from a
field a person can set — which is the whole point: a page about how much to
trust the data cannot itself be a place where someone types in a reassurance.

**Not a chooser.** Two languages side by side with a quality column reads as a
selection screen, and it was read that way — the title and intro now say what
the page is before anything else does. Choosing a language is
[`language-picker.md`](language-picker.md), behind an account.

## Scope

- **In:** one row per profile in `data/languages/`; the derived quality tier;
  what that tier claims and what it does not; which artefact the next tier
  needs; the frequency source and its version.
- **Out:** signing in, any learner data, per-language enable/disable, editing a
  profile, reporting an error in the data (UC-023), marking generated content
  as generated wherever it appears (UC-036's fourth criterion — it belongs to
  the surfaces that render content, not to this one), and the dating of a tier
  change (UC-036's fifth — nothing here has a history yet to date).

Reachable **without an account**. It contains no user data, so it renders the
same for everybody, and it is the one product surface that can exist before
authentication does.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/languages` | One row per shipped language, with its derived tier |
| 2 | Reads a row | One sentence for what the tier claims, one for what it does not |
| 3 | Reads a row | The artefact missing for the next tier, named |
| 4 | Reads a row at the top tier | No missing artefact is named — the row says so |

## Data

Reads `data/languages/*.json` through `loadProfile` and `qualityTier` from
[`../service/lexicon.md`](../service/lexicon.md). Writes nothing.

**The tier table is owned by `lexicon.md`** and is not restated here. This page
renders it; it does not define it. A tier's meaning changing is an edit to that
spec, and this page follows.

The mapping from tier to the artefact the next tier needs follows `qualityTier`
directly, because it is the same condition read forwards:

| Tier | Missing for the next tier |
| --- | --- |
| C | a lemma table |
| B | a dated calibration |
| A | nothing — it is the top tier |

**A profile that fails validation is not rendered as a language.** It is listed
by file name with its errors, because silently dropping it would make a broken
profile indistinguishable from a language nobody added yet.

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `populated` | at least one profile loads | The language table renders those rows | no |
| `empty` | `data/languages/` yields no valid profile | An explanatory line, no language table | no |

The list of refused profiles is not one of these states. It is rendered whenever
there is one, alongside either state, in its own table — a language that failed
to load and a language nobody added must not look the same.

`populated` and `empty` are mutually exclusive and both derive from the loaded
list. There is no loading state: this is a Server Component reading local files
at build time, so the page is either rendered or it is not.

## Accessibility

- The table carries a caption and `scope` on every header, which
  [`../component/table.md`](../component/table.md) requires anyway.
- The tier is text in its own cell, never a colour or a badge alone — the
  distinction between "B" and "C" must survive being read aloud.

## Acceptance criteria

- [ ] Given the shipped profiles, when the page renders, then each language
      appears exactly once, under the `name` from its profile.
- [ ] Given a profile, then its frequency source and version are shown as read
      from that profile, not from any value written into this feature.
- [ ] Given a profile with a lemma table and no dated calibration, then the tier
      shown is **B**.
- [ ] Given a profile with no lemma table, then the tier shown is **C** and the
      words **"no level is claimed"** appear for that language.
- [ ] Given a profile with a lemma table and a dated calibration, then the tier
      shown is **A**, and no artefact is named as missing for it.
- [ ] Given a profile carrying a hand-written `qualityTier` field that disagrees
      with what it contains, then the **derived** tier is shown and the field is
      ignored. A tier someone can type is not a quality statement.
- [ ] Given any rendered language, then exactly one sentence says what its tier
      claims and exactly one says what it does not.
- [ ] Given a profile that fails validation, then it is not counted as a
      language, and its file name and errors are shown instead.
- [ ] Given no valid profile at all, then the empty line renders and no language
      table does.
- [ ] The page component contains no `"use client"` directive, at any depth
      reachable from this feature.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- language-status`
