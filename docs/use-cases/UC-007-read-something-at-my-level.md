# UC-007 — Read something I can almost understand

<!-- id: UC-007 -->
<!-- specs: SPEC-service-coverage, SPEC-feature-content-traceability, SPEC-feature-method-material-setup, SPEC-feature-reading-surface, SPEC-service-material-unit, SPEC-service-content-ingestion, SPEC-service-content-adaptation -->

**Who:** a learner past the first few hundred words.
**Wants to:** read real, connected text where they know nearly every word — and
turn the few they don't into practice.
**So that:** vocabulary stops being a list and starts being a language.

Derived from [`../study/STUDY-005-input-reading-listening.md`](../study/STUDY-005-input-reading-listening.md),
[`../study/archive/ARCH-048-content-licensing-and-adaptation.md`](../study/archive/ARCH-048-content-licensing-and-adaptation.md).

## Today

Learners either read material graded by a coarse label (where two "B1" texts can
differ enormously) or jump into authentic text, look up every third word, and
stop. Nothing connects what they looked up to what they practise, so the same
word is looked up again a week later.

## Success looks like

- Each text shows, before it is opened, how much of it this user already knows
  ("98 % known · 6 min") and how long the **full piece** takes to read.
- Suggested texts land in the 95–98 % band, computed from this user's own
  vocabulary — not from a level label.
- **Topic news** (politics, daily): learner gets a **full adapted article** at
  their target level (UC-030) from **licence-cleared** or **generated** catalogue
  sources — see [`content-ingestion.md`](../specs/service/content-ingestion.md).
- Session **material unit** is the **full text** for reading — previewed before
  Start. **No time-window cut** of an article mid-body (owner 2026-08-20); menu
  filter uses estimated read time of the whole piece. Listening audio may use a
  declared window when there is no article boundary —
  [`material-unit.md`](../specs/service/material-unit.md).
- Texts at 100 % known are offered too, framed as speed practice.
- Tapping a **word** gives its meaning *in this context* and offers to add it;
  tapping a **sentence** gives a translation.
- The translation does not appear instantly — a brief hold or a second tap comes
  first, so a retrieval attempt happens. This delay can be switched off but is
  on by default.
- After reading: two or three comprehension questions, then the words tapped
  during reading, offered as cards with the sentence as context.
- Where possible, the chosen text contains words the user recently learned.
- Adapted catalogue texts are **labelled** and link to the original when licence
  requires attribution.
- Reading an adapted text **counts toward the reading skill** the same as
  authentic input — with the adaptation label visible (owner 2026-08-20).

## Out of scope

Licensed literary bestsellers without a deal; paywall bypass; storing commercial
newspaper full text in the shared catalogue without licence.

Audio-first version of the same experience: UC-008 / UC-027.
