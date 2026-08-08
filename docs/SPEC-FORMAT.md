# Spec format

A spec is an **implementation contract**: it says what must be true, in enough
detail that two different implementers would build the same behavior, and a
reviewer can tell whether they did.

Scaffold one with `npm run new:spec` — it writes the skeleton below and
registers the ID. Structure and size are enforced by `npm run check:specs`.

---

## Naming and IDs

| Kind | Path | ID |
| --- | --- | --- |
| Use case | `docs/use-cases/UC-NNN-slug.md` | `UC-004` |
| Feature spec | `docs/specs/feature/slug.md` | `SPEC-feature-slug` |
| Component spec | `docs/specs/component/slug.md` | `SPEC-component-slug` |
| Page spec | `docs/specs/page/slug.md` | `SPEC-page-slug` |
| Service spec | `docs/specs/service/slug.md` | `SPEC-service-slug` |

Every spec declares the use case it serves. Every use case links the specs that
implement it. `check:specs` fails on a broken link in either direction — that
two-way link is the traceability chain, and it is the only thing that tells you
what breaks when a requirement changes.

---

## Size

- **150 lines warn, 180 lines error** for a spec.
- Over the cap → split. Move the long part into a sibling file and link it:
  `slug.acceptance-criteria.md`, `slug.states.md`, `slug.supplement.md`.
- Never duplicate a normative sentence in two files. One owner per rule. If you
  find yourself pasting, you found a missing parent.

A spec nobody finishes reading is not a contract.

---

## The skeleton

````markdown
# <Title>

<!-- id: SPEC-component-example -->
<!-- use-case: UC-001 -->
<!-- status: draft | active | superseded -->

One or two plain sentences: what this is and who it is for.

## Scope

- **In:** …
- **Out:** … (the things a reader would reasonably assume are included)

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | … | … |

## States

| State | Trigger | Visual / behavioral effect | Terminal? |
| --- | --- | --- | --- |
| idle | initial | … | no |

Loading, error and empty are **mutually exclusive** and each has exactly one
owner. If two of them can be true at once, the table is wrong.

## Data

What it reads and writes. Shape, source, and who owns each field.

## Acceptance criteria

- [ ] Given …, when …, then …
- [ ] When …, the … shall …

## Check

`npm test -- example` — the named runnable check that exercises the criteria above.
````

Sections you don't need, delete. An empty heading is worse than a missing one:
it reads as "considered and found to be nothing" when it means "not thought
about".

---

## When the spec cannot answer the question

Do not invent a domain rule to keep moving. Stop and emit exactly:

```
⚠ SPEC GAP: <what is ambiguous, and what you need decided>
```

One line, that exact prefix, so it is greppable and impossible to skim past.
Then wait — or continue with the parts that do not depend on the answer, saying
which those are.

Use it when ownership is unclear (two things could reasonably hold this state),
when a name has no canonical form in [`GLOSSARY.md`](GLOSSARY.md), or when the
behavior in an edge case is genuinely undecided rather than merely unwritten.

A guessed rule that happens to be right is worse than a gap: it enters the
codebase with the authority of a decision nobody made, and the next person
builds on it.

---

## What makes a spec good

**Behavior, not implementation.** "The list scrolls to the selected row" is a
contract. "Call `scrollIntoView`" is a note about today's code.

**Say what must *not* happen.** Most bugs live in the negative space: not "shows
B's data" but "shows B's data *and no residue of A*". Not "saves on submit" but
"saves once, even on a double-click".

**Name the terminal states.** For anything with a lifecycle, "which states can
never be left" is the sentence that prevents re-running finished work.

**Write the out-of-scope list.** It is the cheapest thing in the document and it
prevents the most rework, because it catches the assumption gap before code.

**Update it when the user corrects you** — in the same session, before you write
the fix. A spec that lags behind the code has stopped being a contract and
become a rumor.
