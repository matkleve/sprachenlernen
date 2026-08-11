# Plan — the learning language as a first-class choice

**Status:** not started. This is the record of a design conversation, not a
contract — no spec is written yet, and two decisions below are still the owner's.
**Change class:** Sensitive (persisted, auth-adjacent, changes the route model).

Anchor use case: [`UC-025`](../use-cases/UC-025-learn-a-second-language.md),
written and accepted, with **no specs attached to it** to this day.

---

## Why this exists

The owner expected a Duolingo-shaped structure — sign in, see your courses, pick
one — and was surprised it does not exist. That expectation came from somewhere
real: `/languages` shows Spanish and Italian side by side with a quality column,
and reads exactly like a course picker. It is a transparency page about **data
quality**, it sits in the public half, and it is wired to nothing.

That is a UX defect independent of everything below: a page that looks like a
control and is not one.

## What exists today

| | Reality on `main` |
| --- | --- |
| Navigation | Three destinations: Methods · Words · Progress ([ADR-0009](../adr/0009-three-destinations.md)) |
| Account surface | `/account` exists, **is not in the navigation**, holds only export + delete |
| Language choice | **Nowhere.** No account field, no column, no screen, no switcher |
| Which language is learned | Hard-wired: `loadSpanishMeaningRecallDeck()`, three call sites |
| Mobile navigation | Floating pill + corner chips, not a tab bar |
| After sign-in you land on | `/methods` |

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
inventing one would be [thesis 1](../study/01-duolingo.md) inverted — activity
dressed as competence.

Recommendation: build the structure exactly as sketched, but call it **language**,
not **course**. [`GLOSSARY.md`](../GLOSSARY.md) governs terms, already defines
**Language profile**, and a new term promising a curriculum we do not have is
the kind of drift the glossary exists to prevent.

---

## What the science says about establishing a level

Asked directly, and the answer is already in [`study/03`](../study/03-level-model.md).
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

## What has to change, smallest first

| # | Change | Size | Notes |
| --- | --- | --- | --- |
| 1 | `/account` → Profile, and into the navigation | S | |
| 2 | Deck loading takes a language instead of `loadSpanishMeaningRecallDeck()` | S | mechanical |
| 3 | `/languages` stops looking like a picker, or becomes one | S | the defect that started this |
| 4 | Language choice as data — account column, default at signup, switcher | **M, Sensitive** | spec + red-test-first + fresh review |
| 5 | Picker screen with tiles, and the post-signup "no language yet" state | M | today you land on `/methods`, which would be empty |
| 6 | Progress, standing and Words filtered per language | M | free of migration thanks to the `es:` key prefix |
| 7 | Tab bar instead of the floating pill | M | breaks `mobile-nav-v2.md`; needs a spec change, not a quiet edit |
| 8 | Progress moves into Profile as the third destination | **M, ADR** | supersedes [ADR-0009](../adr/0009-three-destinations.md) |
| 9 | Combined daily budget across languages | L | UC-025's core mechanism |
| 10 | Maintenance mode per language | L | |
| 11 | Italian pool | L | separately blocked — see [`starter-deck.second-language.md`](../specs/service/starter-deck.second-language.md) |

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
earlier. Executed honestly rather than literally — Spanish is selectable, Italian
renders as **not available yet** with the reason, because there is no Italian pool
and a selectable tile would lead nowhere. Italian becoming selectable depends on
[`starter-deck.second-language.md`](../specs/service/starter-deck.second-language.md).

## Still open

- **Whether Progress remains a destination** (raised, not decided — see above).
- **Cold start**: the planned five-minute adaptive vocabulary test versus the
  C-test / elicited-imitation alternative the researcher recommends, which
  reaches production. Not blocking; nothing is built yet.
- The `study/03` defects and the UC-025 overclaim recorded above.
