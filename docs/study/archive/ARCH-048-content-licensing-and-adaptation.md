# 48 · Content licensing, ingestion, and adaptation cost

<!-- id: ARCH-048 -->
<!-- type: archived-bridge -->
<!-- status: archived -->

**Status:** owner questions 2026-08-20. Normative specs:
[`content-ingestion.md`/../../specs/service/content-ingestion.md),
[`content-adaptation.md`/../../specs/service/content-adaptation.md).

Answers: **how to ingest articles without copyright trouble**, **which sources
are safe**, **whether LLM adaptation is affordable**, and **whether an
off-the-shelf level translator exists**.

---

## Short answers

| Question | Answer |
| --- | --- |
| **Urheberrecht?** | Three lanes: learner-private · licence-cleared catalogue · generated original. **No** scraping Spiegel/NYT into shared catalogue without licence. |
| **Gratis Quellen?** | **Ja, begrenzt:** Wikinews (CC BY), CC0/PD texts, partner learning feeds (TOS prüfen). Nicht: volle Zeitungsartikel. |
| **LLM teuer?** | **Nein**, wenn **gecacht pro Artikel+Level** (~40 Calls/Tag). Teuer wird **pro Nutzer pro Klick** ohne Cache. |
| **Fertiger Level-Übersetzer?** | **Nein** mit Lemma/Form-Bindung — **selbst bauen** (Coverage + Rewrite + Validator). |

---

## Urheberrecht — drei legale Wege

### Lane A · Nutzer bringt Inhalt (UC-029)

- Nutzer fügt URL/Text ein → Verarbeitung **für dieses Konto**.
- Adaptierte Version **nicht** automatisch an alle Nutzer verteilen.
- LLM nur mit **expliziter Zustimmung** (Constitution §2).
- Rechtlich näher an „Werkzeug für private Nutzung“ — trotzdem keine Paywall-Umgehung.

### Lane B · Katalog mit klarem Lizenzstatus

| Quelle | Lizenz | Politik-News? | Hinweis |
| --- | --- | --- | --- |
| **Wikinews** (es/it/de/en) | CC BY | ✅ | Attribution + Link Pflicht |
| **Vikidia** / Simple Wikipedia | CC BY-SA | ○ | Share-alike bei Adaptation beachten |
| **DW Langsam gesprochene Nachrichten** | Partner-TOS | ✅ | Audio + Transkript — **TOS vor Produktion prüfen** |
| **BBC Learning English** | Partner-TOS | ○ | Lernmaterial, nicht Frontpage |
| **Project Gutenberg** | Public domain | ❌ | Literatur, keine Tagespolitik |

**Nicht ohne Vertrag:** Spiegel, Zeit, NYT, Guardian-Volltext in App-Katalog
republizieren — auch nicht „nur adaptiert“.

### Lane C · Generierter Originaltext

Statt Spiegel-Artikel umzuschreiben: **neuer** Kurzartikel auf A2 aus **Fakten**
(Datum, Ort, Namen) — wie Wikinews-Stil, aber app-generiert.

- `generated: true`, meldbar (UC-023)
- Kein Ersatz für investigativen Journalismus — ehrlich in `doesNotDo`

---

## „Artikel einlesen“ — technischer Ablauf

```
Allowlisted Feed / Wikinews API / Nutzer-URL
        ↓
  Fetch + licence metadata speichern
        ↓
  [Katalog] Adaptation T2 → Cache (sourceId + A2 + lang)
        ↓
  Coverage-Check auf adaptiertem Volltext
        ↓
  Source in DB — ganzer body, Session = full (UC-007)
```

**Kein Kürzen** für Lese-Sessions. Zu lang für Menü-Filter → Methode **ausblenden**,
nicht abschneiden.

---

## LLM-Kosten — ehrliche Rechnung

Annahme: ~800 Wörter Input, ~700 Wörter Output, **kleines Modell** (z. B. GPT-4o-mini
/ Gemini Flash Klasse).

| Szenario | Calls/Tag | Grobe Kosten/Tag |
| --- | --- | --- |
| **Katalog-Cache** 10 Artikel × 2 Level × 2 Sprachen | ~40 | **Cent-Bereich** |
| **1000 aktive Nutzer**, jeder 1 Paste/Tag ohne Cache | ~1000 | **Euro-Bereich** — vermeiden |
| **1000 Nutzer**, gleiche 10 Katalog-News (Cache hit) | ~40 | **Cent-Bereich** |

**Regeln:**

1. **Katalog:** immer `AdaptationCacheKey` — ein LLM-Lauf pro (Artikel, Level, Sprache).
2. **Nutzer-Paste:** optional T3 personal — Rate-Limit; Cache per `(urlHash, lemmaSetHash)`.
3. **T1 gloss** ohne LLM wo möglich (90–94 % Coverage).
4. **Nacht-Batch** für Tagesnews — nicht beim ersten Tap.

Günstiger als Voll-LLM: **Lemma-Ersetzung** aus Frequenzliste für bekannte Lücken,
LLM nur für Satzglättung — v2 in [`content-adaptation.md`/../../specs/service/content-adaptation.md).

---

## Gibt es einen fertigen „Text auf mein Level“-Dienst?

| Angebot | Lemma-aware? | Form-aware? | Urteil |
| --- | --- | --- | --- |
| **News in Levels** (Menschen) | ○ | ❌ | Redaktion, keine Personalisierung |
| **Rewordify** | ❌ | ❌ | Wortliste, nicht dein Deck |
| **Readable / Flesch** | ❌ | ❌ | Schulstufe, nicht CEFR/Coverage |
| **ChatGPT „mach A2“** | ❌ | ❌ | Kein Validator, keine Held-Lemmas |
| **Forschung ATS** | teils | ❌ | Kein Produkt-API |

**Was wir bauen müssen:**

```text
Input: original text + targetLevel + heldLemmaSet (+ forms v2)
  → LLM rewrite mit harten Constraints
  → coverage(adapted) ∈ [95%, 98%]
  → retry oder Tier runter
Output: adapted body + label + link original
```

Das ist **machbar** und der **Coverage-Rechner existiert bereits** — der
Differenzierer ist der Validator-Loop, nicht ein neues ML-Modell.

**Formen:** v2 — wenn `formMastery` signal reif ist, Prompt um „nutze nur diese
Konjugationen“ erweitern. Heute: Lemma-Ebene reicht für v1.

---

## Produkt-Features

| # | Feature | Verdict |
| --- | --- | --- |
| F227 | Licence metadata on every catalogue Source | **V1** |
| F228 | Wikinews + fixture ingest pipeline | **V1** |
| F229 | T2 adaptation cache per level band | **V1** |
| F230 | Generated original news (lane C) fallback | **V2** |
| F231 | Lemma-personal T3 for uploads | **V2** |
| F232 | Partner feed legal review (DW/BBC) | **Before scale** |

---

## Traceability

| Doc | Action |
| --- | --- |
| UC-007, UC-029, UC-030 | Updated specs links |
| [`content-ingestion.md`/../../specs/service/content-ingestion.md) | Lanes + providers |
| [`content-adaptation.md`/../../specs/service/content-adaptation.md) | Tiers + cache |
| [`IDEAS.md`/../../IDEAS.md) stories 3 & 5 | Implementation queue |

## Open (needs counsel / product)

- CC BY-SA adapted body: display requirements for share-alike.
- EU **Text and Data Mining** — commercial app training vs runtime adaptation.
- Faktencheck-Pflicht für generierte Politik-Texte.
