# Study format

A **study** is a **reasoning document**: it explains *why* the product is shaped
as it is and *why* certain directions were chosen. It is **not** an
implementation contract.

Normative hierarchy when documents disagree:

1. [`CONSTITUTION.md`](CONSTITUTION.md)
2. [`specs/`](specs/)
3. [`use-cases/`](use-cases/)
4. **`study/`** (reasoning — update when specs change)
5. [`diary/`](diary/) (what happened — not a rulebook)

Read [`study/README.md`](study/README.md) for the thirteen core theses. Every
study chapter either elaborates one of those theses or supports a use case that
does.

---

## What belongs in `study/`

| Belongs | Does not belong |
| --- | --- |
| Evidence grades `[A]`–`[D]` | Acceptance criteria (`Given … when … then`) |
| Product sentences and trade-offs | State tables, behaviour matrices |
| What we reject and why | `shall`, component APIs, wireframes as build plans |
| Links to specs and use cases | `⚠ SPEC GAP` (gaps live in the spec or use case) |
| Open questions **as pointers** to `IMPLEMENTATION-PLAN` | Feature queue (F-numbers), shipped status, task IDs |

**Rule:** if an agent could write code directly from the document, it is not a
study.

---

## IDs and paths

| Kind | Path | ID pattern |
| --- | --- | --- |
| Study chapter | `docs/study/STUDY-NNN-slug.md` | `STUDY-001` … |
| Bibliography | `docs/study/STUDY-sources.md` | `STUDY-sources` |
| Archived bridge | `docs/study/archive/ARCH-NNN-slug.md` | `ARCH-043` … |
| Design review | `docs/reviews/design/DR-NNN-slug.md` | `DR-028` … |
| Exploration | `docs/explorations/EXP-NNN-slug.md` | `EXP-035` … |
| QA report | `docs/qa/QA-NNN-slug.md` | `QA-031` … |
| Backlog artefact | `docs/backlog/BL-NNN-slug.md` | `BL-009` … |

One ID, one file. Renumbering uses a new ID; old paths are listed in
[`study/MIGRATION-MAP.md`](study/MIGRATION-MAP.md).

---

## Frontmatter (required)

```markdown
<!-- id: STUDY-004 -->
<!-- type: reasoning | correction | antipattern | bibliography | archived-bridge -->
<!-- status: active | superseded | archived -->
<!-- supersedes: STUDY-005 (optional) -->
<!-- corrected-by: STUDY-013 (optional) -->
<!-- spawns: UC-005, UC-006 (optional) -->
```

Design reviews, explorations, and QA reports use their own ID prefix (`DR-`,
`EXP-`, `QA-`, `BL-`) with `<!-- type: design-review | exploration | qa | backlog -->`.

---

## Chapter skeleton

````markdown
# <Title>

<!-- frontmatter -->

## Thesis

One sentence: which product decision this chapter carries.

## Evidence

Findings marked `[A]`–`[D]`. Only what has a product consequence.

## Product consequences

What follows — in prose, not as a spec.

## What we reject

Alternatives and why. Link to [`STUDY-009-antipatterns.md`](study/STUDY-009-antipatterns.md) when relevant.

## Open questions

Pointers only — `IMPLEMENTATION-PLAN`, a use case, or a spec gap elsewhere.
Never decide here.

## Related

Specs, use cases, correcting chapters.
````

Correction chapters (`<!-- type: correction -->`) add `<!-- corrected-by: … -->`
on the chapter they amend. The amended chapter links forward; the correction
links back.

---

## For agents

| Question | Read |
| --- | --- |
| Why does this exist? | `study/` |
| What must be built? | `specs/` |
| What is queued next? | `IMPLEMENTATION-PLAN.md` |
| UX designer input | `reviews/design/` |
| Brainstorm, not binding | `explorations/` |

Implement **only** from specs. If study and spec disagree, the spec wins —
update the study in the same session.

Validated by `npm run check:study`.
