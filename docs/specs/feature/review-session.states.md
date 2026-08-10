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
| `prompting` | `revealed` |
| `revealed` | `advancing` |
| `advancing` | `prompting`, `complete` |
| `complete` | *(none — terminal)* |

`persisting` remains in the enum for the write-queue worker only — the review
session FSM does not enter it. Illegal session transitions are no-ops
(`docs/STATE.md` §3).

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
| `prompting` | front only | hidden | shown |
| `revealed` | front + back | enabled | shown |
| `advancing` | *never rendered — see below* | | |
| `complete` | hidden | hidden | session summary |

`advancing` is a **waypoint, not a screen.** The learner never waits on the
network here.

## Check

`npm test -- session-machine`
