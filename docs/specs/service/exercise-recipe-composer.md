# Exercise recipe composer

<!-- id: SPEC-service-exercise-recipe-composer -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Turns a catalogue Method + session context into an **exercise recipe** — an
ordered list of steps the runner renders. Recipes may be **fixed templates**,
**expanded at compose time** (loops, variants), or **algorithmically chosen**
later; the composer interface is the same in all three cases.

Parent: [`exercise-runner.md`](../feature/exercise-runner.md). Component ids:
[`exercise-step-components.md`](exercise-step-components.md). Per-method mixes:
[`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md). Build
matrix: [`METHOD-IMPLEMENTATION-MATRIX.md`](../../METHOD-IMPLEMENTATION-MATRIX.md).

## Scope

- **In:** `SessionContext` shape; composer function contract; expansion rules
  (loops, variants); routing from `resolveExerciseRecipe`; which Methods use
  which engine.
- **Out:** runner UI; gap-selection algorithm detail ([`material-unit.md`](material-unit.md));
  menu composition; LLM correction.

## Engines

| Engine | Route | Session shape |
| --- | --- | --- |
| Card | `/words/review` | One long stream of Task cards (FSRS) |
| Exercise runner | `/practice` | Ordered steps from a recipe |
| Off-app | detail only | Optional prep + debrief recipe when learner opts in |
| Not built | detail | Honest not-built; no recipe |

`resolveExerciseRecipe(methodId, ctx)` delegates to a per-method composer when
registered; returns `null` when not built. Today: `partial-dictation`, `full-dictation`, `extensive-reading`, `reading-aloud`, `build-a-sentence`, `free-production`.

## Session context

```ts
type SessionContext = {
  methodId: string;
  sourceId?: string;
  topicId?: string;
  unitId?: "sentence" | "paragraph" | "window" | "full";
  durationSec?: number;
  variantId?: "short" | "standard" | "long";
  context: Context; // lib/learning-context.ts
  supportRung?: string;
  heldLemmas?: string[];
  weakAudioRecall?: string[];
  recentErrors?: string[];
};
```

Material setup resolves `sourceId`, `unitId`, and coverage before Start.

## Composer contract

```ts
type RecipeComposer = (ctx: SessionContext) => ExerciseRecipe | null;
```

Rules:

1. **Pure function** of context — testable without UI.
2. **Expand loops at compose time** in v1 (`repeat` in recipe data is future).
3. **Variant changes step count or durations**, not step types.
4. **Context may skip steps** — e.g. omit `sheet-download` when keyboard-only.
5. **Terminal step is `decide`** when the Method offers cards; else `summary`.

## Expansion patterns

| Pattern | Example | Compose rule |
| --- | --- | --- |
| Single pass | build-a-sentence | Fixed 3–4 steps |
| Item loop | partial dictation | `N` × (`do` + `wait`) then submit/review |
| Round loop | 4/3/2 | 3 × (`round-marker` + `speak-prompt` + `wait`) |
| Series loop | narrow reading | 4 × `text-display` + `series-progress` |
| Reveal ladder | repeated listening | 3 × `audio-with-transcript` at decreasing reveal |
| Prep → offline → reconcile | full dictation | `sheet-download` → loop → `capture` → `self-mark` |
| Debrief only | tandem | `instruction` → `confirm-done` → `debrief-prompt` |

## Variant examples (dictation family)

| Variant | Loop count | Wait | Submit |
| --- | --- | --- | --- |
| `short` | 1 sentence | 30 s | optional text |
| `standard` | 6 sentences | 30 s between | photo or text |
| `long` | `window` unit | 45 s | photo required |

Floor recovery and double-abandonment (UC-049) set `variantId: "short"` once.

## Derived component set

Forty-one runner components + five card-engine Task types cover all fifty-three
catalogue Methods. See
[`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md).

## Acceptance criteria

In [`exercise-recipe-composer.acceptance-criteria.md`](exercise-recipe-composer.acceptance-criteria.md).

## Check

`npm test -- exercise-recipe`
