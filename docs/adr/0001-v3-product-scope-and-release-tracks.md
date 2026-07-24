# 0001 — V3 product scope and release tracks

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

RAP ATLAS 2.x — действующая стабильная линия с полезным legacy corpus. Master RFC рекомендует staged migration, local-first hybrid architecture и отдельный minimum useful analysis gate, чтобы новая версия не обещала несуществующий анализ.

## Decision

RAP ATLAS 3.0 строится как local-first hybrid application. RAP ATLAS 2.x остаётся стабильной рабочей линией, а V3 развивается параллельно за отдельным route или feature flag. Big-bang rewrite запрещён.

До прохождения analysis usefulness gate public preview является Finder-first: `Find a direction` — единственное основное публичное действие. После отдельного успешного gate конечный продукт становится analysis-first, а `Analyze audio` — единственным основным действием. Публичный Analyze никогда не ведёт в placeholder, тупик или обещание «скоро».

Утверждённый preview scope ограничен read-only V3 corpus, Finder, Search, Explore, profile-aware cards, local Saved/Recent/settings и rights-safe media там, где оно доступно. Это не разрешение начинать реализацию данного scope в Stage 0.

## Consequences

- V2 остаётся пригодной для пользователей и rollback до её линии возможен независимо от V3.
- Home, navigation и публичное обещание продукта меняются только после документированного прохождения analysis gate.
- До gate offline, error и service-unavailable сценарии возвращают пользователя к Finder/Explore, а не к неработающему Analyze.
- Работа делится на независимые content, runtime, UX и analysis stages; одновременно не меняются legacy provider, новый shell и аудиопайплайн.

## Rejected alternatives

- Big-bang replacement RAP ATLAS 2.x версией 3.0.
- Public analysis CTA до полезного, проверенного результата.
- Encyclopedia-first preview с равноправными competing CTA.
- Service-first architecture, в которой сеть является источником базовых карточек.

## Risks

- Две линии продукта требуют дисциплины release/rollback и ясного обозначения V3 preview.
- Finder-first preview может не доказать ценность анализа; это допустимый результат gate, а не повод имитировать готовую функцию.
- Неудачное смешение V2 и V3 routes может нарушить стабильные deep links.

## Verification

- V3 доступна только отдельным route/feature flag, а V2 regression contract сохраняется.
- До gate public Home не показывает рабочий путь в Analyze и содержит Finder как primary CTA.
- Gate фиксирует заранее заданные usefulness, evidence, OOD/abstention, privacy/security, performance, continuity и rollback criteria.
- Public release проверяет, что failure/offline path ведёт в полезный Finder/Explore flow.

## Conditions for reconsideration

Новый ADR требуется при изменении release tracks, отмене parallel operation, изменении primary CTA до gate либо при доказательстве, что другой architecture profile лучше выполняет offline/portable и product-value constraints.

## Related RFC sections

- [Master RFC, §1 Executive summary](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#1-executive-summary)
- [Master RFC, §4.2 Primary, secondary и expert flows](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#42-primary-secondary-и-expert-flows)
- [Master RFC, §4.4 Scope версий](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#44-scope-версий)
- [Master RFC, §4.5 Minimum useful analysis gate](../rfc/RAP_ATLAS_V3_MASTER_RFC.md#45-minimum-useful-analysis-gate)
- [Implementation Roadmap, §2 Release tracks](../rfc/RAP_ATLAS_V3_IMPLEMENTATION_ROADMAP.md#2-release-tracks)
