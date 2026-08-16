# 32 · PWA install — Profile UX (designer review)

**Status:** shipped · designer tweaks optional · **2026-08-15** (updated 2026-08-16)

Companion to [`31-ios-safari-pwa-test-report.md`](31-ios-safari-pwa-test-report.md) and
[`../specs/feature/pwa-install.md`](../specs/feature/pwa-install.md).

---

## Problem

On iPhone, **Add to Home Screen** scopes the app to the URL path open at install
time. Learners who install from `/methods` see Safari’s bottom toolbar on Words
and Progress. We cannot trigger install programmatically on iOS.

## Profile placement

| Block | Why here |
| --- | --- |
| **App** (version, updates) | Already the “this device” maintenance surface (UC-072) |
| **Home screen (iPhone)** | Same bucket — how the app is installed, not learning data |

Do **not** add a fifth destination. Profile chip is correct (ADR-0009).

## Proposed layout (shipped pending review)

```
Home screen (iPhone)
  [caption — one paragraph]

  [status chip if opened from Home Screen icon]

  ┌─ scope card ─────────────────────────────┐
  │ Install address          Covers            │
  │ /  (main website)        all sections  ✓   │
  │ /methods                 Methods only      │
  │ /words                   Words only        │
  │ /progress                Progress only    │
  └──────────────────────────────────────────┘

  [ Primary: Install instructions → /install ]
  [ Secondary: Open main website → / ]

  [reinstall hint if toolbar on some pages]
```

### Button rules

| Control | Role | Target |
| --- | --- | --- |
| **Install instructions** | Primary `ActionLink` | `/install` |
| **Open main website** | Secondary `ActionLink` | `/` — the only safe install address |
| Section path links | **Out of scope** — do not add buttons to `/methods` etc.; they invite wrong installs |

### Open for designer (optional — not blockers)

- [ ] Merge **App** + **Home screen** under one heading **On this device**?
- [ ] Show scope table on `/install` only (shorter profile)?
- [ ] iPad: hide Home screen block at `≥ md` (install quirk is phone Safari)?
- [ ] Android later: `beforeinstallprompt` button in same block?

## Copy principles

- Say **Home Screen**, not “PWA” (learner language).
- Say **main website** for `/`, not “root” or “substring”.
- Never imply a button installs the app on iPhone.

## Check

Owner/designer: open `/profile` on iPhone — two buttons, scope table readable,
primary action obvious. Reinstall from `/` → all pill destinations without toolbar.
