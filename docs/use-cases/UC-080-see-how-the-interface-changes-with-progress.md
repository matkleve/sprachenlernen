# UC-080 — see how the interface changes with progress

<!-- id: UC-080 -->
<!-- specs: SPEC-page-progression-explorer, SPEC-page-wood-texture-lab -->

**Who:** a product owner or designer evaluating whether the interface should
change as a learner's stable vocabulary grows
**Wants to:** move one control and watch the app's real surfaces change, on the
device they will actually be seen on
**So that:** the decision rests on something they looked at, not on a written
description of something nobody has seen

## Today

The idea exists only as an owner conversation. `/dev/design` compares five
base themes side by side, but each preview is a small card of generic
components — it cannot answer "does one step up feel like anything at all?",
which is the question the whole idea hangs on. A step nobody notices is wasted
work; a step that is too loud is a distraction on every screen.

## Success looks like

- One control moves through every stage, and the app's **real** surfaces
  change — method card, review card with grade buttons, header, nav pills,
  buttons and fields, a skill-tier badge.
- The three chapters (Workshop, Library, Observatory) are reachable from the
  same control, so the two chapter transitions can be judged as moments.
- It works on a phone against the deployed app, not only on a laptop.
- Nothing a learner sees changes — this is a workbench, not a feature.

## Out of scope

- Wiring stages to real learner data (`task_state` stable counts). This decides
  *whether* to build it; the coupling is a separate change.
- Persisting a chosen stage for a learner, or any account state at all.
- Dark mode per chapter — the preview scopes its own tokens, as `/dev/design`
  already does.
- Changing the shipped Warm Scholar theme.
