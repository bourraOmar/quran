<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Inviolable Design & Architectural Rules

The following rules must be strictly preserved in all future changes, refactors, and updates:

## 1. Quran Mushaf Layout & Line Alignment
- **Word Spacing & Centering**: Every line of verses in the Mushaf reader (`SurahReader.tsx`) MUST be centered with tight, uniform word spacing:
  `className="... items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 py-0 sm:py-0.5 ..."`
- **NEVER use `justify-between` on verse lines**: Do NOT stretch words to page edges with `justify-between` under any circumstances. It causes unnatural empty gaps between words.
- **Line Height**: Line height must remain tight and elegant:
  `leading-[1.75] sm:leading-[1.85] md:leading-[1.95]`
- **Container Structure**: The Mushaf page container width is locked to `max-w-[650px] mx-auto`. Do not wrap individual pages in heavy bordered cards or expand them to wide desktop viewports. Pages must flow seamlessly with a centered page number and subtle divider line, matching Quran.com.

## 2. Font & API Configuration (King Fahad Complex V1)
- **API Endpoint Parameter**: Verses must always be fetched with `mushaf=2` (King Fahad Complex V1):
  `verses/by_chapter/${id}?...&word_fields=code_v1,code_v2,text_uthmani,line_number,page_number&mushaf=2`
- **Font URL**: Each page dynamically loads its official per-page WOFF2 glyph font:
  `https://verses.quran.foundation/fonts/quran/hafs/v1/woff2/p${p}.woff2` with `font-display: block;`
- **Font Preloading**: Preload the initial page fonts using `<link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" />`.
- **Word Glyph Rendering**: Always render `{w.code_v1 || w.code_v2 || w.text || w.text_uthmani}` inside `span` with `style={{ fontFamily: 'p' + w.page_number }}`.

## 3. Homepage Preservation
- The homepage layout and design in `src/app/page.tsx`, `InteractiveMockup.tsx`, and `InstallAppAction.tsx` must remain untouched unless explicitly requested by the user.

## 4. UI Aesthetics & Iconography
- **No Emojis**: Strictly never use emojis anywhere in UI text, navigation, buttons, or badges. Always use clean inline SVG vector icons.
- **Neutral Mushaf Label**: Keep the badge label as "مصحف مجمع الملك فهد" without technical version numbers like "V2" in user-facing text.

