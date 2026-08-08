# Traps

Bugs that shipped, or nearly shipped, because the code looked correct. Each one
cost real time. Read the relevant entry **before your second attempt** at a fix —
that is when this file pays for itself.

**Add to this file whenever something surprised you.** Format: what looked
right, what was actually true, and the check that would have caught it. Newest
at the top. Entries never get deleted, only marked resolved — a trap that stops
applying is still evidence about how this codebase misleads people.

---

## A token that does not exist resolves to nothing, silently

`var(--transition-geometry)` where no such token is defined does not error. The
declaration is simply dropped and the property never applies. The symptom is
"the animation does nothing", which reliably sends people off refactoring the
logic — in the case this comes from, an agent rebuilt a state machine and its
CSS before discovering the one-line cause: a token the spec still named, removed
in an earlier migration.

Tailwind does the same thing with utilities: `bg-brand` where no `--color-brand`
exists produces no class at all, and the element just has no background.

**When something visual "does nothing", check that every name involved actually
resolves before touching any logic.** `npm run check:tokens` now catches
`var(--x)` references to undefined tokens, which covers the CSS half.

## Tests that pass alone and fail together

A test file that is green on its own and red in the full run is not flaky in the
random sense — it is sharing state. Module-level variables, a cached client, a
mock installed in one file and read in another, an `fetch` stub that leaks.

Two consequences worth internalising:

- **A flaky test is not a gate.** Fix the isolation before adding assertions;
  a check people learn to re-run until it passes has stopped being a check.
- **Order-dependence hides real failures.** If test A only passes because test B
  ran first, then the thing A claims to prove is not proven.

Keep setup inside the test or in `beforeEach`, never at module scope, and be
suspicious of anything imported for its side effects.

## `position: sticky` fails silently without a bounded scroll container

Sticky only works when an ancestor actually scrolls **and** has a definite
height. In a flex column that usually means the ancestor needs `flex: 1`,
`min-height: 0` **and** `overflow-y: auto`. Miss any of the three and the
element simply does not stick — no error, and the whole page scrolls instead.

Before changing the sticky element, use DevTools to confirm *which* element is
the scroll container. It is frequently not the one you assume.

## A controlled input can lose what the user typed

Binding an input's `value` to state that is updated asynchronously — or updated
in an effect that also reads it — lets a render land between the keystroke and
the state update, and the DOM value is reset to the older value. The visible
symptom is characters disappearing, or the field freezing after the first one.

Two rules that avoid it:

- Read the value from the event (`e.target.value`), not from a re-read of the
  element afterwards.
- Never write to the input's value from an effect that depends on the same
  state. See [`STATE.md`](STATE.md) § Do not write state in an effect.

## `cn()` silently keeps both classes for custom tokens

`tailwind-merge` only knows Tailwind's **default** scales. A custom token like
`rounded-pill` is a class it cannot classify — and a class it cannot classify is
one it will never treat as conflicting. So `cn("rounded-pill", "rounded-none")`
emits **both**, and which one wins comes down to CSS source order.

It reads as "`cn()` is broken". It is not; it is uninformed. Every custom token
namespace has to be declared in `extendTailwindMerge` in
[`lib/utils.ts`](../lib/utils.ts) — and **adding a token to `globals.css` means
adding its name there too**, or callers quietly lose the ability to override it.

Caught by the `className` override test in `components/ui/button.test.tsx`. If
you add a token scale, add that test for it.

## Chromium is not a proxy for Safari, and desktop is not a proxy for iOS

The only browser in most CI and agent environments is Chromium. Several classes
of bug measure **correct in Chromium** and are wrong on an iPhone, so a green
local screenshot proves nothing:

- baseline / `vertical-align` / line-box height — engines read different font
  metric tables for the same font file
- flexbox baseline alignment, especially of buttons and other replaced elements
- `backdrop-filter`, `mix-blend-mode`, `filter` on composited layers
- `position: fixed` combined with any of the above

If a change touches those, reason from the CSS spec and from font metrics, and
**say plainly that you could not reproduce on-device**. Do not report "verified".

## A `<button>` has no baseline

`vertical-align` does nothing to a flex item, and flexbox cannot baseline-align
a `<button>` — it has no text baseline, so it silently falls back to centering
on the flex line's cross size, which is derived from font metrics and therefore
differs per engine. Aligning a button with adjacent text via flexbox is not a
thing you can do reliably. Use an inline-block wrapper with no in-flow line
boxes, or accept centering.

## The dev server serves the last build

`npm run start` serves whatever is in `.next`. Screenshotting without rebuilding
shows you the old UI and has produced false "verified" claims. **Always rebuild
before screenshotting.** If output looks impossible, `rm -rf .next && npm run build`.

## Utilities beat component classes regardless of source order

Tailwind emits `@layer utilities` after `@layer components`, so a utility in a
class string overrides a component class silently. A `shadow-none` in a class
string once cancelled the box-shadow that *was* the component's entire visual
identity — nothing looked wrong in the code. See
[`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) § The trap.

## A shared component renders at more than one width

A component used at a fixed width in a dialog and a fluid width in a grid cannot
be styled with viewport breakpoints — the dialog's box never changes width no
matter the screen size. Use **container queries** (`@container` + `@[NNNpx]:`)
when the component's *own* width should drive its styling, not the viewport's.

## Automated a11y checks only see what is rendered and visible

A static-page audit never opens a dialog, a menu, or anything behind an
interaction — and anything `opacity-0` is invisible to it too. So:

- Interactive surfaces must be checked by hand or with a test that opens them.
- When you un-hide an existing surface, expect the audit to start reporting its
  pre-existing debt. **That is the gate working, not a regression you caused.**
  Fix it or file it; do not re-hide the surface to make the gate quiet.

## Don't fix a layout bug by swapping the layout

A card had dead space under its text because of a fixed-height text block. The
"fix" replaced the whole card with a different component: the gap went away, and
so did the design. The real fix was one line — remove the fixed height so the box
is content-driven. Prefer the smallest change that removes the *cause*.

## Two fixes shipped on theory alone, and both were wrong

If you cannot reproduce a problem, say so and explain what evidence you *do*
have. Then measure rather than eyeball: screenshots hide sub-pixel and baseline
problems. Query real geometry (`getBoundingClientRect()`, canvas
`measureText()`) and print the numbers. A five-line script that asserts
`delta === 0` is worth more than ten screenshots.

## A self-transition out of a terminal state looks legal and isn't

The scheduler's guard read `from === to || TRANSITIONS[from].includes(to)`. The
first clause is correct — moving to the state you are already in is not a
transition — and it quietly made `retired → retired` legal, so retiring an
already-retired task reported success instead of a no-op. A terminal state is
one you can never *leave*, and by `docs/STATE.md` acting on it is a no-op; that
includes acting on it with its own name.

Guard terminality first, and **derive** it from the map (`TRANSITIONS[s].length
=== 0`) rather than keeping a second list of terminal states. Two lists drift;
the second one is always the one nobody updates.

## The state machine, not the algorithm, is where a scheduler goes wrong

Implementing FSRS from the published formulas produced a scheduler where a new
card silently never left `new`. Nothing was wrong with the arithmetic: the code
graduated a first "good" answer straight to `review`, the transition map had no
`new → review` edge, and the illegal move became a no-op — exactly as designed.
Every downstream test failed with a number, none with "illegal transition".

When a stateful module fails broadly and numerically, check the transition map
before checking the maths. And make illegal moves *reportable*: the `reason`
string was in the return value all along, and no test looked at it until one was
written that did.

## Verify numeric constants against the source, not against memory

The FSRS-4.5 initial-difficulty formula is `D₀(G) = w₄ − (G−3)·w₅`, linear. The
exponential form belongs to FSRS-5. Recalled from memory it looked right and
produced difficulties that clamped to the floor for every good answer — which
degrades quietly into "everything is easy" rather than failing loudly.

For any weight table or published formula, fetch the source and paste the link
next to the constant. `lib/scheduler.ts` does this. A wrong constant in a
memory model is invisible for months and then unfixable, because user history
was built on it.

## A green test suite proved nothing: nine defects, 29 passing tests

An adversarial review of the scheduler found nine confirmed defects while every
test passed. Two of the tests were **tautological**: they compared two call
sites that both delegate to the same function, so they would pass against any
implementation, including a stub returning a constant.

The tell: a test whose two sides cannot disagree by construction. `project` vs
`applyReview` and `rebuild` vs a hand-rolled fold both looked like strong
end-to-end checks and asserted nothing. Before trusting a test, ask what
implementation would make it fail. If none exists, the test is decoration.

## Deriving a state from a value instead of from the current state

`step` chose the next state from stability alone: any `again` returned
`relearning`, even from `learning`. The transition map has no
`learning → relearning` edge, so the guard did its job and rejected the move —
and `applyReview` then discarded the learner's entire answer. New card answered,
forgotten the next day, is the single most common flow in the product, and it
was a no-op that also left the task permanently due.

A state machine's next state is a function of `(current state, event)`. The
moment a value like stability enters that decision, the code and the map can
disagree, and the disagreement surfaces as data loss rather than as an error.

## The illegal-transition no-op hides the bug it reports

The rejection carried a perfectly good `reason` string. Nothing read it. Every
downstream test failed with a wrong *number* instead, so the diagnosis pointed at
arithmetic for as long as anyone looked.

When a module reports refusals, at least one test must assert that a legal
operation is **not** refused. `expect(result.illegal).toBe(false)` on the happy
path is worth more than it looks: without it, "silently did nothing" is
indistinguishable from "worked".

## Documenting an ordering does not create it

`scheduler.algorithm.md` said "the order matters because difficulty feeds
stability". The code computed the new difficulty and then passed the **old** one
into both stability functions, making the two steps order-independent. Worth up
to two weeks of interval on a mature card, compounding on every future review.

A normative sentence about internal ordering needs a test that fails when the
ordering is inverted. Prose about data flow is not a constraint on data flow.

## Rounding for the user's convenience broke the model's calibration

Intervals were rounded to whole days because learners think in days. At a
stability near one day that moved actual retrievability 0.17 from target — eight
times the tolerance the spec allowed — and the acceptance test only survived
because its fixture landed on a large stability.

The fix was not a length threshold but a rule stated in the units that matter:
round only while rounding stays inside the retention budget. A presentation
choice that silently alters a measured quantity needs its distortion bounded by
the same criterion the quantity is judged by.

## A declared edge no exported function can reach

`suspended → learning` was legal in the map, mentioned in the spec, covered by
no test, and unreachable: there was no `unsuspend`, and `applyReview` refused
suspended tasks outright. `suspended` was a second terminal state in everything
but name, which the spec explicitly forbade.

Every edge in a transition map needs a caller that can traverse it and a test
that does. An unreachable edge is worse than a missing one — it documents
behaviour that does not exist.

## Piping `npm run verify` into `tail` throws away its exit code

`npm run verify 2>&1 | tail -3 && git commit && git push` pushed a **red** gate.
A pipeline's status is the *last* command's, and `tail` always succeeds, so the
`&&` chain saw success and carried on. The failure was visible on screen and
ignored by the shell — the worst combination, because it looks like it was read.

Use `set -o pipefail`, or check the gate in its own command before chaining
anything to it. Do not summarise a gate's output in the same command that acts
on its result.
