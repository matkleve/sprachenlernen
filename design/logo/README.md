# Logo directions

Five app-mark explorations derived from the **Warm Scholar** palette and the
placeholder bars icon that shipped with the PWA scaffold.

| ID | Name | Concept |
| --- | --- | --- |
| `warm-scholar-bars` | Scholar bars | Three vertical strokes — text columns, bookshelf, current shipped mark (refined) |
| `open-folio` | Open folio | Open book from above — literary warmth, study without sterility |
| `monogram-sl` | SL monogram | Serif-inspired S + L ligature — compact, wordmark-adjacent |
| `language-orbit` | Language orbit | Concentric arcs — vocabulary layers, echoes the Words atlas motif |
| `text-stack` | Text stack | Ascending horizontal rules — reading-first, calm editorial |

Each file in `directions/` is a **512×512** artboard with `rx="96"` corner
radius matching iOS icon masking. Safe zone for maskable icons: keep critical
shapes inside the centre **80%** circle.

## Files

- `directions/<id>.svg` — source mark (canvas fill + accent mark)
- `directions/<id>-mono.svg` — ink-only variant for wordmark lockups on light
  surfaces (no canvas fill)

When a direction is chosen, `scripts/sync-brand-assets.mjs` copies the primary
SVG to `public/icon.svg` and `app/icon.svg`.
