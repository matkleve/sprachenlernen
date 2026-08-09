# Method menu — acceptance criteria

<!-- parent: SPEC-page-method-menu -->

- [ ] Given no filter, when the page renders, then every Method appears exactly
      once, grouped under its section.
- [ ] Given the `kitchen` preset, then only Methods performable there render —
      and no Method requiring free eyes appears, greyed out or otherwise.
- [ ] Given any preset, then no Commitment appears in the Method list.
- [ ] Given a chosen preset and then cleared, then the whole catalogue renders
      and no preset is marked chosen.
- [ ] Given a chosen preset, then that preset and no other is marked chosen.
- [ ] Given `?time=2`, then only Methods whose shortest duration is at most 2
      minutes appear.
- [ ] Given a complete custom context in the URL, then the list matches
      `filterByContext` for that context.
- [ ] Given any rendered Method card, then durations, requirements, effort,
      evidence and hosted status appear as chips, and `doesNotDo` appears as
      prose.
- [ ] Given any rendered Method card, then it links to `/methods/{id}`.
- [ ] Given a Method the app does not host, then it renders as a full card that
      says so.
- [ ] Given a context nothing fits, then the gap is named and no Method list
      renders.
- [ ] Given an unknown `context` value, then the page says so and shows the
      whole catalogue.
- [ ] Given a catalogue load failure, then the error callout appears with a
      reference id.
- [ ] Given any state, then no learner-specific number appears.
- [ ] The page tree contains no `"use client"` directive.
- [ ] The rendered surface has no axe-core violations.
