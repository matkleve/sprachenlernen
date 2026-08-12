# Profile

<!-- id: SPEC-page-profile -->
<!-- use-case: UC-024 -->
<!-- status: active -->

The account surface, reached from the top-right corner chip. Holds who you are,
what you are learning, and what you can take away or delete. **Standard** —
it composes existing services and adds no write path of its own beyond the
language actions, which belong to
[`learning-languages.md`](../service/learning-languages.md).

## Scope

- **In:** `/profile` (today's `/account`, renamed), the language list and
  `Add a language`, spoken-language setting ([`spoken-language.md`](../service/spoken-language.md)),
  and the existing export and delete blocks from
  [`account-data.md`](../feature/account-data.md). Sign out moves in here.
- **Out:** measured progress — that stays on [`progress.md`](progress.md) and
  remains a destination. Profile links to it and never restates its numbers;
  maintenance mode (UC-025, later — a combined cross-language budget is not a
  later item, it is rejected, see UC-025).

**Reuse: `ActionLink`, `SubmitButton`, `Dialog`, `Select`** — all already used by
`account-data`. No new primitive.

## Why this is a corner chip and not a destination

[ADR-0009](../../adr/0009-three-destinations.md) rejected a fourth destination
for a profile on the grounds that it is "a link in a corner, not a fifth of the
screen". That still holds, and the design review reached the same place from the
market: burying measured competence behind a profile tab moves the product's
whole argument two taps away. So the three destinations are unchanged, and the
existing top-right sign-out float becomes an **account chip** that opens this
page — the affordance ADR-0009 described, finally built.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps the account chip | `/profile` — email, spoken language, learning languages, export, delete, sign out |
| 2 | Views spoken language | Every shipped spoken language, the current one marked |
| 3 | Changes spoken language | Preference updates; learning languages and review history unchanged |
| 4 | Views learning languages | Every learning language, the active one marked, ordered by when it was added |
| 5 | Taps a non-active language | It becomes active; the interface follows. No session state is lost (UC-025) |
| 6 | Taps `Add a language` | The picker ([`language-picker.md`](language-picker.md)) |
| 7 | Has no language yet | The list is replaced by a single call to action into the picker — never an empty table |
| 8 | Language read fails | The error surface for that block only; export and delete still work |

## States

No client machine beyond the existing delete confirmation dialog. A Server
Component; the language actions are server actions.

## Data

Reads `listLearningLanguages()` and `getSpokenLanguage()`. Shows, per language, the endonym as the primary
label with the English name beneath — `Español` / *Spanish*. **A flag is never
the identifier**: Spanish is not Spain, and a flag alone misnames the language
for most of its speakers.

Each row shows the language and whether it is in focus. When the learner has
reviewed meaning-recall in that language, a one-line standing reads
`347 of 500 starter words held stably` and links to `/progress`, per
[`study/03`](../../study/03-level-model.md)'s rule that every figure opens into
what produced it. Before the first review the row carries no number.

## Acceptance criteria

- [ ] Given an Account with one language, when `/profile` renders, then that
      language appears, is marked active, and its endonym is the primary label.
- [ ] Given an Account with no language, then the list is replaced by a call to
      action into the picker, and no empty table renders.
- [ ] Given a tap on a non-active language, then it becomes active and exactly
      one language is active afterwards.
- [ ] Given the language read fails, then export and delete still render — one
      failed block does not take the page.
- [ ] Given any state, then no measured figure is restated here, and `/progress`
      remains reachable as a destination.
- [ ] Given any state, then sign out is reachable from this page.
- [ ] **Negative:** no streak, no XP, no cards-reviewed total, and no progress
      bar against the starter set — the denominator is a shipped set, not a goal
      ([`study/25`](../../study/25-why-it-does-not-feel-productive.md) C3).

## Check

`npm test -- profile account-data`

## Open

- **Removing a language.** `review_log` rows survive by design, so a removed
  language's count returns if it is re-added. Whether removal is offered at all,
  and what it says about the surviving history, is undecided.
  ⚠ **SPEC GAP** — not implemented until it is.
