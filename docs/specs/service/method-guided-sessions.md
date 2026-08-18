# Method guided sessions

<!-- id: SPEC-service-method-guided-sessions -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Every catalogue **method** and **commitment** has a **guided path** — a
declared step sequence the app can run. The learner always gets the same
cooking-app shape ([`study/23`](../../study/23-how-an-exercise-runs.md)):
prepare → do → wait → submit → review → decide — even when the real work
happens off-screen.

Parent: [`exercise-recipe-composer.md`](exercise-recipe-composer.md). Per-method
recipes: [`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md).
Routing: [`method-engines.md`](method-engines.md).

## Scope

- **In:** four **session kinds**; how `hosted` differs from **guided**; routes;
  measurement rules; Start-button contract on detail and menu.
- **Out:** building every composer; song-lyrics API choice; menu composition.

## Four session kinds

| Kind | Route | What the app does | `hosted` in catalogue |
| --- | --- | --- | --- |
| **graded** | `/practice?method=…` | Supplies material; may score (`self-mark`, `feedback`, …) | usually `true` |
| **guided** | `/practice?method=…` | Instructions, timers, optional in-app widgets; learner **confirms** (`confirm-done`) | usually `false` |
| **card** | `/words/review?method=…` | FSRS card stream | mixed |
| **check-in** | `/practice?method=…&checkIn=1` | Short periodic prompt for commitments | commitments only |

**Guided ≠ no session.** `hosted: false` means the product does not pretend to
run the whole activity inside the UI — not that the app shows only prose. Role
play, tandem, translate-a-song, and background listening all get **Start** →
guided recipe when the composer ships.

**Graded vs guided** share one runner shell ([`exercise-runner.md`](../feature/exercise-runner.md)).
Difference is terminal evidence: graded recipes end in `review` + `offers`;
guided recipes end in `confirm-done` + `debrief-prompt` or `summary`.

## `hosted` field (catalogue)

[`method-catalogue.md`](method-catalogue.md) keeps `hosted` as data. Normative
meaning after this spec:

| `hosted` | Means | Does **not** mean |
| --- | --- | --- |
| `true` | App intends to supply or score material in-session | Session is built today |
| `false` | Main work is off-screen or self-graded; app guides and debriefs | No steps, no Start |

UI chip **Off-app** stays for `hosted: false`. Copy: *you do the real thing
yourself — the app structures the session* (not *the app does not run it*).

## Measurement

| Session kind | Layer-1 signals today | Notes |
| --- | --- | --- |
| **card** (`srs-session`) | recall stability, pool-local vocab | shipped |
| **graded** | future session log | extensive reading, dictation — not Progress skills yet |
| **guided** | none by default | debrief may offer cards; never silent |
| **check-in** | none | standing rule, not a scored session |

Study/21: half the catalogue is deliberately weak on measurement. Guided
sessions still ship because structure beats a blank detail page.

## Routing (target)

| Session kind | Menu card | Detail Start |
| --- | --- | --- |
| **card** (built) | Opens `/words/review` | → Words review |
| **graded** or **guided** (built) | Opens `/practice` | → `/practice?method=…` |
| **check-in** (built) | Detail | → `/practice?method=…&checkIn=1` |
| Recipe not built | Detail | Honest not-built copy |

Implementation tracks [`method-engines.md`](method-engines.md). **Every**
catalogue id in [`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md)
must declare kind + recipe — no orphan methods.

## Adaptive material (example)

**`translate-a-song`** (guided, evidence D):

1. `song-picker` — search title/artist; resolve lyrics in the **learning language**
   (API when available; paste/link fallback).
2. `sync-text-audio` — hear + read selected lines only.
3. **Adaptive band** — at compose time pick lines by `heldLemmas` / coverage
   (e.g. 60–85% known tokens); never the full lyric sheet on first visit.
4. `type-freely` per selected line (or batch).
5. `debrief-prompt` — optional cards for stuck phrases.

Honest `doesNotDo` on the detail page stays; the app still guides the attempt.

## Timers on guided methods

When `durations` is set, recipes insert `wait` for the **off-screen block**
(role play with a partner, tandem hour, film episode). Open-ended (`durations:
null`) uses `wait` without auto-expiry — learner taps **Weiter** when done.
`timed-write` / `round-marker` cover in-app timed production.

## Acceptance criteria

In [`method-guided-sessions.acceptance-criteria.md`](method-guided-sessions.acceptance-criteria.md).

## Check

`npm test -- exercise-recipe method-guided-sessions`
