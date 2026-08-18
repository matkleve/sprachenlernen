# Content traceability

<!-- id: SPEC-feature-content-traceability -->
<!-- use-case: UC-031 -->
<!-- use-case: UC-038 -->
<!-- use-case: UC-034 -->
<!-- use-case: UC-033 -->
<!-- status: draft -->

Makes the study/19 loop visible on screen: each surface names the next — a word
learned raises coverage, coverage moves content into reach, content produces more
words. Serves K2–K4 from
[`../../study/19-milestones-and-map.md`](../../study/19-milestones-and-map.md);
K1 (pool map) is already on `/words`.

Child specs: [`coverage.md`](../service/coverage.md) (calculator),
[`content-gap.md`](content-gap.md) (gap list),
[`method-material-setup.md`](method-material-setup.md) (pick material on method
detail); [`material-unit.md`](../service/material-unit.md) (session slice).
UX: [`../../study/37-content-and-method-setup-ux.md`](../../study/37-content-and-method-setup-ux.md),
[`../../study/39-material-units-and-listening-defer.md`](../../study/39-material-units-and-listening-defer.md).

## Scope

- **In:** the **Source** data model v1 (catalogue + fixture + learner); where
  word→content and content→word links render; `/content` library; loop copy;
  textual equivalents (UC-021); fixture + catalogue seeds before full intake.
- **Out:** method setup panel UI (method-material-setup); reading runner (T-W10);
  RSS sync; ASR; support-ladder implementation (UC-030); method-gap copy
  (UC-059); notification feed of unlock events.

## What “content” is in v1

A **Source** is one saved text or one audio item with a transcript
([`../../GLOSSARY.md`](../../GLOSSARY.md) *Source*). Minimum persisted fields:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | stable per learning language |
| `languageCode` | yes | learning language |
| `kind` | yes | `text` \| `audio` |
| `title` | yes | display name |
| `origin` | yes | `catalogue` \| `fixture` \| `learner` — see below |
| `body` | yes for `text` | raw text to tokenise |
| `transcript` | yes for `audio` | without transcript **unusable** ([`../../study/17-own-content.md`](../../study/17-own-content.md)) |
| `tags` | no | topic ids matching `materialTopics[].id` on methods (study/37) |
| `series` | no | podcast/show or narrow-reading series name |
| `episodeLabel` | no | e.g. `214` |
| `sourceUrl` | no | link back for learner-owned items |
| `addedAt` | yes | ISO timestamp |
| `ephemeral` | no | `true` = session-only (no `/content` row, no trace links) |

**Origins (decided study/37):**

| Origin | Example | Listed on `/content`? |
| --- | --- | --- |
| `catalogue` | *Nachrichten: Chile-Wahlen* (app reading pool) | yes |
| `fixture` | Demo text in `data/content/es.json` | yes |
| `learner` | Uploaded article, pasted link, RSS episode | yes when **Keep in library**; else ephemeral |

**Topic alignment:** catalogue Source `tags[]` uses the same `id` strings as
`materialTopics` on methods — e.g. tag `news` matches the **News** chip on
partial dictation ([`method-material-setup.md`](method-material-setup.md)).

**v1 minimum:** `fixture` + `catalogue` JSON in `data/content/`; learner intake
UI on method detail (T-W10a) before full persistence (T-W9).

**Known-lemma set:** held lemmas from
[`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md) for the active
learning language — same pool-local scope as `/words` v1. A lemma counts as
known when its meaning-recall task is **held**.

## Surfaces that carry the loop

Three surfaces, in loop order:

| # | Surface | K | Shows | Points to |
| --- | --- | --- | --- | --- |
| 1 | **Word trace block** on `/words` | K1→K2 | Rank/block (existing) + where this lemma appears in saved sources | Source detail |
| 2 | **Source detail** `/content/[id]` | K2/K3 | Coverage %, comfort band, optional before→after line; gap list when below comfortable | Gap set / Words |
| 3 | **Session complete** on `/words/review` | K4 | Words that became held this session; coverage delta on affected sources | `/words` map or `/content` |

A fourth rollup surface — **Sources home** `/content` listing all saved items
with coverage % — hosts K2 monthly copy (UC-033) but does not close the loop by
itself; it is the index into surface 2.

### When the word trace block appears

| Context | Block visible? | Notes |
| --- | --- | --- |
| Orbit word segment selected | yes, below stats row | extends [`orbit-detail-card.md`](../component/orbit-detail-card.md) |
| Word detail (T-W2) from atlas or review card | yes, same block | reuse one component; schedule reason stays a separate section above |
| Orbit aggregate segment | no | band summary only |
| Lemma not in any **persisted** source | yes — empty state | link to `/content` |
| Source is ephemeral (session-only) | no trace link | word still counts in session coverage delta |
| No sources exist at all | hidden | no fake appearances; orbit card unchanged from today |
| Review session (in-card) | no | payoff is on session complete, not mid-session |

T-W2 ships **without** this block; T-W8b adds it once
[`coverage.md`](../service/coverage.md) and at least one fixture source exist.

## Per-word fields (trace block)

Rendered below rank/stability on the word variant of the detail card:

| Field | Source |
| --- | --- |
| `appearanceCount` | reverse index from coverage service |
| `topSources` | up to **3** titles, linked to `/content/[id]` |
| `appearanceSummary` | “In N of your saved texts/episodes” — textual equivalent of any future icon row |

Rank, block, stability, schedule reason: owned by T-W2 / orbit detail — not
duplicated here.

## Per-source fields

| Field | Source |
| --- | --- |
| `coveragePercent` | [`coverage.md`](../service/coverage.md) — one decimal |
| `comfortBand` | `comfortable` (95.0–98.0 %), `demanding` (&lt;95 %), `speed` (&gt;98 %) per [`../../study/05-input-reading-listening.md`](../../study/05-input-reading-listening.md) |
| `gapToComfortable` | count of lemmas that would raise coverage to 95 % — see [`content-gap.md`](content-gap.md) |
| `readingTime` | derived from token count at learner WPM default |
| `history` | `{ measuredAt, coveragePercent, calibrationDated }[]` — for K2 before/after lines |

Historical rows are **Sensitive** (K2 compares past values). Until history
exists, source detail shows current coverage only — no fabricated “moved” line.

## Loop copy

See [`content-traceability.loop-copy.md`](content-traceability.loop-copy.md).

## UC-021 — textual equivalents

Every visual connection has a prose or list form:

| Visual | Textual equivalent |
| --- | --- |
| Coverage band / progress toward 95 % | “{pct} % known” always shown as a number |
| Word appears in sources | Count + up to three linked titles (never icon-only) |
| Gap set | Ordered list: lemma, rank, translation when present |
| Session map movement | Named lemmas that became held + named sources whose coverage rose |
| Orbit selection | Existing **Show list** popover (unchanged) |

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Selects a word on `/words` with sources loaded | Trace block lists appearances or empty state |
| 2 | Taps a source title in the trace block | Navigates to `/content/[id]` |
| 3 | Opens a demanding source | Coverage %, band label, gap summary; link to gap list |
| 4 | Completes a review session with ≥1 newly held lemma | Session complete adds loop line when any **persisted** source's coverage changed |
| 5 | Opens `/content` | Catalogue + fixture + kept learner sources listed with coverage % |

## Dependencies and build order

```
T-W7   coverage (+ catalogue/fixture/learner origins)
  → T-W8b word trace block
  → T-W8  content gap list (cap 40 lemmas)
  → T-W8c /content library
T-W10a method material setup (study/37)
  → T-W10 reading runner
T-W9   learner persistence (optional for session-only paste)
T-W11  K4 session loop line
T-W11b K2 unlock rollup (Sensitive)
```

T-W7 **before** T-W8. T-W10a can ship catalogue-only before T-W9.

## Acceptance criteria

In [`content-traceability.acceptance-criteria.md`](content-traceability.acceptance-criteria.md).

## Check

`npm test -- coverage content-traceability content-gap method-material-setup`