# UC-065 — Know what went wrong and what to do next

<!-- id: UC-065 -->
<!-- specs: SPEC-service-errors, SPEC-component-error-callout -->

**Who:** anyone using the product — signing up, practising, or waiting on
something that takes time.
**Wants to:** when something fails, understand what happened in plain language
and what they can try next.
**So that:** they can recover or abandon with a reason, instead of staring at a
blank screen or a sentence that tells them nothing.

Derived from [`../CONSTITUTION.md`](../CONSTITUTION.md) §4 (no silent failure)
and the opposite of the industry default: *"Error: An error occurred."*

## Today

Failures surface in three broken ways:

1. **Generic wrapper text** — *"An error occurred"*, *"Something went wrong"* —
   with no subject, no verb, and no next step. The user knows only that the app
   failed, not whether to retry, sign in again, fix their input, or wait.
2. **Raw upstream text** — a database or API message meant for engineers, shown
   in the UI because nobody mapped it. Sometimes helpful by accident; often
   frightening or meaningless.
3. **Silence** — a spinner that stops, a button that does nothing, a chat bubble
   that never arrives. [`UC-002`](UC-002-fill-in-a-form-without-getting-stuck.md)
   fixed the form-field half of this; everything else is still ad hoc.

Each pattern costs abandonment. A learner who cannot tell whether the failure is
theirs, the network's, or the app's will not retry — and a retry that would have
worked is indistinguishable from one that would not.

## Success looks like

- Every failure the user can see carries **three things**: what went wrong (in
  words they can act on), what to try next (when there is one), and a **reference
  id** they can quote if they ask for help.
- The message names **what they were trying to do** — *"Could not send your
  answer"*, not *"Error"*.
- Generic placeholders are **forbidden** in user-facing copy. If the product does
  not yet know a better sentence, it says that honestly and still gives a
  reference id — never *"An error occurred."*
- Field validation errors stay on the field ([`UC-002`](UC-002-fill-in-a-form-without-getting-stuck.md));
  page- and session-level failures use the shared error surface
  ([`SPEC-component-error-callout`](../specs/component/error-callout.md)).
- A failure that blocks the whole surface replaces the happy path — loading,
  content and error are **mutually exclusive** on that surface
  ([`DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md)).
- Retry, when offered, repeats the same action the user already took — the app
  does not make them navigate away and guess how to get back.

## Out of scope

- Whether the user can fix the underlying bug (that is engineering).
- [`UC-023`](UC-023-report-something-wrong.md) — reporting wrong *content* in a
  lesson, not a software failure.
- Translated error copy (English ships first; see [`I18N.md`](../I18N.md)).
- Third-party crash reporting (Sentry, etc.) — the contract here is what the app
  itself records and shows; wiring an external sink is a later ops decision.
