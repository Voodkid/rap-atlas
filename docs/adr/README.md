# RAP ATLAS 3.0 — Architecture Decision Records

Этот каталог фиксирует принятые архитектурные и продуктовые решения RAP ATLAS 3.0, которые уточняют утверждённые RFC. ADR нужен, чтобы решение, его границы, последствия и условия пересмотра можно было проверить без повторной интерпретации исходных обсуждений.

## Правила

- Номер состоит из четырёх цифр и увеличивается последовательно: `0001`, `0002` и далее.
- Один ADR описывает одно связное решение; статус, дата и связи с RFC обязательны.
- `Accepted` ADR не переписывается тихим редактированием истории. Изменение решения оформляется новым ADR, который явно заменяет или уточняет предыдущий.
- RFC сохраняют архитектурное обоснование и детальные контракты; ADR фиксируют принятое владельцем продукта решение.

## Индекс

| ADR | Status | Date | Краткое описание |
| --- | --- | --- | --- |
| [0001](0001-v3-product-scope-and-release-tracks.md) | Accepted | 2026-07-25 | Local-first hybrid, параллельные release tracks и переход Finder-first → analysis-first только после gate. |
| [0002](0002-v3-content-governance-and-taxonomy.md) | Accepted | 2026-07-25 | Владение публикацией, governance, taxonomy 3.0.0, immutable IDs, graph и gold-card/slice policy. |
| [0003](0003-v3-platform-offline-and-user-state.md) | Accepted | 2026-07-25 | Worldwide Russian-first preview, локальное состояние без аккаунта и Windows/offline baseline. |
| [0004](0004-v3-design-quality-and-ux-gates.md) | Accepted | 2026-07-25 | Обязательное качество дизайна, accessibility и UX/visual gates перед public release. |
| [0005](0005-v3-audio-rights-privacy-and-analysis-gate.md) | Accepted | 2026-07-25 | Rights-safe media, ограничения uploads/training и условия публичного Analyze. |
