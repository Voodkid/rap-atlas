"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Columns3,
  Compass,
  Database,
  Ear,
  ExternalLink,
  FileWarning,
  GitCompareArrows,
  Info,
  ListFilter,
  MessageSquareWarning,
  Music2,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlossaryDrawer } from "@/features/glossary/GlossaryDrawer";
import { glossary } from "@/features/glossary/glossary-data";
import { GenreTree } from "@/features/navigation/GenreTree";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { AtlasShell } from "@/features/shell/AtlasShell";
import type { DetailTab, KnowledgeScope, ViewMode } from "@/features/shell/model";
import { useStoredList } from "@/shared/hooks/useStoredList";
import { cn } from "@/shared/lib/cn";
import { EntityBadge } from "@/shared/ui/EntityBadge";
import { FamilyMark } from "@/shared/ui/FamilyMark";
import { MaturityBadge } from "@/shared/ui/MaturityBadge";
import { ResearchBadge } from "@/shared/ui/ResearchBadge";
import {
  AtlasEntry,
  EntityKind,
  EntryStatus,
  confidenceLabels,
  entries,
  entryById,
  entityKindLabels,
  families,
  FamilyId,
  getChildren,
  getFamily,
  getLineage,
  searchEntries,
  discoveryRoutes,
  learningPaths,
  maturityLabels,
  relationTypeLabels,
} from "./atlas-data";

const reviewedTotal = entries.filter((entry) => entry.researchState === "reviewed").length;

const statusSymbol: Record<EntryStatus, string> = {
  established: "●",
  emerging: "◐",
  scene: "◇",
  tag: "△",
  adjacent: "↔",
  misnomer: "×",
  umbrella: "◎",
};

const profileLabels: Array<{ key: keyof AtlasEntry["profile"]; label: string }> = [
  { key: "energy", label: "Энергия" },
  { key: "distortion", label: "Перегруз" },
  { key: "ambience", label: "Ширина и реверб" },
  { key: "bounce", label: "Насколько качает" },
  { key: "bassWeight", label: "Тяжесть низа" },
];

const focusOptions = [
  { id: "bass", label: "Бас" },
  { id: "drums", label: "Драмка" },
  { id: "melody", label: "Мелодия" },
  { id: "vocals", label: "Вокал" },
];

const bassOptions = [
  { id: "short", label: "Короткий" },
  { id: "long", label: "Длинный" },
  { id: "clean", label: "Чистый саб" },
  { id: "distorted", label: "С перегрузом" },
  { id: "slides", label: "Со slides" },
  { id: "lead", label: "808 играет мелодию" },
  { id: "barely", label: "Едва слышный" },
];

const rhythmOptions = [
  { id: "sparse", label: "Редкая драмка" },
  { id: "dense", label: "Плотная" },
  { id: "broken", label: "Ломаная драмка" },
  { id: "club", label: "Клубный ритм" },
  { id: "swing", label: "Со swing" },
  { id: "bounce", label: "Сильно качает" },
  { id: "straight", label: "Прямая" },
  { id: "beatless", label: "Почти без ударных" },
];

const melodyOptions = [
  { id: "chords", label: "Аккордовая" },
  { id: "loop", label: "Короткий луп" },
  { id: "sample", label: "Сэмпловая" },
  { id: "drone", label: "Одна длинная нота или пэд" },
  { id: "minimal", label: "Почти отсутствует" },
  { id: "bright", label: "Яркий плак" },
  { id: "dark", label: "Тёмная, ноты звучат напряжённо" },
];

function ProfileBars({ entry, compact = false }: { entry: AtlasEntry; compact?: boolean }) {
  const family = getFamily(entry.family);
  return (
    <div className={cn("profile-bars", compact && "profile-bars--compact")}>
      {profileLabels.map(({ key, label }) => (
        <div className="profile-row" key={key}>
          <div className="profile-label">
            <span>{label}</span>
            <b>{entry.profile[key]}/5</b>
          </div>
          <div className="profile-track" aria-label={`${label}: ${entry.profile[key]} из 5`}>
            <span style={{ width: `${entry.profile[key] * 20}%`, backgroundColor: family.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeView({
  onSelect,
  onFinder,
  onFocusSearch,
  onGuide,
}: {
  onSelect: (entry: AtlasEntry) => void;
  onFinder: () => void;
  onFocusSearch: () => void;
  onGuide: () => void;
}) {
  const reviewedCount = entries.filter((entry) => entry.researchState === "reviewed").length;
  const queuedCount = entries.length - reviewedCount;
  const taskRoutes = [
    { id: "known", icon: <Search size={18} />, title: "Уже знаю название", text: "Введи жанр, артиста, продюсера или признак звука.", action: onFocusSearch },
    { id: "sound", icon: <SlidersHorizontal size={18} />, title: "Ищу звук для бита", text: "Ответь на четыре вопроса без знания жанровых терминов.", action: onFinder },
    { id: "identify", icon: <Ear size={18} />, title: "Хочу понять, что играет", text: "Начни с слышимых признаков и сравни ближайшие варианты.", action: onFinder },
    { id: "branch", icon: <Workflow size={18} />, title: "Хочу разобрать одну ветку", text: "Иди по короткому маршруту и смотри, где меняется звук.", action: () => onSelect(entryById.get("plugg")!) },
  ];
  return (
    <div className="home-view">
      <section className="hero-panel">
        <div className="hero-panel__eyebrow"><Sparkles size={15} /> RAP ATLAS 2.0 · новая версия базы</div>
        <h1>Сначала звук.<br /><span>Потом название.</span></h1>
        <p>
          Ищи направление по басу, драмке, мелодии или артисту. В карточке сразу видно, что это:
          жанр, круг артистов, стиль продюсеров или просто тег для поиска.
        </p>
        <div className="hero-actions">
          <button className="button button--primary" onClick={onFinder}><Compass size={18} /> Подобрать по звуку</button>
          <button className="button button--ghost" onClick={onGuide}>Как читать атлас <ArrowRight size={17} /></button>
        </div>
        <div className="hero-stats">
          <div><strong>{entries.length}</strong><span>карточки сохранены</span></div>
          <div><strong>{reviewedCount}</strong><span>подробно проверены</span></div>
          <div><strong>{queuedCount}</strong><span>в очереди на проверку</span></div>
          <div><strong>{families.length}</strong><span>больших веток</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">Можно начать без названия жанра</span><h2>Что ты хочешь сделать?</h2></div></div>
        <div className="task-grid">
          {taskRoutes.map((task, index) => (
            <button key={task.id} className="task-card" onClick={task.action}>
              <span className="task-card__index">0{index + 1}</span>
              <span className="task-card__icon">{task.icon}</span>
              <span><strong>{task.title}</strong><small>{task.text}</small></span>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="section-kicker">Быстрый поиск по признаку</span><h2>Если уже знаешь, что нужно</h2></div>
          <button className="text-button" onClick={onFinder}>Точный подбор <ArrowRight size={15} /></button>
        </div>
        <div className="route-grid">
          {discoveryRoutes.map((route, index) => {
            const first = entryById.get(route.ids.find((id) => entryById.has(id))!)!;
            return (
              <button key={route.id} className="route-card" onClick={() => onSelect(first)}>
                <span className="route-card__index">0{index + 1}</span>
                <span className="route-card__copy"><strong>{route.title}</strong><small>{route.subtitle}</small></span>
                <ArrowRight size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">Короткий путь по основным карточкам</span><h2>Маршруты по веткам</h2></div></div>
        <div className="learning-grid">
          {learningPaths.map((path) => (
            <article className="learning-card" key={path.id}>
              <span className="section-kicker">{path.ids.length} шагов</span>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <div className="learning-card__steps">
                {path.ids.map((id, index) => {
                  const item = entryById.get(id);
                  return item ? <button key={id} onClick={() => onSelect(item)}><b>{index + 1}</b>{item.name}</button> : null;
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">Весь атлас сохранён</span><h2>12 больших веток</h2></div></div>
        <div className="family-grid">
          {families.map((family) => {
            const familyEntries = entries.filter((entry) => entry.family === family.id);
            return (
              <button key={family.id} className="family-card" onClick={() => onSelect(entryById.get(family.root)!)}>
                <div className="family-card__top">
                  <span className="family-card__code" style={{ color: family.color }}>{family.code}</span>
                  <span className="family-card__count">{familyEntries.filter((entry) => entry.researchState === "reviewed").length}/{familyEntries.length} проверено</span>
                </div>
                <strong>{family.name}</strong><p>{family.short}</p>
                <div className="family-card__line" style={{ backgroundColor: family.color }} />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DetailView({
  entry,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  onCompare,
  inCompare,
  onOpenGlossary,
}: {
  entry: AtlasEntry;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSelect: (entry: AtlasEntry) => void;
  onCompare: () => void;
  inCompare: boolean;
  onOpenGlossary: () => void;
}) {
  const family = getFamily(entry.family);
  const lineage = getLineage(entry).filter((node) => node.id !== entry.id);
  const children = getChildren(entry.id);
  const related = entry.related.map((id) => entryById.get(id)).filter(Boolean) as AtlasEntry[];
  const canonical = entry.canonicalId ? entryById.get(entry.canonicalId) : undefined;
  const [tab, setTab] = useState<DetailTab>("quick");

  const reportIssue = async () => {
    const template = `Карточка: ${entry.name}\nЧто неточно:\nИсточник или пример:\nКак лучше исправить:`;
    try { await navigator.clipboard.writeText(template); } catch { /* Браузер всё равно откроет тему. */ }
    window.open("https://t.me/RAPATLAS/31", "_blank", "noopener,noreferrer");
  };

  return (
    <article className="detail-view">
      <div className="detail-hero" style={{ borderTopColor: family.color }}>
        <div className="detail-hero__meta">
          <FamilyMark familyId={entry.family} />
          <div className="badge-row"><EntityBadge kind={entry.entityKind} /><MaturityBadge entry={entry} /><ResearchBadge entry={entry} /></div>
        </div>
        <div className="detail-hero__title-row">
          <div>
            <h1>{entry.name}</h1>
            {entry.aliases.length > 0 && <p className="aliases">Также: {entry.aliases.join(" · ")}</p>}
          </div>
          <div className="detail-actions">
            <button className={cn("icon-button", isBookmarked && "icon-button--active")} onClick={onToggleBookmark} title={isBookmarked ? "Убрать из избранного" : "Сохранить в избранное"}>
              {isBookmarked ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
            </button>
            <button className={cn("icon-button", inCompare && "icon-button--active")} onClick={onCompare} title={inCompare ? "Убрать из сравнения" : "Добавить в сравнение"}>
              <GitCompareArrows size={19} />
            </button>
          </div>
        </div>
        <p className="detail-summary">{entry.summary}</p>
        <div className={cn("audit-verdict", entry.researchState === "legacy" && "audit-verdict--legacy")}>
          <span>{entry.researchState === "reviewed" ? "Что означает это название" : "Статус карточки"}</span>
          <p>{entry.verdict}</p>
          {canonical && <button onClick={() => onSelect(canonical)}>Открыть основную карточку: {canonical.name} <ArrowRight size={14} /></button>}
        </div>
      </div>

      {lineage.length > 0 && (
        <div className="lineage-strip" aria-label="Происхождение">
          <span>Откуда выросло</span>
          {lineage.map((node, index) => (
            <div key={node.id} className="lineage-node">
              {index > 0 && <ChevronRight size={13} />}
              <button onClick={() => onSelect(node)}>{node.name}</button>
            </div>
          ))}
        </div>
      )}

      <div className="detail-tabs" role="tablist" aria-label="Уровень подробности">
        <button className={tab === "quick" ? "active" : ""} onClick={() => setTab("quick")}><Ear size={16} /><span><b>Коротко</b><small>понять за полминуты</small></span></button>
        <button className={tab === "producer" ? "active" : ""} onClick={() => setTab("producer")}><SlidersHorizontal size={16} /><span><b>Продюсеру</b><small>бас, драмка и микс</small></span></button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}><BookOpen size={16} /><span><b>История и связи</b><small>название и источники</small></span></button>
      </div>

      {entry.researchState === "legacy" && (
        <div className="legacy-notice">
          <FileWarning size={20} />
          <div><strong>Эта карточка ещё не проверена подробно</strong><p>Мы сохранили её из первой версии. Описание, история и параметры звука пока общие для всей ветки и могут быть неточными.</p></div>
        </div>
      )}

      {tab === "quick" && (
        <>
          <section className="detail-section">
            <div className="section-heading section-heading--compact"><div><span className="section-kicker">Три главных признака</span><h2>Что слушать в первую очередь</h2></div></div>
            {entry.listenFor.length ? (
              <div className="listening-grid">
                {entry.listenFor.slice(0, 3).map((marker, index) => <div key={marker}><span>0{index + 1}</span><p>{marker}</p></div>)}
              </div>
            ) : <p className="data-gap">У этой старой карточки ещё нет собственного набора слышимых признаков.</p>}
          </section>

          <section className="detail-section">
            <div className="section-heading section-heading--compact"><div><span className="section-kicker">По звуку</span><h2>Быстрый разбор</h2></div></div>
            <div className="character-grid">
              <div className="character-card"><span>НИЗ</span><h3>Бас / 808</h3><p>{entry.bass}</p></div>
              <div className="character-card"><span>БАРАБАНЫ</span><h3>Драмка</h3><p>{entry.drums}</p></div>
              <div className="character-card"><span>НАСТРОЕНИЕ</span><h3>Общее ощущение</h3><p>{entry.mood}</p></div>
              <div className="character-card"><span>ТЕМП</span><h3>Скорость</h3><p>{entry.tempo}</p></div>
            </div>
          </section>

          <section className="detail-section boundary-section">
            <div><span className="section-kicker">Главное отличие</span><h2>С чем чаще всего путают</h2></div>
            {entry.confusions.length ? entry.confusions.map((item) => <p key={item}>{item}</p>) : <p>Границы ещё не разобраны.</p>}
          </section>

          <section className="detail-section">
            <div className="section-heading section-heading--compact"><div><span className="section-kicker">Примеры для знакомства</span><h2>Треки и что в них слушать</h2></div></div>
            {entry.examples.length ? (
              <div className="example-list">{entry.examples.map((example) => <div key={`${example.artist}-${example.title}`}><span>{example.role}</span><strong>{example.artist} — {example.title}</strong><p>{example.listenFor}</p></div>)}</div>
            ) : (
              <div className="corpus-pending"><Music2 size={20} /><div><strong>Примеры треков ещё нужно проверить на слух</strong><p>Название и история уже проверены. Случайные треки добавлять не будем: примеры появятся после отдельного прослушивания.</p></div></div>
            )}
          </section>
        </>
      )}

      {tab === "producer" && (
        <>
          <div className="rules-notice"><Info size={17} /><p>Так делают часто, но не в каждом треке. Один пресет или один рисунок ударных ещё не создаёт отдельный жанр.</p></div>
          <section className="detail-section producer-matrix">
            <div className="producer-matrix__main">
              <div><span>БАС / 808</span><p>{entry.bass}</p></div>
              <div><span>ДРАМКА</span><p>{entry.drums}</p></div>
              <div><span>ТЕМП</span><p>{entry.tempo}</p></div>
              <div><span>ПЕРИОД</span><p>{entry.era}</p></div>
            </div>
            <div className="producer-profile"><span className="section-kicker">Профиль звука</span><ProfileBars entry={entry} /></div>
          </section>
          <section className="detail-section">
            <div className="section-heading section-heading--compact"><div><span className="section-kicker">Рабочие заметки</span><h2>Как подойти к биту</h2></div></div>
            {entry.production.length ? <ol className="production-list">{entry.production.map((note) => <li key={note}>{note}</li>)}</ol> : <p className="data-gap">Технический разбор появится после подробной проверки этой карточки.</p>}
          </section>
          <section className="detail-section glossary-strip">
            <div><span className="section-kicker">Термины из карточки</span><h2>Не уверен в слове?</h2></div>
            <div>{Object.keys(glossary).map((term) => <button key={term} onClick={onOpenGlossary}>{term}<CircleHelp size={13} /></button>)}</div>
          </section>
        </>
      )}

      {tab === "history" && (
        <>
          <section className="detail-section history-card">
            <span className="section-kicker">Почему это так называется</span><h2>История термина</h2><p>{entry.history}</p>
          </section>
          <section className="detail-section evidence-grid">
            <div><span className="section-kicker">Что обозначает название</span><strong>{entityKindLabels[entry.entityKind]}</strong><p>{entry.verdict}</p></div>
            <div><span className="section-kicker">Насколько часто его используют</span><strong>{maturityLabels[entry.maturity].label}</strong><p>{maturityLabels[entry.maturity].note}</p></div>
            <div><span className="section-kicker">Насколько хорошо это проверено</span><strong>{confidenceLabels[entry.confidence].label}</strong><p>{confidenceLabels[entry.confidence].note}</p></div>
            <div><span className="section-kicker">Проверка</span><strong>{entry.reviewedAt ?? "Ещё не проводилась"}</strong><p>{entry.researchBatch ?? "Карточка находится в очереди."}</p></div>
          </section>

          {entry.relationNotes.length > 0 && (
            <section className="detail-section"><div className="section-heading section-heading--compact"><div><span className="section-kicker">Почему карточка находится здесь</span><h2>Связи с другими направлениями</h2></div></div>
              <div className="relation-notes">{entry.relationNotes.map((relation, index) => {
                const target = entryById.get(relation.target);
                return <button key={`${relation.target}-${index}`} disabled={!target} onClick={() => target && onSelect(target)}><span>{relationTypeLabels[relation.type]}</span><strong>{target?.name ?? relation.target}</strong><p>{relation.note}</p></button>;
              })}</div>
            </section>
          )}

          <section className="detail-section">
            <div className="section-heading section-heading--compact"><div><span className="section-kicker">На чём основана карточка</span><h2>Источники</h2></div><span className="section-count">{entry.sources.length}</span></div>
            {entry.sources.length ? <div className="source-list">{entry.sources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><strong>{source.label}</strong><ExternalLink size={14} /></a>)}</div> : <p className="data-gap">Источников пока нет. Поэтому историю этой карточки ещё нельзя считать подтверждённой.</p>}
          </section>
        </>
      )}

      {(entry.artists.length > 0 || entry.producers.length > 0) && (
        <section className="detail-section people-section">
          {entry.artists.length > 0 && (
            <div>
              <span className="section-kicker">Кого слушать</span>
              <div className="chip-list">{entry.artists.map((artist) => <span className="chip" key={artist}>{artist}</span>)}</div>
            </div>
          )}
          {entry.producers.length > 0 && (
            <div>
              <span className="section-kicker">Продюсеры</span>
              <div className="chip-list">{entry.producers.map((producer) => <span className="chip chip--producer" key={producer}>{producer}</span>)}</div>
            </div>
          )}
        </section>
      )}

      {children.length > 0 && (
        <section className="detail-section">
          <div className="section-heading section-heading--compact">
            <div><span className="section-kicker">Внутри этого направления</span><h2>Что входит в эту ветку</h2></div>
            <span className="section-count">{children.length}</span>
          </div>
          <div className="child-grid">
            {children.map((child) => (
              <button key={child.id} className="child-card" onClick={() => onSelect(child)}>
                <span className={`child-card__symbol child-card__symbol--${child.status}`}>{statusSymbol[child.status]}</span>
                <span><strong>{child.name}</strong><small>{child.summary}</small></span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="detail-section">
          <div className="section-heading section-heading--compact">
            <div><span className="section-kicker">Связи</span><h2>Что послушать рядом</h2></div>
          </div>
          <div className="related-list">
            {related.map((item) => {
              const relatedFamily = getFamily(item.family);
              return (
                <button key={item.id} onClick={() => onSelect(item)}>
                  <span className="related-dot" style={{ backgroundColor: relatedFamily.color }} />
                  <span><strong>{item.name}</strong><small>{relatedFamily.name}</small></span>
                  <ArrowRight size={15} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      <footer className="entry-footer">
        <div>
          <ResearchBadge entry={entry} />
          <p>{entry.researchState === "reviewed" ? `Проверено: ${entry.reviewedAt}. ${entry.needsListeningCheck ? "Примеры треков ещё нужно проверить на слух." : "Примеры треков проверены."}` : "Эту карточку ещё нужно проверить отдельно."}</p>
        </div>
        <button className="report-button" onClick={reportIssue}><MessageSquareWarning size={15} /> Сообщить о неточности</button>
      </footer>
    </article>
  );
}

function ContextRail({ entry, recent, onSelect }: { entry: AtlasEntry | null; recent: string[]; onSelect: (entry: AtlasEntry) => void }) {
  if (!entry) {
    return (
      <aside className="context-rail">
        <div className="rail-block">
          <span className="section-kicker">Как читать атлас</span>
          <div className="axis-guide">
            <div><EntityBadge kind="genre" /><p><strong>Что это?</strong><small>Жанр, сцена, школа, тег, техника или релиз.</small></p></div>
            <div><span className="axis-guide__mark">M</span><p><strong>Насколько часто так говорят?</strong><small>От общего названия до редкого тега.</small></p></div>
            <div><span className="axis-guide__mark">C</span><p><strong>Насколько хорошо проверено?</strong><small>Показываем, сколько надёжных подтверждений удалось найти.</small></p></div>
          </div>
        </div>
        <div className="rail-block rail-note">
          <Info size={17} />
          <p>Одно название иногда используют по-разному. Атлас показывает эти варианты и объясняет, почему карточка стоит именно здесь.</p>
        </div>
      </aside>
    );
  }

  const recentEntries = recent.map((id) => entryById.get(id)).filter((item): item is AtlasEntry => Boolean(item) && item!.id !== entry.id).slice(0, 4);
  return (
    <aside className="context-rail">
      <div className="rail-block">
        <span className="section-kicker">Профиль звука</span>
        <h3>{entry.name}</h3>
        <ProfileBars entry={entry} />
      </div>
      <div className="rail-block facts-list">
        <div><span>Период</span><strong>{entry.era}</strong></div>
        <div><span>Большая ветка</span><strong>{getFamily(entry.family).name}</strong></div>
        <div><span>Тип</span><strong>{entityKindLabels[entry.entityKind]}</strong></div>
        <div><span>Термин</span><strong>{maturityLabels[entry.maturity].label}</strong></div>
        <div><span>Уверенность</span><strong>{confidenceLabels[entry.confidence].label}</strong></div>
      </div>
      {entry.tags.length > 0 && (
        <div className="rail-block">
          <span className="section-kicker">Метки</span>
          <div className="tag-cloud">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </div>
      )}
      {recentEntries.length > 0 && (
        <div className="rail-block">
          <span className="section-kicker">Недавно смотрел</span>
          <div className="recent-list">
            {recentEntries.map((item) => <button key={item.id} onClick={() => onSelect(item)}>{item.name}<ArrowRight size={13} /></button>)}
          </div>
        </div>
      )}
    </aside>
  );
}

function FinderView({ onSelect }: { onSelect: (entry: AtlasEntry) => void }) {
  const [focus, setFocus] = useState<string[]>(["bass"]);
  const [bass, setBass] = useState<string[]>([]);
  const [rhythm, setRhythm] = useState<string[]>([]);
  const [melody, setMelody] = useState<string[]>([]);
  const [energy, setEnergy] = useState(3);
  const [space, setSpace] = useState(3);
  const [distortion, setDistortion] = useState(2);
  const [reference, setReference] = useState("");
  const [reviewedOnly, setReviewedOnly] = useState(true);
  const [showDisputed, setShowDisputed] = useState(false);

  const reset = () => {
    setFocus(["bass"]); setBass([]); setRhythm([]); setMelody([]);
    setEnergy(3); setSpace(3); setDistortion(2); setReference("");
  };

  const results = useMemo(() => {
    const maps: Record<string, string[]> = {
      short: ["коротк", "short", "импульс"], long: ["длин", "long", "хвост"], clean: ["чист", "саб", "soft"],
      distorted: ["перегруз", "клип", "искаж", "distort"], slides: ["slide", "скольз"], lead: ["как лид", "формант", "визж", "бульк"], barely: ["едва", "тих", "barely"],
      sparse: ["редк", "пуст", "пау", "sparse"], dense: ["плотн", "част", "dense"], broken: ["ломан", "сбив", "stop-start", "неров"],
      club: ["club", "jersey", "клуб", "прямой боч"], swing: ["swing", "смещ"], bounce: ["bounce", "баунс", "пруж"], straight: ["прям", "four-on"], beatless: ["без удар", "драмки нет", "near-beatless"],
      chords: ["аккорд", "гармони", "r&b", "gospel"], loop: ["луп", "loop", "plack", "плак"], sample: ["сэмпл", "sample", "вокальн нарез"],
      drone: ["дрон", "пэд", "pad", "протяж"], minimal: ["мелодии нет", "почти отсутств", "один тон"], bright: ["ярк", "колоколь", "плак"], dark: ["тём", "мрач", "диссон"],
    };
    const optionLabel = new Map([...bassOptions, ...rhythmOptions, ...melodyOptions].map((option) => [option.id, option.label.toLowerCase()]));
    const referenceLower = reference.trim().toLowerCase();
    const scored = entries
      .filter((entry) => (!reviewedOnly || entry.researchState === "reviewed"))
      .filter((entry) => showDisputed || (entry.maturity !== "disputed" && entry.maturity !== "unconfirmed"))
      .map((entry) => {
        let score = 24 - Math.abs(entry.profile.energy - energy) * 3 - Math.abs(entry.profile.ambience - space) * 2 - Math.abs(entry.profile.distortion - distortion) * 2;
        const text = `${entry.name} ${entry.summary} ${entry.signature} ${entry.bass} ${entry.drums} ${entry.mood} ${entry.listenFor.join(" ")} ${entry.production.join(" ")} ${entry.tags.join(" ")} ${entry.artists.join(" ")} ${entry.producers.join(" ")}`.toLowerCase();
        const reasons: string[] = [];
        const selected = [...bass, ...rhythm, ...melody];
        for (const choice of selected) {
          const hits = (maps[choice] ?? []).filter((word) => text.includes(word)).length;
          if (hits > 0) { score += 7 + hits * 2; reasons.push(optionLabel.get(choice) ?? choice); }
          else score -= 2;
        }
        if (focus.includes("bass")) { score += entry.profile.bassWeight * 2; reasons.push("выразительный низ"); }
        if (focus.includes("drums")) { score += entry.profile.bounce * 2; reasons.push("характерная драмка"); }
        if (focus.includes("melody")) { score += entry.profile.ambience * 2; reasons.push("мелодия заметнее остальных слоёв"); }
        if (focus.includes("vocals") && (entry.artists.length || text.includes("вокал"))) { score += 7; reasons.push("характерный вокал"); }
        if (referenceLower && text.includes(referenceLower)) { score += 25; reasons.unshift(`референс «${reference.trim()}»`); }
        return { entry, score, reasons: [...new Set(reasons)].slice(0, 3) };
      })
      .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
    return scored.slice(0, 12);
  }, [focus, bass, rhythm, melody, energy, space, distortion, reference, reviewedOnly, showDisputed]);

  return (
    <div className="finder-view">
      <section className="finder-hero">
        <span className="section-kicker">Подбор по звуку</span>
        <h1>Что ты реально слышишь?</h1>
        <p>Можно выбрать несколько вариантов. Название жанра знать не нужно — атлас объяснит каждое предложение обычными слышимыми признаками.</p>
      </section>
      <div className="finder-layout">
        <div className="finder-controls">
          <MultiChoiceGroup title="1. Что важнее?" options={focusOptions} values={focus} onChange={setFocus} />
          <MultiChoiceGroup title="2. Как звучит бас?" options={bassOptions} values={bass} onChange={setBass} />
          <MultiChoiceGroup title="3. Какая драмка?" options={rhythmOptions} values={rhythm} onChange={setRhythm} />
          <MultiChoiceGroup title="4. Какая мелодия?" options={melodyOptions} values={melody} onChange={setMelody} />
          <div className="choice-group">
            <div className="choice-group__title"><span>Тонкая настройка</span><button onClick={reset}><RotateCcw size={12} /> Сбросить</button></div>
            <RangeControl label="Энергия" value={energy} onChange={setEnergy} left="спокойно" right="жёстко" />
            <RangeControl label="Ширина и реверб" value={space} onChange={setSpace} left="сухо" right="широко" />
            <RangeControl label="Перегруз" value={distortion} onChange={setDistortion} left="чисто" right="грязно" />
          </div>
          <div className="choice-group reference-field">
            <div className="choice-group__title"><span>Референс — необязательно</span></div>
            <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Артист, продюсер или трек" />
          </div>
          <div className="finder-switches">
            <label><input type="checkbox" checked={reviewedOnly} onChange={(event) => setReviewedOnly(event.target.checked)} /> Только проверенные ({reviewedTotal})</label>
            <label><input type="checkbox" checked={showDisputed} onChange={(event) => setShowDisputed(event.target.checked)} /> Показывать спорные теги</label>
          </div>
        </div>
        <div className="finder-results">
          <div className="section-heading section-heading--compact">
            <div><span className="section-kicker">Без выдуманных процентов</span><h2>{results.length} ближайших вариантов</h2></div>
          </div>
          {results.map(({ entry, score, reasons }, index) => {
            const family = getFamily(entry.family);
            const band = score >= 45 ? "Очень близко" : score >= 30 ? "Похоже" : "Стоит проверить";
            return (
              <button key={entry.id} className="finder-result" onClick={() => onSelect(entry)}>
                <span className="finder-result__rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="finder-result__main">
                  <span className="finder-result__meta"><span style={{ color: family.color }}>{family.name}</span><span>{entityKindLabels[entry.entityKind]}</span>{entry.researchState === "reviewed" && <BadgeCheck size={11} />}</span>
                  <strong>{entry.name}</strong>
                  <small>Предложили из-за: {reasons.length ? reasons.join(", ") : entry.signature.toLowerCase()}.</small>
                  <em>Может не подойти: {(entry.confusions[0] ?? "границы этой карточки ещё не разобраны").toLowerCase()}</em>
                </span>
                <span className="finder-result__band">{band}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MultiChoiceGroup({ title, options, values, onChange }: { title: string; options: Array<{ id: string; label: string }>; values: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="choice-group">
      <div className="choice-group__title"><span>{title}</span></div>
      <div className="choice-options">
        {options.map((option) => (
          <button key={option.id} className={values.includes(option.id) ? "active" : ""} onClick={() => onChange(values.includes(option.id) ? values.filter((id) => id !== option.id) : [...values, option.id])}>{option.label}</button>
        ))}
      </div>
    </div>
  );
}

function RangeControl({ label, value, onChange, left, right }: { label: string; value: number; onChange: (value: number) => void; left: string; right: string }) {
  return <label className="range-control"><span><b>{label}</b><em>{value}/5</em></span><input aria-label={label} type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} /><small><i>{left}</i><i>{right}</i></small></label>;
}

function BookmarksView({ ids, onSelect }: { ids: string[]; onSelect: (entry: AtlasEntry) => void }) {
  const saved = ids.map((id) => entryById.get(id)).filter(Boolean) as AtlasEntry[];
  return (
    <div className="collection-view">
      <div className="collection-heading"><BookmarkCheck size={24} /><div><span className="section-kicker">Сохранённое</span><h1>Избранное</h1></div></div>
      {saved.length ? (
        <div className="collection-grid">
          {saved.map((entry) => {
            const family = getFamily(entry.family);
            return (
              <button key={entry.id} className="collection-card" onClick={() => onSelect(entry)} style={{ borderTopColor: family.color }}>
                <FamilyMark familyId={entry.family} />
                <strong>{entry.name}</strong>
                <p>{entry.signature}</p>
                <div className="badge-stack"><EntityBadge kind={entry.entityKind} /><MaturityBadge entry={entry} /></div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><Bookmark size={30} /><h2>Пока ничего не сохранено</h2><p>Открой карточку и нажми на закладку.</p></div>
      )}
    </div>
  );
}

function CompareView({ ids, onSelect, onRemove }: { ids: string[]; onSelect: (entry: AtlasEntry) => void; onRemove: (id: string) => void }) {
  const compared = ids.map((id) => entryById.get(id)).filter(Boolean) as AtlasEntry[];
  return (
    <div className="compare-view">
      <div className="collection-heading"><Columns3 size={24} /><div><span className="section-kicker">По пунктам</span><h1>Сравнение</h1></div></div>
      {compared.length >= 2 ? (
        <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${compared.length}, minmax(0, 1fr))` }}>
          {compared.map((entry) => {
            const family = getFamily(entry.family);
            return (
              <article className="compare-card" key={entry.id} style={{ borderTopColor: family.color }}>
                <button className="compare-remove" onClick={() => onRemove(entry.id)} title="Убрать из сравнения"><X size={15} /></button>
                <FamilyMark familyId={entry.family} />
                <button className="compare-title" onClick={() => onSelect(entry)}>{entry.name}</button>
                <div className="badge-stack"><EntityBadge kind={entry.entityKind} /><MaturityBadge entry={entry} /></div>
                <section className="compare-differences">
                  <span className="section-kicker">Сначала различия</span>
                  <div className="compare-fact"><span>Как узнать</span><p>{entry.signature}</p></div>
                  <div className="compare-fact"><span>Бас</span><p>{entry.bass}</p></div>
                  <div className="compare-fact"><span>Драмка</span><p>{entry.drums}</p></div>
                  <div className="compare-fact"><span>Граница</span><p>{entry.confusions[0] ?? "Ещё не проверена."}</p></div>
                </section>
                <details className="compare-common">
                  <summary>Показать остальные параметры</summary>
                  <ProfileBars entry={entry} compact />
                  <div className="compare-fact"><span>Настроение</span><p>{entry.mood}</p></div>
                  <div className="compare-fact"><span>Темп</span><p>{entry.tempo}</p></div>
                  <div className="compare-fact"><span>Период</span><p>{entry.era}</p></div>
                </details>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><GitCompareArrows size={30} /><h2>Добавь хотя бы две карточки</h2><p>Кнопка сравнения находится справа от названия. Одновременно можно сравнить три направления.</p></div>
      )}
    </div>
  );
}

function GuideView({ onEditor }: { onEditor: () => void }) {
  const axes = [
    { title: "Что обозначает название?", text: "Это может быть жанр, круг артистов, стиль продюсеров, смесь двух направлений или просто тег для поиска." },
    { title: "Насколько часто так говорят?", text: "От общего названия, которым пользуются многие, до редкого молодого тега." },
    { title: "Насколько хорошо это проверено?", text: "Смотрим, есть ли надёжные источники, примеры музыки и использование названия самими участниками." },
  ];
  return (
    <div className="guide-view">
      <section className="guide-hero"><span className="section-kicker">Как работает RAP ATLAS 2.0</span><h1>Сразу видно,<br />что перед тобой.</h1><p>Одно слово может означать жанр, круг артистов или просто тег для поиска. Мы показываем это отдельно. Дерево помогает найти направление, а карточка простыми словами объясняет его место в музыке.</p></section>
      <section className="detail-section"><div className="section-heading"><div><span className="section-kicker">Три простых вопроса</span><h2>Одной плашки «статус» было недостаточно</h2></div></div><div className="method-axis-grid">{axes.map((axis, index) => <div key={axis.title}><span>0{index + 1}</span><h3>{axis.title}</h3><p>{axis.text}</p></div>)}</div></section>
      <section className="detail-section guide-process"><div><span className="section-kicker">Как проходит проверка</span><h2>Что мы делаем перед публикацией карточки</h2></div><ol><li><strong>Проверяем название</strong><p>Выясняем, кто так говорит, когда появилось слово и не изменился ли его смысл.</p></li><li><strong>Подбираем треки</strong><p>Берём ранние, основные, новые и пограничные примеры. Отдельно отмечаем треки, которые сюда относят ошибочно.</p></li><li><strong>Слушаем по одному плану</strong><p>Проверяем ритм, ударные, бас, мелодию, вокал, построение трека и микс.</p></li><li><strong>Сравниваем с соседями</strong><p>Показываем, что у направлений общего и какое отличие действительно слышно.</p></li><li><strong>Решение проверяет человек</strong><p>ИИ помогает искать материалы, но не решает сам, что считать жанром.</p></li></ol></section>
      <section className="detail-section source-priority"><div><span className="section-kicker">Каким источникам верим больше</span><h2>Сначала участники сцены, потом чужие пересказы</h2></div><div><p><b>1.</b> Интервью артистов и продюсеров, их страницы и первые загрузки.</p><p><b>2.</b> Материалы музыкальных изданий.</p><p><b>3.</b> Музыкальные каталоги и базы.</p><p><b>4.</b> Reddit, TikTok, YouTube и BeatStars показывают, что слово используют. Но одной такой ссылки мало, чтобы доказать историю жанра.</p></div></section>
      <section className="detail-section editor-invite"><Database size={28} /><div><span className="section-kicker">Для следующих партий по 25</span><h2>Внутренний редактор уже готов</h2><p>Заполняешь карточку в форме, сразу видишь пробелы и копируешь готовый объект для базы.</p></div><button className="button button--primary" onClick={onEditor}>Открыть редактор <ArrowRight size={16} /></button></section>
    </div>
  );
}

type EditorDraft = {
  id: string;
  name: string;
  summary: string;
  entityKind: EntityKind;
  maturity: AtlasEntry["maturity"];
  confidence: AtlasEntry["confidence"];
  verdict: string;
  history: string;
  listenFor: string;
  production: string;
  sources: string;
};

const emptyDraft: EditorDraft = { id: "", name: "", summary: "", entityKind: "microgenre", maturity: "local", confidence: "medium", verdict: "", history: "", listenFor: "", production: "", sources: "" };

function EditorView() {
  const [draft, setDraft] = useState<EditorDraft>(emptyDraft);
  const [copied, setCopied] = useState(false);
  const update = <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
  const missing = [
    !draft.id && "ID",
    !draft.name && "название",
    !draft.summary && "короткое объяснение",
    lines(draft.listenFor).length < 3 && "три слышимых признака",
    lines(draft.production).length < 2 && "продюсерские заметки",
    !draft.history && "история термина",
    lines(draft.sources).length === 0 && "источники",
  ].filter(Boolean) as string[];
  const output = JSON.stringify({
    id: draft.id.trim(), name: draft.name.trim(), summary: draft.summary.trim(), entityKind: draft.entityKind,
    maturity: draft.maturity, confidence: draft.confidence, verdict: draft.verdict.trim(), history: draft.history.trim(),
    listenFor: lines(draft.listenFor), production: lines(draft.production),
    sources: lines(draft.sources).map((url) => ({ label: "Уточнить подпись", url })),
  }, null, 2);
  const copy = async () => { try { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } };
  return (
    <div className="editor-view">
      <section className="editor-hero"><span className="section-kicker">Работает только на этом компьютере</span><h1>Черновик карточки</h1><p>Форма ничего не публикует. Она помогает заполнить все поля одинаково и подготовить данные к ручной проверке.</p></section>
      <div className="editor-layout">
        <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
          <div className="editor-row"><label>ID<input value={draft.id} onChange={(event) => update("id", event.target.value)} placeholder="lowercase-with-dashes" /></label><label>Название<input value={draft.name} onChange={(event) => update("name", event.target.value)} /></label></div>
          <label>Что это одной фразой<textarea value={draft.summary} onChange={(event) => update("summary", event.target.value)} rows={3} /></label>
          <div className="editor-row"><label>Что это<select value={draft.entityKind} onChange={(event) => update("entityKind", event.target.value as EntityKind)}>{Object.entries(entityKindLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label><label>Как часто используют название<select value={draft.maturity} onChange={(event) => update("maturity", event.target.value as AtlasEntry["maturity"])}>{Object.entries(maturityLabels).filter(([id]) => id !== "unreviewed").map(([id, item]) => <option value={id} key={id}>{item.label}</option>)}</select></label><label>Насколько хорошо проверено<select value={draft.confidence} onChange={(event) => update("confidence", event.target.value as AtlasEntry["confidence"])}>{Object.entries(confidenceLabels).filter(([id]) => id !== "unreviewed").map(([id, item]) => <option value={id} key={id}>{item.label}</option>)}</select></label></div>
          <label>Куда поставить карточку и почему<textarea value={draft.verdict} onChange={(event) => update("verdict", event.target.value)} rows={3} /></label>
          <label>История названия<textarea value={draft.history} onChange={(event) => update("history", event.target.value)} rows={5} /></label>
          <div className="editor-row"><label>Что слушать — по строке на признак<textarea value={draft.listenFor} onChange={(event) => update("listenFor", event.target.value)} rows={6} placeholder={"длинный чистый саб\nредкий сухой клэп\nпэд меняется медленно"} /></label><label>Продюсеру — по строке на заметку<textarea value={draft.production} onChange={(event) => update("production", event.target.value)} rows={6} /></label></div>
          <label>Источники — по одной ссылке на строку<textarea value={draft.sources} onChange={(event) => update("sources", event.target.value)} rows={5} /></label>
        </form>
        <aside className="editor-preview">
          <div className={cn("completion-card", missing.length === 0 && "completion-card--ready")}><span>{missing.length === 0 ? <ShieldCheck size={20} /> : <ListFilter size={20} />}</span><div><strong>{missing.length === 0 ? "Основные поля заполнены" : `Осталось: ${missing.length}`}</strong>{missing.length > 0 && <ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul>}</div></div>
          <pre>{output}</pre>
          <button className="button button--primary" onClick={copy}>{copied ? "Скопировано" : "Скопировать готовые данные"}</button>
          <button className="button button--ghost" onClick={() => setDraft(emptyDraft)}>Очистить форму</button>
        </aside>
      </div>
    </div>
  );
}

export default function AtlasApp() {
  const [view, setView] = useState<ViewMode>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<FamilyId>>(new Set(["plugg"]));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["plugg", "pluggnb", "ambient-plugg", "dark-plugg"]));
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);
  const [bookmarks, setBookmarks] = useStoredList("bookmarks", "rap-atlas-bookmarks");
  const [recent, setRecent] = useStoredList("recent", "rap-atlas-recent");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [scope, setScope] = useState<KnowledgeScope>("all");
  const [showDisputed, setShowDisputed] = useState(true);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = selectedId ? entryById.get(selectedId) ?? null : null;
  const visibleIds = useMemo(() => {
    const visible = new Set<string>();
    entries.forEach((entry) => {
      const inScope = scope === "all" || entry.researchState === "reviewed";
      const allowed = showDisputed || (entry.maturity !== "disputed" && entry.maturity !== "unconfirmed");
      if (inScope && allowed) {
        visible.add(entry.id);
        getLineage(entry).forEach((node) => visible.add(node.id));
      }
    });
    return visible;
  }, [scope, showDisputed]);

  const searchResults = useMemo(
    () => searchEntries(query).filter(({ entry }) =>
      (scope === "all" || entry.researchState === "reviewed") &&
      (showDisputed || (entry.maturity !== "disputed" && entry.maturity !== "unconfirmed"))),
    [query, scope, showDisputed],
  );

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/__state?key=theme", { cache: "no-store" });
        if (response.ok) {
          const stored = await response.json();
          if (!cancelled && stored === "light") setTheme("light");
        } else if (!cancelled && window.localStorage.getItem("rap-atlas-theme") === "light") {
          setTheme("light");
        }
      } catch {
        if (!cancelled && window.localStorage.getItem("rap-atlas-theme") === "light") setTheme("light");
      }
      if (!cancelled) setThemeReady(true);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const genre = hash.get("genre");
      if (genre && entryById.has(genre)) {
        const entry = entryById.get(genre)!;
        setSelectedId(genre);
        setView("home");
        setExpandedFamilies(new Set([entry.family]));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const body = JSON.stringify(theme);
    fetch("/__state?key=theme", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).then((response) => {
      if (response.ok) window.localStorage.removeItem("rap-atlas-theme");
      else window.localStorage.setItem("rap-atlas-theme", theme);
    }).catch(() => window.localStorage.setItem("rap-atlas-theme", theme));
  }, [theme, themeReady]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const selectEntry = (entry: AtlasEntry, pushHistory = true) => {
    setSelectedId(entry.id);
    setView("home");
    setQuery("");
    setNavOpen(false);
    setExpandedFamilies((current) => new Set(current).add(entry.family));
    setExpandedNodes((current) => {
      const next = new Set(current);
      getLineage(entry).forEach((node) => next.add(node.id));
      return next;
    });
    setRecent((current) => [entry.id, ...current.filter((id) => id !== entry.id)].slice(0, 12));
    window.history.replaceState(null, "", `#genre=${entry.id}`);
    if (pushHistory) {
      const nextHistory = [...history.slice(0, historyIndex + 1), entry.id].slice(-40);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHistory = (direction: -1 | 1) => {
    const nextIndex = historyIndex + direction;
    if (nextIndex < 0 || nextIndex >= history.length) return;
    const entry = entryById.get(history[nextIndex]);
    if (!entry) return;
    setHistoryIndex(nextIndex);
    selectEntry(entry, false);
  };

  const showView = (next: ViewMode) => {
    setView(next);
    setSelectedId(null);
    setQuery("");
    setNavOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const randomEntry = () => {
    const pool = entries.filter((entry) => visibleIds.has(entry.id) && entry.status !== "misnomer" && entry.id !== selectedId);
    selectEntry(pool[Math.floor(Math.random() * pool.length)]);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return [...current.slice(1), id];
      return [...current, id];
    });
  };

  return (
    <AtlasShell
      theme={theme}
      navOpen={navOpen}
      view={view}
      isHomeActive={view === "home" && !selected}
      reviewedTotal={reviewedTotal}
      entryTotal={entries.length}
      bookmarksCount={bookmarks.length}
      compareCount={compareIds.length}
      searchContent={
        <GlobalSearch
          query={query}
          results={searchResults}
          inputRef={searchRef}
          entityKindLabels={entityKindLabels}
          maturityLabels={maturityLabels}
          statusSymbol={statusSymbol}
          getFamily={getFamily}
          onQueryChange={setQuery}
          onClear={() => setQuery("")}
          onSelect={selectEntry}
        />
      }
      navigationContent={
        <GenreTree
          entries={entries}
          families={families}
          entryById={entryById}
          getChildren={getChildren}
          reviewedTotal={reviewedTotal}
          scope={scope}
          showDisputed={showDisputed}
          visibleIds={visibleIds}
          selectedId={selectedId}
          selectedFamilyId={selected?.family}
          expandedFamilies={expandedFamilies}
          expandedNodes={expandedNodes}
          onScopeChange={setScope}
          onShowDisputedChange={setShowDisputed}
          onExpandedFamiliesChange={setExpandedFamilies}
          onExpandedNodesChange={setExpandedNodes}
          onSelect={selectEntry}
        />
      }
      mainContent={
        <main className="atlas-main">
          {selected && (
            <div className="history-controls">
              <button onClick={() => goHistory(-1)} disabled={historyIndex <= 0} title="Назад"><ArrowLeft size={16} /></button>
              <button onClick={() => goHistory(1)} disabled={historyIndex < 0 || historyIndex >= history.length - 1} title="Вперёд"><ArrowRight size={16} /></button>
              <span>{getFamily(selected.family).code} / {selected.name}</span>
            </div>
          )}
          {view === "finder" ? (
            <FinderView onSelect={selectEntry} />
          ) : view === "bookmarks" ? (
            <BookmarksView ids={bookmarks} onSelect={selectEntry} />
          ) : view === "compare" ? (
            <CompareView ids={compareIds} onSelect={selectEntry} onRemove={(id) => toggleCompare(id)} />
          ) : view === "guide" ? (
            <GuideView onEditor={() => showView("editor")} />
          ) : view === "editor" ? (
            <EditorView />
          ) : selected ? (
            <DetailView
              key={selected.id}
              entry={selected}
              isBookmarked={bookmarks.includes(selected.id)}
              onToggleBookmark={() => toggleBookmark(selected.id)}
              onSelect={selectEntry}
              onCompare={() => toggleCompare(selected.id)}
              inCompare={compareIds.includes(selected.id)}
              onOpenGlossary={() => setGlossaryOpen(true)}
            />
          ) : (
            <HomeView onSelect={selectEntry} onFinder={() => showView("finder")} onGuide={() => showView("guide")} onFocusSearch={() => { searchRef.current?.focus(); }} />
          )}
        </main>
      }
      contextRail={<ContextRail entry={selected} recent={recent} onSelect={selectEntry} />}
      compareTray={
        compareIds.length > 0 && view !== "compare" && (
          <div className="compare-tray">
            <div className="compare-tray__items">
              <GitCompareArrows size={17} />
              {compareIds.map((id) => {
                const item = entryById.get(id);
                if (!item) return null;
                return <span key={id}>{item.name}<button onClick={() => toggleCompare(id)}><X size={12} /></button></span>;
              })}
            </div>
            <button className="button button--primary button--small" onClick={() => showView("compare")} disabled={compareIds.length < 2}>
              Сравнить {compareIds.length}/3
            </button>
          </div>
        )
      }
      glossaryDrawer={<GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />}
      onOpenNavigation={() => setNavOpen(true)}
      onCloseNavigation={() => setNavOpen(false)}
      onShowView={showView}
      onRandomEntry={randomEntry}
      onOpenGlossary={() => setGlossaryOpen(true)}
      onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
    />
  );
}
