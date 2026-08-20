# Content ingestion

<!-- id: SPEC-service-content-ingestion -->
<!-- use-case: UC-030 -->
<!-- use-case: UC-007 -->
<!-- use-case: UC-029 -->
<!-- status: draft -->

How **Sources** enter the app **legally** — catalogue seeds, learner intake, and
what may be stored, adapted, and shown to other users.

Parent: [`content-traceability.md`](../feature/content-traceability.md).
Adaptation: [`content-adaptation.md`](content-adaptation.md). Study:
[`../../study/48-content-licensing-and-adaptation.md`](../../study/48-content-licensing-and-adaptation.md).

## Scope

- **In:** three **ingestion lanes**; licence metadata on `Source`; allowed
  catalogue providers; learner URL/file intake rules; what the app may persist
  and redistribute.
- **Out:** RSS sync implementation (T-W9); paywall bypass; OCR; reading UI.

## Three lanes

| Lane | Who brings content | Redistribution | Adaptation |
| --- | --- | --- | --- |
| **A · Learner** | User paste / upload / RSS (UC-029) | **Private** — stored per account; adapted copy **not** shared catalogue-wide | On demand with consent ([`CONSTITUTION.md`](../../CONSTITUTION.md) §2) |
| **B · Licence-cleared catalogue** | App ingests feeds/files with explicit licence | **Shared** catalogue `origin: catalogue` | Pre-adapt per level band; cache ([`content-adaptation.md`](content-adaptation.md)) |
| **C · Generated original** | App writes news-style text from **facts** (headline + wire summary) | **Shared**; always `generated: true` | N/A — text is already level-targeted |

**Forbidden in v1:** scraping paywalled newspapers and publishing adapted full
articles to all users without a **written licence**.

## Licence metadata (required on persisted Source)

```ts
type SourceLicence = {
  kind: "learner-private" | "cc-by" | "cc-by-sa" | "cc0" | "public-domain" | "partner-tos" | "generated";
  attribution?: string; // "Wikinews contributors"
  sourceUrl?: string;
  partnerId?: string;
  fetchedAt: string; // ISO
};
```

Validator refuses catalogue Sources without `licence.kind`.

## Catalogue providers (v1 target)

| Provider | Licence | Topics | Notes |
| --- | --- | --- | --- |
| **Wikinews** (target language) | CC BY 2.5/3/4 | news, politics | Attribution required; link to original |
| **Simple / Vikidia** (where available) | CC BY-SA | general | SA: adapted derivatives share-alike — store **link + our adaptation labelled** |
| **Partner feeds** (e.g. DW *Langsam gesprochene Nachrichten*, BBC Learning English) | **Partner TOS** per contract | news | Ingest only after legal review of TOS |
| **Fixtures** | app-owned | demo | `data/content/*.json` |
| **Partner feeds (target)** | Partner TOS | news | DW / BBC after T-CI7 legal review — owner wants these (2026-08-20) |

**Not v1 without licence:** full-text republication of commercial news (Bild,
Spiegel, NYT, etc.) even if RSS exists.

## Learner lane (lane A)

| # | Input | Output |
| --- | --- | --- |
| 1 | Paste URL | Fetch if allowed by robots/TOS; else "paste text yourself" |
| 2 | Upload file / paste text | `origin: learner`, `licence.kind: learner-private` |
| 3 | Keep in library | Row in `content_sources` scoped to account |
| 4 | Ephemeral session | No row; no cross-user reuse |

Processing (including LLM) requires **explicit opt-in** on first use — privacy
consent surface.

## Catalogue lane (lane B)

| # | Input | Output |
| --- | --- | --- |
| 1 | Scheduled fetch from allowlisted feed | Normalised `Source` + `licence` |
| 2 | Duplicate URL | Skip or version with `fetchedAt` |
| 3 | Body too long | Store **full** text; session uses `full` unit (UC-007) |

## Generated lane (lane C)

When no licence-cleared article exists for a topic/day:

- Write an **original** graded article from **attributed facts** (headline, date,
  place names) — not a rewrite of a copyrighted article.
- Mark `generated: true`, `licence.kind: generated`.
- **No editorial fact-check queue v1** — honesty label only (*not the original
  article* / *generated*). Owner 2026-08-20.
- Factual-report copy + UC-023 reporting.

## Behaviour

| # | Input | Output |
| --- | --- | --- |
| 1 | Catalogue ingest without licence | Refused at validator |
| 2 | Learner URL to paywalled site | Honest failure; offer paste |
| 3 | CC BY source | `attribution` shown on source detail |
| 4 | Adapted catalogue article | Stores link to original + adapted `body` per [`content-adaptation.md`](content-adaptation.md) |

## Acceptance criteria

In [`content-ingestion.acceptance-criteria.md`](content-ingestion.acceptance-criteria.md).

## Check

`npm test -- content-ingestion`

## Open

- **⚠ SPEC GAP:** legal review checklist for DW/BBC feeds before production ingest.
- **⚠ SPEC GAP:** EU DSM directive / Germany UrhG — private adaptation vs
  catalogue redistribution — needs counsel before lane B scales.
