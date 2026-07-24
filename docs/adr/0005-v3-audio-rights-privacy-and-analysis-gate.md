# 0005 — V3 audio rights, privacy and analysis gate

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

Media rights, user uploads and analysis claims have different legal, privacy and product risks. The V3 architecture separates official references, owned/licensed assets and user uploads, and requires a measurable usefulness gate before public analysis becomes a product promise.

## Decision

The first stage permits official links; official YouTube/SoundCloud embeds in accordance with their policies; owned demonstrations; and explicitly licensed material. It forbids downloading official tracks into the repository, bundling third-party MP3 files into portable, treating playback rights as training rights, or training on user uploads without separate explicit consent and a rights declaration.

A card remains useful without online media. External platform media is a visible official embed or source link, not extracted audio or a background playback substitute.

No public Analyze is offered until the analysis usefulness gate passes. A passing gate requires a completed useful job, measured value beyond Finder-only, faithful traceable evidence, controlled OOD/ambiguous failures with abstention and correction, target-platform performance, privacy/security review, working failure/offline continuity, and independent observability/rollback. Before that point, analysis is internal or explicit opt-in laboratory work only.

## Consequences

- Media manifests distinguish reference, owned/licensed and user-upload lifecycles and their rights.
- The portable product includes no unlicensed third-party MP3 and works without external embeds.
- Training is a separate purpose from analysis; future consent, retention, deletion and rights checks cannot be inferred from permission to play media.
- Public product flows always have Finder/Explore fallback and do not claim an unavailable analyzer.

## Rejected alternatives

- Copying or extracting official platform audio for repository, portable or background playback use.
- Assuming an official embed/player permission grants storage, analysis or training permission.
- Adding a public upload/classifier before evidence, privacy, security and usefulness gates.
- Letting user corrections or uploads automatically become canonical content or training samples.

## Risks

- Platform policies and media rights may change; each integration needs current policy review before release.
- Rights-cleared media can be scarce, limiting playable examples without reducing card usefulness.
- Analysis gates may not pass; the preview must remain Finder-first without being framed as failed functionality.
- Any cloud/upload capability adds jurisdiction, retention and minors-policy work outside this first preview.

## Verification

- Media review checks source type, rights grant, offline permission, training permission, expiry and fallback state.
- Repository and portable release scans contain no downloaded official tracks or third-party MP3 bundles.
- User-upload/training flows, if later proposed, require separate explicit consent and rights declaration plus retention/deletion controls.
- Public Analyze is absent until documented gate evidence satisfies all required criteria; service/offline errors route to a useful local/Finder alternative.

## Conditions for reconsideration

A new ADR is required to allow additional media classes, storage/caching of external audio, training use, public uploads, public Analyze before the gate, or a different privacy/consent model.

## Related RFC sections

- [Master RFC, §4.5 Minimum useful analysis gate](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#45-minimum-useful-analysis-gate)
- [Master RFC, §8 Audio и media architecture](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#8-audio-и-media-architecture)
- [Master RFC, §11 Audio AI strategy](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#11-audio-ai-strategy)
- [Master RFC, §13 Privacy, legal и security](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#13-privacy-legal-и-security)
- [Content and Dataset Schema RFC, §8 media.json](../rfc/RAP_ATLAS_V3_CONTENT_AND_DATASET_SCHEMA.md#8-mediajson)
- [Implementation Roadmap, §12.1 Minimum useful analysis gate и смена Home](../rfc/RAP_ATLAS_V3_IMPLEMENTATION_ROADMAP.md#121-minimum-useful-analysis-gate-и-смена-home)
