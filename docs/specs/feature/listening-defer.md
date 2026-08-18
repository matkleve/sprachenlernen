# Listening defer

<!-- id: SPEC-feature-listening-defer -->
<!-- use-case: UC-077 -->
<!-- use-case: UC-045 -->
<!-- use-case: UC-020 -->
<!-- status: draft -->

Temporary *"I can't listen now"* preference — hide sound-requiring methods and
offer text-only exercise variants for **15 minutes** (default). Situational;
not UC-020 profile exclusion.

Study: [`../../study/39-material-units-and-listening-defer.md`](../../study/39-material-units-and-listening-defer.md).

**Owner 2026-08-18:** menu UI removed — premature without **mixed stacks**
(sessions that interleave listening and non-listening steps). Entry point moves
to session chrome when mixed stacks ship; see [`../../IDEAS.md`](../../IDEAS.md)
§2026-08-18.

## Scope

- **In (shipped, dormant):** `lib/listening-defer.ts` (15 min client timer);
  `type-only` gap-fill fallback in the exercise runner when defer is active.
- **In (deferred):** defer control in **mixed-stack session chrome**; filter
  methods with `requires.sound`; confirmation copy with resume time.
- **Out:** permanent hearing exclusion (UC-020); auto-detecting environment;
  muting other apps; method-menu **Ton** row (removed 2026-08-18).

**Reuse: `Chip`, `StatusBanner`** — session chrome + active defer banner (when built).

## Behaviour

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps **Can't listen now** (mixed-stack chrome, future) | Defer active until now + 15 min; banner shows end time |
| 2 | While defer active | Sound-requiring **steps** skipped or `type-only`; menu filter TBD with mixed stacks |
| 3 | Opens partial dictation while deferred | Runner uses `type-only` on gap-fill steps — no audio |
| 4 | Defer expires | Banner clears; sound behaviour returns |
| 5 | Taps **Listen again** on banner | Defer cleared immediately |

## States

| State | Trigger | Effect |
| --- | --- | --- |
| `off` | default | Normal sound filtering |
| `deferred` | can't listen | 15 min timer; sound methods hidden |
| `expired` | timer end | auto → `off` |

Persistence: **session cookie or client storage** v1 — not account profile.

## Data

Reads method `requires.sound` from catalogue. Writes defer expiry timestamp
client-side.

## Copy keys

`listeningDefer.*` in `messages/en.json` and `messages/de.json` — reserved for
mixed-stack chrome.

## Acceptance criteria

In [`listening-defer.acceptance-criteria.md`](listening-defer.acceptance-criteria.md).

## Check

`npm test -- listening-defer`
