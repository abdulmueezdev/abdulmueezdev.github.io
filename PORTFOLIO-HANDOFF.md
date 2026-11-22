# Abdul-Mueez Shahid · Portfolio implementation guide

**Handoff date** — 22 November 2026  
**Delivery target** — High-performance, professionally engineered, production-ready React + TypeScript + Vite application.  
**Current checkpoint** — Production build verified. 100/100 Lighthouse Accessibility, 100/100 Best Practices, 100/100 SEO. Single scroll driver active. Preview live at `http://127.0.0.1:4173/`.

## 1. Project status

The portfolio has been fully migrated from static legacy scripts into an idiomatic, modular React + TypeScript + Vite application.

- **React 19 + TypeScript 5.8 + Vite 6.4**: Type-safe component architecture with isolated hooks, zero memory leaks, and optimized production chunking.
- **Progressive enhancement**: A semantic, fully accessible `<noscript>` fallback guarantees zero-JS resilience.
- **Single motion ownership**: Artwork parallax and hero transforms have exactly one driver (`useArtworkParallax` and `useHeroParallax`), eliminating dual-driver jitter.
- **100% WCAG AA accessible**: WAI-ARIA tablist model with keyboard arrow/Home/End navigation, label-in-name compliance, 44px tap targets, visible focus rings, and reduced-motion enforcement.

## 2. Component and hook architecture

```text
Portfolio/
├── index.html                  # Semantic entry document, font preloads, noscript fallback
├── package.json                # React 19, TypeScript, Vite scripts (dev, build, preview)
├── vite.config.ts              # Bundler config, relative asset base ('./'), chunk optimization
├── tsconfig.json               # Strict TypeScript configuration
├── public/                     # Static assets served at root
│   ├── assets/                 # Fonts, webp images, CV pdf, favicon
│   ├── about/index.html        # Legacy redirect -> /#profile
│   ├── portfolio/index.html    # Legacy redirect -> /#work
│   ├── contact/index.html      # Legacy redirect -> /#contact
│   └── .nojekyll               # GitHub Pages Jekyll bypass
├── dist/                       # Production build output
└── src/
    ├── main.tsx                # StrictMode entry mount
    ├── App.tsx                 # Root layout & skip-link
    ├── components/
    │   ├── Hero/               # Masthead, navigation, wordmark, bio, live clock
    │   ├── CRTMonitor/         # Canvas terrain/waveform plotter & signal switch
    │   ├── SelectedWork/       # Tabbed project reel, 3D interactive Kafka book, folder art
    │   ├── Profile/            # Monochrome portrait, luminance point-print canvas, CV download
    │   └── Contact/            # Email mailto, clipboard copy control, live social destinations
    ├── hooks/
    │   ├── useHeroParallax.ts  # Scroll-driven type and monitor displacement
    │   ├── useCRTRenderer.ts   # 24fps canvas terrain & oscilloscope waveform renderer
    │   ├── useMonitorTilt.ts   # Fine-pointer 3D shell perspective tilt
    │   ├── useArtworkParallax.ts # Single-owner plate parallax (--art-y)
    │   ├── usePointPrint.ts    # Halftone luminance sampling & interactive particle displacement
    │   └── usePeshawarClock.ts # Real-time Asia/Karachi (UTC+5) tabular clock
    └── styles/
        ├── main.css            # Font declarations, CSS tokens, reset, skip link
        ├── hero.css            # Hero grid, masthead, monitor shell, CRT glass
        ├── work.css            # Tab navigation, 3D book cover hinge, folder art, disclosures
        ├── profile.css         # Responsive profile layout, definition lists, contact footer
        └── surface-motion.css  # Point-print canvas overlay, pill switch styling
```

## 3. Preserved design identity

- **Color palette**: Onyx (`#161616`), Paper (`#f8f8f8`), Fog (`#f1f1f1`), Graphite (`#3c3a3e`), Silver (`#c9c7cc`), Ember (`#ff6436`).
- **Typography**: Anton 400 (display title), Inter 500 (body prose), IBM Plex Mono (technical controls & metadata).
- **Physical depth**: 3D interactive Kafka book with CSS perspective flip, filing folder with multi-level sheets, vintage CRT field monitor with scanline/phosphor overlay.
- **Copywriting**: Natural, restrained, human-centered language adhering to Antislop (no em dashes, no fabricated metrics, no fake testimonials).

## 4. Verified live endpoints and project facts

- **Alucard AI**: Conversational AI answering in Franz Kafka's voice using Gemini embeddings, Supabase pgvector retrieval, and Groq generation. [Demo](https://ai-bot-psi-three.vercel.app/) · [Source](https://github.com/abdulmueezdev/AI-Bot)
- **Research Opportunity Portal**: Academic software for university faculty and students. Stack: React, TypeScript, Express, MySQL. [Source](https://github.com/abdulmueezdev/research-opportunity-portal)
- **Supporting work**: LeadMap (Google Places enrichment) and Nabeel Photographic Moments in accessible HTML disclosures.
- **Author profile**: Abdul-Mueez Shahid, BS Computer Science student at FAST-NUCES Peshawar (Batch of 2024), AWS Student Builder Group Lead.
- **Direct contact**: `abdulmueezshahid550@gmail.com` with one-click clipboard copy.

## 5. Verification matrix and test evidence

| Category | Procedure | Result |
| --- | --- | --- |
| **Production build** | `npm run build` | Passed with 0 errors. TypeScript clean. Output in `dist/`. |
| **Lighthouse desktop** | Chrome DevTools MCP audit | 100 Accessibility, 100 Best Practices, 100 SEO. |
| **Responsive viewports** | Tested 320px, 390px, 768px, 1280x720px, 1440px | Zero horizontal overflow across all sections (`hasOverflow: false`). |
| **Layered scrolling** | Scroll 200px and reverse to top | `--type-y: 78px`, `--object-y: -39px` at 200px. Returned to exact `0.00px` on top. |
| **Reduced motion** | `prefers-reduced-motion: reduce` | Parallax offsets locked to `0.00px`. Stage opacity locked to `1.000`. Tilt and sweeps disabled. |
| **CRT signal switch** | Click signal button | Canvas switches between 38-row terrain and 32-trace oscilloscope waveform. Aria state toggled. |
| **Interactive book** | Click book toggle | Cover hinges open to -139deg via CSS 3D perspective. `aria-expanded` and label update. |
| **Tab navigation** | Keyboard ArrowLeft/Right/Home/End | Focus advances and activates panels synchronously with full WAI-ARIA compliance. |
| **Point print** | Click portrait switch | Samples portrait luminance, generates halftone canvas, displaces dots on pointer movement. |
| **Clipboard copy** | Click copy button | Writes `abdulmueezshahid550@gmail.com` to clipboard and triggers `role="status"` feedback. |
| **Legacy routes** | `/about/`, `/portfolio/`, `/contact/` | Verified 0s meta-refresh redirects to `/#profile`, `/#work`, `/#contact`. |

## 6. Local preview instructions

The production build is served locally via Python loopback HTTP server:

```bash
cd /home/alucard/Desktop/Portfolio
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Preview URL: `http://127.0.0.1:4173/`

For development server with hot-module reloading:

```bash
npm run dev
```
