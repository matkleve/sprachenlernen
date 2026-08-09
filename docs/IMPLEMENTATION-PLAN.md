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
| `features/` | `item-picker` and `primitives` — **both are the starter's worked examples**; `auth` (T-B8) adds `/signup` and `/login`, built only from `Field` and `Button` |
| `lib/db/` | T-B8, implemented: Supabase client factory, `signUp`/`signIn`/`signOut`/`getAccount`, `middleware.ts` session refresh, the `review_log` RLS migration. Spec **active**. 9 unit tests green; the 5-test §8 access-control suite is red — see below |
| `app/page.tsx` | Still the Grundriss demo. Headline reads "Grundriss — The plan comes before the building" |

**The honest summary: two strong libraries and no product.** Nothing in `app/`
belongs to this product yet. There is no screen a learner could open, so there is
also no interaction flow to audit — the audit below is therefore about what the
first flow must be, plus the interaction debt already sitting in the primitives.

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

Still ahead of stage 2: **the vocabulary estimate (F17–F22)**, now unblocked on
the data side, because tier B means a level *may* be claimed with a widened band.

**T-B8 is code-complete and blocked on one external step.** Spec
[`docs/specs/service/auth.md`](specs/service/auth.md), `lib/db/`, `middleware.ts`,
`/signup`, `/login` and the migration are all written and reviewed; `npm run
verify` is green except `test`. That one failure is deliberate, not a defect: the
agent had `NEXT_PUBLIC_SUPABASE_URL`, the publishable key and the service-role
key, but no `SUPABASE_DB_PASSWORD` or `SUPABASE_ACCESS_TOKEN` and no
authenticated Supabase MCP session, so it could not run DDL against the live
project (`lnkgmjcueahhrzpnzmwq`) — those keys only ever reach PostgREST and Auth,
never the database connection or the Management API. Someone with project access
must run
[`supabase/migrations/20260809073100_review_log_ownership.sql`](../../supabase/migrations/20260809073100_review_log_ownership.sql)
once (SQL Editor, `supabase db push`, or the MCP once authenticated); after that,
`npm test -- access-control` turns green with no code change. **T-B2 is
unblocked to start its spec now** — the owner column T-B2 depends on exists in
the migration file already — but its own red test needs the same migration
applied to run for real.

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

### T-01 · Dialog announces its description, and stops hardcoding an id

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

### T-02 · The Space key gets the test the spec already promises

**Class:** Trivial · **Files:** `features/item-picker/item-picker.test.tsx` (and
`ItemPicker.tsx` only if the test fails)

`docs/specs/feature/item-picker.md:29` requires Enter **or** Space to select. Only
Enter is tested. Native `<button>` should make Space work already — so if the new
test passes on the first run, **keep it and say so in the PR**; it is a regression
guard, and deleting a test because it was green on arrival is how the criterion
goes unenforced again. If it fails, that is a real bug and the fix belongs in the
same commit.

### T-03 · The language status page

**Class:** Standard · **Reuse:** Table, Button · **Serves:**
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

### T-04 · Only after T-03: the Grundriss demo stops owning the home route

**Class:** Trivial · **Files:** `app/page.tsx`, `app/primitives/page.tsx`,
`features/primitives/**`

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
| **T-B8** | **Accounts and authentication on Supabase — code-complete, blocked on migration** | **Sensitive.** Implemented 2026-08-09: `docs/specs/service/auth.md`, `lib/db/`, `middleware.ts`, `/signup`, `/login`, the `review_log` RLS migration and its §8 access-control test. See "Where storage stands" above for the one remaining step |
| **T-B2** | Persistence of the review log | **Sensitive.** Shape is fixed by ADR-0005 and 0006 — append-only, per-review UUID, non-null owner, adapter-only. The remaining work is a spec pinning the row schema and the installation id, plus a red test per property. Depends on T-B8 for the owner it writes |
| **T-B1** | The review session surface | **Sensitive.** Stateful UI, so `STATE.md` demands one enum, an explicit transition map, named terminal states and a single source of truth *before* any code. Depends on T-B2 |
| **T-B3** | Vocabulary estimate and the level display (F17–F22) | Newly unblocked by tier B. Needs the anchor table from `study/03-level-model.md`, which is graded **[C]** and explicitly needs calibrating — a spec must say what is claimed with an uncalibrated band |
| **T-B4** | Dose ledger (F184) | Needs roadmap question 19 answered, and its logging half needs T-B2 |
| **T-B7** | The landing page | Positioning copy is a product decision, not an implementation. With a required account it is also everything a signed-out visitor ever sees, and its job is to persuade — which makes every rule in `DESIGN-SYSTEM.md` necessary but not sufficient |
| **T-B10** | **The method menu — the product's front door** | **Sensitive**, and the largest piece of design work in the plan. Stage 1 as of 2026-08-08. It is a selection surface driving two surfaces (menu → info page → runner), so `STATE.md` applies; its ranking rule is normative — context → floor → **evidence grade**, never a measured effect that does not exist yet. The catalogue it needed (F147) shipped 2026-08-09, so what blocks it now is the navigation model (UC-063), not data |
| **T-B9** | Sync across devices (F192) | Comes after T-B2 and is cheap *because* of it: a union of append-only rows. **⚠ SPEC GAP** carried from ADR-0005: the tiebreak between two rows with the same timestamp from different installations. Client clocks are untrusted, so it cannot be wall-clock order |
| **T-B5** | Retire the Grundriss worked examples | Looks like a deletion, is a docs refactor: `docs/STATE.md:148` cites item-picker as **the** worked example of state coherence, `docs/specs/README.md:36` indexes it, and UC-001…003 are referenced from six files. Removing the code without re-pointing those is a broken-link failure at best and the loss of the only worked example at worst |
| **T-B6** | Five-state compliance for Input and Select | A rule conflict, not a bug — see the decisions below |

---

## Interaction and design-system audit

The primitives are in better shape than the app. What follows is real debt, but
none of it is urgent, because none of it is on a screen a learner sees yet.

**Five-state compliance.** `AGENTS.md` boundary 4 admits no exceptions: no
interactive element without default, hover, active, focus-visible and disabled.
Button honours all five. **Input and Select implement three** — no hover, no
active — and `docs/specs/component/select.md:36` documents only three, so the
spec and the boundary contradict each other in writing. Table's scroll region and
ItemPicker's rows are also missing `active`. This is a decision, not a defect to
be patched quietly: either native controls are exempt because the platform
supplies the feedback, and the boundary says so, or they are not, and three
components change. Nobody should resolve that by adding a hover colour.

**Hover on touch devices.** `DESIGN-SYSTEM.md:78` recommends wrapping hover
styles in `@media (hover: hover)`; no component does. On a phone, `hover:` sticks
after a tap, which will look like a selection bug on a review surface where
tapping is the primary interaction. Cheap now, annoying later.

**The success tokens have never been used.** `success`, `success-soft` and
`success-ink` exist in `app/globals.css` and no component consumes them, so the
"you got it right" pattern is unestablished. Note the asymmetry that will bite:
`accent` and `danger` each have a `-deep` variant for hover, and `success` does
not — so the first correct-answer button has no hover token to reach for. Also,
`check-contrast.mjs` only tests `success` as a *background*; `text-success` on
`bg-surface` is unverified.

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
2. **Are native form controls exempt from the five-state rule?** Yes → the
   boundary in `AGENTS.md` gains one sentence and `select.md` is already right.
   No → Input, Select, Table and ItemPicker each gain hover and active states,
   and that is a visual change you have not asked for.
3. **A `success-deep` token, or a documented asymmetry?** Needed before the first
   correct-answer button exists, not after.
4. Does `CONSTITUTION.md` §2 (the user's data) need writing out now that server
   storage is scheduled rather than hypothetical? `BACKEND.md` §9 says it stops
   being abstract the moment something is actually stored.
5. Chapter 25's questions 17–19 (perceived effort as a third ledger, whether the
   whole-task floor applies from day one, per-language dose bands). These can
   wait; none blocks code.
