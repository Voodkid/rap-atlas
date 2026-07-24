import { Bookmark, BookmarkCheck } from "lucide-react";
import type { AtlasEntry, FamilyId, FamilyMeta } from "@/app/atlas-data";
import { EntityBadge } from "@/shared/ui/EntityBadge";
import { FamilyMark } from "@/shared/ui/FamilyMark";
import { MaturityBadge } from "@/shared/ui/MaturityBadge";

type BookmarksViewProps = {
  entries: AtlasEntry[];
  getFamily: (id: FamilyId) => FamilyMeta;
  onSelect: (entry: AtlasEntry) => void;
};

export function BookmarksView({ entries, getFamily, onSelect }: BookmarksViewProps) {
  return (
    <div className="collection-view">
      <div className="collection-heading"><BookmarkCheck size={24} /><div><span className="section-kicker">Сохранённое</span><h1>Избранное</h1></div></div>
      {entries.length ? (
        <div className="collection-grid">
          {entries.map((entry) => {
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
