# Listening defer

<!-- id: SPEC-feature-listening-defer -->
<!-- use-case: UC-077 -->
<!-- use-case: UC-045 -->
<!-- use-case: UC-020 -->
<!-- status: active -->

Temporary *"I can't listen now"* preference — hide sound-requiring methods and
offer text-only exercise variants for **15 minutes** (default). Situational;
not UC-020 profile exclusion.

Study: [`../../study/39-material-units-and-listening-defer.md`](../../study/39-material-units-and-listening-defer.md).

## Scope

- **In:** defer control on method menu refine (or session chrome); 15 min timer;
  filter methods with `requires.sound`; `type-only` gap-fill fallback;
  confirmation copy with resume time.
- **Out:** permanent hearing exclusion (UC-020); auto-detecting environment;
  muting other apps.

**Reuse: `Chip`, `StatusBanner`** — refine row + active defer banner.

## Behaviour

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps **Can't listen now** | Defer active until now + 15 min; banner shows end time |
| 2 | While defer active | Methods requiring `sound` **absent** from filtered menu (UC-045) |
| 3 | Opens partial dictation while deferred | Runner uses `type-only` on gap-fill steps — no audio |
| 4 | Defer expires | Banner clears; sound methods return to filter results |
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

`listeningDefer.*` in `messages/en.json` and `messages/de.json`.

## Acceptance criteria

In [`listening-defer.acceptance-criteria.md`](listening-defer.acceptance-criteria.md).

## Check

`npm test -- listening-defer`
