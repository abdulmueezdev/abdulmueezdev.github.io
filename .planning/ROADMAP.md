# Portfolio redesign roadmap — React edition

1. **Discovery and architecture.** Audit existing static site, design documentation, skills, and operational MCP tools. Establish baseline Git commit and comprehensive React migration plan.
2. **React foundation.** Configure React 19, TypeScript 5.8, and Vite 6.4. Set up asset pipeline in `public/` and `src/assets/`, font declarations, and production build tooling.
3. **Component migration.** Migrate Home, Work, Profile, and Contact into modular, type-safe React components (`<Hero>`, `<CRTMonitor>`, `<SelectedWork>`, `<Profile>`, `<Contact>`).
4. **Motion and interaction engineering.** Implement custom React hooks for single-driver animations (`useHeroParallax`, `useCRTRenderer`, `useMonitorTilt`, `useArtworkParallax`, `usePointPrint`, `usePeshawarClock`). Eliminate dual-driver jitter and memory leaks.
5. **Visual refinement and antislop compliance.** Apply UI/UX Pro Max and Antislop standards. Zero AI clichés: no generic gradients, no em dashes, no fabricated statistics, authentic human copywriting.
6. **Quality assurance and accessibility audit.** Full viewport verification at 320px, 390px, 768px, 1280x720px, and 1440px. 100/100 Lighthouse score in Accessibility, Best Practices, and SEO. Verified reduced-motion resets and keyboard navigation.
7. **Final integration and handoff.** Package production build into `dist/`, verify HTTP loopback server on port 4173, preserve legacy route redirects, and update all technical documentation.

## Verification checklist

- [x] Baseline Git commit created (`eadb0c1`).
- [x] React 19 + TypeScript + Vite architecture established.
- [x] Production build passes with 0 errors (`tsc -b && vite build`).
- [x] 100/100 Lighthouse score achieved for Accessibility, Best Practices, and SEO.
- [x] Zero horizontal overflow verified across 320px, 390px, 768px, 1280x720px, 1440px viewports.
- [x] CRT canvas renderer and signal switch verified (Terrain / Waveform modes).
- [x] Layered parallax verified (travels on scroll, returns to 0 on top, resets on reduced motion).
- [x] Interactive 3D Kafka book verified (3D perspective hinge flip, aria-expanded).
- [x] Tablist keyboard navigation verified (ArrowLeft, ArrowRight, Home, End).
- [x] Halftone portrait point-print verified (luminance sampling, pointer displacement).
- [x] Email clipboard copy verified with live status feedback.
- [x] Legacy redirect routes (`/about/`, `/portfolio/`, `/contact/`) verified.
- [x] Progressive enhancement `<noscript>` fallback implemented and verified.
- [x] Clean browser console: 0 errors, 0 warnings.
- [x] Local preview server active at `http://127.0.0.1:4173/`.
