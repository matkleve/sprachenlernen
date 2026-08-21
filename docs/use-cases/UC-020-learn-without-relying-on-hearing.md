# UC-020 — Learn the language without relying on hearing

<!-- id: UC-020 -->
<!-- specs: SPEC-feature-listening-defer -->

**Who:** a deaf or hard-of-hearing learner.
**Wants to:** learn to read and write the language, and not be told they are
worse at it than they are.
**So that:** the product measures their competence rather than their hearing.

Derived from [`../study/STUDY-012-accessibility.md`](../study/STUDY-012-accessibility.md).

## Today

Every app assumes hearing. The damage is not only that audio exercises are
unusable — it is that the progress model counts them. A learner who cannot hear
gets a permanently depressed overall level, produced by a calculation that was
never designed with them in mind and that nobody notices is wrong.

## Success looks like

- The learner can declare which skills are part of their profile. Excluded
  skills are **left out** of the overall level, not scored low.
- The overall level is computed from the remaining skills using the same rule,
  and says which skills it is based on.
- Audio-recall cards are not scheduled, and the words they would have covered are
  not counted as weak.
- Every audio item has a transcript — which is already true for other reasons,
  and here becomes non-negotiable.
- Where residual hearing exists, playback speed and audio settings are
  adjustable rather than fixed.
- Nothing in the interface treats the profile as a limitation to be overcome or
  offers to "unlock" the excluded skills.
- UC-077 **listening defer** is separate — temporary situational, not profile
  exclusion; does not change overall level.

## Out of scope

Sign languages. They are languages in their own right with their own grammar,
and treating them as an accessibility setting for a spoken-language app would be
both wrong and disrespectful. Building for them would be a different product.
