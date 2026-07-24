# RAP ATLAS 3.0 — Stage 0 Baseline

**Status:** approved product-owner baseline
**Date:** 2026-07-25
**Scope:** documentation-only record of decisions approved after the three V3 RFCs. This document does not authorize Stage 1 implementation.

## 1. Approved MVP preview scope

RAP ATLAS 3.0 is a **local-first hybrid application** with a static, read-only content core and optional future service capabilities. RAP ATLAS 2.x remains the stable working line. V3 develops in parallel behind a separate route or feature flag; a big-bang rewrite is forbidden.

The public preview is Finder-first until the analysis usefulness gate passes:

- `Find a direction` is the single primary public action before the gate;
- Search, Finder, Explore, profile-aware cards and local Saved/Recent/settings are included in the approved preview direction;
- cards remain useful without online media;
- `Analyze` is not exposed as a public placeholder, dead end or “coming soon” flow;
- after a separately documented passing gate, the end product becomes analysis-first and `Analyze audio` becomes the single primary action.

This is a product baseline, not authorization to implement content-v3, contracts, runtime, UI or audio work during Stage 0.

## 2. Approved non-goals for the first preview

The following are outside the first-preview scope:

- public audio classifier;
- cloud upload;
- accounts;
- cross-device synchronization;
- model training;
- Content Studio;
- public editing;
- marketplace;
- social features;
- bulk migration of the 250 legacy cards;
- full English localization;
- final native ML runtime.

## 3. Decision owners and publication policy

Voodkid is the taxonomy owner, publication owner and rights decision owner.

Users may propose corrections, submit sources, report errors and correct an analysis result. They do not directly edit the canonical database. A contentious or high-impact claim requires a second domain reviewer, or an explicit single-reviewer disclosure if a second reviewer cannot be obtained.

## 4. Language, age and geography assumptions

- First-release geography: worldwide.
- First-release primary language: Russian.
- English: added later.
- Intended audience: 13+.
- First release: no account required.
- Saved, Recent and settings: local user state.
- Cloud sync: excluded from first-release scope.

These assumptions do not replace later legal/jurisdiction review for uploads, cloud processing, retention or age handling.

## 5. Windows and offline baseline

The read-only RAP ATLAS 3.0 baseline is:

| Area | Baseline |
| --- | --- |
| Operating system | Windows 10/11 x64 |
| CPU | At least four cores |
| Memory | 8 GB minimum; 16 GB recommended |
| Graphics | Integrated graphics permitted |
| Minimum display | 1366×768 |
| Primary desktop target | 1920×1080 |
| Offline guarantee | Basic cards, Finder, Search and Explore work offline |

Portable uses the shared content/domain contract with an embedded read-only corpus and local state. Required card reading does not depend on a CDN or external embed. Future audio-laboratory hardware requirements are intentionally not fixed before benchmark evidence.

## 6. Design quality statement

Professional, original, modern and visually strong design is a mandatory product decision, not optional polish. RAP ATLAS 3.0 must minimize cognitive load, present one obvious primary action, use progressive disclosure and clear visual hierarchy, and avoid a generic admin-dashboard appearance or imitation of a specific product.

The product must be approachable for newcomers and deep for experienced users, with strong typography, a consistent spacing system, deliberate dark/light themes and responsive desktop/mobile layouts. Loading, empty, error, offline and long-content states are part of the product. Keyboard navigation, WCAG 2.2 AA, reduced-motion support and functional-only animation are required. AI-related UI must not create decorative precision or hide uncertainty.

Before public release, visual regression must cover desktop/mobile, dark/light and major states, and task-based usability review must be completed. Final UI must not be implemented before all of the following exist:

1. the gold-standard card;
2. validated real content hierarchy;
3. a stable ContentRepository/runtime contract;
4. several diverse cards from the vertical slice.

After those dependencies, design is a core development stage, not a cosmetic follow-up.

## 7. Audio and media baseline

Allowed at the first stage:

- official links;
- official YouTube/SoundCloud embeds in accordance with their policies;
- owned demonstrations;
- explicitly licensed material.

Forbidden:

- downloading official tracks into the repository;
- bundling third-party MP3 files into portable;
- assuming playback rights imply training rights;
- using user uploads for training without separate explicit consent and a rights declaration.

Official-platform media is a visible official embed or source link, never extracted audio or a background-playback substitute. A card must retain useful narrative and actions when online media is unavailable.

## 8. Taxonomy baseline

- First V3 taxonomy version: `3.0.0`.
- Versioning: SemVer.
- A published entity ID is immutable.
- A rename changes the label, not the ID.
- A merge, deletion or redefinition requires a redirect, migration record or tombstone.
- Runtime shard grouping is not taxonomy.
- The graph is canonical truth; tree, families and runtime groups are projections.

## 9. Legacy policy

The 250 existing cards are not deleted. They continue serving RAP ATLAS 2.x and remain legacy archive and research material. They are neither V3 canonical content nor training truth. Individual data may move only after independent verification. Old IDs and links remain available through redirects/migrations.

## 10. Gold-card decision

`cloud-rap` is the first gold-standard card. It is authored from scratch under V3 rules. Legacy texts and research may be used only as leads; they are not automatically copied, not canonical truth, and every carried assertion must be independently checked.

## 11. Vertical-slice composition

The first vertical slice contains exactly 12 entities:

| Entity kind | Count |
| --- | ---: |
| `sound_direction` | 6 |
| `scene_context` | 2 |
| `organization` | 1 |
| `term_reference` | 2 |
| `release_reference` | 1 |

The slice includes cloud rap, a contested entity, an alias/redirect case, a card without media, a card with an official embed, a card with an owned/licensed demonstration, and different relation types.

The other eleven entity names are deliberately deferred. This approved exception to the initial Stage 0 wording lets the gold card expose real content structure and taxonomy friction first; a separate research step then selects the remaining entities. Stage 0 must not fill the list with arbitrary names.

## 12. Current technical baselines

The following are the approved current reference measurements. They are recorded, not regenerated or normalized by this document.

| Measure | Baseline |
| --- | ---: |
| Active legacy entries | 250 |
| Researched legacy entries | 250 |
| Unreviewed legacy entries | 0 |
| Tests | 10/10 |
| Client JS raw | 2,078,218 bytes |
| Client JS gzip | 495,950 bytes |
| Client JS Brotli | 365,708 bytes |
| `AtlasApp` raw | 1,806,708 bytes |
| `AtlasApp` gzip | 411,934 bytes |
| `AtlasApp` Brotli | 292,919 bytes |
| CSS raw | 54,342 bytes |
| CSS gzip | 10,593 bytes |
| CSS Brotli | 9,171 bytes |

If a reproduction measurement differs, establish whether `main` changed, record the discrepancy and do not alter product code merely to match a baseline.

## 13. Reproduction commands

Run from the repository root on the checked `main` baseline or the documentation-only Stage 0 branch:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm measure:bundle
git diff --check
```

The existing portable build command is:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File installer/build-release.ps1
```

It performs the existing portable smoke validation through `installer/validate-portable.mjs`. It writes only ignored paths under `installer/build/` and `installer/release/`, but requires Node.js, a Python interpreter with Pillow, the configured .NET Framework C# compiler, the project esbuild binary and the installer icon asset. Stage 0 does not install missing prerequisites.

## 14. Stage 0 exit checklist

- [x] `main` was verified at `b444ecf3a09e6dc9d9074e97efbe4c03cc6717fc` with PR #4 and PR #5 in history.
- [x] The preserved stash `wip: three-card content format pilot` was confirmed and not applied or dropped.
- [x] The three approved RFCs were reviewed without architectural revision.
- [x] Accepted ADRs record product/release, governance/taxonomy, platform/offline, design quality and audio/analysis decisions.
- [x] The approved MVP preview scope, non-goals, owners, audience assumptions, Windows baseline, media, taxonomy, legacy, gold card and vertical slice are recorded.
- [x] Current technical reference baselines and their reproduction commands are recorded.
- [x] Required repository verification commands complete on this branch and any measurement discrepancy is recorded below.
- [x] Portable build/smoke was attempted without installing tools; its exact blocker is recorded below as an open verification item.
- [x] Final documentation-only diff check, stat, status and stash verification complete.

### Verification record — 2026-07-25

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm measure:bundle` and `git diff --check` passed. Tests reported 10/10. Client JavaScript and `AtlasApp` exactly reproduced the approved baseline:

- Client JS: 2,078,218 raw; 495,950 gzip; 365,708 Brotli bytes.
- `AtlasApp`: 1,806,708 raw; 411,934 gzip; 292,919 Brotli bytes.

The current CSS output was reproduced by two fully sequential `pnpm build` + `pnpm measure:bundle` cycles on `main` baseline `b444ecf3a09e6dc9d9074e97efbe4c03cc6717fc`. Both produced `assets/index-CVD9Ji7J.css`, 54,342 raw, 10,593 gzip and 9,171 Brotli bytes, with SHA-256 `6b6d419743330d9b81ceb07597c4e9e51b2a25e80b0931592f1eb75cfd7398c1`.

Historical discrepancy: the earlier measurement was smaller (51,632 raw, 10,132 gzip and 8,780 Brotli bytes). No CSS-source, lockfile or build-configuration change was found between `a2db75f` and `b444ecf`; the only `package.json` change extends the test command. The cause of the older measurement cannot be confirmed without speculation. No product code was changed to force the current baseline.

Product decisions and documentation gates are accepted. Portable smoke is the only open Stage 0 verification item: the existing PowerShell 7 script starts, then stops before building because Python with Pillow is unavailable. Dependencies were intentionally not installed. Repeat the smoke in a prepared portable-build environment with an existing Python+Pillow toolchain.

## 15. Decisions intentionally deferred

- The exact eleven non-gold entity names for the vertical slice, pending gold-card research and taxonomy-friction review.
- Final ContentRepository/runtime contract, generated artifacts, schema, validators and authoring implementation.
- Final UI/component system, after the stated gold-card, hierarchy, contract and diverse-slice dependencies.
- Exact media source/review standards and the legal route for future rights-cleared assets beyond the permitted first-stage classes.
- Audio-laboratory benchmark, supported formats/duration/size, local/cloud execution profile and future hardware requirements.
- Analysis usefulness protocol thresholds and the public Analyze go/no-go decision.
- Cloud upload, retention, deletion, jurisdiction, age/legal policy and training-consent details.
- Dataset composition, rights, leakage-safe splits, benchmark governance, model/license selection and any model training.
- Account, sync, full English localization, Content Studio, corpus scaling and final native ML runtime.

## Related ADRs and RFCs

- [ADR index](../adr/README.md)
- [Master RFC](RAP_ATLAS_V3_MASTER_RFC.md)
- [Content and Dataset Schema RFC](RAP_ATLAS_V3_CONTENT_AND_DATASET_SCHEMA.md)
- [Implementation Roadmap](RAP_ATLAS_V3_IMPLEMENTATION_ROADMAP.md)
