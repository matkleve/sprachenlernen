# Plan — the Words domain: hygiene, gaps, and build order

**Status: active queue.** Written 2026-08-12 after a full audit of use cases,
specs, and code for vocabulary / words / lemmas / lexicon.

**What this file owns:** the words-domain slice sequence — what to clean up, what
to decide, what to spec next, and what order to build in. The project-wide queue
lives in [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md); roadmap stage
order lives in [`study/11-roadmap-open-questions.md`](../study/11-roadmap-open-questions.md).

**What shipped today (stage-1 card engine):**

| Layer | State |
| --- | --- |
| `/words` home | held/fragile/new counts (methods-style section cards), frequency bands, review horizon (collapsed default; week columns + causal line per [`review-horizon.md`](../specs/feature/review-horizon.md)), vocabulary orbit (+ **Show list**) |
| `/words/review?method=srs-session` | meaning-recall + form-recall SRS, FSRS, requeue |
| Data | es + it: 2000-lemma pools, lemma tables (tier B), form-recall pools |
| `lib/lexicon.ts` | tested; **not wired into any app route** |
| Progress | pool-local "X of 2000 starter words held stably" + form-mastery count |

**The gap in one sentence:** the SRS engine is real; the vocabulary *map* (capture,
milestones, per-word rationale, content-linked coverage) exists only in use cases.

---

## How to work this plan

Follow [`WORKFLOW.md`](../WORKFLOW.md): one **thin slice** per PR, spec before
code for Standard/Sensitive, `npm run verify` green before merge.

**Do not spec ahead of roadmap stage.** The use-case index
([`use-cases/README.md`](../use-cases/README.md)) already assigns stages. A
stage-3 use case (reading, coverage gaps) is a promise until stage 2 vocabulary
display is honest.

**Three kinds of work** — do them in this order within each phase:

1. **Hygiene** — link repair, catalogue honesty, test drift. No product calls.
2. **Decisions** — resolve `⚠ SPEC GAP` items that block the next slice. Owner,
   not agent.
3. **Slices** — spec → failing test → implementation.

---

## Phase 0 · Hygiene and honesty (no product decisions)

These clear confusion without committing to new behaviour.

| ID | Work | Class | Files | Done when |
| --- | --- | --- | --- | --- |
| **T-W0a** | **Bidirectional link repair** — every spec that names a use case must be listed back in that use case's `<!-- specs: -->` comment (`check:specs` enforces this). Audit the 15 words-domain specs; fix any one-way links. | Trivial | `docs/use-cases/UC-*.md` headers only | `npm run check:specs` green; no new specs |
| **T-W0b** | **Catalogue honesty** — five vocabulary methods in `data/methods/vocabulary.json` are `hosted: true` but route to "not built". Either set `hosted: false` until engines exist, or add an explicit `status: planned` field the catalogue schema supports. Resolves tension with [`method-catalogue.md`](../specs/service/method-catalogue.md) SPEC GAP (no `vocabulary` skill value). | Standard | `data/methods/vocabulary.json`, `docs/specs/service/method-catalogue.md`, `lib/method-catalogue.ts` if schema changes | Catalogue matches reality; method menu does not offer dead ends |
| **T-W0c** | **Test drift** — `/words/atlas` appears in shell middleware tests but no page exists; atlas lives on `/words`. Remove or redirect the stray reference. | Trivial | `features/app-shell/middleware-gate.test.ts` (or equivalent) | Test describes shipped routes only |
| **T-W0d** | **Words-domain index** — add a "Words" subsection to this file's parent queue (done as part of adopting this plan). | Trivial | `IMPLEMENTATION-PLAN.md` | One place to look for words work |

**Exit gate for phase 0:** a new agent can read `IMPLEMENTATION-PLAN.md` + this
file and know what is built vs what is catalogue fiction.

---

## Phase 1 · Decisions that block stage-2 words

Resolve in [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) § "What needs a
decision from you" — same session as the answer, per project rules.

| # | Question | Blocks | Notes |
| --- | --- | --- | --- |
| **W-1** | ~~Lemma-frequency ranks~~ **Answered 2026-08-12:** keep form-based ranks in starter pool | — |
| **W-2** | ~~Pool orbit vs full map~~ **Answered 2026-08-12:** pool-local bands + orbit on `/words` v1 | — |
| **W-3** | ~~`SKILLS` vocabulary value~~ **Answered 2026-08-17:** `vocabulary` added | — |
| **W-4** | ~~Sibling spacing~~ **Answered 2026-08-12:** FSRS `due` between sessions; one Task per Word per session; UC-071 requeue is same Task only | — |
| **W-5** | ~~Incomplete paradigms → form mastery~~ **Answered 2026-08-17:** flag partial paradigms on Progress | — |

Do not start T-W2–T-W6 until W-1 and W-2 are answered. W-4 blocks T-W6 only.

---

## Phase 2 · Stage-2 vocabulary display (roadmap stage 2)

Parent work: **T-B3 remainder** in [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).
These slices are the words-specific half of stage 2.

Load-bearing order:

```
frequency blocks (derivation)
    → word detail (per-lemma surface)
        → vocabulary map (pool-local, then language-wide when W-1 settled)
            → T-B3 extrapolation + skill levels
                → forms home + deck filter (T-W20) — **shipped**
                    → form cell explanations (T-W21) — **shipped**
                        → session sampling (T-W22) — [`session-sampling.md`](../specs/service/session-sampling.md), UC-079 — **shipped**
                        → per-cell group breakdown on Progress (T-W5) — **shipped 2026-08-20**
                            → full paradigm-cell engine (T-W6) — **v1 shipped** inverse index + mixing
```

| ID | Work | Serves | New spec | Class | Depends on |
| --- | --- | --- | --- | --- | --- |
| **T-W1** | ~~**Frequency blocks**~~ — **shipped 2026-08-12** | UC-032 (partial), UC-031 | `frequency-blocks.md`, `lib/frequency-blocks.ts`, `/words` bands UI |
| **T-W2** | **Word detail** — tap an atlas row (or review card) → rank, block, stability, schedule reason, one-action suspend/drop (history preserved). | UC-038 | `docs/specs/feature/word-detail.md` | Standard | T-W1 for block label | **Shipped 2026-08-17** — inline `OrbitDetailCard` + suspend/retire |
| **T-W3** | **Vocabulary map (pool-local v1)** — extend `/words`: show distribution of held/fragile/new/new-hole across frequency bands; textual equivalent required (UC-021). Not language-wide until lexicon runtime. | UC-031 (partial) | extend [`words-home.md`](../specs/feature/words-home.md) | Standard | T-W1, W-2 answered | **Shipped 2026-08-17** — `FrequencyBlocksField`, core band labels unreviewed as holes |
| **T-W4** | **T-B3 remainder** — language-wide vocabulary extrapolation, per-skill levels, demonstration sentence. | UC-004, UC-031, UC-054, UC-050 | existing [`progress.md`](../specs/page/progress.md), level-model specs | Standard / Sensitive | calibration (tier A) or widened band; anchor table [C] |
| **T-W5** | ~~**Per-cell form breakdown**~~ — Progress drill-down: held forms by paradigm cell **group**; weak group links to `deck=form` practice. **Shipped 2026-08-20.** | UC-062, UC-064 (forms branch), UC-078 | extend [`form-mastery-signal.md`](../specs/service/form-mastery-signal.md) | Standard | W-5 answered |
| **T-W20** | **Forms home + deck filter** — second section card on `/words`; `deck=meaning\|form\|mixed` on session builder and review route. | UC-078, UC-063, UC-041 | [`words-home.md`](../specs/feature/words-home.md), [`words-review.md`](../specs/page/words-review.md), [`session-builder.md`](../specs/service/session-builder.md) | Standard | form-recall pool shipped |
| **T-W21** | **Form cell explanation** — on-demand + post-Again/Hard disclosure on form-recall cards. | UC-022, UC-041 | [`form-cell-explanation.md`](../specs/service/form-cell-explanation.md), [`form-error-explanation.md`](../specs/component/form-error-explanation.md) | Standard | T-W20 (forms path exists) — **shipped** |
| **T-W22** | ~~**Session sampling**~~ — weighted queue (`u×b×n×f`), sigmoid foundation taper, soft form staging; UC-079. **Shipped 2026-08-20.** | UC-079, UC-011 | [`session-sampling.md`](../specs/service/session-sampling.md) | Standard | T-W21 |
| **T-W6** | **Form practice engine** — inverse index + mixing + echo + pull-forward + cell task ids + introduction pacing + typed + **build answer routes** **shipped 2026-08-20**; remainder: spoken route, wrong-answer cell recording. | UC-041 | [`form-practice.md`](../specs/service/form-practice.md), [`form-inverse-index.md`](../specs/service/form-inverse-index.md) | **Sensitive** | W-4 |

**Explicitly not in phase 2:** word capture (UC-012), reading (UC-007), coverage
gaps for content (UC-034) — those are stage 1 capture / stage 3 reading.

---

## Phase 3 · Lexicon runtime and the content loop (roadmap stage 3)

Specs: [`content-traceability.md`](../specs/feature/content-traceability.md)
(loop), [`coverage.md`](../specs/service/coverage.md) (T-W7),
[`content-gap.md`](../specs/feature/content-gap.md) (T-W8),
[`method-material-setup.md`](../specs/feature/method-material-setup.md) (T-W10a).
Study: [`37-content-and-method-setup-ux.md`](../study/37-content-and-method-setup-ux.md).

Do not queue these until phase 2 map is honest at pool scope.

| ID | Work | Serves | Spec | Class | Depends on |
| --- | --- | --- | --- | --- | --- |
| **T-W7** | ~~**Coverage calculator**~~ — **shipped** (`lib/coverage.ts`, fixture sources) | UC-007, UC-034, UC-033, UC-059 | `coverage.md` | Standard | T-W1, lexicon |
| **T-W8b** | ~~**Word trace block**~~ — **shipped** | UC-038, UC-031 | `content-traceability.md` | Standard | T-W7 |
| **T-W8** | ~~**Content gap list**~~ — **shipped** | UC-034, UC-059 | `content-gap.md` | Standard | T-W7 |
| **T-W8c** | ~~**Sources shell**~~ — **shipped** (`/content` index + detail) | UC-033, UC-034, UC-007 | `content-traceability.md` | Standard | T-W7, T-W8 |
| **T-W10a** | ~~**Method material setup**~~ — topic chips + unit preview + Your own upload; Start gating. | UC-046, UC-029, UC-007 | `method-material-setup.md`, `material-unit.md` | Standard | T-W7, T-W8c, T-MU1 | **Shipped 2026-08-18** — T-E7 |
| **T-W9** | ~~**Word capture**~~ — persist learner sources; full library intake. | UC-012 | `word-capture.md` | **Sensitive** | persistence model | **Shipped 2026-08-18** — `content_sources`, ephemeral cookie |
| **T-W10** | **Reading surface** — tap-to-gloss on source detail shipped v1; remainder: sentence translation, comprehension, runner. | UC-007, UC-030 | [`reading-surface.md`](../specs/feature/reading-surface.md) | Standard / Sensitive | T-W8c, T-W9 | **v1 shipped 2026-08-18** — `/content/[id]` body |
| **T-W11** | ~~**Session loop line (K4)**~~ — **shipped** — `SessionComplete` loop line when newly held lemmas shift source coverage; link to `/content` or source detail. | UC-031 | `content-traceability.md` | Standard | T-W7 |
| **T-W11b** | **Unlock rollup (K2)** — monthly “moved to comfortable” on `/content`; before→after lines on source detail; history snapshots. | UC-033 | `content-traceability.md`, `coverage.md` | **Sensitive** | T-W7, T-W8c |
| **T-LD1** | **Listening defer** — infra shipped; menu UI removed 2026-08-18; UI on mixed stacks — UC-077 | UC-045, UC-077 | `listening-defer.md` | Standard | mixed-stack chrome |
| **T-MU1** | ~~**Material unit resolver**~~ — sentence / paragraph / window / full — **shipped 2026-08-18** | UC-007, UC-028 | `material-unit.md` | Standard | T-W7 |
| **T-MU2** | **Gap selection** — principled listen-and-fill gaps (not alternating) | UC-028 | `material-unit.md` | **Sensitive** | T-MU1 |

**Build order:** T-W7 → T-W8b ∥ T-W8 → T-W8c → T-W10a → T-W9 → T-W10; T-W11
after T-W7; T-W11b after T-W8c. **T-W9 + T-W10a shipped 2026-08-18.**

**T-W9 shipped 2026-08-18** — `content_sources` table, keep-in-library on
material setup, ephemeral cookie for session-only paste.

---

## Phase 4 · Stage-1 words work still outstanding

These are stage 1 in the roadmap but were not in the original Track B engine
table. Queue after phase 0 hygiene, parallel to phase 2 where independent.

| ID | Work | Serves | Notes |
| --- | --- | --- | --- |
| **T-W18** | ~~**UC-012 spec only**~~ — folded into T-W9 `word-capture.md` | UC-012 | **Shipped 2026-08-18** with T-W9 |
| **T-W12** | **UC-006 break return** — overdue prioritisation by frequency + urgency | UC-006 | Extends session-builder; pairs with horizon expand-on-return |
| **T-W16** | ~~**Review horizon v2**~~ — **shipped 2026-08-15** | UC-005, UC-006, UC-063 | Collapsed default, week tile columns, relevance triggers, causal line |
| **T-W17** | ~~**Words home layout parity with Methods**~~ — **shipped 2026-08-16** | UC-063, UC-031 | Canvas intent; `methodSectionSurface` cards; section labels; stat disclosure; reuse `MethodCardHeader` |
| **T-W13** | **UC-013 remainder** — tier-2/3 leech diagnosis | UC-013 | T-B14 remainder in main queue |
| **T-W14** | ~~**UC-069 slice 2** — `next-intl` chrome~~ — **shipped** | UC-069 | T-B11 slice 2 |
| **T-W15** | ~~**UC-069 slice 3**~~ — gloss keys + resolver | UC-069 | **Shipped 2026-08-18** — T-B11c–g in main plan |
| **T-W19** | **UC-076** — card example sentences at coverage band | UC-076 | [`card-example-sentence.md`](../specs/feature/card-example-sentence.md); **T-B11e** (gloss resolver for sentence translation); **T-W7** coverage |
| **T-W19a** | Example sentence bank + per-lemma tags (content) | UC-076 | T-W19 spec |
| **T-W19b** | Picker + review-session UI | UC-076 | T-W19a, T-W19 |

---

## Use-case coverage map

Quick reference: where each vocabulary-heavy use case lands.

| UC | Title | Stage | Spec today | Code today | Next slice |
| --- | --- | --- | --- | --- | --- |
| UC-005 | Trust the schedule | 1 | ✓ | partial (horizon v2; per-card why pending) | review-session G1 |
| UC-006 | Come back after break | 1 | ✓ partial | session + horizon expand | **T-W12** session prioritisation |
| UC-011 | Start in first minute | 1 | ✓ | ✓ | — |
| UC-012 | Capture a word | 1 | ✓ | ✓ (T-W9) | — |
| UC-031 | Map of the language | 2/3 | ✓ partial | partial (bands + orbit + word detail) | T-W11 (loop) |
| UC-032 | Vocabulary milestone | 2 | ✓ | ✓ (T-W1) | — |
| UC-034 | Missing for this episode | 3 | ✓ draft | ✓ (T-W8) | — |
| UC-038 | Why this word | 2/3 | ✓ | partial (word detail + trace) | — |
| UC-041 | Forms not just words | 0/2 | ✓ partial | partial (form-recall) | **T-W20** → T-W21 → T-W6 |
| UC-063 | Get to cards | 1 | ✓ | ✓ | **T-W20** (forms path) |
| UC-022 | Rule when wrong | 3 | ✓ partial | — | **T-W21** |
| UC-078 | Forms without mixed review | 2 | ✓ draft | — | **T-W20** |
| UC-079 | Core vocabulary, natural repetition | 2 | ✓ | ✓ (T-W22) | — |
| UC-069 | App in my language | 1/3 | ✓ | partial (chrome ✓; glosses via resolver) | app-texts AC remainder |
| UC-076 | Example sentence on card | 3 | ✓ draft | — | **T-W19** |
| UC-007 | Read at my level | 3 | ✓ draft | partial (tap-to-gloss v1) | T-W10 remainder |

Full list: 43 vocabulary-touching use cases; 15 with spec links; 8 with meaningful
code. Do not try to link all 28 unlinked use cases until their specs exist —
`check:specs` is correct to warn.

---

## Agent handoff template (words slices)

```markdown
Task: T-Wn <one line>
Change class: Standard | Sensitive
Reuse: <WordsHome | Table | vocabulary-snapshot | …> | Gap: <variant>

Files you may touch: <exact paths>
Files you may NOT touch: docs/study/**, unrelated features, other specs

Serves: UC-NNN
Requires decision: W-n (if any) — must be struck through in IMPLEMENTATION-PLAN first

Requirements:
  1. Given …, when …, then …

Done when:
  - npm run verify green (paste output)
  - spec AC ↔ tests one-to-one
  - IMPLEMENTATION-PLAN + this file updated if queue position changes
```

---

## What not to do

- **Do not** write specs for all 43 vocabulary use cases in one pass — stage order
  exists for a reason.
- **Do not** build reading/listening vocabulary methods before T-W7 coverage
  exists — UC-034 and UC-007 depend on it.
- **Do not** promote `form-practice.md` to active until W-4 is decided — the draft
  explicitly names blockers.
- **Do not** conflate pool atlas with language-wide map without W-2 — overselling
  coverage is the antipattern the product exists to avoid.
