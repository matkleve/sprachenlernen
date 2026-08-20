# Word detail (inline on Words home)

<!-- id: SPEC-feature-word-detail -->
<!-- use-case: UC-038 -->
<!-- use-case: UC-031 -->
<!-- status: active -->

Inline word detail on `/words` when the learner selects a lemma from the
vocabulary orbit or the **Show list** atlas. Extends
[`orbit-detail-card.md`](../component/orbit-detail-card.md). Pool-local v1.

Content appearances ship separately — see
[`content-traceability.md`](content-traceability.md) § word trace block (T-W8b).

Owner decisions **2026-08-17:** inline only (no route); `/words` entry points
only; suspend **and** retire; schedule line **with grade context**.

## Scope

- **In:** `OrbitDetailCard`, `VocabularyOrbitField`, `OrbitListPopover`,
  `lib/schedule-reason.ts`, `lib/db/task-lifecycle.ts`,
  `features/words/actions.ts`; meaning-recall tasks only (same filter as the
  Words atlas).
- **Out:** review-session entry; **content trace block** (T-W8b —
  [`content-traceability.md`](content-traceability.md)); unsuspend UI
  when the word is not on screen (suspended words are omitted from the atlas);
  form-recall tasks.

**Reuse: `Button`, `Chip`** — lifecycle actions and status.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a word on the orbit or a row in **Show list** | Inline card shows lemma, translation, rank, frequency **block** (1–1000 / 1001–2000), stability, bucket chip, and a **schedule line with context** |
| 2 | Word never reviewed (`new`) | Schedule line says not reviewed yet; **Retire** offered; **Suspend** hidden |
| 3 | Word reviewed, not suspended/retired | Schedule line names days until due and last grade; **Suspend** and **Retire** offered |
| 4 | Taps **Suspend** | Task moves to `suspended`; `review_log` unchanged; page refreshes; word disappears from atlas/orbit |
| 5 | Taps **Retire** | Task moves to `retired`; `review_log` unchanged; page refreshes; word disappears from atlas/orbit |
| 6 | Taps an aggregate orbit segment | Aggregate card unchanged — no lifecycle actions |
| 7 | Lifecycle write fails | Inline error on the card; selection kept |

Learner-initiated **retire from `new`** writes `task_state` without a
`review_log` row. Other transitions use scheduler `suspend` / `retire` on the
materialized task.

Every `task_state` write from this surface is filtered on **both** `user_id`
and `task_id` (BACKEND.md §4). `task_id` is a shared string — the same
`es:haber:meaning-recall` exists in every learner's deck — so the account is
not implied by it, and the adapter takes an injectable client that may not
carry a policy.

## States

Client-local selection in `VocabularyOrbitField`. Lifecycle buttons use
`useTransition` + server action; no separate page machine.

## Acceptance criteria

- [ ] Given a reviewed word segment, when the card renders, then the schedule
      line includes both time-to-due and the last grade label (e.g. „… because
      you last chose Good“).
- [ ] Given a `new` word, when the card renders, then **Retire** is available and
      **Suspend** is not shown.
- [ ] Given a successful **Suspend**, when the page reloads, then the word no
      longer appears in the orbit or list.
- [ ] Given a successful **Retire** on a never-reviewed word, when the page
      reloads, then the word no longer appears and prior review history (empty)
      is unchanged.
- [ ] Given **Show list**, when the learner activates a row, then the same inline
      card appears as for an orbit tap.

## Check

`npm test -- schedule-reason task-lifecycle orbit-detail words`
