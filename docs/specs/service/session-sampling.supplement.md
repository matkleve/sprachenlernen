# Session sampling — supplement

<!-- id: SPEC-service-session-sampling-supplement -->
<!-- parent: SPEC-service-session-sampling -->
<!-- status: draft -->

Formulas, defaults, form staging, and **expected learner reactions** by scenario.
Normative rules stay in the parent; this file owns the math and UX research notes.

## Weight factors

For each candidate task `i`:

```
wᵢ = uᵢ × bᵢ × nᵢ × fᵢ
```

All factors ≥ `ε` (default `1e-6`) so every schedulable card keeps non-zero
probability — **no hard exclusion** except suspended/retired and deck filter.

### Urgency `uᵢ` (FSRS)

```
uᵢ = max(ε, 1 − Rᵢ(now))
```

`Rᵢ` from [`scheduler.md`](scheduler.md) `retrievability(task, now)` on the rebuilt task. Optional
overdue boost (v1 off): `uᵢ × (1 + α × daysOverdue)` with `α` default `0`.

Replaces binary `due ≤ now`: a card with `due` tomorrow but `R = 0.88` can still
appear, with lower weight than `R = 0.55`.

### Foundation bias `bᵢ`

```
φ(H) = 1 / (1 + exp((H − H₀) / τ))

bᵢ = 1 + φ(H) × (β₁·fragileᵢ + β₂·struggledTodayᵢ + β₃·firstSuccessFragileᵢ)
```

| Symbol | Meaning |
| --- | --- |
| `H` | `heldMeaningRecall` count |
| `fragileᵢ` | 1 if task is fragile ([`vocabulary-snapshot.md`](vocabulary-snapshot.md)) |
| `struggledTodayᵢ` | 1 if last grade today is `again` or `hard` |
| `firstSuccessFragileᵢ` | 1 if exactly one successful review ever and last today is `good` |

No boost when last grade today is `good` or `easy` **unless** `firstSuccessFragile`
applies (one success total — still fragile).

### New-load `nᵢ`

For tasks with no reviews:

```
nᵢ = exp(−λ · N_newToday)
```

For tasks with reviews: `nᵢ = 1`.

`N_newToday` = count of tasks that received their **first** review today (any
grade). Soft throttle — at `λ = 0.2`, eight new today → `nᵢ ≈ 0.20` for
remaining new cards.

### Form staging `fᵢ`

For meaning-recall: `fᵢ = 1`.

For form-recall:

```
fᵢ = σ(k · meaningSuccesses)   // logistic, 0 until meaning has ≥1 success
```

Hard gate in [`form-recall-pool.md`](form-recall-pool.md) row 4 is **relaxed** when
sampling ships: `fᵢ` near zero until meaning reviewed; rises toward 1 as meaning
approaches held. Held meaning → `fᵢ = 1`.

## Default config (`DEFAULT_SAMPLING_CONFIG`)

| Key | Default | Role |
| --- | --- | --- |
| `H0` | `50` | Sigmoid midpoint (held lemmas) |
| `tau` | `10` | Sigmoid width — no cliff at 50 |
| `betaFragile` | `2` | β₁ |
| `betaStruggled` | `3` | β₂ |
| `betaFirstGood` | `1` | β₃ |
| `lambdaNewToday` | `0.2` | λ |

Six product parameters. FSRS weights unchanged.

## Sampling algorithm

1. Compute `wᵢ` for all candidates (one row per `wordId` after sibling collapse).
2. Normalize `pᵢ = wᵢ / Σw`.
3. Repeat L times: pick index `j` with probability `p`, remove `j`, renormalize.
4. Attach `samplingReason` = dominant factor (largest contribution among
   `u,b,n,f`).

## Learner reactions by scenario

Qualitative — for copy and AC review ([UC-079](../../use-cases/UC-079-build-a-core-vocabulary-with-natural-repetition.md)).
Evidence: [25](../../study/25-why-it-does-not-feel-productive.md) P2, ch 43–44.

### S1 · First session ever

| Aspect | Likely reaction | Design response |
| --- | --- | --- |
| Content | All new words | Expected — `φ(H) ≈ 1`, few reviews to boost |
| Feel | "Lots of new things" | OK for session 1; copy sets expectation |
| Risk | Overwhelm if L=15 hard | Grades + UC-071 handle struggle inside run |

### S2 · Second session, same day, session 1 went well

| Aspect | Without sampling | With sampling |
| --- | --- | --- |
| Feel | "Only new words — I forgot session 1" | "Some words came back" |
| Reaction | Mistrust, [25](../../study/25-why-it-does-not-feel-productive.md) illusion of no learning | Relief — struggle boost + low `R` on fragile |
| `% new` | Often 60–80% | Target **30–50%** (stochastic) |

### S3 · Second session, same day, session 1 was hard

| Aspect | Reaction | Design |
| --- | --- | --- |
| Content | Many `again`/`hard` from S1 | FSRS due + high `β₂` — old cards likely |
| Feel | "Good, it's making me repeat" | Aligns with effort = learning (if not excessive) |
| Risk | Frustration if >70% repeat | `φ(H)` caps boost; session still mixes some new |

### S4 · Third+ session same day

| Aspect | Reaction | Design |
| --- | --- | --- |
| `N_newToday` high | "Too many new words today" | `nᵢ` drops — new still possible, less likely |
| Feel | Less conveyor-belt | Dose ledger narrative ([25](../../study/25-why-it-does-not-feel-productive.md) F184) later |

### S5 · Approaching 50 held — no cliff

| Aspect | Without soft `φ` | With sigmoid |
| --- | --- | --- |
| At held 49 vs 51 | "App changed overnight" | Imperceptible taper |
| Reaction | Anger at empty Formen + new flood | Gradual return to FSRS-only feel |

### S6 · After ~50 held, one session per day

| Aspect | Expected mix | Reaction |
| --- | --- | --- |
| Cards | ~65% review / ~35% new (simulation) | "Balanced" |
| G1 | Shows `R` and reason | Trust in schedule ([04](../../study/04-flashcards-srs.md)) |

### S7 · After ~50 held, two sessions, S1 all `good`

| Aspect | Risk | Mitigation |
| --- | --- | --- |
| S2 mostly new | Overload, [44](../../study/44-foundation-phase-expert-review.md) worst case ~80% new | `nᵢ` + `uᵢ` on fragile still in pool |
| Reaction | "Punished for doing well" | Copy: *"You cleared the urgent queue — today leans new"* |

### S8 · Empty or short queue

| Cause | Honest reaction | Copy |
| --- | --- | --- |
| Truly nothing schedulable | Rare with sampling | Same as today |
| Low weights everywhere | "Light session" | OK — show 8 cards not 15 |

## Open

- ⚠ **Session-length vs budget minutes** when T-MV5 lands — weights unchanged,
  L varies.
- ⚠ **Seeded RNG in production** — only for tests; prod uses `crypto`.
