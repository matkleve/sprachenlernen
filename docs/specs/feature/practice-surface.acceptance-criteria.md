# Practice surface — acceptance criteria

<!-- parent: SPEC-feature-practice-surface -->

- [ ] Given a prepare step on `/practice`, when the learner views prep rows, then
      each row is static text (`border-x border-line-strong`, `font-semibold`) —
      not a button, checkbox, or toggle.
- [ ] Given a prepare step, when the learner views prep rows, then there is no
      `role="button"` and no `aria-pressed` on the requirements list.
- [ ] Given build-a-sentence prepare on mobile (`< md`), when rendered, then the
      body zone has no scrollbar (`short` profile + fit-frame density).
- [ ] Given build-a-sentence prepare on desktop, when rendered, then the body zone
      has no scrollbar (`short` profile).
- [ ] Given German UI, when build-a-sentence prepare renders, then checklist copy
      is German (recipe `itemKeys`, not English literals).
- [ ] Given an active step, when the footer renders, then there is no
      `bg-surface` panel behind nav + primary on `canvas`.
- [ ] Given step body text, when compared to method menu labels, then prompt copy
      uses practice-surface scale (`text-lg` or larger).
- [ ] Given desktop `/practice` with build-a-sentence, when the learner moves from
      prepare to sentence-check, then ◀ ▶ and primary CTA stay at the same
      vertical position (footer anchored; only body content changes).
- [ ] Given a focused textarea in the scroll body, when the learner tabs into the
      field, then the accent focus ring is fully visible (not clipped by overflow).
