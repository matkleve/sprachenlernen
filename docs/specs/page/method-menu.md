# Methods — the catalogue, filtered by context

<!-- id: SPEC-page-method-menu -->
<!-- use-case: UC-045 -->
<!-- status: active -->

The app's front door at `/methods` ([ADR-0010](../../adr/0010-the-route-model.md)):
say where you are, and see only the ways of practising you can actually do
there — each with what it trains, how good the evidence is, and what it does
not do. Serves [UC-045](../../use-cases/UC-045-practise-in-the-situation-im-in.md),
and [UC-046](../../use-cases/UC-046-discover-a-method-i-never-tried.md)'s
"the full catalogue is browsable" through its unfiltered state.

**This is not the Daily menu.** `docs/GLOSSARY.md` reserves that term for the
three Methods offered today, composed from budget, floors, effect and
preference. Two of those three keys do not exist yet — see § Open questions.
What ships here is the layer underneath it, and the one UC-045 actually asks
for: a hard context filter over the whole catalogue.

## Scope

- **In:** the seven shipped Context presets as one-tap choices; the Methods that
  can be performed in the chosen one; the whole catalogue when none is chosen; a
  Method card carrying name, subtitle, intensity, durations, requirements, what
  it trains, its evidence grade, whether the app hosts it, and what it does not
  do; the state where nothing fits.
- **Out:** the Daily menu's three cards and its composition rules; "current
  standing" and the demonstration sentence; readiness, "last done", the measured
  effect, thumbs and the exploration share — all five need learner data no code
  writes yet; the per-Method info page (UC-042); starting a Method; editable and
  learner-created presets; the skill filter (UC-046's second one — a second
  selection over the same surface, and its own slice); and where Commitments
  live. Each of the undecided ones is named in § Open questions rather than
  guessed.

**Reuse: none needed.** The page is composed from headings, lists and the page
rhythm tokens already in `app/globals.css`; the Method card is markup inside
this feature, not a new primitive, because exactly one surface renders it. It
moves to `components/ui/` when a second one does — `AGENTS.md` § Where things
live.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` with no context chosen | Every Method in the catalogue, grouped by section, and the seven presets to choose from |
| 2 | Taps a preset | Only the Methods performable in it. Everything else is **absent** — never present and greyed out (UC-045) |
| 3 | Reads a card | What it trains, what it needs, how demanding it is, how good the evidence is, and what it does not do |
| 4 | Taps the chosen preset again, or "any situation" | Back to the whole catalogue; no residue of the filtered list |
| 5 | Chooses a context nothing fits | The gap is named — the page says nothing fits and does not pad the list |
| 6 | Opens `/methods?context=` with an id no preset has | The page says the situation was not recognised and shows the whole catalogue. A silent fallback would be indistinguishable from a filter that quietly failed |

## States

**The single source of truth is the `context` search parameter.** Not a
`useState`, not a cookie: the URL. Both surfaces this selection drives — the
list of Methods, and which preset reads as chosen — derive from it in the same
render, so `docs/STATE.md` §6's coherence contract holds structurally rather
than by care. Nothing here is a client state machine (§1): there is no
`useState` anywhere on this page.

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `all` | no `context` parameter | The whole catalogue, grouped by section; no preset marked as chosen | no |
| `filtered` | `context` names a shipped preset | Only performable Methods; that preset marked as chosen | no |
| `nothing-fits` | `context` names a preset, and no Method fits it | The gap is named. No Method list | no |
| `unknown-context` | `context` names no shipped preset | The whole catalogue, plus a line saying the situation was not recognised | no |
| `unavailable` | the catalogue itself fails to load | The reasons, listed by file. No Method list, in any context | no |

None is terminal — every state is one link away from every other. The four
context states are mutually exclusive because each derives from the same one
parameter; `unavailable` outranks all of them, because with no catalogue there
is nothing for a context to filter.

## Data

Reads `data/methods/*.json` through `loadCatalogue`, `loadPresets`,
`filterByContext` and `isMethod` from
[`../service/method-catalogue.md`](../service/method-catalogue.md). Writes
nothing, and reads nothing belonging to a learner — every value on the page is a
property of the shipped catalogue.

**Order is the catalogue's own: sections in their declared order, entries in the
order their file ships them.** This page deliberately does **not** rank. The
ranking rule is context → floor → evidence grade, and with no review history
every floor reads as equally due, so any order beyond the catalogue's would be
invented rather than derived. UC-046 rules out "ranking methods against each
other by a single score"; the honest reading in stage 1 is not to rank at all.

**Commitments are never in this list.** The catalogue guarantees a context
filter returns only Methods, and study 24 puts standing rules off the menu,
which is for sessions.

**Off-app Methods are not demoted.** A Method the app does not host is listed
among the others with the same card and no visual weakening (UC-046); the only
difference is that the card says the app does not run it.

## Accessibility

- The presets are links, so choosing one is a navigation the browser can go back
  through, and the chosen one carries `aria-current`.
- The evidence grade is text, never a colour or a shape alone — the difference
  between an A and a D has to survive being read aloud.
- Each card is a list item under a section heading, so the page is navigable by
  heading and the list length is announced.

## Acceptance criteria

- [ ] Given no context, when the page renders, then every Method the catalogue
      ships appears exactly once, grouped under its section.
- [ ] Given the `kitchen` preset, then only Methods performable there render —
      and specifically, no Method requiring free eyes appears anywhere on the
      page, greyed out or otherwise.
- [ ] Given any preset, then no Commitment appears in the Method list.
- [ ] Given a context is chosen and then cleared, then the whole catalogue
      renders again and **no residue** of the filtered state remains: no preset
      is marked as chosen.
- [ ] Given a chosen preset, then that preset and no other is marked as chosen.
- [ ] Given any rendered Method card, then it states what the Method does not
      do — the mandatory section of study 22, on every card, with no exception.
- [ ] Given any rendered Method card, then its evidence grade is shown as text.
- [ ] Given a Method the app does not host, then it renders as a full card in
      the same list, and the card says the app does not run it.
- [ ] Given a context that no Method fits, then the page names the gap and
      renders no Method list.
- [ ] Given a `context` value naming no shipped preset, then the page says so
      and renders the whole catalogue.
- [ ] Given a catalogue that fails to load, then the page says so and lists the
      reasons — an empty page and a broken one must not look the same.
- [ ] Given any state of this page, then no number describing the learner
      appears — nothing is read about them, so nothing can be claimed.
- [ ] The page component contains no `"use client"` directive at any depth
      reachable from this feature.
- [ ] The rendered surface has no axe-core violations.

## Open questions

**⚠ SPEC GAP: the Daily menu's three cards cannot be composed yet.** Study 12
composes them from context → floor → effect → preference, with one low-intensity
card and one of high measured effect. The effect estimate is F94 and does not
exist; the floor needs a review history, which is T-B2. Until both land, a
"pick three" would be a rule nobody decided wearing the authority of one.

**⚠ SPEC GAP: whether "current standing" and the demonstration sentence belong
on this route in stage 1.** [ADR-0009](../../adr/0009-three-destinations.md)
lists both among what Methods contains; the study schedules F166 and F167 for
stage 2, and ADR-0009 itself creates Progress as the place the level model
lives. Three records can be read three ways, and none of them is wrong.

**⚠ SPEC GAP: where the six Commitments are presented.** Study 24 fixes the
framing — "how do I get more out of this?", and never on the menu, which is for
sessions — and fixes nothing about the surface that carries it.

**⚠ SPEC GAP: naming the nearest thing when nothing fits.** UC-045 asks the page
to name the gap *and* the nearest thing. The gap is named here; "nearest"
requires a distance between contexts that nothing defines. All seven shipped
presets currently yield Methods, so this state is unreachable with today's data
and is implemented from the decided half only.

## Check

`npm test -- method-menu`
