# Constitution

The rules that outrank everything else, including a direct instruction to
violate them. If a task can only be done by breaking one of these, the task is
wrong — stop and say so.

Everything else in `docs/` is guidance and can be argued with. This file cannot.
Amending it is a deliberate act: open a PR that changes only this file and says
what changed and why.

---

## 1. Correctness is not negotiable for speed

A feature that is late is a scheduling problem. A feature that silently
corrupts, loses, or leaks data is a different category of event. When those two
trade against each other, correctness wins — every time, without asking.

## 2. The user's data belongs to the user

- Nothing is collected that the product does not need to work.
- Nothing leaves the client that the user did not ask to send.
- Deletion means deletion, not a hidden flag.
- No third-party script gets access to user input by default.

## 3. Accessibility is a requirement, not a phase

Every interactive element is reachable and operable by keyboard, has a visible
focus state, and has an accessible name. Body text meets WCAG AA contrast. This
is checked by `npm run verify` and it is not waivable for a deadline — an
inaccessible feature is an unfinished feature.

## 4. No silent failure

Every failure is visible to someone: the user (an error state they can act on),
or the developer (a thrown error, a failing test). An empty `catch` is a bug.
Swallowing an error to make a red state go away is a bug that will cost ten
times more later.

## 5. The smallest change that removes the cause

Prefer fixing the cause over adding a guard. Prefer one line over a refactor.
Changing composition when the ask was about dimensions is scope creep, even when
the result is nicer. When you genuinely need the bigger change, say so and get
agreement first.

## 6. Nothing ships that nobody can explain

If you cannot say why a change works — not just that it does — it is not ready.
"It fixed itself after I changed this" means the cause is still there.
Cargo-culted code, copied fixes and try-until-green are how a codebase becomes
unmaintainable while every individual commit looks fine.

## 7. Leave the campsite readable

Delete what you replaced. Comment the non-obvious *why*. When you deliberately
remove something someone might restore, leave a note where it used to be —
otherwise the next agent will helpfully bring the bug back.
