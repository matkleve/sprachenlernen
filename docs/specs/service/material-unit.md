# Material unit

<!-- id: SPEC-service-material-unit -->
<!-- use-case: UC-007 -->
<!-- use-case: UC-028 -->
<!-- use-case: UC-049 -->
<!-- status: draft -->

How much of a **Source** one session uses, and how **gaps** are chosen for
listen-and-fill methods. Framework-free resolver; UI in
[`method-material-setup.md`](../feature/method-material-setup.md); runner
consumes resolved text in [`exercise-runner.md`](../feature/exercise-runner.md).

Study: [`../../study/39-material-units-and-listening-defer.md`](../../study/39-material-units-and-listening-defer.md).

## Scope

- **In:** unit types; catalogue `materialUnits`; `resolveMaterialUnit()`;
  gap selection rules for partial dictation / UC-028; frequency-stub sentence skip;
  window duration defaults.
- **Out:** topic chips; listening defer UI ([`listening-defer.md`](../feature/listening-defer.md));
  ASR; demonstration sentences; SRS deck.

## Unit types

| `id` | Meaning | Default cap |
| --- | --- | --- |
| `sentence` | One sentence | skip frequency-list stubs; prefer ≥4 tokens |
| `paragraph` | Connected block | ≤120 tokens or first `\n\n` block |
| `window` | Audio/listening slice | **300 s** transcript window; method may set 60–600 s |
| `full` | Whole source body/transcript | entire Source |

Catalogue methods declare allowed units:

```json
"materialUnits": [{ "id": "sentence" }, { "id": "window", "durationSec": 300 }]
```

One unit marked `default: true` when multiple listed.

## Resolver

| # | Input | Output |
| --- | --- | --- |
| 1 | Source + unit id + held lemmas | `ResolvedUnit { text, tokenRange?, durationSec?, sentenceCount }` |
| 2 | `window` + audio Source | Best window from [`coverage.md`](coverage.md) `windowCoverage[]` |
| 3 | `sentence` / `paragraph` | Substring of `body` or `transcript` |
| 4 | Unknown unit | Error — honest not-built |

Implementation: `lib/material-unit.ts`. v1 partial dictation uses `sentence` via
material-unit — **placeholder gap rule** in gaps must still be replaced (T-MU2).

## Gap selection (listen-and-fill)

**Forbidden:** random gaps; alternating every Nth word as sole rule.

**Target order** (UC-028):

1. Content words held in writing but weak on audio-recall signal (when wired).
2. Lemmas learned in last 14 days.
3. Words in unsolved minimal-pair contrasts (when phonology data exists).

Until signals exist, v1 may gap **content words** (skip high-frequency function
words) with a documented subset rule in tests.

## Input modes (gap-fill)

| Mode | Requires | Use |
| --- | --- | --- |
| `type` | keyboard/touch | default |
| `speak` | microphone + sound | optional per step |
| `type-only` | writing surface | when [`listening-defer.md`](../feature/listening-defer.md) active |

## Behaviour vs methods (examples)

| Method | Typical unit | Gap shape |
| --- | --- | --- |
| Partial dictation | `sentence` or `window` | listen + gap-fill |
| Cloze sentences | `sentence` | single blank (form target) |
| Extensive reading | `full` | none |
| Intensive reading | `paragraph` | none (support ladder UC-030) |

## Acceptance criteria

In [`material-unit.acceptance-criteria.md`](material-unit.acceptance-criteria.md).

## Check

`npm test -- material-unit`

## Open

- Paragraph boundary heuristics for languages without `\n\n`.
- Multi-sentence recipes (N × sentence units in one exercise).
