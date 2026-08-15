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
| `/words` home | held/fragile/new counts, frequency bands, review horizon (collapsed default; week columns + causal line per [`review-horizon.md`](../specs/feature/review-horizon.md)), vocabulary orbit (+ **Show list**) |
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
| **W-3** | `SKILLS` vocabulary value | method-catalogue coherence | Open |
| **W-4** | ~~Sibling spacing~~ **Answered 2026-08-12:** FSRS `due` between sessions; one Task per Word per session; UC-071 requeue is same Task only | — |
| **W-5** | Incomplete paradigms → form mastery | UC-062 | Open |

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
                → per-cell form breakdown (after W-4/W-5)
```

| ID | Work | Serves | New spec | Class | Depends on |
| --- | --- | --- | --- | --- | --- |
| **T-W1** | ~~**Frequency blocks**~~ — **shipped 2026-08-12** | UC-032 (partial), UC-031 | `frequency-blocks.md`, `lib/frequency-blocks.ts`, `/words` bands UI |
| **T-W2** | **Word detail** — tap an atlas row (or review card) → rank, block, stability, schedule reason, one-action suspend/drop (history preserved). | UC-038 | `docs/specs/feature/word-detail.md` or `docs/specs/page/word.md` | Standard | T-W1 for block label |
| **T-W3** | **Vocabulary map (pool-local v1)** — extend `/words`: show distribution of held/fragile/new/new-hole across frequency bands; textual equivalent required (UC-021). Not language-wide until lexicon runtime. | UC-031 (partial) | extend [`words-home.md`](../specs/feature/words-home.md) | Standard | T-W1, W-2 answered |
| **T-W4** | **T-B3 remainder** — language-wide vocabulary extrapolation, per-skill levels, demonstration sentence. | UC-004, UC-031, UC-054, UC-050 | existing [`progress.md`](../specs/page/progress.md), level-model specs | Standard / Sensitive | calibration (tier A) or widened band; anchor table [C] |
| **T-W5** | **Per-cell form breakdown** — Progress drill-down: held forms by paradigm cell pattern. | UC-062, UC-064 (forms branch) | extend [`form-mastery-signal.md`](../specs/service/form-mastery-signal.md) | Standard | W-5 answered |
| **T-W6** | **Form practice engine** — promote [`form-practice.md`](../specs/service/form-practice.md) from draft; inverse index; session mixing rules. | UC-041 | existing draft + AC file | **Sensitive** | W-4, red-test-first |

**Explicitly not in phase 2:** word capture (UC-012), reading (UC-007), coverage
gaps for content (UC-034) — those are stage 1 capture / stage 3 reading.

---

## Phase 3 · Lexicon runtime and the reading loop (roadmap stage 3)

Do not queue these until phase 2 map is honest at pool scope.

| ID | Work | Serves | New spec | Class |
| --- | --- | --- | --- | --- |
| **T-W7** | **Coverage calculator** — wire `buildLexicon()` into a service; tokenise text, resolve forms, compute % known at lemma level. | UC-007, UC-034, UC-059, UC-029 | `docs/specs/service/coverage.md` | Standard |
| **T-W8** | **Content gap list** — per episode/text: missing word set → schedulable cards with time estimate. | UC-034, UC-059 | `docs/specs/feature/content-gap.md` | Standard |
| **T-W9** | **Word capture** — one-tap add from reading/audio; learner-added words in DB; auto-fill from lexicon. | UC-012 | `docs/specs/service/word-capture.md`, `docs/specs/feature/word-capture-ui.md` | **Sensitive** |
| **T-W10** | **Reading surface** — graded texts, tap word, tap sentence, post-read comprehension. | UC-007, UC-030 | reading feature specs (new) | Standard / Sensitive |

**T-W9 blocks on:** persistence model for learner-owned words (not in starter
pool), dedup by `wordId`, source-sentence storage — all Sensitive.

---

## Phase 4 · Stage-1 words work still outstanding

These are stage 1 in the roadmap but were not in the original Track B engine
table. Queue after phase 0 hygiene, parallel to phase 2 where independent.

| ID | Work | Serves | Notes |
| --- | --- | --- | --- |
| **T-W11** | **UC-012 spec only** (stage 2 implement) | UC-012 | Write spec + AC; defer implementation until T-W7 lexicon can auto-fill |
| **T-W12** | **UC-006 break return** — overdue prioritisation by frequency + urgency | UC-006 | Extends session-builder; pairs with horizon expand-on-return |
| **T-W16** | **Review horizon v2** — collapsed default, relevance triggers, four week tile columns, causal peak line, week drill-down. **Owner go required before code.** | UC-005, UC-006, UC-063 | Spec: [`review-horizon.md`](../specs/feature/review-horizon.md). Standard class. Independent of T-W12. |
| **T-W13** | **UC-013 remainder** — tier-2/3 leech diagnosis | UC-013 | T-B14 remainder in main queue |
| **T-W14** | **UC-069 slice 2** — `next-intl` chrome | UC-069 | T-B11 remainder |
| **T-W15** | **UC-069 slice 3** — `app_texts` description tables | UC-069 | Unblocks non-English glosses; closes starter-deck SPEC GAP |

---

## Use-case coverage map

Quick reference: where each vocabulary-heavy use case lands.

| UC | Title | Stage | Spec today | Code today | Next slice |
| --- | --- | --- | --- | --- | --- |
| UC-005 | Trust the schedule | 1 | ✓ | partial (bar chart; no causal line, no collapse) | **T-W16** + review-session G1 |
| UC-006 | Come back after break | 1 | ✓ partial | session only | **T-W12**, **T-W16** expand + plan copy |
| UC-011 | Start in first minute | 1 | ✓ | ✓ | — |
| UC-012 | Capture a word | 1 | — | — | T-W11 spec, T-W9 build |
| UC-031 | Map of the language | 2 | ✓ partial | partial (bands + orbit) | T-W3 |
| UC-032 | Vocabulary milestone | 2 | — | — | T-W1 |
| UC-034 | Missing for this episode | 3 | — | — | T-W8 |
| UC-038 | Why this word | 2 | — | — | T-W2 |
| UC-041 | Forms not just words | 0/2 | ✓ partial | partial (form-recall) | T-W6 |
| UC-063 | Get to cards | 1 | ✓ | ✓ (horizon v1 bar chart) | **T-W16** collapse + week tiles |
| UC-069 | App in my language | 1 | ✓ | partial | T-W14, T-W15 |
| UC-007 | Read at my level | 3 | — | — | T-W10 |

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
