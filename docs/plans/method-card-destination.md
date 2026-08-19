# Plan — method card destination marker (T-B10g)

**Status:** shipped 2026-08-18; **routing corrected 2026-08-19** — exercise runners
open method overview before `/practice`.
**Change class:** Standard.

Contracts: [`method-card.md`](../specs/component/method-card.md),
[`method-card-header.md`](../specs/component/method-card-header.md),
[`method-menu.md`](../specs/page/method-menu.md).

## Shipped

1. **Start** / **Info** marker top-right on card header.
2. `summary` → `text-ink` on catalogue cards.
3. Hosted/off-app chip removed from cards.
4. `isRunnableFromMenu`, `cardDestinationMarker` in `lib/method-session.ts`.

## Routing correction (2026-08-19)

T-B10g briefly linked exercise-runner cards straight to `/practice`, skipping the
method overview (settings + Start). Restored to match
[`method-engines.md`](../specs/service/method-engines.md):

| Method kind | Card **Start** tap | Overview **Start** tap |
| --- | --- | --- |
| Card engine (`srs-session`) | `/words/review` | `/words/review` |
| Exercise runner (built) | `/methods/{id}` | `/practice?method=…` |
| Hosted not built / off-app | `/methods/{id}` | no Start |

## LIVE CHECK (owner)

1. `/methods` — runnable exercise card shows **Starten**; tap opens **overview**.
2. On overview — adjust setup if shown; tap **Start** → exercise runner.
3. `srs-session` card still opens review in one tap.
4. Hosted-not-built shows **Info**; tap → detail, no Start.
5. Off-app (e.g. tandem) shows **Info**; tap → detail.
6. Summary under title is ink, not muted.
