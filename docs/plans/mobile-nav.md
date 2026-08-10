# Plan — mobile navigation (hamburger + icons)

**Status:** ready to implement after error pipeline Groups 1–3 ship.
**Change class:** Standard (new UI surface; spec written first).
**Branch suggestion:** `cursor/mobile-nav-d240`

## Goal

Phone-width viewports get a usable navigation menu the owner can exercise on a
real device without horizontal scrolling or clipped tabs. Desktop gains icons
beside existing labels for visual consistency.

## Files to touch

| File | Change |
| --- | --- |
| [`../specs/feature/mobile-nav.md`](../specs/feature/mobile-nav.md) | Promote `draft` → `active` when implementation starts |
| [`../specs/feature/app-shell.md`](../specs/feature/app-shell.md) | Link mobile-nav; note responsive split |
| [`../specs/component/nav-link.md`](../specs/component/nav-link.md) | Optional `icon` slot variant |
| `features/app-shell/Destinations.tsx` | Extract shared `DESTINATIONS` config with icons |
| `features/app-shell/MobileNav.tsx` | **New** — drawer, hamburger, focus trap |
| `features/app-shell/AppShell.tsx` | `md:hidden` / `hidden md:flex` split |
| `features/app-shell/content.ts` | `menuOpen`, `menuClose`, `menuLabel` copy |
| `features/app-shell/app-shell.test.tsx` | Drawer + a11y tests |
| `features/app-shell/mobile-nav.test.tsx` | **New** |

**Will not touch:** destination routes, UC-063 data rules, marketing shell.

## Implementation steps

### 1. Shared destination config

```ts
// features/app-shell/destinations.ts
export const SHELL_DESTINATIONS = [
  { href: routes.methods, label: copy.destinations.methods, icon: Library },
  ...
] as const;
```

`Destinations.tsx` and `MobileNav.tsx` both import this — one list, no drift.

### 2. Desktop — icons beside labels

In `Destinations.tsx`, render `<Icon aria-hidden />` before each `NavLink` label.
No layout change beyond gap; verify at `max-w-5xl` header.

### 3. Mobile — `MobileNav` client island

- Hamburger `Button` (`variant="ghost"`, `size="icon"` or custom 44px).
- State: `open` boolean.
- Drawer: fixed panel `w-[min(100%,20rem)]`, `bg-surface`, token shadow.
- Backdrop: `bg-ink/40`, click to close.
- On route change (`usePathname`), `setOpen(false)`.
- Focus: first link on open; return focus to button on close.
- Sign-out form at drawer foot (duplicate of header form — mobile only).

Use `cn()` + `cva` for open/closed classes. Respect `prefers-reduced-motion`.

### 4. `AppShell` layout

```tsx
<header>
  <div className="flex ...">
    <div className="md:hidden"><MobileNav /></div>
    <div className="hidden md:block"><Destinations /></div>
    <form className="hidden md:block">...</form> {/* sign-out desktop */}
  </div>
</header>
```

Sign-out on mobile lives inside `MobileNav` drawer only.

### 5. Spec + tests

- Promote mobile-nav spec to `active`.
- Test: hamburger toggles `aria-expanded`; drawer lists three links; Escape
  closes; navigating calls `router` (mock `usePathname` change).
- Run `npm run verify`.

## LIVE CHECK (you) — after deploy

1. Open the app on your phone (or DevTools device mode &lt; 768px).
2. Confirm **hamburger** visible; three tabs **not** squashed in the header.
3. Tap hamburger → drawer shows **Methods**, **Words**, **Progress** each with
   icon + label.
4. Tap **Words** → `/words` loads; drawer closes.
5. Rotate to landscape / widen window → horizontal nav with icons; no hamburger.
6. Confirm **no numbers** anywhere in nav (UC-063).

## Risks

| Risk | Mitigation |
| --- | --- |
| Two sign-out forms | Desktop header only ≥ `md`; mobile only in drawer |
| Focus trap complexity | Use minimal hand-rolled trap or proven pattern from `Select` |
| Visual scope creep | Icons + drawer only — no spacing/color changes beyond tokens |

## Alternative (v2)

If drawer feels slow in daily use, add ADR for **bottom tab bar** on `sm` and
retire hamburger for destinations (keep drawer for sign-out only). Research
supports tabs for 3-primary apps; this plan defers that per owner request.
