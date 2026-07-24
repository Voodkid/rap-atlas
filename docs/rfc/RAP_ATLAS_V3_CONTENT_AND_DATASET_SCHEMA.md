# RAP ATLAS 3.0 — Content and Dataset Schema RFC

**Статус:** рекомендуемый контракт данных до реализации schema/code\
**Дата:** 24 июля 2026 года\
**Связанный документ:** `RAP_ATLAS_V3_MASTER_RFC.md`

## 1. Назначение и границы

Этот документ определяет две независимые системы:

1. **Editorial content** — то, что пользователь читает, слушает и использует в RAP ATLAS.
2. **Audio ML dataset** — лицензированные/согласованные samples, annotations, splits и evaluation artifacts.

**Решение.** Между ними разрешена только versioned связь через taxonomy/entity IDs. Текст карточки, список артистов, embeds и редакционный `confidence` не являются training labels. Dataset sample не становится публичным примером карточки автоматически.

Документ описывает будущую структуру; в рамках исследования файлы/схемы/данные не создаются.

## 2. Выбор authoring format

### 2.1 Сравнение

Оценка: 1 — неудобно/рискованно, 5 — хорошо.

| Критерий | JSON + Markdown | YAML + Markdown | TOML + Markdown | Один MDX |
|---|---:|---:|---:|---:|
| Ручное редактирование structured fields | 3 | 5 | 4 | 3 |
| Длинные тексты | 5 | 5 | 5 | 5 |
| Строгая валидация | 5 | 4 | 4 | 2 |
| Предсказуемые Git diff | 4 | 4 | 3 | 3 |
| Мультиязычность | 5 | 5 | 4 | 4 |
| Claims/provenance | 5 | 5 | 3 | 3 |
| Media/AI nested metadata | 5 | 5 | 2 | 2 |
| Schema migrations | 5 | 4 | 4 | 2 |
| Runtime generation | 5 | 4 | 4 | 3 |
| Solo workflow | 4 | 4 | 3 | 4 |
| Будущая админка | 5 | 4 | 4 | 2 |
| Security/build isolation | 5 | 4 | 5 | 1 |
| Windows/Cloudflare/offline | 5 | 5 | 5 | 3 |

**Решение:** JSON + Markdown.

Почему:

- JSON не имеет executable semantics, anchors или implicit types;
- JSON Schema 2020-12 даёт cross-language contract ([JSON Schema](https://json-schema.org/specification), проверено 24.07.2026);
- Markdown подходит длинной русской прозе, review diff и localization;
- raw HTML в Markdown отключается, claim markers остаются data-only comments;
- future Studio может читать/писать те же файлы;
- build может компилировать их в JSON assets, static modules или portable resource.

**Отклонено:**

- YAML более дружелюбен для коротких записей, но его anchors, tags и правила keys повышают стоимость безопасной нормализации ([YAML 1.2.2](https://yaml.org/spec/1.2.2/), проверено 24.07.2026).
- TOML хорош для configuration, но массивы nested relations/evidence/media быстро становятся трудно обозримыми ([TOML 1.0.0](https://toml.io/en/v1.0.0), проверено 24.07.2026).
- MDX официально сочетает Markdown с JSX/JavaScript module semantics; карточка не должна быть программой или зависеть от component imports ([MDX documentation](https://mdxjs.com/docs/), проверено 24.07.2026).
- SQLite допустим как **generated portable runtime** только после доказанной необходимости ad-hoc queries. Как source of truth он ухудшает Git diff, review и merge.

## 3. Уровни версий

Нельзя использовать одно поле `version` для разных изменений:

- `schemaVersion`: SemVer контракта файлов, например `1.0.0`;
- `taxonomyVersion`: SemVer модели entities/relations, например `3.0.0`;
- `contentRevision`: монотонный integer внутри карточки;
- `contentRelease`: immutable release ID, например `2026.07.24.1`;
- `mediaManifestVersion`: версия media contract;
- `datasetVersion`: отдельная immutable dataset release;
- `annotationGuidelineVersion`: версия инструкции annotators;
- `modelVersion`: внешний к content/dataset identifier.

Breaking schema migration изменяет major; additive optional field — minor; clarification/validation bug без изменения shape — patch. Build хранит `minReaderVersion` и отказывается молча читать несовместимый major.

## 4. Структура `content-v3`

```text
content-v3/
├─ README.md
├─ schemas/
│  ├─ card.schema.json
│  ├─ evidence.schema.json
│  ├─ media.schema.json
│  ├─ review.schema.json
│  └─ content-release.schema.json
├─ vocabularies/
│  ├─ entity-kinds.json
│  ├─ relation-types.json
│  ├─ production-traits.json
│  ├─ source-types.json
│  └─ rights-statuses.json
├─ taxonomy/
│  ├─ taxonomy.json
│  ├─ redirects.json
│  └─ migrations/
│     └─ <from>-to-<to>.json
└─ cards/
   └─ <stable-card-id>/
      ├─ card.json
      ├─ content.ru.md
      ├─ evidence.json
      ├─ review.json
      ├─ media.json                     # conditional
      ├─ locales/                       # conditional
      │  └─ content.<locale>.md
      └─ assets/                        # conditional
         └─ <owned-or-licensed-asset>
```

Обязательные файлы каждой карточки:

- `card.json`;
- `content.ru.md`;
- `evidence.json`;
- `review.json`.

Условные элементы:

- `media.json` создаётся только при наличии media references/assets либо явной необходимости хранить media lifecycle, например removed/rights-expired tombstone;
- `locales/` создаётся только при наличии хотя бы одного перевода;
- `assets/` создаётся только при наличии owned/licensed assets, перечисленных в `media.json`.

Пустые каталоги, пустой `media.json` и placeholder-файлы запрещены. Отсутствие media — нормальное состояние карточки, а не ошибка completeness.

### 4.1 Ответственность файлов карточки

| Файл | Обязательность | Ответственность | Чего в нём нет |
|---|---|---|---|
| `card.json` | обязательный | identity, `contentProfile`, kind/status, labels, aliases, profile data, relations, entity references, localization registry | длинной prose, source bibliography, media bytes |
| `content.ru.md` | обязательный | последовательный русский editorial narrative по выбранному content profile | JSX, scripts, authoritative structured IDs |
| `evidence.json` | обязательный | sources, claims, evidence links, contradictions/inferences | пользовательского runtime state |
| `review.json` | обязательный | lifecycle, reviewers, review/publication/migration history | Git diff replacement или secrets |
| `media.json` | условный | references/assets, segments, rights, derived variants/features или media tombstones | user uploads и training splits |
| `locales/content.<locale>.md` | условный | перевод narrative с теми же применимыми section/claim anchors | новая независимая factual truth |
| `assets/*` | условный | только owned/licensed files с manifest entry | скачанные official tracks |

### 4.2 Нормализация отсутствующего media

Generator рассматривает отсутствие `media.json` как осознанное значение:

```json
{
  "media": {
    "references": [],
    "assets": [],
    "derivedAssets": [],
    "playlists": []
  },
  "mediaSourceState": "absent"
}
```

Это generated canonical/runtime representation, а не файл, который автор должен создать. Если `media.json` отсутствует, validator запрещает `assets/`, media IDs в Markdown/structured data и media-dependent lifecycle flags. Если он присутствует, в нём должен быть хотя бы один reference, asset, derived/lifecycle record или playlist с существующими items. Generator выдаёт единый runtime shape в обоих случаях, поэтому UI не содержит ветвление по наличию authoring file.

## 5. `card.json`

### 5.1 Обязательная модель

```json
{
  "schemaVersion": "1.0.0",
  "taxonomyVersion": "3.0.0",
  "contentRevision": 1,
  "id": "stable-id",
  "kind": "microgenre",
  "contentProfile": "sound_direction",
  "status": "canonical",
  "preferredLabels": {
    "ru": "Название",
    "en": "Name"
  },
  "aliases": [],
  "summary": {
    "ru": "Короткое определение."
  },
  "navigation": {
    "primaryGroupId": "group-id",
    "secondaryGroupIds": []
  },
  "profileData": {
    "traits": {},
    "productionGuidance": {}
  },
  "entityReferences": {},
  "relations": [],
  "search": {},
  "localization": {},
  "editorialFlags": {}
}
```

### 5.2 Identity

- `id`: immutable ASCII lowercase kebab-case. Display label может меняться без смены ID.
- `kind`: только controlled vocabulary.
- `contentProfile`: обязательный discriminant, однозначно выводимый из `kind` в schema version 1.x.
- `status`: `canonical | contested | provisional | deprecated | archived`.
- `preferredLabels`: BCP 47 locale map; `ru` обязателен для первой версии.
- `aliases[]`: `{label, locale, kind, validFrom?, validTo?, claimIds[]}`. Alias kind: `common`, `historical`, `search`, `misspelling`, `external`.
- `summary`: только editorial abstract; factual fragments также имеют claim references через `summaryClaimIds`.
- `redirects` не лежат в карточке: routing registry должен работать и после удаления/архивации folder.

### 5.3 Entity-specific content profiles

Один музыкально-ориентированный Markdown template нельзя применять ко всем entity kinds. `contentProfile` определяет структуру narrative и допустимое `profileData`, но не создаёт отдельное приложение или независимый тип карточки.

#### 5.3.1 Mapping entity kind → profile

| Content profile | Entity kinds |
|---|---|
| `sound_direction` | `genre`, `microgenre`, `artist_style`, `producer_style`, `production_technique` |
| `scene_context` | `scene`, `regional_scene` |
| `organization` | `collective`, `label` |
| `term_reference` | `search_tag`, `type_beat_tag`, `aesthetic_tag`, `meme`, `service_group`, `unconfirmed_term` |
| `release_reference` | `release` |

`aesthetic` в UI/редакторской речи нормализуется в entity kind `aesthetic_tag`. Mapping фиксирован в schema/vocabulary release. Автор не может выбрать более удобный profile вручную для того же `kind`. Если практика покажет, что kind требует другого profile, меняются schema/mapping с migration, а не одна карточка-исключение.

#### 5.3.2 Общая последовательная рамка

Каждая карточка использует один page shell:

1. identity header из `card.json`;
2. обязательный Markdown `overview`;
3. profile-specific sections в заданном порядке;
4. relation neighborhood, если есть relations или relation prose;
5. sources/review footer, генерируемый из `evidence.json` и `review.json`.

`overview`, identity и sources/review — общие. `relations` — общая допустимая секция, которая рендерится только при наличии meaningful content/edges. UI строит одну последовательную страницу и использует общий section registry, typography, anchors, disclosures, evidence и media components. Меняются состав и порядок секций, а не navigation model или отдельный UI shell.

#### 5.3.3 Section contracts

| Profile | Обязательные Markdown sections | Допустимые дополнительные sections |
|---|---|---|
| `sound_direction` | `overview`, `sound`, `make` | `listen`, `check`, `tools`, `people`, `context`, `relations`, `history` |
| `scene_context` | `overview`, `context`, `place-time`, `participants` | `sound`, `listen`, `key-releases`, `timeline`, `production`, `relations`, `history` |
| `organization` | `overview`, `role`, `people-catalog` | `activity`, `sound`, `key-releases`, `timeline`, `context`, `relations`, `history` |
| `term_reference` | `overview`, `meaning`, `usage-boundaries` | `origin`, `sound-cues`, `examples`, `confusions`, `context`, `relations`, `history` |
| `release_reference` | `overview`, `release-context`, `credits` | `sound`, `listen`, `track-map`, `production`, `influence-reception`, `context`, `relations` |

Правила:

- обязательная секция должна содержать substantive content или блокирует `published`; `needs_research` допустим в draft, но не заменяет published material;
- optional section отсутствует, если для неё нет содержания; пустой heading и generic filler запрещены;
- `listen` разрешена только при наличии `media.json` с playable/reference record;
- отсутствие optional `sound` у scene/organization/term/release не является content gap;
- `unconfirmed_term` может честно иметь короткие `meaning` и `usage-boundaries`, но должен объяснять uncertainty и статус evidence;
- relation/source blocks могут быть сгенерированы из structured data и не требуют пустого Markdown heading.

#### 5.3.4 Discriminated JSON Schema

`card.schema.json` использует `oneOf` по паре `contentProfile` + `kind`:

```json
{
  "allOf": [
    {
      "$ref": "#/$defs/baseCard"
    },
    {
      "oneOf": [
        {
          "properties": {
            "contentProfile": {"const": "sound_direction"},
            "kind": {
              "enum": [
                "genre",
                "microgenre",
                "artist_style",
                "producer_style",
                "production_technique"
              ]
            },
            "profileData": {"$ref": "#/$defs/soundDirectionData"},
            "analysisHints": {"$ref": "#/$defs/analysisHints"}
          }
        },
        {
          "properties": {
            "contentProfile": {"const": "scene_context"},
            "kind": {"enum": ["scene", "regional_scene"]},
            "profileData": {"$ref": "#/$defs/sceneContextData"}
          }
        },
        {
          "properties": {
            "contentProfile": {"const": "organization"},
            "kind": {"enum": ["collective", "label"]},
            "profileData": {"$ref": "#/$defs/organizationData"}
          }
        },
        {
          "properties": {
            "contentProfile": {"const": "term_reference"},
            "kind": {
              "enum": [
                "search_tag",
                "type_beat_tag",
                "aesthetic_tag",
                "meme",
                "service_group",
                "unconfirmed_term"
              ]
            },
            "profileData": {"$ref": "#/$defs/termReferenceData"}
          }
        },
        {
          "properties": {
            "contentProfile": {"const": "release_reference"},
            "kind": {"const": "release"},
            "profileData": {"$ref": "#/$defs/releaseReferenceData"}
          }
        }
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

Минимальные responsibilities `$defs`:

| `$defs` branch | Обязательные structured keys | Допустимые structured additions |
|---|---|---|
| `soundDirectionData` | `traits`, `productionGuidance` | production checks, comparison rules, confusables |
| `sceneContextData` | `scopes`, `participantEntityIds` | key releases, sound observations, timeline events |
| `organizationData` | `role`, `peopleOrCatalogEntityIds` | activity period, releases, affiliations |
| `termReferenceData` | `usageStatus`, `usageContexts` | origin, sound cues, confusables, external search forms |
| `releaseReferenceData` | `releaseMetadata`, `creditEntityIds` | track map, production observations, influence/reception |

Schema-level key может быть пустым только в draft, если `review.json` содержит blocking coverage issue. Publication validation требует substantive data для обязательных profile fields; это предотвращает формально валидные пустые arrays/objects.

`baseCard` определяет и требует общие fields, включая `kind`, `contentProfile` и `profileData`; profile-specific fields объявляет только совпавшая branch. Внешний `unevaluatedProperties: false` закрывает несовместимые fields: например, `analysisHints` определён только для `sound_direction`. JSON Schema валидирует discriminant/structured data; Markdown profile validator разбирает section IDs, проверяет required/allowed set, порядок и зависимость `listen → media.json`. Оба отчёта входят в один publication gate.

### 5.4 Traits

`profileData.traits` в `sound_direction` описывает диапазоны и наблюдаемые признаки, а не абсолютные genre rules. Для других profiles sound observations хранятся в их собственных optional fields и не требуют пустой структуры traits:

```json
{
  "tempo": {
    "bpmTypical": {"min": 120, "max": 150},
    "halfTimeInterpretation": true,
    "confidence": "medium",
    "claimIds": ["claim-example-tempo"]
  },
  "rhythm": [
    {
      "traitId": "syncopated-hi-hats",
      "salience": "common",
      "variation": "varies",
      "claimIds": []
    }
  ],
  "bass": [],
  "drums": [],
  "melody": [],
  "timbre": [],
  "structure": []
}
```

В реальных карточках значения не публикуются без evidence или явной пометки `editorial_inference`. `salience`: `defining | common | optional | atypical`. `variation` запрещает превращать typical range в жёсткое правило.

### 5.5 Production guidance

```json
{
  "priorities": [
    {
      "id": "guidance-kick-space",
      "order": 1,
      "task": {"ru": "Что сделать"},
      "why": {"ru": "Почему это слышно"},
      "beginnerSteps": [{"ru": "Проверяемый шаг"}],
      "expertNotes": [{"ru": "Раскрываемая деталь"}],
      "antiPatterns": [{"ru": "Типичная ошибка"}],
      "traitIds": ["trait-id"],
      "claimIds": ["claim-id"]
    }
  ],
  "checklist": [],
  "acceptableVariation": [],
  "targetComparisonRules": []
}
```

Числовой parameter не объявляется universal preset. Для каждого range указывается unit, context, source/claim и confidence. Guidance может быть редакционным выводом, но тип должен быть явным.

### 5.6 Tools, kits, plugins

`entityReferences.tools[]` хранит recommendation как задачу:

```json
{
  "entityId": "tool-or-plugin-entity-id",
  "role": "bass-saturation",
  "recommendationKind": "capability_example",
  "commercialRelationship": "none_declared",
  "checkedAt": "2026-07-24",
  "claimIds": []
}
```

Не допускаются affiliate URLs без disclosure, недатированные compatibility claims и «обязательные» покупки. Kits/plugins являются typed entities или external references, а не свободным HTML.

### 5.7 Relations

```json
{
  "id": "rel-source-target-type",
  "type": "influenced-by",
  "sourceId": "stable-id",
  "targetId": "other-id",
  "direction": "outbound",
  "scope": {
    "time": {"from": null, "to": null},
    "regionIds": [],
    "productionAspectIds": []
  },
  "status": "asserted",
  "confidence": "medium",
  "claimIds": ["claim-relation-001"],
  "taxonomyVersionIntroduced": "3.0.0"
}
```

Relation types:

- lineage: `derived-from`, `branch-of`, `regional-branch-of`, `revival-of`, `producer-variant-of`;
- influence/context: `influenced-by`, `member-of`, `associated-with`;
- comparison: `often-confused-with`, `overlaps-with`;
- naming: `alias-of`, `historical-alias-of`, `search-alias-of`.

Validation:

- targets существуют или являются tombstone/declared external entity;
- `overlaps-with` и `often-confused-with` генерируют/проверяют symmetric projection;
- self-edge запрещён, кроме специально разрешённой migration record;
- `branch-of` и `regional-branch-of` проверяются на cycle;
- `influenced-by` не используется вместо `derived-from`;
- alias edge не заменяет routing redirect;
- каждая asserted semantic edge имеет claim.

### 5.8 Search, Finder и AI-oriented labels

`search` содержит редакционные discovery terms, но не runtime tokenization output:

```json
{
  "terms": [
    {"value": "example term", "locale": "en", "kind": "search_alias"}
  ],
  "artistReferenceIds": [],
  "producerReferenceIds": [],
  "aestheticTagIds": []
}
```

`analysisHints` — условное поле только для `sound_direction` и **не training labels**:

```json
{
  "eligibleForAutomatedSuggestion": false,
  "traitVocabularyIds": ["dark-timbre"],
  "confusableEntityIds": ["other-id"],
  "knownBlindSpots": [{"ru": "Описание ограничения"}],
  "reviewedAgainstDatasetVersion": null
}
```

Поле позволяет result explainer связать измеренные traits с карточкой. `oneOf` branches других profiles запрещают его: scene/organization/term/release не получают audio-analysis eligibility по умолчанию. Оно не содержит classifier probability, embeddings или raw sample references.

## 6. Markdown narrative и localization

### 6.1 Последовательная структура по content profile

`content.ru.md` содержит только секции, разрешённые выбранным `contentProfile`. Ниже — полный пример для `sound_direction`, а не universal template:

```markdown
# <preferred label>

## Кратко {#overview}
## Как это звучит {#sound}
## Что послушать {#listen}
## Как повторить {#make}
## Как проверить свой бит {#check}
## Инструменты и звуки {#tools}
## Артисты, продюсеры и сцены {#people}
## Связи и похожие направления {#relations}
## История и спорные вопросы {#history}
```

Для `scene_context`, `organization`, `term_reference` и `release_reference` validator использует section contracts из §5.3.3. Порядок profile-specific: автор не переставляет sections произвольно, поэтому UI и keyboard anchors остаются предсказуемыми. Пустой optional раздел не создаётся. Если обязательный раздел ещё не исследован, draft получает coverage issue в `review.json`; published card блокируется вместо показа `needs_research` пользователю.

### 6.2 Claim marker

Перед абзацем или list item:

```markdown
<!-- claims: claim-origin-001 claim-date-002 -->
Редакционное утверждение, которое подтверждают эти claims.
```

Build:

1. разбирает comment;
2. проверяет существование claim;
3. присоединяет IDs к следующему semantic block;
4. удаляет comment из rendered HTML;
5. raw HTML в остальном запрещает.

Для одного точного поля лучше structured `fieldPath` claim, а не Markdown marker. Citation UI показывает short source list у блока, полный evidence — в disclosure.

### 6.3 Localization

- `content.ru.md` — canonical editorial locale первой версии.
- `locales/content.en.md` повторяет применимый profile section set/order и claim markers.
- Перевод не создаёт новые source claims; расхождение facts является content revision.
- `preferredLabels/summary/UI strings` локализуются в structured maps.
- `translationStatus`: `missing | draft | reviewed | stale`.
- Изменение canonical block помечает связанные translations `stale`.
- Search aliases могут быть locale-specific и иметь собственный evidence/status.
- Машинный перевод допустим только как `draft`; publication требует reviewer.

## 7. `evidence.json`

### 7.1 Source

```json
{
  "id": "source-001",
  "type": "artist_interview",
  "primaryStatus": "primary",
  "title": "Название",
  "creator": ["Автор"],
  "publisher": "Издатель",
  "url": "https://...",
  "archiveUrl": null,
  "publishedAt": "2025-01-01",
  "accessedAt": "2026-07-24",
  "language": "en",
  "rights": {
    "quotationAllowed": "unknown",
    "mediaReuseAllowed": false,
    "notes": "Источник используется как citation, не как media grant."
  },
  "availability": "available",
  "reliabilityNotes": "Что источник может и не может подтвердить."
}
```

Controlled `type`: `official_statement`, `artist_interview`, `producer_interview`, `release_metadata`, `academic`, `book`, `archive`, `platform_metadata`, `primary_audio`, `professional_secondary`, `press_secondary`, `community_lead`, `legacy_internal`, `other`.

`primaryStatus`: `primary | secondary | tertiary | unknown`. Первичность не равна качеству: self-description может подтверждать позицию автора, но не весь historical claim.

### 7.2 Claim

```json
{
  "id": "claim-origin-001",
  "kind": "factual",
  "text": {
    "ru": "Атомарное проверяемое утверждение."
  },
  "fieldPath": null,
  "scope": {
    "entityIds": ["stable-id"],
    "sectionIds": ["history"],
    "time": null,
    "regions": []
  },
  "status": "supported",
  "confidence": "medium",
  "evidenceIds": ["evidence-001"],
  "contradictionGroupId": null,
  "reviewedBy": ["reviewer-owner"],
  "reviewedAt": "2026-07-24"
}
```

`kind`: `factual | definition | classification | relation | measurement | editorial_inference | contested`.

`status`: `unresearched | weakly_supported | supported | contradicted | mixed | deprecated`.

### 7.3 Evidence link

```json
{
  "id": "evidence-001",
  "sourceId": "source-001",
  "relation": "supports",
  "locator": {
    "page": null,
    "heading": "Раздел",
    "timestamp": {"startMs": 62000, "endMs": 78000},
    "quoteHash": null
  },
  "note": {
    "ru": "Что именно подтверждает источник; без длинной цитаты."
  },
  "accessedAt": "2026-07-24"
}
```

`relation`: `supports | contradicts | qualifies | background`. `background` не повышает claim confidence.

### 7.4 Confidence rubric

- `high`: несколько независимых сильных sources или однозначный authoritative primary record; scope совпадает.
- `medium`: один сильный source либо несколько согласующихся secondary sources; остаётся ограничение.
- `low`: indirect evidence, community lead, legacy import или unresolved conflict.

Это editorial evidence confidence. Оно не смешивается с model confidence, annotation agreement или maturity.

### 7.5 Citation coverage gate

Обязательный claim-level coverage:

- canonical kind/status и definition boundaries;
- origin/date/region;
- artist/producer/collective/release association;
- semantic relations;
- numeric tempo/production claims;
- historical disputes и aliases;
- product/tool compatibility или availability.

Допустимый section-level coverage:

- общий listening description;
- synthesis production workflow;
- narrative transitions.

`legacy_internal` может быть lead, но published claim требует независимого source либо явного `unverified_legacy` disclosure.

## 8. `media.json`

`media.json` условный. Если у карточки нет media references/assets и нечего отслеживать в media lifecycle, файл отсутствует; generator создаёт пустую normalized runtime collection по §4.2. Пустой manifest автор не создаёт.

### 8.1 Unified reference, separate capabilities

```json
{
  "schemaVersion": "1.0.0",
  "entityId": "stable-id",
  "references": [],
  "assets": [],
  "derivedAssets": [],
  "playlists": []
}
```

#### Official reference

```json
{
  "id": "media-ref-001",
  "kind": "official_track",
  "platform": "youtube",
  "externalId": "platform-id",
  "canonicalUrl": "https://...",
  "title": "Track title",
  "artistEntityIds": [],
  "releaseEntityId": null,
  "segments": [
    {
      "startMs": 45000,
      "endMs": 65000,
      "role": "core_example",
      "annotation": {"ru": "На что обратить внимание"},
      "traitIds": ["trait-id"]
    }
  ],
  "playbackMode": "official_embed",
  "availability": {
    "status": "available",
    "checkedAt": "2026-07-24"
  },
  "rights": {
    "copyAllowed": false,
    "offlineAllowed": false,
    "trainingAllowed": false,
    "basis": "official_embed_only"
  },
  "claimIds": []
}
```

#### Owned/licensed asset

```json
{
  "id": "asset-001",
  "kind": "owned_demo",
  "objectKey": "content/<content-release>/<sha256>.flac",
  "sha256": "<hex>",
  "mime": "audio/flac",
  "bytes": 123456,
  "durationMs": 12000,
  "sampleRate": 48000,
  "channels": 2,
  "rights": {
    "status": "owned",
    "rightsHolder": "RAP ATLAS",
    "grantDocumentId": null,
    "territories": ["worldwide"],
    "expiresAt": null,
    "webPlaybackAllowed": true,
    "offlineAllowed": true,
    "trainingAllowed": false,
    "derivativesAllowed": true,
    "checkedAt": "2026-07-24"
  }
}
```

#### Derived asset

```json
{
  "id": "derived-waveform-001",
  "sourceAssetId": "asset-001",
  "kind": "waveform",
  "objectKey": "derived/<sha256>/waveform-v1.json",
  "generator": {
    "name": "waveform-generator",
    "version": "1.0.0",
    "parametersHash": "<hex>"
  },
  "sha256": "<hex>",
  "deletionPolicy": "delete_with_source"
}
```

Extracted features/embeddings карточного asset не становятся dataset row. Для user uploads они хранятся только в private analysis store.

### 8.2 Rights rules

- неизвестное право означает `false`, не optimistic default;
- `webPlaybackAllowed`, `offlineAllowed`, `trainingAllowed`, `derivativesAllowed` независимы;
- `licenseName` не заменяет grant scope/document;
- expiry/territory должны влиять на build;
- portable manifest отфильтровывает `offlineAllowed=false`;
- platform embed никогда не превращается build step в downloaded asset;
- removed media остаётся metadata tombstone для audit, но не UI dead control.

YouTube и SoundCloud policies должны проверяться adapter owner перед release; snapshot links: [YouTube policies](https://developers.google.com/youtube/terms/developer-policies-guide), [SoundCloud API Terms](https://developers.soundcloud.com/docs/api/terms-of-use), проверено 24.07.2026.

## 9. `review.json`

```json
{
  "schemaVersion": "1.0.0",
  "entityId": "stable-id",
  "state": "draft",
  "owner": "owner-id",
  "coverage": {
    "identity": "incomplete",
    "production": "incomplete",
    "history": "incomplete",
    "sources": "incomplete",
    "mediaRights": "incomplete",
    "localization": {"ru": "draft"}
  },
  "reviews": [],
  "publicationHistory": [],
  "legacyProvenance": [],
  "openIssues": []
}
```

Review event:

```json
{
  "id": "review-001",
  "kind": "editorial",
  "reviewer": "reviewer-id",
  "startedAt": "2026-07-24",
  "completedAt": null,
  "checklistVersion": "1.0.0",
  "result": "changes_requested",
  "notes": "Краткое решение, не секрет."
}
```

State transitions:

```text
draft
  → researching
  → review_ready
  → reviewed
  → published
  → needs_update
  → reviewed/published
  → archived
```

`published` не редактируется in-place для release: change создаёт новый `contentRevision` и проходит review. Git сохраняет file history; `review.json` сохраняет domain decision history.

## 10. Полный демонстрационный пример одной карточки

> **Важно:** все данные ниже — демонстрационные (`example.invalid`, вымышленные лица/релизы, условные ranges). Они не заявляют научную, историческую или музыкальную достоверность и не должны публиковаться или использоваться для обучения.

```text
content-v3/cards/example-cloud-rap/
├─ card.json
├─ content.ru.md
├─ evidence.json
├─ media.json
├─ review.json
├─ locales/
│  └─ content.en.md
└─ assets/
   ├─ example-owned-demo.flac
   └─ example-cover.webp
```

### 10.1 `card.json` — example

```json
{
  "schemaVersion": "1.0.0",
  "taxonomyVersion": "3.0.0-example",
  "contentRevision": 1,
  "id": "example-cloud-rap",
  "kind": "microgenre",
  "contentProfile": "sound_direction",
  "status": "provisional",
  "preferredLabels": {
    "ru": "Демонстрационное облачное направление",
    "en": "Example Cloud Direction"
  },
  "aliases": [
    {
      "label": "Example cloud tag",
      "locale": "en",
      "kind": "search",
      "claimIds": ["claim-example-alias"]
    }
  ],
  "summary": {
    "ru": "Демонстрационный текст для показа структуры, не описание реального жанра.",
    "en": "Demonstration-only schema text, not a real genre claim."
  },
  "summaryClaimIds": ["claim-example-definition"],
  "navigation": {
    "primaryGroupId": "example-navigation-group",
    "secondaryGroupIds": []
  },
  "profileData": {
    "traits": {
      "tempo": {
        "bpmTypical": {"min": 100, "max": 140},
        "halfTimeInterpretation": true,
        "confidence": "low",
        "claimIds": ["claim-example-tempo"]
      },
      "rhythm": [
        {
          "traitId": "example-loose-rhythm",
          "salience": "common",
          "variation": "varies",
          "claimIds": ["claim-example-rhythm"]
        }
      ],
      "bass": [],
      "drums": [],
      "melody": [],
      "timbre": [
        {
          "traitId": "example-soft-timbre",
          "salience": "optional",
          "variation": "varies",
          "claimIds": ["claim-example-timbre"]
        }
      ],
      "structure": []
    },
    "productionGuidance": {
      "priorities": [
        {
          "id": "guidance-example-space",
          "order": 1,
          "task": {"ru": "Оставьте место между демонстрационными слоями."},
          "why": {"ru": "Это только пример формата объяснения."},
          "beginnerSteps": [{"ru": "Уберите один тестовый слой и сравните A/B."}],
          "expertNotes": [],
          "antiPatterns": [{"ru": "Не воспринимайте этот пример как реальный preset."}],
          "traitIds": ["example-soft-timbre"],
          "claimIds": ["claim-example-guidance"]
        }
      ],
      "checklist": [],
      "acceptableVariation": [],
      "targetComparisonRules": []
    }
  },
  "entityReferences": {
    "artists": ["example-artist-a"],
    "producers": ["example-producer-a"],
    "releases": ["example-release-a"],
    "tools": [
      {
        "entityId": "example-tool-a",
        "role": "demonstration-only",
        "recommendationKind": "capability_example",
        "commercialRelationship": "none_declared",
        "checkedAt": "2026-07-24",
        "claimIds": ["claim-example-tool"]
      }
    ]
  },
  "relations": [
    {
      "id": "rel-example-cloud-overlaps-example-neighbor",
      "type": "overlaps-with",
      "sourceId": "example-cloud-rap",
      "targetId": "example-neighbor",
      "direction": "outbound",
      "scope": {"time": null, "regionIds": [], "productionAspectIds": []},
      "status": "asserted",
      "confidence": "low",
      "claimIds": ["claim-example-relation"],
      "taxonomyVersionIntroduced": "3.0.0-example"
    }
  ],
  "search": {
    "terms": [
      {"value": "example cloudy", "locale": "en", "kind": "aesthetic"}
    ],
    "artistReferenceIds": ["example-artist-a"],
    "producerReferenceIds": ["example-producer-a"],
    "aestheticTagIds": ["example-soft"]
  },
  "analysisHints": {
    "eligibleForAutomatedSuggestion": false,
    "traitVocabularyIds": ["example-loose-rhythm", "example-soft-timbre"],
    "confusableEntityIds": ["example-neighbor"],
    "knownBlindSpots": [
      {"ru": "Все данные демонстрационные; automated suggestion запрещён."}
    ],
    "reviewedAgainstDatasetVersion": null
  },
  "localization": {
    "canonicalLocale": "ru",
    "availableLocales": ["ru", "en"],
    "translationStatus": {"ru": "draft", "en": "draft"}
  },
  "editorialFlags": {
    "demonstrationOnly": true,
    "needsIndependentResearch": true
  }
}
```

### 10.2 `content.ru.md` — example

```markdown
# Демонстрационное облачное направление

> Все сведения на этой странице являются примером структуры.

## Кратко {#overview}

<!-- claims: claim-example-definition -->
Это demonstration-only карточка профиля `sound_direction`.

## Как это звучит {#sound}

<!-- claims: claim-example-rhythm claim-example-timbre -->
В демонстрационном описании ритм назван свободным, а тембр — мягким.

## Что послушать {#listen}

Используйте только вымышленный owned demo из примера media manifest.

## Как повторить {#make}

<!-- claims: claim-example-guidance -->
Сделайте A/B-проверку с одним удалённым слоем. Это пример действия, не
универсальная производственная рекомендация.

## Как проверить свой бит {#check}

Сравните два тестовых renders; automated classifier для этой карточки отключён.

## Инструменты и звуки {#tools}

<!-- claims: claim-example-tool -->
Упомянутый инструмент — вымышленный placeholder.

## Артисты, продюсеры и сцены {#people}

Все entity IDs в разделе вымышлены.

## Связи и похожие направления {#relations}

<!-- claims: claim-example-relation -->
Связь существует только для демонстрации graph edge.

## История и спорные вопросы {#history}

Исторические утверждения отсутствуют.
```

### 10.3 `evidence.json` — example

```json
{
  "schemaVersion": "1.0.0",
  "entityId": "example-cloud-rap",
  "sources": [
    {
      "id": "source-example-001",
      "type": "other",
      "primaryStatus": "unknown",
      "title": "Demonstration source — not real evidence",
      "creator": ["Example Author"],
      "publisher": "Example Publisher",
      "url": "https://example.invalid/source",
      "archiveUrl": null,
      "publishedAt": null,
      "accessedAt": "2026-07-24",
      "language": "en",
      "rights": {
        "quotationAllowed": "unknown",
        "mediaReuseAllowed": false,
        "notes": "Demonstration only."
      },
      "availability": "demonstration_only",
      "reliabilityNotes": "Не является источником."
    }
  ],
  "evidence": [
    {
      "id": "evidence-example-001",
      "sourceId": "source-example-001",
      "relation": "background",
      "locator": {
        "page": null,
        "heading": null,
        "timestamp": null,
        "quoteHash": null
      },
      "note": {"ru": "Технический placeholder, ничего не подтверждает."},
      "accessedAt": "2026-07-24"
    }
  ],
  "claims": [
    {
      "id": "claim-example-definition",
      "kind": "editorial_inference",
      "text": {"ru": "Демонстрационное определение."},
      "fieldPath": "/summary/ru",
      "scope": {
        "entityIds": ["example-cloud-rap"],
        "sectionIds": [],
        "time": null,
        "regions": []
      },
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": ["evidence-example-001"],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-alias",
      "kind": "editorial_inference",
      "text": {"ru": "Демонстрационный alias."},
      "fieldPath": "/aliases/0",
      "scope": {"entityIds": ["example-cloud-rap"], "sectionIds": [], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-tempo",
      "kind": "measurement",
      "text": {"ru": "Демонстрационный BPM range."},
      "fieldPath": "/profileData/traits/tempo",
      "scope": {"entityIds": ["example-cloud-rap"], "sectionIds": ["sound"], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-rhythm",
      "kind": "editorial_inference",
      "text": {"ru": "Демонстрационная ритмическая черта."},
      "fieldPath": "/profileData/traits/rhythm/0",
      "scope": {"entityIds": ["example-cloud-rap"], "sectionIds": ["sound"], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-timbre",
      "kind": "editorial_inference",
      "text": {"ru": "Демонстрационная тембральная черта."},
      "fieldPath": "/profileData/traits/timbre/0",
      "scope": {"entityIds": ["example-cloud-rap"], "sectionIds": ["sound"], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-guidance",
      "kind": "editorial_inference",
      "text": {"ru": "Демонстрационная production guidance."},
      "fieldPath": "/profileData/productionGuidance/priorities/0",
      "scope": {"entityIds": ["example-cloud-rap"], "sectionIds": ["make"], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-tool",
      "kind": "editorial_inference",
      "text": {"ru": "Демонстрационная tool reference."},
      "fieldPath": "/entityReferences/tools/0",
      "scope": {"entityIds": ["example-cloud-rap"], "sectionIds": ["tools"], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    },
    {
      "id": "claim-example-relation",
      "kind": "relation",
      "text": {"ru": "Демонстрационная graph relation."},
      "fieldPath": "/relations/0",
      "scope": {"entityIds": ["example-cloud-rap", "example-neighbor"], "sectionIds": ["relations"], "time": null, "regions": []},
      "status": "unresearched",
      "confidence": "low",
      "evidenceIds": [],
      "contradictionGroupId": null,
      "reviewedBy": [],
      "reviewedAt": null
    }
  ],
  "contradictions": []
}
```

### 10.4 `media.json` — example

```json
{
  "schemaVersion": "1.0.0",
  "entityId": "example-cloud-rap",
  "references": [],
  "assets": [
    {
      "id": "asset-example-demo",
      "kind": "owned_demo",
      "path": "assets/example-owned-demo.flac",
      "sha256": "<example-sha256>",
      "mime": "audio/flac",
      "bytes": 123456,
      "durationMs": 8000,
      "sampleRate": 48000,
      "channels": 2,
      "rights": {
        "status": "demonstration_only",
        "rightsHolder": "Example",
        "grantDocumentId": null,
        "territories": [],
        "expiresAt": null,
        "webPlaybackAllowed": false,
        "offlineAllowed": false,
        "trainingAllowed": false,
        "derivativesAllowed": false,
        "checkedAt": "2026-07-24"
      }
    }
  ],
  "derivedAssets": [],
  "playlists": [
    {
      "id": "playlist-example",
      "locale": "ru",
      "items": [
        {
          "mediaId": "asset-example-demo",
          "role": "demonstration_only",
          "annotation": {"ru": "Не является реальным аудиофайлом."}
        }
      ]
    }
  ]
}
```

### 10.5 `review.json` и locale — example

```json
{
  "schemaVersion": "1.0.0",
  "entityId": "example-cloud-rap",
  "state": "draft",
  "owner": "example-owner",
  "coverage": {
    "identity": "demonstration_only",
    "production": "demonstration_only",
    "history": "missing",
    "sources": "missing",
    "mediaRights": "not_cleared",
    "localization": {"ru": "draft", "en": "draft"}
  },
  "reviews": [],
  "publicationHistory": [],
  "legacyProvenance": [],
  "openIssues": [
    {
      "id": "issue-example-never-publish",
      "severity": "blocking",
      "text": "Все данные вымышлены; карточку нельзя публиковать."
    }
  ]
}
```

`locales/content.en.md` повторяет те же section IDs и все relevant claim markers. `assets/example-*` в этом RFC — только строки дерева; реальные файлы не создаются.

## 11. Generated canonical/runtime artifacts

Authoring folders не обслуживаются напрямую:

```text
generated/content-v3/<content-release>/
├─ manifest.json
├─ atlas-startup.<hash>.json
├─ atlas-search.ru.<hash>.json
├─ atlas-finder.<hash>.json
├─ atlas-details-<shard-id>.<hash>.json
├─ atlas-redirects.<hash>.json
├─ atlas-offline-manifest.<hash>.json
└─ reports/
   ├─ validation.json
   ├─ citation-coverage.json
   ├─ relation-integrity.json
   └─ media-rights.json
```

`manifest.json` содержит:

- schema/taxonomy/content releases;
- generated-at и generator version;
- hash/bytes/encoding каждого artifact;
- entity counts by kind/status;
- compatible reader range;
- locale/online/offline coverage;
- previous release ID;
- no secrets, local paths или unpublished source fragments.

Canonical build нормализует key order, line endings и URLs, но не переписывает authoring files. Runtime output не используется как новый source of truth.

`shard-id` — непрозрачный build-time identifier, а не taxonomy/family ID. Generator может группировать details по размеру, navigation affinity или observed access pattern. Смена grouping меняет только manifest и `entityId → shardId` lookup; taxonomy version, entity IDs, kinds и relations остаются неизменными.

## 12. Legacy migration

### 12.1 Статус старых 250

- сохраняются неизменёнными в current 2.x/legacy archive;
- получают inventory: legacy ID, current family, source files, deep links, research agent, known gaps;
- не копируются массово в `content-v3`;
- не используются как positive/negative dataset labels;
- могут дать research leads, candidate aliases, source URLs и migration tests.

### 12.2 Перенос одного утверждения

1. Автор создаёт новую v3 entity независимо.
2. Legacy fragment записывается в `review.json.legacyProvenance` с file/legacy ID/revision.
3. Claim получает source `legacy_internal`, confidence low и status `unresearched`.
4. Проводится новая source verification.
5. После review legacy evidence остаётся provenance, но не является единственным основанием published high-impact claim.

### 12.3 IDs и redirects

- если смысл полностью совпадает, v3 может сохранить legacy stable ID;
- если старый ID смешивал разные concepts, создаются новые IDs, а redirect ведёт только к dominant canonical entity с migration note; остальные связываются;
- один старый ID нельзя redirect к нескольким entities без disambiguation route;
- удалённый entity сохраняется tombstone;
- bookmarks/recent/links мигрируются через versioned redirects;
- `id-migrations.json` содержит reason, reviewer, from/to taxonomy version и reversibility note.

## 13. Отдельная структура training dataset

```text
datasets/audio-classification/
├─ README.md
├─ dataset.json
├─ guidelines/
│  ├─ annotation-guidelines-v<version>.md
│  └─ rights-and-consent-v<version>.md
├─ taxonomy/
│  ├─ taxonomy-<version>.json
│  └─ id-migrations.json
├─ manifests/
│  ├─ sources.jsonl
│  ├─ recordings.jsonl
│  ├─ samples.jsonl
│  ├─ annotations.jsonl
│  ├─ rights.jsonl
│  ├─ leakage-groups.jsonl
│  └─ deletion-requests.jsonl
├─ splits/
│  └─ <dataset-version>/
│     ├─ train.txt
│     ├─ validation.txt
│     ├─ calibration.txt
│     ├─ test.txt
│     ├─ benchmark.txt
│     ├─ artist-held-out.txt
│     └─ producer-held-out.txt
├─ checksums/
│  └─ sha256.txt
├─ evaluations/
│  └─ <benchmark-version>/
│     ├─ manifest.json
│     └─ slices.json
└─ reports/
   ├─ rights-coverage.json
   ├─ duplicate-audit.json
   ├─ leakage-audit.json
   ├─ label-coverage.json
   └─ split-audit.json
```

Audio bytes не обязаны находиться в этом Git tree. `objectKey` указывает на access-controlled storage; Git содержит metadata/manifests. Large JSONL можно партиционировать или генерировать Parquet для analytics, но JSONL остаётся review/export interchange. Никакой dataset file не попадает в public app build.

## 14. Dataset records

### 14.1 `dataset.json`

```json
{
  "datasetId": "rap-atlas-audio",
  "datasetVersion": "0.1.0",
  "status": "research_only",
  "createdAt": "2026-07-24",
  "taxonomyVersion": "3.0.0",
  "annotationGuidelineVersion": "1.0.0",
  "rightsPolicyVersion": "1.0.0",
  "allowedPurposes": ["internal_evaluation"],
  "prohibitedPurposes": ["public_distribution"],
  "splitStrategyVersion": "1.0.0",
  "previousVersion": null
}
```

Allowed purposes выводятся из rights records, а не самодекларируются dataset-level полем. Dataset release — immutable snapshot; deletion создаёт superseding release и denylist для старых artifacts/models согласно policy.

### 14.2 Source/recording

`source`:

```json
{
  "source_id": "src_stable_uuid",
  "source_type": "contributor_upload",
  "uri": "private://opaque-object",
  "acquired_at": "2026-07-24T00:00:00Z",
  "provider_account_id": null,
  "provenance_note": "How and why the asset entered the dataset."
}
```

`recording`:

```json
{
  "recording_id": "rec_stable_uuid",
  "source_id": "src_stable_uuid",
  "work_id": "work_stable_or_null",
  "release_id": "release_stable_or_null",
  "artist_group_ids": ["artist_group_a"],
  "producer_group_ids": ["producer_group_a"],
  "source_pack_id": null,
  "object_key": "private/dataset/<opaque>",
  "sha256": "<hex>",
  "perceptual_fingerprint": "<restricted-or-hash>",
  "duration_ms": 180000,
  "container": "wav",
  "codec": "pcm_s16le",
  "sample_rate": 48000,
  "channels": 2,
  "duplicate_cluster_id": "dup_cluster_a",
  "near_duplicate_status": "reviewed",
  "deletion_state": "active"
}
```

Stable ID не равен checksum: один asset можно заменить/удалить, сохраняя audit identity. Checksum и fingerprint имеют ограниченный доступ.

### 14.3 Sample

```json
{
  "sample_id": "sample_stable_uuid",
  "recording_id": "rec_stable_uuid",
  "segment_start_ms": 30000,
  "segment_end_ms": 60000,
  "channel_policy": "stereo_mix",
  "stem_type": "full_mix",
  "quality_status": "accepted",
  "content_warnings": [],
  "technical_features": {
    "bpm": null,
    "key": null,
    "extractor_version": null
  },
  "annotation_ids": ["ann_uuid_1", "ann_uuid_2"],
  "rights_id": "rights_uuid",
  "leakage_group_id": "leak_group_a",
  "split": null,
  "taxonomy_version": "3.0.0"
}
```

Segment boundary фиксирует именно слышимый evidence. Не следует нарезать несколько участков одного recording в разные splits.

### 14.4 Annotation

```json
{
  "annotation_id": "ann_uuid_1",
  "sample_id": "sample_stable_uuid",
  "annotator_id": "annotator_pseudonymous_id",
  "annotation_guideline_version": "1.0.0",
  "created_at": "2026-07-24T00:00:00Z",
  "canonical_labels": ["entity-id-a", "entity-id-b"],
  "primary_label": null,
  "alternative_labels": ["entity-id-c"],
  "negative_labels": ["entity-id-d"],
  "hard_negative_labels": ["entity-id-e"],
  "production_traits": [
    {"trait_id": "trait-id", "value": "present", "confidence": "medium"}
  ],
  "bpm": {"value": 140, "interpretation": "double_time", "method": "manual_review"},
  "key": null,
  "confidence": "medium",
  "ambiguity": {
    "status": "hybrid",
    "note": "Why more than one label is justified."
  },
  "review_status": "pending",
  "reviewer_id": null
}
```

Annotator confidence, reviewer decision и model confidence — разные поля. Disagreement не усредняется скрыто: хранится каждая annotation и adjudication record.

### 14.5 Rights/consent

```json
{
  "rights_id": "rights_uuid",
  "source_id": "src_stable_uuid",
  "rights_holder_assertion": "contributor_is_authorized",
  "license_or_grant_id": "grant_document_uuid",
  "consent_version": "1.0.0",
  "consent_timestamp": "2026-07-24T00:00:00Z",
  "allowed_uses": [
    "internal_feature_extraction",
    "internal_training",
    "internal_evaluation"
  ],
  "public_preview_allowed": false,
  "redistribution_allowed": false,
  "commercial_model_allowed": false,
  "derivatives_allowed": true,
  "retention_until": null,
  "revocation_process": "documented",
  "minor_status": "adult_asserted",
  "reviewed_by": "rights_reviewer_id",
  "reviewed_at": "2026-07-24"
}
```

`commercial_model_allowed=false` блокирует соответствующий training release. Consent на analysis не заполняет это поле автоматически. Rights record требует legal review перед production.

## 15. Splits и leakage prevention

### 15.1 Leakage graph

Один `leakage_group_id` — connected component по:

- exact checksum;
- perceptual fingerprint/near duplicate;
- recording/remaster/edit/stem;
- underlying work;
- release/compilation;
- sample pack/source pack;
- artist/collective;
- producer;
- shared session, если известна.

Минимальный test не делит recording/work/duplicates. Primary benchmark дополнительно не делит artist и producer groups. Если это делает класс непредставимым, класс не готов к supervised benchmark; нельзя ослаблять split молча.

**Факт.** Artist filter необходим, чтобы оценка не вознаграждала запоминание artist identity ([ISMIR artist filter study](https://ismir2007.ismir.net/proceedings/ISMIR2007_p341_flexer.pdf), проверено 24.07.2026). Near-duplicate recordings могут искусственно повышать retrieval score ([recording leakage study](https://arxiv.org/abs/2302.12258), проверено 24.07.2026).

### 15.2 Split roles

- `train`: parameter fitting;
- `validation`: architecture/hyperparameter choices;
- `calibration`: thresholds/probability/abstention fitting, не model training;
- `test`: редкое final comparison;
- `benchmark`: stable curated reporting subset;
- `artist-held-out`, `producer-held-out`: memorization stress tests.

Нельзя многократно выбирать model по test. Любое изменение taxonomy labels создаёт новый benchmark mapping/version. Samples не перемещаются между splits в patch release; исправление leakage создаёт новый dataset version и audit report.

### 15.3 Duplicate audit

1. checksum exact bytes;
2. decoded PCM hash;
3. audio fingerprint;
4. metadata normalization;
5. embedding similarity candidate retrieval;
6. ручная проверка near-duplicate cluster;
7. split connected-component check.

Fingerprint/embedding никогда не считается окончательным copyright identity без review.

## 16. Гибриды, границы и negatives

- `canonical_labels`: все подтверждённые labels;
- `primary_label`: optional, только если guideline определяет context;
- `alternative_labels`: plausible, но не adjudicated positive;
- `negative_labels`: annotator явно исключил label;
- `hard_negative_labels`: acoustically/contextually close, но исключён;
- `ambiguous.status`: `none | hybrid | boundary | insufficient_context | disputed_taxonomy | low_audio_quality`;
- `abstain` разрешён и полезен;
- `unconfirmed_term` не становится train label до promotion в taxonomy release;
- OOD samples хранятся отдельно от hard negatives.

Label hierarchy не используется для автоматического распространения positive вверх/вниз без documented evaluation rule. Например, positive microgenre может подразумевать family для конкретной task, но это generated target с versioned mapping.

## 17. Minimum viable dataset

**Решение.** Не задавать псевдоточную цифру samples.

Dataset готов к первому retrieval prototype, если:

- каждый выбранный label имеет rights-cleared examples из нескольких независимых recording/artist/producer groups;
- есть core, boundary, hybrid, hard-negative и OOD cases;
- benchmark samples имеют минимум две независимые annotations и adjudication либо явно сохранённый disagreement;
- duplicate/leakage audit проходит;
- taxonomy и guidelines заморожены на версию;
- deletion exercise выполнен end-to-end;
- baseline deterministic/retrieval evaluation воспроизводима.

Dataset готов к supervised Phase 2, если дополнительно:

- group-separated train/validation/calibration/test возможны для каждого включённого класса;
- per-class coverage не держится на одном artist/producer/release;
- learning curves и error analysis показывают, что дополнительные данные, а не только model complexity, улучшают task;
- license разрешает выбранное commercial use;
- threshold/calibration/OOD plan заранее определён.

Если conditions не выполнены, правильный результат — сократить taxonomy scope или остаться на retrieval, а не добрать число клипов из сомнительных источников.

## 18. Evaluation

### 18.1 Classification/retrieval

- macro/micro average precision;
- macro/micro F1 при thresholds, выбранных только на validation/calibration;
- per-class precision/recall и confusion;
- LRAP для multi-label ranking ([scikit-learn LRAP](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.label_ranking_average_precision_score.html), проверено 24.07.2026);
- Recall@K, MAP@K и nDCG для retrieval;
- slices: entity, artist-held-out, producer-held-out, hybrid, duration, codec, mix/stem, geography/source.

### 18.2 Calibration/OOD

- reliability diagram и calibration error/Brier-style score;
- selective risk vs coverage;
- OOD detection на held-out unrelated audio;
- abstention rate и accuracy среди non-abstained;
- no percentage in product до evidence of calibration on target distribution.

### 18.3 Explanation

Automated tests:

- каждое reason имеет feature/annotation/retrieved evidence ID;
- explanation не называет entity/artist вне result evidence;
- limitation соответствует known blind spots;
- taxonomy/model/dataset versions записаны.

Human review:

- producer понимает, что изменить;
- reason соответствует слышимому segment;
- correction options адекватны;
- explanation не повышает trust при неверном result;
- inter-rater usefulness/faithfulness reports публикуются без выдуманного universal threshold до pilot.

## 19. Dataset deletion и governance

Deletion request:

```json
{
  "request_id": "delete_uuid",
  "received_at": "2026-07-24T00:00:00Z",
  "subject_or_rights_id": "opaque_reference",
  "affected_source_ids": ["src_stable_uuid"],
  "status": "received",
  "raw_deleted_at": null,
  "derived_deleted_at": null,
  "manifests_superseded_at": null,
  "model_impact_review": "pending",
  "completed_at": null
}
```

Raw/segments/previews/features/embeddings/cache удаляются по dependency graph. Immutable old manifests остаются access-restricted audit records с tombstone, но не предоставляют deleted bytes. Нужно заранее решить policy для уже обученных models; автоматическое обещание «удалим влияние из weights» без технического процесса запрещено.

Roles:

- contributor;
- annotator;
- adjudicator/reviewer;
- taxonomy owner;
- rights reviewer;
- dataset release owner;
- model evaluator.

Solo owner может исполнять несколько ролей, но audit records их различают.

## 20. Validation и quality gates

### 20.1 Card build

- четыре обязательных файла (`card.json`, `content.ru.md`, `evidence.json`, `review.json`) существуют;
- schemas проходят;
- folder name = `card.id`;
- `contentProfile` соответствует `kind`, а `profileData` проходит выбранную `oneOf` branch;
- Markdown required/allowed sections, порядок и claim markers валидны для profile;
- claim IDs уникальны и referenced;
- high-impact fields покрыты;
- source `accessedAt` и availability есть;
- relations/taxonomy/redirects integrity;
- при наличии `media.json` — непустой lifecycle/content и media checksum/metadata/rights completeness;
- при отсутствии `media.json` — generator создаёт пустую runtime collection, а media references/assets запрещены;
- при наличии `assets/` — каждый asset referenced exactly once, no unmanifested binaries; без `media.json` каталог запрещён;
- при наличии `locales/` — profile section parity и stale translations;
- `published` не содержит blocking issues;
- runtime projection reconstructs required canonical fields.

### 20.2 Dataset release

- rights/consent coverage 100% для intended purpose;
- checksums/object availability;
- sample boundaries inside duration;
- annotation taxonomy/version validity;
- duplicate and connected leakage groups;
- no group across protected splits;
- artist/producer/release leakage report;
- benchmark immutability;
- class/slice coverage report;
- deletion denylist applied;
- no public build path can import dataset;
- training export contains only fields allowed for purpose.

### 20.3 Security

- Markdown raw HTML/scripts/unsafe URLs rejected;
- external URLs use allowlisted schemes and safe rendering;
- archives/symlinks/path traversal in assets rejected;
- media bytes validated, not trusted by extension;
- private object keys/presigned URLs absent in generated public artifacts;
- source quotes remain within rights/editorial policy;
- secrets and personal annotator identity absent in repository exports.

## 21. Условия пересмотра

- **Format:** пересмотреть JSON + Markdown, если измеренный authoring time/error rate после gold slice хуже альтернативы и Studio не решает проблему.
- **File split:** объединить `review.json` или другой file можно только после доказательства, что ответственность не нужна независимо; добавлять file — только при новой lifecycle/security boundary.
- **Runtime details shards:** пересмотреть grouping по real measurements, не по числу folders; смена grouping не является taxonomy migration.
- **Graph storage:** graph DB нужен только при доказанном runtime query/load, которого generated adjacency indexes не выдерживают.
- **Dataset manifest format:** Parquet может стать canonical analytical snapshot при масштабе, но human-reviewable JSONL/export и immutable release semantics сохраняются.
- **Confidence:** numeric probability появляется только после target-distribution calibration; editorial confidence остаётся ordinal.
