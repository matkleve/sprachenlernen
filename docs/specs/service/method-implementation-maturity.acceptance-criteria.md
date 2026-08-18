# Method implementation maturity — acceptance criteria

- [ ] Given every catalogue id, when the matrix is regenerated, then each row
      has an **I** tier column computed by the rules in
      `method-implementation-maturity.md`.
- [ ] Given a Method in `lib/exercise-recipe-built.ts`, when tier is computed,
      then it is at least **I2**.
- [ ] Given `srs-session`, when tier is computed, then it is **I4**.
- [ ] Given `extensive-reading`, when tier is computed, then it is **I3** (adaptive
      material compose).
- [ ] Given a Method with only a composer.methods row and not in
      `exercise-recipe-built.ts`, when tier is computed, then it is **I1**.
- [ ] Given `method-implementation-maturity.md` and UC-057, when read together,
      then readiness states are not conflated with I-tiers.
