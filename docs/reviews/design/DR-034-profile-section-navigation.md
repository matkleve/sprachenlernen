# 33 · Profile section navigation

<!-- id: DR-034 -->
<!-- type: design-review -->
<!-- status: active -->

**Status:** draft for owner sign-off · **2026-08-16**

Companion to [`32-pwa-profile-ux.md`](DR-032-pwa-profile-ux.md) and
[`../specs/page/profile.md`](../../specs/page/profile.md).

---

## Problem

`/profile` stacks five blocks in one scroll: spoken language, learning
languages, your data, app version, and home-screen install guidance. On a phone
that is a long walk to reach export or sign out. Learners expect settings to
feel **instant** — tap a label, see that block, no route change, no loading
flash.

ADR-0009 still holds: profile is a **corner chip**, not a fifth destination.
Section switching must stay on `/profile`; it must not become nested routes like
`/profile/data`.

---

## Principle: one page, three buckets

Group by **what the learner is trying to do**, not by how the code is organised.

| Bucket | Learner question | Blocks today | Future candidates |
| --- | --- | --- | --- |
| **Languages** | What do I speak, and what am I learning? | Spoken language, learning languages | Remove a language (⚠ SPEC GAP), reorder list |
| **Your data** | What can I take away or delete? | Export, delete account | Import from Anki (later), data retention note |
| **This device** | Is this install up to date and set up right? | App version, Home screen (iPhone) | Android install button, notification prefs (study/30) |

**Sign out** stays **below** the section panels, always visible. It is a
session action, not a settings category — burying it behind a tab has caused
support incidents in other products.

Measured progress stays on `/progress`. Profile links to it from language rows;
it never gets a tab here ([`profile.md`](../../specs/page/profile.md) § Out).

---

## Why client-side tabs, not routes

| Approach | Feels instant? | Deep-linkable? | Fits ADR-0009? |
| --- | --- | --- | --- |
| Nested routes (`/profile/data`) | No — RSC round-trip, layout flash | Yes | Borderline — still one chip, but Next.js navigation cost |
| Hash (`#data`) | Yes | Yes | Yes |
| Query (`?section=data`) + client state | Yes | Yes (initial only) | Yes |
| Pure `useState` | Yes | No | Yes |

**Shipped choice:** `FilterPill` row toggles client state. Optional `?section=`
on first load for deep links; `history.replaceState` on switch so the URL
updates without navigation. Reuse: `FilterPill` (same as method-menu filters).

All section content stays mounted but `hidden` when inactive so switching does
not remount client forms (spoken-language switch, export scope, update check).

---

## Tab labels (learner language)

| Tab id | Label | Rationale |
| --- | --- | --- |
| `languages` | Languages | Default — most visits are to switch learning language or spoken UI language |
| `data` | Your data | Matches existing heading; export/delete is legally salient — name it plainly |
| `device` | This device | Covers app version + Home screen; avoids jargon ("PWA", "client") |

Do **not** add a fourth **Account** tab until there is more than sign-out to
show (e.g. email, password). One-item tabs waste a tap.

---

## Layout (mobile-first)

```
[ Languages ] [ Your data ] [ This device ]   ← horizontal pill row, wraps on narrow

┌─ active panel ─────────────────────────────┐
│  (one bucket's sections)                    │
└─────────────────────────────────────────────┘

[ Sign out ]                                  ← always below panels
```

- Pills use `FilterPill` + `aria-pressed` (existing inventory).
- Panel container uses `role="tabpanel"` + `aria-labelledby` pointing at the
  active pill id.
- First section inside a panel drops `mt-page-content` top margin; the nav row
  carries spacing via `mb-page-content`.

---

## Future sections (not in V1 tabs)

| Item | Bucket | Blocked by |
| --- | --- | --- |
| Account email display | New **Account** tab or Languages header | Auth surface spec |
| Notification / reflection schedule | This device | [`STUDY-026-notifications-and-reflections.md`](../../study/STUDY-026-notifications-and-reflections.md) |
| Accessibility (reduce motion, larger text) | This device or new **Preferences** | Design system tokens for user scale |
| Subscription / billing | Your data or Account | No monetisation in V1 |
| Remove a language | Languages | ⚠ SPEC GAP in `profile.md` |

When **Account** grows past sign-out alone, split it out; until then sign-out
stays pinned below the panels.

---

## Open for designer

- [ ] Merge **App** + **Home screen** headings inside **This device** under one
      sub-heading "On this device" (same question as study/32)?
- [ ] Hide **Home screen** block at `≥ md` (install quirk is phone Safari)?
- [ ] Sticky pill row while scrolling within a long panel?
- [ ] Icon + label on pills, or label only (current method menu is label-only)?

---

## Check

Owner: on `/profile`, tap each pill — content swaps with no full-page load;
sign out remains visible; `?section=data` opens on Your data; back button does
not trap (replaceState only, no pushState per switch).
