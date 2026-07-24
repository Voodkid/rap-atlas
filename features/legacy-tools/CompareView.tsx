import { Columns3, GitCompareArrows, X } from "lucide-react";
import type { ReactNode } from "react";
import type { AtlasEntry, FamilyId, FamilyMeta } from "@/app/atlas-data";
import { EntityBadge } from "@/shared/ui/EntityBadge";
import { FamilyMark } from "@/shared/ui/FamilyMark";
import { MaturityBadge } from "@/shared/ui/MaturityBadge";

type CompareViewProps = {
  entries: AtlasEntry[];
  getFamily: (id: FamilyId) => FamilyMeta;
  renderProfileBars: (entry: AtlasEntry) => ReactNode;
  onSelect: (entry: AtlasEntry) => void;
  onRemove: (id: string) => void;
};

export function CompareView({ entries, getFamily, renderProfileBars, onSelect, onRemove }: CompareViewProps) {
  return (
    <div className="compare-view">
      <div className="collection-heading"><Columns3 size={24} /><div><span className="section-kicker">По пунктам</span><h1>Сравнение</h1></div></div>
      {entries.length >= 2 ? (
        <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}>
          {entries.map((entry) => {
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
                  {renderProfileBars(entry)}
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
