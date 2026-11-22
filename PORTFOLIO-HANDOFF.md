# Abdul-Mueez Shahid · Portfolio implementation guide

**Handoff date** — 22 November 2026  
**Delivery target** — One responsive page that introduces Abdul, shows two projects people can inspect, and gives them a direct way to reach him.  
**Current checkpoint** — The CRT edition is in integrated review. The opening and portrait share the page with both working project panels. The project reel now has a single scroll driver. Final preview and verification evidence are recorded below.

## 1. Start here

Open the workspace’s `index.html` alongside this guide. It contains the complete page and is the source of truth for its content. The project uses static HTML, local CSS and browser JavaScript modules. There is no package manifest, install step, framework runtime or build command. Keep this architecture for the current design. The owner allows React, but the existing interactions already have independent modules and the target host serves static files.

Three versions can look like “the portfolio.” Identify the right one before editing or testing.

| Version | How to recognize it | Purpose |
| --- | --- | --- |
| Original public site | Dark terminal homepage, “Code / Cloud / Craft,” separate portfolio pages | Evidence for Abdul’s voice, work and existing URLs. [Original portfolio](https://abdulmueezdev.github.io/) |
| First local redesign | Lavender accents, italic serif headings, portrait in the hero, technology orbit | Historical iteration. The earlier roadmap checkmarks and review copy refer to this version. [First review](.planning/REVIEW.md) · [First roadmap](.planning/ROADMAP.md) |
| Current workspace draft | Large condensed “Abdul-Mueez,” physical CRT, “Switch signal,” light project reel, portrait in Profile | Version to complete. The latest planning note records its direction. [Page source](index.html) · [Redesign plan](.planning/REDESIGN.md) |

## 2. What the design should communicate

The original homepage worked because the terminal, Abdul’s name and his three-word line gave visitors one recognizable idea. The first redesign divided attention among a portrait treatment, a tool orbit and a terminal before a visitor encountered a real project. Give each section one job. At first glance a visitor should recognize **whose site this is**. One scroll later they should see **something Abdul built**.

| Section | What the visitor should see and do |
| --- | --- |
| **Home** `#home` | Oversized name on onyx, a single vintage monitor in front of the type, and “Code. Cloud. Craft.” Keep the name, intro, navigation and Selected work link available on arrival. The physical screen shows a plotted terrain or waveform. The signal switch is optional play. |
| **Work** `#work` | A sharp cut to paper white. Lead with Alucard AI. Opening its illustrated book reveals an interpretation of the Kafka interface. “Talk to Kafka” opens the actual app. The second tab presents the Research Opportunity Portal as a filing folder. Keep summaries, technology choices and destination links outside the moving artwork. |
| **Profile** `#profile` | Show Abdul’s own monochrome photograph alongside a short first-person introduction, education, AWS leadership and CV. The optional point print samples the same photograph. A visitor on a phone can read the profile and use the CV without touching the image. |
| **Contact** `#contact` | Return to onyx. Make the email address selectable and actionable. Keep the copy control, social profiles and back-to-top link easy to reach. |

### Visual specification

| Element | Direction for implementation and review |
| --- | --- |
| Palette | Onyx `#161616` for Home and Contact. Paper `#f8f8f8` and fog `#f1f1f1` for reading sections. Graphite `#3c3a3e` for supporting text on light surfaces. Silver `#c9c7cc` for rules. Ember `#ff6436` for small actions, status or focus. Test small text against its actual background. |
| Type | The supplied Dylanbrouwer brief names ABC Gravity, Die Grotesk B and IBM Plex Mono. The draft bundles Anton for condensed display type, Inter Medium for prose, and IBM Plex Mono for controls and metadata. Keep the graphite-to-silver fade inside the giant hero lettering. Avoid stretching paragraph text to achieve the display effect. |
| Composition | Use the 6 px spacing rhythm and roughly 1200 px content measure below the hero. The opening can run wider. Give the monitor a convincing seat in the composition. At smaller widths recompose the supporting text around it. Check the name’s first and last letters, screen edges and call to action at each breakpoint. |
| Surfaces and copy | Square editorial surfaces, fine rules, restrained pill navigation. Project artwork can have physical depth. Use Abdul’s name, project vocabulary, and ordinary action labels. Omit generic status badges, fictional metrics, invented testimonials and labels that repeat the heading. |
| Motion | Use native document scroll and short transform or opacity transitions. The supplied easing curves are `cubic-bezier(.32,.72,0,1)` and `cubic-bezier(.19,1,.22,1)`. Maintain a fully readable still composition with reduced motion enabled. |

### How to use the references

- **Superconscious** supplies the opening rhythm. Study how the product sits against the large wordmark and how the first scroll changes scale. Translate that to the CRT and the transition to Work. The palette and type come from the owner’s Dylanbrouwer brief. [Superconscious](https://superconscious-app.webflow.io/)
- **Gather** supplies the portrait idea. Preserve the recognizable profile and crop as the photo becomes points. The underlying local image is the source for both views. [Gather](https://gather.be-of-dao.com/)
- **Osmo Parallax** informs the different foreground and background travel rates. **Vengeance UI Interactive Book** informs the Alucard cover interaction. Both patterns already have local implementations. Review them before considering registry installs. [Osmo](https://21st.dev/@osmosupply/components/parallax-scrolling) · [Interactive Book](https://raw.githubusercontent.com/Ashutoshx7/VengeanceUI/main/public/r/interactive-book.json)
- The owner also supplied Terminal, Icon Cloud, stacked logos, a cursor card, highlight grid, mouse-responsive background, Matrix Rain, Live Orb, two footers, Creepy Button and testimonials. Their role is a reference library. The terminal vocabulary already appears in the CRT. Revisit another component only for an identifiable visitor need. The first review records the original collection. [Magic UI Terminal](https://magicui.design/docs/components/terminal) · [Icon Cloud](https://magicui.design/docs/components/icon-cloud) · [Reference inventory](.planning/REVIEW.md)

## 3. Repository map and integration contracts

| File or directory | Responsibility | Preserve when editing |
| --- | --- | --- |
| `index.html` | All sections, reading order, project and contact content, stylesheet order and one JS entry point | Stable anchor IDs, accessible names and button-to-panel relationships. Edit final HTML here. Temporary fragments under `/tmp` are earlier assembly inputs. |
| `styles/main.css` | Local font faces, shared tokens, reset, focus and skip-link styles | Font URLs resolve relative to the stylesheet. Keep license files with distributed fonts. |
| `styles/hero.css` | Masthead, giant name, CRT housing, glass crop, overlay and responsive composition | Scroll moves the outer monitor, pointer tilt rotates its inner shell. Preserve separate transform elements. |
| `styles/work.css` | Project tabs, book layers, folder, captions and disclosures | The book hinge is independent of scroll. Text and links remain stationary within their section. |
| `styles/profile.css` | Portrait crop, profile layout, contact and mobile rules | The source portrait is 900 × 1600. Preserve the face when changing the visible crop. |
| `styles/surface-motion.css` | Point-print overlay and switch | Keep the overlay aligned with the photographed frame. Project motion belongs to the Work module. |
| `scripts/main.js` | Imports and calls `setupMotion()`, `setupInteractions()` and `setupSurfaces()`. Also drives the Peshawar clock and fine-pointer monitor tilt | One module entry point. A failure during an initializer can interrupt the remainder of startup. Check the browser console on first load. |
| `scripts/motion.js` | Hero scroll displacement and the canvas terrain/waveform renderer | Scene, stage and canvas are located via `data-hero-scene`, `data-hero-stage` and `data-monitor-screen`. The `data-signal` control switches renderer state. |
| `scripts/interactions.js` | Project tab keyboard model, open/close book, email copy and project artwork parallax | Tabs use `aria-controls` to locate unique panels. Both project articles are present before enhancement. The contact link works independently of clipboard access. |
| `scripts/surface-motion.js` | Samples portrait luminance into a cached point image, adds its toggle and responds to a fine pointer. Responds to reduced motion and pauses rendering offscreen. | The expected mount is the image wrapper inside `.profile-photo`. The photo, alternative text and caption live in HTML. |
| `assets/` | `field-monitor.webp` is the generated CRT housing. `portrait.webp` is the owner’s photograph. Also holds the CV, favicon and local fonts | The canvas overlays the glass in the housing. Replacing the housing requires realigning that overlay. Keep the CV and public image paths valid. |
| `about/`, `portfolio/`, `contact/`, `.nojekyll` | Static host compatibility and legacy route redirects | The redirect targets are `/#profile`, `/#work` and `/#contact` respectively at the site root. Retain working links when hosted under a path prefix. |

**Project facts to preserve.** Alucard uses Gemini embeddings, Supabase pgvector retrieval and Groq generation to answer in Kafka’s voice. The portal lets faculty publish and manage research openings and students find them. Its listed stack is React, TypeScript, Express and MySQL. LeadMap and Nabeel Photographic Moments have short native disclosures. Keep their descriptions factual and add a destination only after verifying it. The profile identifies Abdul as a BS Computer Science student at FAST-NUCES Peshawar, batch of 2024, and AWS Student Builder Group Lead. The working contact address in the source is `abdulmueezshahid550@gmail.com`. [Alucard demo](https://ai-bot-psi-three.vercel.app/) · [Alucard source](https://github.com/abdulmueezdev/AI-Bot) · [Portal source](https://github.com/abdulmueezdev/research-opportunity-portal)

## 4. Carry the draft to completion

Work one phase at a time. In a multi-agent session, the **planner** owns scope and acceptance criteria, the **motion agent** owns scroll and rendering, and the **implementation agent** owns structure, content and controls. One **integrator** owns shared selectors, resolves overlaps and signs off on the assembled page. At each handoff name the files touched, the behavior observed and the checks still open. The following phases fit the owner’s requested GSD workflow.

| Phase | Work | Exit condition |
| --- | --- | --- |
| **1 · Establish the baseline** | Read the current HTML and modules. Serve the workspace’s public files locally over HTTP. Open the draft at desktop and phone widths and capture the opening and first work panel before altering either. Use UI UX Pro Max for hierarchy, contrast and reflow, and Antislop for copy and repeated UI patterns. | The receiving browser shows the CRT and the Alucard reel. The planner records specific visual or behavioral defects against this draft. |
| **2 · Resolve motion ownership** | Keep `setupArtwork()` in `interactions.js` as the single driver of project plate travel. It writes `--art-y`, which already moves foreground and background in opposite directions. The draft also calls `setupPlateTravel()` in `surface-motion.js` and applies `--plate-shift` to the same props. Retire that second path while preserving the portrait initializer and book hinge. | A slow scroll moves the book relative to “KAFKA” and the folder relative to its grid. Both return on reverse scroll. Opening the book works at either scroll extreme. |
| **3 · Finish the opening** | Review the monitor crop, name legibility, intro and controls at the target widths. The planning note suggested putting Alucard inside the CRT; the current screen is a plotter. Use the plotter as the opening identity and the book as the first project unless the owner asks for a demo inside the monitor. Confirm the signal switch has a comprehensible state and appears only when it works. | A visitor can identify Abdul, reach Work, and switch signals by keyboard or touch. No overlap blocks a target. The still hero is legible. |
| **4 · Finish Work, Profile and Contact** | Exercise both projects, disclosures, book, portrait, CV and email. Check that point-print sampling follows the visible photo crop after resize. Test email copy with clipboard access available and denied. | Each section is usable from its anchor on desktop and phone. Every displayed destination leads to the intended project, file or person. |
| **5 · Review and deliver** | Run the matrix below against the assembled page, correct observed failures and retest. Refresh the review copy from these same files. Open the exact URL the owner will receive. | Supply the verified preview, one desktop and one phone capture, and a short record of what was tested and what remains. Public deployment is a separate owner decision. |

Host skill locations on the original machine are `~/.agents/skills/gsd-core/` and `~/Documents/Antigraivty_Data/.agents/skills/` for `ui-ux-pro-max` and `antislop`. On another machine, the phase table and visual specification are sufficient to continue.

## 5. Verification matrix

| Check | Procedure and expected result |
| --- | --- |
| Responsive composition | At 320, 390, 768 and 1440 CSS pixels, visit all four sections. Also use a short laptop viewport around 1280 × 720. No horizontal page overflow, clipped name, covered control or truncated email. At 200% zoom the navigation and main reading order remain usable. |
| Layered scrolling | Compare the hero at the top, after 200 px of native scroll, and after returning to the top. Current nominal offsets at 200 px are +52 px for type and −26 px for the monitor. The stage opacity changes slightly. Desktop travel caps at 430 px and narrow-screen travel at 220 px, subject to stage height. Check the rendered composition as well as the numbers. Wheel, touch and Page Down should still scroll normally. |
| Motion preferences and cost | Toggle reduced motion before load and again while scrolled. Hero offsets should reset, tilt should stop, CRT signals should become stills, and choosing a project or point print should still work. With standard motion the CRT sweep settles after about 4.6 seconds. Scroll it out of view or hide the tab and verify drawing pauses. |
| Keyboard and touch | Tab from the skip link through navigation, signal switch, projects, profile and footer. Use Left/Right and Home/End in the project tabs, and Enter/Space on the book and portrait controls. Verify focus is visible and the active tab, book state and portrait state are announced. On a phone, swipe vertically across the artwork and activate each control by tap. |
| Progressive enhancement | Disable JavaScript and reload. Both featured project articles, the supporting disclosures, underlying portrait, CV, mail link and social links should remain accessible. Enhancement-only buttons should stay hidden. Re-enable JavaScript and verify both panels still map to the correct tabs. |
| Routes and assets | Cold-load each section hash and each legacy directory. Reload with the network panel open. Verify font, portrait, monitor, CSS, JS and CV responses, and check for module or canvas errors. Open the demo and source links individually. |

## 6. Deliver a preview the owner can actually open

The owner previously received `ERR_CONNECTION_REFUSED` at port 4173. A later local review service served a **snapshot** from `/tmp/abdul-portfolio-preview.rKCDN7`. Editing the workspace does not update that directory. The self-contained HTML review file generated for the first redesign can also be stale.

1. Inspect the existing preview service and its document root. Compare the served HTML and scripts with this workspace. A successful HTTP response alone can still be the old portfolio.
2. Stage the current public entry page, assets, scripts, styles, favicon and legacy redirect directories together. Use a loopback HTTP server for a local review. The Python standard library’s `python3 -m http.server 4173 --bind 127.0.0.1 --directory <public-preview-directory>` is sufficient when that port is available. ES modules require an HTTP origin for normal review.
3. Keep the listener alive independently of the shell used to test it. If reusing the existing service, refresh its served files and recheck after closing the launch session. If the reviewer uses another machine, localhost points to that machine; arrange an owner-approved reachable preview or deliver a verified offline copy.
4. Open the **exact handoff URL** in the owner’s reviewing browser, reload, switch the CRT signal and open the second project. Capture that revision. If delivering an offline HTML copy as a fallback, regenerate it with the current fonts, assets, CSS and modules embedded, then open and test that file independently.
5. If the owner later requests GitHub Pages publication, identify the configured publishing branch or workflow, deploy the same tested files with `.nojekyll`, and repeat the route and asset checks at the public URL. Record the published revision and URL.

**Definition of done** — The owner can open the delivered revision, recognize it as their portfolio, inspect real work, use it on a phone or by keyboard, and reach the CV and contact address. Record the tested URL, viewport sizes, motion preference and any remaining limitations with the handoff.
