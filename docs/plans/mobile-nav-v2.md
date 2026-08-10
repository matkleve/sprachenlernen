# Plan — mobile navigation v2 (floating pill + corner chips)

**Status:** implemented on `cursor/mobile-nav-v2-d240`.
**Change class:** Standard.

Contract: [`../specs/feature/mobile-nav-v2.md`](../specs/feature/mobile-nav-v2.md).

## Files

| File | Change |
| --- | --- |
| `features/app-shell/FloatingShellChrome.tsx` | **New** — mobile floats (back, sign-out, pill) |
| `features/app-shell/back-target.ts` | **New** — drill-in → parent destination |
| `features/app-shell/AppShell.tsx` | Mobile: no header bar; shell main insets |
| `features/app-shell/DestinationNavItems.tsx` | `layout="pill"` variant |
| `features/app-shell/MobileNav.tsx` | **Delete** |
| `components/ui/Button.tsx` | `floating` variant |
| `app/globals.css` | shell float spacing tokens |
| `features/app-shell/mobile-nav-v2.test.tsx` | **New** |
| `docs/specs/feature/mobile-nav-v2.md` | `draft` → `active` when done |

## LIVE CHECK (you)

1. Phone &lt; 768px — bottom pill (Methods, Words, Progress), no hamburger.
2. Top-right **Sign out** float always visible.
3. Words → **Start review** — back chip to Words; pill still visible.
4. Desktop — horizontal nav unchanged; no bottom pill.
5. No numbers in nav (UC-063).
