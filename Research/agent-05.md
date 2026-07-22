# RAP ATLAS — agent-05

**Дата среза:** 22 июля 2026  
**Объект:** SIE ambient; myrlu / aghast producer lane; Ambient wave / Plaguecivitas; Philly void rap; Choir drill / Minimal drill.

## Метод и ограничения

- Поиск охватывал точные словосочетания, варианты написания, страницы артистов и коллективов, оригинальные загрузки, интервью, дистрибьюторские credits и профильную журналистику.
- Иерархия доказательств: **A** — страницы участников, оригинальные загрузки, интервью, credits; **B** — профильная журналистика; **C** — фанатские обсуждения, теги, плейлисты и type-beats.
- Отсутствие индексируемого самоназвания не доказывает, что слово никогда не звучало в закрытом чате. Оно означает, что термин нельзя уверенно помещать в публичный атлас как установленное имя.
- Я не заявляю о полном прослушивании каталогов. Описания звучания основаны на доступных редакционных описаниях, credits и метаданных. Собственные выводы помечены как выводы RAP ATLAS.
- `ambient`, `wave`, `void`, `minimal` считаются жанровыми признаками только при устойчивом внутреннем употреблении и повторяемой музыкальной грамматике.

# HANDOFF

| Термин | Статус | Решение | Главная причина | Уверенность |
|---|---|---|---|---|
| **SIE ambient** | **SIE — реальный интернет-коллектив/идентичность; “SIE ambient” — неподтверждённый жанровый ярлык.** | Оставить **SIE** как коллектив и сеть связей. Удалить отдельный жанровый узел **SIE ambient**; допустимо поле `associated_with: ambient rap`. | Pitchfork называет SIE распределённым коллективом и перечисляет suckrball, 22, sheroy, hunnakay, kllhhr; credits используют имя `suckrball sie`. Но точная фраза **SIE ambient** не найдена в самоназваниях. Расшифровка SIE остаётся неподтверждённой. | Коллектив **0.90**; состав **0.72**; расшифровка **0.20**; жанровый термин **0.12** |
| **myrlu / aghast producer lane** | **Реальная повторяемая сопродюсерская линия; не доказанная “школа” и не жанр.** | Создать узел **producer partnership / recurring production lane: myrlu × aghast**. Не создавать школу с учениками или жанр без самоназвания. | Независимые credits и оригинальные загрузки многократно ставят myrlu и aghast вместе у Zel, 3doly, slaq/1200Boom, killjae, kllhhr и osogyn. Это больше, чем случайная коллаборация, но нет найденного названия школы, манифеста или подтверждённого круга последователей. | Партнёрство **0.94**; узнаваемая линия **0.80**; школа **0.28** |
| **Ambient wave / Plaguecivitas** | **Plaguecivitas — реальный релизный импринт и производственная сеть; Ambient wave — слабый внешний зонтик. Это не синонимы.** | Разделить: **Plaguecivitas** хранить как label/collective-network; **Ambient wave** — только как низкоуверенный внешний alias или удалить. Не смешивать с “Ambient-wave plugg”. | Qobuz показывает отдельную label-page Plaguecivitas и 23 релиза, начиная как минимум с февраля 2024; credits связывают cwta, CIRE, Dripinoy, sexadlibs, lagsight и других. `ambient wave` найден прежде всего в фанатском комментарии 2026 года, смешивающем Plaguecivitas, SIE и StepTeam. | Plaguecivitas **0.92**; официальный полный roster **0.54**; Ambient wave **0.22** |
| **Philly void rap** | **Не подтверждённый термин; журналистская метафора, превращённая в ложный жанр.** | Удалить узел **Philly void rap**. Оставить Tovi и HappyDranker в **Philly street rap / Philly drill-adjacent** и добавить параметры микса: `drowned-out`, `muffled`, `low-definition`, `pitch-shifted vocal`. | Точная фраза не обнаружена у артистов. Источник конструкции — формулировка Pitchfork о “muffled transmissions from the void”, то есть образное описание Tovi/HappyDranker. В другой рецензии автор продолжает относить их к Philly drill. | Отсутствие установленного жанра **0.96**; отдельная микс-линия **0.82** |
| **Choir drill / Minimal drill** | **Choir drill — повторяемый журналистский/продюсерский shorthand внутри Philly drill; Minimal drill — обычное прилагательное, не установленное имя сцены.** | Сохранить **Philly drill**. `choir-sample` и `sparse/minimal arrangement` сделать признаками. **Choir drill** хранить максимум как внешний alias `critic term`; отдельный узел **Minimal drill** удалить. | Pitchfork несколько раз употребляет `choir-drill` для линии OT7 Quanny/Lil Buckss/Hood Tali P → Skrilla; producer market узнаёт запрос “dark choir Skrilla/OT7”. Но самоназвания артистов не найдено. `Minimal drill` распадается на общие описания и единичные пользовательские изобретения. | Choir drill как descriptor **0.82**, как самоназванный жанр **0.25**; Minimal drill как жанр **0.08** |

# EVIDENCE

## 1. SIE ambient

### Статус и употребление

**Подтверждено:** SIE существует как коллективная идентичность/сеть артистов.  
**Не подтверждено:** установленная расшифровка SIE; внутренний жанровый термин `SIE ambient`.

Самое раннее надёжно индексируемое употребление в найденном корпусе — профиль Tazparis и загрузки начала 2026 года. Это не дата основания. В марте 2026 дистрибьюторские credits уже фиксируют имя `suckrball sie`; 26 июня 2026 Pitchfork публично описывает SIE как коллектив.

### Первичные подтверждения

1. [Tazparis — SoundCloud](https://soundcloud.com/tazparis) — профиль индексируется со словом `SIE`; внутренний след идентичности, хотя страница частично закрыта для автоматического чтения.
2. [22 Pooruhn — “backdoor” (Shazam credits)](https://www.shazam.com/song/1885869742/backdoor) — релиз 16 марта 2026; в исполнителях и авторах стоит `suckrball sie`, продюсеры 1act и aghast. Имя прошло через дистрибьюторские credits.
3. [suckrball + kllhhr — “sie” upload by wixxo](https://soundcloud.com/1wixxo/sie) — опубликовано 20 января 2026. Не официальный roster, но свидетельство узнаваемой связки.
4. [SIE archive — Instagram](https://www.instagram.com/1siearchive/) — архивная страница, связанная с SIE-именами; не официальный roster-документ.
5. [Pitchfork — “An Introduction to the Ambient Rap Scene”](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/) — называет SIE “internet-first, dispersed collective” и перечисляет suckrball, 22, sheroy, hunnakay, kllhhr.
6. [Reddit: “Does anyone know what SIE stands for…”](https://www.reddit.com/r/ug_music/comments/1skyap1/does_anyone_know_what_sie_stands_for_in_relation/) — **низкий вес**. Несовместимые версии `stain in everything` и `she`; вторая якобы восходит к недоступному TikTok-комментарию аффилиата. Ни одна версия не годится как факт.
7. [suckrball — “jump” prod. 1act & aghast](https://soundcloud.com/suckrball/jump-prod-act-aghast) — артистическая загрузка с отображением SIE как связанной идентичности.
8. [22 feat. hunnakay — “cropped” prod. undrcvr & study](https://soundcloud.com/upmygen/22-k-calm-p-undvrstudy) — пример связи SIE-артистов с продюсерской сетью undrcvr.

### Звук

**Источник:** Pitchfork описывает широкий ambient-rap контекст как тихую headphone-oriented музыку с едва заметными снейрами; у suckrball — спирали фортепиано; у hunnakay/undrcvr — приглушённые синты, выцветшие drums и цифровые эффекты; у kllhhr — сухая подача, хрупкие мелодии и scuttling drums.

**Вывод RAP ATLAS:** SIE не имеет доказанной единой drum grammar. Коллектив связывает работы 1act, aghast, undrcvr, disorderly, num, wizardpem и других:

- **drums/kick:** часто разреженные, но не единообразные;
- **808/саб:** plugg/drill наследие, не коллективный идентификатор;
- **мелодия:** piano spirals, блеклые digital keys, drones;
- **вокал:** сухой, тихий, разговорный или мелодически сдержанный;
- **микс:** близкий, тусклый, иногда намеренно недопроявленный.

Это признаки части каталога, а не основание жанра `SIE ambient`.

### Опорные записи

- suckrball — “alone” prod. 1act — контекст и ссылка: [Pitchfork](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/)
- [22 Pooruhn feat. suckrball — “backdoor”](https://www.shazam.com/song/1885869742/backdoor)
- hunnakay — “limpin” prod. undrcvr — [Pitchfork](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/)
- kllhhr feat. killjae — “proud” prod. disorderly & num — [Pitchfork](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/)
- [kllhhr — popular tracks, включая “blink” prod. aghast & myrlu](https://soundcloud.com/kllhhr/popular-tracks)
- [22 feat. hunnakay — “cropped”](https://soundcloud.com/upmygen/22-k-calm-p-undvrstudy)

### Сцена, producer lane, mix

- **SIE:** коллектив/социальная сеть.
- **Ambient rap:** более широкий внешний umbrella, куда критик помещает часть SIE.
- **SIE ambient:** искусственная склейка коллектива и umbrella.
- **Quiet/muffled:** параметры аранжировки и микса, не членство.

### Соседи и границы

Связи: ambient rap, plugg/dark-plugg adjacency, StepTeam-подобная асимметрия drums, ранний LUCKI как ретроспективное сравнение, Plaguecivitas через undrcvr/cwta. Если трек узнаётся как SIE только по участникам и credits, это collective identity, не жанр.

### Решение

```yaml
SIE:
  type: collective_network
  confidence: 0.90
  confirmed_public_names: [suckrball, "22 / 22 Pooruhn", sheroy, hunnakay, kllhhr]
  historical_or_affiliated_uncertain: [tazparis, yama_anja]
  name_expansion: unknown
  associated_scenes: [ambient_rap, plugg_adjacent]
  reject_as_genre: "SIE ambient"
```

### A/B-тест

Собрать 12 треков без метаданных: 6 SIE и 6 не-SIE, но с теми же продюсерами. Если аннотаторы не выделяют общий звук лучше случайности, а группируют по продюсеру, SIE — коллектив, не жанр. Отдельно сравнить SIE-треки 1act, undrcvr и myrlu/aghast на общую drum/bass grammar.

---

## 2. myrlu / aghast producer lane

### Статус и употребление

Это **реальная повторяемая сопродюсерская связка**. `Lane` — аналитическая метка RAP ATLAS, не найденное самоназвание. В индексируемом корпусе серия видна как минимум с осени 2025 года: osogyn — 17 октября 2025; затем Zel, kllhhr, 3doly, slaq/1200Boom и killjae. Ни один найденный первичный источник не называет эту пару школой, жанром или официальным дуо.

### Credits и оригинальные загрузки

1. [myrlu feat. killjae — “cryin ona floor” (Shazam)](https://www.shazam.com/song/1885320735/cryin-ona-floor-feat-killjae) — myrlu и aghast указаны продюсерами; BPM 77.
2. [osogyn — “where i started (myrlu & aghast)”](https://soundcloud.com/osogyn/where-i-started-myrlu-aghast) — оригинальная загрузка 17 октября 2025 с обоими именами.
3. [Zel — “store run”](https://soundcloud.com/aaghast/zel-store-run) — загрузка на профиле aghast с credit myrlu + aghast.
4. [Zel — “Flrrt / Drink Water” prod. Aghast & Myrlu](https://soundcloud.com/zelsounds/flrrt-drink-water-prod-aghast) — оригинальная загрузка артиста, февраль 2026.
5. [kllhhr — popular tracks](https://soundcloud.com/kllhhr/popular-tracks) — индексируется “blink w soho34 prod aghast myrlu”.
6. [aghast — popular tracks](https://soundcloud.com/aaghast/popular-tracks) — индексируется “xang lade not my fault prod aghast myrlu”.
7. [Zel — popular tracks](https://m.soundcloud.com/zelsounds/popular-tracks) — индексируется `zel xang - bang story (myrlu aghast)`.
8. [Pitchfork — ambient rap guide](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/) — выделяет 3doly “Kayak” и slaq feat. 1200Boom “Xans Work”, оба prod. myrlu & aghast.
9. [Pitchfork — Best Rap Songs of 2025](https://pitchfork.com/features/lists-and-guides/best-rap-songs-2025/) — указывает Zel “store run” prod. aghast & myrlu.

### Звук

**Источник:** у “Kayak” отмечены droning/psychoactive synths и одиночные лёгкие keys; “Xans Work” описан как медленно движущийся, напряжённый ландшафт. Shazam у “cryin ona floor” фиксирует 77 BPM.

**Осторожный вывод RAP ATLAS:** 
- **drums:** редкие, с большим отрицательным пространством;
- **kick:** не всегда главный якорь;
- **808/саб:** давление и опора, а не постоянный агрессивный foreground;
- **мелодия:** drones, мутные синтезаторные массы, одиночные keys;
- **вокал:** индивидуальность рэперов сохраняется; fingerprint прежде всего в beat design;
- **микс:** серый, напряжённый, с приоритетом текстуры.

Это гипотеза о production fingerprint, а не жанровый стандарт.

### Опорные записи

- [Zel — “store run”](https://soundcloud.com/aaghast/zel-store-run)
- 3doly — “Kayak” — [Pitchfork](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/)
- slaq feat. 1200Boom — “Xans Work” — [Pitchfork](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/)
- [myrlu feat. killjae — “cryin ona floor”](https://www.shazam.com/song/1885320735/cryin-ona-floor-feat-killjae)
- [osogyn — “where i started”](https://soundcloud.com/osogyn/where-i-started-myrlu-aghast)
- [kllhhr — “blink” listing](https://soundcloud.com/kllhhr/popular-tracks)

### Классификация и граница

- **Producer lane:** да — повторяемая пара credits и несколько артистов.
- **Школа:** пока нет — не найдено передачи метода группе учеников.
- **Сцена:** нет отдельной публично названной инфраструктуры.
- **Mix traits:** sparse, gray, slow, droning встречаются и вне пары.

Соседи: ambient rap; SIE через kllhhr/suckrball; Xang/DPM через пересекающийся круг артистов; ранний LUCKI как критическое сравнение настроения; StepTeam по producer-forward логике, но не по одинаковым drums.

### Решение

```yaml
myrlu_x_aghast:
  type: recurring_producer_partnership
  self_named_school: false
  start_evidence: "at least 2025-10"
  core_traits_hypothesis: [droning_synths, sparse_keys, slow_perceived_motion, negative_space]
  confidence: 0.88
  parent_context: ambient_rap
```

### A/B-тест

Взять по четыре трека: (A) myrlu+aghast, (B) myrlu без aghast, (C) aghast без myrlu, (D) другие продюсеры ambient-rap круга. Уравнять громкость, скрыть credits и оценить drum density, kick/808 placement, harmonic motion, texture, vocal space. Линия подтверждается, если совместные работы кластеризуются лучше сольных каталогов.

---
## 3. Ambient wave / Plaguecivitas

### Статус и употребление

Здесь нужно разделить имя организации и внешнее описание:

- **Plaguecivitas:** реальный label/imprint и связанная сеть продюсеров/артистов.
- **Ambient wave:** неустойчивый фанатский umbrella, включающий в одном употреблении Plaguecivitas, SIE, StepTeam и просто “ambient beats”.
- **Ambient-wave plugg:** отдельное, ещё менее подтверждённое склеивание; существование Plaguecivitas его не доказывает.

Дистрибьюторский каталог Plaguecivitas содержит релизы как минимум с **12 февраля 2024**. Точная фраза `ambient wave` в найденном корпусе появляется в 2026 году в пользовательском комментарии Reddit и не является заявлением участника.

### Первичные подтверждения

1. [Plaguecivitas — Qobuz label discography](https://www.qobuz.com/dk-en/label/plaguecivitas/download-streaming-albums/6717924) — отдельная label-page, 23 релиза; среди артистов отображаются cwta, Plaguecivitas и CIRE. Релизы датируются с февраля 2024.
2. [cwta — “passion”](https://www.qobuz.com/dk-en/album/passion-cwta/n2octxtzr12fa) — альбом выпущен Plaguecivitas 18 августа 2025. Track credits связывают cwta с lagsight, Zaphkiel, sexadlibs, CIRÉ, chinapoet, Dripinoy, sennai и другими.
3. [cwta — “westside” (Shazam)](https://www.shazam.com/song/6762742708/westside) — label Plaguecivitas; продюсеры undrcvr и Metal.
4. [cwta — “bigassblacktruck boot” (Shazam)](https://www.shazam.com/song/1868371309/bigassblacktruck-boot) — label Plaguecivitas; production credit cwta.
5. [cwta — “peepin the plot” (Shazam)](https://www.shazam.com/song/6762742711/peepin-the-plot) — label Plaguecivitas; prod. uxie.
6. [cwta feat. fakekickin — “cut em” (Shazam)](https://www.shazam.com/song/1854629539/cut-em-feat-fakekickin) — 12 февраля 2024; label Plaguecivitas; prod. cwta и ivvys.
7. [CIRE — SoundCloud popular tracks](https://soundcloud.com/unocire/popular-tracks) — профиль с явной ссылкой `@plague_civitas`; индексируются работы с kita, undrcvr, cwta и chinapoet.
8. [cwta — SoundCloud](https://soundcloud.com/cw4) и [undrcvr — SoundCloud](https://soundcloud.com/undrcvrxx) — первичные профили ядра сети.
9. [Plaguecivitas — YouTube Topic channel](https://www.youtube.com/channel/UC7H7qqtE-yUsBkYK7MAGSng) — дистрибьюторский канал релизов.
10. [Reddit discussion of Plaguecivitas](https://www.reddit.com/r/ug_music/comments/1sku4ij/has_anyone_tapped_into_this_new_scene_of_the/) — **низкий вес для roster**. Автор перечисляет undrcvr, cwta, mezi, Dripinoy, CIRE, kita, cm и даёт ссылки на проекты.
11. [Reddit exact use of “ambient wave”](https://www.reddit.com/r/ug_music/comments/1tc28ny/almost_every_subgenrebeat_type_in_the_current/) — фанат смешивает “ambient wave/beats/sstepteam”, Plaguecivitas и SIE-артистов. Это доказательство неустойчивости, не жанра.
12. [Instagram post citing a Rate Your Music entry](https://www.instagram.com/p/DYEyL9XEiCX/) — вторичный пересказ с предполагаемой датой формирования и roster; не официальный документ.

### Кто входит в Plaguecivitas?

**Высокая уверенность как каталог/ядро:** cwta; CIRE; релизы под именем Plaguecivitas.  
**Сильные рабочие связи:** undrcvr, Metal, Dripinoy, sexadlibs, lagsight, benzxno, nightz, WaloHeights, uxie, ivvys.  
**Средняя/низкая уверенность как формальные участники:** mezi, kita, cm и другие имена из фанатских списков.

Credits доказывают участие в релизах, но не всегда членство. В атласе следует различать `member`, `released_on`, `producer_credit`, `frequent_collaborator`.

### Звук

Полной аудиопроверки каталога не было. По редакционному описанию undrcvr и структуре credits:

- **drums:** faded/редкие, иногда с машинными цифровыми деталями; встречаются и более традиционные plugg/trap patterns;
- **kick/808:** каталог неоднороден; нет одной обязательной басовой формулы;
- **мелодия:** подавленные plugg-keys, drones, тёмные или “suffocated” synth textures;
- **вокал:** от рэпа до более мелодических партий CIRE;
- **микс:** часто тусклый/непрямой, но не универсальный label-standard.

**Вывод:** Plaguecivitas — сценообразующая инфраструктура, а не автоматически жанр.

### Опорные записи/релизы

- [cwta — “cut em” feat. fakekickin](https://www.shazam.com/song/1854629539/cut-em-feat-fakekickin)
- [cwta — “passion”](https://www.qobuz.com/dk-en/album/passion-cwta/n2octxtzr12fa)
- [cwta — “westside” prod. undrcvr & Metal](https://www.shazam.com/song/6762742708/westside)
- CIRE — “gone” — [label discography](https://www.qobuz.com/dk-en/label/plaguecivitas/download-streaming-albums/6717924)
- Plaguecivitas feat. 22 Pooruhn — “not my kind” — [label discography](https://www.qobuz.com/dk-en/label/plaguecivitas/download-streaming-albums/6717924)
- cwta feat. kllhhr — “know my fate” — [label discography](https://www.qobuz.com/dk-en/label/plaguecivitas/download-streaming-albums/6717924)

### Сцена, producer lane, mix

- **Plaguecivitas:** label + network, возможно коллектив.
- **undrcvr/cwta:** продюсерское ядро и повторяемые collaborators.
- **Ambient wave:** фанатская попытка объединить несколько сетей.
- **Ambient:** параметр гармонии/текстуры и внешний umbrella.
- **Wave:** обычное слово “новая волна”, не музыкальная грамматика.

### Связи и границы

- С SIE: через kllhhr, 22, hunnakay, Tazparis и credits undrcvr/cwta.
- С StepTeam: ivvys имеет credit на раннем релизе; fan discourse иногда смешивает сети.
- С ambient rap: часть каталога подходит под тихий producer-forward umbrella.
- С DPM: соседство по ambient/plugg гибридизации, но нет доказательства организационной линии.
- С ранним LUCKI: фанаты сравнивают отдельные работы Dripinoy с 2016-era LUCKI; это сравнение, не генеалогический факт.

Релиз на Plaguecivitas может быть не ambient; ambient-rap трек может не иметь отношения к Plaguecivitas.

### Решение

```yaml
Plaguecivitas:
  type: label_and_network
  earliest_catalog_evidence: 2024-02-12
  confirmed_catalog_core: [cwta, CIRE, plaguecivitas]
  frequent_collaborators: [undrcvr, Metal, Dripinoy, sexadlibs, lagsight, benzxno, nightz, WaloHeights, uxie, ivvys]
  full_roster_status: unresolved
  confidence: 0.92

Ambient_wave:
  type: external_fan_umbrella
  first_clear_indexed_use_found: 2026
  self_use_found: false
  do_not_merge_with: ambient_wave_plugg
  confidence: 0.22
```

### A/B-тест

1. Сравнить 10 релизов Plaguecivitas и 10 работ тех же продюсеров вне label. Если label membership предсказывает звук хуже имени продюсера, это network/imprint, не жанр.
2. Дать трём аннотаторам 20 треков SIE, Plaguecivitas, StepTeam и других ambient-rap артистов и попросить независимо применить термин `Ambient wave`. Низкое согласие означает, что umbrella не операционализируем.

---

## 4. Philly void rap

### Статус и происхождение ошибки

Термин **не найден как самоназвание артистов, продюсеров, коллектива или устойчивой сцены**. Вероятный источник ошибки — буквальное превращение журналистской метафоры Pitchfork в жанровое имя.

Точная конструкция `Philly void rap` не дала значимых сценовых результатов. 26 июня 2026 Pitchfork написал о “muffled transmissions from the void” Tovi и HappyDranker. В марте 2026 тот же автор называл их записи `drowned-out`, но сохранял рамку **Philly drill**. `Void` здесь описывает пространство/непроявленность микса.

### Доказательная база

1. [Pitchfork — “An Introduction to the Ambient Rap Scene”](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/) — первоисточник метафоры; статья не вводит `Philly void rap` как термин.
2. [Pitchfork — Reemo, “Kyriemo Irving”](https://pitchfork.com/reviews/albums/reemo-kyriemo-irving/) — Tovi и HappyDranker названы артистами с drowned-out треками внутри Philly drill scene.
3. [Tovi — SoundCloud](https://soundcloud.com/tovi) — первичный профиль; маркировки `void rap` не найдено.
4. [Tovi — “she < lean”](https://soundcloud.com/tovi/she-lean) — оригинальная загрузка 2023; не `void rap`.
5. [Tovi — “Jiggy”](https://soundcloud.com/tovi/jiggy) — оригинальная загрузка; Pitchfork рассмотрел трек 2 мая 2025 без такого жанрового имени.
6. [Pitchfork artist page: Tovi](https://pitchfork.com/artists/tovi/) — классификация `Rap`.
7. [HappyDranker — “See No Evil”](https://www.youtube.com/watch?v=Xcq8FjY-SRA) — артистическая видеозагрузка; prod. Devin.
8. [HappyDranker — “Got The Lows (Trap Phone)”](https://www.youtube.com/watch?v=gobkbxrWZPs) — prod. 313Mafia / ilytrapboy; связь с Detroit production crew.
9. [HappyDranker — “Chapter 2”](https://www.youtube.com/watch?v=jqtZiwuDuqg) — запись корпуса.
10. [HappyDranker × Tovi Mix (2025)](https://soundcloud.com/sleepwalkerent/drankervstovi) — сторонний микс называет их Philadelphia street artists; свидетельство воспринимаемой пары, не жанра.
11. [HappyDranker × Tovi — “Ewwww” unreleased upload](https://soundcloud.com/unreleasedph1lly/happydranker-x-tovi-ewwww-unreleased) — неофициальный архив; подтверждает совместный материал, но не терминологию.

### Звук

**Источник:** Pitchfork выделяет pitch-shifting, сжатую/закрытую вокальную подачу HappyDranker, drowsy feel и эффект удалённого источника; в другом тексте говорит о drowned-out tracks.

**Вывод RAP ATLAS:**
- **drums/kick:** наследуют street rap/drill и Detroit-adjacent production; могут быть приглушены low-definition миксом;
- **808/саб:** сохраняют жанровую опору, но воспринимаются размазанно;
- **мелодия:** вторична относительно атмосферы, голоса и пространства;
- **вокал:** pitch-shifted, сжатый, закрытый, намеренно трудноразборчивый;
- **микс:** главный отличительный слой — drowned/muffled, будто источник удалён или фильтрован.

Последний пункт объясняет `void` без отдельного жанра.

### Опорные записи

- HappyDranker — “U Ain’t Sneaky” prod. Trapboy3k — [Pitchfork guide](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/)
- [HappyDranker — “Got The Lows (Trap Phone)”](https://www.youtube.com/watch?v=gobkbxrWZPs)
- [HappyDranker — “See No Evil”](https://www.youtube.com/watch?v=Xcq8FjY-SRA)
- [Tovi — “Jiggy”](https://soundcloud.com/tovi/jiggy)
- [Tovi — “she < lean”](https://soundcloud.com/tovi/she-lean)
- [HappyDranker × Tovi — 2025 mix](https://soundcloud.com/sleepwalkerent/drankervstovi)

### Классификация и граница

- **Сцена:** Philadelphia street rap / Philly drill.
- **Локальный артистический кластер:** Tovi + HappyDranker.
- **Producer lane:** частично Detroit–Philly через Trapboy3k/313 Mafia и других, но не единая школа.
- **Void:** метафора микса и дистанции.
- **Muffled rap:** разумнее хранить как mix/aesthetic tag, пока нет независимого самоназвания.

Граница с ambient rap: у Tovi/HappyDranker центр тяжести остаётся street/drill performance и вокальная театральность; у myrlu/aghast/SIE ambient corpus чаще первична абстрактная beat texture.

### Решение

```yaml
Philly_void_rap:
  status: reject
  reason: journalistic_metaphor_not_self_name

Tovi_HappyDranker_lane:
  type: local_artist_cluster
  parent: Philly_street_rap
  adjacent: Philly_drill
  mix_tags: [drowned_out, muffled, pitch_shifted_vocals, low_definition]
  confidence: 0.84
```

### A/B-тест

Сравнить исходные треки с исследовательскими версиями, где аккуратно компенсированы tonal balance и vocal presence. Если после изменения микса “void” исчезает, а ритмическая и вокальная грамматика остаётся Philly street/drill, это параметр микса. Дополнительно сравнить Tovi/HappyDranker с более чисто сведённым Philly drill при сходном tempo и drum family.

---
## 5. Choir drill / Minimal drill

### Статус и употребление

`Choir drill` имеет **повторяемое внешнее употребление** и указывает на слышимый мотив: зловещие/религиозные хоровые или призрачные vocal samples поверх Philly drill. Но не найдено доказательств, что OT7 Quanny, Lil Buckss, Hood Tali P, Skrilla или ключевые продюсеры называют себя жанром `choir drill`.

`Minimal drill` не имеет сопоставимой сцены. В результатах это обычное описание sparse arrangement, SEO/type-beat формулировка или личное “я придумал этот subgenre”.

- В 2025–2026 `choir-drill` несколько раз употребляет критик Alphonse Pierre в Pitchfork.
- Producer-loop рынок использует сочетания `dark choir`, `Skrilla`, `OT7 Quanny`, что подтверждает распознаваемый запрос, но не самоназвание.
- Сочетание `choir drill` существовало раньше текущей Philly-линии: loop “POP SMOKE x ARRDEE type melody choir drill” датирован июлем 2021. Следовательно, само слово не доказывает отдельный Philly-жанр.

### Основные источники

1. [Pitchfork — Reemo, “Kyriemo Irving”](https://pitchfork.com/reviews/albums/reemo-kyriemo-irving/) — пишет, что Skrilla объединил `choir-drill` beats, популяризированные OT7 Quanny и Lil Buckss, с тёмной духовной театральностью. Это критическая генеалогия.
2. [Pitchfork — “Let’s Talk About 6 7”](https://pitchfork.com/thepitch/lets-talk-about-skrilla-doot-doot-6-7/) — утверждает, что *Underworld* преобразовал sinister choir-drill OT7 Quanny/Hood Tali P в theatrical horrorcore; перечисляет prayer и ghostly vocal samples.
3. [Pitchfork — ambient rap guide](https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/) — формулировка `minimalist choir-drill of OT7Quanny and Skrilla`. `Minimalist` здесь прилагательное к аранжировке.
4. [No Bells — MVMBO profile](https://nobells.blog/mvmbo-producer-philly-drill-skrilla-67/) — профиль продюсера, связанного с актуальным Philly drill; редакционное описание соединяет gothic choirs/ghostly opera samples с pounding 808s.
5. [Skrilla interview — Our Generation Music](https://ourgenerationmusic.com/featured/skrilla-interview-philly-underworld-lil-uzi-vert-pray-for-me/) и [видео](https://www.youtube.com/watch?v=xMDo42pfLTQ) — первичный разговор об артисте/Underworld; найденные выдержки не подтверждают самоназвание `choir drill`.
6. [OT7 Quanny — “New Money” official video](https://www.youtube.com/watch?v=gGdhuYSoMjc) — prod. PYRO-Z5; опорная запись Philly-линии.
7. [Pitchfork artist page: OT7 Quanny](https://pitchfork.com/artists/ot7quanny/) — последовательное описание артиста как Philly rapper/rap, не отдельного choir-drill артиста.
8. [Skrilla — “Vampire”](https://www.youtube.com/watch?v=hM5_sZFIx8I), [“Geeked Up”](https://www.youtube.com/watch?v=6oj_3s4fBAc), [“Blahdahdahdahdah”](https://www.youtube.com/watch?v=w9GmZFjsicA) — записи, на которые ссылается Pitchfork при разборе vocal/theatrical style.
9. [Looperman — “POP SMOKE x ARRDEE type melody choir drill”](https://www.looperman.com/loops/detail/276298/big-scarr-type-dark-choir-free-142bpm-rap-choir-loop) — датировано 5 июля 2021; generic producer descriptor до текущего Philly-контекста.
10. [Looperman tag results / user-created “Minimal Drill”](https://www.looperman.com/loops/tags/free-drill-beat-loops-samples-sounds-wavs-download) — один пользователь прямо сообщает, что придумал этот subgenre. Это пример слабости термина.
11. [Dark choir Skrilla / OT7 Quanny loop](https://www.looperman.com/loops/detail/373930/dark-choir-skrilla-ot7-quanny-free-156bpm-trap-choir-loop) — producer-market shorthand; низкий вес для онтологии.
12. [YouTube loop kit: Skrilla / OT7 Quanny choir style](https://www.youtube.com/watch?v=WkTDe3fTAXc) — SEO/producer evidence, не scene self-use.

### Звук

Наиболее подтверждённая грамматика:

- **drums:** sparse/stark Philly drill patterns;
- **kick/808:** pounding, foregrounded 808s — заметная граница с совсем “barely-there” ambient rap;
- **мелодия:** gothic choir, opera/ghostly vocals, молитвенные или религиозно окрашенные samples;
- **вокал:** у Skrilla — изменчивая, скользящая, театральная подача; у OT7 Quanny — более сухая punchline-oriented delivery;
- **микс:** тёмный и просторный, но не обязательно muffled; choir занимает символический и спектральный foreground.

`Minimal` описывает количество элементов и отрицательное пространство. Если убрать choir, останется Philly drill; если сделать аранжировку плотнее, региональная принадлежность обычно сохранится.

### Опорные записи/проекты

- [OT7 Quanny feat. G.T. — “New Money”](https://www.youtube.com/watch?v=gGdhuYSoMjc)
- Skrilla — *Underworld* — контекст: [Pitchfork](https://pitchfork.com/thepitch/lets-talk-about-skrilla-doot-doot-6-7/)
- [Skrilla — “Vampire”](https://www.youtube.com/watch?v=hM5_sZFIx8I)
- [Skrilla — “Geeked Up”](https://www.youtube.com/watch?v=6oj_3s4fBAc)
- OT7 Quanny / Hood Tali P corpus — [Pitchfork analysis](https://pitchfork.com/thepitch/lets-talk-about-skrilla-doot-doot-6-7/)
- Reemo — *Kyriemo Irving* как контрольный Philly drill корпус с иной пропорцией мотивов: [Pitchfork](https://pitchfork.com/reviews/albums/reemo-kyriemo-irving/)

### Классификация, соседи, граница

- **Philly drill:** реальная региональная сцена.
- **Choir sample lane:** повторяемый production motif.
- **MVMBO и связанные продюсеры:** producer network, заслуживающий карты credits.
- **Minimal:** параметр плотности.
- **Choir drill:** внешний shorthand, пригодный как alias, но не равноправный жанр.
- **Minimal drill:** удалить как автономную ветку.

Связи: с ambient rap — отрицательное пространство и тёмная текстура, но choir-line чаще сохраняет тяжёлую 808-опору; с Tovi/HappyDranker — одна Philly-среда, но у последних важнее drowned/muffled vocal mix; с DPM/StepTeam — producer-forward инновация, но иная percussion grammar; с Nod прямой линии не найдено.

### Решение

```yaml
Choir_drill:
  type: critic_and_producer_shorthand
  parent: Philly_drill
  feature_tags: [choir_samples, ghostly_vocal_samples, sparse_arrangement, heavy_808]
  self_name_confirmed: false
  confidence: 0.67

Minimal_drill:
  type: generic_descriptor
  atlas_node: remove
  replace_with_feature: sparse_arrangement
  confidence_as_genre: 0.08
```

### A/B-тест

- A: исходный beat с choir sample.
- B: тот же rhythm/bass, choir заменён нейтральным pad/piano.
- C: choir сохранён, но drill drums/808 заменены общей trap-перкуссией.
- D: тот же Philly drill beat с более плотной аранжировкой.

Если A и B одинаково распознаются как Philly drill, choir — мотив. Если A и D сохраняют региональную идентичность, `minimal` — параметр. Отдельный микрожанр оправдан только при устойчивом кросс-артистическом кластере и внутреннем имени.

# КАРТА СЦЕНЫ

## Базовая структура

```text
[Ambient rap]
  ├─ широкий producer-forward umbrella, публично оформленный критикой в 2026
  ├─ часть SIE-репертуара
  ├─ myrlu × aghast productions
  ├─ отдельные Plaguecivitas / undrcvr productions
  └─ пересечение с DPM/Xang, но не тождество DPM

[Philly drill / Philly street rap]
  ├─ OT7 Quanny / Lil Buckss / Hood Tali P → choir-sample motif
  ├─ Skrilla → theatrical extension
  ├─ MVMBO и связанные продюсеры → gothic choir + pounding 808 grammar
  └─ Tovi / HappyDranker → drowned/muffled vocal-mix lane

[Collectives / networks]
  ├─ SIE — artist collective/network
  ├─ Plaguecivitas — label + producer/artist network
  ├─ DPM — loose collective, Deep and Powerful Music
  └─ #stepTeam — producer trio/network
```

## Узлы и связи

### SIE

**Публичное ядро по Pitchfork:** suckrball, 22/22 Pooruhn, sheroy, hunnakay, kllhhr.  
**Исторически важный, но статус требует первичного подтверждения:** Tazparis.  
**Возможный аффилиат только по вторичному свидетельству:** yama anja.

- suckrball ↔ 1act, aghast.
- hunnakay ↔ undrcvr.
- kllhhr ↔ disorderly, num, myrlu, aghast, cwta, undrcvr.
- 22 ↔ 1act, aghast, undrcvr, study; релизные пересечения Plaguecivitas.
- Tazparis ↔ undrcvr, cwta; в фанатском дискурсе рассматривается как ранний центр SIE.

### myrlu × aghast

**Тип:** recurring co-production partnership.

- Zel — “store run”, “Flrrt / Drink Water”, работы с Xang.
- 3doly — “Kayak”.
- slaq + 1200Boom — “Xans Work”.
- killjae — “cryin ona floor”.
- kllhhr + soho34 — “blink”.
- osogyn — “where i started” и другие co-credits.
- Xang — мост к DPM.

**Не доказано:** формальный дуэт, школа, ученики или отдельный коллектив.

### Plaguecivitas

- **cwta:** центральный артист/продюсер; большая часть каталога.
- **CIRE:** артист с релизом на label и явной ссылкой на Plaguecivitas.
- **undrcvr:** повторяемый продюсер, связывающий Plaguecivitas с hunnakay, kllhhr, Tazparis и 22.
- **Metal, uxie, ivvys, lagsight, sexadlibs, Dripinoy, benzxno, nightz, WaloHeights:** подтверждённые credits/релизные связи разной силы.
- **mezi, kita, cm:** фанатски называются частью сети; официальный membership не найден.

```text
Plaguecivitas --undrcvr/cwta credits--> SIE artists
Plaguecivitas --ivvys credit--> #stepTeam orbit
Plaguecivitas --quiet/dark productions--> ambient rap umbrella
Plaguecivitas != Ambient wave
```

### DPM и StepTeam

[FADER interview with Xang/theo](https://www.thefader.com/2025/03/11/xang-dpm-womb-interview-ambient-trap-mixtape) подтверждает:

- DPM расшифровывается как **Deep and Powerful Music**;
- это loose collective, одним из основателей назван theo;
- Xang связан с DPM;
- названы различающиеся tendencies fk и westly;
- theo говорит, что соединял ambient 1990-х/2000-х с plugg;
- автор сообщает, что DPM повлиял на ivvys и #stepTeam.

[FADER on #stepTeam](https://www.thefader.com/2025/01/09/rap-blog-ivvys-and-stepteam-have-better-drums-than-your-fave) определяет #stepTeam как trio: **ivvys, Maajins, sxprano**, с glitchy/stuttering rhythms и переработанными samples.

```text
DPM --reported influence--> #stepTeam
DPM --ambient + plugg hybridization--> ambient trap lineage
#stepTeam --wonky percussion cited by critics--> 2026 ambient rap umbrella

Нет основания:
DPM = Plaguecivitas
DPM = SIE
DPM = Philly choir drill
```

### Philly

- **OT7 Quanny / Lil Buckss / Hood Tali P:** предшествующая Philly drill линия с choir/vocal-sample motifs по версии Pitchfork.
- **Skrilla:** расширяет формулу через prayer/religious vocal material, ghostly samples и театральный vocal/persona слой; остаётся Philly drill.
- **MVMBO:** producer node; No Bells связывает его с gothic choirs/ghostly opera samples и pounding 808s.
- **Tovi / HappyDranker:** drowned/muffled presentation, pitch-shifted/закрытый vocal character, Philly street/drill context; HappyDranker связан с Trapboy3k / 313 Mafia, то есть с Detroit production network.

### Nod

В найденном публичном корпусе `Nod` надёжнее всего относится к **Shed Theory / nod music**, другой интернет-rap линии. Прямых первичных связей Nod с SIE, Plaguecivitas, myrlu/aghast или Philly choir line не найдено.

Для атласа:
- не использовать `Nod` как общий синоним тихого ambient rap;
- создавать связь только при конкретном collaboration/credit/interview;
- сходство “сонный/заторможенный” считать mood-level, не генеалогией.

# ЧТО МОЖЕТ БЫТЬ НЕВЕРНО

1. **Полный roster SIE.** Pitchfork даёт пять имён, но список может быть неполным. Tazparis выглядит исторически центральным, однако первичного roster statement не найдено.
2. **Расшифровка SIE.** Версии `she` и `stain in everything` опираются на комментарии. Ни одна не должна попадать в основную карточку без сохранённого заявления участника.
3. **Дата возникновения SIE.** Самое раннее индексируемое подтверждение — не дата основания; удалённые публикации могут сдвинуть хронологию.
4. **“Школа” myrlu/aghast.** Повторяемость credits сильная, но без полной дискографии и аудиокластеризации нельзя окончательно отделить совместный fingerprint от сольных production styles.
5. **Plaguecivitas как коллектив.** Дистрибьюторский label доказан лучше формальной организации. Некоторые credits отражают гостей/клиентов, а не участников.
6. **Дата формирования Plaguecivitas 22 мая 2024.** Она обнаружена во вторичном Instagram/RYM-пересказе, тогда как Qobuz показывает label-релиз от 12 февраля 2024. Возможно, даты относятся к разным сущностям; возможно, вторичная запись ошибочна.
7. **Qobuz metadata.** Credits подтверждают релизные отношения, но могут содержать дубликаты стилизации имён и не различают member/guest.
8. **Ambient wave.** Термин может быть шире в закрытых чатах, чем показывает индекс. Пока нет первичного подтверждения, статус остаётся низким.
9. **Philly void rap.** Нельзя доказать абсолютное отсутствие фразы. Сильный вывод: публичная база не позволяет считать её сценовым именем, а известный источник — метафорический.
10. **Choir drill.** Повторяемость критического употребления заметна; слово может закрепиться позже. На дату среза это critic/producer shorthand.
11. **Minimal drill.** Возможно локальное употребление вне индекса, но найденный корпус не содержит сцены, roster или самостоятельной грамматики.
12. **Звуковые выводы.** Они основаны на опубликованных описаниях и метаданных, не на полном слепом прослушивании lossless-каталогов.
13. **Nod.** Поиск обнаруживает Shed Theory-related meaning, но в RAP ATLAS мог иметься в виду иной локальный узел; без конкретной ссылки переносить его в эту карту нельзя.

# ИТОГОВАЯ ОНТОЛОГИЯ

```yaml
keep:
  - name: SIE
    type: collective_network
  - name: myrlu_x_aghast
    type: recurring_producer_partnership
  - name: Plaguecivitas
    type: label_and_network
  - name: Philly_drill
    type: regional_scene
  - name: Choir_drill
    type: external_alias_or_motif
    parent: Philly_drill

convert_to_features:
  - ambient_texture
  - sparse_arrangement
  - choir_samples
  - ghostly_vocal_samples
  - drowned_out_mix
  - muffled_vocals
  - pitch_shifted_vocals
  - barely_there_snare

remove_or_quarantine:
  - SIE_ambient
  - Ambient_wave_as_genre
  - Ambient_wave_plugg
  - Philly_void_rap
  - Minimal_drill

links_not_equivalences:
  - SIE -> ambient_rap
  - Plaguecivitas -> ambient_rap
  - myrlu_x_aghast -> ambient_rap
  - DPM -> influence_on_stepTeam
  - stepTeam -> influence_in_ambient_rap_discourse
  - OT7_Quanny_and_related -> choir_sample_motif
  - Skrilla -> theatrical_extension_of_Philly_drill
  - Tovi_HappyDranker -> muffled_mix_lane_within_Philly_street_rap
```
