import { BadgeCheck, ChevronDown, ChevronRight } from "lucide-react";
import type { KnowledgeScope } from "@/features/shell/model";
import { cn } from "@/shared/lib/cn";
import type { AtlasEntry, FamilyId, FamilyMeta } from "@/app/atlas-data";

const statusSymbol: Record<AtlasEntry["status"], string> = {
  established: "●",
  emerging: "◐",
  scene: "◇",
  tag: "△",
  adjacent: "↔",
  misnomer: "×",
  umbrella: "◎",
};

type GenreTreeProps = {
  entries: AtlasEntry[];
  families: FamilyMeta[];
  entryById: Map<string, AtlasEntry>;
  getChildren: (id: string) => AtlasEntry[];
  reviewedTotal: number;
  scope: KnowledgeScope;
  showDisputed: boolean;
  visibleIds: Set<string>;
  selectedId: string | null;
  selectedFamilyId?: FamilyId;
  expandedFamilies: Set<FamilyId>;
  expandedNodes: Set<string>;
  onScopeChange: (scope: KnowledgeScope) => void;
  onShowDisputedChange: (showDisputed: boolean) => void;
  onExpandedFamiliesChange: (expandedFamilies: Set<FamilyId>) => void;
  onExpandedNodesChange: (expandedNodes: Set<string>) => void;
  onSelect: (entry: AtlasEntry) => void;
};

type TreeBranchProps = Pick<
  GenreTreeProps,
  "getChildren" | "selectedId" | "expandedNodes" | "onExpandedNodesChange" | "onSelect" | "visibleIds"
> & {
  entry: AtlasEntry;
  depth?: number;
};

function TreeBranch({
  entry,
  getChildren,
  selectedId,
  expandedNodes,
  onExpandedNodesChange,
  onSelect,
  visibleIds,
  depth = 0,
}: TreeBranchProps) {
  const children = getChildren(entry.id).filter((child) => visibleIds.has(child.id));
  const expanded = expandedNodes.has(entry.id);
  const toggle = () => {
    const next = new Set(expandedNodes);
    if (expanded) next.delete(entry.id);
    else next.add(entry.id);
    onExpandedNodesChange(next);
  };

  return (
    <div className="tree-branch">
      <div className={cn("tree-row", selectedId === entry.id && "tree-row--active")} style={{ paddingLeft: depth * 13 }}>
        {children.length ? (
          <button className="tree-toggle" onClick={toggle} title={expanded ? "Свернуть ветку" : "Развернуть ветку"}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="tree-toggle tree-toggle--empty" />
        )}
        <button className="tree-name" onClick={() => onSelect(entry)}>
          <span className={`tree-symbol tree-symbol--${entry.status}`}>{statusSymbol[entry.status]}</span>
          <span>{entry.name}</span>
          {entry.researchState === "reviewed" && <BadgeCheck className="tree-reviewed" size={11} />}
        </button>
      </div>
      {expanded && children.length > 0 && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeBranch
              key={child.id}
              entry={child}
              getChildren={getChildren}
              selectedId={selectedId}
              expandedNodes={expandedNodes}
              onExpandedNodesChange={onExpandedNodesChange}
              onSelect={onSelect}
              visibleIds={visibleIds}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GenreTree({
  entries,
  families,
  entryById,
  getChildren,
  reviewedTotal,
  scope,
  showDisputed,
  visibleIds,
  selectedId,
  selectedFamilyId,
  expandedFamilies,
  expandedNodes,
  onScopeChange,
  onShowDisputedChange,
  onExpandedFamiliesChange,
  onExpandedNodesChange,
  onSelect,
}: GenreTreeProps) {
  return (
    <>
      <div className="nav-filters">
        <span className="section-kicker">Показывать в дереве</span>
        <div><button className={scope === "all" ? "active" : ""} onClick={() => onScopeChange("all")}>Вся база</button><button className={scope === "reviewed" ? "active" : ""} onClick={() => onScopeChange("reviewed")}>Проверенные {reviewedTotal}</button></div>
        <label><input type="checkbox" checked={showDisputed} onChange={(event) => onShowDisputedChange(event.target.checked)} /> Совсем спорные теги</label>
      </div>
      <div className="nav-divider"><span>{scope === "reviewed" ? "Проверенная часть" : "Все ветки"}</span><b>{visibleIds.size}</b></div>
      <div className="family-tree">
        {families.map((family) => {
          const root = entryById.get(family.root);
          if (!root) return null;
          const expanded = expandedFamilies.has(family.id);
          const familyCount = entries.filter((entry) => entry.family === family.id && visibleIds.has(entry.id)).length;
          if (familyCount === 0) return null;
          return (
            <div className="family-tree__group" key={family.id}>
              <button
                className={cn("family-tree__header", selectedFamilyId === family.id && "family-tree__header--active")}
                onClick={() => {
                  const next = new Set(expandedFamilies);
                  if (expanded) next.delete(family.id); else next.add(family.id);
                  onExpandedFamiliesChange(next);
                }}
              >
                <span className="family-tree__bar" style={{ backgroundColor: family.color }} />
                <span><small>{family.code}</small><strong>{family.name}</strong></span>
                <b>{familyCount}</b>
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expanded && (
                <div className="family-tree__content">
                  <TreeBranch entry={root} getChildren={getChildren} selectedId={selectedId} expandedNodes={expandedNodes} onExpandedNodesChange={onExpandedNodesChange} onSelect={onSelect} visibleIds={visibleIds} />
                  {entries.filter((entry) => entry.family === family.id && !entry.parent && entry.id !== root.id && visibleIds.has(entry.id)).map((extraRoot) => (
                    <TreeBranch key={extraRoot.id} entry={extraRoot} getChildren={getChildren} selectedId={selectedId} expandedNodes={expandedNodes} onExpandedNodesChange={onExpandedNodesChange} onSelect={onSelect} visibleIds={visibleIds} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
