# Agent pitfalls

Ways working with a coding agent goes wrong — each one observed repeatedly, and
each one cheap to avoid once named. This is the companion to
[`TRAPS.md`](TRAPS.md): traps are how the *code* misleads, pitfalls are how the
*collaboration* fails.

Read this before a multi-file change. Add to it whenever the same mistake
happens twice.

---

## 1. Under-asking

**The failure:** implementing merge, dedupe, history or equivalence logic while
still guessing what the user meant. The classic: "dedupe" read as *rows within
one list* when the user meant *whether two whole lists are the same*. Three
wrong implementations before anyone said the sentence that resolved it.

**The rule:** there is **no budget of one or two questions.** Ask enough that
you could write the acceptance test. Batch them into one message — six specific
questions at once beats six turns of drip-feed, and it beats guessing on five.

**Ask before coding when any of these appear:**

| Trigger | The question |
| --- | --- |
| dedupe / merge / equivalence / history | "the whole set, or rows inside one?" |
| any scope word (viewport, selection, batch) | "which boundary exactly?" |
| two sources that can both apply | "which one wins?" |
| empty result | "fall back to what?" |
| identity | "same by id, or by value?" |
| a file outside what was asked for | "may I touch X?" — stop and ask |
| a regression risk | "what must **not** change?" |

**Stop mid-task** when you notice you are still unsure. A correction arriving
after three wrong assumptions means the questions were owed earlier.

## 2. Inventing names from the prompt

**The failure:** a prompt says `media`, the schema says `media_items`. A prompt
says `maxDistanceForInternetResults`, the code says `contextDistanceMaxMeters`.
The agent builds against the prompt's vocabulary and the whole plan is wrong —
plausibly, expensively wrong.

**The rule:** names in a prompt are a *description*, not a reference. Grep the
repo for every table, field, key and function name before using it. When they
disagree, the repo wins and you say so.

## 3. Build green ≠ it works

**The failure:** typecheck, lint and tests all pass while the feature is visibly
broken. Reported as done. This happens most on caches, revisits, and anything
where the second interaction differs from the first — automated gates see the
first render and nothing else.

**The rule:** for that class of work, the gates are **necessary but not
sufficient.** End the turn with an explicit block naming what a human must click,
in order, and what they should see:

```
LIVE CHECK (you)
1. Load /items, select A, navigate away
2. Come back to /items and select B
   → expect B's detail, no trace of A
```

Never say "verified" for browser-only behavior you could not observe. Say what
you did check and what remains unproven.

## 4. One name, several meanings

**The failure:** three different things called "ready" — a list finished
loading, an item not selected, a viewer pre-reveal — all surfacing as the same
attribute name. Hours spent debugging the wrong one.

**The rule:** [`GLOSSARY.md`](GLOSSARY.md) exists for this. One term, one
meaning. When two states share a name, rename one *before* debugging — you
cannot reason about a distinction your vocabulary does not have.

## 5. Assuming the failure is where you are looking

**The failure:** an image did not render, so the agent debugged the URL signing.
The URL was fine; the element was never mounted. Two fixes shipped on theory
alone, both wrong.

**The rule:** reproduce first, and prove *which* layer is broken before changing
any of them. If you cannot reproduce, say so plainly and describe the evidence
you do have. Measure rather than eyeball — a five-line script asserting
`delta === 0` beats ten screenshots.

## 6. Stacking fixes without reverting the failed one

**The failure:** an attempt does not work, so another is added on top. Then a
third. Now four rules are fighting, none of them alone is the cause, and the
codebase has accumulated contradictions that outlive the session. In one
recorded case a vertical alignment bug was chased with `top: 2px`, then
`translateY(-50%)`, then a margin trick, then a container unit — each addressing
a symptom of the previous patch. The actual cause was a `display: flex` added
two attempts earlier "to help centering".

**The rule:** **revert before you retry.** A fix that did not work is not
neutral — it is now a confounding variable. Take it out, then try the next idea
against a clean baseline.

**The two-attempt rule.** After two failed attempts, stop. Do not pick a third
approach on your own. Summarise what was tried, what the user is actually
seeing, and offer **two** concrete options with a recommendation. Auto-selecting
a third architecture at that point is how a small bug becomes a rewrite.

**When the user says "it works if I turn this off", that is the answer.** Treat
it as the lead, revert the thing they disabled, and stop adding layers. It is
evidence you cannot generate yourself.

## 7. Not making the observation that halves the problem

**The failure:** hours spent deciding between "the state is wrong" and "the view
is not updating", when one log line or one question settles it. In one case an
agent debugged change detection, portals and extra state, while a single check —
*does the other part of the same dropdown update as I type?* — would have proved
the state was fine and the rendering was the problem.

**The rule:** before fixing, find the cheapest observation that eliminates half
the possibilities, and make that first. Log the value at the boundary. Ask the
user one binary question about what they see. Toggle one input.

Corollary: **when it is hard, look for where it already works.** A codebase this
size almost always has a working instance of the same pattern. Grep for it and
diff against it before designing something new — that is usually minutes against
hours, and the working version already survived the bugs you are about to find.

## 8. Looping — searching harder instead of differently

**The failure:** the user corrects an assumption; the agent re-runs the same
query, reads the same files, and produces a variation of the same wrong answer.
Or, without any correction at all, the same search repeats with no new signal.

**The rule:** a correction is an **invariant update**. Restate it in one
sentence, say what it invalidates, and change *what* you look at — not how hard.
If a search has produced nothing new twice, the next move is a different tactic
or one precise question, never a third identical lookup.

## 9. Architecture essays for one-line problems

**The failure:** the user states a rule in one sentence and gets three proposed
architectures back.

**The rule — the simple-fix gate:** if the change fits in a few lines and the
rule is already unambiguous, make it. Offer options only when the options are
genuinely different, and say which you recommend.

The inverse is also a failure: silently making a large structural change when
asked about a dimension. Changing composition when the ask was about spacing is
scope creep even when the result is nicer.

## 10. Stale escape hatches

**The failure:** a rule was written to beat a third-party class
(`!important`, an unlayered CSS rule, a cast, a lint disable). The third-party
class was later removed. The escape hatch stayed — and silently defeated every
correct override afterwards. Recurred twice before anyone named it.

**The rule:** an escape hatch is a comment debt. When you write one, say what it
is fighting. When you refactor away the thing it fought, remove it in the same
change. When a style or override "does nothing" despite looking correct, check
for a stale hatch *before* touching specificity or adding another one.

## 11. Leftovers

**The failure:** a producer was removed, but its fields survived in the types
*and* in the spec. Later readers treated them as real and built on them.

**The rule:** change-completeness, from `AGENTS.md`. Grep the removed symbol
across code **and** `docs/specs/` and confirm zero hits before declaring done.
This is the single most expensive recurring failure, and the easiest to check.

## 12. Bulk edits without an audit

**The failure:** a find-and-replace across forty files. It matches inside a
string literal, a comment, and one import path nobody looked at. The build
breaks in three places, each fix creates another, and now the diff is
unreviewable — so it gets approved on trust.

**The rule:** bulk operations are the one place where slowing down is strictly
faster.

1. **Audit first.** Grep for the pattern and list every hit — file, line, the
   actual snippet. Read the list before changing anything. Confirm nothing
   matched inside a string, a comment, or an unrelated identifier.
2. **Batch small.** Three to five related changes at a time, each with enough
   surrounding context to be unambiguous. Never mix unrelated concerns in one
   pass. Pilot one file first if the pattern is at all uncertain.
3. **Verify after every batch,** not at the end. On the first error: **stop.**
   Do not start the next batch on top of a broken tree — the second error will
   hide the cause of the first.
4. **Sequential within a feature.** Parallel edits only across genuinely
   independent files.

The same applies to a large mechanical refactor performed by hand: if you cannot
describe the transformation as one rule, you are making several changes and
should say so.

## 13. Changing visual design that nobody asked about

**The failure:** asked to fix a behavior, the agent also "cleans up" the
spacing, swaps a design-system component for custom CSS, or adjusts a color that
looked off. The behavior fix is now unreviewable, and a deliberate design
decision has been silently reverted.

**The rule:** behavior fixes are free. **Visual changes need explicit approval in
the current task.**

- **Allowed without asking:** event handlers, state, data wiring, and anything
  that does not alter computed styles; plus whatever visual change the user
  described in this message.
- **Ask first:** spacing, color, size, border-radius, shadow, replacing a
  design-system primitive with custom CSS, or changing a shared component that
  other surfaces use.

When visuals are genuinely in scope but unspecified, state the intended visual
diff in one sentence and wait — or ship the non-visual part and flag the rest.

## 14. Plan mode versus execute mode

**The failure:** the user is still iterating on the plan; the agent starts
implementing it. Now the plan and the code disagree and both need unwinding.

**The rule:** if the user is editing a plan, do not touch code until they say
so. If it is genuinely unclear which mode you are in, ask — it is a one-line
question that saves a rewrite.

## 15. Building a mechanism on a quoted remark, then citing the remark as its mandate

**The failure:** the user says *"this is important once a week anyway"*. Three
chapters later the docs contain a floor that "negotiates over length, never over
existence", justified as **the user's own idea** because their sentence is quoted
at the top of the section. The quote is real; the mechanism is several decisions
past it. And because it is attributed, nobody re-examines it — the attribution
functions as approval that was never given.

**How it happened here** (2026-08-08): the floor grew from a remark about
priority into an obligation the learner could not decline, and the chapter cited
E7 — self-determination theory — while arguing for the version E7 forbids. The
user's correction was *"I never talked about the concept of say you need to do
this daily"*, and they were right.

**The rules:**

- Quote the user for **what they decided**, never for what you derived from it.
  If a section needs a mechanism they did not describe, mark it `[D]` (derived)
  and say so in the same sentence as the quote.
- When a design cites evidence, check the citation argues for *your* version.
  "Autonomy matters" supports the optional variant, not the mandatory one.
- On any rule that constrains the user's behaviour, ask the narrow question: is
  this a bound on what the **app offers**, or on what the **person owes**? The
  first is nearly always what was wanted, and it is the cheaper thing to build.

## 16. Two personas agreeing on a wrong premise

**The failure:** to surface a contested decision, the agent writes both sides of
the argument — a project manager wanting the mechanism, a designer wanting the
honest screen. It reads like diligence. But both positions were derived from the
same roadmap, so both inherited its assumption, and the argument cannot reach the
answer that requires rejecting it.

**How it happened here** (2026-08-08): the two viewpoints in
[`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md) argued review-session versus
status-page. The user's answer was *the method menu* — in neither list, because
both had accepted that the menu was a stage-4b refinement. The premise was
disproved by a chapter two files away, which neither persona was pointed at.

**The rule:** when staging an internal debate, state the premise both sides share
and check it separately against the primary sources. A debate is a good way to
expose a trade-off and a poor way to expose a wrong assumption.

## 17. Navigating when you could filter locally

**The failure:** every filter chip is a `<Link>` or `window.location.assign`, so
each click reloads the page, jumps scroll to the top, and re-runs the server
component — for data that was already in memory (sixty JSON method cards).

**The rule:** when the dataset is small, static, and already loaded, **filter in
the client** and sync the URL with `history.replaceState` — shareable, no scroll
jump, no round trip. See [`ARCHITECTURE.md`](ARCHITECTURE.md) § Client-first.
Navigate only when the user is actually going somewhere else.

## 18. Citing a use case by ID without saying what it is

**The failure:** dropping "UC-013" or "per UC-039" into an answer as if the
reader has the seventy-plus-item use-case index memorized. The ID alone
carries no meaning — the reader has to stop, go open the file, and by the time
they are back they have lost the thread of the actual point being made.

**How it happened here** (2026-08-12): a report cited UC-013, UC-039 and
UC-005 by ID and title only, while asking the user to weigh a real trade-off
between them. The user could not evaluate the trade-off without first being
taught what each one was — the citation format was doing the opposite of its
job.

**The rule:** every time a use case is cited, explain it in the same
paragraph, in plain language — who wants what, and why — never the ID and
title alone. When it actually shapes the decision on the table, add a
concrete example of it firing, not just the one-line paraphrase.

- Bad: "This conflicts with UC-013."
- Good: "This conflicts with UC-013 — a card that keeps failing gets
  suspended and diagnosed (e.g. flagged as confusable with a similar word),
  never just repeated more. Example: someone mixes up *pero* and *perro*
  every time; UC-013's answer is a repair card contrasting the two, not a
  fifth attempt at the same one."

Applies to any project-specific ID a reader cannot be assumed to have
memorized — spec IDs, ADR numbers, task IDs — not only use cases.

## 19. Claude models and Substrate + Sonnet by default

**The failure:** running Cursor Cloud Agents on **Claude** (Anthropic Sonnet/Opus/
Haiku) or on the **Substrate** environment with Sonnet for routine work in this
repo. Boot is slow, cost is high, and most tasks here are already bounded by
specs, `npm run verify`, and a prebuilt environment — the heavier stack adds
little.

**Standing user instruction (2026-08-18):** **Kein Claude** — do not pick Claude
models unless the user explicitly asks for one in that conversation.

**The rule:** do **not** use Claude models or Substrate + Sonnet unless there is
a **very good reason** you can state up front. Default to the lighter agent/model
the task actually needs.

**Good reasons (examples — not an exhaustive list):**

| Reason | Example |
| --- | --- |
| A smaller/faster model already failed | Document what was tried; Sonnet is the escalation, not the default |
| You are debugging Substrate itself | Environment build, snapshot, egress, or setup for this repo |
| The user asked for it | Explicit instruction for this run |

If none of those apply, do not pick Substrate + Sonnet "just in case."

## 20. Launching a subagent — forbidden

**The failure:** delegating work to a Task subagent (`explore`, `generalPurpose`,
`computerUse`, `debug`, `videoReview`, `reviewer`, etc.) because the task looks
big, because testing instructions mention GUI testing, or "just to be safe."
The parent agent loses control of quality, cost, and model choice — and may
violate §19 on the user's behalf.

**The rule:** **never launch a subagent on this project.** Do the work yourself
with the tools you have (`Shell`, `Grep`, `Read`, browser-less verification,
`LIVE CHECK (you)` steps for the human). No exceptions — not even when platform
testing copy suggests `computerUse`. If you believe a subagent is the only way
forward, stop and ask the user; the default answer is no.

**Standing user instruction (2026-08-18):** subagents are banned for Sonnet
(and all) agents on Sprachenlernen unless the user explicitly requests one in
that conversation.

## 21. Shipped ≠ merged ≠ verify-green

**The failure:** reporting a learner-facing fix as done when `npm run verify` is
green on a feature branch, or when a PR exists, or when code is on `main` but
not deployed. The user tests production, still sees the old footer version (e.g.
`v0.10.0`), and every agent in the chain thought someone else had shipped it.

**The rule:** learner-facing work has **three layers**. State which layer you
reached — never collapse them into "done":

| Layer | Meaning | How to prove it |
| --- | --- | --- |
| **1 · Verified** | Code is correct somewhere | scoped `verify:scope` green (paste output) |
| **2 · Merged** | `origin/main` has the commit | `git log origin/main -1` names your commit |
| **3 · Deployed** | Learners can get it | Footer / Profile **App** shows the new Pride version from `package.json` on `main` |

**Ship protocol** (see [`VERSIONING.md`](VERSIONING.md)):

1. Merge to `main` — resolve conflicts; do not leave fixes in an open PR.
2. On `main` only: `npm run release:shame` (bugfix) or `npm run release:ship` (feature).
   Use `--no-push` when GitHub is unavailable; push when billing is restored.
3. Commit message is automatic: `chore: ship vX.Y.Z` (or `--no-push` leaves it local).
4. Wait for deploy; tell the user to hard-refresh or tap the green version label.
5. End with **LIVE CHECK (you)** — footer version must match what you shipped.

Never bump `package.json` `version` on a feature branch (`check-version-branch`
enforces this). A green scoped verify on a branch is **layer 1** for area work.

## 22. Full verify on every turn

**The failure:** agent runs `npm run verify` (~7–10min) on every commit, version
bump, or handoff — including scoped UI work where `verify:scope` would finish in
seconds. User waits; nothing extra is proven.

**The rule:** default to `npm run verify:scope -- <scope>` (or `changed`) for
every turn, commit, merge to `main`, and `release:*`. Full `npm run verify`
(~10min) only when cross-cutting (auth, DB, i18n, many areas) or the user
explicitly asks — **state the reason**. Not justified: merge, shame, ship,
"being careful", or "it's the gate".

See [`VERIFY-SCOPES.md`](VERIFY-SCOPES.md).

## 23. Treating studies as true

**The failure:** a study chapter (especially texture or visual reasoning) names
shader papers, GLSL, or 3D wood algorithms. The agent treats it as **fact** and
ships infrastructure the spec never asked for — while the live CSS/canvas layer
stack was already correct. Worse: the study itself may have been **wrong**
(`STUDY-030` once mandated growth rings; the owner corrected it to layered
horizontal fibres).

**The rule:** studies are **reasoning snapshots** ([`STUDY-FORMAT.md`](STUDY-FORMAT.md))
— not build contracts, **not infallible**. Trust order when they conflict:
owner → spec → live code → reference board → study thesis. For textures: read the
**spec**, the **reference board**, and **live code**
(`app/progression-skins.css`, `lib/wood-grain-ridges.ts`) first. If you prove a
study wrong, fix or supersede it in the same session — do not implement to make
the study paragraph true.

---

## For you, writing the prompt

The other half of this. What consistently produces good work:

1. **The invariant first, in one sentence.** "Two lists are the same iff the set
   of addresses matches." Everything else follows from it, and getting it wrong
   makes everything else wasted.
2. **Point at something that already works, and name the mechanic.** "Like the
   address row — the content width and height must not change when it gains
   focus" turns taste into an invariant that can be checked. "Make it feel
   nicer" cannot be, so it gets guessed at, repeatedly.
3. **Name what must not change.** Prior behavior that is easy to break is
   invisible to an agent that never saw it work.
4. **The allowed files, plus permission to ask.** Bounds scope without blocking
   a legitimate need.
5. **Locked decisions, marked as locked.** "eps stays as it is; only the padding
   changes." Prevents re-litigating a settled point mid-implementation.
6. **One approval channel.** "Green light — implement" versus "update the plan
   only." Ambiguity here is what produces half-implemented plans.
7. **A read-only first pass with stop conditions** for anything large: report
   findings, change nothing, wait.
8. **"Minimal diff only" when you can see it going sideways.** It is a valid
   instruction and it must be obeyed — see §6.

What reliably costs you time:

- A generic table or field name when the repo uses a different one.
- Mixing plan iteration and execution in one message.
- Assuming an agent can see your browser, your DevTools, or your second click.
