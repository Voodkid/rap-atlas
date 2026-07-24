import { ArrowRight, Info } from "lucide-react";
import {
  type AtlasEntry,
  confidenceLabels,
  entityKindLabels,
  getFamily,
  maturityLabels,
} from "@/app/atlas-data";
import { ProfileBars } from "@/features/profile/ProfileBars";
import { EntityBadge } from "@/shared/ui/EntityBadge";

type ContextRailProps = {
  selectedEntry: AtlasEntry | null;
  recentEntries: AtlasEntry[];
  onSelect: (entry: AtlasEntry) => void;
};

export function ContextRail({ selectedEntry, recentEntries, onSelect }: ContextRailProps) {
  if (!selectedEntry) {
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

  return (
    <aside className="context-rail">
      <div className="rail-block">
        <span className="section-kicker">Профиль звука</span>
        <h3>{selectedEntry.name}</h3>
        <ProfileBars entry={selectedEntry} />
      </div>
      <div className="rail-block facts-list">
        <div><span>Период</span><strong>{selectedEntry.era}</strong></div>
        <div><span>Большая ветка</span><strong>{getFamily(selectedEntry.family).name}</strong></div>
        <div><span>Тип</span><strong>{entityKindLabels[selectedEntry.entityKind]}</strong></div>
        <div><span>Термин</span><strong>{maturityLabels[selectedEntry.maturity].label}</strong></div>
        <div><span>Уверенность</span><strong>{confidenceLabels[selectedEntry.confidence].label}</strong></div>
      </div>
      {selectedEntry.tags.length > 0 && (
        <div className="rail-block">
          <span className="section-kicker">Метки</span>
          <div className="tag-cloud">{selectedEntry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
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
