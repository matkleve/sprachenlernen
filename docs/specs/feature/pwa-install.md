# Home Screen install (iPhone PWA)

<!-- id: SPEC-feature-pwa-install -->
<!-- use-case: UC-072 -->
<!-- status: active -->

iOS ties the Home Screen web app to the **URL path open when Add to Home Screen
was tapped**. Install from `/` → all routes under the site work without Safari's
bottom toolbar. Install from `/methods` → only Methods and sub-paths do.

Parent: [`page/profile.md`](../page/profile.md). UX study:
[`../../reviews/design/DR-032-pwa-profile-ux.md`](../../reviews/design/DR-032-pwa-profile-ux.md). Research:
[`../../qa/QA-031-ios-safari-pwa-test-report.md`](../../qa/QA-031-ios-safari-pwa-test-report.md).

## Scope

- **In:** `app/manifest.ts` (`start_url: /`, `scope: /`); public `/install`
  instructions; **Home screen app (iPhone)** on `/profile` with scope table and
  two `ActionLink` buttons; `lib/is-standalone-display.ts`.
- **Out:** Android `beforeinstallprompt` button (future); native App Store app;
  auto-install; buttons to section paths (`/methods`, …) on profile — they invite
  wrong installs.

**No install button on iPhone** — Apple does not expose Add to Home Screen to
JavaScript. Instructions only.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/profile` | **Home screen app (iPhone)** with scope table + buttons |
| 2 | Taps **Install instructions** | `/install` with numbered steps |
| 3 | Taps **Open main website** | `/` (landing; safe install address) |
| 4 | On Home Screen icon | Status chip: “Opened from your Home Screen icon” |
| 5 | Wrong-scope install | Reinstall copy points to main website |

## Profile UI

| Element | Component | Target |
| --- | --- | --- |
| Scope table | card | `/` vs `/methods` / `/words` / `/progress` coverage |
| Install instructions | `ActionLink` primary | `/install` |
| Open main website | `ActionLink` secondary | `/` |

## Acceptance criteria

- [ ] Given `/profile`, when rendered, then scope table lists `/` as covering all
      sections and section paths as single-section only.
- [ ] Given `/profile`, when rendered, then primary **Install instructions** links
      to `/install` and secondary **Open main website** links to `/`.
- [ ] Given `/install`, when rendered, then steps mention Share → Add to Home Screen.
- [ ] Given `app/manifest.ts`, then `start_url` is `/` and `scope` is `/`.
- [ ] **Negative:** no control claims to install the PWA on iOS; no profile buttons
      to `/methods`, `/words`, or `/progress` for install.

## Check

`npm test -- profile install is-standalone-display`
