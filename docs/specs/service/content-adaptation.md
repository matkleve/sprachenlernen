# Content adaptation

<!-- id: SPEC-service-content-adaptation -->
<!-- use-case: UC-030 -->
<!-- use-case: UC-029 -->
<!-- use-case: UC-007 -->
<!-- status: draft -->

**Level-targeted text** for topic news and learner uploads — e.g. *"this politics
article at A2"* — constrained by coverage and labelled honestly.

Parent: [`coverage.md`](coverage.md). Ingestion:
[`content-ingestion.md`](content-ingestion.md). UC: UC-030. Study:
[`../../study/48-content-licensing-and-adaptation.md`](../../study/48-content-licensing-and-adaptation.md),
[`../../study/10-antipatterns.md`](../../study/10-antipatterns.md) A5.

## Scope

- **In:** adaptation tiers; cache keys; target-level input; coverage validation
  loop; labelling; cost controls; what is **not** off-the-shelf.
- **Out:** TTS; listening without transcript; Progress signal equivalence for
  adapted vs authentic text.

## Target level input

| Source | `targetLevel` |
| --- | --- |
| Catalogue topic news | **Inferred** from the learner's active skill tier for that language (app-derived — owner 2026-08-20). No manual CEFR chip on method detail in v1. |
| Learner upload | Same inference + explicit processing consent |

Adaptation optimises for **coverage band 95–98 %** on the **adapted** `body`
using held lemmas from [`vocabulary-snapshot.md`](vocabulary-snapshot.md).

**Lemma-personalised v2:** replace unknown lemmas with held synonyms or simpler
forms from frequency table — optional second pass ([`study/48`](../../study/48-content-licensing-and-adaptation.md)).

## Adaptation tiers (cost ↑)

| Tier | Mechanism | When |
| --- | --- | --- |
| **T0 · Select** | Pick existing source already in band | Before any LLM |
| **T1 · Lemma gloss** | Inline gloss / pre-teach list for gap lemmas | 90–94 % coverage |
| **T2 · Level rewrite** | LLM rewrite to target CEFR band + coverage check | Catalogue news default (UC-030) |
| **T3 · Personal rewrite** | T2 + replace lemmas outside held set | Learner upload opt-in |

Each tier re-runs [`coverage.md`](coverage.md) on output; fail → retry once or
fall back to lower tier with honest copy.

## Cache (mandatory for catalogue)

```ts
type AdaptationCacheKey = {
  sourceId: string;
  targetLevel: string; // e.g. "A2"
  languageCode: string;
  tier: "T2" | "T3";
  promptVersion: string;
};
```

**One adapted body per key** — shared across all learners at that level band.
**Not** per-user LLM call for catalogue news.

Personal (T3) cache keyed by `(sourceHash, userId, heldLemmaSetHash)` — optional;
may skip cache when set changes daily.

## Labelling (non-negotiable)

| Surface | Copy |
| --- | --- |
| Source detail | *Adapted for A2 · not the original article* |
| Method Start | Session contract includes `adapted: true` |
| Progress | Source-level coverage only on adapted text — does **not** advance language-wide level claims (stays `calibrationDated` until authentic extensive reading) |

## Off-the-shelf

**No product** today adapts to **your held lemma set + forms** in one API call.
Readable/Flesch tools ignore vocabulary inventory. **We build:**

1. Coverage calculator (shipped direction)
2. Prompt + validator loop (T2)
3. Optional lemma-replacement pass (T3, cheaper than full rewrite)

## Cost controls

| Control | Detail |
| --- | --- |
| Band cache | ~10 articles/day × 2 levels × 2 langs ≈ 40 LLM calls/day catalogue |
| Model tier | Small/fast model for T2; quality sample on fixtures |
| Max input tokens | Cap source length; split only for **ingest**, not session cut |
| Learner paste | User-initiated; rate limit per account |

See cost table in study/48.

## Behaviour

| # | Input | Output |
| --- | --- | --- |
| 1 | Catalogue politics + A2 | Cached adapted `body`; coverage ≥ 95 % |
| 2 | Adaptation fails coverage twice | Honest error; offer T1 or different source |
| 3 | Learner without consent | Original only (UC-029 ladder) |
| 4 | Generated lane (ingestion C) | Skip adaptation — already level-targeted |

## Acceptance criteria

In [`content-adaptation.acceptance-criteria.md`](content-adaptation.acceptance-criteria.md).

## Check

`npm test -- content-adaptation coverage`

## Open

- **⚠ SPEC GAP:** form-aware adaptation (held paradigm cells) — v2 after form signal ships.
- **⚠ SPEC GAP:** which skill-tier → CEFR band mapping when T-B3 ships — until then use pool-local comfort band as proxy.
