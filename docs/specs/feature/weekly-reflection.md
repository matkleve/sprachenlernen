# Weekly reflection

<!-- id: SPEC-feature-weekly-reflection -->
<!-- use-case: UC-004 -->
<!-- status: active -->

F76 / M6 in-app: a personal, factual weekly narrative the learner opens on
demand. One entry row on `/progress`; tap opens a
[`reflection-deck`](../component/reflection-deck.md) with one to five swipeable
cards — sentence on top, matching chart or diagram below.

**Change class: Standard** when implemented.

## Scope

- **In:** `features/progress/weekly-reflection/` (builder + entry row),
  extension of [`progress.md`](../page/progress.md) § This week; chrome copy in
  `messages/*/progress.weeklyReflection`.
- **Out:** push/email digest (Tier 2 in
  [`study/30`](../../study/30-notifications-and-reflections.md)); NLG / LLM
  paragraphs; mood checks; streak copy.

**Reuse: `ReflectionDeck`** — card stack UI.
**Reuse: progress signal helpers** — same review-log derivation as the static
progress page.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/progress` when a new weekly reflection exists | **This week** row shows a one-line teaser and an unread mark; no auto-open |
| 2 | Taps the row | `ReflectionDeck` opens with 1–5 cards for the current ISO week and active learning language |
| 3 | Swipes through cards | Each card: personal headline + visual of the fact named in the headline |
| 4 | Finishes the deck or dismisses | Unread mark clears; reflection id stored so the same week is not "new" again |
| 5 | Taps **See the data** on the last card | Lands on the progress section or list that produced that card's metric |
| 6 | Had no measured activity this week | Single-card deck: honest idle copy + horizon chart, not silence |
| 7 | Returns mid-week after reading | Teaser stays; deck reopens to card 1 (no resume mid-stack) |

## Card selection (1–5)

The builder emits **only cards with a non-repeatable fact** for this week
([`study/30`](../../study/30-notifications-and-reflections.md) corollary). Typical
slots, in priority order — skip any slot with nothing new to say:

| Slot | Headline shape | Visual |
| --- | --- | --- |
| Movement | "28 words moved from shaky to held." | Band-shift bar or table excerpt |
| Skill | "Listening moved most — …" | Skill signal sparkline (when a skill is measured) |
| Cause | "…mostly through the two methods sessions you marked sharp." | Method tag breakdown |
| Pattern | "*Ser* and *estar* still alternate." | Confusion pair diagram or error log strip |
| Lever | "Contrast practice would be the highest lever." | Link to UC-051 suggestion surface |

Minimum **one** card (idle week). Maximum **five**. Never pad with generic praise.

## Personal + factual

**Factual:** every clause cites a metric id derivable on `/progress` or the
review log — counts, bands, stability, method tags.

**Personal:** templates interpolate data the account already holds:

- active learning language name;
- learner goal when set ([`UC-019`](../../use-cases/UC-019-learn-for-something-specific.md));
- specific lemmas, methods, or session counts from the week — not "you" + guilt.

Copy is checked against the informational/controlling table in
[`study/08`](../../study/08-motivation.md). No *you haven't*, no streak, no
level percent.

## States

| State | Trigger | Effect |
| --- | --- | --- |
| none | no activity ever | row hidden |
| idle | week with zero reviews | one-card idle reflection |
| ready | ≥1 new fact this week | teaser + unread |
| read | deck dismissed | teaser without unread |

Server derives the deck per request; client only holds `open | closed` for the
deck ([`STATE.md`](../../STATE.md)).

## Data

Reads: review log, vocabulary snapshot, form-mastery signal, method session
tags, goal field, active language — same adapters as [`progress.md`](../page/progress.md).

Writes: `lastSeenReflectionWeek` via httpOnly cookie `sl-reflection-seen`
(`${isoWeek}:${languageCode}`) — **Sensitive**; covered by
`features/progress/weekly-reflection/actions.test.ts`.

## Acceptance criteria

- [ ] Given measurable movement this week, when the row renders, then the teaser
      names at least one specific number.
- [ ] Given the row is tapped, when the deck opens, then card count is between 1
      and 5 inclusive.
- [ ] Given each card, then headline and visual describe the same metric slice.
- [ ] Given an idle week, when the deck opens, then exactly one card appears and
      copy does not invent progress.
- [ ] Given the deck is dismissed, then the unread mark clears until next ISO week.
- [ ] Given any headline, then a controlling rewrite ("you haven't…") would fail
      the copy gate in [`study/08`](../../study/08-motivation.md).

## Open questions

None for v1. Profile-row persistence can follow if cross-device read state is
required later.

## Check

`npm test -- weekly-reflection`
