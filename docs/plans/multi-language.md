# Plan — the learning language as a first-class choice

**Status: executed.** ⚠ **Corrected 2026-08-12** — this line used to say "not
started," "no spec is written yet," and the table below it used to say
language choice was "Nowhere." All of that was true when this file was
written (2026-08-11) and stayed here, unedited, well after the plan below was
actually built — the same staleness pattern
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md)'s diary entries name
twice on 2026-08-12. What follows below this notice is now a **historical
design record**: the reasoning that produced the shipped shape, kept for the
"why," not the "what's left." For current status, read
[`UC-025`](../use-cases/UC-025-learn-multiple-languages.md),
[`specs/service/learning-languages.md`](../specs/service/learning-languages.md),
[`specs/page/profile.md`](../specs/page/profile.md) and
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md)'s `T-B12` row — those are
the source of truth now, not this file.

Anchor use case: [`UC-025`](../use-cases/UC-025-learn-multiple-languages.md),
now specced (`SPEC-service-learning-languages`, `SPEC-page-language-picker`).

---

## Why this exists

The owner expected a Duolingo-shaped structure — sign in, see your courses, pick
one — and was surprised it does not exist. That expectation came from somewhere
real: `/languages` shows Spanish and Italian side by side with a quality column,
and reads exactly like a course picker. It is a transparency page about **data
quality**, it sits in the public half, and it is wired to nothing.

That is a UX defect independent of everything below: a page that looks like a
control and is not one.

## What existed 2026-08-11 (superseded — kept for contrast with "what shipped" below)

| | Reality on `main`, 2026-08-11 |
| --- | --- |
| Navigation | Three destinations: Methods · Words · Progress ([ADR-0009](../adr/0009-three-destinations.md)) |
| Account surface | `/account` exists, **is not in the navigation**, holds only export + delete |
| Language choice | **Nowhere.** No account field, no column, no screen, no switcher |
| Which language is learned | Hard-wired: `loadSpanishMeaningRecallDeck()`, three call sites |
| Mobile navigation | Floating pill + corner chips, not a tab bar |
| After sign-in you land on | `/methods` |

## What shipped instead — current reality, corrected 2026-08-12

| | Reality on `main`, today |
| --- | --- |
| Navigation | Same three destinations; `/account` now **redirects** to `/profile` (kept for bookmarks) |
| Account surface | `/profile` — language management (`ProfileLanguages`), export, delete, sign-out. Reached via the top-right corner chip, as decided 2026-08-11 below |
| Language choice | `learner_language` table, one row per (account, language), one `active` flag; picker at first sign-in; switcher in the shell header ([`app-shell.md`](../specs/feature/app-shell.md) behavior #10) |
| Which language is learned | `poolForActiveLanguage()` (`lib/db/learner-pools.ts`) — every read site takes the active language from the account, not a hardcoded loader |
| Mobile navigation | Still the floating pill + corner chips — plan item 7 (tab bar) was dropped by the 2026-08-11 review, see below |
| After sign-in you land on | `/methods`, or the language picker first if none is chosen yet |

**The one piece of luck:** every stored review already carries its language in
the key — `task_id = "es:el:meaning-recall"`. Progress can therefore be
partitioned per language **without a data migration**. That is the difference
between expensive and very expensive, and it was free.

## What the owner wants

- First sign-in asks **which language do you want to learn**, changeable later.
- Language selection as **large tiles** — label plus a line of text.
- Profile as a destination, containing profile data, the chosen language(s), and
  statistics.
- Three destinations: **Methods · Words · Profile** — so Progress moves into
  Profile and stops being a top-level destination.
- "Add another language" from the profile.

## What UC-025 already decided, and the sketch does not cover

The use case is more demanding than the sketch, and it is already accepted:

- **One combined daily budget**, split across languages — not a full session per
  language. This is the mechanism that stops the new language crowding out the
  old one, which is the whole point of the use case.
- **Maintenance mode** per language: enough review to hold, no new material.
- **Switching is one action.** A switcher that lives only in the profile is three
  taps and fails this outright.
- **Spanish/Italian confusions are their own diagnosable error type**, not
  ordinary failures — relevant for exactly this language pair.
- Notifications combined, never one per language.

## The terminology problem: there is no course

Duolingo's course is a **path** — units in order, a percentage through it. This
product has a frequency-ranked pool and a catalogue of 53 methods. There is no
ordering, no lesson index, no "you are at unit 7", and therefore no percentage.

A tile can honestly show `347 of 500 lemmas held stably` or `not started`. It
can never show `23% of the course`, because that number does not exist and
inventing one would be [thesis 1](../study/STUDY-001-duolingo.md) inverted — activity
dressed as competence.

Recommendation: build the structure exactly as sketched, but call it **language**,
not **course**. [`GLOSSARY.md`](../GLOSSARY.md) governs terms, already defines
**Language profile**, and a new term promising a curriculum we do not have is
the kind of drift the glossary exists to prevent.

---

## What the science says about establishing a level

Asked directly, and the answer is already in [`study/03`](../study/STUDY-003-level-model.md).
Recorded here because it decides what a tile may display.

**The CEFR is a competence description, not a measuring instrument.** Chapter 03
names three defects for an app: too coarse (A2→B1 is months), too
one-dimensional (learners have a profile, not a level), and not self-measurable
("can speak in simple connected sentences" cannot be derived from click data).

**So level is never measured directly — it is derived from measured signals.**
Three layers, and only the bottom one is measured:

```
Layer 3   Overall level      ← second-lowest of the skills that count
Layer 2   Skill levels       ← reading · listening · speaking · writing
Layer 1   Signals            ← the only thing actually recorded
```

Seven layer-1 signals: vocabulary size · form mastery · recall stability ·
lexical coverage · response time on correct recall · success by task difficulty ·
production quality. **We measure two of them** — vocabulary size (pool-local) and
recall stability. That is why every skill reads *not measured*, and it is honest
rather than unfinished.

**The owner's instinct — "it is not about lemmas" — is the study's own
position, twice over.** Chapter 03 says *Lemma ≠ word form*: knowing *go* does
not mean knowing *went*, so **form mastery is its own signal** and explicitly not
part of vocabulary size. The failure it prevents is someone who holds 2,000
lemmas, cannot conjugate, reads fine, does not speak — and is shown B1 across the
board. The glossary carries the same rule from the other side: vocabulary is not
a skill; the four skills are.

Vocabulary size is load-bearing anyway, for a narrower reason: it is the one
competence quantity that is **cheap and reasonably valid to estimate**, and it
bridges SRS data to level through frequency rank. Hold ranks 1–1,200 stably and
almost nothing past 2,000, and the boundary lies between — an adaptive test
distributed across ordinary use. The chapter is explicit about not rebuilding
LexTALE and preferring IRT-style adaptive testing.

**Two limits that block the level display today**, both recorded already:

1. The vocabulary→level anchor table is graded **[C]** — inconsistent across the
   literature, differs per language, "a calibration starting point, not truth".
2. Extrapolation needs a pool large enough to estimate a boundary rank. At 500
   lemmas it is not.

And the honesty rules that any tile inherits: the level **may fall**; uncertainty
is shown; every number opens to its derivation; calibration changes are dated and
visible.

**Cold start**, still open in the study: an optional five-minute adaptive test,
offered *after* the first exercise and never before. Skipping it starts at A1.1
with a wide band. This is the closest thing to "what does science say about
determining a level quickly", and the study's answer is that it is a starting
prior, not a measurement.

---

## What has to change, smallest first — corrected 2026-08-12, all but two done

| # | Change | Size | Notes |
| --- | --- | --- | --- |
| 1 | ~~`/account` → Profile, and into the navigation~~ | S | **Done.** `/account` redirects; `/profile` reached from the corner chip, not a nav destination — see "Decided 2026-08-11" below |
| 2 | ~~Deck loading takes a language instead of `loadSpanishMeaningRecallDeck()`~~ | S | **Done** via `poolForActiveLanguage()` |
| 3 | ~~`/languages` stops looking like a picker, or becomes one~~ | S | **Done** — `/languages` stayed the data-quality page; the real picker is a separate route, `/languages/choose` |
| 4 | ~~Language choice as data — account column, default at signup, switcher~~ | **M, Sensitive** | **Done** — `learner_language` table, `learning-languages.md` |
| 5 | ~~Picker screen with tiles, and the post-signup "no language yet" state~~ | M | **Done** — `/languages/choose`, [`language-picker.md`](../specs/page/language-picker.md) |
| 6 | ~~Progress, standing and Words filtered per language~~ | M | **Done** via `poolForActiveLanguage()`, free of migration as predicted |
| 7 | ~~Tab bar instead of the floating pill~~ | M | **Dropped** by the 2026-08-11 review (item below) — the pill stays |
| 8 | Progress moves into Profile as the third destination | **M, ADR** | **Rejected 2026-08-12** — Progress stays a top-level destination per ADR-0009 and owner decision 2026-08-11; see `IMPLEMENTATION-PLAN.md` decision 16 |
| 9 | ~~Combined daily budget across languages~~ | — | **Withdrawn 2026-08-12** — rejected outright, see below, nothing to build |
| 10 | Maintenance mode per language | L | **Still open** — no per-language maintenance flag exists yet |
| 11 | ~~Italian pool~~ | L | **Shipped 2026-08-12** — see [`starter-deck.second-language.md`](../specs/service/starter-deck.second-language.md) |

## Specs this will touch

`page/language-status.md` · `feature/app-shell.md` · `feature/mobile-nav-v2.md` ·
`page/progress.md` · `page/method-menu.md` · `feature/words-home.md` ·
`feature/account-data.md` · `service/auth.md` · `service/starter-deck.md` ·
`service/session-builder.md` — plus a new page spec for the picker and one for
Profile, and `GLOSSARY.md` for whatever the chosen term turns out to be.

New ADR required: the route model changes (ADR-0009 and ADR-0010 both speak to
it), and "one active language or several" is a decision neither records.

---

## Reviewed 2026-08-11 — an SLA researcher and a UX designer, with literature

Two reviews were commissioned before asking the owner anything. Both read the
repo's own study base first and were briefed to disagree with it. What follows is
what they settled, what they changed, and what they refused to answer.

### Settled: several languages at once, not one

Both arrive there from different directions, so this stops being an open
question.

The researcher found **no basis for a ban.** The interference mechanism is not
typological proximity — it is **two labels on one concept** (Isurin & McDonald
2001; Mickan et al. 2020–24, where the reaction-time cost was still present a
week later). Spanish and Italian being close is not itself the risk. That makes
it a **scheduling** problem rather than a product-shape problem: a card whose
German prompt is answered in Spanish on Monday and Italian on Tuesday reproduces
the lab paradigm exactly. Cheap to avoid here, because `task_id` already carries
the language — treat "same L1 concept, two target languages" as a session-builder
constraint. And the first-order cost of splitting a budget is **arithmetic**,
roughly double the calendar time, an order of magnitude larger than the
interference effect.

**Maintenance mode is the best-evidenced item in this entire plan.** Cepeda et al.
2008 (n > 1,350): the optimal gap is 10–20% of the retention interval, so review
every 3–5 weeks holds material for a year. Bahrick et al. 1993 points the same
way (13 sessions at 56 days ≈ 26 at 14 days), though n = 4.

The designer reached the same answer from the market: **no mainstream app ships
one-at-a-time.** Duolingo, Babbel, Busuu, Memrise and LingQ all keep parallel
progress with a cheap switch. Anki is the closest thing to UC-025's combined
budget and gets there by having no language concept at all — one queue, one daily
limit — and its known failure mode is precisely UC-025's premise.

**The distinction that has to survive into the code:**

- **Learning language** — a language this Account is learning. Several possible.
  Owns its reviews, its vocabulary reading, its calibration, its maintenance flag.
- **Active language** — the one in focus in the UI. Exactly one. Affects **what is
  displayed and nothing else.**

⚠ If `activeLanguage` ever reaches the session builder as a filter, UC-025's
crowding-out protection is gone. That belongs in `session-builder.md` as a
**negative** acceptance criterion, because it is the most natural wrong thing to
build.

**Superseded 2026-08-12, see below — this is now backwards.** The combined
budget this paragraph protects was rejected; `activeLanguage` reaching the
session builder is now the *required* behavior, not the thing to prevent.

### Settled: "language", never "course"

Independent agreement, and the designer added the argument that settles it:
Duolingo itself **moved away from course-completion framing toward its Score**,
because "% of course" conflates *how much of our content you touched* with *what
you can do*. That is this repo's thesis 1, rediscovered by the company that
created the problem. Apps without a path do not say course — Anki says deck,
LingQ says language and counts known words.

`GLOSSARY.md` already disowns the word twice (`Language profile` — *not a
course*; `Series` — *not a course, a unit*). Adding **Learning language** and
**Active language** there is a precondition for any spec below.

### Changed by review: three findings that alter this plan

**1. Do not build the picker yet.** With one real pool, a selection screen with
one option repeats the `/languages` defect at higher cost — a screen that looks
like a choice and is not one. Introduce the language as **data** first (account
column, default `es`, a visible language chip), and build the picker when a second
pool exists.

**2. Tile copy fails on jargon, not on honesty.** "Lemma" has no user-facing form
in `GLOSSARY.md` and must not acquire one; a bare "of 500" reads as a finish
line. Working copy: `347 of 500 starter words held stably`, plus a one-time
definition — *"Held stably means you'd still recall it in a week or more without
seeing it again."* **No bar, no meter, no ring** — a progress bar promises a
denominator that is a goal, and refusing it here is the same refusal as refusing
the streak. Write it as a negative AC. No tile at all for a language with no pool.

**3. Plan item 7 (tab bar instead of the floating pill) should be dropped.**
iOS 26's Liquid Glass tab bar is itself an inset floating capsule that minimises
on scroll. The existing pill is closer to the current platform default than a
full-width bar would be — an M-sized change to become less current.

### Two defects the review found in the repo's own evidence base

Both belong to `study/03` and neither is caused by this plan:

- **The anchor table mixes three counting units** — word families, X-Lex lemmas,
  and pool-local lemmas — in one column. That breaches `study/18`'s own U1 rule
  that the counting unit is declared per language and not silently swapped. The
  table is already graded **[C]**; this makes it worse than [C] implies.
- **"Second-lowest counting skill" is non-smooth.** With noisy inputs the overall
  level will jump for measurement reasons, and the app then has to explain a
  change the learner did not cause.

### One place UC-025 overclaims

Its Spanish/Italian confusion clause is **half supported**. The error class is
real, and the closest research line (Polish/English/Italian, *System* 2025) is
nearly this app's configuration. But the errors land in **word stems, not
suffixes** — so `study/03`'s cell-based form-mastery signal *cannot detect the
error type UC-025 asks it to diagnose*. And the two closest intervention studies
returned **null** (Otwinowska et al. 2020, *Language Learning*; *Lingua* 2025,
specifically for L2–L3 pairs). The single positive result (2022, n = 114) worked
only when the contrast was presented **in the target language**, not via L1 —
which rules out the obvious "German prompt, both answers" implementation.

UC-025 should be corrected rather than implemented as written.

### And one contradiction nobody can resolve

`study/02` E6 commits to interleaving (Pan et al., d ≈ 0.67). The interference
literature predicts the opposite outcome from the same manipulation. **Nobody
knows which way it falls for Spanish and Italian specifically**, and neither
review would guess.

### On establishing a level, which was the owner's question

"Do not rebuild LexTALE" is right, and the 2023 replication (Puig-Mayenco et al.,
n = 288 + 266) is more damning than `study/03` states. The number that kills the
yes/no format: Stubbe 2012 found an individual's false-alarm rate correlates only
**r = .36** with that individual's actual overestimation — so the correction
belongs in the error bar, not in the point estimate.

**Nothing in the literature estimates a CEFR level from clickstream or SRS data
alone with published error bars.** The app's refusal to show a level is therefore
not conservatism; it is the state of the art.

One recommendation **against** the current plan: a **C-test or elicited-imitation
task** predicts global proficiency about as well as vocabulary testing
(r ≈ .66–.69) and reaches **production**, where this app has no layer-1 data at
all. Worth weighing against the planned five-minute adaptive vocabulary test
before that gets built.

---

## Decided by the owner, 2026-08-11

**Navigation — the designer's recommendation, unchanged.** Three destinations stay
at the bottom: Methods · Words · Progress. **Profile is the top-right corner
chip**, replacing today's sign-out float, with sign-out moving inside it. **The
language switcher is the top-left chip**, which `shellBackTarget()` leaves empty
on destination roots. No ADR is superseded — ADR-0009's three destinations
survive verbatim, and profile-as-a-corner-affordance is what ADR-0009 itself
described.

The owner raised in passing whether Progress is needed as a destination at all.
Not acted on: both reviews argue for keeping it, and it is the product's own
argument. Recorded here so it is a separate decision later rather than a side
effect of this one.

**Picker — build it now, with both languages**, against the review's advice to
defer. The owner's call, and it is defensible: the structure becomes visible
earlier. Executed honestly rather than literally — at the time, Spanish was
selectable and Italian rendered as **not available yet** with the reason,
because there was no Italian pool and a selectable tile would have led
nowhere. **Superseded 2026-08-12:** Italian shipped at the same tier as
Spanish (see [`starter-deck.second-language.md`](../specs/service/starter-deck.second-language.md)),
so both languages are now selectable tiles.

## Decided by the owner, 2026-08-12 — the combined budget is rejected

**Overrides the 2026-08-11 review's recommendation above, in full.** That
review argued for combining the daily budget across languages from real
evidence — the arithmetic cost of not combining it, and Anki's own
crowding-out failure mode as the nearest analog. The owner's answer is not that
the evidence was wrong; it is that the model itself is wrong for this product.
Two learning languages are not one system sharing a resource — they are two
separate things a learner can each be doing, the same way switching between two
courses on another platform puts you fully in one and not partly in both.
**Nothing about them mixes.** Consequences, all now settled rather than open:

- **No combined daily budget, ever.** Adding a second language does cost more
  of the learner's time — accepted, not managed by the app.
- **A review session belongs to exactly one language, always.** Cards from two
  learning languages never share a queue or a schedule. `session-builder.md`
  and `learning-languages.md` are corrected to match; **fixed 2026-08-12**
  (`T-B12`, [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md)) —
  `poolForScheduling` (`lib/db/learner-pools.ts`), which used to concatenate
  every learning language's cards into one pool before scheduling, is merged
  into the single `poolForActiveLanguage` that every surface now uses.
- **The Spanish/Italian confusion-as-diagnosable-error-type clause is dropped**,
  not deferred — it depended on the two languages' scheduling being aware of
  each other at all, which no longer happens. (It was already flagged above as
  only half-supported by the literature the review checked; this closes that
  question by removing the premise rather than by resolving the evidence.)
- Plan item 9 in the table above ("Combined daily budget across languages")
  is withdrawn. Nothing replaces it — there is no cross-language mechanism to
  build here at all.

What survives from the 2026-08-11 review untouched: per-language isolation of
levels/vocabulary/calibration, maintenance mode as a per-language flag, and
switching being one action from the profile that preserves the other
language's progress exactly where it was.

## Still open — tracked in IMPLEMENTATION-PLAN.md, not here

**Moved 2026-08-12.** `AGENTS.md` is explicit that there is exactly one backlog
file. Open items are now `IMPLEMENTATION-PLAN.md` decision 16 (answered:
**Progress stays a destination**) and task `T-B15` (maintenance mode).

- Cold start (the adaptive vocabulary test vs. the researcher's C-test /
  elicited-imitation alternative) — not blocking, nothing built yet, and not
  worth its own plan-file tracking entry: revisit when F17–F22 resume.
- The `study/03` defects recorded above (anchor-table counting units,
  non-smooth "second-lowest" level) — belong to `study/03` itself, not this
  plan; not caused by anything here. (The UC-025 overclaim is no longer
  open — see 2026-08-12 above: dropped, not resolved.)
