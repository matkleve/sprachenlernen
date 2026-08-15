# Home Screen install (iPhone PWA)

<!-- id: SPEC-feature-pwa-install -->
<!-- use-case: UC-072 -->
<!-- status: active -->

iOS ties the Home Screen web app to the **URL path open when Add to Home Screen
was tapped**. Install from `/` → all routes under the site work without Safari's
bottom toolbar. Install from `/methods` → only Methods and sub-paths do.

Parent: [`page/profile.md`](../page/profile.md). Research:
[`../../study/31-ios-safari-pwa-test-report.md`](../../study/31-ios-safari-pwa-test-report.md).

## Scope

- **In:** `app/manifest.ts` (`start_url: /`, `scope: /`); public `/install`
  instructions; **Home screen app (iPhone)** block on `/profile` with link to
  `/install`; `lib/is-standalone-display.ts` for readout.
- **Out:** Android `beforeinstallprompt` button (future); native App Store app;
  auto-install; changing iOS scope rules.

**No install button on iPhone** — Apple does not expose Add to Home Screen to
JavaScript. Instructions only.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/profile` on iPhone | **Home screen app** section explains root-URL install |
| 2 | Taps **How to add to Home Screen** | `/install` with numbered steps + link to `/` |
| 3 | Already on Home Screen icon | Profile shows “You opened this from a Home Screen icon.” |
| 4 | Toolbar on some pages after wrong install | Copy says remove icon, reinstall from `/` |

## Acceptance criteria

- [ ] Given `/install`, when rendered, then steps mention Share → Add to Home Screen
      and link to the site root — not `/methods`.
- [ ] Given `/profile`, when rendered, then a Home screen section links to `/install`.
- [ ] Given `app/manifest.ts`, then `start_url` is `/` and `scope` is `/`.
- [ ] **Negative:** no button claims to install the PWA on iOS.

## Check

`npm test -- profile install is-standalone-display`
