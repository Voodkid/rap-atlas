# RAP ATLAS V3 content contract

Stage 1 contains only the authoring contract, controlled vocabularies, an empty taxonomy registry and fixture-only validation. `cards/` intentionally contains only this README: Git cannot retain an empty directory, and no placeholder card is permitted.

Each future card directory must contain `card.json`, `content.ru.md`, `evidence.json` and `review.json`. `media.json`, `locales/` and `assets/` are conditional. Do not add an empty `media.json`: its absence normalizes to an empty runtime media collection. This folder is not imported by the current application.

Run `pnpm content:v3:validate` for the empty production corpus and `pnpm content:v3:test` for fixture-only contract tests.

Markdown uses one H1 and profile-specific H2 anchors in the RFC order. Claim markers use `<!-- claims: claim-id -->`; raw HTML is prohibited.
