# Traps

Bugs that shipped, or nearly shipped, because the code looked correct. Each one
cost real time. Read the relevant entry **before your second attempt** at a fix —
that is when this file pays for itself.

**Add to this file whenever something surprised you.** Format: what looked
right, what was actually true, and the check that would have caught it. Newest
at the top. Entries never get deleted, only marked resolved — a trap that stops
applying is still evidence about how this codebase misleads people.

---

## Agents used `version:ship` for bugfixes

Method-detail regressions (wrong assets, layout, header title) were shipped with
`version:ship` (`0.14.0` → `0.15.0` → `0.16.0`) because `AGENTS.md` only named
`version:ship`. Pride versioning treats bugfixes as **shame** bumps
(`0.14.0` → `0.14.1`), not default bumps.

**The fix:** `docs/VERSIONING.md` and `AGENTS.md` now require `version:shame` for
bugfixes. **The check:** before bumping on `main`, ask whether the merge fixes
something broken — if yes, shame; if it adds capability, ship.

## Parallel agents bumped `package.json` on feature branches

Two agents shipped overlapping PRs. Each ran a “release” bump (`0.1.1`, `0.2.0`)
on its own branch, `pride-version.test.ts` pinned a literal version, and every
merge became a three-way fight over `package.json`.

**The fix:** version changes only on `main` via `version:shame` (bugfix) or
`version:ship` (feature); tests
read `package.json` dynamically; `verify` runs `check-version-branch` on feature
branches. **The check:** feature-branch PRs must not touch `version` in
`package.json`.

## Profile section panels passed as client props crashed in production

`ProfileSections` accepted `languages`, `data`, and `device` slot props from the
server page. The `data` slot wrapped server-rendered `<section>` / heading markup
around `AccountDataPanel`. In production Next.js threw `render/boundary` with
digest `3227379777` and the profile showed *Could not load your profile.*

**The fix:** `ProfileSectionNav` is client-only (pills + `hidden` toggle by panel
id). Panels stay server siblings in `page.tsx`. **The check:** no profile panel
markup inside client component props; grep for `ProfileSections`.

## Sign-out form inside ProfileSections crashed in production

`signOutAction` on a `<form>` passed as the `signOut` prop to client
`ProfileSections` looked fine in dev. In production Next.js threw
`render/boundary` and the profile showed *Could not load your profile.*

**The fix:** keep the sign-out form in the server `page.tsx`, as a sibling after
`ProfileSections` — never pass server actions through the client section shell.
**The check:** profile page has no `action={signOutAction}` inside
`ProfileSections` props.

## Profile bound server actions inside LanguageListRow crashed in production

Forms with `action={serverAction.bind(null, code)}` rendered as `LanguageListRow`
children looked correct in dev — the page loaded, switches worked. In production
Next.js threw `render/boundary` with the digest-only message and the profile
showed *Could not load your profile.*

**The fix:** profile language blocks are client components that call server
actions via `useTransition` + `Button onClick`, same as `LanguageSwitcher` —
never bound form actions through the row's client boundary. **The check:** grep
profile for `.bind(null` on server actions; zero hits.

## Card press scaled the link, not the shell

Method cards wrapped `SurfaceLink` (`cardPressable` → `active:scale-[0.98]`) inside
an `<article>` that owned the border, shadow, and section tint. On press the
inner content shrank while the frame stayed put.

**The fix:** one element — `SurfaceLink` carries `methodSectionSurface` + `shadow-soft`.
`PressableCard` and `LanguageListRow` already did this. **The check:** the
navigating element's class list includes both `border-line` and `active:scale`.

## Safari bottom toolbar looks route-specific but is session state, not page code

`/methods` often shows no iOS Safari bottom inset; `/words` and `/progress` often
do. That is **not** different shell code per route and **not** page length —
`/methods` is ~10× taller (~18k px vs ~1.8k). Same hook, same CSS on every route.

**What looked true:** Methods needs a fixed bottom lift; Words needs more inset.
**What was actually true:** Safari decides toolbar visibility (gestures, bottom
taps on the pill, session state in one tab). No web API to force it per URL
([Ionic #19081 — Apple](https://github.com/ionic-team/ionic-framework/issues/19081#issuecomment-948987368)).
A fixed `3rem` lift was wrong when the toolbar was absent.

**Owner QA (2026-08-15, true PWA):** asymmetry persisted — Methods/mirror OK,
Words/Progress not. That is **not** session-only: mirror shares Methods body.
Forcing inset `0` in standalone (`v0.5.0`) **did not fix** it and **worsened
pill taps** — reverted. See [`study/31-ios-safari-pwa-test-report.md`](study/31-ios-safari-pwa-test-report.md).

**The fix (keep):** `useVisualViewportBottomInset` —
`max(0, innerHeight - visualViewport.height - visualViewport.offsetTop)` →
`--shell-visual-viewport-bottom-inset`. Pill lifts when measured inset > 0; sits
low when 0. **Do not** add per-route inset. Study:
[`study/29-ios-inset-by-route.md`](study/29-ios-inset-by-route.md).

**`interactive-widget: resizes-content` nuance:** removed from `app/layout.tsx`
during mobile-nav work, but iOS Safari **does not implement** `interactive-widget`
([WebKit #259770](https://bugs.webkit.org/show_bug.cgi?id=259770)). Any
asymmetry observed on iOS was from Safari session/gesture state or the old fixed
lift — not from that meta tag on iPhone.

**The check:** fresh tab on `/methods` (inset 0) → tap bottom pill to Words
without scrolling → inset may flip non-zero from the tap → return to Methods →
inset may stay non-zero. Same formula on both routes; only the variable changes.

## Every adapter called `getUser()` independently, and every navigation paid for it

Production felt slow on every navbar click and language switch. The client
bundle was fine (~120 kB). The server was not.

`middleware.ts` called `getUser()` to refresh the session. Then
`requireAccount()`, `listLearningLanguages()`, `listReviewsForTaskIds()`, and
`poolForActiveLanguage()` each created a fresh Supabase client and called
`getUser()` again — three to five Auth round trips per navigation, plus
`learner_language` queried twice (layout for the shell, page for the pool).
`/methods` also called `readProgress()`, loading form-recall history the
standing line never uses.

Nothing in `npm run verify` counts network calls, and every adapter test stubs
Supabase, so duplicate calls stayed green.

**The fix:** `React.cache` on the per-request client and shared reads;
`getSession()` in Server Components after middleware's one `getUser()`; standing
loads meaning-recall history only. **The check that would have caught it:**
trace one signed-in navigation and count Auth + DB round trips before shipping
a new adapter that calls `getAccount()`.

## The cleanup rule picked a sense, and picked the wrong one

Dictionary glosses were too long for a flashcard back, so they were shaped:
strip the bracketed apparatus, keep the first `;` group, keep the first three
comma-separated synonyms. Mean length dropped from 22.7 to 11.0 characters and
every card passed every check — non-empty, under the cap, not equal to its front.

`policía` shipped as **"Civility, polity, public order"**. The raw gloss was
`Civility, polity, public order, police, fineness, neatness, urbanity`, and the
three-synonym cap cut one position before *police*. `gran` shipped as
**"apocopic form of grande"**, because that was the first `;` group and
`great, grand` was the second. Both are worse than shipping the raw gloss.

The two rules that did the damage are **positional**, and the source does not
order senses by usefulness — Wiktionary orders them historically as often as
not. So the rule was a guess about which sense mattered, applied 500 times,
silently, to a product whose whole claim is that it does not guess.

**Removing what is always secondary is safe; ranking what is sometimes primary
is not.** Stripping a parenthetical cannot discard the answer, because a
parenthetical always elaborates the gloss in front of it. Keeping "the first N"
of anything can. When a cleanup rule has to choose between alternatives, it
does not belong in a script — make the case fail loudly and have a human decide.
Here that left 12 cards needing a hand gloss out of 500, which is a morning.

The tell it was missed by: the gate checks were all *shape* checks (length,
emptiness, equality). None of them could see meaning, which is the only thing
the shaping was changing.

## Growing a data file broke a query, and every test stayed green

The Spanish starter pool went 50 → 500 lemmas. Pure data, no call-site change,
`verify` green: typecheck, lint, 456 tests, build.

`listReviewsForTaskIds` asks for the whole pool's history in one go, and
PostgREST takes `in.(…)` **in the query string** — so the entire task-id list
rides in the request line. At 50 lemmas that was ~1 KB. At 500 it is ~13 KB
raw and **~19 KB URL-encoded**, past the request-line limit of a typical
gateway, which answers `414` before Postgres is ever reached. The page renders
the error surface instead of the learner's history.

Nothing in the gate could see it. Every test around that function stubs the
Supabase client, so the request that would have been too long is never built,
let alone sent — the tests prove the adapter's *logic*, and the defect is in
its *shape*. The pure-function tests below it are even further away.

The fix is batching (100 ids), plus a re-sort across batches, since each batch
is ordered but their concatenation is not and `rebuild` replays in order.

**The general form: a data file's size is an input to every query that spans
it.** When a `data/` file grows, grep for the call sites that pass all of it
somewhere — `.in(`, `IN (`, a URL, a request body, a `Promise.all` over rows —
and check the resulting request against a real limit, by hand. "It is only
data" is what makes this one invisible.

## A concise `beforeEach` registered the mock as its own teardown

```ts
beforeEach(() => vi.mocked(listReviewsForTaskIds).mockClear());
```

A test whose mock threw, whose code caught it, and whose every assertion
passed, failed with the thrown error. Adding braces fixed it.

`mockClear()` returns the mock, so the arrow returns it too — and **vitest
treats a function returned from a hook as that hook's teardown callback**. So
after every test vitest called the mock again, outside any try/catch, and a
mock implemented to throw threw into the runner. The test's own output was
completely healthy: the code under test returned its error outcome, the log
line was correct, `expect` never complained.

An hour went into the code under test before the hook was suspected, and none
of it was wrong. The tell was that the same test passed in a scratch file with
no `beforeEach`, and failed as soon as one was added — *any* one, `mockReset`
or `mockClear`.

Give a hook a block body whenever its last expression is not obviously
`undefined`. `() => x.mockClear()`, `() => cleanup()`, `() => setup()` — all
return something, and one of them will eventually return a function.

## `container.textContent` welds siblings together and kills `\b` in your regex

An acceptance test asserted that the review session shows no due count:
`expect(container.textContent).not.toMatch(/\bdue\b|\bbacklog\b/i)`. It passed.
It also passed with `due` deliberately added to the progress copy — the word was
on screen and the assertion did not see it.

`textContent` concatenates descendants with **no separator**, so the progress
paragraph and the card front below it read `"1 of 2 duede"`. There is no word
boundary between `due` and `de`, so `\bdue\b` never matched. The regex was
right, the DOM was right, and the join between them was lossy.

Assert on the leaves, joined with a separator you choose:

```ts
Array.from(container.querySelectorAll("*"))
  .filter((element) => element.children.length === 0)
  .map((element) => element.textContent?.trim() ?? "")
  .filter(Boolean)
  .join(" | ");
```

The general form: any "this text is absent" assertion must be shown failing with
the text present. This one is worse than an ordinary untested assertion, because
`textContent` makes the *sound* case — checking the whole subtree at once — the
one that silently stops working.

## A phase in the map that no render can ever observe

`advancing` sits in the review session's transition map, has a row in the spec's
phase-effects table saying what it looks like on screen, and is never rendered.
`useReviewSession` moves through it inside a single `setPhase` updater —
`nextPhase(nextPhase(current, "advancing"), "prompting")` — so only the final
value is ever stored, and React never renders the middle one.

That is the right implementation: the double call is what keeps the code honest
about the map instead of jumping `revealed → prompting` directly. What was wrong
was the spec describing an appearance for a phase that has none.

A waypoint in a transition map is not automatically a rendered state. When a
phase exists only to make an edge legal, the spec has to say so — otherwise the
next author writes UI for it, and no test can ever reach that UI.

## `readFileSync` from `data/` works locally and 500s on Vercel without a trace include

The method menu and language status pages read `data/methods/` and
`data/languages/` at request time via `readFileSync(process.cwd(), …)`. Local
`npm run dev` and `npm run build` both see the repo root, so the catalogue loads.
Vercel's serverless bundle only ships files the NFT tracer can follow — and it
does not follow dynamic paths into `data/`.

The symptom is exactly `Could not load the method catalogue` with a reference id
and **no** file names in the UI (developer detail is in the function log). It
looks like bad JSON; it is a missing directory inside the lambda.

The check: after `npm run build`, grep `.next/server` for a section file — zero
hits means production will fail. The fix is `outputFileTracingIncludes` in
`next.config.ts` for each route that reads disk. Do not switch to importing
every JSON unless you want them in the JS bundle — tracing is the intended fix.

---

## `hover:` cannot be observed in this environment, and it is not your CSS

Every `hover:` utility Tailwind v4 emits is compiled inside a single
`@media (hover: hover)` block. The VM's display has no pointer device Chrome
recognises, so it reports `pointer: none` and `hover: none` — headless **and**
headful, every browser, every component. The rules are in the stylesheet and
never match.

The symptom is that hovering does nothing, anywhere, including on `Button`,
which has had a specced hover state and passing tests since the starter. It
reads as "the hover state I just wrote is broken", and it has now cost two
separate investigations — the first concluded the `accent` → `accent-deep` step
was too subtle to see, which was a reasonable read of a real observation and
completely wrong.

Two tells. `element.matches(":hover")` is **`true`** while
`getComputedStyle(element).backgroundColor` is unchanged — the element is
hovered and the rule is simply not in play. And the failure is *global*: one
broken hover is a bug, every hover in the app failing at once is the
environment.

```js
matchMedia("(hover: hover)").matches   // false here, true on a real machine
```

`Emulation.setEmulatedMedia` does **not** fix it — Chrome ignores the `hover`
feature there, so you cannot emulate your way to a screenshot. **Do not report
hover as verified from this VM, and do not restyle anything to make it show up
in a recording.** Assert the class is present (a unit test can do that) and
leave the visual confirmation to a human on a real pointer.

## A layout's `redirect()` does not stop the page under it from rendering

`app/(app)/layout.tsx` awaited an account and redirected signed-out visitors to
`/login`. Nine tests passed, including one asserting the redirect. In the
production build, `curl /methods` signed out returned **`307`, and 124 kB of
body** — the entire rendered method menu, in the flight payload of the redirect
response. A layout and the page beneath it render concurrently; the redirect
wins the *status*, not the race.

It gets worse with a `loading.tsx` anywhere above. That flushes the shell
immediately, so by the time the redirect resolves the response has already
started, and Next downgrades it to a **`200`** carrying a client-side redirect
instruction. The route "works" in a browser and is wide open to anything that
does not run JavaScript.

Neither failure is visible to jsdom, because nothing in jsdom renders a route.
The unit test asserting `redirect("/login")` was true and useless.

**Put an auth gate in `middleware.ts`, which runs before rendering starts.**
Keep the layout gate as well — it is the backstop if a matcher stops covering a
route — but do not mistake it for the boundary. The check that catches this is
`curl -D -` against `npm run start`, comparing the **body size**, not the
status: a real redirect is a few bytes.

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

## `npm run verify` destroys a running dev server, and it looks like a CSS bug

**Resolved 2026-08-09 — but read it anyway, because the symptom is the lesson.**
`verify` now builds into `.next-verify` (`scripts/verify.mjs`, via `distDir` in
`next.config.ts`), so the gate can no longer touch a dev server's output. Two
consequences: `npm run build` on its own still writes `.next` and still breaks a
running dev server, and a green `verify` no longer refreshes what `npm run start`
serves — the entry above is now strictly necessary, not merely advisable.

The trap above says to rebuild before screenshotting. Do that while `npm run dev`
is running and you get this one, because both wrote to the same `.next`: the
build replaced the manifests the dev server was still serving from, and
`/_next/static/css/app/layout.css` started returning the string `Not Found`.

**What you see is not a 404.** It is an app with no styles — collapsed spacing,
bullet points on styled lists, buttons colliding, `hover:` doing nothing. It
looks exactly like a component you just broke, and the temptation is to go and
"fix" the CSS. It cost a full recording and a round of review before anyone
checked the byte count of the stylesheet: **9 bytes**.

The tell is that `npm run verify` is green while the browser looks broken. A
production build that passes cannot coexist with globally missing CSS. When
those two disagree, suspect the server, not the source.

Fix: stop the dev server (by PID, never by name), `rm -rf .next`, restart it,
and hard-reload the browser.

**The general form is worth more than the fix.** A gate that can invalidate the
thing you are about to inspect will eventually be blamed on the source, because
the source is what you were already looking at. Where the choice exists, give
the gate its own output rather than a rule that people have to remember.

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
