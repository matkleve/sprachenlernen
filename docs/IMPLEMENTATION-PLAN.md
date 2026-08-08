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
| `components/ui/` | Button, Field, Input, Select, Dialog, Table — inherited from Grundriss, specced, tested |
| `features/` | `item-picker` and `primitives` — **both are the starter's worked examples** |
| `app/page.tsx` | Still the Grundriss demo. Headline reads "Grundriss — The plan comes before the building" |

**The honest summary: two strong libraries and no product.** Nothing in `app/`
belongs to this product yet. There is no screen a learner could open, so there is
also no interaction flow to audit — the audit below is therefore about what the
first flow must be, plus the interaction debt already sitting in the primitives.

---

## Two blockers, and only one of them blocks this queue

1. **Question 16 — where the review log lives.** Blocks everything that
   persists, which is all of stage 1. The recommendation already in the roadmap
   is local-first with an append-only, per-review-UUID log so a server is later
   an addition rather than a migration. **This needs one word from you.** Until
   then, no task may write user data.
2. **Stage 2 needs the vocabulary estimate (F17–F22)**, which is now unblocked on
   the data side — tier B means a level *may* be claimed with a widened band.
   That is new since this morning and it is the biggest change to the plan.

Everything in Track A below is deliberately chosen to need **neither**.

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

### T-03 · The first surface that belongs to this product

**Class:** Standard · **Reuse:** Table, Button · **Serves:**
[`use-cases/UC-036-know-how-much-to-trust-this-language.md`](use-cases/UC-036-know-how-much-to-trust-this-language.md)
· **New spec:** `docs/specs/page/language-status.md` (`SPEC-page-language-status`)

Replace the Grundriss demo page with the smallest screen that is *this* product:
for each shipped language, what the app can and cannot claim, and why. Every
value on it is already derived by code that exists — nothing is invented, nothing
is stored, no state machine is involved, and it is a Server Component.

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
6. `app/page.tsx` no longer renders `PrimitivesDemo` or the Grundriss headline.
7. Axe-clean, and the table carries a caption and `scope` on every header, which
   `components/ui/Table.tsx` requires anyway.

Guardrails: do **not** delete `features/item-picker/` or `features/primitives/` in
this task — see T-B5, they are load-bearing for the docs. Do not add a new
component: if a card-like container seems necessary, use the Table primitive and
say `Gap:` in the PR instead of creating one.

### T-04 · Only after T-03: the starter's copy leaves `app/`

**Class:** Trivial · **Files:** `app/page.tsx`, `features/primitives/**`

Once T-03 owns the home route, the primitives demo has no route. Move it to
`/primitives` or delete it — that is a decision, so it is listed here and not
executed blind.

---

## Track B · Needs a spec written by a thinking model first

Not because they are large, but because each one contains decisions that a
low-inference agent would silently invent.

| # | Work | Why it is not Track A |
| --- | --- | --- |
| **T-B1** | The review session surface | **Sensitive.** Stateful UI, so `STATE.md` demands one enum, an explicit transition map, named terminal states and a single source of truth *before* any code. It also persists, so it is blocked on question 16 |
| **T-B2** | Persistence of the review log | **Sensitive**, and it *is* question 16. The shape is the one thing in this product that cannot be recomputed |
| **T-B3** | Vocabulary estimate and the level display (F17–F22) | Newly unblocked by tier B. Needs the anchor table from `study/03-level-model.md`, which is graded **[C]** and explicitly needs calibrating — a spec must say what is claimed with an uncalibrated band |
| **T-B4** | Dose ledger (F184) | Needs roadmap question 19 answered, and its logging half needs T-B2 |
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
that any of it is usable. Question 16 is the only thing standing between us and
stage 1, and it has been open since this morning; every hour it stays open, the
implementable surface stays at about one afternoon of work. Answer it, then ship
a review session end to end, badly if necessary. And I want the demo page gone
before anyone else sees this repo and concludes the product is a starter kit."

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

**Where they agree, which is what matters.** Both want question 16 answered
today; both want the Grundriss demo off the home route; and neither wants a
review surface built before its state machine is written down. T-03 satisfies the
designer and costs the manager about a day of the critical path — and it produces
the first screenshot this project has ever had.

---

## What needs a decision from you

Ordered by how much they block.

1. **Question 16 — where does the review log live?** Recommendation in the
   roadmap is local-first, append-only, per-review UUIDs. One word unblocks all
   of stage 1. Everything in Track A is designed to proceed without it, and
   nothing in Track B can start.
2. **Is T-03 the first surface?** The alternative is going straight at the review
   session. The manager and the designer disagree; the tie-breaker is whether you
   want a screenshot this week or a mechanism.
3. **Are native form controls exempt from the five-state rule?** Yes → the
   boundary in `AGENTS.md` gains one sentence and `select.md` is already right.
   No → Input, Select, Table and ItemPicker each gain hover and active states,
   and that is a visual change you have not asked for.
4. **A `success-deep` token, or a documented asymmetry?** Needed before the first
   correct-answer button exists, not after.
5. Chapter 25's questions 17–19 (perceived effort as a third ledger, whether the
   whole-task floor applies from day one, per-language dose bands). These can
   wait; none blocks code.
