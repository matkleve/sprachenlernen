# Playbook — wire a catalogue Method

Turn a **wish** (a named way to practise) into a **runnable** session:
catalogue data → recipe → step components → routing → evidence.

Every catalogue entry already has a **declared recipe** in
[`exercise-recipe-composer.methods.md`](../specs/service/exercise-recipe-composer.methods.md).
This playbook is for **implementing** it. Contract:
[`method-guided-sessions.md`](../specs/service/method-guided-sessions.md).

**Change class:** Standard (recipe + components). Sensitive if the session writes
persisted data or uses voice capture with storage.

**Matrix:** [`METHOD-IMPLEMENTATION-MATRIX.md`](../METHOD-IMPLEMENTATION-MATRIX.md) —
refresh with `node scripts/generate-method-matrix.mjs` after shipping.

---

## 0 · Decide the session kind

| Kind | When | Route |
| --- | --- | --- |
| **graded** | App supplies material and may score | `/practice?method=…` |
| **guided** | Off-screen main work; `confirm-done` + debrief | `/practice?method=…` |
| **card** | FSRS card stream | `/words/review?method=…` |
| **check-in** | Standing commitment prompt | `/practice?method=…&checkIn=1` |

`hosted: false` in data → usually **guided**, not “no session”. Recipe mix per id:
[`exercise-recipe-composer.methods.md`](../specs/service/exercise-recipe-composer.methods.md).

---

## 1 · Catalogue (data)

**File:** `data/methods/<section>.json` (or add a new section file).

Checklist:

- [ ] `id` — lowercase kebab-case, unique across catalogue
- [ ] `name`, `summary`, `trains`, `doesNotDo` — non-empty; summary ≠ name
- [ ] `hosted: true` when the app supplies/scores material; `false` for guided
      off-screen work — both can have Start when built
- [ ] `requires` — non-empty context dimensions (no method matches everywhere)
- [ ] `durations` or `null` for open-ended
- [ ] `skills`, `evidence`, `intensity` per [`method-catalogue.md`](../specs/service/method-catalogue.md)
- [ ] Optional `materialTopics` + `materialUnits` when the learner picks text/audio
      ([`method-material-setup.md`](../specs/feature/method-material-setup.md))

**i18n:** add `name`, `summary`, `trains`, `doesNotDo` under
`data/i18n/method-catalogue/de.json` (and `messages/de.json` entries block if used).

**Verify:** `npm run verify:scope -- method-menu` — catalogue validator tests green.

---

## 2 · Step components (only if recipe needs new widgets)

**Spec:** [`exercise-step-components.md`](../specs/service/exercise-step-components.md).

For each component id in the recipe mix:

1. If **shipped** — reuse; skip to §3.
2. If **planned** — implement `features/exercise-runner/steps/<Name>Step.tsx`.
3. Register in `lib/exercise-step-components/types.ts` (`SHIPPED_STEP_COMPONENT_IDS`).
4. Register allowed step types in `lib/exercise-step-components/registry.ts`.
5. Wire in `features/exercise-runner/step-registry.tsx`.
6. Add copy in `messages/en.json` + `messages/de.json` under `exerciseRunner`.
7. Mark **shipped** in `exercise-step-components.md`.

**Verify:** `npm test -- exercise-runner step-registry`.

---

## 3 · Recipe composer

**Pattern:** copy the closest built Method (same section or same component set).

| Built reference | Good for |
| --- | --- |
| `lib/exercise-recipe/extensive-reading.ts` | text input, material preview |
| `lib/exercise-recipe/partial-dictation.ts` | audio loops, capture, self-mark |
| `lib/exercise-recipe/full-dictation.ts` | sheet download + paper protocol |

Steps:

1. Create `lib/exercise-recipe/<method-id>.ts` — `compose…Recipe(source, ctx)` +
   `resolve…Recipe(ctx)`.
2. Register in `lib/exercise-recipe/composer.ts` `COMPOSERS` map.
3. Add method id to `lib/exercise-recipe-built.ts` `BUILT_EXERCISE_METHOD_IDS`.
4. If material setup: extend `fallbackSourceIdForMethod` in
   `lib/method-material-setup.ts` (default `sourceId` when none passed).
5. Test: `lib/exercise-recipe/<method-id>.test.ts` — step component sequence
   matches `exercise-recipe-composer.methods.md`.

**Verify:** `npm test -- exercise-recipe`.

---

## 4 · Routing (automatic once §3 is done)

`lib/method-session.ts` reads `hasExerciseRecipe` — no hand-built query strings.

| Surface | Behaviour after wire |
| --- | --- |
| Method menu card | `cardHrefForMethod` → `/practice?method=…` |
| Method detail Start | `sessionHrefForMethod` (or material setup panel) |
| `/practice` page | `resolveExerciseRecipe` returns steps |

**Card engine exception:** only `srs-session` uses `/words/review`.

**Verify:** `npm test -- method-session method-menu`.

---

## 5 · Matrix + docs sync

1. `node scripts/generate-method-matrix.mjs` — updates `METHOD-IMPLEMENTATION-MATRIX.md`.
2. If first Method using a component: update build status in
   `exercise-step-components.md`.
3. Diary entry in `docs/diary/` when learner-visible.

---

## 6 · Ship checklist

```bash
npm run verify:scope -- changed   # or method-menu + exercise-runner scopes
```

**LIVE CHECK (you):**

1. Open `/methods` → find the Method → card opens session or detail.
2. Detail → Start (or material setup → Start) → `/practice?method=…`.
3. Walk every recipe step — no *not built yet* copy.
4. Complete session → completion screen, no console errors.

---

## Example — `reading-aloud` (Vorlesen)

| Layer | What we did |
| --- | --- |
| Catalogue | `data/methods/reading.json` — already present; added `materialTopics` |
| Recipe | `P:checklist → D:text-display → D:speak-prompt → C:summary` |
| Components | shipped `speak-prompt`, `summary` |
| Code | `lib/exercise-recipe/reading-aloud.ts` + built registry |
| Default source | `es-catalogue-chile` (same family as extensive reading) |

---

## Related

| Doc | Owns |
| --- | --- |
| [`WORKFLOW.md`](../WORKFLOW.md) | Stages 0–8, DoR/DoD |
| [`method-implementation-maturity.md`](../specs/service/method-implementation-maturity.md) | I0–I4 tiers and LIVE CHECK rubric |
| [`method-guided-sessions.md`](../specs/service/method-guided-sessions.md) | Session kinds (graded, guided, card, check-in) |
| [`plans/exercise-runner.md`](../plans/exercise-runner.md) | Runner build queue |
