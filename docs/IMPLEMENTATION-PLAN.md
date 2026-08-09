# Implementation plan

**Written 2026-08-08.** What to build next in *code*, in what order, and how to
hand each piece to a coding agent that should make as few decisions as possible.

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
| `lib/method-catalogue.ts` + `data/methods/` | 53 methods, 6 commitments, 7 context presets. Schema, validation, context filter. 24 tests. Spec **active** |
| `components/ui/` | Button, Field, Input, Select, Dialog, Table — inherited from Grundriss, specced, tested |
| `features/` | `item-picker` and `primitives` — **both are the starter's worked examples**. `language-status` is the first that is not; `auth` (T-B8) adds `/signup` and `/login`, built only from `Field` and `Button`; `app-shell` and `method-menu` (T-B10) add the three destinations and the front door |
| `lib/db/` | **Shipped 2026-08-09** (T-B8). Supabase client factory, `signUp`/`signIn`/`signOut`/`getAccount`, `middleware.ts` session refresh, the `review_log` RLS migration — applied to the live project. Spec **active**. 9 unit tests plus the 5-test §8 access-control suite |
| `app/(marketing)/` | The public half, no app shell: `/` (T-04's holding page), `/languages` (T-03), `/login`, `/signup`, `/primitives`. Split out 2026-08-09 to implement [ADR-0010](adr/0010-the-route-model.md) |
| `app/(app)/` | The signed-in half, under the shell's three destinations: `/methods` (T-B10), `/words` + `/words/review` (T-B1), `/progress` (holding page until T-B3) |
| `lib/db/review-log.ts` + `lib/installation-id.ts` | **Shipped 2026-08-09** (T-B2). Append-only adapter, owner taken from the session, payload migration applied live. Spec **active** |
| `lib/starter-deck.ts` + `lib/session-builder.ts` | **Shipped 2026-08-09** (T-B1). 50-lemma Spanish meaning-recall pool, 15-card queue, due-before-new. Specs **active** |
| `features/review-session/` | **Shipped 2026-08-09** (T-B1). The FSM, the card, the summary. Grades persist one row each. Specs **active** |

**The honest summary: two strong libraries, and a front door that lists what the
product can do without yet doing any of it.** `/languages` was the first surface
that belonged to this product rather than to the starter — no state, no account,
every value derived rather than stored. `/methods` (T-B10, shipped 2026-08-09)
is now the front door it always said it would be, and it is honest in the same
way: it shows the whole catalogue and what each method does *not* do, and it
claims nothing about the learner, because nothing about the learner is measured
yet. What is still missing is the part that needs stored history — the daily
three, current standing, readiness. That gap is T-B2's, not the menu's.

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

**The honest limit on all of it:** one language, one task type, a 50-lemma
starter pool, and a review loop whose grade is collected before the answer is
shown (the spec gap on T-B1). The plumbing is real; what it measures is not yet
something the product should claim.

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
| ~~**T-B1**~~ | ~~The review session surface~~ — **shipped 2026-08-09** | **Sensitive.** [`specs/feature/review-session.md`](specs/feature/review-session.md) + [`.states.md`](specs/feature/review-session.states.md), `features/review-session/`, `/words/review`. One enum, an explicit map, `complete` as the only terminal state. **⚠ SPEC GAP** carried in the spec: the learner grades *before* the back is shown, and the back then shows for 400 ms — the order is specced, the constant is not, and both are product decisions nobody has made |
| **T-B3** | Vocabulary estimate and the level display (F17–F22) | Newly unblocked by tier B. Needs the anchor table from `study/03-level-model.md`, which is graded **[C]** and explicitly needs calibrating — a spec must say what is claimed with an uncalibrated band |
| **T-B4** | Dose ledger (F184) | Needs roadmap question 19 answered, and its logging half needs T-B2 |
| **T-B7** | The landing page | **Everything except the positioning is built** — [`specs/page/landing.md`](specs/page/landing.md) is active, the header, hero, CTAs and the signed-in redirect all ship, and every sentence on it is quoted from the study with its thesis named in `features/marketing/content.ts`. What is left is the one thing an agent may not do: choose which of the thirteen theses the product leads with. That is a decision, and the options are below |
| ~~**T-B10**~~ | ~~The method menu — the product's front door~~ — **shipped 2026-08-09, in the part that needs no learner** | **Sensitive.** [`specs/page/method-menu.md`](specs/page/method-menu.md) and [`specs/feature/app-shell.md`](specs/feature/app-shell.md) are active: `/methods` filters the catalogue by context, the `(app)` group carries ADR-0009's three destinations, and `middleware.ts` gates them before anything renders. **What was deliberately left out**, because each needs stored history or an effect estimate nothing produces yet: the daily three, current standing, the demonstration sentence, readiness, the skill filter, and where commitments live. Those return with T-B2 and T-B3; the spec carries them as named gaps rather than as silence |
| **T-B9** | Sync across devices (F192) | **Blocked on a decision, not on work.** The log shipped server-only, contradicting ADR-0005's local-first decision, and nothing had recorded that until [ADR-0011](adr/0011-the-review-log-shipped-server-only.md). Under its Option A two devices on one account already share one table and T-B9 reduces to export/import; under Option B it is the merge ADR-0005 described, and the tiebreak gap has to be closed first. The gap itself is dormant meanwhile — one authority, nothing to merge |
| **T-B5** | Retire the Grundriss worked examples | Looks like a deletion, is a docs refactor: `docs/STATE.md:148` cites item-picker as **the** worked example of state coherence, `docs/specs/README.md:36` indexes it, and UC-001…003 are referenced from six files. Removing the code without re-pointing those is a broken-link failure at best and the loss of the only worked example at worst |
---

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
5. **Does the learner grade before or after seeing the answer?** Raised by the
   T-B1 audit and carried as a ⚠ SPEC GAP in
   [`specs/feature/review-session.md`](specs/feature/review-session.md). Today
   they grade first and the back then shows for 400 ms. Every other SRS reveals
   first, because a grade is a report about a recall the learner has just
   checked — as built, `again` and `good` cannot mean "I was wrong" and "I was
   right", which is exactly what FSRS reads them as. This is the one open
   question that changes what the stored data means, so it blocks trusting
   anything T-B3 derives from it. The 400 ms is a second, smaller decision
   underneath it.
6. Does `CONSTITUTION.md` §2 (the user's data) need writing out now that server
   storage is scheduled rather than hypothetical? `BACKEND.md` §9 says it stops
   being abstract the moment something is actually stored.
6. **T-B7: which thesis does the landing lead with?** The interim page leads
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
7. **Does `/progress` lead with speaking once anything is measured?** Chapter 24
   says the goal decides which skill leads the *headline display*, and names
   the home surface. Since [ADR-0010](adr/0010-the-route-model.md) made
   `/methods` the default route, which surface that rule binds is no longer
   obvious. It changes nothing today — four skills all read "not measured" —
   and it binds the moment one does not.
8. Chapter 25's questions 17–18 (perceived effort as a third ledger, whether the
   whole-task floor applies from day one). **Question 19 is off this list** —
   answered in its first branch by
   [`specs/service/dose-band.md`](specs/service/dose-band.md): the band is
   labelled borrowed, structurally, and F190 stays later.
