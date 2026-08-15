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
  client-side compare against the bundled version; tappable footer row showing
  the **deployed** Pride version in `text-success` with an `ArrowDownCircle`
  icon when stale (replaces the muted current label); checks on mount,
  `visibilitychange`, and a five-minute interval; `location.reload()` on tap.
- **Out:** service worker; auto-reload; desktop header chrome; profile-page
  duplicate (mobile footer is enough for v1); build-id / git SHA (Pride version
  only).

**Reuse:** `Button` (`ghost`, `sm`), `APP_PRIDE_VERSION` / `formatPrideVersion`
from `lib/pride-version.ts`, `AppVersionLabel` slot in `FloatingShellChrome`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens any signed-in route | Client fetches `/api/app-version` with `cache: no-store` |
| 2 | Running version matches server | Muted `vPROUD.DEFAULT.SHAME` label as today |
| 3 | Server version is newer | Deployed `vPROUD.DEFAULT.SHAME` in `text-success` with download icon; tap reloads |
| 4 | Taps Reload | Full page reload |
| 5 | Returns to tab / app (`visibilitychange` → visible) | Re-check; prompt appears if a deploy happened while away |
| 6 | Fetch fails | No prompt; version label unchanged (fail silent) |

## States

| State | Trigger | Visual | Terminal? |
| --- | --- | --- | --- |
| `current` | versions equal or check pending/failed | muted version label | no |
| `stale` | server version ≠ bundled version | green version + icon button | no (until reload) |

## Data

| Field | Source | Owner |
| --- | --- | --- |
| `bundledVersion` | `package.json` at build time | client bundle |
| `deployedVersion` | same `package.json` on server | `/api/app-version` |

## Acceptance criteria

- [ ] Given the bundled and deployed Pride versions match, when the mobile shell
      renders, then the muted version label appears and no Reload control.
- [ ] Given the server returns a higher Pride version, when the check completes,
      then the footer shows the deployed version in `text-success` with an
      `ArrowDownCircle` icon and hides the muted current label.
- [ ] Given the learner taps the stale version control, when the handler runs,
      then `window.location.reload()` is called.
- [ ] Given the tab becomes visible again, when a newer deploy landed since the
      last check, then the green version control appears without a full navigation.
- [ ] Given `/api/app-version`, when requested, then the response is JSON
      `{ "version": "PROUD.DEFAULT.SHAME" }` with `Cache-Control: no-store`.
- [ ] Given a failed version fetch, when the shell renders, then no error
      callout — the version label stays (negative: no false-positive prompt).

## Check

`npm test -- app-update app-version mobile-nav-v2`
