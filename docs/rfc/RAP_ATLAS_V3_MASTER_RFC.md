# RAP ATLAS 3.0 — Master RFC

**Статус:** рекомендуемая архитектура до начала реализации\
**Дата исследования:** 24 июля 2026 года\
**Область:** продукт, UX/IA, контент, media, web/Cloudflare, Windows portable, audio AI, privacy и миграция\
**Нормативные слова:** «должен», «нельзя», «разрешено» обозначают решение RFC; «может» — допустимый вариант.

## 1. Executive summary

**Решение.** RAP ATLAS 3.0 следует строить как **local-first hybrid application со статическим контентным ядром**. Канонические карточки редактируются по одной в `content-v3/cards/<id>/`, валидируются и компилируются в оптимизированные runtime-артефакты. Web и Windows portable используют общий domain/core и одинаковую версию контента, но разные адаптеры загрузки, хранения, аудио и анализа. Cloudflare нужен для web-доставки и опциональных upload/AI-функций, а не как обязательный источник базовых карточек.

Главное обещание конечного продукта после analysis gate:

> Загрузи свой звук, получи несколько правдоподобных направлений, пойми причины, услышь ориентиры, повтори производственные приёмы и проверь результат.

Основной цикл: **«Определи → пойми → услышь → повтори → проверь»**. Энциклопедия, карта и экспертная глубина остаются важными, но обслуживают этот цикл, а не конкурируют с ним на первом экране.

Ключевые архитектурные решения:

1. Конечный продукт остаётся analysis-first: после minimum useful analysis gate главная предлагает `Analyze audio` как главный путь, `Find a direction` и `Explore the map` как вторичные. До gate публичный preview использует `Find a direction` как primary CTA и не ведёт в placeholder Analyze.
2. Результат анализа показывает основное совпадение, близкие альтернативы, наблюдаемые признаки, ограничения и действие «исправить ответ»; некалиброванные проценты запрещены.
3. Карточка — одна последовательная страница без старых вкладок, но её section profile зависит от entity kind: `sound_direction`, `scene_context`, `organization`, `term_reference` или `release_reference`.
4. Формат авторинга — **JSON + Markdown**, проверяемый JSON Schema 2020-12. MDX, SQLite и единый большой JSON не являются source of truth.
5. Каноническая модель — типизированный knowledge graph; дерево, families, карта и поисковые группы — его проекции.
6. Источники связаны не только с карточкой, но с проверяемыми `claim`; допускаются section-level citations для повествовательного контекста.
7. Собственное/лицензированное аудио хранится в object storage и, при разрешении, в offline pack. Официальные треки остаются ссылками или официальными embeds. Нелицензированное аудио не копируется.
8. Startup/search загружаются отдельно; Finder — лениво; details компилируются в нейтральные `atlas-details-<shard-id>` shards. Shard grouping не является taxonomy или navigation truth. Один каталог карточки не означает один HTTP-запрос.
9. Существующие 250 карточек продолжают поддерживать RAP ATLAS 2.x и сохраняются как `legacy archive/research material`; они не становятся автоматически контентом v3 или обучающей истиной.
10. Обучающий датасет живёт отдельно в `datasets/audio-classification/`, имеет собственные права, provenance, taxonomy version, split groups и deletion lifecycle.
11. Audio AI развивается по этапам: deterministic features → embeddings/retrieval → калиброванный multi-label ensemble → объяснение по структурированным признакам. До dataset gates большая модель не обучается.
12. Закрытый Content Studio откладывается до доказанного редакционного bottleneck; на первом этапе достаточно файлов, Git, validation, preview и release manifests.
13. RAP ATLAS 2.x и 3.0 развиваются параллельно за feature flag/отдельным маршрутом; big-bang rewrite запрещён.

## 2. Зафиксированная продуктовая рамка

Следующие положения перенесены из `RAP_ATLAS_PRODUCT_BLUEPRINT.md` без пересмотра:

- **Факт.** Продукт не является encyclopedia-first.
- **Решение.** Первичная аудитория — начинающие и растущие продюсеры, уже создающие музыку; опытные продюсеры — вторичная аудитория.
- **Решение.** Пользователь не обязан знать внутреннюю таксономию.
- **Решение.** На экране одно главное действие, progressive disclosure, хорошие defaults и явно видимый следующий шаг.
- **Решение.** Каждая новая карточка имеет собственную авторскую папку.
- **Решение.** Authoring granularity отделена от runtime granularity.
- **Решение.** Каноническая публикация контролируется владельцем; пользователь присылает corrections и sources, но не редактирует базу публично.
- **Решение.** Web, Cloudflare deployment и Windows portable/offline — равноправные целевые среды.
- **Решение.** Никакой декоративной AI-точности и никакого обучения на текстах карточек.

Любое будущее предложение, меняющее эту рамку, требует нового ADR, данных usability/evaluation и явного решения владельца.

## 3. Текущая архитектура: что доказано и что блокирует v3

### 3.1 Наблюдаемое состояние

**Факт.** Клиентский import chain проходит от browser entry через `AtlasApp.tsx` к `atlas-data.ts`, `research-data.ts` и крупному `research-generated.ts`. Production manifest содержит один доминирующий chunk `AtlasApp`: 1 806 708 bytes raw, 411 934 gzip, 292 919 Brotli. Весь client JS: 2 078 218 raw, 495 950 gzip, 365 708 Brotli. Измерения локально воспроизведены скриптом проекта 24.07.2026.

**Факт.** Текущий `AtlasEntry` — широкая плоская модель. Поиск, Finder, карточка, дерево и SSR импортируют полный корпус. `atlas-data-projections.ts` уже доказывает возможность lossless-разделения на index, search, Finder и current family-grouped details, но runtime пока не использует эти проекции. V3 сохраняет доказанный split principle, а не family naming/grouping.

**Факт.** Тесты фиксируют полезные инварианты:

- ровно 250 уникальных legacy entries;
- lossless reconstruction и единственное family membership;
- parity полей поиска и Finder, включая representative ranking;
- валидные parent/related IDs и отсутствие циклов parent tree;
- отсутствие ряда редакционных дефектов;
- SSR-render главной без starter skeleton.

**Факт.** Windows portable — отдельный esbuild/IIFE build, который встраивает JS и CSS в один HTML и обслуживается локальным C# host на `127.0.0.1`. Host имеет одноразовый token, origin/fetch-site checks, mutex одного экземпляра и ограниченное локальное state API. Обычные web dynamic chunks в этой сборке не заработают без portable loader.

**Факт.** Worker в основном делегирует запросы vinext application handler и обработке изображений. Выделенного content/API слоя, R2 media pipeline или содержательной DB schema сейчас нет.

### 3.1.1 Проверенные области репозитория

| Область | Наблюдение | Архитектурное значение |
|---|---|---|
| `app/**` | `AtlasApp` держит view/selection/theme/navigation/compare/Finder/editor state; data types и projections находятся рядом с shell | разделить route/use-case/domain, но не менять всё одним patch |
| `features/home/**` | hero, четыре task cards, routes, learning paths, statistics и 12 family cards конкурируют | главную заменить analysis-first IA |
| `features/search/**` | keyboard search полезен, но работает по полным entries | сохранить interaction, сменить source на compact index |
| `features/finder/**` | deterministic scorer прозрачен, но использует fixed questionnaire/full corpus | сохранить baseline и reasons, сделать payload lazy и progressive |
| `features/entry/**` | quick/producer/history tabs, text examples, whole-card sources; audio transport отсутствует | сделать sequential card и отдельный player |
| `features/navigation/**` | parent tree валиден для current corpus, но представляет только одну иерархию | оставить tree projection, graph сделать canonical |
| bookmarks/recent/compare | bookmarks/recent persist IDs; compare живёт в app state | сохранить ID-state, добавить redirect/version migration; compare убрать с первого уровня |
| `shared/**` | stored-list hook имеет portable `/__state` и localStorage fallback | обобщить через `StoragePort`, сохранив поведение |
| `Research/**` | 20 agent reports и regex/heuristic generator собрали 200 generated + 50 manual cards | архив/lead material, не v3 truth и не dataset |
| `tests/**` | integrity, projection parity и rendered HTML закрепляют corpus/SSR invariants | расширять, не удалять до v3 replacement |
| `scripts/**` | bundle measurement воспроизводит аудит; generation связан с legacy research format | сохранить measurement, новый generator строить параллельно |
| `installer/**` | portable IIFE/inline assets + защищённый localhost host; dynamic web chunks не являются drop-in | нужен embedded `ContentRepository` adapter |
| Worker/Cloudflare config | vinext handler, static assets, image binding, observability; content services отсутствуют | не вводить D1/R2/API до конкретной capability |
| production output/manifest | пять client chunks, dominant AtlasApp; SSR bundle также содержит большой app/data graph | измерять split на actual build, SSR Home держать на startup index |
| `package.json`/stack | React/vinext/Vite/Cloudflare stack уже работает web; DB schema пуста | миграция стека не требуется для content/UX foundation |

### 3.2 Что сохранить

- доказанные content-integrity и data-parity инварианты как regression contract;
- стабильные legacy IDs и deep links;
- bookmarks/recent как ID-based user state;
- keyboard shortcut глобального поиска;
- тёмную/светлую тему, читаемую секционную иерархию и умеренные family accents;
- transparent deterministic Finder как временный guided-discovery baseline;
- portable security boundary и отсутствие фоновой telemetry/update;
- подход «сначала проекции, затем переключение loader», а не переписывание данных и UI одновременно.

### 3.3 Что перепроектировать

- один stateful `AtlasApp` — в route/use-case shell и независимые domain modules;
- flat genre-first `AtlasEntry` — в entity graph, editorial claims и media manifests;
- строгий parent tree — в навигационную проекцию graph;
- full-corpus imports — в versioned generated artifacts и `ContentRepository`;
- текстовые track examples — в rights-aware media references;
- карточку с вкладками — в последовательную страницу;
- Finder как набор скрытых эвристик — в объяснимую guided discovery, позже дополняемую audio evidence;
- whole-card source lists — в source/claim/evidence provenance;
- hash-only deep links — в настоящие routes с legacy redirect.

### 3.4 Что является legacy

`Research/agent-*`, regex-генератор, `research-generated.ts`, 250 карточек и их classification decisions — ценный архив исследования и рабочая версия продукта, но не v3 canonical truth. Генератор делает эвристические выводы и нормализации; поэтому его output нельзя использовать как ground truth для обучения или механически публиковать в `content-v3`.

### 3.5 Что нельзя менять одновременно

1. Схему карточек и массово переносить карточки.
2. Content loader, новый shell и AI pipeline.
3. Плеер и правила интеграции всех внешних платформ.
4. Taxonomy IDs и dataset splits.
5. Web upload pipeline и portable wrapper.
6. Удаление legacy provider и первый public v3 release.

### 3.6 Несоответствия текущего UI blueprint

На главной нет настоящего upload/analyze action, зато конкурируют статистика, «как читать атлас», learning paths, routes и family grid. EntryView разделяет основное действие вкладками, не имеет настоящего global player и показывает источники только на уровне карточки. Compare/editor/guide находятся слишком близко к первичной навигации. Пользователь должен понимать структуру базы до получения пользы — это обратный порядок относительно blueprint.

## 4. Product architecture

### 4.1 Jobs-to-be-Done

| Ситуация | Job | Полезный результат | Следующий шаг |
|---|---|---|---|
| Я сделал бит и не понимаю, что это | Помоги назвать несколько направлений и объяснить слышимые признаки | main match, alternatives, evidence, limitations | открыть карточку или уточнить результат |
| Я хочу сделать конкретный звук | Переведи название/референс в производственные действия | tempo/rhythm/bass/drums/melody/timbre/structure guidance | прослушать A/B пример и проверить свой loop |
| Ищу по артисту или ощущению | Не заставляй знать жанровый термин | ranked directions с объяснёнными совпадениями | сузить фильтры или перейти в relation map |
| Бит не попадает в стиль | Покажи расхождения, а не только label | target-vs-input trait comparison и приоритетные изменения | повторный анализ новой версии |
| Ищу звуки, plugins или kits | Дай контекстно подходящие инструменты, не рекламный список | function-first recommendations с provenance | сохранить или открыть официальный источник |
| Исследую сцену/микрожанр | Покажи происхождение, споры и типизированные связи | graph projection, timeline, claims и sources | сравнить соседние сущности |
| Проверяю несколько работ | Помоги увидеть устойчивые черты без ложной психологии | локальная session summary по повторяющимся traits и corrections | выбрать направление для углубления |

### 4.2 Primary, secondary и expert flows

**Target primary flow после analysis gate:** Home → Upload → безопасная проверка файла → Analysis → Result → Card → Production guidance → Re-analyze.

**Public preview flow до gate:** Home → Find a direction → объяснённый result → подходящая profile-aware Card → production/context action. Laboratory доступна только internal/opt-in и не является обещанием готового анализа.

**Secondary flows:** Finder по ощущению/референсу; Search; открыть shared/deep link; продолжить recent; Saved.

**Expert flows:** graph projections, compare two directions, disputed claims, detailed sources, batch/session patterns и dataset correction. Они доступны после результата или внутри `Explore`, но не занимают равноправные CTA на главной.

### 4.3 Главная и три главных действия

После minimum useful analysis gate:

1. **Analyze audio** — единственный primary CTA.
2. **Find a direction** — guided Finder без файла.
3. **Explore the map** — knowledge exploration.

До gate:

1. **Find a direction** — единственный public primary CTA.
2. **Explore the map** — secondary.
3. **Analyze laboratory** — скрыта, internal-only либо доступна через явный opt-in laboratory route; она не появляется как готовая функция и не ведёт в placeholder/«скоро».

Глобальный Search находится в header и вызывается `Ctrl/Cmd+K`; это utility, а не четвёртая hero-card. Ниже отображается только один meaningful continuation: незавершённый анализ, последняя карточка или сохранённый путь. Статистика базы, learning paths, compare, glossary, editor и history скрываются с первого уровня.

### 4.4 Scope версий

**Public content preview до gate:** новый content contract; 10–20 независимо исследованных карточек vertical slice; Home/Card/Search/Finder/Explore; rights-safe player при наличии media; graph-backed relations; web и portable read-only corpus. Finder является primary path, Analyze не имитирует готовность.

**Analysis-first MVP после gate:** добавляет публичные Analyze/Result/Correction, полезные deterministic/retrieval evidence в рамках утверждённой задачи, privacy-safe operational events и повторную проверку.

**Следующая версия:** retrieval по лицензированному benchmark, gap coach, saved/session patterns, download-able offline packs, closed review queue.

**После доказательств:** calibrated multi-label classifier, optional cloud processing, Content Studio, larger corpus, local inference. Marketplace kits, social profiles и public editing в scope не входят.

### 4.5 Minimum useful analysis gate

`Analyze audio` становится public primary CTA только после отдельного go/no-go review. Gate не требует выдуманного universal benchmark number, но требует заранее зафиксированного evaluation protocol и pass thresholds до просмотра финальных результатов.

Все условия обязательны:

1. **Завершённый job:** на representative, rights-cleared task set пользователь получает не просто features, а понятное направление/соседей или честное abstention и видит следующий производственный шаг.
2. **Измеримая добавочная польза:** в task-based pilot анализ даёт больше actionable value, чем Finder-only baseline для заранее определённого use case; method, cohort и threshold фиксируются до go/no-go.
3. **Faithful evidence:** каждое reason связано с измеренным feature, reviewed annotation или retrieved example; система не генерирует недоказанные причины.
4. **Ошибки контролируются:** unsupported/OOD/ambiguous audio приводит к abstention/limitations, alternatives и correction, а не к уверенной случайной карточке.
5. **Техническая пригодность:** supported formats, completion/failure/cancel, latency и memory проходят заранее утверждённые gates на target web/Windows profiles.
6. **Privacy/security:** intake, local/cloud disclosure, retention/delete, malicious/corrupt file handling и training consent проходят соответствующие tests.
7. **Product continuity:** при offline/service failure пользователь получает работающий local mode либо Finder/Explore fallback без тупика.
8. **Наблюдаемость и rollback:** versions, failure classes, corrections и abstention измеримы без raw audio telemetry; capability можно отключить независимо от content corpus.

Если хотя бы одно условие не выполнено, публичный preview остаётся Finder-first. Laboratory может продолжать исследование, но не занимает primary navigation/CTA.

## 5. UX и информационная архитектура

### 5.1 Принципы, подтверждённые внешними источниками

**Факт.** Apple рекомендует короткий, пропускаемый onboarding, хорошие defaults и contextual guidance вместо обязательного tour ([Apple HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), проверено 24.07.2026). Disclosure controls должны оставлять частые действия видимыми, а сложные — раскрывать по запросу ([Apple HIG: Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls), проверено 24.07.2026).

**Факт.** Профессиональные sample browsers совмещают search, tags/filters и немедленный preview; Ableton дополнительно использует keyboard navigation и similarity search, а Splice — тип, BPM, key, instrument и genre filters ([Ableton Live 12 Manual](https://cdn-resources.ableton.com/resources/pdfs/live-manual/12/2026-04-30/live12-manual-en.pdf), [Splice: Finding Sounds](https://support.splice.com/en/articles/8652594-finding-sounds), проверено 24.07.2026). **Архитектурный вывод:** RAP ATLAS должен давать быстрый preview и объяснимые фильтры, но не копировать DAW browser визуально.

**Факт.** Explainability должна помогать человеку калибровать доверие, а не убеждать его в безошибочности системы ([Google PAIR: Explainability + Trust](https://pair.withgoogle.com/chapter/explainability-trust/), проверено 24.07.2026). Поэтому reasons, alternatives, limitations и correction являются частью результата, а не help overlay.

### 5.2 Иерархия экранов

```text
Home
├─ Find a direction
├─ Analyze [public only after analysis gate]
│  ├─ File intake
│  ├─ Processing
│  └─ Result
│     ├─ Entity card (`sound_direction`)
│     ├─ Compare to target
│     └─ Correct result
├─ Explore
│  ├─ Map projection
│  └─ Tree/list projection
├─ Search results
├─ Entity card
└─ Library
   ├─ Saved
   ├─ Recent
   └─ Sessions (после MVP)
```

После gate desktop top-level navigation: `Home`, `Analyze`, `Explore`, `Library`; Search — persistent utility. На mobile: те же четыре destinations в нижней навигации, Search внутри header/command sheet. До gate публичный preview использует `Home`, `Explore`, `Library`; Finder запускается главным Home CTA и доступен из Search/utility navigation, а `Analyze` отсутствует. Internal laboratory route не выдаётся за public destination. Если Library пуста, пункт ведёт в компактный Saved/Recent screen, но не исчезает между сессиями после первого сохранения.

### 5.3 Спецификация главных экранов

#### Home

- **Цель:** начать с собственной проблемы, а не изучать устройство атласа.
- **Primary CTA до gate:** `Подобрать направление`.
- **Primary CTA после gate:** `Загрузить аудио`.
- **Secondary до gate:** `Исследовать карту`; Analyze не показывается как «скоро».
- **Secondary после gate:** `Подобрать без файла`, `Исследовать карту`.
- **Обязательно:** до gate — ясное обещание Finder и один recent continuation; после gate — поддерживаемые форматы/лимит, local/cloud processing status и continuation.
- **Скрыть:** taxonomy statistics, advanced tools, длинное объяснение AI.
- **Desktop:** до gate — Finder intent field/question и один спокойный Explore path; после gate — узкая hero-зона с drop target и двумя secondary paths.
- **Mobile:** текущий primary CTA находится в первом viewport; после gate drop wording заменяется на «выбрать файл».
- **Keyboard/a11y:** Finder control использует корректный form/combobox pattern; после gate drop zone — настоящая button/input pair с `Enter/Space`, visible focus и `aria-describedby`.
- **Состояния:** до gate нет неработающего upload control. После gate offline явно показывает local capability; без неё предлагает Finder и offline corpus, а не dead upload.

#### File intake и Processing

- **Цель:** безопасно принять файл и сообщить реальное состояние.
- **Primary CTA:** `Анализировать`; во время работы — `Отменить`.
- **Secondary:** сменить файл, выбрать участок, local/cloud mode при наличии обоих.
- **Обязательно:** имя, duration, выбранный range, privacy summary, измеримые этапы decode/features/retrieval.
- **Скрыть:** model name, raw tensor/features, advanced channel settings.
- **Desktop:** waveform + range; task status справа.
- **Mobile:** waveform сверху, крупные start/end handles, sticky action.
- **Keyboard/a11y:** file input без drag dependency; range имеет numeric alternative; progress/status объявляются через `role=status`, без повторного захвата focus.
- **Ошибки:** unsupported codec, corrupt file, too long, timeout и service unavailable имеют разные recovery. Фальшивый процент запрещён; если длительность этапа неизвестна, используется indeterminate status.

#### Result

- **Цель:** дать actionable interpretation при контролируемой неопределённости.
- **Primary CTA:** `Открыть, как сделать этот звук`.
- **Secondary:** альтернативы, `Сравнить с целью`, `Исправить результат`, повторный анализ.
- **Обязательно:** main match; 1–2 alternatives; evidence по rhythm/BPM/bass/drums/melody/timbre/structure; ограничения; analysis/content/model/taxonomy versions.
- **Скрыть:** feature vectors, model internals, полный graph.
- **Desktop:** main result и evidence в центре; alternatives в правой колонке; player persistent снизу.
- **Mobile:** main result → evidence → alternatives; correction в action sheet.
- **Keyboard/a11y:** result heading получает focus после завершения только по осознанной навигации; evidence доступен как текст, не только radar chart.
- **Состояния:** `insufficient evidence` и `outside known corpus` — полноценные результаты с Finder/manual paths. Некалиброванные confidence bands формулируются «основное», «близкая альтернатива», «слабое совпадение», не как проценты.

#### Finder

- **Цель:** найти направление по ощущению, артисту, региону или производственной черте.
- **Primary CTA:** `Показать направления`.
- **Secondary:** очистить, уточнить одним дополнительным вопросом.
- **Обязательно:** выбранные критерии и reasons каждого result.
- **Скрыть:** внутренние weights и все фильтры сразу.
- **Desktop:** progressive questionnaire слева, ranked list справа.
- **Mobile:** один вопрос на шаг; выбранные chips доступны в summary.
- **Keyboard/a11y:** radio/slider имеют текстовые значения; sliders имеют select/numeric alternative.
- **Состояния:** unsupported artist/query предлагает search alias feedback, а не пустой экран.

#### Search

- **Цель:** мгновенно перейти к известному названию, alias, артисту, producer, trait или сцене.
- **Primary action:** открыть result.
- **Secondary:** filter entity kind, report missing term.
- **Обязательно:** matched field/alias, entity kind, короткое context line.
- **Скрыть:** full details.
- **Desktop/mobile:** command palette для быстрого вызова и отдельная results page для сложного запроса.
- **Keyboard/a11y:** combobox pattern, arrow navigation, `Esc`, announcement количества; не перехватывать `/` в text fields.
- **Состояния:** offline search по embedded/downloaded index; stale index показывает content version.

#### Entity card

- **Цель:** превратить label в подходящее entity-specific знание и следующий шаг, не заставляя пользователя понимать profile.
- **Primary CTA:** зависит от profile в общем action slot: `sound_direction` — прослушать/повторить/проверить; `scene_context` — открыть ключевых участников или releases; `organization` — исследовать людей/catalog; `term_reference` — понять употребление и границы; `release_reference` — открыть track/release context или разрешённый пример.
- **Secondary:** сохранить, открыть relation, сообщить ошибку.
- **Обязательно:** общий identity/status/overview/provenance frame и required sections выбранного profile. Audio, production recipe, timeline или catalog обязательны только там, где этого требует profile.
- **Скрыть:** detailed historiography, contradictions, raw citation metadata и expert details — до disclosure.
- **Desktop:** 12-column reading layout, sticky mini-navigation и player; prose measure ограничен.
- **Mobile:** один поток, sticky mini-player; anchor menu как sheet, не tabs.
- **Keyboard/a11y:** skip links между секциями, управляемый player, headings, table/list alternative для graph.
- **Состояния:** карточка без media не показывает пустой player. Если embeds unavailable/offline, narrative и допустимые owned demos остаются доступны; показывается source link и дата последней проверки.

#### Explore map/tree

- **Цель:** увидеть связи, не объявляя одну иерархию абсолютной.
- **Primary action:** открыть выбранную сущность.
- **Secondary:** сменить projection: lineage, regional, production, similarity.
- **Обязательно:** relation type, legend, scope, disputed/low-confidence state.
- **Скрыть:** unrelated nodes и все edge types одновременно.
- **Desktop:** graph + synchronized accessible list/details.
- **Mobile:** list-first neighborhood; graph optional.
- **Keyboard/a11y:** tree projection следует WAI-ARIA Treeview arrows/expand/focus contract ([WAI-ARIA APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/), проверено 24.07.2026); graph всегда имеет линейную альтернативу.
- **Состояния:** incomplete graph честно отмечает coverage; offline использует локальную проекцию.

#### Library

- **Цель:** продолжить полезную работу.
- **Primary action:** открыть saved/recent/session.
- **Secondary:** удалить локальную запись, экспортировать/очистить history.
- **Обязательно:** разница между local-only state и synced state.
- **Скрыть:** gamification, streaks, arbitrary progress.
- **Desktop/mobile:** filters только после накопления материала.
- **Keyboard/a11y:** list semantics, predictable delete confirmation/undo.
- **Состояния:** empty state ведёт к Finder/Search до gate и к Analyze/Search после gate; offline state не блокирует local items.

### 5.4 Profile-aware карточка как одна страница

Все entity kinds используют один Card shell, общий identity/provenance frame и одну vertical reading model. `contentProfile` меняет обязательные/допустимые sections, а не создаёт отдельный UI:

- `sound_direction`: genre, microgenre, artist/producer style и production technique;
- `scene_context`: scene и regional scene;
- `organization`: collective и label;
- `term_reference`: search/type-beat/aesthetic tags, meme, service group и unconfirmed term;
- `release_reference`: release.

Ниже приведён полный поток `sound_direction`; для остальных profiles sound/make/player не навязываются. Scene раскрывает place/time/participants, organization — role/people/catalog, term — meaning/usage boundaries, release — context/credits. Optional section без данных не рендерится.

1. **Identity header:** canonical name, entity kind, status, aliases, one-sentence definition, save/report.
2. **What you hear:** seven trait groups и область вариативности; без ложных universal rules.
3. **Listen:** owned/licensed demos прежде всего; official embeds/links отдельно; annotated time ranges и why-it-matters.
4. **Make it:** prioritized recipe, mistakes, acceptable variation, beginner/expert disclosure.
5. **Check your sound:** выбранный target, trait gaps, re-analysis.
6. **Tools, kits and plugins:** по функции и производственной задаче, с датой проверки и disclosure коммерческих связей.
7. **Artists, producers, releases and scenes:** typed entities, не свободная «стена имён».
8. **Relations:** локальный graph neighborhood и often-confused-with.
9. **History and debate:** timeline, disputed claims и границы термина.
10. **Sources and review:** claim-linked evidence, review date, report correction.

Anchor navigation строится из фактически присутствующих profile sections, помогает переходить между ними, но не меняет URL-state и не скрывает содержание как старые tabs. Sources/review footer остаётся общим. Точный `oneOf` contract и section matrix определены в Content and Dataset Schema RFC.

### 5.5 Accessibility baseline

**Решение.** Release gate — WCAG 2.2 AA, включая видимый и не перекрытый focus, минимум 24×24 CSS px для target или допустимый spacing exception и программно объявляемые status messages ([WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), проверено 24.07.2026).

Waveform, confidence chart и graph обязаны иметь text/list alternative. Keyboard transport: `Space` только когда focus не в поле и пользователь активировал player context; отдельные buttons для play/pause, seek, speed, volume. Auto-play запрещён.

## 6. Design system

### 6.1 Визуальные принципы

- музыкальный материал и действие важнее декоративной оболочки;
- одна dominant surface, максимум два уровня вложенности;
- domain color помогает распознаванию, но не кодирует смысл в одиночку;
- beginner language по умолчанию, expert details по запросу;
- состояние системы всегда видимо: local/offline/cloud, analyzing/ready/limited/error;
- оригинальный visual language: editorial clarity + instrument precision, без копирования DAW или streaming product.

### 6.2 Tokens и компоненты

- **Typography:** UI sans с хорошей кириллицей; display 32–48 responsive, section 22–28, body 16–18/1.5, metadata 13–14; BPM/time используют tabular numerals. Prose line length 60–75 characters.
- **Spacing:** base 4 px; основные интервалы 8/12/16/24/32/48/64. Touch layouts не используют compact density.
- **Density:** `comfortable` default; `compact` только для expert lists/table и как явная настройка.
- **Color roles:** `canvas`, `surface-1/2/raised`, `text-primary/secondary/muted`, `border`, `focus`, `action`, `success`, `warning`, `danger`, `info`, `family-accent-*`. Contrast проверяется для обеих тем.
- **Focus:** единый 2–3 px high-contrast ring с offset; focus не заменяется hover.
- **Motion:** functional transitions примерно 120–220 ms; waveform playhead может быть continuous, но не decorative. `prefers-reduced-motion` отключает spatial transitions, auto-scroll и pulsing.
- **Audio:** одна shared transport bar; clip cards не создают конкурирующие mini-players, а ставят item в общую queue. Видны title, rights/source type, current/total time и annotated range.
- **Charts:** evidence bars/dots показывают измерение и диапазон, не эстетическую «точность». До калибровки confidence — ordinal wording. После калибровки distribution сопровождается model/dataset version и explanation.
- **Relations:** edge type кодируется line style + label + legend; disputed state — icon/text, не только цвет.
- **Controls:** primary/secondary/quiet/danger имеют normal/hover/active/focus/disabled/loading; disabled control объясняет причину рядом, если действие ожидаемо.
- **Responsive:** content order сохраняет смысл; multi-column layouts сворачиваются в один поток; graph на mobile уступает место neighborhood list.

### 6.3 Аудит текущего визуального языка

**Сохранить:** тематические accents, тёмную/светлую схему, компактные metadata labels, читаемые заголовки и keyboard search.

**Упростить:** количество badges, nested cards, статистические блоки, одновременные filters и декоративные границы.

**Удалить с первого уровня:** editor, guide, compare, glossary, family statistics и образовательные routes.

**Заменить:** tabs карточки — anchors; family-as-truth — entity kind + projections; текстовые examples — player/media state; generic confidence badges — evidence/limitations; огромный app shell — route/use-case modules.

## 7. Content, graph и editorial provenance

### 7.1 Card authoring

**Решение.** Использовать JSON + Markdown:

- обязательный `card.json` — идентичность, `contentProfile`, тип, labels, profile-specific structured data, relations, references и localization map;
- обязательный `content.ru.md` — длинная редакционная проза по section contract выбранного profile;
- обязательный `evidence.json` — sources, claims, supporting/contradicting evidence;
- обязательный `review.json` — lifecycle, reviews, legacy provenance и publication history;
- условный `media.json` — только если есть playable/reference media, rights/lifecycle records или variants;
- условные `locales/` и `assets/` — только при реальных переводах и owned/licensed assets.

Профили: `sound_direction`, `scene_context`, `organization`, `term_reference`, `release_reference`. `card.schema.json` различает их через `contentProfile` + `kind` discriminated `oneOf`; Markdown validator проверяет обязательные/допустимые section IDs. При отсутствии `media.json` generator нормализует пустую runtime media collection, не требуя placeholder-файла.

JSON Schema 2020-12 является language-neutral contract ([JSON Schema Specification](https://json-schema.org/specification), проверено 24.07.2026). TypeScript types и runtime validators генерируются или проверяются на parity с ним; Zod допустим как implementation detail, но не второй независимый contract.

**Отклонено:** YAML + Markdown из-за anchors/tags/duplicate-key traps в YAML 1.2.2 ([YAML 1.2.2](https://yaml.org/spec/1.2.2/), проверено 24.07.2026); TOML + Markdown — из-за неудобной глубоко вложенной domain data ([TOML 1.0.0](https://toml.io/en/v1.0.0), проверено 24.07.2026); один MDX — потому что смешивает content с executable component language и build runtime ([MDX](https://mdxjs.com/docs/), проверено 24.07.2026); SQLite — как authoring source из-за плохих Git diff/review. Подробная схема приведена в companion RFC.

### 7.2 Graph, а не одно дерево

**Факт.** SKOS различает preferred/alternative labels, hierarchical и associative relations, а PROV-O описывает entity/activity/agent, derivation и revision ([SKOS Reference](https://www.w3.org/TR/skos-reference/), [PROV-O](https://www.w3.org/TR/prov-o/), проверено 24.07.2026).

**Решение.** Использовать простой typed JSON graph, вдохновлённый этими стандартами, без обязательного RDF server или graph DB. Canonical nodes:

`genre`, `microgenre`, `scene`, `regional_scene`, `artist_style`, `producer_style`, `production_technique`, `search_tag`, `type_beat_tag`, `aesthetic_tag`, `collective`, `label`, `release`, `meme`, `service_group`, `unconfirmed_term`.

Canonical relations:

`derived-from`, `influenced-by`, `branch-of`, `regional-branch-of`, `revival-of`, `member-of`, `associated-with`, `often-confused-with`, `overlaps-with`, `alias-of`, `historical-alias-of`, `search-alias-of`, `producer-variant-of`.

Каждая edge имеет stable ID, source/target, direction, temporal/geographic scope, evidence claims, confidence, editorial status и taxonomy version. `overlaps-with` симметрична; `branch-of` направлена и проверяется на cycles; influence не превращается автоматически в parenthood.

- **Canonical entity:** один стабильный ID и translatable preferred label.
- **Alias:** label или отдельная историческая/search entity, если у неё есть собственный контекст.
- **Redirect:** routing compatibility, не semantic edge; содержит `fromId`, `toId`, reason и version.
- **Disputed entity:** сохраняется с `contested` status и competing claim sets.
- **Deprecated entity:** tombstone с `replacedBy/mergedInto`, чтобы старые ссылки не ломались.
- **Confidence:** ordinal evidence strength на claim/edge, не «истинность сущности».
- **Taxonomy version:** versioned release с changelog и explicit ID migrations.

Дерево остаётся одной projection по `branch-of`; отдельные projections строятся для chronology, region, production similarity и search/navigation.

### 7.3 Source/claim model

Карточный список URL недостаточен. Модель включает:

- `source`: автор/издатель/title/URL/archive URL, published/accessed dates, type, primary/secondary status, language, rights snapshot, availability;
- `claim`: stable ID, exact assertion или structured `fieldPath`, scope, editorial status, reviewer и validity range;
- `evidence`: source fragment/time/page, `supports|contradicts|qualifies`, note;
- `editorial inference`: явный claim kind, не маскируемый под source fact;
- `confidence`: `low|medium|high` по rubric качества/согласованности evidence;
- `contradiction`: несколько evidence links с note о нерешённом конфликте.

**Решение о гранулярности.** Claim-level citations обязательны для происхождения, дат, identity, canonicalization, отношений, named associations и технических диапазонов. Section/paragraph marker разрешён для синтеза нескольких неатомарных наблюдений. Card-level source допустим только как `background`, не как подтверждение конкретного утверждения. Это даёт auditability без разметки каждого союзного слова.

Editorial lifecycle:

`draft → researching → review_ready → reviewed → published → needs_update → archived`.

`published` требует schema pass, claim coverage, relation/media rights checks и review checklist. Solo owner может делать time-separated self-review; contentious/high-impact claims требуют второго domain reviewer или явного `single_reviewer` disclosure.

## 8. Audio и media architecture

### 8.1 Три разных класса media

1. **Official reference:** platform URL/ID, title, time range и editorial role. Биты не копируются.
2. **Owned/licensed asset:** object storage object с checksum, variants, grant, territory, expiry, `offlineAllowed` и `trainingAllowed`.
3. **User upload:** отдельный private/quarantine lifecycle; никогда не становится card asset или training sample без отдельного explicit opt-in и rights declaration.

Waveform, preview, extracted features и embeddings — derived assets со ссылкой на source asset, algorithm/version и deletion dependency. Недоступный источник получает state `removed|private|geo_blocked|broken|rights_expired` и replacement note; карточка остаётся работоспособной.

### 8.2 Git, LFS, object storage и offline

**Факт.** Git LFS заменяет большие binaries pointer-файлами и хранит content вне обычного Git object store ([Git LFS](https://git-lfs.com/), проверено 24.07.2026). **Решение.** В Git допускаются manifests, принадлежащие проекту иллюстрации и очень малые gold demos. LFS можно использовать только для небольшого проверенного набора assets; основной media corpus и dataset — object storage, потому что нужны lifecycle, deletion, access control и независимые releases.

**Факт.** Cloudflare R2 предоставляет S3-compatible object storage, strong consistency и lifecycle rules; presigned URL является bearer capability, а object deletion по lifecycle исполняется асинхронно ([R2 overview](https://developers.cloudflare.com/r2/how-r2-works/), [Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [Object lifecycles](https://developers.cloudflare.com/r2/buckets/object-lifecycles/), проверено 24.07.2026).

**Решение.** R2 подходит web-профилю как provider, но storage interface не должен включать R2-specific semantics. Upload идёт в private quarantine prefix по короткоживущему capability; content type проверяется после decode, а не только по header. Offline pack включает лишь assets с `offlineAllowed=true` и зафиксированным rights snapshot. Внешнее stream audio не кэшируется.

### 8.3 External platforms и global player

**Факт.** YouTube policies запрещают скачивание, отделение audio от video, background play и перекрытие/изменение player; implementation обязан соблюдать актуальные player requirements ([YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies-guide), [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality), проверено 24.07.2026).

**Факт.** SoundCloud API Terms ограничивают persistent caching User Content и прямо запрещают использовать его для AI, fingerprints или как AI input без явной лицензии ([SoundCloud API Terms](https://developers.soundcloud.com/docs/api/terms-of-use), проверено 24.07.2026).

**Решение.** `GlobalPlayer` — domain queue/transport для owned/licensed assets. YouTube/SoundCloud работают через отдельные visible official embed adapters или source links, не через extraction и не как единый background streaming service. В offline режиме они заменяются metadata card + link, а не пустым player.

## 9. Runtime content и platform architecture

### 9.1 Слои данных

1. **Authoring source of truth:** `content-v3/cards/**`.
2. **Validated canonical content:** нормализованный build intermediate с schema/taxonomy/content version.
3. **Generated runtime:** hashed startup, redirects, neutral details shards и offline manifest.
4. **Search:** alias/entity/artist/producer/trait tokens и compact snippets.
5. **Finder:** только признаки, используемые текущим algorithm/version.
6. **Details:** full editorial card и rights-safe media metadata.
7. **Training exports:** только из отдельного dataset registry; card taxonomy может быть target vocabulary, но не sample source.
8. **Analytics/feedback:** отдельные event/correction stores с retention и consent.

### 9.2 Рекомендуемая granularity

**Решение.** Начать с hybrid:

- startup index + redirects при старте;
- search index лениво при первом search intent либо preloaded после idle;
- Finder payload при открытии Finder;
- details в `atlas-details-<shard-id>.<hash>.json`; `shard-id` является непрозрачным build-time ID;
- media manifests входят в details, media bytes загружаются отдельно;
- portable build встраивает тот же набор generated artifacts в локальный provider.

Это продолжает уже доказанную lossless projection foundation. Manifest хранит `entityId → shardId`. Generator может группировать карточки по size/access/navigation affinity, но grouping не входит в taxonomy. После 10–20 v3 cards и затем после первого масштабирования granularity пересматривается по real transfer, cache hit, parse time и navigation pattern. Перегруппировка shards меняет только generated manifest/assets: taxonomy version, entity IDs, kinds и relations не меняются. Ни один конкретный bundle reduction не обещается до реализации и измерения.

`ContentRepository` скрывает web fetch и portable embedded modules. Обязательные методы: `getStartup`, `search`, `getFinderData`, `getEntity`, `getNeighborhood`, `getContentVersion`. `StoragePort`, `AudioPort` и `AnalysisPort` аналогично имеют web/portable adapters.

### 9.3 Caching, races, deep links и SSR

- hashed artifacts получают immutable cache policy; manifest — short-lived/revalidated;
- rejected details-shard promise удаляется из cache, чтобы retry был возможен;
- navigation использует `AbortController`/request generation и игнорирует stale result после смены entity;
- prefetch запускается на intent/focus или predictable next step, не для всех details shards;
- canonical routes: `/directions/<id>` и позже `/entities/<id>`; старый `#genre=<id>` преобразуется client-side через redirects;
- SSR главной использует startup index, не full details;
- detail route может SSR concise index identity, а нужный details shard загружать/рендерить по платформенной возможности;
- bookmarks/recent/compare хранят ID + content/taxonomy version и разрешают redirects при чтении.

**Факт.** Cloudflare Static Assets развёртываются вместе с Worker, но `_headers` не управляет response, сгенерированным Worker SSR; такие headers задаются в Worker response ([Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/), [Static Assets headers](https://developers.cloudflare.com/workers/static-assets/headers/), проверено 24.07.2026).

### 9.4 Offline и portable

Service Worker/Cache API может дать web offline shell, но browser storage остаётся управляемым браузером и требует versioned cache lifecycle ([MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), [PWA caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching), проверено 24.07.2026). Поэтому:

- web offline — удобство: core shell/index и явный downloadable content pack;
- Windows portable — гарантированный embedded corpus и local state;
- portable не зависит от CDN/embeds для чтения карточек;
- local cache migrations работают по content schema/version, старый pack удаляется только после успешной активации нового;
- один content release manifest используется обеими платформами.

### 9.5 Platform profiles и будущий desktop wrapper

| Capability | Web/Cloudflare | Windows portable | Будущий desktop wrapper | Optional cloud AI |
|---|---|---|---|---|
| Общий core | domain entities/use cases/repository contracts | тот же core | тот же core, native process только за port | не содержит UI/domain truth |
| Content loading | hashed static assets/SSR startup index | embedded release resources | embedded/downloaded signed pack | не является источником карточек |
| Storage | browser local state; optional authenticated sync | localhost state adapter/files с ограниченной schema | OS application data + migration | private R2/object store для uploads |
| Audio | owned web audio + visible official embeds | owned/offlineAllowed assets; external link fallback | native decoder/player adapter при доказанной пользе | isolated decode/features |
| Analysis | local browser capability либо cloud adapter | local CPU adapter или честное unavailable | native ONNX/ExecuTorch/process adapter после benchmark | GPU/service implementation `AnalysisPort` |
| Update | atomic app deploy + content manifest revalidation | versioned portable package/content pack; previous retained | signed application/content updater | independently versioned model endpoint |
| Offline | shell/index/downloaded pack, browser best-effort | гарантированный base corpus | гарантированный base corpus | недоступен, core продолжает работать |
| Secrets | Worker bindings, не client | отсутствуют | OS secret store только при account feature | service-side only |

**Решение.** Не создавать отдельный desktop product tree. Если browser/portable profile не способен обеспечить безопасный decode или acceptable local inference, wrapper добавляет native adapter/process, но UI, content graph, use cases и contracts остаются общими. Update system активирует app/content/model pair только после compatibility/hash check и сохраняет предыдущую работоспособную пару.

## 10. Сравнение полных архитектур

### 10.1 Веса

Веса следуют blueprint: offline/portable и solo delivery получили высокий вес как обязательные ограничения; product utility важнее инфраструктурной элегантности; AI важен, но не должен опережать data quality.

| Критерий | Вес | Основание |
|---|---:|---|
| Product value и UX-loop | 20 | главная форма продукта |
| Solo delivery/complexity | 18 | один разработчик, staged migration |
| Windows portable/offline | 18 | зафиксированная платформа |
| Web/Cloudflare | 12 | обязательный deployment |
| Content governance/migration | 12 | новая база с нуля, legacy preservation |
| AI/dataset evolvability | 10 | важная будущая функция, не MVP truth |
| Privacy/security | 6 | audio uploads и derived data |
| Cost/vendor lock-in | 4 | устойчивость solo-продукта |

Оценка 1 — плохо, 5 — хорошо.

### 10.2 Decision matrix

| Кандидат | Value 20 | Solo 18 | Offline 18 | Web 12 | Content 12 | AI 10 | Privacy 6 | Cost 4 | Итог / 5 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Static content platform | 3 | 5 | 5 | 5 | 4 | 2 | 4 | 5 | **4.12** |
| Local-first hybrid | 5 | 4 | 5 | 5 | 5 | 4 | 5 | 4 | **4.68** |
| Service-oriented web | 5 | 2 | 1 | 4 | 3 | 5 | 2 | 1 | **3.04** |

### 10.3 Кандидаты

#### 1. Static content platform

Файлы → build → static assets, без постоянного backend. Самый дешёвый, быстрый, тестируемый и offline-friendly. Хорош для карточек, поиска и Finder, но главный upload/analyze loop остаётся локальным экспериментом; feedback, deletion и cloud AI быстро создадут ad-hoc endpoints.

**Rollback:** previous static release.\
**Главный риск:** продукт снова станет encyclopedia-first.

#### 2. Local-first hybrid — рекомендуется

Static content core + optional service capabilities. Web использует Cloudflare static assets/Worker/R2 по необходимости; portable — embedded assets/local adapters. Analysis может быть local, cloud или hybrid за одним `AnalysisPort`.

**Плюсы:** сохраняет offline, допускает AI и private uploads, не требует раннего service decomposition, одна кодовая база.\
**Риски:** дисциплина adapter boundaries; две execution profiles нужно тестировать; local inference может оказаться слишком тяжёлым.\
**Rollback:** отключить cloud/analysis feature и оставить static corpus/previous manifest.

#### 3. Service-oriented web platform

API/DB/graph/media/AI services становятся источником runtime. Подходит многопользовательской команде и частым live updates, но создаёт network dependency, portable divergence, costs и большой operational surface до product validation.

**Rollback:** сложный data/service rollback.\
**Главный риск:** инфраструктура опережает контент и dataset.

### 10.4 Полное покритериальное сравнение

| Критерий | Static content | Local-first hybrid | Service-oriented web |
|---|---|---|---|
| Сложность | низкая | средняя, главный риск — discipline adapters | высокая: API/data/jobs/ops |
| Скорость solo-разработки | самая высокая для read-only atlas | высокая при staged optional services | низкая до появления команды |
| Стоимость | static hosting и build | static baseline + usage-based storage/compute | постоянные service/observability costs |
| Web | отлично | отлично | отлично при доступной сети |
| Windows portable | отлично | отлично через embedded adapter | плохо: требуется offline replica или второй runtime |
| Offline | полный corpus | полный corpus, analysis capability зависит от adapter | ограниченный snapshot |
| Cloudflare | Static Assets/Worker | Static Assets + optional Worker/R2/jobs | Workers/API/DB/R2 становятся critical path |
| AI | local experiment ограничен | local/cloud/hybrid за `AnalysisPort` | cloud AI проще, local сложнее |
| Dataset | внешняя research subsystem | отдельная subsystem, может обслуживать local/cloud | удобно интегрировать pipeline, но легко смешать product data |
| Content authoring | files/Git естественны | files/Git, Studio добавляется позже | admin/API часто появляется слишком рано |
| Migration | самая простая | параллельный provider/feature flag | требует service/data cutover |
| Testing | deterministic build/offline | contract tests двух profiles | integration/ops/security matrix шире |
| Масштабирование | хорошо для versioned corpus | хорошо для corpus и optional services | лучше для live collaboration/high write rate |
| Privacy | минимальный server data | local-first default + controlled cloud | uploads/derived data в service perimeter |
| Vendor lock-in | низкий | низкий при provider-neutral ports | средний/высокий по service primitives |
| Главный риск | encyclopedia-first, слабый analysis loop | adapter divergence и умеренная сложность | infrastructure-first и потеря portable parity |
| Rollback | previous static build | previous app/content/model pointers; отключить optional capability | coordinated service/data rollback |

**Условие пересмотра решения:** если validated usage докажет совместное редактирование большой команды, near-real-time publication и cloud-only AI как основной value, service-oriented вариант можно повторно оценить. Пока статический corpus и optional services дают больше обратимости.

## 11. Audio AI strategy

### 11.1 Сначала задачи, затем модели

Отдельно измеряются:

- broad family classification;
- microgenre retrieval;
- multi-label entity/trait classification;
- BPM/key/rhythm/structure extraction;
- nearest references;
- similarity search;
- production trait detection;
- explanation faithfulness;
- OOD/abstention;
- user correction.

Один score не описывает их качество.

### 11.2 Категории решений

| Категория | Назначение | Плюсы | Ограничения и commercial gate | RAP ATLAS |
|---|---|---|---|---|
| Deterministic MIR features | BPM, onsets, tempogram, chroma, spectral summaries | быстро, объяснимо, CPU-friendly | half/double tempo, key и mix-dependent errors | Phase 0 evidence, не genre truth |
| Music SSL embeddings (MuQ/MERT и аналоги) | similarity и downstream features | music-oriented representations | крупные модели; опубликованные MuQ/MERT weights имеют non-commercial ограничения | research benchmark, не production default |
| Audio-text embeddings (CLAP/MuQ-MuLan/M2D2) | zero-shot/retrieval по тексту | быстро проверяют vocabulary/references | prompt/language/domain bias; license weights/data надо проверять отдельно | Phase 1 candidate после license gate |
| Lightweight task extractors | pitch/MIDI/beat/keys | локальная объяснимая черта | узкая задача, full mix не всегда подходит | optional local feature adapters |
| Supervised multi-label model | family/entity/traits | оптимизируется под taxonomy | требует independent dataset, leakage control, calibration | Phase 2 |
| Retrieval + rules + classifier | neighbors + measurable traits + labels | лучше auditability и abstention | сложнее evaluation/maintenance | рекомендуемый production direction |
| Generative audio-language model | narrative explanation | гибкая формулировка | latency/hardware/hallucination/license; не гарантирует faithful evidence | только verbalization на Phase 3 |

### 11.2.1 Обязательные gates по каждой категории

| Категория | Hardware/latency | License/commercial | Русский интерфейс | Underground taxonomy/fine-tuning | Риск ложной уверенности |
|---|---|---|---|---|---|
| Deterministic MIR | CPU/local обычно реалистичен, но измеряется на полном track и target Windows | выбирать permissive library; extractor и model weights проверять отдельно | язык не влияет на сигнал; explanations локализуются редакционно | fine-tuning не нужен, но нужны domain thresholds и error cases | средний: BPM/key выглядят точными; показывать alternative interpretation/quality |
| Music SSL embeddings | сотни миллионов parameters могут потребовать GPU/cloud или медленный CPU; обязательны RAM/startup/RTF tests | многие публичные weights non-commercial; production только после snapshot audit/отдельной лицензии | audio embedding language-neutral; label explanation — отдельный слой | нужен свой retrieval corpus; fine-tuning только после leakage-safe dataset | высокий: nearest neighbor может быть artist/recording memory |
| Audio-text embeddings | GPU/cloud для крупных models; browser/local viability не предполагается без benchmark | code, weights и training corpus имеют разные права | bilingual prompt set тестируется отдельно; English score нельзя выдавать как русский semantic truth | zero-shot ожидаемо ограничен нишевыми/новыми labels; contrastive fine-tuning возможен лишь после dataset gate | высокий: fluent text match маскирует domain/prompt bias |
| Lightweight task extractors | CPU/edge наиболее реалистичны; latency зависит от duration/stem/full mix | отдельная проверка code и bundled weights; permissive code не очищает weights | язык не влияет | fine-tuning нужен только для конкретной trait task; это не taxonomy classifier | средний: pitch/key/beat могут ломаться на noisy/full mixes |
| Supervised multi-label | training обычно GPU; inference size выбирается после distillation benchmark, не заранее | права на framework/weights/data/export обязаны разрешать commercial purpose | UI полностью локализуем; label IDs language-neutral | собственное обучение обязательно, если public model не покрывает taxonomy | очень высокий без calibration, OOD, class thresholds и abstention |
| Retrieval + rules + classifier | стоимость суммы компонентов; нужны end-to-end p50/p95, RAM и cold-start measurements | все компоненты проходят независимый gate | reasons строятся из locale-neutral evidence IDs и русских editorial templates | лучший путь для постепенной domain adaptation | ниже, если disagreements видимы; остаётся automation bias |
| Generative audio-language | самая высокая и переменная latency; local portable не baseline | provider/model/data terms и retention требуют отдельного review | русский output возможен, но faithfulness тестируется отдельно | fine-tuning не заменяет structured ground truth; использовать только после evidence plan | максимальный: запрещено генерировать причины без traceable inputs |

**Факт.** MuQ repository указывает примерно 300M/700M variants и CC BY-NC 4.0 для weights; MERT model cards также указывают CC BY-NC 4.0 ([MuQ](https://github.com/tencent-ailab/MuQ), [MERT-v1-330M](https://huggingface.co/m-a-p/MERT-v1-330M), проверено 24.07.2026). Они пригодны для исследования, но не являются безопасным commercial default.

**Факт.** Код LAION-CLAP опубликован под CC0, однако repository отдельно предупреждает об ограничениях copyright training data; license кода нельзя автоматически переносить на веса и данные ([LAION-CLAP](https://github.com/LAION-AI/CLAP), проверено 24.07.2026).

**Факт.** Essentia library распространяется по AGPL или commercial license, а многие pretrained models — с non-commercial условиями; это отдельный dependency gate ([Essentia licensing](https://essentia.upf.edu/licensing_information.html), проверено 24.07.2026). `librosa` имеет ISC license и предоставляет beat/chroma/spectral primitives ([librosa feature extraction](https://librosa.org/doc/latest/feature.html), [license](https://github.com/librosa/librosa/blob/main/LICENSE.md), проверено 24.07.2026).

**Оценка.** Русский UI не требует русскоязычного audio encoder. Но text-aligned retrieval требует bilingual label/prompt evaluation; canonical English prompts и русские editorial explanations нужно тестировать отдельно. Underground rap taxonomy почти наверняка потребует собственных annotations/retrieval corpus и, позже, fine-tuning: публичный leaderboard этого не доказывает.

Hardware/latency нельзя обещать по model size. Каждый candidate проходит одинаковый benchmark на целевом Windows CPU, доступном GPU и Cloudflare/cloud execution profile. WebNN остаётся Editor’s Draft, поэтому не является обязательной portable dependency ([WebNN specification](https://webmachinelearning.github.io/webnn/), проверено 24.07.2026).

### 11.3 Этапы

**Phase 0 — task and deterministic baseline.** Safe decode, duration/range selection, BPM/onset/tempogram/chroma/spectral features, hand-authored reference cases, correction UI. Никакого genre probability.

**Phase 1 — embeddings + retrieval.** Frozen, license-cleared encoder; nearest licensed examples; group-separated benchmark; explanation через annotated neighbor traits. Если encoder не проходит license/latency/domain gates, остаётся server-side research tool.

**Phase 2 — calibrated multi-label ensemble.** Hierarchical family + graph labels + production traits, retrieval ensemble, OOD score, class thresholds, abstention. Training only after dataset readiness.

**Phase 3 — faithful explanation and feedback learning.** Structured evidence формирует explanation plan; language model может только переформулировать подтверждённые facts/limitations. Corrections попадают в review queue, не напрямую в training.

## 12. Dataset architecture и evaluation

**Решение.** Dataset отделён от карточек физически, логически и по release lifecycle. Sample manifest хранит stable sample ID, recording/work/release/artist/producer groups, source/license/consent, checksum, segment, labels, negative labels, traits, annotators/reviewers, taxonomy version, split и deletion state.

**Факт.** Artist overlap между train/test может завышать оценку genre classification ([Flexer, “A Closer Look on Artist Filters”](https://ismir2007.ismir.net/proceedings/ISMIR2007_p341_flexer.pdf), проверено 24.07.2026). Duplicate recordings и разные edits также вызывают retrieval leakage ([Won et al., 2023](https://arxiv.org/abs/2302.12258), проверено 24.07.2026).

Поэтому split назначается не sample-строке, а connected leakage group:

`recording/work/release/near_duplicate/artist/producer/source_pack`.

Benchmark дополнительно имеет artist-held-out и producer-held-out views. Fingerprints/checksums/metadata similarity и ручной review ловят remaster/edit/stem/loop variants. Hybrid samples получают несколько positive labels, optional primary context, negative/hard-negative labels и `ambiguous` вместо принудительного одного класса.

Minimum viable dataset определяется gates, а не выдуманным числом: для каждой included class должны существовать независимые recording, artist и producer groups, достаточные для group-separated train/validation/test/calibration; benchmark items — независимо размечены и reviewed; rights и deletion path проверены; learning curve ещё показывает измеримую пользу. Если gate не выполнен, класс остаётся retrieval/editorial-only.

Evaluation:

- macro/micro average precision и F1, per-class PR curves/confusion;
- LRAP для multi-label ranking ([scikit-learn LRAP](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.label_ranking_average_precision_score.html), проверено 24.07.2026);
- Recall@K/MAP@K и query-group slices для retrieval;
- reliability diagrams/Brier-like calibration и class thresholds ([scikit-learn calibration](https://scikit-learn.org/stable/modules/calibration.html), проверено 24.07.2026);
- risk/coverage для abstention и OOD;
- explanation faithfulness: каждое reason привязано к feature/annotation/retrieved evidence; human usefulness оценивается отдельно;
- corrections по taxonomy/model version, без автоматического переобучения.

## 13. Privacy, legal и security

Это архитектурное исследование, не юридическая консультация.

### 13.1 Базовые обязательства архитектуры

**Факт.** GDPR закрепляет purpose limitation, data minimization, storage limitation, security, erasure и data protection by design/default ([GDPR consolidated text](https://eur-lex.europa.eu/eli/reg/2016/679/oj), проверено 24.07.2026).

**Решение.**

- analysis и training — разные purposes и consent;
- training opt-in отдельный, выключен по умолчанию и не является условием анализа;
- local processing предлагается как privacy-preserving default, когда технически доступно;
- cloud raw upload имеет короткий declared TTL; raw, preview, features, embeddings и logs имеют отдельные retention records;
- derived embeddings удаляются каскадно вместе с upload, пока нет отдельного законного основания;
- пользователь видит export/delete controls; deletion job имеет auditable status;
- raw audio и filename не попадают в telemetry;
- content analytics не записывает полный свободный search query по умолчанию;
- geographic/data-location promise делается только при реально настроенной jurisdiction. R2 location hint не равен гарантии; jurisdiction является отдельной настройкой ([R2 data location](https://developers.cloudflare.com/r2/reference/data-location/), проверено 24.07.2026).

### 13.2 Upload security

OWASP рекомендует allowlist extensions, проверку signature/MIME, generated filenames, size limits, storage вне webroot, antivirus/sandbox и least privilege ([OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), проверено 24.07.2026).

Pipeline: capability → quarantine → size/rate check → magic-byte/container parse → sandboxed decode с CPU/duration/channel limits → malware scan при доступности → metadata strip → checksum/dedup → analysis → TTL deletion. Original filename хранится отдельно и экранируется. Archive/executable formats запрещены. Presigned upload не означает trusted file.

### 13.3 Minors и нерешённая юрисдикция

**Факт.** COPPA может относить voice recording к personal information и требует parental consent/retention controls для covered services; FTC обновляет guidance и enforcement policy ([FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions), [FTC 2026 policy statement](https://www.ftc.gov/news-events/news/press-releases/2026/02/ftc-issues-coppa-policy-statement-incentivize-use-age-verification-technologies-protect-children), проверено 24.07.2026). UK Children’s Code требует high-privacy defaults для сервисов, вероятно доступных детям ([ICO Children’s Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code/), проверено 24.07.2026).

**Решение до legal review:** не создавать child-targeted accounts/social upload; не использовать uploads несовершеннолетних для training; минимизировать retention и начать с local/session-only analysis. Возрастная модель, география запуска, lawful basis, copyright exceptions, статус embeddings и contracts для contributors требуют юриста.

## 14. Content Studio

**Решение.** На первом этапе source-controlled files + schema validation + preview build + review checklist лучше закрытой админки: меньше систем истины, проще diff/rollback и дешевле solo-разработчику.

Studio становится оправданным, если повторяемо доказаны хотя бы два bottleneck: авторинг JSON вызывает ошибки, несколько редакторов работают параллельно, очередь suggestions значительна, media rights/stale checks трудно вести вручную, publication cadence ограничена Git workflow.

Тогда Studio:

- аутентифицирован и закрыт;
- редактирует тот же canonical format, а не свою DB truth;
- создаёт draft branch/change set;
- показывает schema/claim/relation/media validation;
- управляет source fragments, contradictions и rights;
- даёт preview, semantic diff, checklist, approve/publish;
- создаёт immutable content release manifest;
- откатывает pointer на предыдущий release;
- ведёт append-only audit log;
- отдельно показывает user suggestions, broken/stale sources и expiring rights.

## 15. Testing, observability и quality gates

### 15.1 Content/runtime

- JSON Schema и cross-file validation;
- unique IDs, redirects/tombstones и taxonomy migration;
- relation target/type/inverse/symmetry/cycle integrity;
- claim coverage для high-impact fields;
- citation access/archive checks с controlled retry;
- media URL/adapter/rights/expiry/offline/training checks;
- search aliases и Finder feature parity;
- every canonical entity exactly once in runtime details;
- startup не импортирует full details;
- stale request/cancel/retry/prefetch tests;
- SSR/deep link/legacy hash tests;
- content manifest hashes и previous-version rollback.

### 15.2 Platform/UX

- current bundle numbers остаются baseline, затем после первого split фиксируется новый measured budget; reduction не утверждается заранее;
- portable cold start без network, embedded content completeness, update rollback и state migration;
- keyboard-only flows, screen reader smoke, automated a11y, focus/target/status/player tests;
- visual regression для desktop/mobile, dark/light, loading/error/offline/long-text;
- external embed policy/availability contract tests.

### 15.3 AI/dataset/privacy

- immutable benchmark и model card;
- per-class/slice/retrieval/calibration/OOD/abstention gates;
- duplicate/artist/producer/release leakage tests до train;
- annotation agreement и unresolved ambiguity report;
- explanation evidence coverage;
- consent/version/TTL/delete/export cascade tests;
- security decode corpus, rate/size/timeout and quarantine tests.

Observability содержит content/taxonomy/model versions, adapter/error class, latency phases и anonymous coarse outcome. Raw audio, embeddings и full queries не являются logging payload. Privacy budget и retention документируются до telemetry.

## 16. Product metrics

Полезные метрики связаны с job completion:

- time to first useful result;
- доля valid uploads, abstentions и recoverable failures;
- acceptance main result, selection alternative и correction rate;
- repeat analysis после production guidance;
- переход Result → Card, запуск релевантного example, использование guidance;
- save и meaningful return to saved/session;
- search zero-result, unsupported query и alias correction;
- model coverage, per-class quality, confusion, calibration и OOD;
- latency/error по local/cloud/portable profile.

Не используются как цель: время в приложении, количество открытых карточек без outcome, streaks и бесконечный scroll. A/B experiment запрещён, если он ухудшает ясность privacy или скрывает uncertainty.

## 17. Migration и release strategy

1. Зафиксировать baseline/ADRs и не менять current app.
2. Ввести пустой `content-v3` contract, validator и build manifest.
3. Создать одну gold-standard карточку вручную.
4. Собрать 10–20 diverse cards vertical slice; legacy служит lead/reference, а каждый перенесённый claim получает `legacy-import` provenance и независимую проверку.
5. Сгенерировать v3 startup/search/Finder/details shards параллельно current runtime.
6. Создать новый shell за route/feature flag; current 2.x остаётся default.
7. Реализовать single-page card и rights-safe player.
8. Подключить Search/Finder/graph projections и portable embedded provider.
9. Выпустить при необходимости Finder-first content preview: его primary CTA полностью работает, public Analyze отсутствует.
10. Начать internal/opt-in Phase 0 audio laboratory только после privacy/file-policy gates.
11. Перевести Home и navigation в analysis-first state только после прохождения minimum useful analysis gate.
12. Масштабировать corpus после validation/review throughput proof.
13. Разрешить retrieval/training только после dataset readiness.

250 legacy cards не удаляются. До достаточного v3 coverage они продолжают отображаться в текущем продукте. Позже v3 navigation показывает только reviewed v3 entities, а отдельный legacy archive может быть доступен с ясной меткой. Stable redirects сохраняют старые links; один и тот же ID не получает новое значение. App release configuration фиксирует `homeMode: finder_first | analysis_first`, а compatibility manifest связывает его с поддерживаемой версией content, чтобы UI не показывал несогласованный CTA. Release — versioned content manifest + compatible app range. Rollback — pointer на предыдущий app/content pair, а не обратная массовая миграция.

## 18. ADR-style итоговые решения

| Решение | Почему / отклонено | Риск | Проверка | Пересмотреть, если |
|---|---|---|---|---|
| Product: analysis-first learning tool | соответствует основному JTBD; encyclopedia-first отклонён | слабый анализ обесценит promise | usability + result acceptance/correction | Finder/card стабильно полезнее upload |
| Screens: gated Home + Explore/Library/Search, затем public Analyze | до useful-analysis gate Finder является честным primary; после gate Analyze занимает primary/top-level | две public IA-фазы требуют ясного release state | task tests до/после gate и no-dead-CTA check | analysis gate или navigation research требует иной переход |
| Design: quiet editorial + instrument precision | ясность и music focus | слишком стерильно для бренда | contrast/a11y + moderated preference tests | brand research требует другой tone без потери hierarchy |
| Card: JSON + Markdown folder + five content profiles | строгие fields, удобная проза и подходящие sections для разных entity kinds | cross-file/profile complexity | fixtures всех profiles + diverse slice review | измеренный authoring workflow требует иного разделения |
| Validation: JSON Schema `oneOf` + Markdown profile validator | language-neutral discriminant и отсутствие пустых бессмысленных sections | generator/type/section drift | schema fixtures + TS/Markdown parity | toolchain не поддерживает требуемые cross-file rules |
| Graph canonical, tree projection | несколько валидных отношений | authoring complexity | relation integrity + navigation research | corpus реально имеет одно стабильное parenthood |
| Claim-level critical provenance | auditability без citation overload | editorial cost | claim coverage/time study | авторинг становится bottleneck без качества |
| Object storage + embeds/links | rights/lifecycle/offline flags | provider/policy churn | adapter health + rights audits | полностью owned corpus помещается и управляется иначе |
| Hybrid details shards | продолжает доказанный split, уменьшает request explosion и не закрепляет family ontology | uneven shards | real bundle/cache/navigation measures | shards слишком велики/малы или usage требует per-card |
| Shared core + platform adapters | одна кодовая база, offline | adapter leakage | contract tests web/portable | native DSP требует отдельного process, но не отдельного domain |
| Files/Git before Studio | обратимость solo-workflow | manual friction | record edit/review throughput | bottleneck/multi-editor conditions выполнены |
| Separate dataset registry | cards не являются training truth | taxonomy synchronization | version/link/leakage tests | никогда; можно менять storage, не разделение |
| Staged hybrid AI | evidence и calibration прежде model fashion | медленнее demo | frozen benchmark at every phase | новый method проходит rights/domain/latency gates |
| Privacy: local-first, separate training opt-in | minimization и trust | local capability limited | deletion/consent/security tests | legal/product geography меняет obligations |
| Parallel v2/v3 migration | no big-bang and reversible | временно две системы | feature flag + parity + release manifest | vertical slice доказал полный replacement |
| Release: versioned app/content pair | portable/web consistency | compatibility matrix | clean install/upgrade/rollback | live editing becomes required |

## 19. Риски и открытые вопросы

### Главные риски

1. Недостаточно легально пригодных и разнообразных audio examples для обучения.
2. Taxonomy может быть слишком спорной или мелкой для измеримой classification task.
3. Один разработчик может недооценить editorial provenance cost.
4. Portable local inference может не пройти latency/memory gates.
5. External platform policies и availability меняются.
6. Shard builder может ошибочно использовать navigation family как semantic truth вместо нейтрального build grouping.
7. Два runtime profiles могут расходиться без contract tests.
8. Пользователь может воспринимать explanations как доказательство точности даже без процентов.

### Открытые вопросы владельцу

- Географии запуска, возрастная политика и будет ли account/cloud upload в первом public v3?
- Какие собственные или лицензируемые audio assets реально доступны, с какими offline/training правами?
- Какие 10–20 направлений образуют первый diverse vertical slice и кто подтверждает disputed claims?
- Должна ли v3 поддерживать полностью local audio analysis в первом релизе или допустим Phase 0 только как opt-in laboratory?
- Нужна ли английская локализация при первом v3 release или достаточно подготовленной схемы?
- Можно ли публично показывать отдельный legacy archive после появления v3, или legacy остаётся только internal reference?
- Какой целевой минимум Windows hardware должен стать benchmark profile?
- Требуется ли sync bookmarks/recent между устройствами? По умолчанию RFC оставляет их local-only.

## 20. Источники и статус утверждений

Все web-источники проверены 24.07.2026. Технические и policy-условия считаются snapshot, а не вечной гарантией.

- Cloudflare: [R2 overview](https://developers.cloudflare.com/r2/how-r2-works/), [data location](https://developers.cloudflare.com/r2/reference/data-location/), [object lifecycle](https://developers.cloudflare.com/r2/buckets/object-lifecycles/), [presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [Static Assets](https://developers.cloudflare.com/workers/static-assets/).
- Standards: [JSON Schema](https://json-schema.org/specification), [SKOS](https://www.w3.org/TR/skos-reference/), [PROV-O](https://www.w3.org/TR/prov-o/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/).
- UX: [Apple HIG Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls), [Google PAIR](https://pair.withgoogle.com/chapter/explainability-trust/), [Ableton Live 12 Manual](https://cdn-resources.ableton.com/resources/pdfs/live-manual/12/2026-04-30/live12-manual-en.pdf), [Splice Finding Sounds](https://support.splice.com/en/articles/8652594-finding-sounds).
- Media policies: [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies-guide), [YouTube Required Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality), [SoundCloud API Terms](https://developers.soundcloud.com/docs/api/terms-of-use), [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget).
- Audio/MIR: [MuQ paper](https://arxiv.org/abs/2501.01108), [MuQ repository](https://github.com/tencent-ailab/MuQ), [MERT](https://huggingface.co/m-a-p/MERT-v1-330M), [LAION-CLAP](https://github.com/LAION-AI/CLAP), [M2D2](https://arxiv.org/abs/2503.22104), [Basic Pitch](https://github.com/spotify/basic-pitch), [librosa](https://librosa.org/doc/latest/), [Essentia licensing](https://essentia.upf.edu/licensing_information.html).
- Dataset/evaluation: [Artist filters](https://ismir2007.ismir.net/proceedings/ISMIR2007_p341_flexer.pdf), [recording leakage](https://arxiv.org/abs/2302.12258), [average precision](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html), [LRAP](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.label_ranking_average_precision_score.html), [calibration](https://scikit-learn.org/stable/modules/calibration.html).
- Privacy/security: [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [EDPB consent summary](https://www.edpb.europa.eu/system/files/2026-04/edpb-summary-consent_en.pdf), [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions), [ICO Children’s Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code/), [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

**Гипотезы, требующие прототипа:** полезность семи evidence groups; оптимальный размер details shards; пригодность конкретного embedding encoder; local inference latency; ценность session pattern view; редакционная стоимость claim-level provenance.
