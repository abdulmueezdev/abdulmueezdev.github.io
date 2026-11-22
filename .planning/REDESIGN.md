# Portfolio redesign

## What to carry forward

The original homepage gave Abdul Mueez a recognizable identity through his oversized name, the terminal and “Code / Cloud / Craft.” In the first redesign, the portrait, technology orbit and terminal each asked for attention before visitors could understand a project. Alucard already has an interface visitors can try. Put that work inside the opening composition and let the photograph introduce its author later. [Original homepage](https://abdulmueezdev.github.io/) · [Previous review](./REVIEW.md)

Superconscious introduces its name at scale and then gives each feature a distinct visual beat. Use that rhythm for the transition from identity to work. The supplied Dylanbrouwer brief sets the type, palette and hard edges. Use onyx and fog as the primary surfaces, mono for working labels and a condensed display face for the name. Reserve the display gradient for large lettering and signal orange for actions and focus. [Superconscious](https://superconscious-app.webflow.io/)

## Build sequence

1. **Opening.** Compose the name around a central three-dimensional CRT. Its screen should establish what Abdul builds. Keep navigation and the selected-work link accessible on arrival. Allow restrained pointer tilt on fine-pointer devices.
2. **Selected work.** Cut to a light project reel. Lead with Alucard, show the interface and explain what someone can do with it. Give other projects their own title, premise and verified destinations. Put captions outside moving artwork so people can read them while scrolling. [Alucard demo](https://ai-bot-psi-three.vercel.app/) · [Research Opportunity Portal](https://github.com/abdulmueezdev/research-opportunity-portal)
3. **Profile and contact.** Introduce Abdul through his supplied monochrome portrait, CS background and AWS Student Builder Group work. End on dark with a direct email action and existing social links.
4. **Motion and review.** Apply layered parallax to the CRT composition and selected artwork. Preserve native scrolling across wheel, keyboard and touch. Compare the implementation against the checks below before sharing the review build.

## Acceptance checks

- Capture the hero at the start, midpoint and end of its scroll range. Verify foreground and background travel different distances, return to their starting positions on reverse scroll and stay within their intended crop.
- Open at 320, 390, 768 and 1440 px. The name fits, the monitor stays recognizable, and controls remain reachable without horizontal page overflow.
- Enable reduced motion before load and toggle it during the session. Confirm the layout retains its content with parallax and pointer tilt disabled.
- Navigate by keyboard and direct section links. On touch, verify the reel controls and a normal vertical swipe. Check an actual review URL in the receiving browser and keep an offline review artifact available.
