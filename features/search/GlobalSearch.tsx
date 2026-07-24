import { BadgeCheck, Search, X } from "lucide-react";
import type { RefObject } from "react";
import type { AtlasEntry, EntryStatus, FamilyId, FamilyMeta } from "@/app/atlas-data";

type SearchResult = {
  entry: AtlasEntry;
  score: number;
};

type GlobalSearchProps = {
  query: string;
  results: SearchResult[];
  inputRef: RefObject<HTMLInputElement | null>;
  entityKindLabels: Record<AtlasEntry["entityKind"], string>;
  maturityLabels: Record<AtlasEntry["maturity"], { label: string }>;
  statusSymbol: Record<EntryStatus, string>;
  getFamily: (id: FamilyId) => FamilyMeta;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  onSelect: (entry: AtlasEntry) => void;
};

export function GlobalSearch({
  query,
  results,
  inputRef,
  entityKindLabels,
  maturityLabels,
  statusSymbol,
  getFamily,
  onQueryChange,
  onClear,
  onSelect,
}: GlobalSearchProps) {
  return (
    <div className="global-search">
      <Search size={18} />
      <input ref={inputRef} value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Жанр, артист, продюсер или признак звука…" aria-label="Поиск по атласу" />
      <kbd>Ctrl K</kbd>
      {query && <button onClick={onClear} title="Очистить"><X size={16} /></button>}
      {query.trim() && (
        <div className="search-overlay" role="dialog" aria-label="Результаты поиска">
          <div className="search-overlay__top">
            <span>{results.length ? `Лучшие совпадения · ${results.length}` : "Ничего точного не найдено"}</span>
            <button onClick={onClear} title="Закрыть поиск"><X size={16} /></button>
          </div>
          <div className="search-results">
            {results.length ? (
              results.map(({ entry }) => {
                const family = getFamily(entry.family);
                return (
                  <button key={entry.id} className="search-result" onClick={() => onSelect(entry)}>
                    <span className="search-result__accent" style={{ backgroundColor: family.color }} />
                    <span className="search-result__body">
                      <span className="search-result__title"><strong>{entry.name}</strong>{entry.researchState === "reviewed" && <BadgeCheck size={12} />}</span>
                      <small>{entry.signature}</small>
                      <em>{entityKindLabels[entry.entityKind]} · {maturityLabels[entry.maturity].label}</em>
                    </span>
                    <span className={`search-result__status search-result__status--${entry.status}`}>
                      {statusSymbol[entry.status]}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="search-empty">
                <Search size={24} />
                <strong>Попробуй искать по артисту, продюсеру или признаку звука</strong>
                <span>Например: «мягкий саб», «Luci4», «мелодичный», «ломаная драмка».</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
