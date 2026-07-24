# 0002 — V3 content governance and taxonomy

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

V3 separates canonical editorial content from the 2.x legacy archive and models knowledge as a typed graph. This creates enduring decisions about who can publish, how contentious claims are reviewed, and how taxonomy changes preserve links and user state.

## Decision

Voodkid is the taxonomy owner, publication owner and rights decision owner. Users may propose corrections, submit sources, report errors and correct an analysis result; they do not edit the canonical database directly. A contentious or high-impact assertion requires a second domain reviewer, or an explicit `single_reviewer` disclosure when that reviewer is unavailable.

The first V3 taxonomy version is `3.0.0` and follows SemVer. A published entity ID is immutable. A rename changes a label, not an ID. A merge, removal or redefinition is expressed through a redirect, migration record or tombstone. Runtime shard grouping is not taxonomy. The graph is canonical truth; tree, families and runtime groups are projections.

`cloud-rap` is the first gold-standard card. It is authored anew under V3 rules. Legacy prose and research are leads only: they are not copied automatically, are not canonical truth, and every migrated assertion is independently verified.

The first vertical slice contains 12 entities: six `sound_direction`, two `scene_context`, one `organization`, two `term_reference` and one `release_reference`. It includes cloud rap; a contested entity; an alias/redirect case; a card without media; a card with an official embed; a card with an owned/licensed demonstration; and several relation types. The remaining eleven names are intentionally deferred until the gold card exposes real structure and taxonomy friction.

## Consequences

- Publication decisions and rights interpretation have one accountable owner.
- Canonical changes require traceable review, provenance and migrations rather than direct crowd editing.
- Stable IDs make Saved/Recent, deep links and legacy URLs migratable.
- Gold-card findings inform selection of the rest of the slice; no filler list is created in Stage 0.
- The 250 old cards remain V2 archive and research material, never V3 canonical content or training truth without independent verification.

## Rejected alternatives

- Public direct editing of canonical cards.
- Treating legacy classifications or prose as automatically verified V3 content or training ground truth.
- Reusing runtime shard/family grouping as the taxonomy hierarchy.
- Changing published IDs when labels change.
- Preselecting eleven slice entities before the gold-card authoring/review exercise.

## Risks

- Single-owner governance can constrain throughput; the review disclosure keeps publication transparent rather than silently lowering the standard.
- Immutable IDs require redirect/tombstone maintenance indefinitely.
- A gold card may reveal contract or taxonomy friction that delays slice selection; this is an intended validation outcome.
- Contested entities need clear scope and evidence to avoid presenting disagreement as settled fact.

## Verification

- Taxonomy release is marked `3.0.0`; published IDs remain stable across label changes.
- Redirects, migrations and tombstones are validated and preserve legacy links/state.
- Graph relations, not shard grouping, generate tree/family/runtime projections.
- Published contentious/high-impact claims have a second reviewer or explicit single-reviewer disclosure.
- The cloud-rap card and all slice cards record independent claim review and media/rights state; the eleven deferred names are selected only after gold-card review.

## Conditions for reconsideration

A new ADR is required to change the owner roles, open canonical editing, alter the review standard, change taxonomy versioning/ID permanence, redefine graph authority, or replace the gold-card-first slice selection rule.

## Related RFC sections

- [Master RFC, §7.1 Card authoring](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#71-card-authoring)
- [Master RFC, §7.2 Graph, а не одно дерево](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#72-graph-а-не-одно-дерево)
- [Master RFC, §7.3 Source/claim model](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#73-sourceclaim-model)
- [Content and Dataset Schema RFC, §3 Уровни версий](../rfc/RAP_ATLAS_V3_CONTENT_AND_DATASET_SCHEMA.md#3-уровни-версий)
- [Content and Dataset Schema RFC, §12 Legacy migration](../rfc/RAP_ATLAS_V3_CONTENT_AND_DATASET_SCHEMA.md#12-legacy-migration)
- [Implementation Roadmap, §5–6](../rfc/RAP_ATLAS_V3_IMPLEMENTATION_ROADMAP.md#5-этап-2--одна-gold-standard-карточка)
