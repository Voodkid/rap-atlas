export type EntityKind =
  | "genre"
  | "microgenre"
  | "scene"
  | "school"
  | "wave"
  | "hybrid"
  | "collective"
  | "partnership"
  | "label"
  | "filter"
  | "technique"
  | "release"
  | "alias"
  | "influence"
  | "umbrella"
  | "misnomer";

export type ResearchConfidence = "high" | "medium" | "low";

export type TermMaturity = "confirmed" | "broad" | "disputed" | "local" | "unconfirmed";

export type ResearchSource = {
  label: string;
  url: string;
};

export type RelationNote = {
  target: string;
  type: "parent" | "influence" | "hybrid" | "scene" | "alias" | "overlap" | "redirect";
  note: string;
};

export type TrackExample = {
  artist: string;
  title: string;
  role: "early" | "core" | "modern" | "borderline" | "misattributed";
  listenFor: string;
  url?: string;
};

export type ResearchOverride = {
  name?: string;
  family?:
    | "cloud"
    | "plugg"
    | "ambient"
    | "rhythm"
    | "jerk"
    | "digital"
    | "hex"
    | "rage"
    | "regional"
    | "phonk"
    | "rock"
    | "global";
  parent?: string | null;
  status?: "established" | "emerging" | "scene" | "tag" | "adjacent" | "misnomer" | "umbrella";
  summary?: string;
  signature?: string;
  aliases?: string[];
  artists?: string[];
  producers?: string[];
  related?: string[];
  tags?: string[];
  entityKind: EntityKind;
  confidence: ResearchConfidence;
  maturity?: TermMaturity;
  verdict: string;
  history: string;
  listenFor: string[];
  production: string[];
  confusions: string[];
  sources: ResearchSource[];
  relationNotes?: RelationNote[];
  examples?: TrackExample[];
  canonicalId?: string;
  needsListeningCheck?: boolean;
  reviewedAt?: string;
  researchBatch?: string;
};

export type ReviewedSound = {
  bass: string;
  drums: string;
  mood: string;
  tempo: string;
  era?: string;
};

const src = (label: string, url: string): ResearchSource => ({ label, url });

const pitchforkMexiko = src("Pitchfork — интервью с MexikoDro", "https://pitchfork.com/thepitch/an-interview-with-mexikodro/");
const soundcloudPlugg = src("SoundCloud — Scenes: Plugg", "https://soundcloud.com/stories/post/dive-into-atlantas-underground-hip-hop-community-in-scenes-plugg");
const splicePluggnb = src("Splice — что такое PluggnB", "https://splice.com/blog/what-is-pluggnb/");
const ambientScene = src("Pitchfork — новая ambient rap-сцена", "https://pitchfork.com/thepitch/an-introduction-to-the-ambient-rap-scene/");
const faderDarkPlugg = src("The FADER — Goxan и alarm 808", "https://www.thefader.com/2025/02/13/goxan-lazer-dim-700-dark-plugg-producuer-interview/");
const faderTdf = src("The FADER — интервью с tdf", "https://www.thefader.com/2024/04/05/tdf-producer-interview/");
const faderDpm = src("The FADER — Xang, DPM и ambient trap", "https://www.thefader.com/2025/03/11/xang-dpm-womb-interview-ambient-trap-mixtape/");

export const manualResearchOverrides: Record<string, ResearchOverride> = {
  plugg: {
    entityKind: "genre",
    confidence: "high",
    verdict: "Устоявшийся поджанр trap. От него выросли PluggnB, ambient plugg и dark plugg.",
    history: "Plugg появился в Атланте в середине 2010-х вокруг Beat Pluggz. Его ранний звук создали MexikoDro, StoopidXool, PoloBoyShawty и A$att. Позже появились мелодичная, тихая и тёмная ветки.",
    listenFor: ["яркий pluck или колокольчик", "пустая, но пружинящая драмка", "мягкий 808 без постоянного клиппинга"],
    production: ["Оставляй заметные паузы между клэпом, хэтами и 808.", "Лучше один узнаваемый звук мелодии, чем много слоёв сразу.", "Саб должен поддерживать ритм и вокал, а не играть главную мелодию."],
    confusions: ["PluggnB — мелодичная R&B-ветка, а не синоним всего Plugg.", "Современный type beat может называться plugg, даже если от исходной драмки остался только пресет."],
    sources: [pitchforkMexiko, soundcloudPlugg],
    relationNotes: [
      { target: "og-plugg", type: "parent", note: "Ранний Plugg, на котором основаны более поздние ветки." },
      { target: "pluggnb", type: "parent", note: "Мелодичная R&B-ветка." },
      { target: "dark-plugg", type: "parent", note: "Тёмная линия с более агрессивным низом." },
    ],
  },
  "og-plugg": {
    entityKind: "school",
    confidence: "high",
    verdict: "Историческая школа раннего Plugg, а не второй жанр рядом с ним.",
    history: "Это звук Beat Pluggz середины 2010-х до того, как названия PluggnB, ambient plugg и dark plugg начали жить отдельно.",
    listenFor: ["сухой клэп", "органный или стеклянный плак", "спокойный саб, который иногда плавно переходит между нотами"],
    production: ["Не ставь хэты слишком часто.", "Короткая мелодия по кругу важнее большого количества переходов и слоёв.", "Убери лишние средние частоты из баса, чтобы вокал оставался понятным."],
    confusions: ["Classic plugg и OG plugg описывают период и школу, а не жёстко отделённый жанр."],
    sources: [pitchforkMexiko, soundcloudPlugg],
    relationNotes: [{ target: "plugg", type: "parent", note: "Историческое ядро Plugg." }],
  },
  "dreamy-plugg": {
    status: "tag",
    entityKind: "filter",
    confidence: "medium",
    verdict: "Мягкая сторона раннего Plugg. Полезный фильтр, но не отдельная ветка.",
    history: "Слова dreamy и slimy описывают мягкий звук и настроение. За ними нет отдельного круга артистов или своего обязательного рисунка ударных.",
    listenFor: ["светлые колокольчики", "тёплые длинные пэды", "те же большие паузы и спокойный кач Plugg"],
    production: ["Сохраняй OG-драмку и меняй прежде всего тембр мелодии.", "Убирай резкую атаку у 808 и верх у пэдов."],
    confusions: ["Dream plugg и slimy plugg не доказаны как два самостоятельных жанра.", "Ambient plugg обычно тише и просторнее."],
    sources: [pitchforkMexiko],
    canonicalId: "og-plugg",
    relationNotes: [{ target: "og-plugg", type: "redirect", note: "Ищи внутри мягкой стороны раннего Plugg." }],
  },
  "new-plugg": {
    status: "scene",
    entityKind: "wave",
    confidence: "medium",
    verdict: "Волна возвращения к Plugg примерно 2020–2022 годов, а не новый жанр.",
    history: "Так называют период Ka$hdami, 1600J, RewindRaps и новый всплеск type beats примерно в 2020–2022 годах. Это новая волна артистов, но не отдельный жанр с едиными правилами.",
    listenFor: ["классические Plugg-плаки", "более яркий и плотный микс", "быстрее собранная драмка"],
    production: ["Сохраняй паузы и кач раннего Plugg, но делай начало кика, клэпа и хэтов заметнее.", "Не называй любой новый Plugg отдельным revival-звуком."],
    confusions: ["Это период и круг артистов, не строгое ответвление."],
    sources: [src("No Bells — год возвращения Plugg", "https://nobells.blog/eoy_2021-the-year-plugg-took-over/")],
    relationNotes: [{ target: "plugg", type: "scene", note: "Новая волна внутри большой Plugg-линии." }],
  },
  pluggnb: {
    entityKind: "genre",
    confidence: "high",
    verdict: "Устоявшийся поджанр: свободная Plugg-драмка сочетается с аккордами из R&B и gospel.",
    history: "Вырос из Plugg и закрепился вокруг продюсеров вроде Xangang и исполнителей SlayWorld-среды. Название используют и артисты, и продюсеры, и музыкальные медиа.",
    listenFor: ["расширенные R&B-аккорды", "органные и фортепианные пассажи", "распетый Auto-Tune поверх Plugg-баунса"],
    production: ["Гармония сложнее обычного Plugg, но драмка остаётся свободной.", "Не заполняй каждую долю: аккордам нужен воздух.", "Роллы снейров работают как ответ вокалу."],
    confusions: ["PluggnB — не просто любой мелодичный Plugg.", "New jazz может брать похожие аккорды, но иначе двигает синты и форму."],
    sources: [splicePluggnb, src("Traktrain — Xangang", "https://traktrain.com/blog/xangang-hyperpopdaily/")],
    relationNotes: [{ target: "plugg", type: "parent", note: "Главный родительский язык драмки." }],
  },
  "slayworld-pluggnb": {
    entityKind: "scene",
    confidence: "high",
    verdict: "Круг артистов и важный период в истории PluggnB. Отдельного рисунка ударных у него нет.",
    history: "Карточка описывает круг Summrs, Autumn!, Kankan и связанных продюсеров. SlayWorld важен как социальная среда, через которую PluggnB стал узнаваемым.",
    listenFor: ["длинные эмоциональные прогрессии", "мягкий 808", "вокал, который тянет ноты поверх редкой драмки"],
    production: ["Сначала выстрой аккорды и вокальную мелодию, потом добавляй низ.", "Не своди сцену к одному пресету органа."],
    confusions: ["SlayWorld — круг людей и эпоха; не всё, что они выпускали, является PluggnB."],
    sources: [src("Complex — новая рэп-подпольная волна", "https://stories.complex.com/rap-new-underground/24/"), src("XXL — интервью с Autumn!", "https://www.xxlmag.com/autumn-interview-the-break/")],
    relationNotes: [{ target: "pluggnb", type: "scene", note: "Одна из ключевых сцен раннего PluggnB." }],
  },
  "rnb-pluggnb": {
    status: "tag",
    entityKind: "filter",
    confidence: "high",
    verdict: "R&B и gospel влияют на аккорды самого PluggnB. Это не отдельный жанр.",
    history: "Влияние R&B и gospel заложено в основе PluggnB. Карточка полезна как фильтр по гармонии и вокалу.",
    listenFor: ["maj7, min7 и add9", "церковный орган", "мелизмы и распевная подача"],
    production: ["Используй аккорды с дополнительными нотами и плавно веди каждый голос от аккорда к аккорду.", "Gospel-орган — один из возможных звуков, а не обязательный признак каждого трека."],
    confusions: ["Нет отдельной подтверждённой сцены R&B pluggnb."],
    sources: [splicePluggnb],
    canonicalId: "pluggnb",
  },
  "emo-pluggnb": {
    entityKind: "filter",
    confidence: "medium",
    verdict: "Настроение и поисковый тег внутри PluggnB.",
    history: "Тег встречается в загрузках и плейлистах, но не задаёт отдельную ритмику или круг продюсеров.",
    listenFor: ["минорная прогрессия", "исповедальный текст", "дрожащий или тонкий Auto-Tune"],
    production: ["Меняй гармонию, тембр и подачу, но не придумывай несуществующую отдельную драмку."],
    confusions: ["Emo rap шире и исторически не сводится к PluggnB."],
    sources: [src("SoundCloud — тег emo pluggnb", "https://soundcloud.com/tags/emo%20pluggnb")],
    canonicalId: "pluggnb",
  },
  "dark-pluggnb": {
    entityKind: "filter",
    confidence: "medium",
    verdict: "Плавающий тёмный оттенок PluggnB, не единая школа.",
    history: "Название работает в тегах и type beat-заголовках. Повторяется настроение, но не отдельный набор обязательных ритмических приёмов.",
    listenFor: ["PluggnB-аккорды с напряжённым сочетанием нот", "холодные длинные пэды", "более грубый 808"],
    production: ["Даже при тёмных и искажённых звуках аккорды PluggnB должны оставаться понятными."],
    confusions: ["Dark plugg вырос из другой продюсерской линии и обычно не строится на R&B-аккордах."],
    sources: [src("SoundCloud — тег dark pluggnb", "https://soundcloud.com/tags/dark%20pluggnb")],
    canonicalId: "pluggnb",
  },
  "jersey-pluggnb": {
    status: "adjacent",
    entityKind: "hybrid",
    confidence: "high",
    verdict: "Реальный гибрид Jersey club и PluggnB; его лучше показывать связью, а не ребёнком одного жанра.",
    history: "Гибрид закрепился в музыке, где PluggnB-гармония и вокал работают поверх узнаваемой Jersey club-ритмики.",
    listenFor: ["сэмпл скрипа кровати и частый рисунок бочки Jersey", "PluggnB-аккорды", "нарезанный вокал"],
    production: ["Сохраняй Jersey-грув внизу, а PluggnB — в гармонии и вокале.", "Не называй Jersey pluggnb любой трек с одним squeak-сэмплом."],
    confusions: ["Jersey club rap может обходиться без PluggnB-гармонии."],
    sources: [src("Pitchfork — skaiwater: gigi", "https://pitchfork.com/reviews/albums/skaiwater-gigi/"), src("Atlantic Records — Bossa bio", "https://press.atlanticrecords.com/sites/g/files/g2000014001/files/2024-04/Bossa%20Bio.pdf")],
    relationNotes: [
      { target: "pluggnb", type: "hybrid", note: "Гармония и вокальная часть." },
      { target: "jersey-club-rap", type: "hybrid", note: "Ритмическая основа." },
    ],
  },
  "new-jazz-pluggnb": {
    name: "New jazz",
    parent: null,
    status: "established",
    entityKind: "microgenre",
    confidence: "high",
    verdict: "Самостоятельный микрожанр, связанный и с PluggnB, и с Rage. Это не подвид PluggnB.",
    history: "Название закрепилось вокруг Lunchbox и продюсерской линии, где джазовые гармонии сочетаются с текучими синтами и постоянно меняющейся формой.",
    listenFor: ["быстрые джазовые аккорды", "главный синтезатор постоянно меняет высоту и тембр", "бит заметно меняется каждые несколько тактов"],
    production: ["Автоматизируй тембры и вариации мелодии.", "Не своди New jazz к одному PluggnB-пресету или просто джазовому сэмплу."],
    confusions: ["New jazz не является обычным jazz rap.", "Не каждый синтовый PluggnB-бит относится к New jazz."],
    sources: [src("Pitchfork — Lunchbox: New Jazz", "https://pitchfork.com/reviews/albums/lunchbox-new-jazz/")],
    relationNotes: [
      { target: "pluggnb", type: "influence", note: "Похожие сложные аккорды." },
      { target: "rage", type: "influence", note: "Синтовая энергия и форма." },
    ],
  },
  "diary-plugg": {
    entityKind: "microgenre",
    confidence: "high",
    verdict: "Молодой микрожанр и сцена Twilight/Kynlary с собственным названием.",
    history: "Название связано с Twilight collective и Kynlary. Оно означает не просто грустное настроение, а небольшой круг артистов с похожей подачей.",
    listenFor: ["печальное фортепиано", "близко записанный вокал", "дневниковые тексты поверх PluggnB-драмки"],
    production: ["Оставляй вокал в центре и не перегружай бит лишними слоями.", "Фортепиано и паузы важнее сложных эффектов."],
    confusions: ["Emo pluggnb шире и чаще работает как настроение."],
    sources: [src("All Music Mondays — Twilight interview", "https://www.allmusicmondays.com/interviews/2024-interviews/twilight-interview")],
  },
  "asian-rock": {
    entityKind: "microgenre",
    confidence: "medium",
    verdict: "Авторский микростиль BenjiCold внутри PluggnB-среды; к азиатскому року как большой традиции название не относится.",
    history: "Термин связан с BenjiCold и конкретным кругом битов и артистов. Его границы уже, чем у PluggnB, но широкой независимой сцены пока нет.",
    listenFor: ["органные и струнные plucks", "мелодии с гитарным тембром", "плотная PluggnB-гармония"],
    production: ["Работай с тембром мелодии, не имитируя случайные «азиатские» клише.", "Сохраняй PluggnB-ритмику и аккордовую плотность."],
    confusions: ["Название не означает Japanese rock, visual kei или азиатскую рок-сцену."],
    sources: [src("SoundCloud — BenjiCold: Asian Rock Samples", "https://m.soundcloud.com/benjicold/asian-rock-samples-12-w-xangang-thrillboy-lj-kankan-prod-by-benjicold-1"), src("The FADER — Plaqueboymax", "https://www.thefader.com/2024/12/13/plaqueboymax-best-in-the-booth-song-wars-2024/")],
  },
  "ambient-plugg": {
    entityKind: "microgenre",
    confidence: "high",
    verdict: "Устоявшийся тихий вариант Plugg: мягкий бас, редкие ударные и длинные фоновые звуки.",
    history: "Название используют музыкальные каталоги и слушатели. Оно объединяет несколько близких звуков — от музыки Izaya Tiji до Nod. Поэтому разные треки внутри Ambient plugg могут заметно отличаться.",
    listenFor: ["мягкий саб без резкого начала", "редкая Plugg-драмка", "длинный пэд, шум или одна протяжная нота вместо обычной мелодии"],
    production: ["Сделай начало кика, клэпа и мелодии мягче, чтобы они не щёлкали слишком резко.", "Саб должен заполнять низ, но не перекрывать вокал.", "Реверб, длинные паузы и тихие участки здесь помогают ритму."],
    confusions: ["Ambient rap — более общее и более старое название для тихого атмосферного рэпа.", "Один большой реверб ещё не превращает Plugg в Ambient plugg."],
    sources: [src("MusicBrainz — Ambient Plugg", "https://musicbrainz.org/genre/a3a91d37-5816-4bd5-ab37-ec5a6d455ebd"), src("Album of the Year — Ambient Plugg", "https://www.albumoftheyear.org/genre/1149-ambient-plugg/")],
  },
  "izaya-ambient": {
    entityKind: "school",
    confidence: "high",
    verdict: "Авторская и продюсерская школа внутри Ambient plugg.",
    history: "Карточка описывает конкретную линию Izaya Tiji и связанных продюсеров, а не отдельное общепринятое жанровое название.",
    listenFor: ["мягкие длинные пэды", "вокал звучит близко к слушателю", "редкий клэп и спокойный саб"],
    production: ["Сначала оставь место для голоса, потом добавляй остальные слои.", "Одна длинная нота не должна перекрывать весь трек: здесь ещё слышны куплеты и хуки."],
    confusions: ["В Nod меньше привычной песенной структуры, а ударные часто почти исчезают."],
    sources: [src("AllMusic — Izaya Tiji", "https://www.allmusic.com/artist/izaya-tiji-mn0004189267")],
    relationNotes: [{ target: "ambient-plugg", type: "scene", note: "Авторская школа внутри Ambient plugg." }],
  },
  nod: {
    entityKind: "microgenre",
    confidence: "high",
    verdict: "Узнаваемый звук и круг артистов Shed Theory, близкий к Ambient plugg.",
    history: "Название закреплено релизом Nod Theory и употреблением внутри Shed Theory. Это не просто слово для любой сонной музыки.",
    listenFor: ["одна длинная нота или шумовой слой вместо обычной мелодии", "вокал сильно размыт эффектами или почти проговаривается", "короткий глухой толчок баса без резкого начала"],
    production: ["Ритм могут держать голос, длинный звук и паузы, даже если ударных почти нет.", "Цифровой треск и комнатный шум можно оставить, если они делают звук глубже.", "Не добавляй ударные только потому, что в бите осталось пустое место."],
    confusions: ["Grog — фанатский ярлык и название трека, а не соседний подтверждённый жанр.", "Drone plugg — техника, а не обязательный синоним Nod."],
    sources: [src("SoundCloud — Shed Theory: Nod Theory", "https://soundcloud.com/shedtheory/sets/nod-theory"), src("SoundCloud — Cathedral", "https://soundcloud.com/shedtheory/cathedral-prod-iji")],
  },
  "drone-plugg": {
    status: "misnomer",
    entityKind: "technique",
    confidence: "low",
    verdict: "В некоторых Plugg-битах мелодию заменяет одна длинная нота. Такой приём есть, но отдельный жанр Drone plugg не подтверждён.",
    history: "Тегом Drone plugg иногда описывают Plugg с одной протяжной нотой. Отдельного круга артистов и собственного рисунка ударных у этого названия пока нет.",
    listenFor: ["один протяжный тон", "медленные изменения фильтра", "редкие импульсы саба"],
    production: ["Используй одну длинную ноту вместо обычной мелодии, но отмечай это как приём, а не как отдельный жанр."],
    confusions: ["Drone music — отдельная музыка вне рэпа.", "В Nod часто есть длинные ноты, но только ими этот стиль не определяется."],
    sources: [ambientScene, src("Pitchfork — о проблеме микрожанровых ярлыков", "https://pitchfork.com/thepitch/underground-rap-has-a-cornball-crisis/")],
    canonicalId: "ambient-plugg",
  },
  grog: {
    status: "misnomer",
    entityKind: "alias",
    confidence: "high",
    verdict: "Название трека и фанатский ярлык; запрос лучше вести в Nod/Shed Theory.",
    history: "Grog — название трека Marlon DuBois и Joeyy. Нет данных, что так называют отдельный жанр или самостоятельный круг артистов.",
    listenFor: ["одна длинная мутная нота", "приглушённый голос", "мягкий и размытый звук, близкий к Nod"],
    production: ["Не строй отдельный жанровый рецепт по одному треку."],
    confusions: ["Это не официальное общее название музыки Shed Theory."],
    sources: [src("SoundCloud — Marlon DuBois: Grog", "https://soundcloud.com/marlon-dubois/grog-w-joeyy-prod-gyo-noveks-iokera")],
    canonicalId: "nod",
    relationNotes: [{ target: "nod", type: "redirect", note: "Ближайший подтверждённый стиль и сцена." }],
  },
  "lowercase-rap": {
    status: "misnomer",
    entityKind: "misnomer",
    confidence: "high",
    verdict: "Для рэпа это название не подтверждено. Lowercase уже давно означает отдельное направление электронной музыки.",
    history: "Словом Lowercase давно называют очень тихую электронную музыку. Если перенести его на рэп, получится ложное впечатление, будто у рэпа есть жанр с такой же историей.",
    listenFor: ["В рэпе тихий вокал и небольшой перепад громкости описывают микс, а не новый жанр."],
    production: ["Лучше прямо писать: тихий вокал, приглушённый микс или почти нет ударных."],
    confusions: ["Lowercase electronic music — отдельная историческая традиция."],
    sources: [src("Bandcamp Daily — lowercase", "https://daily.bandcamp.com/lists/lowercase-list"), src("Steve Roden — Forms of Paper", "https://www.inbetweennoise.com/press/2001-steve-roden-forms-of-paper/")],
  },
  "soft-plugg": {
    status: "tag",
    entityKind: "filter",
    confidence: "low",
    verdict: "Dream и soft — редкие теги для поиска мягкого Plugg. Это не два отдельных жанра.",
    history: "Эти слова встречаются в названиях type beats и описывают мягкость или настроение. За ними нет отдельного круга артистов и нового рисунка ударных.",
    listenFor: ["мягкий саб", "тёплые длинные пэды", "обычный Plugg-ритм с большими паузами"],
    production: ["Разделяй две вещи: soft описывает мягкое начало звука, а dreamy — настроение."],
    confusions: ["Ambient plugg обычно заметно просторнее и тише."],
    sources: [src("No Bells — Plugg в 2021", "https://nobells.blog/eoy_2021-the-year-plugg-took-over/"), src("The FADER — Serane и Plugg", "https://www.thefader.com/2024/02/08/serane-paris-rapper-plugg")],
    canonicalId: "plugg",
  },
  "ambient-wave-plugg": {
    status: "misnomer",
    entityKind: "misnomer",
    confidence: "low",
    verdict: "Подтверждений отдельного Ambient-wave plugg не найдено.",
    history: "Название просто соединяет слова Ambient plugg и ambient rap. Мы не нашли достаточно людей, которые постоянно используют его для отдельного звука.",
    listenFor: ["Надёжных отличительных признаков нет."],
    production: ["Выбирай точное основание: Ambient plugg или современная Ambient rap-сцена."],
    confusions: ["Не путать с Ambient plugg и Plaguecivitas."],
    sources: [ambientScene],
    canonicalId: "ambient-plugg",
  },
  "dark-plugg": {
    entityKind: "microgenre",
    confidence: "high",
    verdict: "Устоявшийся тёмный вариант Plugg. В нём есть ранний звук DMV/Surreal Gang и более новый звук с сильно изменяющимся 808.",
    history: "Ранний Dark plugg связан с DMV и Surreal Gang. Позже tdf, Goxan и артисты новой волны сделали 808 громче, агрессивнее и подвижнее.",
    listenFor: ["минорные колокольчики или короткий зловещий луп", "Plugg-паузы", "более тяжёлый 808, чем в классике"],
    production: ["Даже с перегрузом в драмке должны оставаться паузы и Plugg-кач.", "Не смешивай два разных звука: ранний просторный бас и современный 808, который играет главную мелодию.", "Тёмная обложка сама по себе не делает бит Dark plugg."],
    confusions: ["Dark pluggnb сохраняет R&B-гармонию.", "Terror/Extremo — крайняя современная зона внутри или рядом с Dark plugg."],
    sources: [src("Anywhere the Dope Go — Dark Plugg guide", "https://anywherethedopego.com/a-guide-to-dark-plugg/"), faderTdf, faderDarkPlugg],
  },
  "surreal-dark-plugg": {
    entityKind: "school",
    confidence: "high",
    verdict: "Ранний стиль продюсеров DMV внутри Dark plugg.",
    history: "Surreal Gang сделали тёмный Plugg узнаваемым ещё до современной волны с alarm 808. Это важная часть истории Dark plugg, но не отдельный жанр со своим обязательным рисунком ударных.",
    listenFor: ["тёмные колокольчики", "просторный тяжёлый 808", "холодная DMV-подача"],
    production: ["Оставляй больше воздуха, чем в современном terror-звуке.", "Не путай историческую школу с любым мрачным Plugg."],
    confusions: ["Современный Dark plugg чаще сильнее искажает низ."],
    sources: [src("Sleep Walker — Surreal Gang interview", "https://www.sleepwalkerent.com/interviews/interview-01")],
  },
  "evil-plugg": {
    status: "tag",
    entityKind: "alias",
    confidence: "high",
    verdict: "Другое название Dark plugg и тег для поиска. Отдельным жанром оно не стало.",
    history: "Слово Evil встречалось рядом с ранним Dark plugg. Позже им начали помечать музыку с демоническими и оккультными образами.",
    listenFor: ["напряжённые сочетания нот", "оккультные сэмплы", "обычный бас и драмка Dark plugg"],
    production: ["Если от Dark plugg меняется только образ и набор сэмплов, отмечай Evil как эстетику, а не отдельный жанр."],
    confusions: ["Не любой хоррор-сэмпл означает Evil plugg."],
    sources: [src("Anywhere the Dope Go — Dark Plugg guide", "https://anywherethedopego.com/a-guide-to-dark-plugg/")],
    canonicalId: "dark-plugg",
  },
  "vamp-plugg": {
    status: "emerging",
    entityKind: "microgenre",
    confidence: "high",
    verdict: "Название собственного стиля Dani Kiyoko. Это не общий тег для всей музыки в эстетике Opium.",
    history: "Dani Kiyoko использует это название в своих релизах и описаниях. Первая версия атласа ошибочно сводила весь стиль к вампирским образам Opium.",
    listenFor: ["характерные мелодии и бас Dani Kiyoko", "перегруженный 808, который часто меняет ноты", "театральная подача без обязательного копирования Opium"],
    production: ["Сравнивай с несколькими треками Dani Kiyoko, а не только с названиями type beats и обложками.", "Не определяй стиль только по вампирской картинке."],
    confusions: ["Vamp как эстетика Playboi Carti/Opium шире и не равна Vamp plugg."],
    sources: [src("SoundCloud — Dani Kiyoko: Everything Vamp Plugg", "https://soundcloud.com/danikiyoko/sets/everything-vamp-plugg"), src("The FADER — Dani Kiyoko", "https://www.thefader.com/2024/08/07/dani-kiyoko-has-already-forgotten-your-favorite-trend/"), src("Sleep Walker — FreshPPL 2022", "https://www.sleepwalkerent.com/articles/freshpeople-lists/freshppl-list-2022")],
    needsListeningCheck: true,
  },
  "horror-plugg": {
    entityKind: "filter",
    confidence: "high",
    verdict: "Название отдельных релизов и тег для поиска хоррор-звучания внутри Dark plugg.",
    history: "Слово встречается в названиях проектов и поиске. Но у Horror plugg не найден отдельный круг артистов или свой ритм ударных.",
    listenFor: ["сэмплы из хоррора", "клавиши с напряжёнными сочетаниями нот", "обычная драмка Dark plugg"],
    production: ["Используй Horror для описания образа и сэмплов.", "Убери название и обложку и проверь: если бас и ударные не отличаются от Dark plugg, это не отдельный жанр."],
    confusions: ["Terror/Extremo отличается не только образом, но и поведением 808."],
    sources: [src("Shazam — Slither Files: Horror Plugg", "https://www.shazam.com/album/1670215611/slither-files-horror-plugg-ep"), src("Apple Music — Horror Plugg", "https://music.apple.com/us/song/1646541246")],
    canonicalId: "dark-plugg",
  },
  "stalker-plugg": {
    entityKind: "alias",
    confidence: "medium",
    verdict: "Stalker plugg используют в двух смыслах: как тег для поиска и как название проекта вокруг Gweilo Ghost.",
    history: "В поиске это слово часто означает просто мрачный Dark plugg. Но StalkerPlugg также является названием конкретного проекта или круга. Название проекта нельзя автоматически считать жанром.",
    listenFor: ["в обычном поисковом теге — знакомый звук Dark plugg", "в проекте StalkerPlugg — треки Gweilo Ghost и DJ HURTLOCKER"],
    production: ["Сначала сравни несколько треков проекта. Только после этого можно говорить о своём рисунке ударных.", "В поиске показывай оба значения и прямо объясняй разницу."],
    confusions: ["Название бренда или проекта не равно названию жанра."],
    sources: [src("SoundCloud — Gweilo Ghost: StalkerPlugg", "https://soundcloud.com/gweiloghost/sets/stalkerplugg")],
    canonicalId: "dark-plugg",
    needsListeningCheck: true,
  },
  "tarkov-plugg": {
    entityKind: "filter",
    confidence: "high",
    verdict: "Тег для type beats и наборов звуков по мотивам Escape from Tarkov. Это не жанр.",
    history: "Название означает Dark plugg с обложками, звуками оружия и военной атмосферой Escape from Tarkov. Отдельного круга артистов и нового рисунка ударных не найдено.",
    listenFor: ["звуки оружия и снаряжения", "одна длинная тревожная нота", "обычный бас и драмка Dark plugg"],
    production: ["Используй Tarkov как тематический фильтр по сэмплам и образу."],
    confusions: ["Игровая отсылка не доказывает новый жанр."],
    sources: [src("YouTube — Tarkov plugg type beat", "https://www.youtube.com/watch?v=ubr4VajSy_o"), src("SoundCloud — darkplugg playlist", "https://soundcloud.com/w6t6dmp3/sets/darkplugg")],
    canonicalId: "dark-plugg",
  },
  "terror-plugg": {
    name: "Terror / Extremo plugg",
    entityKind: "microgenre",
    confidence: "medium",
    verdict: "Крайняя ветка Dark plugg, где 808 часто играет главную мелодию. Alarm 808 — способ обработки баса, а не отдельный жанр.",
    history: "Новая волна продюсеров стала использовать 808 не только как низ, но и как главный мелодический звук. Названия Terror и Extremo относятся ко всей этой ветке. Словом Alarm чаще называют сам визгливый тембр 808.",
    listenFor: ["808 визжит, булькает или меняет оттенок", "бас короткими фразами отвечает вокалу", "из-за громкого 808 обычная мелодия почти исчезает"],
    production: ["Меняй высоту, оттенок, фильтр, начало и длину каждой ноты 808.", "Оставляй паузы: постоянный перегруз быстро перестаёт качать.", "Сравни с обычным Dark plugg: в Terror/Extremo бас должен выполнять заметно более важную роль."],
    confusions: ["Alarm 808 — один способ обработки баса.", "Horror, Stalker и Tarkov чаще описывают тему и обложки, а не новый звук ударных и баса."],
    sources: [src("Pitchfork — песни лета 2024", "https://pitchfork.com/features/lists-and-guides/2024-song-of-the-summer/"), src("Pitchfork — микрожанровый кризис", "https://pitchfork.com/thepitch/underground-rap-has-a-cornball-crisis/"), faderTdf, faderDarkPlugg],
    needsListeningCheck: true,
  },
  totalbass: {
    status: "misnomer",
    entityKind: "release",
    confidence: "high",
    verdict: "Название EP и эры 2Slimey, а не новый вид 808.",
    history: "Totalbass — название релиза и периода 2Slimey. О звуке этого релиза пишут медиа, но отдельного жанра с таким названием не появилось.",
    listenFor: ["слушай конкретный релиз 2Slimey", "не считай, что название описывает один универсальный тип баса"],
    production: ["Показывай Totalbass как релиз, который повлиял на сцену, а не как отдельный жанр."],
    confusions: ["Очень громкий бас сам по себе не является Totalbass."],
    sources: [src("Pitchfork — 2Slimey roundtable", "https://pitchfork.com/thepitch/the-2slimey-roundtable")],
    canonicalId: "terror-plugg",
  },
  partialbass: {
    status: "misnomer",
    entityKind: "release",
    confidence: "high",
    verdict: "Название ответного EP 4gooey и, вероятно, игра с Totalbass; не жанр.",
    history: "Partialbass — название релиза 4gooey, который вышел после Totalbass и, вероятно, обыгрывает его название. Как жанр это слово не используется.",
    listenFor: ["слушай конкретный релиз 4gooey", "не считай, что Partialbass всегда означает рваный 808"],
    production: ["Не превращай шутку в названии релиза в отдельный пресет или жанр."],
    confusions: ["Partialbass не подтверждён как противоположность Totalbass."],
    sources: [],
    canonicalId: "terror-plugg",
    needsListeningCheck: true,
  },
  "balloon-beats": {
    entityKind: "scene",
    confidence: "medium",
    verdict: "Молодой тег вокруг Balloon и связанных артистов. Отдельный тип «balloon 808» пока не доказан.",
    history: "Так называют небольшой круг релизов вокруг Balloon, boolymon и Perubaby. Связь между людьми видна, но общего обязательного баса и ударных пока не найдено.",
    listenFor: ["современный звук рядом с post-plugg и Terror", "подвижный 808 с резиновым оттенком встречается часто, но не везде", "важен общий круг участников, а не один пресет"],
    production: ["Не своди весь круг Balloon к одному выдуманному типу 808.", "Проверь, повторяется ли приём хотя бы у трёх разных продюсеров."],
    confusions: ["Balloon выпускает музыку и управляет правами на релизы. Balloon beats — название, которое используют слушатели."],
    sources: [src("Apple Music — gapplebees", "https://music.apple.com/ke/album/gapplebees-single/1870793625"), src("Apple Music — Party City", "https://music.apple.com/us/album/party-city/1882325146")],
    needsListeningCheck: true,
  },
  slimepointe: {
    name: "Slimepointe / Balloon network",
    entityKind: "scene",
    confidence: "medium",
    verdict: "Slimepointe, Balloon и связанные аккаунты раньше ошибочно были записаны как один жанр. На деле это разные части одной сети релизов.",
    history: "Slimepointe раньше был ником, связанным с OsamaSon, а позже стал SoundCloud-аккаунтом для публикаций и архива. Balloon выпускает релизы и управляет правами. Их нужно показывать как связанную сеть, а не как один жанр.",
    listenFor: ["смотри, кто указан в авторах и где опубликован трек", "у сети публикаций не обязано быть одного рисунка ударных"],
    production: ["Отдельно записывай автора, продюсера, аккаунт публикации и лейбл."],
    confusions: ["Slimepointe и Balloon — не синонимы.", "Общий канал релизов не гарантирует общий жанр."],
    sources: [src("SoundCloud — Slimepointe", "https://soundcloud.com/slimepointe"), src("YouTube — Balloon/Slimepointe context", "https://www.youtube.com/watch?v=HNjUyuyxTG8")],
    needsListeningCheck: true,
  },
  hyperplugg: {
    status: "emerging",
    entityKind: "hybrid",
    confidence: "medium",
    verdict: "Небольшой гибрид Plugg с Digicore и Hyperpop. Myspacemark помог распространить название, но не доказано, что он его придумал.",
    history: "Название встречается с начала 2020-х, в том числе у Smokkestaxkk. Треков пока немного, а часть из них можно так же назвать обычным Hyperpop.",
    listenFor: ["Plugg-ритм с большими паузами", "очень яркий главный синтезатор", "частые смены высоты звука и цифровые эффекты из Digicore и Hyperpop"],
    production: ["Сохраняй Plugg в ударных, а влияние Hyperpop показывай яркими звуками и обработкой.", "Убери название и проверь, действительно ли в музыке слышны обе стороны гибрида."],
    confusions: ["Hyperpop — общее название для большого числа разных звуков.", "Один яркий синтезатор ещё не делает трек Hyperplugg."],
    sources: [src("No Bells — SoundCloud microgenres", "https://nobells.blog/soundcloud-microgenres/"), src("Traktrain — Smokkestaxkk", "https://traktrain.com/smokkestaxkk")],
    relationNotes: [
      { target: "plugg", type: "hybrid", note: "Ритмическая база." },
      { target: "digicore", type: "hybrid", note: "Цифровая обработка и яркость." },
    ],
  },
  discoplugg: {
    status: "adjacent",
    entityKind: "hybrid",
    confidence: "low",
    verdict: "Редкий авторский стиль: аккорды PluggnB соединены с прямым танцевальным ритмом House, Disco или Jersey.",
    history: "Название встречается точечно и пока не обозначает большую самостоятельную сцену.",
    listenFor: ["PluggnB-аккорды", "прямая клубная бочка или Jersey-грув", "танцевальная форма"],
    production: ["Показывай обе стороны гибрида.", "Не создавай дочерний жанр только из-за прямой бочки."],
    confusions: ["New jazz может быть танцевальным, но не обязан строиться на house/disco-ритме."],
    sources: [],
    needsListeningCheck: true,
  },
  "plugg-phonk": {
    entityKind: "hybrid",
    confidence: "low",
    verdict: "Тег слушателей и продавцов битов для смеси Plugg и Phonk. Отдельным жанром он пока не стал.",
    history: "Plugg и Phonk существуют отдельно. Но общее название Plugg phonk пока не закрепилось за своим кругом артистов и единым узнаваемым звуком.",
    listenFor: ["Plugg-плаки и паузы", "Memphis-вокальные нарезки", "кассетная грязь или cowbell как дополнительный слой"],
    production: ["Определи, что именно пришло из Phonk: вокальный сэмпл, грязная обработка, ритм или ковбелл.", "Не считай сочетание любых двух пресетов новым жанром."],
    confusions: ["Drift phonk и Memphis revival — разные ветки Phonk."],
    sources: [],
    relationNotes: [{ target: "phonk", type: "hybrid", note: "Memphis-сэмплы и обработка." }],
    needsListeningCheck: true,
  },
  "tread-plugg": {
    entityKind: "hybrid",
    confidence: "low",
    verdict: "Поздний тег для смеси Tread и Plugg. Старые Tread-треки так называть не нужно.",
    history: "Tread — реальная историческая школа Working on Dying. Связка tread-plugg появилась позже как удобное описание гибрида.",
    listenFor: ["воздушная Plugg-мелодия", "плотные Tread-хэты и кики", "скользящий более активный 808"],
    production: ["Разделяй происхождение мелодии и драмки.", "Не переписывай историю Tread под более поздний тег."],
    confusions: ["Tread существует независимо от Plugg."],
    sources: [src("POW — Tread music", "https://www.powmag.net/p/tread-music"), src("The FADER — Working on Dying", "https://www.thefader.com/2018/11/27/working-on-dying-lil-uzi-vert-interview")],
    relationNotes: [{ target: "tread", type: "hybrid", note: "Историческая драм-школа Working on Dying." }],
  },
  pluggadelic: {
    entityKind: "filter",
    confidence: "medium",
    verdict: "Психоделический образ и эффекты внутри Plugg. Своего обязательного рисунка ударных у названия нет.",
    history: "Название используется отдельными авторами, включая sifey2dope, и хорошо описывает образ, но не подтверждает отдельную сцену.",
    listenFor: ["эффект, который раскачивает оттенок звука, и заметные изменения его высоты", "яркая психоделическая мелодия", "части трека меняются свободнее, чем в обычном Plugg"],
    production: ["Помечай эффект, визуальный язык и структуру отдельно.", "Не ожидай единой Pluggadelic-драмки."],
    confusions: ["Psychedelic trap — более старое и общее название для психоделического trap."],
    sources: [src("SoundCloud — sifey2dope: movie", "https://m.soundcloud.com/sifey2dope/movie-prod-jkj-bwser")],
    canonicalId: "plugg",
  },
  "pumped-plugg": {
    status: "misnomer",
    entityKind: "filter",
    confidence: "low",
    verdict: "Фанатский тег для более громкого и энергичного Plugg. Отдельного жанра нет.",
    history: "Название встречается в обсуждениях как попытка собрать dark, evil, hyper и другие тяжёлые варианты.",
    listenFor: ["высокая энергия", "больше перегруза", "при этом нет одной общей драмки"],
    production: ["Используй параметры энергии, плотности и перегруза вместо нового жанрового узла."],
    confusions: ["Terror, Hyperplugg и Dark plugg имеют разные причины звучать громче."],
    sources: [src("Reddit — обсуждение Plugg-поджанров", "https://www.reddit.com/r/PluggnB/comments/vd8cm1/what_are_all_the_main_plugg_sub_genres/")],
    canonicalId: "plugg",
  },
  "ambient-rap": {
    name: "Ambient rap / современная волна",
    entityKind: "umbrella",
    confidence: "high",
    verdict: "Ambient rap — старое общее название для тихого атмосферного рэпа. Отдельно существует новая SoundCloud-сцена 2023–2026 годов.",
    history: "Название использовали ещё во времена эмбиент-релиза Lil B и раннего Cloud rap. Сейчас рядом с ним появилась новая волна DPM, SIE и других интернет-объединений. Новая волна не является началом всей истории Ambient rap.",
    listenFor: ["тихая или редкая драмка", "вокал и саб спрятаны в пространстве", "мелодия развивается медленно или почти стоит"],
    production: ["Сначала выбери конкретную ветку Ambient rap, которую хочешь повторить.", "Тишина и ощущение глубины важнее случайного пресета пэда.", "Не выдавай современную волну за начало всего Ambient rap."],
    confusions: ["В Ambient plugg сохраняются ударные и паузы, пришедшие из Plugg.", "Ambient trap — общее описание trap с атмосферными фоновыми звуками."],
    sources: [src("Pitchfork — Lil B ambient rap album", "https://pitchfork.com/news/40102-lil-b-releases-ambient-rap-album/"), ambientScene, faderDpm],
  },
  "ambient-trap": {
    status: "tag",
    entityKind: "umbrella",
    confidence: "high",
    verdict: "Общее описание trap с атмосферными фоновыми звуками. У DPM это слово имеет более точный местный смысл.",
    history: "Слова Ambient trap использовали для разной музыки. Xang и DPM применяют их к своему звуку, поэтому всегда важно указывать, о какой сцене идёт речь.",
    listenFor: ["эмбиентная подложка", "trap-ритм или его остатки", "конкретные признаки зависят от сцены"],
    production: ["Всегда уточняй линию: DPM, Cloud, почти безударный rap или другой гибрид."],
    confusions: ["Это не синоним современной Ambient rap-сцены целиком."],
    sources: [faderDpm],
    canonicalId: "ambient-rap",
  },
  "early-lucki-ambient": {
    name: "Early LUCKI / Alternative Trap",
    status: "scene",
    entityKind: "influence",
    confidence: "high",
    verdict: "Ранний период LUCKI, который повлиял на современный тихий рэп. Сам LUCKI называл этот звук Alternative Trap.",
    history: "Проекты LUCKI 2013–2017 годов повлияли на спокойную отстранённую подачу и просторный микс современного рэпа. Название Early Lucki ambient появилось позже, поэтому отдельным жанром его считать не нужно.",
    listenFor: ["сонная отстранённая читка", "медленное развитие бита", "тяжёлое, но не обязательно эмбиентное настроение"],
    production: ["Используй карточку как историческую ссылку, а не готовый жанровый рецепт."],
    confusions: ["Alternative Trap — название, которое использовал сам LUCKI. Ambient rap охватывает намного больше артистов и звуков."],
    sources: [src("Elevator — Alternative Trap", "https://elevatormag.com/lucki-eck-alternative-trap-mixtape"), src("Pitchfork — LUCKI: X", "https://pitchfork.com/reviews/albums/20750-x/"), src("Pitchfork — профиль LUCKI", "https://pitchfork.com/thepitch/lucki-can-tell-nothing-but-his-truth/")],
  },
  dpm: {
    parent: "ambient-rap",
    entityKind: "collective",
    confidence: "high",
    verdict: "Неформальный коллектив и узнаваемый стиль продюсеров с сильной связью с DMV.",
    history: "Deep & Powerful Music объединяет theo, Xang, westly, fk/fakekickin и близких артистов. DPM — это одновременно круг людей, совместная работа и узнаваемый способ делать биты.",
    listenFor: ["мягкие размытые синтезаторы и вокальные сэмплы", "ударные входят неровно и будто тянутся за битом", "характерная читка DMV/free-car внутри тихого глубокого микса"],
    production: ["Создавай глубину несколькими тихими слоями, а не только большим ревербом.", "808 и вокал могут частично сливаться с фоном.", "Если делаешь именно DPM-звук, сохраняй паузы и акценты DMV."],
    confusions: ["Не вся Ambient trap-музыка относится к DPM.", "Zel близок к этому кругу, но без источника нельзя называть его участником."],
    sources: [src("Pitchfork — The New DMV", "https://pitchfork.com/features/the-new-dmv/"), faderDpm],
  },
  sie: {
    name: "SIE",
    entityKind: "collective",
    confidence: "high",
    verdict: "Реальный интернет-коллектив. Отдельный жанр под названием SIE ambient не подтверждён.",
    history: "SIE объединяет suckrball, 22/22 Pooruhn, sheroy, hunnakay, kllhhr и другие имена. Сходство релизов важно, но название относится прежде всего к коллективу.",
    listenFor: ["тихие короткие мелодии, которые повторяются", "сухой голос без большого реверба", "мало ударных, но у разных участников рисунок может отличаться"],
    production: ["Разделяй членство в коллективе и жанровую классификацию конкретного трека."],
    confusions: ["Расшифровка аббревиатуры и единый SIE-жанр не подтверждены."],
    sources: [ambientScene, src("Shazam — SIE orbit: backdoor", "https://www.shazam.com/song/1885869742/backdoor")],
  },
  "myrlu-aghast": {
    name: "myrlu × aghast",
    entityKind: "partnership",
    confidence: "high",
    verdict: "Продюсеры myrlu и aghast часто работают вместе. Но это не официальный дуэт, отдельная школа или жанр.",
    history: "В данных о релизах часто встречаются совместные работы myrlu и aghast. При этом у их подхода нет отдельного названия и подтверждённого круга последователей.",
    listenFor: ["одна длинная нота или фоновый шум", "новые ноты появляются медленно", "голос и ударные частично сливаются с фоном"],
    production: ["Отмечай их как совместных продюсеров конкретных треков.", "Узнаваемый почерк двух людей ещё не означает новый жанр."],
    confusions: ["Продюсерская связка не равна коллективу вроде DPM или SIE."],
    sources: [ambientScene, src("SoundCloud — aghast: zel store run", "https://soundcloud.com/aaghast/zel-store-run"), src("SoundCloud — myrlu/aghast credit", "https://soundcloud.com/osogyn/where-i-started-myrlu-aghast")],
  },
  "ambient-wave": {
    name: "Plaguecivitas / ambient wave",
    status: "scene",
    entityKind: "label",
    confidence: "medium",
    verdict: "Plaguecivitas — подтверждённый лейбл и сеть релизов. Ambient wave — редкий внешний тег, а не другое название лейбла.",
    history: "Данные о релизах подтверждают Plaguecivitas как лейбл и связанную сеть артистов. Название Ambient wave используют реже, поэтому его нужно показывать только как дополнительный тег.",
    listenFor: ["смотри каталог лейбла и список участников конкретного релиза", "не жди одного обязательного бита от всех артистов сети"],
    production: ["Не смешивай в одну категорию лейбл, круг артистов и описание звука."],
    confusions: ["Plaguecivitas не является синонимом всей современной Ambient rap-волны."],
    sources: [],
    needsListeningCheck: true,
  },
  "dmv-ambient": {
    status: "tag",
    entityKind: "filter",
    confidence: "medium",
    verdict: "Удобное описание смеси DPM и DMV free-car. Сами участники не закрепили его как отдельный жанр.",
    history: "Название понятно описывает музыку из DMV с подачей free-car и глубокими тихими битами DPM. Но сами артисты не используют его как общее название своей сцены.",
    listenFor: ["читка DMV/free-car короткими фразами", "приглушённый глубокий бит", "характерные паузы и акценты DMV"],
    production: ["Показывай связь между DPM и DMV, а не добавляй новый жанр в дерево."],
    confusions: ["Ambient trap вне DMV может звучать совсем иначе."],
    sources: [src("Pitchfork — The New DMV", "https://pitchfork.com/features/the-new-dmv/")],
    canonicalId: "dpm",
  },
  "philly-void": {
    status: "misnomer",
    entityKind: "misnomer",
    confidence: "high",
    verdict: "Красивую фразу из статьи ошибочно приняли за название жанра.",
    history: "Фраза о «передаче из пустоты» описывала ощущение от музыки Tovi/HappyDranker. Нет доказательств, что Philly-сцена называет себя void rap.",
    listenFor: ["приглушённый микс Philly street rap или drill", "ударные звучат далеко", "голос почти без реверба — это частые признаки, но не правила жанра"],
    production: ["Показывай Tovi и HappyDranker как часть местной сцены, а слово void — только как цитату из статьи."],
    confusions: ["Не называй всю тихую Philly-сцену Void rap."],
    sources: [ambientScene],
  },
  "choir-drill": {
    parent: null,
    status: "tag",
    entityKind: "technique",
    confidence: "medium",
    verdict: "Хоровой сэмпл часто встречается в Philly drill. Слово Minimal означает, что в бите мало слоёв. Это не два новых жанра.",
    history: "Критики и продюсеры иногда говорят Choir drill, чтобы быстро описать такой бит. Но мы не нашли убедительных примеров, где сами артисты называют так отдельное движение.",
    listenFor: ["один повторяющийся хоровой мотив", "сухой голос без большого реверба", "много пауз в обычной драмке Philly drill"],
    production: ["Отдельно отмечай хоровой сэмпл и небольшое количество слоёв.", "Один повторяющийся звук ещё не создаёт новую сцену."],
    confusions: ["Minimal drill — слишком общее описание для отдельного жанра."],
    sources: [src("No Bells — MVMBO и Philly drill", "https://nobells.blog/mvmbo-producer-philly-drill-skrilla-67/"), src("Pitchfork — Reemo", "https://pitchfork.com/reviews/albums/reemo-kyriemo-irving/"), src("Pitchfork — Skrilla", "https://pitchfork.com/thepitch/lets-talk-about-skrilla-doot-doot-6-7/")],
  },
  "muffled-rap": {
    parent: null,
    status: "tag",
    entityKind: "technique",
    confidence: "high",
    verdict: "Описание микса: высоких частот мало, поэтому звук кажется далёким и будто закрытым стеной. Это не жанр.",
    history: "Слово Muffled описывает качество звука, а не сцену. Такой микс встречается в Philly street rap, Ambient rap и другой музыке.",
    listenFor: ["мало высоких частот", "звук почти не расходится по левому и правому каналам", "голос и снейр звучат будто из соседней комнаты"],
    production: ["Убирай часть высоких частот фильтром, осторожно работай с верхней серединой и добавляй ощущение расстояния ревербом.", "Не путай намеренно приглушённый звук с мутным миксом, где инструменты просто мешают друг другу."],
    confusions: ["Muddy — частотная проблема; muffled может быть осознанной эстетикой."],
    sources: [ambientScene, src("iZotope — как избежать muddy sound", "https://www.izotope.com/community/blog/how-to-avoid-a-muddy-sound"), src("iZotope — EQ вокала", "https://www.izotope.com/community/blog/how-to-eq-vocals")],
    canonicalId: "ambient-rap",
  },
};

const sound = (bass: string, drums: string, mood: string, tempo: string, era?: string): ReviewedSound =>
  era ? { bass, drums, mood, tempo, era } : { bass, drums, mood, tempo };

export const manualReviewedSounds: Record<string, ReviewedSound> = {
  plugg: sound("Мягкий 808 средней длины. Иногда бас плавно переходит с одной ноты на другую.", "Сухой клэп, мало киков, простые хэты и большие паузы. Ритм качает именно за счёт пустого места.", "Спокойное и уверенное. Мелодия яркая, но весь микс не давит громкостью.", "Обычно 130–160 BPM, но по ощущению в два раза медленнее.", "2013 → сейчас"),
  "og-plugg": sound("Чистый саб или округлый 808 с мягкой атакой и коротким хвостом.", "Редкий клэп, короткие хэты без постоянных роллов, кик появляется только в опорных местах.", "Лёгкое, просторное и уличное без мрачной театральности.", "Обычно 130–150 BPM.", "2013–2017; влияние сохраняется"),
  "dreamy-plugg": sound("Тот же спокойный 808, но он начинается мягче и в нём меньше высоких частот.", "Обычная драмка раннего Plugg. Своего отдельного рисунка ударных нет.", "Тёплое и мечтательное. Название описывает настроение.", "Совпадает с OG Plugg: примерно 130–150 BPM."),
  "new-plugg": sound("Чище и громче раннего Plugg. Нота баса часто короче, чтобы не мешать более плотной драмке.", "Больше быстрых хэтов и переходов. Начало кика, клэпа и хэтов звучит резче, чем в раннем Plugg.", "Яркое и подвижное, но общего обязательного настроения нет.", "Чаще 140–165 BPM.", "2020–2022 как заметная волна"),
  pluggnb: sound("Чистый 808 средней длины настроен по нотам аккордов. Иногда бас плавно переходит к следующей ноте.", "Большие Plugg-паузы, короткие дроби снейра и хэты, которые повторяют или дополняют вокальную мелодию.", "Романтичное или личное. Аккорды важнее громкости и напора.", "Обычно 130–160 BPM."),
  "slayworld-pluggnb": sound("Мягкий настроенный 808, который следует басовым нотам длинной прогрессии.", "Редкие кики, снейр-роллы в концах фраз, свободные хэты.", "Личное, мелодичное, иногда холодное.", "Примерно 135–160 BPM.", "2018–2022 как ключевой период"),
  "rnb-pluggnb": sound("Чистый саб без сильного перегруза, часто повторяет корни расширенных аккордов.", "Драмка тише гармонии; роллы используются как украшение, а не постоянный рисунок.", "Тёплое, романтичное или gospel-приподнятое.", "Обычно 125–155 BPM."),
  "emo-pluggnb": sound("Мягкий 808 с длиннее удержанной нотой под минорной прогрессией.", "Обычная PluggnB-драмка; отдельного emo-паттерна нет.", "Исповедальное и печальное — настроение важнее техники.", "Чаще 130–155 BPM."),
  "dark-pluggnb": sound("808 грубее и насыщеннее, но его ноты всё ещё совпадают с R&B-аккордами.", "Обычный рисунок PluggnB, только кик, клэп и хэты начинаются резче. Своей обязательной драмки нет.", "Холодное и тревожное.", "Обычно 135–160 BPM."),
  "jersey-pluggnb": sound("Короткий саб не мешает частым ударам клубной бочки.", "Частая Jersey-бочка, характерный сэмпл скрипа кровати и нарезанный вокал вместо редкой Plugg-драмки.", "Романтичное, но рассчитанное на движение.", "Чаще 135–155 BPM с явным клубным ощущением."),
  "new-jazz-pluggnb": sound("808 часто меняет ноты и плавно скользит вслед за синтезаторами.", "Драмка плотнее, чем в PluggnB: больше коротких дробей, вариаций и смен рисунка внутри одной части трека.", "Яркое, нервное и постоянно меняющееся.", "Примерно 140–175 BPM."),
  "diary-plugg": sound("Чистый саб средней длины, обычно тише вокала и пиано.", "Редкая PluggnB-драмка без лишних переходов.", "Очень личное и печальное, без хоррор-образов.", "Чаще 125–150 BPM.", "2023 → сейчас"),
  "asian-rock": sound("Настроенный 808 средней длины; низ поддерживает сложную мелодию.", "PluggnB-снейры и роллы, иногда плотнее из-за насыщенной гармонии.", "Драматичное и мелодичное.", "Обычно 135–165 BPM."),
  "ambient-plugg": sound("Длинный чистый саб начинается мягко. Плавные переходы между нотами редкие, высоких частот у 808 мало.", "Клэп и хэты тихие и редкие. Кик может пропадать на несколько тактов.", "Спокойное, сонное или отстранённое. Длинные паузы являются частью бита.", "Чаще 120–155 BPM, но по ощущению звучит медленнее."),
  "izaya-ambient": sound("Мягкий саб средней длины обычно тише вокала.", "Редкий Plugg-клэп и немного хэтов. Куплеты и хуки всё ещё легко различить.", "Близкое, личное и слегка размытое.", "Примерно 125–150 BPM."),
  nod: sound("Глубокий глухой толчок баса без резкого начала. Иногда вместо басовой партии звучит одна длинная нота.", "Ударные едва слышны или отсутствуют. Ритм создают голос, шум и паузы.", "Сонное, медленное и очень тихое.", "Точный BPM часто трудно услышать. Примерный диапазон — 100–150."),
  "drone-plugg": sound("Редкий саб звучит под одной длинной нотой. Своих отдельных правил для баса у тега нет.", "Ударные берутся из обычного Plugg. Отдельный рисунок для Drone plugg не подтверждён.", "Почти неподвижное и медленно меняющееся.", "Скорость не определяет этот приём: это не жанр."),
  grog: sound("Описание относится к конкретному треку и его связи с Nod.", "Приглушённая редкая драмка. Отдельного рисунка Grog не существует.", "Мутное и медленное.", "По одному треку нельзя установить обычный диапазон скорости."),
  "lowercase-rap": sound("Отдельного басового языка нет.", "Тихая драмка может встречаться в разных жанрах.", "Слово ошибочно переносит название существующей электронной традиции на rap.", "Не применимо."),
  "soft-plugg": sound("Мягкая атака и меньше перегруза; длина зависит от исходного Plugg-подвида.", "Обычная Plugg-драмка, только тише или реже.", "Мягкое и спокойное — это фильтр.", "Обычно в пределах Plugg: 125–160 BPM."),
  "ambient-wave-plugg": sound("Надёжной отдельной формулы нет.", "Надёжной отдельной формулы нет.", "Составное неподтверждённое название.", "Не определено."),
  "dark-plugg": sound("Бас тяжелее, чем в классическом Plugg. В раннем DMV он длинный и просторный, а в новых треках сильнее искажён и может играть мелодию.", "Большие Plugg-паузы остаются. Кик и хэты могут звучать резче, но ударных не обязательно становится больше.", "Холодное, угрожающее и уличное.", "Чаще 135–165 BPM."),
  "surreal-dark-plugg": sound("Тяжёлый 808 звучит долго и оставляет вокруг себя много пустого места. Его оттенок не меняется постоянно, как в новом Terror-звуке.", "Ударных мало, а ритм сохраняет характерные паузы DMV.", "Мрачное и сдержанное.", "Примерно 135–155 BPM.", "Ранняя линия 2016–2020"),
  "evil-plugg": sound("Обычно используется тот же 808, что и в Dark plugg. Отдельного обязательного звука баса нет.", "Обычная драмка Dark plugg без своего нового рисунка.", "Оккультные и демонические образы меняют настроение, но не устройство бита.", "Совпадает с Dark plugg."),
  "vamp-plugg": sound("Перегруженный 808 Dani Kiyoko часто меняет ноты. Точные общие правила ещё нужно проверить на нескольких треках.", "В основе остаётся Plugg, но переходы и перепады громкости звучат более театрально.", "Драматичное и культовое, но не простая копия Opium.", "Обычный диапазон скорости ещё нужно проверить на подборке треков.", "Авторская линия начала 2020-х → сейчас"),
  "horror-plugg": sound("Обычно используется бас Dark plugg. Хоррор-настроение чаще создают сэмплы, а не отдельная обработка 808.", "Обычная драмка Dark plugg без своего устойчивого рисунка.", "Тревожное и мрачное, как музыка к хоррору.", "Совпадает с Dark plugg."),
  "stalker-plugg": sound("В поисковом теге обычно звучит бас Dark plugg. Проект StalkerPlugg нужно отдельно проверить по нескольким трекам.", "Свой отдельный рисунок ударных не подтверждён.", "Тревожное и пустое по настроению.", "Не определено."),
  "tarkov-plugg": sound("Обычный 808 из Dark plugg без обязательной новой обработки.", "Драмка Dark plugg дополнена звуками оружия и игрового снаряжения.", "Военное напряжение создают сэмплы и обложка.", "Совпадает с Dark plugg."),
  "terror-plugg": sound("808 играет главную мелодию: меняет высоту и оттенок, визжит, булькает и сильно искажается.", "Между нотами баса остаются паузы. Ударные часто простые, чтобы не мешать 808.", "Агрессивное и нестабильное, но не обязательно быстрое.", "Чаще 140–170 BPM."),
  totalbass: sound("Описывает бас конкретного EP 2Slimey, а не универсальный пресет.", "Зависит от релиза; отдельная totalbass-драмка не существует.", "Релизный образ, а не жанровое настроение.", "Смотри конкретный релиз.", "EP/эра 2026"),
  partialbass: sound("Описание относится к конкретному релизу 4gooey. Общий тип баса не подтверждён.", "Своего отдельного рисунка ударных нет.", "Название обыгрывает Totalbass.", "Слушай конкретный релиз.", "Релиз 2026"),
  "balloon-beats": sound("Подвижный 808 с резиновым оттенком встречается часто, но пока не во всех треках круга.", "Современная драмка рядом с post-plugg и Terror, в которой остаётся много заметных пауз.", "Игровое и странное. Единого обязательного настроения пока нет.", "Примерно 140–170 BPM. Диапазон ещё нужно проверить на большей подборке треков.", "Молодой круг 2025–2026"),
  slimepointe: sound("Общего баса нет: карточка описывает сеть публикаций и данные об участниках релизов.", "Общего рисунка ударных нет.", "Это связь между людьми и площадками, а не настроение музыки.", "Не применимо."),
  hyperplugg: sound("808 может быть чище или сильнее искажён, но часто уступает место очень ярким высоким синтезаторам.", "Plugg-ритм сохраняется, но цифровых переходов и сбивок становится больше.", "Яркое, быстрое и явно связанное с интернет-музыкой.", "Чаще 145–180 BPM."),
  discoplugg: sound("Короткий саб звучит под частые удары клубной бочки.", "Ровная бочка на каждую долю, как в House, или ритм Jersey вместо больших пауз Plugg.", "Танцевальное и мелодичное.", "Обычно 125–155 BPM."),
  "plugg-phonk": sound("Саб Plugg сочетается с грязной обработкой и сэмплами Memphis/Phonk.", "В одних треках больше ритма Plugg, в других — Phonk. Единого рисунка пока нет.", "Может быть мягким или мрачным. Название охватывает слишком разные треки.", "Не закреплено."),
  "tread-plugg": sound("Активный 808 из Tread часто скользит между нотами под воздушную мелодию Plugg.", "Хэты, кики и короткие дроби из Tread плотнее и сложнее обычной драмки Plugg.", "Воздушная мелодия сочетается с нервным активным низом.", "Чаще 145–175 BPM."),
  pluggadelic: sound("Бас зависит от основной ветки Plugg. Своего обязательного типа 808 нет.", "Драмка Plugg меняется свободнее, но общего нового рисунка ударных нет.", "Психоделическое и театральное.", "Совпадает с основной веткой Plugg."),
  "pumped-plugg": sound("Обычно громче и сильнее перегружен, но общего типа 808 нет.", "Плотность выше среднего Plugg, однако паттерны берутся из разных веток.", "Энергичное — это параметр, не жанр.", "Не закреплено."),
  "ambient-rap": sound("Саб чистый или приглушённый и начинается мягко. Точный характер баса зависит от конкретной сцены.", "От редкой trap-драмки до треков почти без ударных.", "Чаще тихое и отстранённое, но общее название Ambient rap включает разное настроение.", "Диапазон широкий, но по ощущению музыка обычно медленная.", "Термин известен с 2010-х; новая волна 2023–2026"),
  "ambient-trap": sound("Саб и 808 отличаются у разных местных сцен. Единого обязательного типа баса нет.", "Обычный trap-ритм разной плотности звучит поверх длинных атмосферных фонов.", "Широкое и атмосферное, но не обязательно тихое.", "Широкий диапазон 110–170 BPM."),
  "early-lucki-ambient": sound("Тяжёлый бас раннего Alternative Trap. Это влияние на современный Ambient rap, а не отдельная школа баса.", "Медленная trap-драмка с большими паузами.", "Отстранённое и тяжёлое.", "BPM может быть обычным для trap, но из-за редких ударов музыка ощущается медленно.", "2013–2017 как историческое влияние"),
  dpm: sound("Глубокий 808 частично сливается с фоном. Бас начинается мягко, но остаётся тяжёлым.", "Ударные входят с паузами и небольшими задержками, поэтому драмка будто тянется за битом. Сохраняются акценты DMV/free-car.", "Мутное, тяжёлое и сосредоточенное.", "Чаще 120–160 BPM, но по ощущению медленнее.", "2023 → сейчас"),
  sie: sound("Тонкий саб или негромкий 808; общего обязательного баса у коллектива нет.", "Редкая сухая драмка, иногда почти без кика.", "Личное, тихое и мелодичное.", "Зависит от участника; чаще медленное ощущение.", "Современный интернет-коллектив"),
  "myrlu-aghast": sound("Длинный слой саба или редкие короткие толчки низких частот.", "Ударные появляются поздно и могут частично сливаться с фоном.", "Медленное, тягучее и очень широкое.", "Без заметной драмки точный BPM трудно услышать."),
  "ambient-wave": sound("У лейбла и связанной сети нет одного обязательного типа баса.", "Общего рисунка ударных тоже нет.", "Карточка описывает связь между людьми и релизами. Настроение зависит от конкретного трека.", "Не применимо."),
  "dmv-ambient": sound("Глубокий приглушённый 808 звучит под непрерывную читку короткими фразами.", "Сохраняются паузы и акценты DMV/free-car, но весь микс тише и глубже обычного уличного рэпа.", "Холодное и сосредоточенное.", "Чаще 125–160 BPM."),
  "philly-void": sound("Гулкий приглушённый бас встречается в конкретной линии Philly-микса. Отдельного жанра Void rap нет.", "Редкая драмка Philly drill или street rap звучит далеко и тихо.", "Фразу «передача из пустоты» придумал журналист, а не сами артисты.", "Для жанра не определено."),
  "choir-drill": sound("Обычный бас Philly drill. Хоровой сэмпл не требует отдельного типа 808.", "В драмке Philly drill много больших пауз.", "Хор и пустое место создают напряжение.", "Обычно совпадает со скоростью местной drill-сцены."),
  "muffled-rap": sound("У баса мало высоких частот, поэтому он может казаться гулким и закрытым.", "Рисунок ударных может быть любым, но их резкое начало и высокие частоты приглушены.", "Звук кажется далёким и закрытым. Это свойство микса, а не настроение жанра.", "Как отдельный жанр скорости не имеет."),
};

export const researchOverrides: Record<string, ResearchOverride> = {
  ...manualResearchOverrides,
  ...generatedResearchOverrides,
};

export const reviewedSounds: Record<string, ReviewedSound> = {
  ...manualReviewedSounds,
  ...generatedReviewedSounds,
};

export const reviewedIds = Object.keys(researchOverrides);
import { generatedResearchOverrides, generatedReviewedSounds } from "./research-generated";
