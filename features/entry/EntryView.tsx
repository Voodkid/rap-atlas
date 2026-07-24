import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Ear,
  ExternalLink,
  FileWarning,
  GitCompareArrows,
  Info,
  MessageSquareWarning,
  Music2,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import type { AtlasEntry, EntryStatus, FamilyMeta } from "@/app/atlas-data";
import type { DetailTab } from "@/features/shell/model";
import { cn } from "@/shared/lib/cn";
import { EntityBadge } from "@/shared/ui/EntityBadge";
import { FamilyMark } from "@/shared/ui/FamilyMark";
import { MaturityBadge } from "@/shared/ui/MaturityBadge";
import { ResearchBadge } from "@/shared/ui/ResearchBadge";

type EntryViewProps = {
  entry: AtlasEntry;
  family: FamilyMeta;
  lineage: AtlasEntry[];
  childEntries: AtlasEntry[];
  related: Array<{ entry: AtlasEntry; family: FamilyMeta }>;
  canonical?: AtlasEntry;
  relationNotes: Array<{ relation: AtlasEntry["relationNotes"][number]; target?: AtlasEntry }>;
  detailTab: DetailTab;
  isBookmarked: boolean;
  inCompare: boolean;
  renderProfileBars: () => ReactNode;
  glossaryTerms: string[];
  statusSymbol: Record<EntryStatus, string>;
  entityKindLabels: Record<AtlasEntry["entityKind"], string>;
  maturityLabels: Record<AtlasEntry["maturity"], { label: string; note: string }>;
  confidenceLabels: Record<AtlasEntry["confidence"], { label: string; note: string }>;
  relationTypeLabels: Record<AtlasEntry["relationNotes"][number]["type"], string>;
  onDetailTabChange: (tab: DetailTab) => void;
  onToggleBookmark: () => void;
  onCompare: () => void;
  onSelect: (entry: AtlasEntry) => void;
  onOpenGlossary: () => void;
};

export function EntryView({
  entry,
  family,
  lineage,
  childEntries,
  related,
  canonical,
  relationNotes,
  detailTab,
  isBookmarked,
  inCompare,
  renderProfileBars,
  glossaryTerms,
  statusSymbol,
  entityKindLabels,
  maturityLabels,
  confidenceLabels,
  relationTypeLabels,
  onDetailTabChange,
  onToggleBookmark,
  onCompare,
  onSelect,
  onOpenGlossary,
}: EntryViewProps) {
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
        <button className={detailTab === "quick" ? "active" : ""} onClick={() => onDetailTabChange("quick")}><Ear size={16} /><span><b>Коротко</b><small>понять за полминуты</small></span></button>
        <button className={detailTab === "producer" ? "active" : ""} onClick={() => onDetailTabChange("producer")}><SlidersHorizontal size={16} /><span><b>Продюсеру</b><small>бас, драмка и микс</small></span></button>
        <button className={detailTab === "history" ? "active" : ""} onClick={() => onDetailTabChange("history")}><BookOpen size={16} /><span><b>История и связи</b><small>название и источники</small></span></button>
      </div>

      {entry.researchState === "legacy" && (
        <div className="legacy-notice">
          <FileWarning size={20} />
          <div><strong>Эта карточка ещё не проверена подробно</strong><p>Мы сохранили её из первой версии. Описание, история и параметры звука пока общие для всей ветки и могут быть неточными.</p></div>
        </div>
      )}

      {detailTab === "quick" && (
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

      {detailTab === "producer" && (
        <>
          <div className="rules-notice"><Info size={17} /><p>Так делают часто, но не в каждом треке. Один пресет или один рисунок ударных ещё не создаёт отдельный жанр.</p></div>
          <section className="detail-section producer-matrix">
            <div className="producer-matrix__main">
              <div><span>БАС / 808</span><p>{entry.bass}</p></div>
              <div><span>ДРАМКА</span><p>{entry.drums}</p></div>
              <div><span>ТЕМП</span><p>{entry.tempo}</p></div>
              <div><span>ПЕРИОД</span><p>{entry.era}</p></div>
            </div>
            <div className="producer-profile"><span className="section-kicker">Профиль звука</span>{renderProfileBars()}</div>
          </section>
          <section className="detail-section">
            <div className="section-heading section-heading--compact"><div><span className="section-kicker">Рабочие заметки</span><h2>Как подойти к биту</h2></div></div>
            {entry.production.length ? <ol className="production-list">{entry.production.map((note) => <li key={note}>{note}</li>)}</ol> : <p className="data-gap">Технический разбор появится после подробной проверки этой карточки.</p>}
          </section>
          <section className="detail-section glossary-strip">
            <div><span className="section-kicker">Термины из карточки</span><h2>Не уверен в слове?</h2></div>
            <div>{glossaryTerms.map((term) => <button key={term} onClick={onOpenGlossary}>{term}<CircleHelp size={13} /></button>)}</div>
          </section>
        </>
      )}

      {detailTab === "history" && (
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

          {relationNotes.length > 0 && (
            <section className="detail-section"><div className="section-heading section-heading--compact"><div><span className="section-kicker">Почему карточка находится здесь</span><h2>Связи с другими направлениями</h2></div></div>
              <div className="relation-notes">{relationNotes.map(({ relation, target }, index) => {
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

      {childEntries.length > 0 && (
        <section className="detail-section">
          <div className="section-heading section-heading--compact">
            <div><span className="section-kicker">Внутри этого направления</span><h2>Что входит в эту ветку</h2></div>
            <span className="section-count">{childEntries.length}</span>
          </div>
          <div className="child-grid">
            {childEntries.map((child) => (
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
            {related.map(({ entry: item, family: relatedFamily }) => (
              <button key={item.id} onClick={() => onSelect(item)}>
                <span className="related-dot" style={{ backgroundColor: relatedFamily.color }} />
                <span><strong>{item.name}</strong><small>{relatedFamily.name}</small></span>
                <ArrowRight size={15} />
              </button>
            ))}
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
