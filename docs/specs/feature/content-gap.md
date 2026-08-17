# Content gap list

<!-- id: SPEC-feature-content-gap -->
<!-- use-case: UC-034 -->
<!-- use-case: UC-059 -->
<!-- status: active -->

For a demanding Source, lists the **specific lemmas** that stand between the
learner and the comfortable band (95 % coverage), and offers them as a
schedulable set. Consumes [`coverage.md`](../service/coverage.md); loop framing
in [`content-traceability.md`](content-traceability.md).

## Scope

- **In:** gap derivation (reverse coverage), source-detail gap section, “learn
  as a set” action on starter-pool lemmas, time estimate from recent pace.
- **Out:** guaranteeing comprehension after the set; generating easier content;
  gap sets that require words outside the starter pool (those need T-W9);
  UC-059 method-detail copy (reuses arithmetic, separate surface).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens a demanding source | Gap section: “{n} words to comfortable (95 %)” + ordered list (lemma, rank, gloss) |
| 2 | Gap count ≤ **40** | **Learn as a set** schedules those lemmas ahead of other new cards |
| 3 | Gap count &gt; **40** | No full list — plain copy + closest lower-demand source |
| 4 | Taps a gap lemma | Navigates to word on `/words` (orbit/list selection when wired) |
| 5 | Finishes a gap set | Source detail shows updated coverage; offers the item — payoff is experienced (UC-034) |

### Gap derivation

Rank candidate lemmas in the source by **frequency rank ascending** (highest
value first). Greedily add held→unknown flips until coverage ≥ 95 % or candidates
exhausted. Same algorithm for UC-059 method gaps — one function, two surfaces.

### Time estimate

From the learner’s mean **new lemmas held per day** over the last 14 days.
Show range: `ceil(n / pace)` days ± one day when pace variance is high. Never a
flat number without basis.

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `no-gap` | coverage ≥ 95 % | Gap section hidden; comfortable copy only | no |
| `gap-list` | below 95 %, count ≤ cap | Full list + CTA | no |
| `gap-too-large` | below 95 %, count &gt; **40** | Summary + alternate source link | no |
| `set-active` | learner started set | CTA shows progress “{k} of {n}” | no |
| `set-complete` | all gap lemmas held | Congratulations + open source | yes |

## Acceptance criteria

- [ ] Given a source at 91 % with 23 lemmas to 95 %, when detail renders, then
      all 23 are listed in frequency order and the demanding loop line is shown.
- [ ] Given gap count above **40**, when detail renders, then **no** 400-word
      list appears and an alternate source is named.
- [ ] Given **Learn as a set**, when confirmed, then only starter-pool cards are
      created or prioritised — **no** parallel card system.
- [ ] Given a gap lemma row, when activated, then rank and lemma are readable
      without a chart (UC-021).

## Check

`npm test -- content-gap coverage`
