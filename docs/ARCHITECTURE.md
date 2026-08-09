# Architecture

Four layers. Dependencies point **downward only** — a lower layer never imports
from a higher one. That single rule is what keeps a codebase navigable at fifty
routes.

```
app/            routes: page, layout, loading, error. Composition only.
   │  imports ↓
features/       one folder per feature. The place most code goes.
   │  imports ↓
components/ui/  primitives shared by ≥2 features.
   │  imports ↓
lib/            framework-free helpers. No React, no fetch, no globals.
```

`lib/` importing from `features/` is a circular dependency waiting to happen and
`check:specs` is not going to catch it — reviewers must.

---

## `app/` — routes only

Thin. A page composes feature components and passes route params. Business logic
in a `page.tsx` is logic no test can reach without a router.

Server Components by default. `"use client"` only for state, effects or event
handlers, and pushed **as far down the tree as possible** — one leaf being
interactive should not make its whole page a client bundle.

## `features/<name>/` — the default home for code

Everything one feature needs, colocated:

```
features/greeting/
  Greeting.tsx        component(s)
  useGreeting.ts      hooks
  content.ts          copy
  greeting.test.tsx   tests, next to what they test
```

Colocation over categorization: a folder that holds one feature end-to-end is
easier to reason about — and delete — than the same files scattered across
`/components`, `/hooks` and `/utils`.

A feature does **not** import from another feature. If two need the same thing,
it moves down to `components/ui/` or `lib/`.

## `components/ui/` — earned primitives

A component moves here the moment a **second** feature needs it. Not in
anticipation of one. Premature promotion produces primitives with the wrong
seams, because they were designed against one caller.

Everything here is generic: no domain vocabulary, no feature-specific props.
`<Button variant="danger">` belongs here. `<DeleteAccountButton>` does not.

## `lib/` — pure helpers

Framework-free and side-effect-free. Given the same input, returns the same
output. That is what makes it trivially testable, and the test is worth writing
because everything above depends on it.

---

## Data flow

State lives at the **lowest common ancestor** of everything that needs it, and
nowhere else. Two components showing the same thing derive it from one source
(see the state-coherence contract in [`WORKFLOW.md`](WORKFLOW.md)) — they do not
each hold a copy and stay in sync by discipline.

Prefer, in order: derive it → lift it → put it in a URL param → context. Reach
for a global store only when you have a concrete case the four cheaper options
cannot serve, and record it as an [ADR](adr/).

### Client-first when the data is small and static

If a screen's data fits in memory and changes only on deploy (the method
catalogue, language profiles, design tokens), **filter and sort on the client**.
Do not navigate — and do not re-run the server component — on every chip click.

1. Load once on the server, pass as props to a client island.
2. Keep filter state in React; derive the visible list during render.
3. Sync the URL with `history.replaceState` so links stay shareable and
   back/forward work, without `scroll` reset or an RSC round trip.
4. Reserve server fetches and databases for data that is per-user, large, or
   must not live in the bundle.

The method menu is the reference implementation (`features/method-menu/`).

---

## Adding a backend later

This base project is frontend-only on purpose — most projects do not need a
database on day one, and the ones that do should choose deliberately.

When you add one, the boundary rule is: **the client is untrusted.** Client-side
validation is UX; the server re-validates everything. Access control belongs at
the data layer (row-level security, or a server-side guard on every read and
write), never in the component that renders the button. Wrap the SDK in an
adapter in `lib/` rather than importing it in components, so the choice stays
reversible and mockable in tests.

Record the decision as an ADR before writing the first query.
