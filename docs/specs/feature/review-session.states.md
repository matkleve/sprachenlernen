# Review session — states

Split child of [`review-session.md`](review-session.md). The parent owns scope,
behavior and acceptance criteria; this file owns the FSM.

## One enum

```ts
type SessionPhase =
  | "preparing"
  | "prompting"
  | "revealed"
  | "persisting"
  | "advancing"
  | "complete";
```

## Transition map

| From | Legal to |
| --- | --- |
| `preparing` | `prompting`, `complete` |
| `prompting` | `persisting` |
| `persisting` | `revealed`, `prompting` |
| `revealed` | `advancing` |
| `advancing` | `prompting`, `complete` |
| `complete` | *(none — terminal)* |

Illegal transitions are no-ops (`docs/STATE.md` §3).

## Terminal states

| State | Meaning |
| --- | --- |
| `complete` | Every card in the queue was graded and persisted, or the queue was empty at prepare time |

Acting on `complete` (e.g. a second grade tap) is a no-op.

## Single source of truth

`sessionIndex: number` — which card in the built queue is active. `phase` derives
what the learner sees; card front/back text derives from
`queue[sessionIndex]`; progress derives from `sessionIndex + 1` and
`queue.length`. No surface stores its own copy of the active card.

## Phase effects

| Phase | Card | Grades | Progress |
| --- | --- | --- | --- |
| `preparing` | hidden | hidden | hidden |
| `prompting` | front only | enabled | shown |
| `persisting` | front | disabled | shown |
| `revealed` | front + back | disabled | shown |
| `advancing` | *never rendered — see below* | | |
| `complete` | hidden | hidden | session summary |

`advancing` is a **waypoint, not a screen.** It exists so that `revealed` has no
legal direct edge to `prompting`, and the implementation passes through it inside
one state update, so no render ever observes it. Nothing may be designed for it;
a surface that needs a visible "moving to the next card" moment needs a phase of
its own and an edge to reach it. (`docs/TRAPS.md`.)

`persisting → prompting` is legal only on persistence **error** — grades re-enable
so the learner can retry. Success always goes to `revealed`.

## Check

`npm test -- session-machine`
