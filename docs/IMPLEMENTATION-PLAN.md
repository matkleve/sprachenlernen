# Implementation plan

**Written 2026-08-08. "Where the code actually is" and the decision list last
synced 2026-08-20 (content ingestion/adaptation queue, T-MV7 filter-only,
owner duration decisions).** What to build
next in *code*, in what order, and how to hand each piece to a coding agent
that should make as few decisions as possible.

**This is the project's one queue/backlog file** — the answer to "where do
open tickets live." There is deliberately no separate kanban board or issue
tracker: a second place to list "what's outstanding" would drift from this
one, and `AGENTS.md`'s whole stance is one source of truth per question, not
two that might disagree. What plays that role instead, each read at a
different moment (see [`README.md`](README.md), "Three kinds of memory"):

- **This file** — what's queued, and what's blocking it, project-wide.
- [`IDEAS.md`](IDEAS.md) — a raw mechanism someone noticed, before it is even
  a use case.
- **A `⚠ SPEC GAP` inside a use case or spec** — one open question that blocks
  *that* item specifically, resolved in the same file it blocks.

**Keeping this current is part of finishing a docs-only session**, the same
way the diary already is (`AGENTS.md`, "Working with the user"): when a
`⚠ SPEC GAP` is opened, closed, or a use case graduates, sync the "What needs
a decision from you" list below in the same session, not later.

**What this file owns, and what it does not.** It owns the queue: which task is
next, who can safely do it, and what "done" means for that task.
[`study/11-roadmap-open-questions.md`](study/11-roadmap-open-questions.md) owns
the **product** order — which stage comes before which, and why. Specs in
[`specs/`](specs/) own **behaviour**. When this file and a spec disagree, the spec
wins and this file is stale. Nothing normative may live only here.

---

## Where the code actually is

| Layer | State |
| --- | --- |
| `lib/scheduler.ts` | FSRS-4.5, complete, adversarially reviewed, 48 tests. Spec **active** |
| `lib/lexicon.ts` + `lib/lemma-table.ts` | Profiles, tokenising, resolution with paradigm cells, tier derivation. 69 tests. Spec **active** |
| `data/` | Spanish and Italian: frequency lists **and** lemma tables. Both at **quality tier B** |
| `lib/method-catalogue.ts` + `data/methods/` | 53 methods, 6 commitments, 7 context presets. Schema, validation, context filter. 34 tests. Spec **active** |
| `components/ui/` | Button, Field, Input, Select, Dialog, Table — inherited from Grundriss, specced, tested |
| `features/` | `item-picker` and `primitives` — **both are the starter's worked examples**. `language-status` is the first that is not; `auth` (T-B8) adds `/signup` and `/login`, built only from `Field` and `Button`; `app-shell` and `method-menu` (T-B10) add the three destinations and the front door |
| `lib/db/` | **Shipped 2026-08-09** (T-B8), **grown since** as multi-language landed. Supabase client factory, `signUp`/`signIn`/`signOut`/`getAccount`, `middleware.ts` session refresh, the `review_log` RLS migration — applied to the live project; plus `learning-languages.ts`, `learner-pools.ts` (`poolForActiveLanguage`, T-B12), `language-holdings.ts`, `review-write-queue.ts`. Spec **active**. 7 files, 63 tests total — the §8 access-control suite alone is now 9 tests, not 5, since `learner_language` RLS joined it |
| `app/(marketing)/` | The public half, no app shell: `/` (T-04's holding page), `/languages` (T-03), `/login`, `/signup`, `/primitives`. Split out 2026-08-09 to implement [ADR-0010](adr/0010-the-route-model.md) |
| `app/(app)/` | The signed-in half, under the shell's three destinations: `/methods` (T-B10), `/words` + `/words/review` (T-B1), `/progress` (T-B3) |
| `lib/db/review-log.ts` + `lib/installation-id.ts` | **Shipped 2026-08-09** (T-B2). Append-only adapter, owner taken from the session, payload migration applied live. Spec **active** |
| `lib/starter-deck.ts` + `lib/session-builder.ts` | **Shipped 2026-08-09** (T-B1). Spanish **expanded 2026-08-12** to 2000 lemmas; **Italian shipped 2026-08-12** at the same tier (2000 lemmas) — see [`starter-deck.second-language.md`](specs/service/starter-deck.second-language.md). 15-card queue, due-before-new, one language per session (T-B12). Specs **active** |
| `features/review-session/` | **Shipped 2026-08-09** (T-B1). The FSM, the card, the summary. Grades persist one row each. Specs **active** |
| `lib/shell-page-layout.ts` + `ShellPageContent` | **Shipped 2026-08-15**. Route → layout mode registry and shared page wrapper. Spec [`page-layout.md`](specs/feature/page-layout.md) **active** |

**Track B core shipped 2026-08-11.** A signed-in learner can sign up, open
`/methods`, review a 15-card SRS session, see pool-local standing on Methods and
Progress, and export or delete their account. The landing page leads with thesis
1 and names the honest time denominator (thesis 12). What is still missing is
not plumbing — it is the **language engine**: a frequency-ranked pool large
enough to estimate vocabulary, form→lemma tables with paradigm cells, real skill
levels, full offline/PWA practice, and the method-menu surfaces that need effect
data (demonstration sentence, readiness).

---

## Where storage stands, now that question 16 is answered

**Answered 2026-08-08 in two records.**
[ADR-0005](adr/0005-local-first-review-log-with-accounts-as-an-addition.md) fixed
the log's shape: append-only, one UUID per review, an installation id, and no
component that knows where it lives. [ADR-0006](adr/0006-require-an-account.md)
then made **an account required**, which puts the server and authentication inside
stage 1 and makes the row owner non-null from the first row. The browser store
remains, as the offline write path and cache rather than the authority.

What that changes for this queue:

1. **Nothing in Track A moves**, because none of it persists anything or reads a
   session. The sequence below is unaffected, and that is now its main virtue:
   it is the only work that can proceed while auth does not exist.
2. **Four properties are non-negotiable in every write path**: append-only,
   per-review UUID, **non-null owner**, and no component that knows where the log
   lives. A brief that omits any of them is not ready to hand out.
3. **Track B gained a task and reordered.** Authentication (T-B8) is no longer
   last — it is the gate for persistence, which is the gate for everything else.
   The chain is T-B8 → T-B2 → T-B1.
4. **The provider is decided: Supabase**, project `lnkgmjcueahhrzpnzmwq`
   ([ADR-0007](adr/0007-supabase-as-the-provider.md)). Its MCP server and the
   `supabase` / `supabase-postgres-best-practices` skills are installed
   (`.cursor/mcp.json`, `.agents/skills/`). T-B8 is now specifiable rather than
   blocked.
5. **`/` is the landing page, and the app is not on it.** The first product screen
   therefore gets its own route — T-03 no longer takes the home route, and the
   real landing page becomes its own piece of work (T-B7). With a required
   account, the landing page is also the whole of what a signed-out visitor ever
   sees, which raises its stakes rather than lowering them.
   **Settled 2026-08-09** by [ADR-0010](adr/0010-the-route-model.md), which held
   this sentence and scoped ADR-0009's competing one: the app's default route is
   `/methods`, and `/` stays the landing page.

Still ahead of stage 2: **the vocabulary estimate (F17–F22)**, now unblocked on
the data side, because tier B means a level *may* be claimed with a widened band.

**T-B8 is done, and the migration is live.** Spec
[`docs/specs/service/auth.md`](specs/service/auth.md), `lib/db/`, `middleware.ts`,
`/signup`, `/login` and
[`supabase/migrations/20260809073100_review_log_ownership.sql`](../supabase/migrations/20260809073100_review_log_ownership.sql)
are written, reviewed and merged; the migration was applied to the live project
(`lnkgmjcueahhrzpnzmwq`) on 2026-08-09 via `supabase db push`, and `npm run
verify` is green in full — including the five §8 access-control tests, which now
prove the RLS policy against the real database rather than describing it.

**Applying a migration needs two secrets the app itself never reads**:
`SUPABASE_ACCESS_TOKEN` (Management API, what `supabase link` authenticates
with) and `SUPABASE_DB_PASSWORD` (the Postgres connection `supabase db push`
opens). `NEXT_PUBLIC_SUPABASE_URL`, the publishable key and the service-role key
reach only PostgREST and Auth — they cannot run DDL, which is why the first pass
at T-B8 could not finish this step. Worth remembering before queueing any task
whose "done" includes a schema change.

**T-B2 and T-B1 both shipped the same day, and the chain T-B8 → T-B2 → T-B1 is
closed.** A signed-in learner can open `/words/review?method=srs-session`, work
a 15-card queue built from the starter deck and their own history, and every
grade appends one row they own. What that unblocks is T-B3: `/progress` is the
last holding page, and it is now the only destination with nothing behind it.

**The honest limit on all of it:** two languages (Spanish, Italian, each fully
isolated per UC-025 — no combined budget, no mixed sessions), two task types
per language (meaning-recall and form-recall, once meaning-recall is held), a
**2000-lemma** starter pool per language (stage 2 of engine expansion), and
progress that stops at pool-local counts — no CEFR skill levels yet. The
plumbing is real; the measurement only becomes a language claim once the pool
and form tables grow further (2,953-lemma ceiling on the current pipeline).

---

## How to hand a task to a low-reasoning agent

Three things make the difference between a task Composer 2.5 finishes cleanly and
one it improvises through.

**Move every decision out of the implementation and into the spec.** A brief that
says "add a hover state" invites invention. A brief that says
`hover:border-line-strong, matching Button's secondary variant` does not. If a
task still contains a judgement call, it does not belong in Track A.

**The gate makes spec-first mean spec-and-test-together.** `check:specs` verifies
that a spec's `## Check` line names a test file that exists
(`scripts/check-specs.mjs:165`). So a spec cannot be committed before its test —
the order inside one commit is spec, then failing test, then implementation.
An agent told only "write the spec first" will produce a red gate and then start
guessing.

**Name the files it may touch, and the ones it may not.** Most damage in this
repo comes from a task widening while nobody is looking.

### Brief template

```markdown
Task: T-NN <one line>
Change class: Trivial | Standard | Sensitive
Reuse: <existing component name> | Gap: <the missing variant>

Files you may touch: <exact paths>
Files you may NOT touch: everything else. In particular do not edit
  docs/study/**, other specs, or unrelated components.

Why this is needed: <one sentence a reviewer can check>

Requirements (each becomes one acceptance criterion, each becomes one test):
  1. Given …, when …, then …
  2. …

Guardrails:
  - <the specific TRAPS.md entry this task can trip over, by name>

Done when:
  - `npm run verify` is green and pasted (run it as its own command — never pipe
    it into `tail`, which throws the exit code away)
  - the spec's acceptance criteria match the tests one-to-one
```

---

## Track A · Safe for a low-reasoning agent, in order

Every task here is mechanical, needs no product decision, persists nothing, and
has an existing spec to update rather than a new contract to invent.

### ~~T-01 · Dialog announces its description, and stops hardcoding an id~~ — **shipped 2026-08-09**

Both defects fixed as written, with `useId()`. Three criteria, three tests, ten
green in `dialog.test.tsx`. The omission test — no `description` means no
`aria-describedby` — **passed on arrival**, because the attribute was never set
at all; kept as the regression guard, on the same reasoning T-02 gives below.
The requirements stay as the record of what was agreed; the spec governs.

**Class:** Standard · **Reuse:** Dialog · **Files:** `components/ui/Dialog.tsx`,
`components/ui/dialog.test.tsx`, `docs/specs/component/dialog.md`

Two defects, both invisible to every gate. The `description` prop renders as a
paragraph but is never wired to `aria-describedby`, so a screen reader announces
the title and not the sentence explaining the consequence — on a component whose
main use is confirming destructive actions. And the title id is the literal
string `dialog-title`, so two mounted dialogs produce duplicate ids and an
ambiguous accessible name.

Requirements:

1. Given a dialog with a `description`, when it is open, then its accessible
   description is that text.
2. Given a dialog with no `description`, when it is open, then no
   `aria-describedby` attribute is present — the same rule Field already applies
   to `aria-invalid` (`components/ui/Field.tsx:39`): absent, not empty.
3. Given two dialogs rendered at once, then their title ids differ. Use React's
   `useId()`.

Guardrail: *"Automated a11y checks only see what is rendered and visible"* — the
axe assertion must run with the dialog **open**.

### ~~T-02 · The Space key gets the test the spec already promises~~ — **shipped 2026-08-09**

Passed on the first run, as anticipated, and kept — with the extra step the task
did not ask for: it was **mutation-tested**. Swapping the row's `<button>` for a
`<div role="button" tabIndex={0}>` turns it red, along with the Enter test, so it
is a guard and not decoration. `ItemPicker.tsx` is unchanged. The spec's
acceptance criteria gained the `Space` line its Behavior table had promised
since it was written.


**Class:** Trivial · **Files:** `features/item-picker/item-picker.test.tsx` (and
`ItemPicker.tsx` only if the test fails)

`docs/specs/feature/item-picker.md:29` requires Enter **or** Space to select. Only
Enter is tested. Native `<button>` should make Space work already — so if the new
test passes on the first run, **keep it and say so in the PR**; it is a regression
guard, and deleting a test because it was green on arrival is how the criterion
goes unenforced again. If it fails, that is a real bug and the fix belongs in the
same commit.

### ~~T-03 · The language status page~~ — **shipped 2026-08-09**

Built as specced, at `/languages`, with `docs/specs/page/language-status.md`
**active** and 15 tests. `Reuse: Table` — no new component, and the guardrail
below held: nothing needed a card. The requirements are kept below because they
are now the record of what was agreed, and the spec is what governs.

**Class:** Standard · **Reuse:** Table · **Serves:**
[`use-cases/UC-036-know-how-much-to-trust-this-language.md`](use-cases/UC-036-know-how-much-to-trust-this-language.md)
· **New spec:** `docs/specs/page/language-status.md` (`SPEC-page-language-status`)
· **Route:** `/languages`

> **No longer "the first surface" (2026-08-08).** The method menu is
> ([`study/11-roadmap-open-questions.md`](study/11-roadmap-open-questions.md),
> stage 1 — the user's correction that flashcards is one method among many). T-03
> stays in the queue and stays first *in Track A*, because it is still the largest
> honest surface a low-inference agent can build with no auth, no persistence and
> no new spec decisions. It is now a supporting page, not the front door.

The smallest screen that is *this* product: for each shipped language, what the
app can and cannot claim, and why. Every value on it is already derived by code
that exists — nothing is invented, nothing is stored, no state machine is
involved, and it is a Server Component.

It lives at `/languages`, **not** at `/`, because the home route is the landing
page (ADR-0006 — the app is behind the landing page, not instead of it). It is
**reachable without signing in**, since it contains no user data and every value
on it is a property of the shipped language data rather than of a learner. That is
also why it is still first in the queue: with an account now required, this is the
only product surface that can be built and looked at before authentication
exists. The route name is the one thing here you can change with a one-line
instruction; everything else is derived from data.

It is worth building first because it is the product's whole argument in one
screen. Every competitor shows a number and hides its provenance
([`study/25-why-it-does-not-feel-productive.md`](study/25-why-it-does-not-feel-productive.md)
C3); this screen shows the provenance before it shows any number.

Requirements:

1. For each profile in `data/languages/`, the page shows the language name, its
   derived quality tier, and the frequency source with its version — all read
   through `lib/lexicon.ts`, never hardcoded.
2. Each language states in one sentence what is claimed at its tier and in one
   sentence what is not. At tier C the words "no level is claimed" appear.
3. The tier is presented as derived, with the reason visible: the app says *which
   artefact* is missing for the next tier.
4. All copy lives in a `content.ts`, not in JSX.
5. It is a Server Component with no `"use client"`.
6. It reads no user data and writes none — so it renders identically for a
   signed-out visitor, which is the whole reason it can be built before storage
   exists.
7. Axe-clean, and the table carries a caption and `scope` on every header, which
   `components/ui/Table.tsx` requires anyway.

Guardrails: do **not** delete `features/item-picker/` or `features/primitives/` in
this task — see T-B5, they are load-bearing for the docs. Do not add a new
component: if a card-like container seems necessary, use the Table primitive and
say `Gap:` in the PR instead of creating one.

### ~~T-04 · Only after T-03: the Grundriss demo stops owning the home route~~ — **shipped 2026-08-09**

Done as written, once [ADR-0010](adr/0010-the-route-model.md) settled what `/`
is. The demo is at `/primitives`, `/` is a holding page carrying one sentence
quoted verbatim from the study and a link to `/languages`, and the root layout
stopped titling every page "Grundriss". The real landing page is still T-B7.

**Class:** Trivial · **Files:** the home and demo routes (since moved into
`app/(marketing)/` by ADR-0010's route groups), `features/primitives/**`

The demo moves to `/primitives`, where it stays useful as the worked example the
docs point at (see T-B5 — do not delete it). `/` then becomes a **holding page**:
one sentence saying what this product is, taken verbatim from the study rather
than written fresh, and a link to `/languages`.

It is explicitly not the landing page. Positioning copy is a decision nobody has
made yet, and inventing it here would be exactly the kind of quiet
scope-widening this plan exists to prevent — the real one is T-B7. What this task
buys is that nobody opening the repo concludes the product is a component
showcase.

---

## Track B · Needs a spec written by a thinking model first

Not because they are large, but because each one contains decisions that a
low-inference agent would silently invent.

| # | Work | Why it is not Track A |
| --- | --- | --- |
| ~~**T-B8**~~ | ~~Accounts and authentication on Supabase~~ — **shipped 2026-08-09** | **Sensitive.** `docs/specs/service/auth.md`, `lib/db/`, `middleware.ts`, `/signup`, `/login`, the `review_log` RLS migration (applied to the live project) and its §8 access-control test, all green |
| ~~**T-B2**~~ | ~~Persistence of the review log~~ — **shipped 2026-08-09** | **Sensitive.** [`specs/service/review-log.md`](specs/service/review-log.md), `lib/db/review-log.ts`, `lib/installation-id.ts`, and `20260809180000_review_log_payload.sql` applied to the live project. All four ADR-0005/0006 properties hold. Audited again 2026-08-09 (evening): coverage was pointing at a superseded function, now at the one the session builder actually calls |
| ~~**T-B1**~~ | ~~The review session surface~~ — **shipped 2026-08-09** | **Sensitive.** [`specs/feature/review-session.md`](specs/feature/review-session.md) + [`.states.md`](specs/feature/review-session.states.md), `features/review-session/`, `/words/review`. Flip-then-grade (back before grade) matches FSRS semantics; spec AC updated 2026-08-10 |
| ~~**T-B3a**~~ | ~~Held-stability taxonomy~~ — **shipped 2026-08-12** | **Standard.** Separate held vs graduation thresholds; fragile buckets; `isTaskHeld` for counts and form staging |
| **T-B3** | Vocabulary estimate and the level display (F17–F22) | **Pool-local vocabulary shipped** (F17 narrowed). Language-wide extrapolation + CEFR skill/overall levels (F18–F22) blocked — anchor table [C], pool too small |
| **T-B10b** | Method menu learner half | **Standing + daily three + demonstration sentence shipped**; readiness still out |
| **T-B10c** | Method surfaces UX — badges, card headers, detail layout, chip fix | **Shipped 2026-08-15.** study/27. Skill/evidence/effort badge row (plain labels on cards), section header graphics, detail article layout (Practical → Trains → doesNotDo; evidence in disclosure) |
| **T-B10d** | Method surfaces property audit — align UI to study/36 | **Shipped 2026-08-16.** Plain effort on detail band; evidence disclosure-only; effort anchor in Practical; all requirement chips on cards; full-bleed hero kept |
| **T-B10e** | Composite skill-tier badges + effort dots | **Shipped 2026-08-18.** Evidence+value tiers, wood/cap/`+`, PNG assets from grid, cards + detail |
| **T-B10f-a** | Method card polish — code | **Shipped 2026-08-18** — header layout, title, badge wrapper; owner LIVE CHECK **failed** on art |
| **T-B10f-b** | Method card polish — assets + layout v2 | **In progress 2026-08-18** — `object-contain` header, 48px shields, padded PNGs |
| **T-B10g** | Method card destination marker — Start / Info, summary ink | **Shipped 2026-08-18** — [`plans/method-card-destination.md`](plans/method-card-destination.md) |
| **T-B10h** | Method menu filter chips — icons + multi-select | **Shipped 2026-08-20** — Lucide marks on skill/energy/refine pills; OR multi-select per dimension; comma-separated URL params |
| **T-B4** | Dose ledger (F184) | **Denominator shipped** on `/progress` (question 19, first branch). **Numerator** (hours you practised) still out — needs practice-time logging beyond card `latency_ms` |
| ~~**T-B7**~~ | ~~The landing page~~ — **shipped 2026-08-11** | Thesis 1 headline + thesis 12 time honesty in body |
| ~~**T-B10**~~ | ~~The method menu — the product's front door~~ — **shipped 2026-08-09** | Filters, time scale, hosted routing. Learner half continued in T-B10b |
| ~~**T-B5**~~ | ~~Retire the Grundriss worked examples~~ — **shipped 2026-08-10** | `/account` uses `Select` + `Dialog` (UC-024); demos removed; `/primitives` → `/languages` |
| **T-B9** | Offline practice + sync (F192, UC-018) | **Owner direction: both** — online sync across devices *and* offline review (train/PWA). Needs ADR-0011 closed on Option B (local-first queue is partial — see [`review-write-queue.md`](specs/service/review-write-queue.md)); full offline still needs cached deck + scheduler |
| **T-B11** | Spoken-language + localized glosses ([UC-069](use-cases/UC-069-use-the-app-in-my-own-language.md)) | **Slices 1–3 shipped 2026-08-18** — chrome (`next-intl`), gloss resolver + snapshots (T-B11c–g below). **Remainder:** DB-backed snapshot export + draft RLS AC ([`app-texts.md`](specs/service/app-texts.md) AC) |
| **T-B11c** | `app_texts` tables + seed from starter `back`/`front` English | **Sensitive** | T-B11 slice 1 | [`app-texts.md`](specs/service/app-texts.md) | **import script shipped 2026-08-18** — `npm run import:app-texts` |
| **T-B11d** | Snapshot export + `gloss-resolver` + DE publish path | Standard | T-B11c | [`gloss-resolver.md`](specs/service/gloss-resolver.md) | **shipped 2026-08-18** |
| **T-B11e** | Wire review session, reading, gap list, demonstration sentence | Standard | T-B11d | UC-069 AC | **shipped 2026-08-18** |
| **T-B11f** | Pool migration: `descriptionKey` in JSON; drop inline `back` | Standard | T-B11e | [`starter-deck.md`](specs/service/starter-deck.md) | **shipped 2026-08-18** |
| **T-B11g** | Method catalogue copy in spoken language ([UC-069](use-cases/UC-069-use-the-app-in-my-own-language.md)) | Standard | T-B11 slice 2 | [`method-catalogue.i18n.md`](specs/service/method-catalogue.i18n.md) | **shipped 2026-08-18** — `localize-method-entry`, `messages/*/entries`, sync script |
| **T-B11h** | Chrome i18n stragglers — card report, demonstration sentence, reading gloss, weekly reflection | Standard | T-B11 slice 2 | [`chrome-i18n-stragglers.md`](specs/service/chrome-i18n-stragglers.md) | **shipped 2026-08-20** |
| **T-B12** | ~~Scope `poolForScheduling` to the active language only~~ — **done 2026-08-12** ([UC-025](use-cases/UC-025-learn-multiple-languages.md)) | `poolForScheduling` and `poolForDisplay` (`lib/db/learner-pools.ts`) merged into one `poolForActiveLanguage()`, since the reason they differed — a cross-language budget — was rejected. `buildSessionAction` now calls it; a session can no longer contain more than one language's cards, and the `languageName` label is always correct as a result. Regression test: `learner-pools.test.ts` |
| **T-B13** | ~~Same-session card requeue ([UC-071](use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md))~~ — **shipped 2026-08-12** | **Sensitive.** [`lib/review-session-requeue.ts`](../lib/review-session-requeue.ts), `useReviewSession` re-insert on `again`/`hard`; [ADR-0012](adr/0012-ux-decisions-requeue-i18n-leech-nav.md) decisions 12–13 |
| **T-B14** | Broken-card flagging + leech diagnosis ([UC-023](use-cases/UC-023-report-something-wrong.md), [UC-013](use-cases/UC-013-stop-losing-time-on-one-card.md)) | **T-B14a/b shipped 2026-08-16** — [`StatusBanner`](../components/ui/StatusBanner.tsx), [`CardReportPopover`](../features/review-session/CardReportPopover.tsx), optional `category`/`note` on `card_content_flag` ([UC-073](use-cases/UC-073-explain-what-is-wrong-with-a-card.md), [UC-074](use-cases/UC-074-know-my-report-was-received.md), [study/34](study/34-review-report-and-acknowledgement-ux.md)). **Remaining:** T-B14c scheduling-intent toggle (deferred); UC-013 tier-2/3 diagnosis. **Sensitive** |
| **T-B15** | Maintenance mode per language ([UC-025](use-cases/UC-025-learn-multiple-languages.md)) | **Not spec-ready** — no per-language flag exists. Moved 2026-08-12 from [`plans/multi-language.md`](plans/multi-language.md) table item 10, so it has exactly one tracked home. The best-evidenced item in that plan's 2026-08-11 review (Cepeda et al. 2008, Bahrick et al. 1993: 10–20% of the retention interval as the review gap) and the one piece of that review's recommendation not yet built |
---

### Track B engine phase — what is next (2026-08-11)

Track B **core** (auth → review → shell → methods → progress → landing → account)
is done. The queue below is the **engine** — everything that turns the plumbing
into a language claim. Order is load-bearing: the pool unlocks T-B3; forms unlock
honest Spanish/Italian; offline unlocks commute practice.

| Priority | Work | Unblocks |
| --- | --- | --- |
| **1** | ~~**Expand the word pool(s)**~~ — Spanish **stage 1 shipped 2026-08-11** (500 lemmas), **stage 2 shipped 2026-08-12** (2000 lemmas); **Italian shipped 2026-08-12** at the same tier (2000 lemmas, see [`starter-deck.second-language.md`](specs/service/starter-deck.second-language.md)). Pipeline ceiling **2,953** lemmas per language. | Language-wide vocabulary estimate; honest progress |
| **2** | ~~**Form→lemma tables with paradigm cells**~~ — **data shipped 2026-08-08** (`data/lemma/es.json`, `it.json`, `lib/lexicon.ts`). **Form-recall pool + staging shipped** — [`form-recall-pool.md`](specs/service/form-recall-pool.md): **1704** Spanish, **1542** Italian surface forms, scheduled after meaning-recall is held. **Form-mastery signal shipped** — [`form-mastery-signal.md`](specs/service/form-mastery-signal.md): pool-local held-form count on Progress; form-recall grade prompt in review session. **Bug found and fixed 2026-08-12:** the Words atlas (`features/words/`) fed both task types into one snapshot meant for one deck, double-counting every lemma with a distinct form and pushing lower-ranked words out of the capped top-100 view — fixed by filtering to meaning-recall before the snapshot; see `features/words/reading.test.ts`. | Paradigm-table method; per-cell form breakdown |
| **3** | ~~**T-B3a Held-stability taxonomy**~~ — **shipped 2026-08-12**: `heldStabilityThreshold` (7d) separate from graduation; `isTaskHeld`; fragile replaces shaky; mature on atlas | Honest held counts; form-recall staging; UC-064 vocabulary branch |
| **4** | **T-B3 remainder** — extrapolation + per-skill levels once (1) and calibration exist | F18–F22; demonstration sentence |
| **5** | **T-B9 / offline-PWA** — cache deck + scheduler; flush queue on reconnect (ADR-0011 Option B) | UC-018 commute practice; installable PWA |
| **6** | ~~**T-B10c** — method badges + detail layout~~ — **shipped 2026-08-15** | Scannable catalogue; fixes two-line chip + truncated-title UX |
| **6b** | ~~**T-B10d** — property audit alignment ([`study/36`](study/36-method-surfaces-property-audit.md))~~ — **shipped 2026-08-16** | Plain effort everywhere; all requirement chips on cards; evidence disclosure-only on detail |
| **6c** | ~~**T-B10e** — composite tier badges, effort dots, real assets~~ — **shipped 2026-08-18** | [`skill-tier.md`](specs/service/skill-tier.md); `scripts/slice-skill-tier-badges.py` |
| **6d** | **T-B10f-b** — method card polish assets | **Blocked** — section WebP re-compose + shield card PNGs |
| **6e** | **T-B10g** — card destination marker | **Shipped 2026-08-18** — [`plans/method-card-destination.md`](plans/method-card-destination.md); **routing fix 2026-08-19** — exercise cards → overview before `/practice` |
| **7** | **T-B10b remainder** — ~~demonstration sentence~~ **shipped 2026-08-16**; readiness ([`study/26`](study/26-readiness-and-difficulty.md)) | Methods front door complete |
| **7b** | ~~**Exercise runner** (T-E0–E9, T-MU*, T-LD1, T-E12)~~ — **shipped 2026-08-18**; six hosted runners + practice-surface UX | UC-049 |
| **7c** | ~~**Method viability + session budget** (T-MV1–T-MV5 shipped; **T-MV7–T-MV8** filter-only + catalogue packages)~~ — **shipped 2026-08-20** | Menu filter ≠ session size; all variant chips on detail; SRS fixed 15 cards |
| **7d** | **Content ingestion + adaptation** (T-CI1–T-CI6) — study/48; specs draft | Licence-cleared news at target level (UC-007, UC-030); paste URL (UC-029) |
| **8** | **T-B4 numerator** — guided hours practised (thesis 9: not card time alone) | Progress per hour invested (study/03 V3) |

**Still partial in Track B:** T-B3 (pool-local only), T-B10b (standing + daily
three shipped; readiness out), **T-B10f** (code shipped; **assets blocked** on
study/40), T-B4 (denominator only), T-B9 (multi-device share works; full offline
does not). **T-W16** review horizon v2 shipped 2026-08-15.

### Track B · Exercise runner (UC-049) — specced 2026-08-17

Cooking-app runner for multi-step Methods (dictation, writing, listening drills).
**Specs:** [`exercise-runner.md`](specs/feature/exercise-runner.md),
[`practice-surface.md`](specs/feature/practice-surface.md),
[`exercise-runner.layout.md`](specs/feature/exercise-runner.layout.md),
[`practice.md`](specs/page/practice.md). **Plan:**
[`plans/exercise-runner.md`](plans/exercise-runner.md).

| ID | Work | Class | Depends on |
| --- | --- | --- | --- |
| **T-E0** | ~~Specs + AC + plan~~ — **shipped 2026-08-17** | Standard | study/23 refined (submit/review) |
| **T-E1** | ~~Runner skeleton + chrome~~ — **shipped 2026-08-18** | Standard | T-E0 |
| **T-E2** | ~~Steps: prepare · do · wait~~ — **shipped 2026-08-18** | Standard | T-E1 |
| **T-E3** | ~~Steps: submit · review~~ — **shipped 2026-08-18** | Standard | T-E2 |
| **T-E4** | ~~Step decide + complete surface~~ — **shipped 2026-08-18** | Standard | T-E3 |
| **T-E5** | ~~Route `/practice` + method-session routing~~ — **shipped 2026-08-18** | Standard | T-E1 |
| **T-E6** | ~~Recipe loader + fixture method end-to-end~~ — **shipped 2026-08-18** | Standard | T-E4, T-E5 |
| **T-E7** | Method material setup chips (detail panel) | **Shipped 2026-08-18** | T-E5; [`method-material-setup.md`](specs/feature/method-material-setup.md) |
| **T-E8** | ~~First real method — partial dictation~~ — **shipped 2026-08-18** (catalogue Source; text gaps v1) | **Sensitive** | T-E6, T-W7 |
| **T-E9** | Gap-fill step component — listen + type/speak; type-only under defer | **Shipped 2026-08-18** | T-E3, T-MU2, T-LD1 |
| **T-MU0** | ~~Specs + study/39~~ — material units, gap rules, listening defer — **shipped 2026-08-18** | Standard | round-table + owner |
| **T-MU1** | ~~`lib/material-unit.ts`~~ — sentence / paragraph / window / full — **shipped 2026-08-18** | Standard | T-W7, [`material-unit.md`](specs/service/material-unit.md) |
| **T-MU2** | Principled gap selection — replace alternating-word placeholder | **Shipped 2026-08-18** | T-MU1, UC-028 |
| **T-LD1** | Listening defer — infra shipped; **menu UI removed** 2026-08-18; UI on mixed stacks — UC-077 | Standard | [`listening-defer.md`](specs/feature/listening-defer.md) |
| **T-E12** | ~~**Practice-surface UX + anchored layout**~~ — **shipped 2026-08-18** | Standard | T-E1 | [`practice-surface.md`](specs/feature/practice-surface.md), [`exercise-runner.layout.md`](specs/feature/exercise-runner.layout.md) AC |
| **T-E12b** | ~~Footer segment **active = primary** + prep row horizontal inset~~ — **shipped 2026-08-20** | Trivial | T-E12 | v0.42.4 |
| **T-MV1** | ~~`assertSessionViable` + `estimateWallClock` in CI~~ — **shipped 2026-08-20** | Standard | specs | `check-session-viability` in `verify` | `srs-session` and card-engine form practice (T-W6) stay on
`/words/review`.

### Track B · Method viability and session budget (study/42, study/45) — specced 2026-08-19

**Problem:** several shipped methods fail usefulness gates — `build-a-sentence`
(~3 min, no correction). **Owner correction 2026-08-20:** menu `minutes` must
**filter only** — fixed duration **packages** (≤ 2) are chosen on method detail;
`srs-session` is always **15 cards** (no variant chips).
**Specs:** [`method-session-viability.md`](specs/service/method-session-viability.md),
[`method-session-budget.md`](specs/service/method-session-budget.md) (draft).
**Study:** [`study/42-method-usefulness-ux-audit.md`](study/42-method-usefulness-ux-audit.md),
[`study/45-method-duration-variants.md`](study/45-method-duration-variants.md),
[`study/46-method-length-and-level-matched-content.md`](study/46-method-length-and-level-matched-content.md).

| ID | Work | Class | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **T-MV1** | ~~`assertSessionViable` + `estimateWallClock` in CI~~ — **shipped 2026-08-20** | Standard | specs | `check-session-viability` in `verify` |
| **T-MV2** | ~~Recompose `build-a-sentence` — batch + exemplar/feedback~~ — **shipped 2026-08-20** | Sensitive | T-MV1 | G2, G3 pass at 8 & 15 min |
| **T-MV3** | ~~Session contract on method detail (budget + volume + feedback)~~ — **shipped 2026-08-20** | Standard | T-MV1 | UC-042 AC |
| **T-MV4** | `reading-aloud` rubric or record-and-replay | Standard | T-MV1 | G2 pass |
| **T-MV5** | ~~`lib/exercise-recipe/budget.ts` — budget-driven compose + catalogue validator~~ — **shipped 2026-08-20** | Standard | T-MV1 | G7 gate + allowlist |
| **T-MV6** | ~~Pass `minutes` from menu through Start URLs~~ — **shipped 2026-08-20** | Standard | T-MV1 | **Superseded** by owner filter-only decision — see T-MV7 |
| **T-MV7** | ~~**Filter-only menu time** — decouple `?minutes=` from session compose; duration variant chips on detail (≤ 2, **all packages shown**); Start uses selected package only~~ — **shipped 2026-08-20** (PR #164) | Standard | T-MV3, T-MV5 | [`method-session-budget.md`](specs/service/method-session-budget.md); menu filter = `min(durations)` only |
| **T-MV8** | ~~**Catalogue duration packages** — `srs-session` fixed 15 cards + single filter hint; collapse `durations[]` to ≤ 2 per method; reading uses **full** unit estimate for filter~~ — **shipped 2026-08-20** (PR #164) | Standard | T-MV7 | `data/methods/*.json` + tests green |

**Order:** T-MV5 before T-MV8 catalogue edits. T-MV7 before T-MV8.

### Track B · Content ingestion and adaptation (study/48) — specced 2026-08-20

**Problem:** learners want **politics/news at their level** (UC-007, UC-030) and
**paste-your-own** (UC-029) without copyright traps or runaway LLM cost.
**Specs:** [`content-ingestion.md`](specs/service/content-ingestion.md),
[`content-adaptation.md`](specs/service/content-adaptation.md) (draft).
**Study:** [`study/48-content-licensing-and-adaptation.md`](study/48-content-licensing-and-adaptation.md).
**Evaluated stories:** [`IDEAS.md`](IDEAS.md) § 2026-08-20 (stories 1–5).

| ID | Work | Class | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **T-CI1** | ~~**`Source.licence` on persisted rows** — extend `Source` model + validator; refuse catalogue without `licence.kind`~~ — **shipped 2026-08-20** | Standard | T-W9 | `content-ingestion` AC #1; `loadSources` rejects bad catalogue rows |
| **T-CI2** | ~~**Wikinews ingest (lane B v1)** — allowlisted fetch, CC BY metadata, full body stored~~ — **shipped 2026-08-20** | Standard | T-CI1 | Fixture + one live language feed in `data/content/` or DB |
| **T-CI3** | ~~**T2 adaptation + cache** — `AdaptationCacheKey`, coverage validator loop, nightly batch for catalogue~~ — **shipped 2026-08-20** | **Sensitive** | T-CI2, coverage | UC-030 AC; second call cache hit |
| **T-CI4** | **Adaptation labelling** — source detail + session contract show *adapted for {level}*; link to original | Standard | T-CI3, T-MV3 | UC-007, UC-039 AC |
| **T-CI5** | **Learner lane consent + T3** — paste/upload opt-in; private storage; optional personal rewrite | **Sensitive** | T-CI1, T-CI3 | UC-029 AC |
| **T-CI6** | **Generated original news (lane C)** — facts-only graded article when no licence-cleared piece exists | Standard | T-CI3 | `generated: true`; UC-023 reporting |
| **T-CI7** | **Legal review checklist** — DW/BBC TOS, CC BY-SA display, EU DSM / DE UrhG counsel memo | **Docs / counsel** | — | Blocks T-CI8 production ingest |
| **T-CI8** | **Partner feeds** — DW *Langsam gesprochene Nachrichten*, BBC Learning English after T-CI7 | Standard | T-CI7 | Lane B partner rows with `partner-tos` |

**Order:** T-CI1 → T-CI2 → T-CI3 → T-CI4; T-CI5 parallel after T-CI3; T-CI6 only
when T-CI2 finds no licence-cleared piece; T-CI8 after T-CI7. **T-MV7 → T-MV8
before T-CI2** (owner 2026-08-20). **T-W10** reading runner pairs with T-CI4.

#### Open — needs thought before or during build

| Topic | Status | Blocks |
| --- | --- | --- |
| **Skill tier → CEFR band mapping** | ⚠ SPEC GAP until T-B3 | T-CI3 when levels ship |
| **CC BY-SA share-alike** — how adapted body + attribution display | Legal | T-CI2 Vikidia/Simple |
| **EU DSM / DE UrhG** — private adaptation vs catalogue redistribution | Legal — counsel | T-CI7, lane B scale |
| **Form-aware adaptation (held paradigm cells)** | v2 — after form signal | T-CI3 prompt v2 |

### Track B · Words domain — hygiene, decisions, then stage-2 slices

**Added 2026-08-12** after a full audit of vocabulary use cases, specs, and code.
Detail, slice IDs, and agent handoff template:
[`plans/words.md`](plans/words.md).

**What is solid:** stage-1 card engine — `/words` snapshot, `/words/review`
(`srs-session`), 2000-lemma pools (es + it), form-recall staging, pool-local
Progress counts; **content loop v1** — coverage (`lib/coverage.ts`), `/content`
library + detail, gap list, word trace; **word capture** (T-W9) and **method
material setup** (T-W10a / T-E7) shipped 2026-08-18. **What is not:** reading
runner remainder (T-W10 — comprehension + sentence translation on source
detail); **T-W20** Words mixed-deck UX + `deck` filter (revised 2026-08-20); **T-W21** form explanations;
**T-W22** session sampling (UC-079);
**T-W5** per-cell Progress breakdown; **T-W6** full form practice; most hosted exercise runners
(6 of 34 built — see [`METHOD-IMPLEMENTATION-MATRIX.md`](METHOD-IMPLEMENTATION-MATRIX.md)).

Work in four phases; do not skip phase 0:

| Phase | What | Next up |
| --- | --- | --- |
| **0 · Hygiene** | Link repair, catalogue honesty (`hosted` vs built), test drift | **T-W0b/c shipped 2026-08-17** — vocabulary methods `hosted: false` except `srs-session`; `/words/atlas` test drift fixed. **T-W0a** if `check:specs` warns |
| **1 · Decisions** | W-1 lemma-rank recomputation, W-2 pool atlas vs full map, W-3 `vocabulary` skill, W-4 sibling gap, W-5 incomplete paradigms | **W-3 answered 2026-08-17:** `vocabulary` skill. **W-5 answered 2026-08-17:** flag partial paradigms. W-1, W-2, W-4 already answered |
| **2 · Stage-2 display** | Frequency blocks → word detail → pool-local map → T-B3 remainder → Words mixed review UX → **session sampling** → per-cell breakdown → form-practice | **T-W20/T-W21 shipped** (T-W20 revised 2026-08-20) — next: **T-W22** weighted sampling (UC-079), **T-W5** Progress breakdown |
| **3 · Stage-3 loop** | Coverage → trace + gaps → `/content` → method setup (study/37, study/39) → reading | **T-W9 + T-E7/T-W10a + T-MU* shipped 2026-08-18**; next: **T-W10** remainder or **T-W11** session loop line |
| **4 · Stage-1 remainder** | Break return, leech diagnosis, i18n slices | T-W12 next; **T-W16** and **T-W17** shipped |

**Relationship to existing queue rows:** T-W4 *is* T-B3 remainder (same work,
words-framed). T-W20/T-W21 *are* UC-078 + UC-022 v1 on the existing card engine
(owner UX review 2026-08-19; **T-W20 UX pivot 2026-08-20:** one Start on Words →
mixed deck; form-only via Progress/Methods). T-W6 *is* UC-041 full paradigm-cell engine
(blocked on W-4). T-W13 *is* T-B14
remainder. T-W14/T-W15 *are* T-B11 slices 2–3. Phase 0 does not compete with
engine priority 4–7 above — it is a hygiene pass that can run in parallel.

**Italian shipped 2026-08-12 — this section used to explain why it was
blocked, and stayed after the block was cleared, which is exactly the kind of
staleness this file exists to prevent.** All three blockers named on
2026-08-11 (no reachable gloss source, an accent-split frequency list, no
model for how an Account chooses a learning language) were resolved the same
day the pool shipped: kaikki.org's Italian dictionary is reachable,
lemma-level summing already merges accent variants, and `learner_language` /
the language picker / switcher answered the third. Detail:
[`specs/service/starter-deck.second-language.md`](specs/service/starter-deck.second-language.md).
Both languages are fully isolated per [UC-025](use-cases/UC-025-learn-multiple-languages.md) —
own pool, own scheduling, own progress, never mixed in a session.


## Page layout — shell, scrims, and scroll modes

**Added 2026-08-15** after mobile-nav iterations exposed gaps: padding was split
across shell and features without a single contract, and scroll vs one-screen
behaviour lived only in scattered specs.

**Normative spec:** [`specs/feature/page-layout.md`](specs/feature/page-layout.md).
**Plan and follow-ups:** [`plans/page-layout.md`](plans/page-layout.md).

| Decision | Choice |
| --- | --- |
| Mobile chrome | Fixed overlay (floating pill + scrims), not flex-child nav |
| Who reserves float space | `AppShell` `<main>` padding on `< md` |
| Who sets page rhythm | Feature wrappers: `pt-page-top` / `pb-page-bottom` |
| One-screen routes | `one-screen-runner` on `/words/review` (`< md`); `one-screen-exercise` on `/practice` (mobile + desktop) — see [`exercise-runner.layout.md`](specs/feature/exercise-runner.layout.md) |
| Safari bottom toolbar | `useVisualViewportBottomInset`; cannot hide in-browser |

**UX study:** [`study/28-mobile-desktop-layout.md`](study/28-mobile-desktop-layout.md)
— mobile floating vs desktop/iPad flat top nav; owner decisions 2026-08-15
(floating phone, flat `≥ md`, pill visible in review, iPad first-class).

**Track A follow-up (optional):** T-SHELL-03 iPad shell QA; T-SHELL-02 lint that features do not add
`pb-shell-float-bottom` (double reserve); **T-SHELL-05 shipped 2026-08-18**
(`ShellPageLoading`, `scrollbar-gutter: stable` — spec
[`page-layout.transitions.md`](specs/feature/page-layout.transitions.md)).
`ShellPageContent` + route registry shipped 2026-08-15.

## Interaction and design-system audit

The primitives are in better shape than the app. What follows is real debt, but
none of it is urgent, because none of it is on a screen a learner sees yet.

**Five-state compliance — resolved 2026-08-09, and the leftover is smaller than
it looks.** The conflict was real: `AGENTS.md` boundary 4 admitted no exceptions
while Input and Select shipped without hover and active. It was settled as a
documentation fix rather than a visual one — a **native form control may omit
`hover` and `active`**, because the platform draws them and two disagreeing
affordances are worse than one. `focus-visible` and `disabled` stay non-waivable
per `CONSTITUTION.md` §3. The exemption lives in
[`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) and is named from `AGENTS.md`; `select.md`
gained the row it was missing. No component changed.

**What survives is the part the exemption does not cover.** Table's scroll region
and ItemPicker's rows are still missing `active`, and neither is a native form
control — the exemption is deliberately narrow, so it does not reach them. This
is ordinary interaction debt on components no learner sees yet, not a rule
conflict, and it belongs to whichever task next touches those two.

**Hover on touch devices — this debt does not exist, and never did.** The entry
here used to say no component wraps hover in `@media (hover: hover)`. Tailwind
v4 wraps **all of them**: in the built stylesheet every `hover:` utility sits
inside a single `@media (hover:hover)` block. Nothing to do, and
[`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) has been corrected too.

The real consequence is the opposite one and it is now in
[`TRAPS.md`](TRAPS.md): where there is no hovering pointer the rules never
apply, so hover cannot be the only signal — and it cannot be observed at all in
this VM, which reports `pointer: none`.

**The success tokens have never been used.** `success`, `success-deep`,
`success-soft` and `success-ink` exist in `app/globals.css` and no component
consumes them, so the "you got it right" pattern is unestablished. The `-deep`
asymmetry is fixed (2026-08-09) — the first correct-answer button now has a
hover token to reach for. Still true: `check-contrast.mjs` only tests `success`
as a *background*, so `text-success` on `bg-surface` is unverified.

**What the gates cannot see.** Worth knowing before trusting a green run:
`check-tokens` catches raw hex, arbitrary colours, `transition-all`, off-scale
durations and unregistered token scales. It does **not** catch Tailwind's default
palette (`bg-white`, `text-gray-500`), non-token radii and shadows (`rounded-lg`,
`shadow-md`), hardcoded page spacing, or any accessibility defect. `check-contrast`
tests 19 fixed pairs and nothing else — not opacity-modified colours like the
dialog's `backdrop:bg-ink/40`, not disabled-state contrast, not focus-ring
contrast. Interaction completeness is review-only, by design.

---

## Two viewpoints on what comes next

Since the sequencing question is genuinely contested, here it is as an argument
rather than a conclusion.

**The project manager.** "Two libraries, 56 use cases, 190 features and no
screen. That ratio is the risk, not the backlog. The scheduler has been reviewed
adversarially and the lexicon has 69 tests, and neither has ever been touched by
a human hand through a UI — so we have high-confidence code and zero evidence
that any of it is usable. Storage was the last thing standing between us and
stage 1 and it has been answered — though the answer grew the stage: pick the
provider, stand up auth, then the persistence spec, then a review session end to
end, badly if necessary. And I want the demo page off the home route before anyone
else sees this repo and concludes the product is a starter kit."

**The UX designer.** "Shipping a review session first repeats the mistake the
study spent 25 chapters diagnosing. A card, four grade buttons and a queue is
Anki with rounded corners, and chapter 15 says we lose to Anki on its own terms.
The one thing this product has that nobody else has is that it *refuses to claim
what it cannot measure* — so the first screen should be the one that does the
refusing. That is why T-03 comes before the review surface: it is small, it is
honest, and it establishes the visual language for the states nobody designs for,
which chapter 22 already named as the real test — how does a level that went down
look, and how does 'not measured' look. Design those two first and the cheerful
states come free. Design the cheerful ones first and the honest ones arrive as an
afterthought, in red."

**Where they agree, which is what matters.** Both wanted question 16 answered
today, and it now is; both want the Grundriss demo off the home route; and
neither wants a review surface built before its state machine is written down.
T-03 satisfies the designer and costs the manager one task on the critical path —
and it produces the first screenshot this project has ever had.

**What the storage decisions do to the argument.** ADR-0006 strengthens the
designer's ordering, for a reason neither persona anticipated: a required account
means the review surface is now behind signup, session handling and an
access-control test, so "ship a review session, badly if necessary" is no longer a
small piece of work. T-03 is the only product surface that can be built and shown
before authentication exists. The two tracks also stopped competing — with the log
shape fixed, the persistence spec is a writing exercise a thinking model can do
while a low-inference agent implements T-03.

**How it was actually settled, and both personas were arguing the wrong
question.** The user's answer: the **method menu** is the first surface, because
it is the product — "flashcards is also just a method, it's nothing special".
Neither persona proposed that, because both had inherited the roadmap's
assumption that the menu was a stage-4b refinement on top of a flashcard app.
The manager wanted the review session and the designer wanted the status page;
the thing that was actually first was in neither list. Worth keeping as a warning
about internal debates: two well-argued positions can share a premise that is
wrong, and arguing between them will never surface it.

---

## What needs a decision from you

Ordered by how much they block. **Question 16 is off this list** (ADR-0005,
ADR-0006, ADR-0007) — an account is required, and the provider is Supabase.

1. ~~Is T-03 the first surface?~~ **Answered 2026-08-08: no, the method menu is.**
   ~~And whether the catalogue is written before or alongside the menu spec.~~
   **Closed 2026-08-09:** the catalogue shipped as data first. It surfaced three
   conflicts between chapters 12, 21 and 24, and one gap that no single chapter
   showed — twenty-one methods train something none of the seven layer-1 signals
   measures. Writing it alongside a menu spec would have buried all four.
2. ~~Are native form controls exempt from the five-state rule?~~ **Answered
   2026-08-09: yes, narrowly.** Hover and active only, native form controls only;
   `focus-visible` and `disabled` stay non-waivable. The exemption lives in
   [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) and `AGENTS.md` boundary 4 names it. No
   component changed.
3. ~~Two accepted records disagree about what `/` is.~~ **Answered 2026-08-09 by
   [ADR-0010](adr/0010-the-route-model.md)**, on the owner's instruction to use
   the conventional answer where one exists: `/` is the public landing page,
   the app's destinations are `/methods`, `/words` and `/progress`, and signing
   in lands on `/methods`. Neither earlier record is superseded — ADR-0009's
   "default route" gains the scope it was missing, which is the test of a
   reconciliation being right rather than merely decisive.
4. ~~A `success-deep` token, or a documented asymmetry?~~ **Answered 2026-08-09:
   the token.** `accent` and `danger` both carry a `-deep` for hover, and a
   third semantic colour that does not is an asymmetry every future author has
   to rediscover. Added to both themes, paired in `check-contrast.mjs`
   (9.17:1 light, 13.14:1 dark) and registered in `lib/utils.ts`. Nothing
   consumes it yet — it exists so the first correct-answer button has a hover
   token to reach for instead of inventing one.
5. ~~Does the learner grade before or after seeing the answer?~~ **Answered and
   shipped 2026-08-10** (`5f4b896`, "review flip UX"): tap the card to flip and
   see the back, untimed, then grade — no 400 ms auto-hide, no grade-before-
   reveal. [`specs/feature/review-session.md`](specs/feature/review-session.md)
   has said "Open questions: None" since that commit. **This list entry was
   stale for two days** — it kept describing the pre-fix design as current and
   got repeated as live information on 2026-08-12. Kept here, struck through
   rather than deleted, as the record of the miss: this file is supposed to be
   corrected in the same session a spec resolves, and this one was not.
6. Does `CONSTITUTION.md` §2 (the user's data) need writing out now that server
   storage is scheduled rather than hypothetical? `BACKEND.md` §9 says it stops
   being abstract the moment something is actually stored.
7. **T-B7: which thesis does the landing lead with?** The interim page leads
   with thesis 1 — *"progress is shown as measured competence, never as
   activity"* — because it was the sentence T-04 had already quoted, not
   because anyone chose it. The candidates, all study-backed, are:
   **1** (measured competence, not activity — the critique of the category),
   **9/10** (the methods happen mostly outside the app — the most
   differentiating and the least reassuring),
   **11** (speaking is the goal — what a learner actually wants), and
   **12** (an honest denominator for your time — the number nobody shows,
   and now built). Picking one is five minutes and it is not an agent's
   five minutes. Note that thesis 11's "leads the headline" is about the
   signed-in **Home**, not this page — chapter 24 was renamed to keep those
   apart, and it is an easy wrong inference to make.
8. **Does `/progress` lead with speaking once anything is measured?** Chapter 24
   says the goal decides which skill leads the *headline display*, and names
   the home surface. Since [ADR-0010](adr/0010-the-route-model.md) made
   `/methods` the default route, which surface that rule binds is no longer
   obvious. It changes nothing today — four skills all read "not measured" —
   and it binds the moment one does not.
9. Chapter 25's questions 17–18 (perceived effort as a third ledger, whether the
   whole-task floor applies from day one). **Question 19 is off this list** —
   answered in its first branch by
   [`specs/service/dose-band.md`](specs/service/dose-band.md): the band is
   labelled borrowed, structurally, and F190 stays later.

**Added 2026-08-12**, from the localization + broken-card-detection docs pass.
**Durable record:** [`adr/0012-ux-decisions-requeue-i18n-leech-nav.md`](adr/0012-ux-decisions-requeue-i18n-leech-nav.md)
— cite the ADR, not this list, when implementing.

10. ~~**Where does description text in a language other than English come
   from?**~~ **Answered 2026-08-12 (owner direction + UX + [`I18N.md`](I18N.md)).**
   Two surfaces, two stages — the Grundriss pattern, not one blob:
   - **App chrome** (menus, buttons, grade labels, errors): **stage 1** —
     `next-intl`, `messages/<locale>.json`, key parity gates. Already
     decided in UC-069.
   - **Card description text** (what describes a word on the back/front):
     **stage 3 database** — `app_texts` + `app_text_translations` per
     [`I18N.md`](I18N.md) § Stage 3, keyed by (`wordId`, spoken language),
     `status ∈ (draft, reviewed, published)`, app reads **published** only.
     Runtime serves a **snapshot JSON** at build/cache invalidation — never
     a query per card. English rows seeded from Kaikki at import; other
     locales via MT → `draft` → human review → `published`. Provenance in
     `data/README.md`. Same shape as Feldpost-style i18n tables; this repo's
     contract is `I18N.md`, not a second invention.
11. ~~**Does a card's description stay one string, or split into named parts**~~
    **Answered 2026-08-12 (UX). One string per card face per spoken
    language — no microscopic split.** Meaning-recall back is already one
    gloss ("to run", "of, from") — nothing to split. Form-recall front
    combines gloss + instruction ("to run — write the Spanish form"); that
    whole face is **one translatable string** per locale, not three fields.
    Instruction wording lives in the translation row for that face, not a
    separate grammar-hint table. Splitting definition vs hint vs instruction
    into named parts is rejected for v1 — it multiplies rows and review
    surface for no learner-visible gain.
12. ~~**Does a same-session repeat count toward UC-013's cross-session
    leech-suspend counter?**~~ **Answered 2026-08-12 (owner + UX). No.**
    Same-run repeats are a within-sitting rehearsal buffer
    ([UC-071](use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md));
    UC-013's suspend counter counts **cross-session** failures only — reviews
    whose `at` timestamp falls on a different calendar day than the previous
    failure on that `taskId`, or simply: one session's extra tries never
    advance the leech count. Rationale: counting them would let one bad day
    suspend a card the learner was still actively correcting; not counting
    them matches the owner's instinct ("it would be weird if a card went
    missing") — suspension is a cross-session diagnosis, not a same-sitting
    penalty. See [`UC-013`](use-cases/UC-013-stop-losing-time-on-one-card.md)
    and [`UC-071`](use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md).
13. ~~**What is the same-session requeue rule** — end of run, ~5 cards ahead, or
    something else?~~ **Answered 2026-08-12 (UX, Anki-style reference).**
    Map grades to distance, no learner-visible countdown:
    - **`again`** → re-insert **5 positions ahead** (or at end of queue if
      fewer than 5 remain — never drop the repeat).
    - **`hard`** → re-insert at **end of the remaining queue** (after every
      not-yet-seen card this run; if it was already a repeat, after the rest).
    - **`good` / `easy`** → no requeue.
    No indicator that a repeat is coming (UC-071). The session's advertised
    total stays the count of **distinct** `taskId`s in the built queue
    (UC-039); repeats do not inflate it. Spec stage: `T-B13`.
14. ~~**Does broken-card detection run once at build time, or per learner?**~~
    **Answered 2026-08-12 (UX). Both, by tier — not either/or.** Tier 1
    (too-many-meanings, no-context, neighbour-word collision, sound-contrast
    table) runs **once at build time** and ships as static metadata on the
    card — same pipeline as overrides/exclusions. Tier 2 (repeated
    `again`/`hard` crossing the lapse threshold) is **per learner**, from the
    review log. Tier 3 (tap-to-confirm diagnosis) is **per learner**, at
    suspension time, using tier-1 candidates as pre-filled choices. Neighbour
    collision does **not** wait for "has this learner studied both words" —
    the candidate list is static; only the confirmation is learner-specific.
    See [`IDEAS.md`](IDEAS.md) three-tier model.
15. ~~**What similarity threshold catches a real confusion** (`pero`/`perro`)
    **without flagging most short, common words against each other?**~~
    **Answered 2026-08-12 (UX).** Levenshtein distance **1** only, and only
    when **both** lemmas are length 3–8 inclusive; flag as a **candidate**
    (tier 1), never auto-diagnose. Distance 2 is rejected for v1 — it fires
    on too many short frequent words. A build-time gate script must run
    against the shipped pool and report candidate-pair count before merge;
    if &gt; ~3% of lemmas have a candidate, tighten to "same first two
    characters AND distance 1." Confirmation always tier 3 (one tap).

17. ~~**What counts as held stably for vocabulary and form counts?**~~
    **Answered 2026-08-12 (literature + owner).** Separate from scheduler
    graduation (1 day). **Held:** `review` state, stability ≥ 7 days at target
    retention, ≥2 successes, no trailing `again`. **Fragile:** reviewed but not
    held. **Mature:** held with stability ≥ 21 days (atlas tier). Shipped as
    T-B3a. Closes the vocabulary branch of UC-064 and question 20 for
    cell-tagged tasks using the same `isTaskHeld` rules.

**Added 2026-08-12**, from the words-domain audit ([`plans/words.md`](plans/words.md)).
Resolve before stage-2 vocabulary slices (T-W1–T-W6); cite the plan, not this
list, when implementing.

18. ~~**Lemma-frequency ranks: recompute from lemma tables or keep form-based lists?**~~
    **Answered 2026-08-12 (owner). Keep form-based ranks in the starter pool
    for now.** Lemma-level recomputation waits for the coverage calculator
    (stage 3) and a dated calibration plan.
19. ~~**Is the starter-pool atlas on `/words` the stage-2 map v1**~~
    **Answered 2026-08-12 (owner). Yes — pool-local bands and atlas on `/words`
    first.** Language-wide map ships with coverage (stage 3).
20. ~~**`SKILLS` vocabulary value**~~ **Answered 2026-08-17:** `vocabulary` added;
    vocabulary-section methods tagged; unbuilt engines use `hosted: false`.
21. ~~**Scheduler sibling gap** — minimum spacing between sibling tasks?~~
    **Answered 2026-08-12 (owner + FSRS).** FSRS sets each Task's `due` date —
    no fixed-day override. **One Task per Word per session** when building the
    queue; the sibling stays due for the next session. UC-071 requeue repeats the
    **same** Task within a session after a bad grade — separate rule. See
    [`session-builder.md`](specs/service/session-builder.md) behaviour #6.
22. ~~**Incomplete paradigms in form-mastery reporting**~~ **Answered 2026-08-17
    (owner): flag** — `partialParadigmLemmaCount` on Progress; held count unchanged.
    See [`form-mastery-signal.md`](specs/service/form-mastery-signal.md).

**Added 2026-08-20**, from content ingestion/adaptation specs (study/48,
[`IDEAS.md`](IDEAS.md) stories 1–5). Resolve before T-CI3/T-MV8 scale; cite
study/48 and the ingestion/adaptation specs when implementing.

24. **Menu time: filter only — owner 2026-08-20.** Slider filters catalogue;
    session size comes from **detail variant chips** (≤ 2 packages) or fixed
    card count (`srs-session` = 15). T-MV6 shipped the old pass-through;
    **T-MV7** implements the correction. See study/45, study/46.
25. **Reading sessions: full article, never window-cut.** Menu filter uses
    estimated read time of the **whole body**; session delivers `full` unit.
    Owner 2026-08-20. See [`material-unit.md`](specs/service/material-unit.md).
26. **Catalogue news: level adaptation is primary** (not podcast slicing).
    Lane B ingest + T2 cache; label honestly. Lane C generated fallback is v2.
    Owner 2026-08-20. See study/48, UC-030.
27. ~~**Which `targetLevel` drives catalogue adaptation?**~~ **Answered 2026-08-20
    (owner): app-inferred** from active skill tier — no manual CEFR chip in v1.
    See [`content-adaptation.md`](specs/service/content-adaptation.md).
28. ~~**SRS when due queue &lt; 15?**~~ **Answered 2026-08-20 (owner): always
    15** — pad with new cards in frequency order; no "easier vocab" heuristic
    v1. See [`method-session-budget.md`](specs/service/method-session-budget.md),
    [`session-builder.md`](specs/service/session-builder.md) behaviour #4.
29. ~~**Launch politics source**~~ **Answered 2026-08-20 (owner): Wikinews
    (T-CI2) first; lane C generated (T-CI6) **only when** no licence-cleared
    article exists.
30. ~~**Legal before partner feeds**~~ **Answered 2026-08-20 (owner): yes,
    pursue DW/BBC** after T-CI7 memo — partner feeds are a goal, not optional
    nice-to-have.
31. **Politics adaptation human review** — **Answered 2026-08-20 (owner): no**
    separate queue if the automated process (coverage validator + labelling) is
    sound. UC-023 remains the safety valve.
32. **Lane C fact-check** — **Answered 2026-08-20 (owner): no** — honesty label
    only (*not the original* / *generated*); no pre-publish editorial desk v1.
33. ~~**Adapted text on Progress**~~ **Answered 2026-08-20 (owner, corrected):**
    adapted reading **counts toward the reading skill pool** like authentic input;
    source detail still labels *adapted*. Audit via `adapted: true` on history rows
    — not exclusion from skill signal.
34. ~~**Build order T-MV7 vs T-CI**~~ **Answered 2026-08-20:** T-MV7 → T-MV8
    before T-CI2.
35. **Wall time before Start on resolved material** — **Answered 2026-08-20
    (owner):** learner upload and source-bound methods (reading, word-insert /
    translate on a passage) must **adapt if needed → show ~N min on detail →
    then** Start. Menu filter uses that estimate; no surprise 40 vs 20 min
    after tap. See [`method-session-budget.md`](specs/service/method-session-budget.md)
    § Resolved material, [`method-material-setup.md`](specs/feature/method-material-setup.md).
36. **Detail duration chips vs menu filter** — **Answered 2026-08-20 (owner,
    corrected):** menu filter uses `min(durations) ≤ filter` for catalogue
    visibility only; detail shows **all** packages when `durations.length > 1`;
    default selection = **longest** package. Menu filter must **not** hide chips.
    See [`method-session-budget.md`](specs/service/method-session-budget.md).

**Added 2026-08-16**, from [study/34](study/34-review-report-and-acknowledgement-ux.md)
(T-B14a/b/c). Resolve before implementing report popover or DB columns.

23. ~~**Report popover + acknowledgement banner (T-B14a/b)**~~ **Shipped 2026-08-16.**
    Flag-only v1 (no scheduling toggle); five category chips; banner clears on
    next grade. Study: [study/34](study/34-review-report-and-acknowledgement-ux.md).
    T-B14c (scheduling-intent toggle) remains deferred.

**Added 2026-08-12**, moved from [`plans/multi-language.md`](plans/multi-language.md)
so open items live in exactly one queue:

16. ~~**Does Progress remain a nav destination, or move under Profile**~~
    **Answered 2026-08-12 (UX + prior owner decision 2026-08-11 + literature).**
    **Progress stays a top-level destination.** Methods · Words · Progress;
    Profile remains the corner chip ([ADR-0009](adr/0009-three-destinations.md),
    [`plans/multi-language.md`](plans/multi-language.md) "Decided 2026-08-11").
    Study 03's honesty rules need a surface that can show "not measured",
    falling levels, and derivation on tap — burying that under Profile makes
    the level model a footnote ([`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md)
    PM/UX debate, 2026-08-08). Two destinations (Methods + Words) fails the
    same test. This closes the question raised in passing; no ADR change.
