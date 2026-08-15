# UC-072 — Get the latest app after a deploy

<!-- id: UC-072 -->
<!-- specs: SPEC-feature-app-update, SPEC-feature-pwa-install -->

**Who:** someone who added Sprachenlernen to the Home Screen or keeps a Safari tab
open for days.
**Wants to:** load the version the server is running now.
**So that:** fixes and content ship without deleting the PWA or hunting for a
hidden reload.

## Today

iOS standalone PWAs have no Safari toolbar. Without a service worker, the
cached bundle can stick until the learner force-quits or reinstalls. The Pride
version label under the nav pill shows what is **running**, but nothing prompts
a reload when a newer build is live.

## Success looks like

- After a deploy, returning to the app (or switching back to the tab) surfaces
  a clear **Reload** control when the running build is older than the server.
- Reload fetches the new bundle; the version label matches the server again.
- When versions match, the quiet `vPROUD.DEFAULT.SHAME` label stays as today.
- On iPhone, **Profile → Home screen app** explains install scope and offers
  **Install instructions** and **Open main website** (see [`pwa-install`](../specs/feature/pwa-install.md)).

## Out of scope

- Service worker / offline cache strategy (UC-018).
- Auto-reload without an explicit tap.
- Changelog or release notes.
