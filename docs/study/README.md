# Study: Language learning

Why this app is being built, what the research says, and what follows from that
in product direction.

**This folder is reasoning only — not a spec.** A spec says *what gets built*;
study says *why that and not something else*. Where study and a spec disagree,
**the spec wins** — update the study paragraph in the same session.

Format: [`STUDY-FORMAT.md`](../STUDY-FORMAT.md). Old paths:
[`MIGRATION-MAP.md`](MIGRATION-MAP.md).

| Read for | Folder |
| --- | --- |
| Why / trade-offs | **`study/`** (here) |
| What to build | [`specs/`](../specs/) |
| What's queued | [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) |
| UX designer input | [`reviews/design/`](../reviews/design/) |
| Brainstorms | [`explorations/`](../explorations/) |
| Test reports | [`qa/`](../qa/) |
| Feature inventory (historical) | [`backlog/`](../backlog/) |

---

## The thirteen core theses

If you have five minutes, read only this table.

| # | Thesis | Chapter |
| --- | --- | --- |
| **1** | Duolingo's problem is not gamification but **what it optimises for**: daily return rather than language competence. | [STUDY-008](STUDY-008-motivation.md) |
| **2** | Repetition is a solved problem — but only if the learner **trusts** the schedule. Trust comes from visibility, not from accuracy. | [STUDY-004](STUDY-004-flashcards-srs.md) |
| **3** | Flashcards build **knowledge about** words. Fluency comes only from volume of comprehensible input. Both are needed; neither substitutes for the other. | [STUDY-005](STUDY-005-input-reading-listening.md) |
| **4** | "Level A2" is not a number but a bundle of four skills at very different heights. A single progress bar lies. | [STUDY-003](STUDY-003-level-model.md) |
| **5** | The most effective exercises are uncomfortable and partly not on a phone: dictation, handwriting, free production. | [STUDY-007](STUDY-007-offline-and-paper.md) |
| **6** | What feels good while practising is often what works least — and the reverse. | [STUDY-010](STUDY-010-method-cards.md) |
| **7** | The pronunciation problem starts in the ear, not the mouth. | [STUDY-011](STUDY-011-pronunciation-perception.md) |
| **8** | Learners get a **compass** everywhere; nobody gives them a **map**. | [STUDY-017](STUDY-017-milestones-and-map.md) |
| **9** | No app makes anyone fluent — the catalogue includes what happens **outside** the app. | [STUDY-010](STUDY-010-method-cards.md) |
| **10** | Apps avoid hard methods because engagement metrics punish them; a method you **cannot perform now** has effect zero. | [STUDY-019](STUDY-019-method-catalogue-and-context.md) |
| **11** | Input is the precondition, speaking is the goal — different positions in one chain. | [STUDY-022](STUDY-022-speaking-as-the-goal.md) |
| **12** | "This doesn't feel productive" is a **measurement, not a mood**. | [STUDY-023](STUDY-023-why-it-does-not-feel-productive.md) |
| **13** | **The learner chooses the method; the app chooses what goes inside it.** Gating produces delay; targeting produces practice. | [STUDY-024](STUDY-024-readiness-and-difficulty.md) |

---

## Chapters (STUDY-001 … STUDY-027)

| ID | Answers |
| --- | --- |
| [STUDY-001](STUDY-001-duolingo.md) | Duolingo: what works, what does not, and why |
| [STUDY-002](STUDY-002-evidence.md) | What learning research supports — effect size and confidence |
| [STUDY-003](STUDY-003-level-model.md) | CEFR, sub-levels, measuring level honestly |
| [STUDY-004](STUDY-004-flashcards-srs.md) | FSRS, card types, glass-walled schedule |
| [STUDY-005](STUDY-005-input-reading-listening.md) | Reading and listening input |
| [STUDY-006](STUDY-006-production.md) | Speaking, writing, tutor limits |
| [STUDY-007](STUDY-007-offline-and-paper.md) | Dictation, handwriting, paper drills |
| [STUDY-008](STUDY-008-motivation.md) | Motivation without self-sabotage |
| [STUDY-009](STUDY-009-antipatterns.md) | What we deliberately do **not** build |
| [STUDY-010](STUDY-010-method-cards.md) | Daily method choice, two ledgers |
| [STUDY-011](STUDY-011-pronunciation-perception.md) | HVPT and perception-first pronunciation |
| [STUDY-012](STUDY-012-accessibility.md) | Dyslexia, hearing, vision — calculation not display |
| [STUDY-013](STUDY-013-landscape.md) | Anki, LingQ, Migaku — corrects STUDY-005 |
| [STUDY-014](STUDY-014-further-findings.md) | Learning-styles myth, chunks, sleep |
| [STUDY-015](STUDY-015-own-content.md) | Podcasts, uploads, simplification |
| [STUDY-016](STUDY-016-language-kit.md) | Any language: code vs data, quality tiers |
| [STUDY-017](STUDY-017-milestones-and-map.md) | Vocabulary blocks and the map surface |
| [STUDY-018](STUDY-018-speaking-and-sentences.md) | Speaking practice without AI at the core |
| [STUDY-019](STUDY-019-method-catalogue-and-context.md) | Catalogue, context filter, hard methods |
| [STUDY-020](STUDY-020-visual-design.md) | Visual constraints — not a game palette |
| [STUDY-021](STUDY-021-how-an-exercise-runs.md) | Prepare, do, wait, check, decide |
| [STUDY-022](STUDY-022-speaking-as-the-goal.md) | Speaking as headline without corrupting measurement |
| [STUDY-023](STUDY-023-why-it-does-not-feel-productive.md) | Productivity feeling — illusion vs real defect |
| [STUDY-024](STUDY-024-readiness-and-difficulty.md) | Targeting not gating; who decides difficulty |
| [STUDY-025](STUDY-025-method-badges.md) | Skill, evidence, effort badges |
| [STUDY-026](STUDY-026-notifications-and-reflections.md) | Weekly digests without guilt |
| [STUDY-027](STUDY-027-material-units-and-listening-defer.md) | Material units and listening defer |
| [STUDY-028](STUDY-028-irregular-borders.md) | Scalable rough borders — SVG, masks, Rough.js, trade-offs |
| [STUDY-029](STUDY-029-progressive-textures.md) | Progressive surface textures — grain, lighting, blend stacks |
| [STUDY-sources](STUDY-sources.md) | Literature — how far each was checked |

**Correction chapters** (read after the chapter they amend): STUDY-013 →
STUDY-005; STUDY-016 → BL-011; STUDY-022 → STUDY-019; STUDY-023 → STUDY-008;
STUDY-024 → STUDY-002.

**Archived bridges** (graduated into specs — history only):
[`archive/`](archive/).

---

## Evidence grades

| Mark | Means |
| --- | --- |
| **[A]** | Replicated, meta-analyses, effect outside the lab |
| **[B]** | Well supported, with limits |
| **[C]** | Plausible, thinly evidenced or contested |
| **[D]** | Product decision — justified differently, changeable without new studies |

A **[D]** is not worse than an **[A]** — the mistake is selling it as an **[A]**.

Validated by `npm run check:study`.
