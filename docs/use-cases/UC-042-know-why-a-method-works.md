# UC-042 — Know why a method is supposed to work

<!-- id: UC-042 -->
<!-- specs: SPEC-page-method-detail, SPEC-component-method-badge, SPEC-component-skill-tier-badge, SPEC-service-skill-tier, SPEC-service-method-session-viability, SPEC-service-method-session-budget -->

**Who:** anyone being asked to spend fifteen minutes on an exercise they did not
choose to invent.
**Wants to:** read what the method does, why it is thought to work, and how sure
anyone actually is.
**So that:** they can decide to do it for their own reasons instead of because
an app told them to.

Derived from [`../study/12-method-cards.md`](../study/12-method-cards.md),
"Die Infoseite je Methode".

## Today

Apps present exercises without justification. The learner is left to trust the
brand, and their prior beliefs about learning are usually wrong — the
learning-styles myth is believed by over 90 % of teachers, let alone learners.
So they optimise for what feels productive, which is reliably not what works.

## Success looks like

- Every method has a page reachable from its card, before deciding and after
  finishing.
- For **exercise-runner** methods this page is also the **pre-start overview**:
  material setup (when declared), **session contract** (budget, volume, feedback
  mode — [`method-session-viability.md`](../specs/service/method-session-viability.md)),
  and **Start** live here; the catalogue card does not open `/practice` directly
  (card engine excepted).
- It states the **mechanism** in plain language — not "helps your listening" but
  why it does, and what would be different if it worked.
- It states **how confident anyone is**, using a plain label on the **card**
  (e.g. "Thin evidence") and a **collapsed disclosure** on the detail Practical
  panel with plain prose — not in the detail badge band, and no "Evidence C"
  letter-grade prefix in the UI.
- It states **what skills the method mainly serves**, with contribution level
  per skill — Lucide marks on the **card**; tier shield icons (bronze+) on
  detail. No duplicate "Mainly …" prose when tiers already show the fact.
- It states **how demanding it is to perform** (intensity), as a plain effort
  label on the card and detail badge band, plus one anchor sentence in the
  detail **Practical** section — **never** a three-dot scale (study/27, study/34).
- It states **what the method does not do**. This section is mandatory; a page
  without it is an advertisement. On the card it appears as clamped prose below
  the chips; on detail it uses a callout surface.
- The detail page shows the **full method name** as an in-page hero even when the
  shell title truncates on narrow viewports, and reads as an **article** — not a
  second card with a badge row.
- It lists **variants** — shorter, harder, on paper, with other people, away from
  the screen.
- Where a claim rests on the product's own measurements rather than research,
  that is said, with the amount of data behind it.
- Nothing on the page is phrased to persuade. If the evidence is thin, the page
  says the evidence is thin.

## Out of scope

Citations and a bibliography in the interface, comparing methods against each
other by score, and any claim about how fast the learner will progress.
