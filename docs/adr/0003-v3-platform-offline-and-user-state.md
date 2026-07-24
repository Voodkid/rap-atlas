# 0003 — V3 platform, offline and user state

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

The approved architecture treats web and Windows portable as equal read-only targets. Product decisions now define the first-release audience, minimum Windows profile and the boundary between local state and account/cloud capabilities.

## Decision

The first release is worldwide, Russian-first and intended for people aged 13+. English is added later. The first release requires no account. Saved items, Recent history and settings are local user state; cloud sync is outside first-release scope.

For read-only RAP ATLAS 3.0, the Windows baseline is Windows 10/11 x64, a four-core CPU, 8 GB RAM minimum, 16 GB recommended, integrated graphics permitted, 1366×768 minimum display resolution, and 1920×1080 as the primary desktop target. Basic cards, Finder, Search and Explore work offline.

The portable profile uses the shared V3 domain/content contract with an embedded offline corpus and local-state adapter. It must not require CDN access or external embeds for a card to remain useful.

## Consequences

- Russian copy and accessibility testing are the first public-language baseline; full English localization is deferred.
- Anonymous use avoids account and sync infrastructure in the first preview.
- Local Saved/Recent/settings must have explicit clear/delete behavior and redirect-aware IDs when V3 migrations arrive.
- All core read-only flows are tested on the stated Windows profile and offline; external media degrades to metadata/source-link presentation.
- Future cloud capabilities remain optional adapters rather than a dependency of card reading or discovery.

## Rejected alternatives

- Account or cloud sync as a first-release requirement.
- Network-only content delivery for the portable experience.
- A higher unverified GPU/RAM baseline for read-only discovery.
- Treating external media availability as a prerequisite to reading a card.

## Risks

- Worldwide availability and a 13+ audience still require later jurisdiction, age-policy and legal review for any upload/cloud capability.
- Local-only state can be lost when a user clears browser/application data; the product must describe that honestly.
- 8 GB/integrated-GPU support must be confirmed by measured builds, not assumed for future audio laboratory features.

## Verification

- Preview has no required sign-in or sync flow and identifies Saved/Recent/settings as local.
- Basic cards, Finder, Search and Explore pass offline smoke coverage on Windows 10/11 x64 target hardware.
- Responsive checks include 1366×768 and 1920×1080 desktop baselines.
- Portable package embeds the read-only corpus and does not fetch required card content from a network origin.

## Conditions for reconsideration

A new ADR is required before accounts, sync, changed age/geography commitments, a new primary language, a raised read-only hardware baseline, or a network dependency for basic discovery is introduced.

## Related RFC sections

- [Master RFC, §2 Зафиксированная продуктовая рамка](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#2-зафиксированная-продуктовая-рамка)
- [Master RFC, §9.4 Offline и portable](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#94-offline-и-portable)
- [Master RFC, §9.5 Platform profiles и будущий desktop wrapper](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#95-platform-profiles-и-будущий-desktop-wrapper)
- [Implementation Roadmap, §11 Этап 8 — web/Cloudflare/portable release parity](../rfc/RAP_ATLAS_V3_IMPLEMENTATION_ROADMAP.md#11-этап-8--webcloudflareportable-release-parity)
