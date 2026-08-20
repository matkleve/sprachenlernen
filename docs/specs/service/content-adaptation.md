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
[`../../study/archive/ARCH-048-content-licensing-and-adaptation.md`](../../study/archive/ARCH-048-content-licensing-and-adaptation.md),
[`../../study/STUDY-009-antipatterns.md`](../../study/STUDY-009-antipatterns.md) A5.

## Scope

- **In:** adaptation tiers; cache keys; target-level input; coverage validation
  loop; labelling; cost controls; reading-skill credit for adapted sessions.
- **Out:** TTS; listening without transcript.

## Target level input

| Source | `targetLevel` |
| --- | --- |
| Catalogue topic news | **Inferred** from the learner's active skill tier for that language (app-derived — owner 2026-08-20). No manual CEFR chip on method detail in v1. |
| Learner upload | Same inference + explicit processing consent |

Adaptation optimises for **coverage band 95–98 %** on the **adapted** `body`
using **this learner's** held lemmas from [`vocabulary-snapshot.md`](vocabulary-snapshot.md).

**Delivery gate (owner 2026-08-20):** a band-level A2 rewrite (T2 cache) may be
**offered** as a catalogue default — it is **not** a promise that the text fits
this user. Before Start, compute coverage on the **shown** body with the
**active learner's held set**:

| Personal coverage | UI | Start |
| --- | --- | --- |
| **≥ 95 %** | Comfortable band copy on shown text | Enabled (after ~N min known) |
| **80–94 %** | Demanding + offer **T1 gloss** / gap list | Enabled with support ladder |
| **&lt; 80 %** | Honest *too hard for your vocabulary* — generic A2 did not pass **for you** | Blocked — alternate source or T3 (upload/consent) |

Band-level T2 validation (representative lemma set) is for **batch/cache quality
only** — not for enabling Start.

**Lemma-personalised v2:** replace unknown lemmas with held synonyms or simpler
forms from frequency table — optional second pass ([`study/48`](../../study/archive/ARCH-048-content-licensing-and-adaptation.md)).

## Adaptation tiers (cost ↑)

| Tier | Mechanism | When |
| --- | --- | --- |
| **T0 · Select** | Pick existing source already in band | Before any LLM |
| **T1 · Lemma gloss** | Inline gloss / pre-teach list for gap lemmas | 90–94 % coverage |
| **T2 · Level rewrite** | LLM rewrite to target CEFR band; batch-validated on band prototype | Catalogue news **proposal** (UC-030) — cheap shared cache |
| **T3 · Personal rewrite** | Rewrite constrained to learner's held lemmas (+ forms v2) | When T2 fails personal gate; learner upload opt-in |

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

**T2:** one adapted body per `(sourceId, targetLevel, languageCode)` — shared band
cache (~40 LLM calls/day). **Delivery** still requires personal coverage ≥ 95 %
on that body (or T1/T3 path below).

**T3:** cache keyed by `(sourceHash, heldLemmaSetHash, promptVersion)` when
personal rewrite runs — rate-limited; optional skip when set changes daily.

## Labelling (non-negotiable)

| Surface | Copy |
| --- | --- |
| Source detail | *Adapted for A2 · not the original article* + **your** coverage % on shown text |
| Method material preview | Personal band + gap copy per delivery gate; no Start under 80 % without T1/T3 |
| Method Start | Session contract includes `adapted: true` when shown body ≠ original |
| Progress / reading skill | **Counts** toward the reading skill pool like authentic input — owner 2026-08-20. History rows may carry `adapted: true` for audit; label on source detail stays honest. |

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
| 1 | Catalogue politics + band A2 cache hit | Offer cached body; compute **personal** coverage before Start |
| 2 | Personal coverage ≥ 95 % on shown body | Start enabled; label + link to original |
| 3 | Personal coverage 80–94 % | T1 gloss / gap list; Start with support |
| 4 | Personal coverage &lt; 80 % on band A2 | Honest block — do not pretend A2 fits this user |
| 5 | Adaptation fails personal gate twice | Offer T3 (consent) or different source |
| 6 | Learner without consent | Original only (UC-029 ladder) |
| 7 | Generated lane (ingestion C) | Skip adaptation — already level-targeted |

## Acceptance criteria

In [`content-adaptation.acceptance-criteria.md`](content-adaptation.acceptance-criteria.md).

## Check

`npm test -- content-adaptation coverage`

## Open

- **⚠ SPEC GAP:** form-aware adaptation (held paradigm cells) — v2 after form signal ships.
- **⚠ SPEC GAP:** which skill-tier → CEFR band mapping when T-B3 ships — until then use pool-local comfort band as proxy.
- **⚠ SPEC GAP:** target level for adaptation — CEFR self-report, skill tier, or
  coverage band only? From
  [`ARCH-046-method-length-and-level-matched-content.md`](../../study/archive/ARCH-046-method-length-and-level-matched-content.md).
- **⚠ SPEC GAP:** adapted article persistence — one adapted version per learner
  per source, or re-adapt on each open?
