# Mobile navigation — hamburger drawer with icons

<!-- id: SPEC-feature-mobile-nav -->
<!-- use-case: UC-063 -->
<!-- status: superseded -->

**Superseded by [`mobile-nav-v2.md`](mobile-nav-v2.md)** (2026-08-10). Owner
validated drawer friction on phone; v2 uses a floating destination pill and
corner chips instead.

This file is kept for history. Do not implement against it.

## Historical contract (v1)

Responsive navigation for the signed-in shell on phone-width viewports. Desktop
kept horizontal destination links with icons; mobile collapsed them behind a
hamburger that opened a labelled drawer.

**Parent:** [`app-shell.md`](app-shell.md). Still exactly Methods, Words, Progress
(ADR-0009). **No due-count badges** (UC-063).

## Check

`npm test -- mobile-nav app-shell` — retired when v2 ships; use `mobile-nav-v2`.

## Acceptance criteria

Superseded — see [`mobile-nav-v2.md`](mobile-nav-v2.md).
