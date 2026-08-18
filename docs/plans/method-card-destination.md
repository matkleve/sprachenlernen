# Plan — method card destination marker (T-B10g)

**Status:** shipped 2026-08-18.
**Change class:** Standard.

Contracts: [`method-card.md`](../specs/component/method-card.md),
[`method-card-header.md`](../specs/component/method-card-header.md),
[`method-menu.md`](../specs/page/method-menu.md).

## Shipped

1. **Start** / **Info** marker top-right on card header.
2. `summary` → `text-ink` on catalogue cards.
3. Hosted/off-app chip removed from cards.
4. `isRunnableFromMenu`, `cardDestinationMarker` in `lib/method-session.ts`.

## LIVE CHECK (owner)

1. `/methods` — runnable card shows **Starten**; tap opens session.
2. Hosted-not-built shows **Info**; tap → detail, no Start.
3. Off-app (e.g. tandem) shows **Info**; tap → detail.
4. Summary under title is ink, not muted.
