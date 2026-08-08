# Diary

Short-term memory across sessions. One file per day, `YYYY-MM-DD.md`.

An agent starts every session knowing nothing about the last one. Specs say what
the system *should* do; they deliberately do not record what was tried, what was
rejected, or what the user corrected on Tuesday. Without that, the same wrong
turn gets taken again — and the second time nobody recognises it, because it
looks like a fresh idea.

**Before resuming work in an area, read the most recent entry that touches it.**

## What goes in

- **What shipped**, in one table or a few bullets.
- **Decisions and what they rule out.** Especially the alternative that lost.
- **Corrections from the user**, in their words. These are invariant updates and
  they are the highest-value line in any entry.
- **What went wrong and why it was not obvious.** Failure to diagnose, not just
  failure to fix.
- **Open threads** — what the next session should pick up, and what is blocked.

## What does not

- Anything normative. A rule belongs in a spec, in `AGENTS.md`, or in
  [`AGENT-PITFALLS.md`](../AGENT-PITFALLS.md) — somewhere a reader is *required*
  to look. A rule that lives only in a diary entry will be missed.
- A changelog of every file touched. `git log` already does that, better.

The diary is where a lesson is **noticed**. If it will recur, promote it the
same session: a code trap to [`TRAPS.md`](../TRAPS.md), a collaboration failure
to [`AGENT-PITFALLS.md`](../AGENT-PITFALLS.md), a behavior change to the spec.
The entry then records that you promoted it.

## Format

```markdown
# YYYY-MM-DD — <area worked on>

## Shipped

- …

## Decisions

- **<decision>** — chose X over Y because … . Rules out: … .

## Corrections

- User: "<the sentence>" → what it invalidated, what changed.

## Went wrong

- <symptom> looked like <wrong cause>; was actually <real cause>.
  The check that would have caught it: … .
  → promoted to TRAPS.md / AGENT-PITFALLS.md / the spec.

## Open

- …
```

## Rules

- **Append, never rewrite.** A past entry that turned out to be wrong stays, and
  the correction goes in a later entry. Editing history to look consistent
  destroys the one thing that makes the log worth reading.
- **Entries are not deleted**, even when the code they describe is gone.
- **Skip the day if nothing was learned.** A diary of empty entries teaches
  people to stop opening it.
