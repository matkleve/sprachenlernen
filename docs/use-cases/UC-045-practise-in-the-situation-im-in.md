# UC-045 — Find a way to practise that fits right now

<!-- id: UC-045 -->
<!-- specs: SPEC-page-method-menu, SPEC-service-time-scale, SPEC-component-chip, SPEC-component-method-badge, SPEC-component-method-card-header -->

**Who:** someone with a specific window — ten minutes on the sofa, half an hour
before bed, a tired commute.
**Wants to:** see only methods that fit how much time and energy they have, and
what they want to train.
**So that:** they pick something they will actually do instead of browsing sixty
cards.

Derived from
[`../study/21-method-catalogue-and-context.md`](../study/21-method-catalogue-and-context.md)
and [`../study/12-method-cards.md`](../study/12-method-cards.md).

## Today

The menu shows everything, or it shows presets like "kitchen" that learners do
not recognise as their situation. Too many dimensions at once; people give up
and tap the first thing. Filter chips that reload the page and jump scroll back
to the top make browsing worse, not better.

## Success looks like

- **Three questions first:** how much time (stepped slider — short steps at the
  start, up to one day, then **Endless** for an open window), what skill to train,
  how much energy — these narrow most of the catalogue.
- **Filters feel instant:** tapping skill, energy, or refine updates the list
  in place — no full reload, no scroll jump. Only choosing a method navigates away.
- **Refine only when needed:** hands-free, silent, eyes elsewhere — not eight
  dimensions on the front door.
- Each card shows **at a glance**: which skills it mainly serves (contribution
  level), a plain **evidence label** (e.g. "Thin evidence"), and a plain **effort
  label** (e.g. "Light effort") — before the learner opens the detail page.
- Logistics chips show **duration** (one range chip), **hosted/off-app**, and
  **all** requirement values from the catalogue — owner chose display all over
  capping (study/34).
- Each card shows a **section header graphic** (one abstract image per catalogue
  section) so browsing sixty entries has visual rhythm without ranking methods.
- Methods that do not fit are **absent**, not greyed out.
- Physical constraints are **stated by the learner**, never inferred.
- Hosted methods open in one tap; off-app methods show honest detail.

## Out of scope

"Where are you" presets (desk, kitchen, transit); saving named situations;
detecting context automatically.

## Revised 2026-08-09

Owner feedback: context presets were unclear. Replaced with time + skill +
energy as primary filters; study/21's full context model moves to optional refine.

**Time scale (UX, 2026-08-09):** linear 2–60 minutes made short windows fiddly
and long afternoons impossible. The slider now steps slowly through the first
quarter-hour, ramps through hours, peaks at **one day**, and ends at **Endless**
(no time ceiling on the catalogue).

**Instant filters (UX, 2026-08-10):** filter chips must not navigate. The
catalogue is static JSON already loaded; filtering is client-side with URL sync
only (`docs/ARCHITECTURE.md`).

**Card graphics (UX, 2026-08-15):** section header graphic on every card;
uniform border — no accent left stripe (clashed with corner radius).
