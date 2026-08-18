# 38 · Landing page update — what to show before login

**Status:** exploration — for owner discussion · **2026-08-18**  
**Audience:** product owners deciding what `/` should do next  
**Companion:** [`landing.md`](../specs/page/landing.md) (behaviour contract),
[UC-011](../use-cases/UC-011-start-in-the-first-minute.md) (first minute after
signup), [22](22-visual-design.md) (visual promise), [15](15-landscape.md) K3
(the closed loop).

---

## Two surfaces — do not merge them

| Surface | Route | Who | Job |
| --- | --- | --- | --- |
| **Landing page** | `/` (signed out) | Visitors who have not committed yet | Say what this is, why it is different, and how to get in — in under two minutes |
| **Home** | signed-in first screen (today `/methods`; study/24 also names Progress) | Learners with an account | Show where you stand and what to do next |

Study/24's **demonstration sentence** belongs on **Home**, not on `/`. The public
page can *preview* the idea ("we show you a sentence you can already read") but
must not steal Home's daily competence moment.

---

## Problem

The shipped landing page (2026-08-11, T-B7) fulfilled the minimum contract:
thesis 1 in the headline, thesis 12 in the body, sign-in path visible on every
public route. That was the right **first** ship — an honest sentence instead of
a placeholder scaffold.

It is not yet a page that **shows** the product. Today `/` is text-only:

```
Brand · eyebrow · headline · subhead · time-honesty paragraph
CTAs · three thesis bullets · links to /languages and /dev/design
```

A visitor who has never opened Anki or read the study gets a **manifesto**, not
a **preview**. They cannot see:

- the four-skill level profile and honesty rules;
- the method catalogue (sixty-ish methods, not five);
- the visible scheduler or the progress map;
- what fifteen minutes actually looks like inside the app.

The spec deliberately left "full positioning copy and marketing argument" out of
scope ([`landing.md`](../specs/page/landing.md) § Scope). This chapter is that
missing layer — reasoning only; implementation becomes a spec change when a
direction is chosen.

### What is wrong with staying text-only **[D]**

1. **Category confusion.** "Evidence-driven language learning" sounds like every
   serious app's footer. It does not answer *what you do after Create account*.
2. **Critique before promise.** Thesis 1 (*progress is shown as measured
   competence, never as activity*) is accurate and differentiating for someone
   who already distrusts streaks — but it leads with *what we refuse*, not *what
   you get*. Duolingo leads with a green bird and a tap; we lead with a negation.
3. **No proof surface.** [01](01-duolingo.md) S5: Duolingo publishes efficacy
   studies. We claim measurement honesty; the landing shows no measurement.
4. **Dev tooling on the front door.** `designExplorerLink` points to `/dev/design`
   — useful for owners, noise for strangers ([`LandingHero.tsx`](../../features/marketing/LandingHero.tsx)).
5. **The closed loop is invisible.** [15](15-landscape.md) K3: our actual thesis
   is the ring `SRS → level → input → SRS`. The three pillar bullets name parts
   of the ring but not the connection — the thing that exists nowhere else.

---

## Who lands on `/`

| Visitor | What they need in the first scroll | Failure mode if we miss it |
| --- | --- | --- |
| **Comparison shopper** | "Different from Duolingo/Babbel — show me" | Assumes another course app; leaves |
| **Anki / LingQ refugee** | "Does it fix the thing that annoyed me?" | Sees generic SRS mention; stays with the specialist |
| **Friend / link** | "What is this link?" + low friction to try | Wall of philosophy before one exercise |
| **Returning signed-in user** | Wayfinding to app or PWA install | Already handled — **To app** CTA |
| **Press / funder skim** | Credible product + serious positioning | Manifesto without screenshots reads as pre-product |

None of these groups wants the thirteen theses. All of them want **one concrete
picture** and **one honest sentence** about what happens after signup.

---

## What competitors put on the door (pattern, not copy)

From [15](15-landscape.md) and [01](01-duolingo.md):

| Pattern | Examples | Fits us? |
| --- | --- | --- |
| Hero + single CTA | Duolingo, Babbel | **Yes** — UC-011: account is the only gate |
| Product screenshot / device frame | Busuu, LingQ | **Yes** — we have a real UI now |
| "How it works" in 3 steps | Most course apps | **Partial** — our flow is method choice, not linear units |
| Social proof (users, studies) | Duolingo efficacy | **Later** — pre-test study not run yet |
| Feature grid | Anki (power), LingQ (reading) | **Yes** — four skills, methods, map, scheduler |
| Pricing | SaaS apps | **Out** — not monetised; do not fake a pricing section |

**[D]** The landing should look like a **tool preview**, not a **course catalogue**.
Warm Scholar ([22](22-visual-design.md)) already rejects game mascots; screenshots
should show real surfaces with real typography — not illustrated characters.

---

## Message hierarchy — four headline candidates

T-B7 (2026-08-11) picked thesis **1** because T-04 had already quoted it — not
because owners ranked alternatives ([`2026-08-11` diary](../diary/2026-08-11.md)).
Before adding visuals, pick what leads.

| # | Lead | Strength | Weakness |
| --- | --- | --- | --- |
| **A · Measured competence** (current) | Thesis 1 — intellectually honest; filters streak-chasers | Cold; negation-first; assumes category knowledge |
| **B · The map** | Thesis 8 — "where you are and what the last month opened" | Hard to show without a screenshot of `/progress` |
| **C · Speaking as the goal** | Thesis 11 — what most learners actually want | Easy to misread as "speaking-only app"; must pair with input honesty |
| **D · Honest time** | Thesis 12 — "15 min/day is ~91 h/year — arithmetic, not failure" | Unusual, memorable; risks sounding discouraging without the upside |

**Recommendation [D]:** lead with **C or B**, keep **A** in the body (contrast
block), keep **12** as the honesty paragraph (already shipped). Speaking is the
goal learners name; the map is the visual differentiator LingQ never built.

Thesis 9/10 (*methods mostly happen outside the app*) is the most differentiated
sentence in the study but the **least reassuring** on a door — save it for method
detail and the catalogue page, not the hero.

**Copy constraint:** sentences marked in `messages/*.json` must still cite study
sources — no invented positioning ([`landing.md`](../specs/page/landing.md) § Data).

---

## Recommended page structure (signed-out `/`)

One scroll for mobile; desktop can widen the same blocks. Order is deliberate:
**promise → proof → contrast → path → footer links**.

### 1 · Hero (above the fold)

| Element | Content direction |
| --- | --- |
| Eyebrow | Keep short — e.g. "Evidence-driven language learning" or language-specific if `/` becomes localised |
| Headline | Owner pick from table above (default recommendation: speaking goal **or** map) |
| Subhead | One sentence: **closed loop** in plain language — e.g. "Cards, reading, and level in one ring — not three apps" ([15](15-landscape.md) K3) |
| CTAs | **Create account** (primary) · **Sign in** (secondary) — unchanged |
| Optional | One line under CTAs: "First exercise in under a minute after signup" (UC-011) |

No screenshot in the hero on mobile — CTAs must stay visible without scrolling.

### 2 · Product band — **the update that needs assets**

A horizontal or stacked set of **real screenshots** (or one annotated composite),
each with a **five-word label** and **one sentence**:

| Panel | Surface to capture | Label idea | Study anchor |
| --- | --- | --- | --- |
| **Levels** | `/progress` four-skill profile (or honest empty state with legend) | "Four skills, one honest overall" | [03](03-level-model.md) |
| **Methods** | `/methods` catalogue row with badges | "Sixty ways to practise — you pick" | [12](12-method-cards.md), [21](21-method-catalogue-and-context.md) |
| **Scheduler** | Words review with "why this card now" if shipped; else horizon view | "The schedule you can see" | [04](04-flashcards-srs.md) |
| **Input** | `/content` or reading method with coverage % | "Read at your level" | [05](05-input-reading-listening.md) |

**Reuse check:** no new component — static images in `public/marketing/` or a thin
`LandingScreenshots` server component. Alt text is mandatory ([CONSTITUTION](../CONSTITUTION.md) §3).

### 3 · "What we optimise for" contrast block

A two-column table — not brand names in the left column if it reads as petty; use
**category behaviours**:

| What many apps optimise for | What we show instead |
| --- | --- |
| Daily return, streaks | Measured competence ([08](08-motivation.md) informational vs controlling) |
| One progress bar | Four skills + honest overall ([03](03-level-model.md)) |
| Five exercise types | Full method catalogue ([21](21-method-catalogue-and-context.md)) |
| Black-box scheduling | Visible scheduler ([04](04-flashcards-srs.md)) |

Ends with thesis 1 sentence — here it lands as **contrast**, not as the first thing
you read.

### 4 · First minute path

Three steps, aligned with UC-011 — no deck picker, no placement test:

1. Create account (email — nothing else)
2. Choose language pair
3. First fixed-length exercise starts

Link: **Languages we ship honestly** → `/languages` (already exists).

### 5 · Evidence note (honest, not marketing fluff)

One short paragraph: we adopt Duolingo's practice of measuring in public ([01](01-duolingo.md) S5) but pre-test + dropouts + production skills when we publish. Link to study chapters or a future `/about` page — **not** fake statistics.

### 6 · Footer links

| Link | Keep? |
| --- | --- |
| `/languages` | **Yes** |
| `/privacy` | **Yes** (if not already in layout footer — check marketing layout) |
| `/dev/design` | **No** on default landing — dev routes only |
| `/install` | **Maybe** — for visitors on phone who already have an account |

---

## What it costs to "show the app properly"

The product UI exists; the gap is **capture, crop, and copy** — not a redesign.

| Item | Effort | Notes |
| --- | --- | --- |
| **Screenshot set** (4 panels, DE + EN if localised) | S | Seed realistic learner state in dev; capture at `max-w-5xl` breakpoint; dark mode variant optional |
| **Closed-loop diagram** | S–M | SVG in Warm Scholar tokens — alternative to fourth screenshot; good for pitch decks too |
| **60-second screen recording** | M | Optional embed; autoplay muted; shows method pick → exercise → grade |
| **Visitor copy pass** | S | Rewrite subhead + contrast table in `messages/` — owner + one read-aloud test |
| **Localised landing** | M | `messages/de.json` already has keys; marketing namespace may need DE parity review |
| **SEO / OG image** | S | `openGraph` today uses text only — add `og:image` with screenshot composite |
| **Professional design review** | M | One session: hierarchy, spacing, screenshot crops — not a new visual direction |

**Not needed for v1 of the update:** custom illustration, mascot, pricing table,
testimonial widgets, blog, or a separate marketing site.

---

## Phasing

| Phase | Delivers | Spec touch |
| --- | --- | --- |
| **0 · Hygiene** (now) | Remove `/dev/design` link from default landing; add `/privacy` if missing | `landing.md` copy keys only — **design link removal shipped 2026-08-18** |
| **1 · Proof** | Screenshot band + contrast block + warmer headline (E–H) | Extend `landing.md` scope; new AC for images + contrast section |
| **1b · Try box** | One-method interactive sandbox (fixture SRS or reading snippet) | New feature spec; `"use client"` island on `/` |
| **2 · Motion** | Optional video; OG image | `site-metadata` + `public/` assets |
| **3 · Depth** | `/about` or expandable evidence page | New page spec — out of `/` scope |

Do **phase 1** before debating headline rewrites in isolation — owners react to
screenshots; they argue about thesis numbers in text-only reviews.

---

## Owner decisions — 2026-08-18

| # | Question | Decision | Consequence |
| --- | --- | --- | --- |
| 1 | Headline lead | **Too cold** — reject A–D as hero tone; need warmer invitation | New candidates E–H below; thesis sentences move to body/contrast |
| 2 | Product band | **Screenshots first**; later **interactive sandbox** (one method in a try box) | Phase 1 = static captures; Phase 2 = embedded mini-runner or fixture session |
| 3 | Landing language | **Browser language**, else English | Already shipped: `resolveLocale` uses Accept-Language when signed out ([`resolve-locale.ts`](../../lib/i18n/resolve-locale.ts)); DE keys exist in `messages/de.json` |
| 4 | Signed-in on `/` | **Stay on `/`** with **To app** CTA | No redirect to `/methods`; hero stays readable for PWA install path |

### Warmer headline candidates **[D — owner pick still needed]**

The prior table (A–D) led with **critique or abstraction**. These lead with
**relief, invitation, or a concrete try** — still study-backed, not invented
marketing.

| # | EN headline | DE headline | Study anchor |
| --- | --- | --- | --- |
| **E** | See whether your practice is actually paying off. | Sieh, ob dein Üben wirklich etwas bringt. | Thesis 1 reframed as relief, not negation; [08](08-motivation.md) informational progress |
| **F** | Pick how you practise. We show you where you stand. | Such, wie du übst. Wir zeigen dir, wo du stehst. | [12](12-method-cards.md) + [03](03-level-model.md); thesis 13 without jargon |
| **G** | A map from your first words to speaking. | Eine Karte — von den ersten Wörtern bis zum Sprechen. | [19](19-milestones-and-map.md) + [24](24-speaking-as-the-goal.md) chain |
| **H** | Try one exercise in under a minute — then see what we measure. | Probier eine Übung in unter einer Minute — und sieh, was wir messen. | [UC-011](../use-cases/UC-011-start-in-the-first-minute.md) + measurement honesty |

**Subhead (any of E–H):** closed-loop in plain language — e.g. EN *"Cards,
reading, and level in one ring — not three apps"* / DE *"Karten, Lesen und
Niveau in einem Kreislauf — nicht drei Apps"* ([15](15-landscape.md) K3).

**Body keeps:** time-honesty paragraph (thesis 12) and contrast block with thesis
1 — honesty after invitation, not before.

**Owner:** pick E, F, G, or H (or mix headline + subhead across rows).

---

## Product band — screenshots now, sandbox later

Owner direction: **interactive boxes / app prototypes** — but **screenshots first**.

### Phase 1 · Screenshot band (ship next)

Same four panels as below — static `public/marketing/*.webp` (or PNG), lazy-loaded,
with alt text per panel. Real Spanish tier-B data in a seeded demo account or
fixture state; empty states only where the surface is genuinely empty for newcomers.

| Panel | Surface | Label |
| --- | --- | --- |
| Levels | `/progress` | Four skills, one honest overall |
| Methods | `/methods` | You pick the method — sixty-plus ways |
| Scheduler | `/words` or horizon | The schedule you can see |
| Input | `/content` or reading method | Read at your level |

### Phase 2 · Interactive sandbox (explore after screenshots land)

One **try box** on `/` — not the full app:

| Approach | Effort | Notes |
| --- | --- | --- |
| **Fixture review session** | M | 3–5 cards from `data/` — flip, grade, no persistence; `"use client"` island only |
| **Method detail mock** | S | Static HTML/CSS clone of one method card — looks interactive, is not |
| **Embedded runner** | L–XL | Real session builder without account — auth wall after grade; high scope |

**Recommendation [D]:** start with **fixture review session** (SRS is the first
engine and UC-011's first exercise). Label it *"Try it — nothing is saved"* so
signup expectation stays honest. Sandbox is **phase 2**, not a blocker on phase 1
screenshots.

---

## Open decisions (owners)

1. ~~Headline lead~~ → **E / F / G / H** (warmer set); reject cold A–D for hero
2. ~~Screenshot vs sandbox~~ → **screenshots first**, sandbox one method later
3. ~~Landing language~~ → **browser locale, fallback en** (already implemented)
4. ~~Signed-in `/`~~ → **stay on `/`**
5. **Evidence block:** link to `docs/study/` (public?) · stub `/about` · omit until
   first efficacy run?
6. **Sandbox method:** SRS try-cards · one reading snippet · other?

---

## Anti-patterns — do not put on `/`

From [10](10-antipatterns.md) and [08](08-motivation.md):

- Streak counters, leaderboards, "don't break your streak"
- Fake urgency ("limited beta")
- Placement test before signup
- Promising fluency timelines without uncertainty bands
- Duolingo-green palette or game mascots ([22](22-visual-design.md))
- Listing features with no shipped surface yet (mark **not yet** if shown)

---

## Check

**Owners:** open `/` on phone and desktop — can you describe the product to
someone in one sentence without reading the pillar list? If not, phase 1 is blocked
on screenshots, not on another thesis debate.

**After ship:** `npm test -- landing` + axe on `/` + LIVE CHECK: signed-out
visitor sees screenshots with alt text; signed-in visitor still sees **To app** only
in hero; `/dev/design` not linked from hero.
