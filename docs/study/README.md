# Study: Language learning

Why this app is being built, what the research says about it, and what follows
from that in features.

This study is **not a spec**. It is the reasoning layer underneath one: it
collects evidence, weighs it, and derives product decisions. A spec says *what
gets built*; this study says *why that and not something else*. Where a spec and
this study disagree, the spec wins — but then a paragraph here needs changing,
and it needs to say why.

---

## The thirteen core theses

Everything else hangs off these thirteen sentences. If you have five minutes, read
only this table.

| # | Thesis | Follows from it |
| --- | --- | --- |
| **1** | Duolingo's problem is not gamification but **what it optimises for**: daily return rather than language competence. | Progress is shown as measured competence, never as activity. → [08](08-motivation.md) |
| **2** | Repetition is a solved problem — but only if the learner **trusts** the schedule. Trust comes from visibility, not from accuracy. | The scheduler is a visible surface, not a black box. → [04](04-flashcards-srs.md) |
| **3** | Flashcards build **knowledge about** words. Fluency comes only from volume of comprehensible input. Both are needed; neither substitutes for the other. | Two equal pillars: SRS **and** reading/listening. → [05](05-input-reading-listening.md) |
| **4** | "Level A2" is not a number but a bundle of four skills at very different heights. A single progress bar lies. | A level model with sub-levels **per skill**, plus an honest overall figure. → [03](03-level-model.md) |
| **5** | The most effective exercises are uncomfortable and partly not on a phone: dictation, handwriting, free production. | The app also plans offline exercises and takes their results back in. → [07](07-offline-and-paper.md) |
| **6** | What feels good while practising is often what works least — and the reverse. Learners believe the wrong thing works, even after experiencing evidence against it. | Preference and measured effect are **two separate ledgers**. Preference governs form; effect governs selection. → [12](12-method-cards.md) |
| **7** | The pronunciation problem starts in the ear, not the mouth. Perception training is cheap, very well evidenced — and it carries over into production. | HVPT as its own method, instead of grading pronunciation automatically. → [13](13-pronunciation-perception.md) |
| **8** | Learners are given a **compass** everywhere — direction, progress, keep going. Nobody gives them a **map**: where am I, what is reachable from here, what did the last month open up. | The map is a primary surface, and every display names the next one. → [19](19-milestones-and-map.md) |
| **9** | No app makes anyone fluent. The method catalogue therefore also contains what happens **outside** the app — proposed, prepared, debriefed, but not measured. | Methods beyond the app, held in place by a floor rather than an effect estimate. → [12](12-method-cards.md) |
| **10** | Apps avoid the hard methods not out of ignorance but because slow, error-rich and unmeasurable lower every engagement metric. And: a perfect method you **cannot perform right now** has an effect of zero. | The catalogue contains precisely the hard methods, and **context filters before everything else**. → [21](21-method-catalogue-and-context.md) |
| **11** | Input is the precondition, speaking is the goal — not competing priorities but different positions in one chain. The goal decides what is **foregrounded**, never what is **true**. | Speaking leads the headline and raises the floors; the measurement and the level formula stay untouched. → [24](24-speaking-as-the-goal.md) |
| **12** | "This doesn't feel productive" is a **measurement, not a mood**. It is wrong when the practice was hard, and right when the app never let you use the language for anything. Treating either case as the other is how products fail. | An honest denominator for the time spent, real use offered every week at a floor — and the desirable-difficulty argument only in the one case where it is not an excuse. → [25](25-why-it-does-not-feel-productive.md) |
| **13** | **The learner chooses the method; the app chooses what goes inside it.** A form nobody may skip is an argument for putting it in front of them, never for making them wait — gating produces delay where targeting produces practice. | No method is ever locked, and difficulty is a consequence of what the learner holds rather than a control anybody sets. → [26](26-readiness-and-difficulty.md) |

---

## Structure

| Chapter | Answers |
| --- | --- |
| [01 · Duolingo](01-duolingo.md) | What actually works there, what does not, and why — including the strengths worth copying |
| [02 · Evidence](02-evidence.md) | What learning research supports, sorted by effect size and confidence |
| [03 · Level model](03-level-model.md) | CEFR, sub-levels, how to *measure* a level rather than assert one, and the "am I getting better?" comparison |
| [04 · Flashcards & SRS](04-flashcards-srs.md) | FSRS over SM-2, card types, and the glass-walled schedule |
| [05 · Input: reading & listening](05-input-reading-listening.md) | Audiobooks, voice commands, tap-to-translate, short texts at your level |
| [06 · Production](06-production.md) | Speaking and writing, the LLM tutor, and the limits of pronunciation feedback |
| [07 · Offline & paper](07-offline-and-paper.md) | Dictation, handwriting, conjugation and comparison drills |
| [08 · Motivation](08-motivation.md) | Gamification that does not work against the learning |
| [09 · Feature catalogue](09-feature-catalogue.md) | Every idea, with evidence grade, effort and verdict |
| [10 · Anti-patterns](10-antipatterns.md) | What we deliberately do **not** build, and what that costs |
| [11 · Roadmap & open questions](11-roadmap-open-questions.md) | Order, the first version's cut, and what you have to decide |
| [12 · Method cards](12-method-cards.md) | Daily method choice, thumbs up/down, and why the thumb alone breaks the system |
| [13 · Pronunciation & perception](13-pronunciation-perception.md) | HVPT — the strongest single method here, and the one almost no app implements |
| [14 · Accessibility](14-accessibility.md) | Dyslexia, hearing, vision — and why this is a calculation problem, not a display one |
| [15 · The landscape](15-landscape.md) | Anki, LingQ, Migaku, Busuu & co — what exists, and which of our theses that corrects |
| [16 · Further findings](16-further-findings.md) | The learning-styles myth, chunks, sleep, and the ideal versus the ought-to self |
| [17 · Own content](17-own-content.md) | Podcasts, uploaded texts, simplification — and where I would build two of the ideas differently |
| [18 · The language kit](18-language-kit.md) | Any language: what is code, what is data, and the honest quality tier |
| [19 · Milestones & map](19-milestones-and-map.md) | Vocabulary in blocks, and the surface that shows how it all connects |
| [20 · Speaking & sentences](20-speaking-and-sentences.md) | What makes speaking practice work — and that the core of it needs no AI |
| [21 · Method catalogue & context](21-method-catalogue-and-context.md) | The catalogue itself, why apps avoid the hard methods, and how context governs selection |
| [22 · Visual design](22-visual-design.md) | Constraints for the look — and why a Duolingo palette would work against this product |
| [23 · How an exercise runs](23-how-an-exercise-runs.md) | The step model: prepare, do, wait, check, decide — and why swiping is not doing |
| [24 · Speaking as the goal](24-speaking-as-the-goal.md) | Serving one goal without corrupting the measurement, the demonstration sentence on Home, stalling, and the honest use of a microphone |
| [25 · Why none of it feels productive](25-why-it-does-not-feel-productive.md) | What is actually wrong with the competition, sorted by defect — and when the feeling of getting nowhere is an illusion versus a correct reading |
| [26 · Readiness & difficulty](26-readiness-and-difficulty.md) | Who decides what — why a form nobody may skip argues for targeting rather than gating, how difficulty rises with nobody setting it, and how a method is tested |
| [27 · Method badges](27-method-badges.md) | Three badge families for cards and detail — skill, evidence, effort — and why not one gold medal per method |
| [28 · Mobile & desktop layout](28-mobile-desktop-layout.md) | What differs between phone and laptop chrome, what the industry does, and what we should not change |
| [29 · iOS inset by route](29-ios-inset-by-route.md) | Why Safari's bottom toolbar looks route-specific when it is session state |
| [30 · Notifications & reflections](30-notifications-and-reflections.md) | Weekly digests, push, and “how am I doing?” without Duolingo-style guilt |
| [31 · iOS Safari / PWA test report](31-ios-safari-pwa-test-report.md) | Consolidated issue report, shipped fixes, and owner LIVE CHECK matrix (`v0.4.1`) |
| [32 · PWA profile UX](32-pwa-profile-ux.md) | Profile Home screen block — scope table, buttons, designer review |
| [33 · Skill-tier badges](33-skill-tier-badges-exploration.md) | Wood→platinum per-skill badges, detail layout, v3 asset brief (repo only) |
| [34 · Review report UX](34-review-report-and-acknowledgement-ux.md) | Flag popover, status banner, scheduling-intent options (UC-073/074) |
| [35 · Logo & PWA icon](35-logo-and-pwa-icon-exploration.md) | App mark directions, favicon/Home Screen review, sync workflow |
| [36 · Method surfaces property audit](36-method-surfaces-property-audit.md) | UX designer review of every card/detail property — badges, chips, effort dots |
| [37 · Content & method setup UX](37-content-and-method-setup-ux.md) | Catalogue + learner sources, topic/upload on method detail, `/content` library |
| [38 · Landing page update](38-landing-page-update.md) | What to show on `/` before login — structure, assets, headline options |
| [39 · Method section graphics](39-method-section-graphics-brief.md) | Eight catalogue banner assets — cohesion brief, ChatGPT prompt, checklist |
| [42 · Method usefulness audit](42-method-usefulness-ux-audit.md) | UX + science gates for hosted methods; build-a-sentence case study; spec changes |
| [45 · Method duration variants](45-method-duration-variants.md) | Filter vs fixed packages; menu slider decoupled (owner 2026-08-20) |
| [46 · Method length & level-matched content](46-method-length-and-level-matched-content.md) | Which methods benefit from two lengths; news/windows; adaptation ladder |
| [48 · Content licensing & adaptation](48-content-licensing-and-adaptation.md) | Ingest lanes, free sources, LLM cost, no off-the-shelf lemma adapter |
| [49 · Learner intent onboarding](49-learner-intent-onboarding.md) | Lemma boost by register; **timing/skill parts superseded by 50** |
| [50 · Onboarding popover & skill question](50-onboarding-popover-timing-and-skill-question.md) | Web research: upfront popover, drop skill fork; interests added in 51 |
| [51 · Register path + interest topics](51-register-path-and-interest-topics.md) | Register curriculum + interest chips; **mix ratio in 52** |
| [52 · Register mix ratio](52-register-mix-ratio-calibration.md) | Owner lock: 2–3 register cards/session, spine + register sentences, no decay |
| [43 · Early foundation sessions](43-early-foundation-sessions.md) | Same-day word return, foundation throttle, soft form staging — study + implementation map |
| [44 · Foundation phase expert review](44-foundation-phase-expert-review.md) | DS + LT panel: one composer layer, resurfacing rules, what not to ship in v1 |
| [Sources](sources.md) | Literature, honestly marked by how far each was checked |

Chapters 12–26 were written after the roadmap and are appended at the end. By
subject, 12 belongs beside [08](08-motivation.md), 13 beside
[06](06-production.md), 17 beside [05](05-input-reading-listening.md), 19 beside
[03](03-level-model.md), 23 beside [12](12-method-cards.md), 28 beside
[22](22-visual-design.md), and 14, 15, 18 before the roadmap.

Five chapters **correct** earlier ones: [15](15-landscape.md) walks back two
overstated claims in [05](05-input-reading-listening.md),
[18](18-language-kit.md) corrects my own assertion under roadmap question 2 that
languages are uniformly expensive, [24](24-speaking-as-the-goal.md) adds a
second entry type to the catalogue in
[21](21-method-catalogue-and-context.md), which had assumed every entry was a
session, and [25](25-why-it-does-not-feel-productive.md) supplies the denominator
that [08](08-motivation.md) is missing and a second principal risk that
[15](15-landscape.md) does not name, and
[26](26-readiness-and-difficulty.md) sharpens [02](02-evidence.md) E4: the
coverage band it introduced is a **comprehension** threshold, so using it as a
difficulty controller silently optimises comfort. The band stays; what changes is
that a method's purpose chooses it.

---

## How evidence is graded here

Not every claim in learning research is equally solid. So that "the research
says" cannot become a conversation-stopper, every recommendation carries a mark:

| Mark | Means |
| --- | --- |
| **[A]** | Replicated repeatedly, meta-analyses exist, effect shown outside the lab |
| **[B]** | Well supported, with limits — few studies, short timeframes, or lab conditions |
| **[C]** | Plausible and widespread, but thinly evidenced or contested |
| **[D]** | A product decision. Not evidence, but an opinion with a reason |

A **[D]** is not worse than an **[A]** — it is justified differently, and it may
be changed without new studies. The mistake would be selling it as an **[A]**.

One warning up front: much of the app-efficacy literature — Duolingo's included
— runs briefly, has no pre-test, and measures receptive skills because they are
cheap to test. That is recorded in detail in [01](01-duolingo.md) and
[sources.md](sources.md), and it applies to *every* figure here, including the
ones that support our own theses.
