# AGENTS.md

**Sprachenlernen** — evidence-driven language-learning app, built on Grundriss.
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

The contract for every agent and every human. Deliberately short — detail lives
in `docs/` and is linked from here. Read a link when the task touches it, not
before. **Keep this file under 150 lines** (enforced by `check:specs`); anything
longer gets skimmed instead of read.

> **Specs are the source of truth.** Code implements specs. When they disagree,
> one of them is wrong — fix it in the same change. "Both are fine" is not an
> outcome.

---

## Commands

```bash
npm run dev       # dev server
npm run verify    # ← the gate. Runs typecheck, lint, check:specs, check:tokens,
                  #   check:contrast, test and build. Run before every commit.
```

Never report work as done without a green `verify` — paste the output. To re-run
one failing check alone: `node scripts/verify.mjs tokens`.

---

## Change classes

Declare the class **before** you start. It decides how much process applies.
When torn between two, pick the higher one. Reviewers may escalate; nobody may
de-escalate silently.

| Class | Examples | Required before merge |
| --- | --- | --- |
| **Trivial** | copy/label text, comment, log line, single token swap, pure rename | `npm run verify` green |
| **Standard** | new component, new hook or helper, list/filter/sort, a self-contained UI surface | spec written/updated **first**; `verify` green; reuse check (§ Boundaries); one new test that covers the acceptance criteria |
| **Sensitive** | auth, money, data deletion, anything persisted, stateful/FSM UI, anything a user can't undo | everything in Standard **plus**: red-test-first (test shown failing before, passing after), fresh-context adversarial review by a different agent than the implementer |

Full pipeline, Definition of Ready and Definition of Done:
[`docs/WORKFLOW.md`](docs/WORKFLOW.md).

---

## Boundaries (hard blockers)

1. **Change-completeness.** A change is not done until the thing it replaces is
   gone — dead branches, unused exports, obsolete tests, **and the spec lines
   that described them**. Before declaring done, grep the removed symbol across
   `app/ components/ features/ lib/` *and* `docs/specs/` and confirm zero hits.
   This is the single most expensive recurring failure in codebases like this.
2. **Reuse before you build.** Check `docs/specs/component/` before creating a
   component, and state the outcome in one line — `Reuse: <name>` or
   `Gap: <missing variant>`. A missing variant gets added to the existing
   component; it never justifies a fork.
3. **No raw colors, radii, or shadows in components.** Only token utilities
   (`bg-surface`, `text-ink`). New value → token in `app/globals.css` first.
   Enforced by `check:tokens`.
4. **No interactive element without all five states** — default, hover, active,
   focus-visible, disabled. See [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).
5. **Server Components by default.** `"use client"` only for state, effects, or
   event handlers — and as far down the tree as possible.
6. **Ask before changing visual design.** Behavior fixes are free. Changing
   spacing, color, size, or composition that the user did not ask for is scope
   creep, even when the result is nicer.
7. **No new dependency without a note in the PR** saying what it replaces and
   why the platform can't do it.
8. **Never invent a rule to keep moving.** When the spec cannot answer the
   question, emit `⚠ SPEC GAP: <what is undecided>` and stop on that part.
   A guessed rule that happens to be right is still a decision nobody made.

---

## Code style

- **`cn()`** from `lib/utils.ts` (`twMerge(clsx(...))`) for every conditional
  class string. Later classes win — that is what lets a caller override.
- **`cva`** for anything with variants. Never `if/else` on class strings.
- Imports use the **`@/`** alias. No `../../`.
- Copy lives in `lib/content.ts` (or a feature's `content.ts`), not inline in
  JSX — so it can be reviewed, reused, and later translated.
- Comment the **why**, not the what. A comment that records a rejected
  alternative and its reason is what stops the next agent reintroducing the bug.
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## Where things live

```
app/                routes only — page/layout/loading/error. Thin.
app/globals.css     design tokens (@theme) + base styles. Single source of truth.
features/<name>/    one folder per feature: components, hooks, content, tests.
components/ui/      primitives used by ≥2 features (Button, Field, …).
lib/                framework-free helpers. No React, no fetch.
data/               content as data — language profiles, frequency lists, lemma
                    tables, the method catalogue. Never code.
docs/specs/         implementation contracts ← source of truth
docs/use-cases/     what the user is trying to do, in their words
scripts/            the gates behind `npm run verify`
```

A file moves from `features/x/` to `components/ui/` the moment a **second**
feature needs it — not in anticipation of one.

---

## Read next

| When | Read |
| --- | --- |
| Starting any feature | [`docs/WORKFLOW.md`](docs/WORKFLOW.md) |
| **Before multi-file work** | [`docs/AGENT-PITFALLS.md`](docs/AGENT-PITFALLS.md) |
| **Resuming work in an area** | [`docs/diary/`](docs/diary/) — the latest entry touching it |
| Writing a spec | [`docs/SPEC-FORMAT.md`](docs/SPEC-FORMAT.md) |
| **Anything with states, or a selection driving two surfaces** | [`docs/STATE.md`](docs/STATE.md) |
| Touching styles or tokens | [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) |
| Naming anything | [`docs/GLOSSARY.md`](docs/GLOSSARY.md) |
| A "fix" isn't working | [`docs/TRAPS.md`](docs/TRAPS.md) ← read this before your second attempt |
| Adding a database, or a second language | [`docs/BACKEND.md`](docs/BACKEND.md), [`docs/I18N.md`](docs/I18N.md) |
| Making a call you'll have to defend later | [`docs/adr/`](docs/adr/) |
| Product rules you may not break | [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) |
| **Why a feature exists at all** | [`docs/study/`](docs/study/) — the research this product is derived from |

---

## Working with the user

Ask **as many questions as it takes** to make the requirements unambiguous — there
is no budget of one or two. Batch them into a single message. Before multi-file
work, state: the invariant in your own words, the open questions, the files you
will touch, the files you will not touch, and how you will verify. The checklist of
what to ask about is in [`docs/AGENT-PITFALLS.md`](docs/AGENT-PITFALLS.md).

When the user corrects you, treat it as an invariant update: fix the code, sync
the spec in the same session, and note it in today's
[`docs/diary/`](docs/diary/) entry. If it is likely to recur, promote it —
a code trap to [`docs/TRAPS.md`](docs/TRAPS.md), a collaboration failure to
[`docs/AGENT-PITFALLS.md`](docs/AGENT-PITFALLS.md).

**Automated gates do not prove browser behavior.** For caches, revisits, and
anything where the second interaction differs from the first, end your turn with
an explicit `LIVE CHECK (you)` block: the steps to click, in order, and what
should happen. Never report "verified" for something you could not observe.
