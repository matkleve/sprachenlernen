# Content ingestion legal review (T-CI7)

**Status:** internal counsel memo — not formal legal advice. **Written 2026-08-22.**
**Blocks:** partner-feed production ingest (T-CI8). **Normative product rules:**
[`content-ingestion.md`](../specs/service/content-ingestion.md),
[`content-adaptation.md`](../specs/service/content-adaptation.md).
**Study:** [`ARCH-048`](../study/archive/ARCH-048-content-licensing-and-adaptation.md).

This memo answers the open questions in study/48 before scaling lane B partner
feeds and CC BY-SA catalogue adaptation.

---

## Executive summary

| Topic | Verdict for Sprachenlernen v1 |
| --- | --- |
| **Wikinews (CC BY)** | ✅ Catalogue ingest with attribution + link — already shipped (T-CI2) |
| **Vikidia / Simple Wikipedia (CC BY-SA)** | ⚠️ Adaptation triggers share-alike — see § CC BY-SA; label + source link mandatory; do not redistribute adapted body without SA compliance |
| **DW *Langsam gesprochene Nachrichten*** | ⚠️ Proceed only under documented partner terms — see § DW |
| **BBC Learning English** | ⚠️ Proceed only under documented partner terms — see § BBC |
| **Learner paste (lane A)** | ✅ Private processing with explicit consent — not catalogue redistribution |
| **EU DSM / DE UrhG** | ✅ Runtime adaptation for signed-in learners is the intended narrow path; batch T2 cache is **catalogue redistribution** and needs licence coverage |
| **Generated news (lane C)** | ✅ Facts-only generated text with `generated: true` label — not a substitute for investigative journalism |

**Recommendation:** T-CI8 may start with **DW** once a written TOS summary is filed
below and ingest stores `licence.kind = partner-tos` with URL + review date.
**BBC** in parallel after the same documentation step. Engage external counsel
before EU-wide commercial scale if revenue or EU B2B contracts materialise.

---

## Three lanes (recap)

| Lane | Who sees adapted text | Licence basis |
| --- | --- | --- |
| **A · Learner brings content** | That account only | User direction + processing consent (UC-029) |
| **B · Licence-cleared catalogue** | Any signed-in learner | CC BY, CC0, PD, or partner TOS |
| **C · Generated original** | Catalogue | No third-party copyright — honesty label |

Lane B **never** includes full-text republication of Spiegel, Zeit, NYT, Guardian,
etc. without a contract.

---

## Deutsche Welle — *Langsam gesprochene Nachrichten*

**What we want:** Spanish/Italian (and later German) slow-news audio + transcript
in the content library for politics-at-level (UC-007, UC-030).

**Pre-ingest checklist:**

1. **Locate current TOS** for DW content reuse (dw.com terms, learning-material
   pages, RSS/API if used). Record URL and `lastReviewedAt` on the `Source` row.
2. **Confirm permitted uses:** personal learning app, text display, adaptation
   (level rewrite), caching, attribution requirements, geo restrictions.
3. **Audio:** separate licence for streaming vs text — many learning feeds allow
   on-site playback only; storing audio may need explicit permission.
4. **Attribution string:** DW-required credit line in UI (source detail + session
   contract). Store in `licence.attribution` on the row.
5. **Technical:** ingest as `licence.kind = partner-tos`, not `cc-by`, unless DW
   explicitly labels CC.

**Risk if skipped:** copyright + unfair competition claims; app-store rejection
if partner objects.

**Gate for T-CI8:** engineering may build the ingest adapter against fixtures;
**production** ingest requires this checklist signed by product owner with TOS
URL cited.

---

## BBC Learning English

**What we want:** graded learning articles/audio — not BBC front-page news.

**Pre-ingest checklist:**

1. BBC Learning English **terms of use** (bbc.co.uk/learningenglish) — learning
   materials often differ from main BBC News TOS.
2. Confirm: in-app display, adaptation for level, caching, commercial app (even
   if free to users).
3. Attribution: BBC standard credit line + link.
4. **Do not** ingest main BBC News RSS into the shared catalogue without a
   separate contract.

**Gate:** same as DW — documented TOS + `partner-tos` metadata before production.

---

## CC BY-SA — Vikidia, Simple Wikipedia, adapted bodies

**Problem:** CC BY-SA 4.0 requires **ShareAlike** on adapted material —
adapted text may need to be offered under the same licence if we **distribute**
the adaptation.

**How Sprachenlernen uses adaptation:**

| Surface | What is shown | SA exposure |
| --- | --- | --- |
| **T2 band cache** | Shared A2/B1 rewrite per article | **High** — stored and shown to many users |
| **Personal gate** | Same cached body, coverage checked per user | Still shared body |
| **T3 personal rewrite** | Per-learner text | Lower — still stored server-side |
| **Lane A paste** | Private to account | Lower — not catalogue |

**Display requirements (minimum for CC BY sources — Wikinews):**

- Title + *Adapted for {level} · not the original article*
- Link to original URL (`sourceUrl`)
- Licence name (CC BY 4.0) + link to licence deed
- Credit to author/source where metadata provides it

**For CC BY-SA sources (if added):**

1. **Prefer unadapted display** when personal coverage ≥ 95 % on original.
2. If adaptation is required, **label** adapted body; link original; show SA notice:
   *Adapted text © Sprachenlernen learners under CC BY-SA 4.0 — source: …*
3. **Do not** mix SA-adapted bodies into non-SA catalogue rows without legal sign-off.
4. **v1 decision:** defer Vikidia/Simple Wikipedia ingest until counsel confirms
   whether server-side T2 cache + in-app display satisfies SA (some jurisdictions
   treat SaaS display as distribution).

**Product mitigations already specced:** adaptation labelling (T-CI4), original
link, `adapted: true` on session history — implement for all lane B rows.

---

## EU DSM Directive / DE UrhG — private adaptation vs catalogue

**Question:** Can a commercial learning app run LLM level adaptation without
rights-holder permission?

**Relevant frames:**

| Activity | Typical treatment | Sprachenlernen |
| --- | --- | --- |
| **Text and data mining (TDM)** for training | DSM Art. 4 — opt-out respected | **We do not train** on news text in v1 |
| **Runtime transformation** for individual user | UrhG / DSM — private use, educational context argued | **Lane A** + **T3** — one account, consent |
| **Pre-computed adaptation served to all users** | Republication / derivative work | **T2 cache** — needs **licence** (CC BY, partner TOS, or generated) |
| **Link + short excerpt** | Often permitted | Not our primary model — we store full bodies |

**Conclusion for build:**

- **Lane A** (paste) + **T3** (personal rewrite after consent): align with
  Constitution §2 and UC-029 — document in privacy notice.
- **T2 catalogue cache:** not “private adaptation” — treat as **publishing** an
  adaptation; only ingest sources whose licence permits derivative works or
  adaptation (CC BY, partner contract). CC BY-SA needs SA compliance (§ above).
- **Generated lane C:** no third-party work — label honestly; no fact-check desk
  v1 (owner 2026-08-20).

**External counsel trigger:** EU commercial scale, B2B licensing, or monetisation
of adapted catalogue content.

---

## Lane A — learner upload

| Requirement | Implementation |
| --- | --- |
| Explicit processing consent | `grantAdaptationConsentAction` (T-CI5 path) |
| No automatic promotion to catalogue | `origin: learner`, private storage |
| Rate limits | Per-account T3 cache (study/48) |
| Transparency | UC-029 copy — what is stored, deletion path |

**Urheberrecht:** user must not paste content they cannot lawfully use; app is a
tool — Terms should state user responsibility for pasted URLs/text.

---

## Lane C — generated politics articles

| Requirement | Status |
| --- | --- |
| `generated: true` on `Source` | Specified in `content-ingestion.md` |
| Honesty label in UI | T-CI4 labelling |
| UC-023 reporting | Shipped flag path |
| Fact-check before publish | **Not required v1** (owner 2026-08-20) |

---

## Checklist before T-CI8 production ingest

- [ ] DW TOS URL recorded + `partner-tos` row template in ingest script
- [ ] BBC Learning English TOS URL recorded (if used)
- [ ] Attribution strings in `messages/` for each partner
- [ ] CC BY-SA sources: counsel note on SA display OR defer ingest
- [ ] Privacy policy mentions adaptation + storage (Constitution §2 follow-up)
- [ ] `npm run verify` green with fixture partner rows

---

## Document history

| Date | Change |
| --- | --- |
| 2026-08-22 | T-CI7 initial memo — internal review, not substitute for counsel |
