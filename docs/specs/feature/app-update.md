# App update prompt

<!-- id: SPEC-feature-app-update -->
<!-- use-case: UC-072 -->
<!-- status: active -->

Detect when the **running** Pride build is older than the **deployed** build and
offer a one-tap reload — especially for PWA users who lack Safari's toolbar.

Parent: [`mobile-nav-v2.md`](mobile-nav-v2.md) (version label slot). Versioning:
[`../../VERSIONING.md`](../../VERSIONING.md).

## Scope

- **In:** `GET /api/app-version` returning the deployed Pride version;
  client-side compare against the bundled version; tappable **update chip** above
  the mobile destination pill with **Update available** copy and an
  `ArrowDownCircle` icon when stale (muted current label below the pill when
  current); an **App** block on `/profile` with running version, **Check for
  updates**, and a green reload row when stale; checks on mount, `visibilitychange`, and a five-minute
  interval; `location.reload()` on tap.
- **Out:** service worker; auto-reload; a separate Settings destination;
  build-id / git SHA (Pride version only).

**Reuse:** `Button` (`ghost`, `sm`), `APP_PRIDE_VERSION` / `formatPrideVersion`
from `lib/pride-version.ts`, `AppUpdateProvider` (one shared check for footer +
profile), `AppUpdateChip` and `AppVersionLabel` slots in `FloatingShellChrome`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens any signed-in route | Client fetches `/api/app-version` with `cache: no-store` |
| 2 | Running version matches server | Muted `vPROUD.DEFAULT.SHAME` label as today |
| 3 | Server version is newer | Green **Update available** chip with download icon above the pill; tap reloads |
| 4 | Taps Reload | Full page reload |
| 5 | Returns to tab / app (`visibilitychange` → visible) | Re-check; prompt appears if a deploy happened while away |
| 5b | iOS PWA resumes (`pageshow` / `focus`) | Same re-check as visibility |
| 6 | Fetch fails | No prompt; version label unchanged (fail silent) |
| 7 | Opens `/profile` | **App** section shows running version, **Last checked** (after the
  first successful fetch), and **Check for updates** |
| 8 | Taps Check for updates on `/profile` | Re-fetches `/api/app-version`; updates **Last checked**; shows green
  reload row when stale |

## States

| State | Trigger | Visual | Terminal? |
| --- | --- | --- | --- |
| `current` | versions equal or check pending/failed | muted version label | no |
| `stale` | server version ≠ bundled version | green update chip above pill | no (until reload) |

## Data

| Field | Source | Owner |
| --- | --- | --- |
| `bundledVersion` | `package.json` at build time | client bundle |
| `deployedVersion` | same `package.json` on server | `/api/app-version` |

## Acceptance criteria

- [ ] Given the bundled and deployed Pride versions match, when the mobile shell
      renders, then the muted version label appears and no Reload control.
- [ ] Given the server returns a higher Pride version, when the check completes,
      then a green **Update available** chip with an `ArrowDownCircle` icon
      appears **above** the mobile destination pill and the muted current label
      is hidden.
- [ ] Given the learner taps the stale update chip, when the handler runs,
      then `window.location.reload()` is called.
- [ ] Given the tab becomes visible again, when a newer deploy landed since the
      last check, then the green version control appears without a full navigation.
- [ ] Given `/api/app-version`, when requested, then the response is JSON
      `{ "version": "PROUD.DEFAULT.SHAME" }` with `Cache-Control: no-store`.
- [ ] Given a failed version fetch, when the shell renders, then no error
      callout — the version label stays (negative: no false-positive prompt).
- [ ] Given `/profile`, when the page renders, then an **App** section shows the
      running Pride version, **Last checked** (locale date/time after the first
      successful fetch, em dash before that), and a **Check for updates** control.
- [ ] Given a higher deployed version, when the learner opens `/profile` or taps
      **Check for updates**, then a green reload row names the deployed version
      **and** the mobile footer shows the same **Update available** chip above
      the pill.

## Check

`npm test -- app-update app-version mobile-nav-v2 profile`
