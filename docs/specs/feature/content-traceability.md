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
[`content-gap.md`](content-gap.md) (missing-word set per item).

## Scope

- **In:** the **Source** data model v1; where word→content and content→word links
  render; loop copy (one forward-pointing line per surface); textual equivalents
  (UC-021); read-only **fixture sources** before word capture ships.
- **Out:** intake UI (T-W9), reading runner (T-W10), RSS sync, ASR, support
  ladder, simplification, method-gap copy (UC-059 — same arithmetic, separate
  spec), notification feed of unlock events.

## What “content” is in v1

A **Source** is one saved text or one audio item with a transcript
([`../../GLOSSARY.md`](../../GLOSSARY.md) *Source*). Minimum persisted fields:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | stable per learning language |
| `languageCode` | yes | learning language |
| `kind` | yes | `text` \| `audio` |
| `title` | yes | display name |
| `origin` | yes | `fixture` \| `file` \| `url` \| `rss` |
| `body` | yes for `text` | raw text to tokenise |
| `transcript` | yes for `audio` | without transcript the item is **unusable** — no coverage, no gap list ([`../../study/17-own-content.md`](../../study/17-own-content.md)) |
| `series` | no | podcast/show name |
| `episodeLabel` | no | e.g. `214` |
| `sourceUrl` | no | link back for learner-owned items |
| `addedAt` | yes | ISO timestamp |

**v1 minimum that ships:** `fixture` sources in `data/content/` (one short text
per learning language) plus coverage computed from them. Learner intake
(`file` / `url` / `rss`) waits for T-W9; fixtures unblock T-W7/T-W8 and the
word trace block before capture.

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
| Lemma not in any saved source | yes — empty state | “Not in your saved content yet” + link to `/content` |
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
| 4 | Completes a review session with ≥1 newly held lemma | Session complete adds loop line when any fixture source’s coverage changed |
| 5 | Opens `/content` with no learner sources | Fixture sources listed with coverage; no upload CTA until T-W9 |

## Dependencies and build order

```
T-W7  coverage service + fixture sources
  → T-W8b word trace block (this spec § word block)
  → T-W8  content gap list
T-W9  word capture (adds learner sources; not required for fixture-only stub)
  → T-W10 reading surface
T-W11 K4 session loop line — after T-W7; can ship with T-W8b
T-W11b K2 history + monthly rollup (UC-033) — after T-W8c
```

T-W7 **before** T-W8 (gap list is reverse coverage). T-W8b can ship with T-W7
when fixtures exist. T-W9 **not** required for read-only stub. Scheduling a gap
set uses existing starter-pool cards only — no capture.

## Acceptance criteria

In [`content-traceability.acceptance-criteria.md`](content-traceability.acceptance-criteria.md).

## Check

`npm test -- coverage content-traceability content-gap`

## Open

- **⚠ SPEC GAP: route slug for the sources library.** `/content` vs `/sources`
  vs a tab under `/methods` — which URL owns saved items? Blocks route files
  only; behaviour in this spec is route-agnostic (`/content/[id]` placeholder).
