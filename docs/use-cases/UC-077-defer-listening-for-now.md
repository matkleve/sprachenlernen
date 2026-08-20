# UC-077 — Say I can't listen right now

<!-- id: UC-077 -->
<!-- specs: SPEC-feature-listening-defer -->

**Who:** someone on a train, at work, or next to a sleeping child.
**Wants to:** keep practising without audio for a while, without lying about
what they did or getting listening exercises they cannot use.
**So that:** the app fits the moment instead of nagging or scoring them down.

Derived from owner feedback 2026-08-18 and
[`../study/STUDY-027-material-units-and-listening-defer.md`](../study/STUDY-027-material-units-and-listening-defer.md).

## Today

Listening methods stay in the menu or open broken sessions. Learners skip or
abandon. This is not the same as UC-020 (permanent skill profile) — it is a
**short situational defer**.

**2026-08-18 (owner):** method-menu **Ton** row removed — entry point belongs on
**mixed-stack session chrome**, not the catalogue filter. `lib/listening-defer.ts`
and runner `type-only` fallback remain for that build.

## Success looks like

- One tap: **Can't listen now** — listening not offered for **15 minutes**
  (default), with a clear resume time — **in mixed-stack session chrome** (not
  `/methods` refine).
- Sound-requiring **steps** in a mixed stack are skipped or fall back to
  `type-only` while defer is active.
- Open listening exercises fall back to **type-only** gap-fill (same text, no
  audio) when defer is active.
- Defer can be cleared early; nothing is written to the progress model as a
  listening failure.
- Distinct from UC-020: defer does not change overall level or skill profile.

## Out of scope

Permanent hearing exclusion; muting the phone; detecting environment automatically.
