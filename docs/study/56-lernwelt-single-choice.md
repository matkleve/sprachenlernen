# 56 · Lernwelt — one flat choice, no hidden layers

**Status:** study only — **collapses** register/topic/situation split from
[51](51-register-path-and-interest-topics.md)–[55](55-situations-not-units-register-switch.md).

**Owner correction (2026-08-20, late):**

- **Politik** and **Natur** are **registers** (Lernwelten), not “topics” under Business.
- **“Business register + topic Nature”** is incoherent — withdraw that model entirely.
- **Hidden situation tags** are **not transparent** — violates glass-walled honesty
  ([04](STUDY-004-flashcards-srs.md), [UC-005](../use-cases/UC-005-trust-the-review-schedule.md)).
- Previous chapters read like **layered product rules**, not something a learner
  can feel — this chapter replaces them with **one learner-visible knob**.

---

## W0 · What went wrong in 51–55

We stacked:

1. Register (Business / Alltag / Technik)  
2. Topics (Politik, Natur as “interest”)  
3. Situations (Meetings — “hidden for authors”)  
4. Card counts, boosts, units  

That produced nonsense like *Business + Natur* and prose the owner cannot feel.
**Withdraw the two-axis model.** Politik is not a chip under Business.

---

## W1 · One concept: **Lernwelt**

The learner chooses **one primary Lernwelt** (learning world). Peers, not hierarchy:

| `worldId` | Learner sees |
| --- | --- |
| `business` | Business — Büro, Meetings, E-Mail |
| `everyday` | Alltag — Zuhause, Reise, Smalltalk |
| `technical` | Technik — Docs, IT, Tools |
| `politics` | Politik — Nachrichten, Debatte, Institutionen |
| `nature` | Natur & Garten — Pflanzen, Wetter, draußen |
| `general` | Allgemein — keine Schwerpunktwelt |

**v1:** exactly **one** active world (no multi-select). Optional second world is
⚠ SPEC GAP — owner has not asked for it.

Everything flows from that **one** choice:

- Words: weighted toward this world’s lemma set  
- Example sentences: **from this world’s sentence bank only** (+ neutral glue)  
- Reading/news: catalogue filtered to this world  
- Method prompts: phrased for this world  
- No cross-world mixing in one session’s **tone** unless world = `general`

---

## W2 · Obvious — do not nag

Choosing a **Lernwelt** changes probabilities. The learner **already knows**
they chose Politik. Re-stating it every session is noise — not transparency.

| Show | Do **not** show |
| --- | --- |
| **Profile:** active Lernwelt + change control | Session intro *„Heute lernst du in Politik…“* |
| **Once** when switching worlds (confirmation) | G1 on every card *„Politik — weil du…“* |
| Method chips if user **overrides** world for one run | Banner on Home every open |

**Transparency** here means: choice is **real** (content actually shifts), you
can **change** it in Profile, switch preview is honest about kept lemmas — **not**
labelling every card with the setting you picked on day one.

If the learner asks *why this sentence?* — optional disclosure in G1 **only then**,
or a single *„Mehr aus deiner Lernwelt“* filter in Words — not default spam.

**Withdraw** all copy patterns from W2 table in the 2026-08-20 draft of this
chapter (session intro, per-card G1 world tag).

---

## W3 · Not Duolingo

| Duolingo | Lernwelt model |
| --- | --- |
| Linear unit tree | **One world preference** + FSRS |
| “Complete Unit 3” | **Held words** + honest level |
| Opaque why-this-now | G1: *„Politik — deine Lernwelt“* |
| Course % | No course % ([10](STUDY-009-antipatterns.md) A4) |

Duolingo’s **short onboarding motivation quiz** is fine to copy ([01](STUDY-001-duolingo.md));
Duolingo’s **skill tree as spine** is not ([01](STUDY-001-duolingo.md) D2).

---

## W4 · Switching world mid-way (Politik → Natur)

| | |
| --- | --- |
| **Held lemmas** | All stay — FSRS unchanged |
| **Due reviews** | Still run — *Abgeordnete* reviews when due |
| **New cards & sentences** | **Natur** pool from next session |
| **Reading** | Natur catalogue / adapted texts |
| **Prompts** | Garten, Wetter, Pflanzen — not Bundestag |
| **Politik words** | No new introductions until you switch back; **reviews continue** |
| **UI** | Explicit confirmation — no silent drift |

No reset. No punishment. **Transparent pivot.**

---

## W5 · Onboarding (simple)

**Page 1 — Abholen**

> Du wählst eine **Lernwelt**. Wörter, Sätze und Texte passen dazu —  
> nicht alles auf einmal, aber spürbar.

**Page 2 — Pick one**

```
In welcher Welt willst du die Sprache lernen?

○ Business
○ Alltag
○ Technik
○ Politik
○ Natur & Garten
○ Erstmal allgemein
```

**Page 3 — Preview (concrete, one world only)**

Politik example:

> Beispiel-Satz: *El parlamento debatió la nueva ley.*

Natur example:

> Beispiel-Satz: *Regamos las plantas cada mañana.*

One line only — **no** *„ab jetzt immer Politik“*. They will feel it in content.

**No second axis.** No hidden tags. **No ongoing labels** after onboarding.

---

## W6 · Methods — same tag, one world

Pass **`activeWorld`** to Words and every method runner:

```typescript
type LearnerWorld = {
  worldId: "business" | "everyday" | "technical" | "politics" | "nature" | "general";
  setAt: string;
};
```

- Sentence bank rows: `world: "politics"` — not `register` + `topic`  
- Sources: `world: "nature"`  
- Session sampling: weight lemmas where `lemma.worlds[]` includes active world  
- **Still not 100 %** when world ≠ `general`: neutral glue sentences OK; **tone**
  stays in-world  

Methods unchanged in **list** — [`build-a-sentence`](../../data/methods/writing.json),
reading, dictation, Words — all receive `activeWorld`.

---

## W9 · FSRS and Lernwelt — weight in the queue, not in the memory lie

**Owner question:** Should FSRS also weight words differently?

**Two layers — do not merge them** ([44](archive/ARCH-044-foundation-phase-expert-review.md) P1a):

| Layer | Lernwelt effect | Touch `applyReview` / stored `due`? |
| --- | --- | --- |
| **Memory (FSRS core)** | **No lie.** After `again`/`good`, interval follows stability only | **No** |
| **Session composer** | **Yes.** Among due + new candidates, **higher pick weight** for active world | **No** — selection only |

### What that feels like

- Politik word **due** → normal chance to appear; **slightly more** likely to win a
  slot vs another due word from an old world when both compete for the same 15.
- Politik word **not due** → FSRS does **not** pull it early just because Politik
  is selected — that would break *„why now?“* (G1 / UC-005).
- **New** introductions in a session → weighted toward active-world lemmas (plus
  spine basics) via [`session-sampling.md`](../specs/service/session-sampling.md)
  factor `wᵢ` × worldMatch.
- Switched Politik → Natur: *parlamento* still reviews when **actually due**;
  fewer **new** Politik introductions; Natur lemmas win **new** slots more often.

### What we do **not** do in v1

- Change `due` dates because of Lernwelt alone  
- Hide non-world due cards  
- Per-world retention dial (85 % vs 90 %) — ⚠ SPEC GAP; sensitive; v2 only  

**One sentence:** Lernwelt steuert **Wahrscheinlichkeit in der Session**, FSRS
steuert **wann du ein Wort vergisst** — beides, aber getrennt.

---

## W7 · Supersession table

| Withdrawn | Replaced by |
| --- | --- |
| Register + topic two axes | **One Lernwelt** |
| `topic:nature` under Business | **world: nature** |
| Hidden `situation:*` | Visible sub-theme later or nothing |
| “Meetings 2/6” / situation units | Dropped |
| 2–3 cards / 10 % / 15/15 quotas | Weighted pool, no fixed count |
| 60-day decay | Dropped |

Chapters [49](49-learner-intent-onboarding.md)–[55](55-situations-not-units-register-switch.md)
remain as **history**; **W1–W6** is the current owner-aligned model.

---

## W8 · Open questions

1. **Lemma in multiple worlds** — is *presupuesto* Business-only or also Politik
   (budget law)? Multi-tag on lemma, pick by **active world** weight — not shown to learner.
2. **general world** — pure frequency path; when to nudge “pick a world”?
3. **Sub-themes** (Politik → Wahlen) — v2, **visible** chips, not hidden.

---

## Sources

| | Claim | Grade |
| --- | --- | --- |
| ⬤ | Two-axis register+topic produced incoherent combos | [D] — owner 2026-08-20 |
| ⬤ | Hidden personalization violates trust thesis | [D] — [04](STUDY-004-flashcards-srs.md) |
| ⬤ | Duolingo path ≠ our FSRS spine | [A] — [01](STUDY-001-duolingo.md) D2 |
| ⬤ | Do not repeat the setting the user already chose | [D] — owner 2026-08-20 |
| ⬤ | Lernwelt weights session pick, not `applyReview` | [D] — owner 2026-08-20, [44](archive/ARCH-044-foundation-phase-expert-review.md) |
