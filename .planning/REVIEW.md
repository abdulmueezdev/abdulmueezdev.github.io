# Portfolio review and design references

## What I found on the live site

| Page | Finding | Change in the redesign |
| --- | --- | --- |
| Home | The dark terminal styling, oversized name and Code / Cloud / Craft line give the site a distinct voice. The boot screen adds a step before visitors can see the introduction. | The introduction and primary links appear on arrival. The portrait carries the visual experimentation, and the terminal becomes an optional interaction farther down. |
| About | The CS degree and AWS Student Builder Group leadership are concrete. Counters, system labels and framework graphics compete with those details. | A short profile puts education and leadership alongside a stack that explains where each tool was used. |
| Portfolio | Alucard has a live demo and a clear technical premise. Visitors have to explore a separate route and activate cards to learn more about the supporting work. | Alucard gets a full-width feature with visible demo and source links. A compact project index lets visitors scan the rest and open details in place. |
| Contact | The email and social links are there, surrounded by simulated ping output and terminal commands. | The footer presents email, a copy action, and social links directly. |

[Original homepage](https://abdulmueezdev.github.io/) · [About](https://abdulmueezdev.github.io/about) · [Portfolio](https://abdulmueezdev.github.io/portfolio) · [Contact](https://abdulmueezdev.github.io/contact)

## Design references

- **Gather by DAO.** The dark field, image-derived particles and fine framing suggested a way to make the supplied portrait interactive. The implementation samples the portrait locally in canvas and gives the photograph, particles and grid distinct scroll speeds. [Gather](https://gather.be-of-dao.com/)
- **Brittany Chiang.** Project descriptions and technology labels make engineering work easy to scan. The redesign puts the project premise before its stack and links. [Portfolio](https://brittanychiang.com/)
- **Niccolò Miranda.** The Paper Portfolio uses type, strong page edges and changes in visual density to guide a long scroll. Here, the work section has a paper tone between the charcoal portrait and profile sections. [Miranda – Paper Portfolio](https://webflow.com/made-in-webflow/website/miranda-paper-portfolio)
- **Firewatch.** The background moves in layers while the foreground remains readable. The portfolio applies that principle to the hero and featured project artwork. [Firewatch](https://www.firewatchgame.com/?lang=en)
- **W3C motion guidance.** The design follows the operating system’s reduced-motion setting for parallax, pointer effects and transitions. [CSS motion technique](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) · [JavaScript motion technique](https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR40)

## Component decisions

| Reference | Application |
| --- | --- |
| [Icon Cloud](https://magicui.design/docs/components/icon-cloud), [Stacked Logos](https://www.vengenceui.com/components/stacked-logos), and [Live Orb](https://21st.dev/r/radiumcoders/live-orb) | The About section arranges six tools around an illuminated center. Each tool is selectable and explains its use in a real project. |
| [Terminal](https://magicui.design/docs/components/terminal) | The optional terminal handles about, stack, alucard, help and clear. |
| [Cursor Card](https://www.vengenceui.com/components/cursor-card), [Highlight Grid](https://www.vengenceui.com/components/highlight-grid), and [Mouse Responsive Background](https://21st.dev/@minhxthanh/components/mouse-responsive-background) | The featured artwork uses a fine grid and a pointer-following light. The same pointer treatment illuminates the contact footer. |
| [Osmo Parallax Scrolling](https://21st.dev/@osmosupply/components/parallax-scrolling) | The photo, points and grid move independently as the page scrolls. The featured work layers move at two different rates. |
| [Animated Footer](https://www.vengenceui.com/components/animated-footer) and [Pushpin Tear Footer](https://21st.dev/r/kedhareswer/pushpin-tear-footer) | A torn edge marks the shift into the contact footer. The email, social links and return-to-top action are available immediately. |
| Matrix Rain, Creepy Button, Interactive Book and Testimonials Card | Matrix Rain would compete with the portrait. The contact actions stay stable, the work index opens inline, and a testimonial section needs attributable quotes. |

The effects are local HTML, CSS and JavaScript adaptations. The workspace was empty and the public repository contains a compiled export. This version uses a build-free structure for GitHub Pages and keeps entry points for the previous About, Portfolio and Contact routes.

The feature uses Alucard’s live Kafka interface as the visual reference. LeadMap and Nabeel Photographic Moments use descriptions from the live portfolio. The Research Opportunity Portal has a verified public source. [Alucard demo](https://ai-bot-psi-three.vercel.app/) · [Research Opportunity Portal source](https://github.com/abdulmueezdev/research-opportunity-portal)

The selected work omits EduIG-Pipeline, which the existing portfolio lists as in development. The LeadMap and Nabeel entries remain readable in the index while their source links are unverified.
