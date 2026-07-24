# RAP ATLAS 3.0 — Implementation Roadmap

**Статус:** рекомендуемый план после утверждения RFC\
**Дата:** 24 июля 2026 года\
**Важно:** этот документ не разрешает начинать реализацию автоматически. Он определяет маленькие обратимые этапы.

## 1. Стратегия

**Решение.** Развивать RAP ATLAS 3.0 как параллельную vertical slice, не как переписывание текущего приложения. RAP ATLAS 2.x остаётся рабочей линией и источником regression baselines. Каждый этап:

1. добавляет один новый контракт или capability;
2. имеет собственные acceptance criteria;
3. не требует удаления старого provider/UI;
4. заканчивается проверяемым artifact;
5. может быть выключен feature flag или откатом content manifest.

Последовательность:

```text
RFC freeze
  → content contract
  → gold-standard card
  → 10–20 card vertical slice
  → generated runtime artifacts
  → new UX shell
  → single-page card + player
  → Search/Finder/graph
  → web + portable parity
  → Phase 0 audio prototype
  → optional cloud upload
  → retrieval dataset/Phase 1
  → calibrated Phase 2
  → scale content / Content Studio when justified
```

## 2. Release tracks

### Track A — Stable 2.x

- current 250 cards и интерфейс продолжают работать;
- только критические исправления, security и release compatibility;
- текущие integrity/parity/SSR tests остаются обязательными;
- legacy IDs/deep links не меняются;
- никакая v3 taxonomy migration не переписывает 2.x content.

### Track B — v3 preview

- отдельный route/feature flag;
- собственный content manifest/version;
- только reviewed v3 cards;
- `homeMode=finder_first`: primary CTA — работающий `Find a direction`;
- public `Analyze` отсутствует и не заменяется placeholder/«скоро»;
- analytics маркируется `experience=v3-preview`;
- rollback не затрагивает 2.x.

### Track C — audio laboratory

- не обещается как classifier;
- internal-only либо отдельный explicit opt-in, не primary navigation;
- test fixtures и rights-cleared files;
- model/feature experiments не входят в production bundle по умолчанию;
- результаты не превращаются в canonical content.

Track B нельзя блокировать готовностью Track C: хороший offline atlas, Finder и profile-aware cards должны работать без AI service. Конечный продукт при этом остаётся analysis-first. `homeMode=analysis_first`, public Analyze navigation и upload primary CTA разрешены только после minimum useful analysis gate из §12.1, который может быть пройден после Stage 9 или более позднего retrieval stage; до него laboratory не считается завершённой product capability.

## 3. Этап 0 — утвердить архитектурный baseline

**Цель:** превратить исследование в ограниченный набор решений до кода.

**Зависимости:** review трёх RFC владельцем.

**Работы:**

- принять/изменить открытые product/legal questions;
- создать ADR index и присвоить решениям IDs;
- зафиксировать текущие bundle, SSR, portable и content test baselines;
- определить target Windows hardware profile;
- назначить owner для taxonomy, rights и publication;
- выбрать 10–20 candidate directions для vertical slice, не мигрируя их.

**Acceptance criteria:**

- подписан scope MVP и non-goals;
- product owner явно подтвердил local/cloud/age/geography assumptions;
- baseline commands воспроизводимы;
- ни одна current card не перемещена.

**Проверки:** current full test один раз; bundle measurement; portable smoke при доступной сборке.

**Риск:** RFC останется слишком широким.\
**Снижение:** каждое открытое решение получает owner и deadline, но не выдуманный ответ.\
**Rollback:** documentation-only; current branch/release неизменны.

## 4. Этап 1 — content contract без контента

**Цель:** создать пустую инфраструктуру `content-v3`, не переносить карточки.

**Зависимости:** Stage 0; утверждённые file responsibilities/entity/relation vocabularies.

**Работы:**

- JSON Schemas для `card/evidence/media/review/release`;
- controlled vocabularies;
- discriminated `contentProfile` contract (`sound_direction`, `scene_context`, `organization`, `term_reference`, `release_reference`) и profile section validator;
- validator cross-file references;
- Markdown parser с безопасными claim markers и raw HTML disabled;
- fixture-only valid/invalid tests;
- generator interface и пустой release manifest;
- version compatibility rules.

**Acceptance criteria:**

- пустой corpus даёт валидный empty manifest;
- valid fixture проходит, каждый invalid fixture падает по ожидаемой причине;
- все profile/kind branches и required/allowed Markdown section sets покрыты fixtures;
- карточка с четырьмя обязательными files и без media валидна; пустой `media.json` и `assets/` без manifest отклоняются;
- отсутствие `media.json` даёт пустую normalized runtime media collection;
- path traversal, unmanifested asset, dangling claim/relation и incompatible schema отклоняются;
- schema является единственным contract; TypeScript types/validator не расходятся;
- ни одна legacy card не копирована.

**Тесты:** schema fixtures, property/fuzz for IDs/URLs where useful, unsafe Markdown, Windows paths/line endings, deterministic build hash.

**Риск:** over-engineering schema до реального authoring.\
**Снижение:** поля, не нужные gold card, optional или отложены; schema review после Stage 2.\
**Rollback:** удалить isolated `content-v3` tooling/flag; current imports не меняются.

## 5. Этап 2 — одна gold-standard карточка

**Цель:** доказать, что схема поддерживает реальную редакционную работу.

**Зависимости:** Stage 1; реальный rights/source plan для выбранного направления.

**Выбор карточки:** первая gold card использует `sound_direction`, достаточно хорошо документирована и содержит production, history, relation, disputed boundary и хотя бы один законный media case. Нельзя выбирать только самый простой или самый спорный термин. Она проверяет самый богатый profile, но не объявляет его universal template.

**Работы:**

- новое исследование, не copy/paste legacy;
- identity/traits/guidance/relations;
- claim/evidence coverage;
- owned/licensed demo либо official embed/link с policy review;
- русская single-page narrative;
- review checklist и publication preview;
- зафиксировать время и friction каждого authoring action.

**Acceptance criteria:**

- card проходит все validators;
- каждый high-impact claim имеет evidence или явный blocking status;
- media rights flags проверены;
- карточка полезна без online media;
- другой reviewer может проследить relation и historical claims до sources;
- preview отображает полный sequential flow;
- owner принимает authoring cost.

**Тесты:** schema/content lint; link/media check; citation coverage; graph integrity; snapshot runtime projection; keyboard/read-order content review.

**Риск:** schema отражает одну удобную карточку.\
**Снижение:** после gold card проводится первая migration схемы до масштабирования.\
**Rollback:** карточка остаётся draft/unpublished; schema возвращается к Stage 1 без current product impact.

## 6. Этап 3 — content vertical slice из 10–20 карточек

**Цель:** проверить разнообразие типов и relations до нового UI.

**Зависимости:** Stage 2 review; schema minor/major changes закрыты на slice.

**Состав slice:**

- несколько `genre/microgenre`;
- `scene/regional_scene`;
- `producer_style/artist_style`;
- `production_technique`;
- disputed или `unconfirmed_term`;
- как минимум по одному реальному примеру каждого profile: `sound_direction`, `scene_context`, `organization`, `term_reference`, `release_reference`;
- aliases/redirect/deprecation case;
- relations разных типов;
- online-only, offline-capable и unavailable media cases.

Число 10–20 — заданная продуктом vertical slice, не статистический dataset target.

**Работы:**

- authoring независимо по folders;
- second-pass taxonomy review после первых разных типов;
- relation projection fixtures;
- source/claim/editorial throughput report;
- legacy mapping report без массового переноса;
- content release candidate.

**Acceptance criteria:**

- все cards независимо редактируются и строятся;
- каждый profile показывает meaningful required sections без пустых sound/production/media блоков у неподходящих entity kinds;
- graph projections дают полезные neighborhoods и не требуют одного parent;
- search aliases и Finder traits покрывают slice;
- content release воспроизводим;
- нет unpublished/dataset/private data в public artifact;
- median/variance authoring time и blocking issues задокументированы;
- владелец подтверждает, что процесс можно повторять.

**Тесты:** full content validation, relation/redirect integrity, citation/media rights reports, localization/stale states, deterministic rebuild.

**Риск:** преждевременная гонка за количеством.\
**Снижение:** publication gate по качеству; incomplete card не маскируется filler text.\
**Rollback:** исключить card из release manifest, folder сохранить draft; previous content release остаётся активным.

## 7. Этап 4 — generated runtime foundation

**Цель:** превратить authoring corpus в platform-neutral artifacts.

**Зависимости:** Stage 3 schema/content release.

**Работы:**

- generate startup/search/Finder/`atlas-details-<shard-id>`/redirect/offline manifests;
- `ContentRepository` contract;
- web fetch adapter и portable embedded adapter;
- cache/version/error/stale request behavior;
- legacy hash redirect resolver;
- parity harness между canonical normalized card и details payload.

**Acceptance criteria:**

- startup не содержит full prose/media details;
- каждый published entity присутствует ровно в одном details shard;
- `entityId → shardId` lookup находится только в generated manifest; перегруппировка не меняет taxonomy, entity IDs, kinds или relations;
- full details reconstruct required canonical fields;
- Search/Finder results одинаковы для одинакового content release;
- rejected load можно повторить;
- stale response не меняет текущую карточку;
- portable adapter не делает network request для base corpus;
- artifact sizes/parse/load measured, без заранее обещанного reduction.

**Тесты:** projection parity, manifest integrity, simulated slow/error/race fetch, deep links, cache version migration, Windows embedded loading.

**Риск:** runtime grouping снова становится скрытой ontology.\
**Снижение:** `shard-id` непрозрачен, graph остаётся canonical; generator меняет grouping/manifest без taxonomy или ID migration.\
**Rollback:** v3 route использует in-memory fixture provider; current loader не изменён.

## 8. Этап 5 — новый UX shell

**Момент начала нового дизайна.** Реализацию визуального shell можно начинать только после gold card и стабильного Stage 4 repository contract. Полный Entry screen — после минимум нескольких разных slice cards, чтобы layout не оптимизировался под один текст.

**Цель:** честная Finder-first IA `Home/Finder/Explore/Library/Search` без public Analyze.

**Зависимости:** Stages 2 и 4; утверждённые user flows/wireframes.

**Работы:**

- route-based shell за feature flag;
- responsive navigation;
- `homeMode=finder_first`: Home primary CTA `Find a direction`, secondary `Explore`;
- global search utility;
- common loading/error/offline/status components;
- design tokens, focus/motion/a11y foundations;
- public Analyze route/nav/CTA отсутствует; internal laboratory route не рекламируется и не имеет placeholder/coming-soon substitute.

**Acceptance criteria:**

- пользователь запускает Finder и Explore без знания taxonomy;
- keyboard traversal и focus order предсказуемы;
- mobile first viewport содержит работающий Finder primary action;
- offline mode не показывает dead controls;
- ни один public control не ведёт в placeholder Analyze или недоступную upload capability;
- старые editor/guide/compare/statistics не попали на первый уровень;
- 2.x route остаётся default/доступным.

**Тесты:** moderated task test, keyboard/screen reader smoke, automated WCAG checks, desktop/mobile visual regression, offline/error snapshots.

**Риск:** visual polish опережает content/action.\
**Снижение:** компоненты строятся только вокруг проверенных screens/states.\
**Rollback:** выключить v3 shell flag.

## 9. Этап 6 — sequential card и global player

**Цель:** выполнить «пойми → услышь → повтори» без AI.

**Зависимости:** Stages 3–5; media rights contract.

**Работы:**

- один scrolling Card shell с profile-specific anchors/sections;
- evidence disclosures и report correction;
- graph neighborhood/list;
- `GlobalPlayer` queue для owned/licensed media;
- отдельные visible adapters для platform embeds;
- offline/unavailable/rights-expired states;
- mobile sticky player, который не закрывает focus/content.

**Acceptance criteria:**

- вкладок old EntryView нет;
- scene/organization/term/release не получают пустые sound/make/player sections; required/allowed profile sets соблюдены;
- card читается и навигируется без media/network;
- один active transport; clip selection меняет queue, а не создаёт несколько конкурирующих players;
- official platform content не скачивается/извлекается;
- annotated segment и why-it-matters доступны текстом;
- player полностью keyboard-operable и не autoplay;
- media health/rights state влияет на UI/build.

**Тесты:** player state machine, time range, adapter contract, offline, removed embed, keyboard/screen reader, focus-not-obscured, media rights report.

**Риск:** policies платформ делают единый UX невозможным.\
**Снижение:** global queue только для cleared assets; embeds остаются isolated capabilities.\
**Rollback:** выключить platform adapter; metadata/source link и owned player продолжают работать.

## 10. Этап 7 — Search, Finder и graph projections

**Цель:** выполнить discovery flows на v3 graph.

**Зависимости:** Stages 3, 4, 6.

**Работы:**

- locale-aware alias Search с matched reason;
- progressive Finder, использующий explicit traits;
- lineage/regional/production/similarity projections;
- accessible list/tree alternatives;
- bookmarks/recent/compare ID migration;
- unsupported query и suggestion feedback.

**Acceptance criteria:**

- Search не загружает all details;
- result объясняет matched label/field;
- Finder reasons воспроизводимы algorithm/version;
- graph не выдаёт disputed/low-confidence edge как бесспорный;
- APG tree keyboard contract соблюдён;
- legacy link/bookmark либо разрешается redirect, либо показывает disambiguation/tombstone;
- compare скрыт из top level и работает только по запросу.

**Тесты:** known-query/search-failure fixtures, Finder parity, relation projection integrity, tree keyboard, deep-link/bookmark migrations.

**Риск:** старые heuristic weights выглядят как AI confidence.\
**Снижение:** result bands и reasons названы guided matching, algorithm version видим в diagnostics.\
**Rollback:** отключить projection/Finder отдельно; Search и direct cards остаются.

## 11. Этап 8 — web/Cloudflare/portable release parity

**Цель:** доказать одну content/core архитектуру в двух runtime profiles.

**Зависимости:** Stages 4–7.

**Работы:**

- Cloudflare static asset/cache headers и SSR behavior;
- portable embedded content resources;
- service worker/downloaded pack только как web convenience;
- local state/version migrations;
- content/app compatibility matrix;
- signed/hashed update manifest и previous-version activation.

**Acceptance criteria:**

- одинаковые card IDs/content release/search results в web и portable;
- portable clean machine открывает весь base corpus без internet;
- online-only embeds имеют graceful fallback;
- failed content update оставляет active previous pack;
- SSR Home не импортирует details; detail deep link корректно hydrates;
- cache headers проверены для static и Worker-generated responses;
- no R2/Cloudflare credential или private URL в portable/public artifacts.

**Тесты:** clean web deploy smoke, offline browser smoke, portable cold start, unplugged navigation, upgrade/downgrade/rollback, manifest tamper, SSR HTML, current bundle and new artifact measurements.

**Риск:** portable bundling снова втянет полный authoring/runtime код в один giant JS.\
**Снижение:** embedded data provider/resource отделён от UI module graph; parse/startup measurement gate.\
**Rollback:** ship previous portable/app-content pair.

## 12. Этап 9 — Phase 0 audio laboratory

**Момент начала audio prototype.** Только после:

- утверждённого analysis output contract;
- file limits/privacy/retention decision;
- safe decoder/quarantine design;
- rights-cleared manual evaluation cases;
- Result UX с abstention/correction;
- target Windows hardware profile.

**Цель:** проверить, полезны ли измеримые traits и сам workflow, не genre classifier.

**Работы:**

- local safe file intake для laboratory;
- optional segment selection;
- deterministic BPM/onset/tempogram/chroma/spectral extractors;
- observable pipeline states;
- rules, связывающие measurement с neutral evidence language;
- ручное сравнение с curated cards;
- correction/limitation logging без raw audio telemetry.

**Acceptance criteria:**

- unsupported/corrupt/oversized files безопасно отклоняются;
- user может отменить и удалить session;
- extractor versions/parameters записываются;
- result не показывает genre probability;
- half/double tempo и low-confidence cases видимы;
- hardware/latency/memory measured на target profiles;
- producer usability pilot показывает, какие evidence groups полезны.

**Тесты:** decoder security corpus, duration/channel/rate limits, deterministic fixtures, cancellation/race, local deletion, no-network, result evidence IDs.

**Риск:** deterministic features будут восприняты как полноценное распознавание.\
**Снижение:** laboratory label, precise scope и no decorative confidence.\
**Rollback:** убрать Analyze laboratory flag; core product работает.

### 12.1 Minimum useful analysis gate и смена Home

Прохождение Stage 9 само по себе не переводит preview в analysis-first mode. Gate может быть закрыт Phase 0, retrieval на Stage 11 или их hybrid — только если конкретная analysis task действительно полезна. До финального evaluation фиксируются representative rights-cleared task set, method, target profiles и pass thresholds; RFC не выдумывает benchmark numbers.

Все условия должны пройти:

- end-to-end result даёт actionable direction/neighbor evidence или честное abstention, а не только BPM/features;
- task-based producer pilot показывает измеримую добавочную пользу относительно Finder-only baseline;
- каждое reason traceable к feature/annotation/retrieved evidence;
- ambiguous/OOD/unsupported cases дают limitations/alternatives/correction, а не случайно уверенный label;
- completion/failure/cancel, latency и memory проходят утверждённые web/Windows gates;
- privacy, file security, retention/delete и consent tests проходят;
- offline/service failure ведёт в working local mode или Finder/Explore;
- versioned observability и independent rollback готовы.

После go/no-go approval:

1. app release configuration меняется с `homeMode=finder_first` на `homeMode=analysis_first`;
2. Home primary CTA становится `Upload/Analyze`;
3. `Analyze` появляется в public desktop/mobile navigation;
4. Finder и Explore остаются secondary/fallback;
5. regression test доказывает, что ни один mode не содержит dead primary CTA.

Если gate не пройден, Track B продолжает быть Finder-first, а Track C остаётся laboratory. Это не меняет конечное analysis-first positioning, но предотвращает ложный запуск.

## 13. Этап 10 — optional cloud upload

**Цель:** добавить cloud processing только если local constraints мешают validated use case.

**Зависимости:** Stage 9 evidence; legal/security review; R2/processing adapter design.

**Работы:**

- explicit local/cloud choice;
- short-lived presigned capability;
- quarantine and sandboxed decode;
- isolated worker/job pipeline;
- raw/derived TTL lifecycle;
- export/delete/status endpoint;
- separate training opt-in, выключенный default;
- rate limits, abuse/malware controls.

**Acceptance criteria:**

- analysis consent не считается training consent;
- raw/features/embeddings deletion cascade проходит;
- lifecycle configuration и application deletion сверяются;
- content type проверяется после decode;
- telemetry не содержит audio/filename/private URL;
- service unavailable возвращает local/Finder alternative;
- minors/geography policy опубликована и legal-reviewed.

**Тесты:** OWASP upload cases, capability expiry/replay, malformed containers, zip bombs not accepted, rate limits, TTL/delete/export, authorization isolation, log redaction.

**Риск:** юридический и operational scope непропорционален пользе.\
**Снижение:** не строить этап, если Stage 9 не показывает спрос; cloud adapter полностью optional.\
**Rollback:** revoke upload capabilities, delete/quarantine according policy, retain local analysis/core.

## 14. Этап 11 — dataset v0 и Phase 1 retrieval

**Цель:** получить первый измеримый audio similarity/retrieval baseline.

**Зависимости:** frozen taxonomy slice; rights-cleared samples; annotation guidelines; leakage/deletion tooling; license audit model candidate.

**Работы:**

- dataset registry/manifests;
- independent annotations/adjudication;
- recording/work/artist/producer/duplicate groups;
- immutable group-separated splits;
- deterministic baseline;
- несколько embedding candidates под одинаковым benchmark;
- nearest-reference UI с evidence и abstention;
- model card/license/hardware report.

**Acceptance criteria:**

- every sample has allowed purpose, checksum, source и deletion path;
- no protected leakage group crosses split;
- benchmark has independent review;
- model/code/weights/training-data licenses documented отдельно;
- retrieval gains измерены против deterministic/editorial baseline;
- per-slice errors и nearest-neighbor memorization reviewed;
- Russian UI explanation не зависит от untested Russian zero-shot prompts;
- no model promoted solely by public leaderboard.

**Тесты:** rights coverage, duplicate/leakage, reproducible embedding/export, Recall@K/MAP@K slices, artist/producer held-out, OOD, latency/memory, deletion regeneration.

**Риск:** encoder запоминает artist/recording, а не production traits.\
**Снижение:** held-out groups, hard negatives, trait annotations и neighbor audit.\
**Rollback:** encoder остаётся research artifact; Phase 0 and manual Finder remain.

## 15. Этап 12 — Phase 2 multi-label classification

**Момент начала обучения.** Training разрешён только когда:

- dataset readiness gates из Schema RFC выполнены;
- taxonomy заморожена для dataset version;
- rights позволяют intended commercial use;
- group-separated train/validation/calibration/test существует;
- benchmark/test не использовались для repeated model choice;
- retrieval baseline и error analysis сформулировали measurable task;
- OOD/abstention/calibration plan утверждён;
- deletion/model-impact policy legal-reviewed.

**Цель:** добавить labels/traits там, где supervised model доказуемо полезнее retrieval.

**Работы:**

- broad family baseline;
- hierarchical multi-label entities/traits;
- retrieval + classifier ensemble;
- per-class thresholds/calibration;
- OOD and abstention;
- correction review queue;
- model/content/taxonomy compatibility.

**Acceptance criteria:**

- macro/micro/per-class metrics и held-out slices опубликованы;
- calibrated confidence проходит target-distribution gate до процентов;
- `unknown`/abstain работает;
- result reasons происходят из measured/retrieved evidence;
- class with insufficient data не маскируется parent prediction;
- correction не попадает автоматически в train;
- rollback model version independent from app/content.

**Тесты:** frozen benchmark, calibration/reliability, risk-coverage, OOD, confusion/hybrid/hard-negative slices, explanation faithfulness, canary/rollback.

**Риск:** accuracy aggregate скрывает слабые underground classes.\
**Снижение:** per-class/slice release gates и selective availability.\
**Rollback:** pointer на previous model или retrieval-only.

## 16. Этап 13 — Phase 3 explanations и session patterns

**Цель:** сделать repeated analysis полезным без придумывания причин.

**Зависимости:** trusted structured evidence из Stage 9/11/12.

**Работы:**

- explanation plan из feature/neighbor/annotation IDs;
- controlled language generation;
- cross-analysis local session summary;
- privacy-safe corrections;
- compare-to-target prioritization.

**Acceptance criteria:**

- каждое reason traceable;
- generator не добавляет unsupported artist/history/model facts;
- user может открыть limitations/source basis;
- session patterns вычисляются local по умолчанию;
- очищение history удаляет derived summary;
- usefulness и misplaced-trust проверены с producers.

**Тесты:** evidence coverage, adversarial/hallucination fixtures, correction flows, local deletion, accessibility, human evaluation protocol.

**Риск:** fluent text скрывает uncertainty.\
**Снижение:** template-first, evidence chips, limitations и abstention выше prose.\
**Rollback:** deterministic explanation templates.

## 17. Этап 14 — масштабирование базы

**Критерий готовности к масштабированию карточек:**

- gold + diverse slice прошли review;
- schema не менялась breaking образом в согласованном stabilization window;
- validator/generator/runtime/rollback работают end-to-end;
- claim, relation, media rights и localization reports являются release gates;
- authoring/review throughput приемлем владельцу;
- taxonomy owner разрешает ID/edge changes;
- UI выдерживает short/long, sparse/dense и disputed cards;
- portable/web release parity доказана;
- первая задача scaling batch не является массовым legacy import.

**Подход:**

- маленькие тематически разнообразные batches;
- каждый batch имеет owner/reviewer и content release;
- legacy import только как traceable research lead;
- coverage публикуется честно;
- taxonomy migration отдельно от prose batch;
- release может исключить blocked card без удаления folder.

**Rollback:** previous content manifest; affected cards возвращаются `needs_update/draft`.

## 18. Этап 15 — Content Studio, только при необходимости

**Trigger:** повторяемое измерение показывает, что files/Git ограничивают качество или publication: много schema errors, значительная suggestion queue, несколько editors, rights/source maintenance или preview/diff требуют слишком много ручных шагов.

**Работы:**

- закрытая auth/RBAC;
- schema-driven editor;
- sources/claims/relations/media rights UI;
- preview/diff/checklist;
- suggestion triage;
- broken/stale source и rights-expiry jobs;
- publication manifest/rollback;
- append-only audit.

**Acceptance criteria:**

- Studio пишет тот же canonical format;
- Git/change set остаётся reviewable;
- прямое public canonical editing отсутствует;
- rollback не зависит от Studio DB;
- audit log, authorization и secrets проходят security review.

**Риск:** вторая source of truth.\
**Снижение:** Studio — client of content repository/change-set workflow.\
**Rollback:** files/Git workflow остаётся полностью поддержанным.

## 19. Зависимости между направлениями

| Capability | Нельзя начать до | Не блокирует |
|---|---|---|
| Новый shell | gold card + repository contract | audio model |
| Single-page card | несколько diverse cards + media contract | cloud upload |
| Player | rights model + owned/licensed fixture | external embed coverage |
| Portable v3 | generated artifacts + adapter contract | local ML |
| Phase 0 audio | privacy/file/output contract + safe fixtures | dataset training |
| Public Analyze/Home switch | minimum useful analysis gate + go/no-go | дальнейший corpus scale |
| Cloud upload | Phase 0 demand + legal/security | static corpus |
| Retrieval | rights-cleared dataset + leakage splits | classifier |
| Training | dataset readiness + benchmark | corpus scaling |
| Content Studio | measured editorial bottleneck | files/Git authoring |

## 20. Что категорически не делать одновременно

- не писать окончательный visual system, пока одна реальная карточка не показала content hierarchy;
- не менять schema и массово author cards;
- не переносить 250 cards и параллельно менять taxonomy IDs;
- не подключать external platform player и cloud upload в одном security review;
- не внедрять Service Worker, portable updater и runtime sharding одним change;
- не выбирать/обучать model, пока строится evaluation dataset;
- не менять split после просмотра test errors без новой dataset version;
- не удалять current 2.x loader/UI до public v3 acceptance;
- не строить Studio и file/Git workflow одновременно;
- не собирать user corrections прямо в canonical content или train.

## 21. Testing cadence и quality gates

### На каждом change

- targeted unit/schema/content tests;
- formatter/lint только затронутого scope;
- no generated/private/dataset artifacts in public diff;
- current legacy tests, если затронут shared boundary.

### На каждом content release

- full schema/cross-reference;
- claim coverage;
- relation/redirect/taxonomy integrity;
- links/media/rights/expiry;
- runtime reconstruction/search/Finder;
- locale/offline manifest;
- deterministic hashes и rollback activation.

### На каждом app release

- full test один раз после targeted fixes;
- current + v3 SSR/deep links;
- a11y/keyboard/visual states;
- bundle/artifact measurement against measured budget;
- Cloudflare cache/headers;
- portable clean/offline/update/rollback;
- version compatibility matrix.

### На каждом model/dataset release

- rights/deletion;
- duplicate/leakage;
- immutable split/benchmark;
- per-class/slice metrics;
- calibration/OOD/abstention;
- explanation faithfulness;
- hardware/latency;
- previous model rollback.

## 22. Observability rollout

### Сначала

- local debug events без отправки;
- content/schema/taxonomy/app versions;
- loader error class и timing;
- portable/web profile.

### После privacy decision

- coarse `time_to_useful_result`;
- upload validation/error stage без filename/audio;
- main/alternative/correction/abstain outcome;
- Search zero-result с privacy-preserving category; raw query only with explicit policy;
- Result → Card → example/guidance/re-analysis funnel;
- model per-class/slice evaluation вне product telemetry.

Retention, purpose и opt-out определяются до включения remote events. Engagement duration не является release KPI.

## 23. Terra execution и Sol review

Названия ниже относятся к уровню автономной работы, а не отменяют code review.

### Terra может выполнять

- bounded schema fixtures, validators и deterministic generators по утверждённому contract;
- inventory, link/media health reports и mechanical content lint;
- platform adapter contract tests;
- isolated UI components/states по утверждённой IA/design system;
- portable/web smoke harness;
- migration reports без решения taxonomy meaning;
- reproducible benchmark runners после утверждения splits/metrics.

Каждая задача должна иметь малый scope, explicit files и acceptance criteria. Terra не принимает semantic/publication/legal decisions.

### Требуется Sol review

- schema major/minor contract и cross-file boundaries;
- taxonomy entity types, IDs, redirects и relation semantics;
- gold-card publication и disputed/high-impact claims;
- media rights interpretation, privacy/consent/retention и minors;
- platform policy adapters;
- dataset rights, split/leakage strategy и benchmark freeze;
- model/license selection, calibration/OOD gates и explanation claims;
- core/platform boundary, app/content compatibility и release rollback;
- решение масштабировать corpus или включить Studio.

## 24. Первые три конкретные технические задачи

Эти задачи начинаются **только после утверждения RFC**.

### Task 1 — v3 contract skeleton

Создать schema/vocabulary/validator fixtures и empty manifest builder. Не создавать real cards, не менять current loader/UI/package dependencies без отдельного решения.

**Done:** valid/invalid fixtures для всех profiles, four-required-files/no-media case, deterministic empty build, security/path tests, schema docs.

### Task 2 — gold-card authoring

Исследовать и создать одну реальную card folder с claim/media/review data. Не копировать legacy prose; не публиковать до independent review.

**Done:** validation/coverage/rights pass, sequential preview, authoring friction report.

### Task 3 — parallel runtime projection

Сгенерировать startup/search/Finder/`atlas-details-<shard-id>`/redirect/offline artifacts для gold/slice corpus и реализовать `ContentRepository` test implementation. Не переключать current app.

**Done:** reconstruction/search/Finder parity, race/retry/cache/version tests, measured artifact report.

Первая задача намеренно **не начинает массовый перенос карточек**.

## 25. Milestones и exit criteria

### Milestone A — Content foundation

Stages 0–3. Exit: diverse reviewed slice, stable contract, acceptable authoring workflow.

### Milestone B — Read-only v3 preview

Stages 4–8. Exit: Finder-first Home/Search/Finder/profile-aware Card/Explore работают web+portable, offline corpus полон, public Analyze отсутствует, 2.x rollback доказан.

### Milestone C — Analysis laboratory

Stage 9, optional 10. Exit: workflow/evidence, security/privacy/latency measured, no false classifier claim. Public Home становится analysis-first только если отдельно пройден minimum useful analysis gate; иначе Milestone C остаётся internal/opt-in laboratory.

### Milestone D — Retrieval intelligence

Stage 11. Exit: rights-cleared dataset, leakage-safe benchmark, retrieval beats baselines on defined tasks and fails honestly.

### Milestone E — Calibrated classification

Stages 12–13. Exit: supervised model проходит per-class/calibration/OOD/explanation gates.

### Milestone F — Sustainable scale

Stages 14–15. Exit: repeatable content batches; Studio только если files/Git больше не достаточно.

## 26. Главные риски, stop conditions и ответ

| Риск | Ранний сигнал | Stop condition | Ответ |
|---|---|---|---|
| Слишком сложный content contract | gold card требует обходов/дублирования | автор не может review без знания schema internals | упростить до Stage 1/2, не масштабировать |
| Недостаточно evidence | high-impact claims остаются low/unresearched | slice публикуется только через filler | уменьшить scope/coverage, оставить draft |
| Rights deficit | нет offline/training-cleared media | media bytes добавляются по URL/assumption | ссылки/embeds; отложить dataset |
| Hidden runtime ontology | shard grouping влияет на meaning/navigation | entity получает semantic parent ради build placement | сделать `shard-id` opaque и перегруппировать manifest; graph остаётся truth |
| Portable divergence | web feature не имеет adapter/fallback | base card требует network | остановить release, добавить common contract |
| AI license uncertainty | code license используется как weight license | commercial purpose не документирован | research-only или другой model |
| Leakage | один artist/producer доминирует across splits | held-out split невозможен | сузить labels/собрать данные, не training |
| False confidence | UI просит percentage до calibration | result убеждает сильнее benchmark evidence | ordinal/abstain, остановить percentage |
| Cloud scope explosion | upload строится до local value | нет validated use case/retention owner | не строить Stage 10 |
| Two sources of truth | Studio DB расходится с files | rollback требует DB repair | остановить Studio, canonical change sets |

## 27. Решения, требующие владельца до Stage 1/2/9

До Stage 1:

- подтвердить exact v3 MVP scope и 2.x maintenance window;
- подтвердить preferred taxonomy versioning policy;
- назвать reviewers/owners.

До Stage 2:

- выбрать gold card;
- подтвердить допустимые source types и review standard;
- предоставить/определить legal media route.

До Stage 9:

- geography/age/account/cloud position;
- retention и training opt-in policy;
- target Windows hardware;
- допустимые formats/duration/size;
- нужен ли local-only Phase 0 в public preview.

До Stage 11/12:

- intended commercial model use;
- contributor agreements/deletion policy;
- включаемая taxonomy slice;
- benchmark governance и независимый reviewer.

## 28. Итоговая рекомендация

Следующий практический шаг после approval — не новый дизайн и не миграция 250 карточек. Это небольшой versioned content contract с invalid fixtures и пустым generated manifest. Затем одна реальная gold card проверит, действительно ли предложенная архитектура удобна, доказуема и пригодна для последовательного интерфейса. Только после этого безопасно строить runtime foundation и v3 shell; audio prototype начинается ещё позже, после privacy, security и evaluation contract.
