# State

Three contracts. The first prevents states that should not exist, the second
keeps derived data honest, and the third prevents surfaces that disagree about
which state they are in. Between them they cover most of what goes wrong in
stateful UI.

---

## 1. Do you need a machine?

**No** — when the only states are CSS pseudo-classes: `:hover`, `:focus`,
`:disabled`, `:checked`. The browser owns those. Do not reimplement them in JS.

**Yes** — the moment JavaScript tracks a condition: open/closed,
idle/loading/loaded/error, selected, uploading, expanded, submitting. If you are
holding a `useState` to decide what the user sees, you have a state machine.
The only question is whether it is written down or improvised.

## 2. One enum, not a pile of booleans

```tsx
// ✗ four booleans = sixteen combinations, twelve of them nonsense
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isEmpty, setIsEmpty] = useState(false);

// ✓ one value, four states, no impossible combination
type Status = "idle" | "loading" | "ready" | "error";
const [status, setStatus] = useState<Status>("idle");
```

Boolean soup does not just *allow* `isLoading && isError` — it guarantees it
eventually happens, because every new branch has to remember to reset the other
flags. The bug then reads as "the spinner is stuck behind the error message",
and no amount of careful rendering fixes it, because the state itself is wrong.

**Loading, error and empty are mutually exclusive.** Each has exactly one owner
in the markup. If two can render at once, the state model is wrong — fix that,
not the CSS.

## 3. The transition map is the law

Declare which transitions are legal, and route every change through it.

```ts
const TRANSITIONS: Record<Status, Status[]> = {
  idle: ["loading"],
  loading: ["ready", "error"],
  ready: ["loading"],
  error: ["loading"],
};

function next(from: Status, to: Status): Status {
  return TRANSITIONS[from].includes(to) ? to : from; // illegal move = no-op
}
```

The failure this prevents is specific and expensive: code calls
`next("ready", "visible")`, `"visible"` is not in the map, the guard silently
returns the current state, and the UI is stuck forever — with no error, no
warning, and a passing build. The symptom looks like a framework bug.

So: **if a target appears in a call, it must appear in the map.** Add a test for
every transition the spec documents. When a state "does not change", suspect the
map before suspecting the framework.

## 4. Name the terminal states

A **terminal** state can never be left. Acting on something already in one is a
**no-op** — not an error, not a retry, nothing.

Declare them in the spec, and enforce them at the entry point of any action:

```ts
if (job.status === "done" || job.status === "cancelled") return;
```

Skipping this is how a finished upload gets re-run, a paid invoice gets charged
again, or a completed job re-enters the queue. The check is one line and it
belongs at the top of the function, not in the caller — callers forget.

---

## 5. Do not write state in an effect that reads it

```tsx
// ✗ runs on every change to `items`, and writes state derived from it
useEffect(() => {
  setVisible(items.filter((i) => i.active));
}, [items]);

// ✓ derive during render — one source, always in sync, no extra render
const visible = items.filter((i) => i.active);
```

The effect version is wrong in three ways at once: it renders twice for every
change, it can write a stale value if something else updated in between, and it
creates a second source of truth that can disagree with the first (§ 6, below).
When the effect also *reads* what it writes, it either loops or silently
overwrites newer data with older data.

**If you can compute it from what you already have, compute it — do not store
it.** Effects are for synchronising with something *outside* React: the DOM, a
subscription, a timer, the network. Not for keeping two pieces of state
agreeing with each other.

The same mistake in the DOM direction is what makes an input drop characters —
see [`TRAPS.md`](TRAPS.md) § A controlled input can lose what the user typed.

---

## 6. The state-coherence contract

**Required whenever selecting one thing updates two or more surfaces.**

This prevents the classic: *"I clicked another item — the sidebar changed but
the detail pane still showed the old one."* That is not a coding slip, it is a
missing contract. If a spec passes `item`, `title` and `body` as three
independent inputs, nothing says they must describe the same item at the same
time — so an implementer can wire one and forget another, and no gate catches it.

1. **Single source of truth.** Exactly one piece of state holds the selection
   (e.g. `activeId`). Every surface is *derived* from it. No surface keeps a copy.
2. **Atomic propagation.** When the source changes, every derived surface
   re-derives in the same render. No surface may lag or retain stale data.
3. **Coherence criteria.** The spec asserts the *whole set* of surfaces after a
   change — including that nothing from the previous selection remains.

```gherkin
Scenario: Switching the selection updates every surface coherently
  Given item A is active and the list, header and detail pane all show A
  When I select item B
  Then the header shows B
  And the detail pane shows B (not A, and not empty-then-B)
  And no surface still shows any data from A

Scenario: Re-selecting the active item is a no-op
  Given item B is active
  When I select item B again
  Then nothing reloads and nothing flickers
```

Implemented as: one `activeId`, everything else derived from it. Clicking a row
sets *only* `activeId`. The bug becomes structurally impossible — you cannot
update one surface without the other, because neither owns the selection.

Worked example: [`specs/feature/item-picker.md`](specs/feature/item-picker.md)
and `features/item-picker/`.

---

## 7. What the spec must contain

For anything stateful:

- The **state list**, as one enum.
- The **transition map**, and which transitions are legal.
- The **terminal** states, and what actions on them do (nothing).
- For multi-surface features: the **single source of truth**, named.
- Acceptance criteria that assert the invariants directly — including the
  negative ("no residue of A") and the no-op ("re-selecting changes nothing").
