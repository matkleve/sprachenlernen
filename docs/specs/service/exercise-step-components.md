# Exercise step components

<!-- id: SPEC-service-exercise-step-components -->
<!-- use-case: UC-049 -->
<!-- status: active -->

The **reusable card catalogue** for the exercise runner: every UI widget a Method
may place in a recipe step. One registry; Methods compose — they do not fork the
runner. Parent: [`exercise-runner.md`](../feature/exercise-runner.md). Per-method
mixes: [`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md).

## Scope

- **In:** component ids; allowed step types; config shape (summary); build status;
  which catalogue Methods need each component.
- **Out:** runner chrome; recipe composer logic
  ([`exercise-recipe-composer.md`](exercise-recipe-composer.md)); card-engine
  Task types (`meaning-recall`, `form-recall` on `/words/review`).

## Registry rules

1. **One id, one widget.** New interaction → new component id; never a Method-only
   fork in `ExerciseStepBody`.
2. **Step type is the role; component is the face.** A `do` step may use
   `gap-fill`, `audio-play`, `speak-prompt`, …
3. **Config is data.** Methods pass content via `step.config`; components do not
   read the catalogue directly.
4. **Build status:** `shipped` | `planned` | `card-engine` (different route).

Implementation target: `lib/exercise-step-components/` registry +
`features/exercise-runner/steps/<Component>.tsx`.

## A · Setup and orientation (`prepare`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `checklist` | Tick list — pen, headphones, quiet (not gated) | shipped | dictation family, paper, 4/3/2, shadowing |
| `instruction` | One-screen how-this-works (first visit optional) | planned | 4/3/2, narrow reading/listening, dictogloss |
| `context-check` | Confirm context still matches (`requires`) | planned | full dictation, paradigm tables |
| `material-preview` | Show resolved Source slice + coverage band | shipped | extensive reading, retell, back-translation |
| `sheet-download` | Printable worksheet (paradigm, handwriting, dictation) | shipped | paradigm tables, copy paragraph, full dictation |
| `variant-picker` | Short / standard / long before recipe expands | planned | dictation floor recovery, abandonment variant |

## B · Consume — look or listen (`do`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `prompt` | Static instruction body (markdown) | shipped | generic, rule-at-error, own-error-log |
| `text-display` | Read passage — scroll, tap word (future trace) | shipped | extensive/narrow/intensive reading, retell setup |
| `parallel-text` | L2 + L1 columns, scroll sync | planned | parallel text |
| `audio-play` | Play / replay clip; speed when method allows | shipped | listening L1, narrow listening, dictation reads |
| `audio-with-transcript` | Audio + reveal-level ladder (L1–L3) | planned | repeated listening |
| `sync-text-audio` | Karaoke-style highlight while audio plays | planned | reading while listening |
| `speed-listen` | Audio at 1.25× + optional follow-up | planned | listening faster |
| `image-prompt` | Photo to describe (stock or learner upload) | planned | describe a picture, caption photos |
| `series-progress` | “Text 2 of 4” within one session | planned | narrow reading |
| `song-picker` | Search title/artist; resolve lyrics in L2; pick lines by band | planned | translate-a-song |

## C · Active work (`do`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `gap-fill` | Gapped sentence; type blanks; defer → type-only; text sources speak via browser TTS | shipped | partial dictation |
| `audio-gap` | Hear sentence; type blanks (no text shown) | planned | partial dictation (harder) |
| `full-dictation` | Hear; write entire sentence (3× read protocol) | shipped | full dictation |
| `cloze-select` | Pick missing word from 3–4 options | planned | cloze sentences (easy) |
| `cloze-type` | Type missing word (no options) | shipped | cloze sentences, paradigm tables |
| `word-bank` | Drag words into sentence slots | planned | build a sentence (alt) |
| `type-with-word` | “Use *casa* in one sentence” | shipped | build a sentence |
| `type-freely` | Open text area + optional word count | shipped | dictogloss reconstruct, caption |
| `timed-write` | `type-freely` + embedded countdown | shipped | free production, diary, summarise, self-talk |
| `transform` | Rewrite per rule (tense, person, translate) | planned | sentence transformation, back-translation |
| `copy-display` | Paragraph to copy by hand (read-only) | planned | copy a paragraph |
| `minimal-pair` | Hear A or B; tap which | shipped | minimal pairs / HVPT |
| `speak-prompt` | Prompt + optional voice record | shipped | 4/3/2, retell, reading aloud, recite |
| `shadow-line` | Play line; learner repeats (no grade v1) | planned | shadowing |
| `round-marker` | “Round 2 of 3 — 3 minutes” header | shipped | 4/3/2 |
| `comprehension-questions` | 1–2 MC or short text checks | shipped | listening L1, extensive reading |
| `mining-highlight` | Select phrase from own text → card offer | planned | mine your own sentences |

## D · Timers (`wait`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `wait` | Countdown; survives navigation; pause recorded | shipped | dictation pauses, 4/3/2, retell delay |
| `rest` | Optional breather between blocks | planned | long dictation, repeated listening |

## E · Hand in (`submit`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `capture` | Photo and/or typed text; `accept`, `required` | shipped | dictation, free writing |
| `optional-capture` | Same; skippable | planned | optional photo after keyboard write |
| `voice-submit` | Record and hold audio for session | shipped | 4/3/2, retell, describe picture |
| `confirm-done` | “I did it” honest self-report | shipped | guided methods, copy paragraph |

## F · Review (`review`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `self-mark` | Answer key; tap error tokens | shipped | dictation family |
| `compare` | Side-by-side learner vs reference | planned | back-translation |
| `diff-highlight` | Inline added/removed/changed | shipped | dictogloss, rewrite in own words |
| `feedback` | Assisted correction (v1 placeholder) | shipped placeholder | free production, diary, summarise |
| `reveal-answer` | Show exemplar; no marking | shipped | cloze, build-a-sentence |
| `comprehension-check` | Post-input questions | planned | listening L1 |
| `rubric` | Self-rate 2–3 dimensions | shipped | free production, 4/3/2, retell |
| `error-log-review` | Walk saved errors one by one | planned | own error log |

## G · End (`decide`)

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `offers` | ≤2 buttons + decline (terminal) | shipped | any method with errors or cards |
| `summary` | Session stats + optional offers | shipped | shadowing, narrow reading, reread, reading aloud |
| `debrief-prompt` | “What could you not say?” → card offer | shipped | guided methods, tandem, world |

## Card engine (not exercise runner)

Task faces on `/words/review` — not step components. Listed so the full card-type
inventory stays in one place.

| Component | Purpose | Status | Methods |
| --- | --- | --- | --- |
| `meaning-recall` | L2 → recall meaning | shipped | srs-session, close frequency block |
| `form-recall` | Meaning → produce form | shipped pool | form practice (staged) |
| `recognition` | L2 + options → pick meaning | planned | staged deck entry |
| `audio-recall` | Hear → recall meaning/form | planned | audio cards |
| `collocation-match` | Chunk ↔ meaning | planned | collocation cards |

## Build priority

1. `audio-play`, `audio-gap`, `full-dictation` — dictation/listening block
2. `timed-write`, `feedback` (v2), `speak-prompt`, `round-marker` — production
3. `text-display`, `material-preview`, `sync-text-audio` — reading/input block
4. `cloze-type`, `transform`, `minimal-pair` — form block
5. `sheet-download`, `confirm-done`, `debrief-prompt` — paper/off-app loop

## Acceptance criteria

In [`exercise-step-components.acceptance-criteria.md`](exercise-step-components.acceptance-criteria.md).

## Check

`npm test -- exercise-runner`
