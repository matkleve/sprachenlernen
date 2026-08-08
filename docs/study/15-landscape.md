# 15 · The landscape: what others have already solved

An honesty chapter. [01](01-duolingo.md) compares against Duolingo because that
is the benchmark for reach — but Duolingo is not the competition for what is
being built here. The competition is a handful of smaller tools that have
**already implemented** parts of our core idea.

Anyone who does not look this up believes their idea is newer than it is, and
expensively rebuilds the known.

---

## The field

| Tool | Core idea | What it means for us |
| --- | --- | --- |
| **Anki** | SM-2/FSRS, fully configurable, build everything yourself | The benchmark for scheduling. Its failure is the barrier to entry, not the algorithm ([01](01-duolingo.md), S3) |
| **LingQ** | Read texts, mark unknown words, **known-word counter** as the progress measure | **The largest overlap.** "Vocabulary size as a progress display" has been central there for years |
| **Migaku** | Mine words from Netflix/YouTube, own cards, integrated SRS, known/unknown word marking | Already implements the input → cards coupling |
| **Language Reactor** | Dual subtitles, popup dictionary, word status in video | Already implements tap-to-translate in video |
| **Clozemaster** | Cloze sentences from corpora, frequency-ordered, gamified | Already implements frequency-ordered contextual practice |
| **Glossika** | Mass sentence shadowing with spaced repetition | The chunk approach from [16](16-further-findings.md), carried through consistently |
| **Pimsleur** | Purely auditory, spaced prompting, hands-free | The screen-free scenario from [05](05-input-reading-listening.md), for decades |
| **Babbel / Busuu** | Course-based, CEFR-aligned, with native-speaker correction (Busuu) | The "serious" middle. Efficacy below |
| **italki / Tandem** | Actual humans | What no app replaces — and what [07](07-offline-and-paper.md), Ü5 aims to prepare for rather than replace |

---

## What this changes about our theses

Three corrections that belong priced into [09](09-feature-catalogue.md) and
[11](11-roadmap-open-questions.md):

### K1 · "Coverage-based text selection" is not new **[correction]**

LingQ and Migaku work from a known-word inventory and colour texts accordingly.
Our difference is narrower than [05](05-input-reading-listening.md) claimed — it
lies not in the principle but in three details:

- a **coverage figure before opening** as a selection criterion, rather than
  colouring during reading;
- the feedback that texts containing **recently learned cards** are preferred;
- that coverage feeds a **level model** rather than only a count.

That is still a difference, but it is a refinement, not an invention. The
sentence "nobody else does this" is struck.

### K2 · "Vocabulary size as progress" exists — the honesty around it does not

LingQ counts known words, and the figure is famously generous: it counts word
forms, rests on self-assessment, and can only go up. Precisely the three points
[03](03-level-model.md) formulates its honesty rules against (stability rather
than sighting, lemmas rather than forms, may fall).

**That is the actual positioning:** not "we count your vocabulary" but "we count
it in a way that makes the number mean something".

### K3 · The combination is the difference, not the parts

Every element of this study exists somewhere. What exists nowhere:

```
   SRS  ──visible──►  level model  ──selects──►  input  ──produces──►  SRS
                            ▲                                    │
                            └──────────── measures ──────────────┘
```

Anki has scheduling without content. LingQ has content without real scheduling.
Migaku has both but no competence measurement. Duolingo has a path and no
measurement. **The closed loop is the thesis** — and theses of this kind rarely
fail on the concept and usually fail because each ring individually is worse than
the specialist tool.

That is this project's real principal risk, and it appears nowhere else in the
study.

---

## What efficacy research says about the competitors **[C]**

A comparative analysis (2023) placed the efficacy studies of Babbel, Busuu and
Duolingo side by side:

| | Finding |
| --- | --- |
| **Busuu** | Ahead — the most comprehensive results for reading/grammar **and** oral competence, thanks to study design and controlled variables |
| **Duolingo** | Higher scores on receptive skills, but second because of study design and uncontrolled study time and prior knowledge |
| **Babbel** | Weakest — most learners did not get past beginner level despite a longer study duration |

Two lessons, and the second matters more:

1. Busuu's lead rests on **production with human correction** being part of the
   product. That supports [06](06-production.md) — and it is the most expensive
   part for an LLM to replace, with the known caveats
   ([02](02-evidence.md), E10).
2. The ranking says almost as much about **study quality** as about products. The
   comparison is only as good as the weakest study in it, and all three are
   vendor studies. Treat the table as an indication, not a result
   ([02](02-evidence.md), E12).

---

## Where we will lose to the specialists

For honesty, because it affects the roadmap:

| Against | We lose on |
| --- | --- |
| **Anki** | Configurability, plugin ecosystem, card-type freedom. Deliberately — A11 |
| **Language Reactor / Migaku** | Real content (Netflix, YouTube). We have generated material; they have what people actually want to watch |
| **Pimsleur** | A mature, professionally produced audio course. Stage 4 is our hardest part; it is their product |
| **italki** | Real humans. Not catchable, and not a goal |

The consequence for [11](11-roadmap-open-questions.md): **stage 4 (listening) is
where we compete against established specialists**, while stages 1–2 (a
glass-walled scheduler, an honest level model) are the field where nobody
seriously stands. That is an additional argument for the chosen order — and an
argument for answering the content question (question 6) before building stage 4.

---

## What is missing

This overview rests on product descriptions and comparison articles, not on
first-hand use. Before any roadmap decision that builds on K1 or K3, LingQ and
Migaku deserve **a week of actual use** — not reading. A feature list says
nothing about how a closed loop feels when it is half closed.
