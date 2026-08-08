# Sprachenlernen

A language-learning app built on evidence rather than on engagement metrics.
Next.js 15 · React 19 · TypeScript · Tailwind v4.

Built from [Grundriss](https://github.com/matkleve/grundriss), so the
specification is the source of truth and the code implements it.

```bash
npm install
npm run dev       # http://localhost:3000
npm run verify    # the gate: types, lint, specs, tokens, contrast, tests, build
```

---

## The idea in one paragraph

Duolingo solved the behaviour problem — people come back every day — and left
the learning problem open, because what it optimises is *return*, not
competence. This project keeps the behaviour lessons (near-zero entry cost,
short sessions with a visible end, decisions made for you) and attaches the
reward to **measured competence** instead of activity.

Three things follow, and they are the whole product:

1. **A level you can believe.** Per skill, in CEFR sub-levels (`A1.1` … `C2.4`),
   computed from actual review data — vocabulary size, recall stability,
   automatisation — not from course position. It can go down, it shows its
   uncertainty, and every number opens to reveal how it was derived.
2. **A scheduler you can see into.** FSRS, with the memory model on screen: why
   this card now, what each answer does to the next interval, what the next 30
   days look like and what causes the peaks.
3. **Input chosen by coverage, not by label.** Texts and audio are selected so
   that *this* learner knows 95–98 % of the words, computed from their own
   vocabulary. Reading and listening feed the cards; the cards decide what to
   read next.

Plus the parts that do not happen on a phone: dictation, handwriting, form
drills — generated from your own weak spots, and fed back in when you are done.

**The full reasoning, the evidence and the rejected alternatives are in
[`docs/studie/`](docs/studie/)** (German). Start with the five theses in
[`docs/studie/README.md`](docs/studie/README.md).

---

## Status

Study and repository setup. **No feature code yet** — what is in `app/`,
`components/ui/` and `features/` is the Grundriss starter's worked example and
its primitives, kept until this project's own features replace them.

| Next | Where |
| --- | --- |
| Answer the blocking questions (audience, language pair, web vs. native, data model) | [`docs/studie/11-roadmap-offene-fragen.md`](docs/studie/11-roadmap-offene-fragen.md) |
| Turn UC-004 … UC-026 into specs, in roadmap-stage order | [`docs/use-cases/`](docs/use-cases/) → [`docs/SPEC-FORMAT.md`](docs/SPEC-FORMAT.md) |
| ADR for the Word/Task data model | [`docs/adr/`](docs/adr/) |

---

## Layout

```
app/                routes only — page, layout, loading, error. Thin.
app/globals.css     design tokens. The single source of truth for values.
features/<name>/    one folder per feature: components, hooks, content, tests.
components/ui/      primitives used by ≥2 features.
lib/                framework-free helpers.
docs/studie/        the research this product is derived from  ← read this first
docs/               the process — start at docs/README.md
scripts/            the gates behind `npm run verify`
.claude/            skills and the reviewer agent
```

---

## Working here

Read [`AGENTS.md`](AGENTS.md) first — it is the contract for every agent and
every human, and it is deliberately short. Everything else is linked from it and
loads when the task touches it.

Two rules from the study are strong enough that they are candidates for
[`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) rather than guidance:

> **What gets displayed gets optimised.** So only what is useful to optimise may
> be displayed prominently.

> **No progress figure without a derivation the user can open.**

Language: the study is German because it is read and argued with; code, specs
and identifiers are English. [`docs/GLOSSARY.md`](docs/GLOSSARY.md) carries both
columns so a term cannot be built twice under two names.
