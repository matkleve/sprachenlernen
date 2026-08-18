# Page layout — route transitions

<!-- id: SPEC-feature-page-layout-transitions -->
<!-- use-case: UC-063 -->
<!-- status: active -->

Normative rules for **width stability** when navigating between signed-in routes.
Parent: [`page-layout.md`](page-layout.md).

## Scope

- **In:** Suspense loading UI inside `(app)`; desktop scrollbar gutter.
- **Out:** marketing routes (`app/loading.tsx`); client-side filter changes on
  `/methods` (no route transition).

## Loading skeleton (`app/(app)/loading.tsx`)

While a signed-in page's Server Component streams, Suspense shows a skeleton
**inside** the shell (`AppShell` header and nav stay mounted).

| Rule | Detail |
| --- | --- |
| Wrapper | **`ShellPageLoading`** — reuses `ShellPageContent` (`width="wide"`, `scrollable-destination`) |
| Width | `max-w-5xl` — matches Methods, Words, Progress destinations |
| Mobile top rhythm | **No** `pt-page-top` — shell float reserve on `<main>` is enough |
| Desktop top rhythm | `md:pt-page-top` via `ShellPageContent` |
| Bottom rhythm | `pb-page-bottom` via `ShellPageContent` |
| A11y | `role="status"`, `aria-live="polite"`, skeleton blocks `aria-hidden` |

**Rejected:** ad-hoc `max-w-*` on the loading div — caused a visible width jump
(`max-w-4xl` skeleton vs `max-w-5xl` content) when switching destinations.

Narrow drill-in pages (`width="narrow"`) may briefly show the wide skeleton
during load. Acceptable: the three primary pill destinations are wide; a brief
wide flash beats a narrow→wide snap on every tab switch.

## Scrollbar gutter (desktop)

On viewports `≥ md`, `html` sets `scrollbar-gutter: stable` so the vertical
scrollbar **reserves space** even when the document is shorter than the
viewport.

| Rule | Detail |
| --- | --- |
| Owner | `app/globals.css` `@layer base` on `html` |
| Breakpoint | `≥ md` only — mobile overlays do not consume layout width |
| Purpose | Prevent ~15px horizontal shift when route height toggles scrollbar |

## Acceptance criteria

- [ ] Given navigation between `/methods` and `/words` on desktop, when the
      loading skeleton appears, then content width does not change (`max-w-5xl`).
- [ ] Given the signed-in loading skeleton on mobile, then it does **not** apply
      `pt-page-top`.
- [ ] Given viewport `≥ md` and a short signed-in page, when a taller route is
      opened, then layout width does not shift from scrollbar appearance.

## Check

`npm test -- shell-page` — `ShellPageLoading` wrapper classes.
