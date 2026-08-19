# UC-045 — Find a way to practise that fits right now

<!-- id: UC-045 -->
<!-- specs: SPEC-page-method-menu, SPEC-service-time-scale, SPEC-service-method-session-budget, SPEC-component-chip, SPEC-component-method-badge, SPEC-component-method-card, SPEC-component-method-card-header, SPEC-feature-listening-defer -->

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
  how much energy — these narrow most of the catalogue. The chosen minutes are
  also the default **session budget** when they Start a method from this browse
  context ([`method-session-budget.md`](../specs/service/method-session-budget.md)).
- **Filters feel instant:** tapping skill, energy, or refine updates the list
  in place — no full reload, no scroll jump. Only choosing a method navigates away.
- **Refine only when needed:** hands-free, silent, eyes elsewhere — not eight
  dimensions on the front door.
- Each card shows **at a glance**: which skills it mainly serves (contribution
  level), a plain **evidence label** (e.g. "Thin evidence"), and a plain **effort
  label** (e.g. "Light effort") — before the learner opens the detail page.
- Logistics chips show **duration** (one range chip) and **all** requirement
  values — not hosted/off-app on cards (requirements suffice).
- Each card shows a **destination marker** — **Start** when the method is runnable
  (card engine or exercise runner), **Info** when tap opens detail only.
- **Card engine** (`srs-session`): **Start** opens the review session in one tap.
- **Exercise runner** methods: **Start** opens the **method overview** (detail
  page) — settings and a **Start** control there launch `/practice`, not the
  runner directly from the catalogue card.
- Each card shows a **section header graphic** (one abstract image per catalogue
  section) so browsing sixty entries has visual rhythm without ranking methods.
- Methods that do not fit are **absent**, not greyed out.
- **Can't listen now** (UC-077) is **deferred** until mixed-stack sessions ship —
  not on the method menu (owner 2026-08-18); see [`../IDEAS.md`](../IDEAS.md).
- Physical constraints are **stated by the learner**, never inferred.
- Runnable methods show **Start** on the card; only the card engine skips the
  overview. Others open honest **method overview** first (UC-042), then Start
  on that page. Non-runnable cards show **Info** and open detail without Start.

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
