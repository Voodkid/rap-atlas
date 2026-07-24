# 0004 — V3 design quality and UX gates

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

RAP ATLAS 3.0 must be a professional, original and visually strong product, not a functional prototype or generic admin dashboard. At the same time, the RFC prohibits final UI design based on empty mock data because real card hierarchy, runtime contracts and diverse content determine the interface.

## Decision

Design quality is a mandatory product decision. V3 design minimizes cognitive load, presents one obvious main action, uses progressive disclosure and clear visual hierarchy, and is useful to both newcomers and experienced users. It uses strong typography, a consistent spacing system, deliberate dark and light themes, responsive desktop/mobile layouts, and complete loading, empty, error, offline and long-content states.

The product supports keyboard navigation, WCAG 2.2 AA and reduced motion. Animation is used only for function or feedback. AI output never gains decorative precision, and uncertainty is never hidden. Public release requires visual regression coverage for desktop/mobile, dark/light and primary states, plus task-based usability review.

Final UI implementation is deferred until the gold-standard card, real content hierarchy, stable ContentRepository/runtime contract and several diverse vertical-slice cards exist. Once those dependencies are met, design is a first-class development stage rather than cosmetic follow-up work.

## Consequences

- The home screen must expose one primary action appropriate to the current analysis gate, with secondary/expert actions progressively disclosed.
- Accessibility, responsive behavior and state design are release criteria, not post-release remediation.
- Content and runtime work must provide real inputs before the final visual system, card layouts and component design are committed.
- Design validation covers both successful and degraded/offline paths, including textual alternatives for non-text visualizations.

## Rejected alternatives

- Generic dashboard styling or copying a specific music/streaming/DAW product.
- Building the final interface around empty mock data before content and runtime contracts stabilize.
- Treating keyboard, reduced motion, WCAG conformance, dark/light parity or long-content states as optional polish.
- Visual confidence displays that conceal uncertainty or imply AI accuracy without evidence.

## Risks

- Deferring final UI avoids premature rework but requires scope discipline while content foundations are built.
- A visually strong design can still fail usability if task review is skipped.
- WCAG 2.2 AA and state coverage add validation work across both themes and responsive breakpoints.

## Verification

- The real gold card and diverse slice validate content hierarchy before final UI implementation begins.
- Keyboard navigation, visible focus, semantic structure, reduced-motion behavior and WCAG 2.2 AA are tested.
- Visual regression covers desktop/mobile, dark/light, loading, empty, error, offline and long-content states.
- Task-based usability review is completed before public release and its material findings are addressed or explicitly accepted.
- AI/result screens expose evidence, alternatives and limitations rather than decorative certainty.

## Conditions for reconsideration

A new ADR is required to lower accessibility/visual/usability gates, allow final UI work before its stated dependencies, change the one-primary-action principle, or replace the original-design requirement.

## Related RFC sections

- [Master RFC, §2 Зафиксированная продуктовая рамка](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#2-зафиксированная-продуктовая-рамка)
- [Master RFC, §5 UX и информационная архитектура](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#5-ux-и-информационная-архитектура)
- [Master RFC, §5.5 Accessibility baseline](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#55-accessibility-baseline)
- [Master RFC, §6 Design system](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#6-design-system)
- [Implementation Roadmap, §8–10](../rfc/RAP_ATLAS_V3_IMPLEMENTATION_ROADMAP.md#8-этап-5--новый-ux-shell)
