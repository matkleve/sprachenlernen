# Broken-card detection (tier 1)

<!-- id: SPEC-service-broken-card-detection -->
<!-- use-case: UC-013 -->
<!-- use-case: UC-023 -->
<!-- status: active -->

Build-time metadata for cards that are **likely to confuse** before any learner
reviews them. Tier 2 (leech threshold) and tier 3 (tap-to-confirm diagnosis)
ship later; this spec owns tier 1 only.

Parent: [`IDEAS.md`](../../IDEAS.md) three-tier model,
[ADR-0012](../../adr/0012-ux-decisions-requeue-i18n-leech-nav.md) decisions 14–15.

## Scope

- **In:** `lib/neighbor-candidates.ts`, `scripts/build-neighbor-candidates.mjs`,
  `scripts/check-neighbor-candidates.mjs`, sidecar files
  `data/starter/<lang>-neighbor-candidates.json` for each shipped meaning-recall
  pool.
- **Out:** learner report UI (UC-023), suspension UI (UC-013), tier-2 leech
  counting, tier-3 diagnosis screen, sound-contrast tables, too-many-meanings
  heuristics.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Shipped meaning-recall pool lemmas | Sidecar JSON: `wordId` → list of neighbour `lemma` candidates |
| 2 | Build script run | Regenerates sidecar from pool + ADR-0012 rule |
| 3 | Check script / gate | Fails if sidecar missing, stale, or candidate ratio &gt; 3% without tightened rule |
| 4 | Runtime (later) | Reads sidecar as **candidates only** — never auto-diagnoses |

### Neighbour-word rule (v1)

Per ADR-0012 decision 15:

- Levenshtein distance **1** only (distance 2 rejected).
- Both lemmas length **3–8** inclusive.
- If more than **3%** of pool lemmas have ≥1 candidate under the loose rule,
  recompute with **tightened** rule: distance 1 **and** same first two
  characters.

Candidates are symmetric: if `pero` lists `perro`, `perro` lists `pero`.

## Data

Sidecar shape:

```json
{
  "language": "es",
  "rule": "levenshtein-1-length-3-8",
  "tightened": false,
  "candidates": {
    "es:pero": ["perro"],
    "es:perro": ["pero"]
  }
}
```

Keys are `wordId` (`<lang>:<lemma>`). Values are neighbour lemmas only (not
full `wordId`s) so the file stays readable; runtime joins on language.

## Acceptance criteria

See [`broken-card-detection.acceptance-criteria.md`](broken-card-detection.acceptance-criteria.md).

## Check

`npm test -- neighbor-candidates`, `node scripts/check-neighbor-candidates.mjs`
