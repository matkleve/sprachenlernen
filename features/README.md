# Features

One folder per product surface or dev tool. Each folder holds components, hooks,
`content.ts` (copy), and colocated tests.

**Production** features implement specs under `docs/specs/`. **Dev/QA** features
are linked from Profile → Dev (`lib/dev-pages.ts`) or exist for bisect/QA only.

| Folder | Route(s) | Kind | Purpose |
| --- | --- | --- | --- |
| `account-data` | `/profile` (section) | prod | Export and delete learner data |
| `app-shell` | (all signed-in) | prod | Header, nav, language switcher, layout |
| `auth` | `/login`, `/signup` | prod | Sign-in and registration forms |
| `content` | `/content`, `/content/[id]` | prod | Saved texts and episodes library |
| `exercise-runner` | `/practice` | prod | Multi-step exercise runner (dictation, …) |
| `install` | `/install` | prod | PWA install instructions |
| `language-picker` | `/languages/choose` | prod | Choose learning language |
| `language-status` | `/languages` | prod | Public language quality tiers |
| `learner-world` | `/languages/world-setup` | prod | Lernwelt onboarding and profile edit |
| `marketing` | `/` | prod | Landing page and public header |
| `method-menu` | `/methods`, `/methods/[id]` | prod | Method catalogue and detail |
| `not-found` | (404) | prod | Not-found surface |
| `privacy` | `/privacy` | prod | Privacy policy and cookie consent |
| `profile` | `/profile` | prod | Account, languages, dev links |
| `progress` | `/progress` | prod | Progress report and weekly reflection |
| `review-session` | `/words/review` | prod | SRS review session |
| `words` | `/words` | prod | Vocabulary home and orbit |
| `brand-explorer` | `/dev/brand` | dev | Logo and PWA icon directions |
| `design-explorer` | `/dev/design` | dev | Theme preset comparison |
| `material-explorer` | `/dev/materials` | dev | Material stack recipes |
| `progression-explorer` | `/dev/progression` | dev | Nine interface stages slider |
| `safari-bisect` | `/safari-bisect`, `/words-bisect`, `/progress-bisect` | qa | iOS/PWA layout bisect (QA-031) |
| `sentence-realizer-dev` | `/profile/dev/sentence-realizer` | dev | Lemma-table sentence matrix |
| `wood-grain-lab` | `/dev/wood-grain` | dev | Procedural wood grain tuning |
| `wood-texture-lab` | `/dev/wood-textures` | dev | Wood species swatches |

Routes are canonical in `lib/routes.ts`. Dev page metadata lives in
`lib/dev-pages.ts`.

## Rules

- **No feature-to-feature imports** except the documented patterns in
  [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) § Cross-feature reuse.
- Shared UI used by ≥2 features → `components/ui/`.
- Framework-free logic → `lib/`.
