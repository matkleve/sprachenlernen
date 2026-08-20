# Method session budget — resolved material

<!-- parent: SPEC-service-method-session-budget -->

When the session is tied to a **specific Source** (learner upload, catalogue pick,
gap-fill / translation on a passage), wall time comes from **that material after
compose** — not from the menu slider alone. Owner 2026-08-20.

| Step | Rule |
| --- | --- |
| 1 · Intake | Paste / upload / link resolves to a Source |
| 2 · Adapt | If below comfortable band, run adaptation (UC-030) **before** Start — learner upload needs consent |
| 3 · Estimate | Compute read time (or item-loop time) on the **final** body |
| 4 · Contract | Show session contract on detail — e.g. *"~20 min · full text · adapted"* |
| 5 · Start | CTA enabled only when steps 1–4 complete — no surprise 40 min mid-session |

Menu filter still uses the estimate from step 3 to hide methods that cannot fit
(`estimate ≤ filter`). **Forbidden:** Start without a wall estimate when material
length is known.

Item-loop methods (`build-a-sentence`, dictation on a passage) use the same rule:
compose from resolved material, show `~N min · M sentences` (or words) **before**
Start.
