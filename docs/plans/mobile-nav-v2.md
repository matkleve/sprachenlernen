# Plan — mobile navigation v2 (floating pill + corner chips)

**Status:** implemented on `main` (ongoing — icon-only pill, tap shield,
`useVisualViewportBottomInset`).
**Change class:** Standard.

Contract: [`../specs/feature/mobile-nav-v2.md`](../specs/feature/mobile-nav-v2.md).

## Files

| File | Change |
| --- | --- |
| `features/app-shell/FloatingShellChrome.tsx` | Mobile floats (back, account, pill) |
| `features/app-shell/back-target.ts` | Drill-in → parent destination |
| `features/app-shell/FooterScrim.tsx` | Tap shield behind bottom pill |
| `features/app-shell/useVisualViewportBottomInset.ts` | Dynamic Safari bottom inset |
| `features/app-shell/DestinationNavItems.tsx` | `layout="pill"` → `IconLink` |
| `features/app-shell/AppShell.tsx` | Shell main insets; `min-h-svh` |
| `app/globals.css` | Shell float spacing tokens |
| `features/app-shell/mobile-nav-v2.test.tsx` | Shell contract tests |

## LIVE CHECK (you)

1. Phone &lt; 768px — compact bottom pill (three icon-only chips), no hamburger.
2. Top-right **account** icon chip always visible.
3. Words → **Start review** — back chip to Words; pill still visible.
4. Desktop — horizontal `NavLink` row unchanged; no bottom pill.
5. No numbers in nav (UC-063).
6. On `/words`, if Safari's bottom toolbar appears, pill sits above it; on
   `/methods` with no toolbar, pill sits at normal bottom.
