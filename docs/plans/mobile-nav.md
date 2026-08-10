# Plan — mobile navigation (hamburger + icons)

**Status:** implemented on `cursor/mobile-nav-d240`.
**Change class:** Standard.

See [`../specs/feature/mobile-nav.md`](../specs/feature/mobile-nav.md) for the
contract. Implementation: `MobileNav.tsx`, `destinations.ts`, `DestinationNavItems.tsx`.

## LIVE CHECK (you) — after deploy

1. Open on phone (or DevTools &lt; 768px).
2. Confirm **Menu** hamburger visible; three tabs not squashed in header.
3. Tap Menu → drawer shows **Methods**, **Words**, **Progress** with icons.
4. Tap **Words** → `/words` loads; drawer closes.
5. Widen to desktop → horizontal nav with icons; no hamburger.
6. Confirm **no numbers** in nav (UC-063).
