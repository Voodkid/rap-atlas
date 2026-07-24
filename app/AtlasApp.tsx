"use client";

import {
  ArrowLeft,
  ArrowRight,
  GitCompareArrows,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookmarksView } from "@/features/bookmarks/BookmarksView";
import { ContextRail } from "@/features/context/ContextRail";
import { EntryView } from "@/features/entry/EntryView";
import { HomeView } from "@/features/home/HomeView";
import { CompareView } from "@/features/legacy-tools/CompareView";
import { EditorView } from "@/features/legacy-tools/EditorView";
import { GuideView } from "@/features/legacy-tools/GuideView";
import { emptyEditorDraft, getEditorMissing, getEditorOutput } from "@/features/legacy-tools/editor-model";
import type { EditorDraft } from "@/features/legacy-tools/types";
import { GlossaryDrawer } from "@/features/glossary/GlossaryDrawer";
import { glossary } from "@/features/glossary/glossary-data";
import { FinderView } from "@/features/finder/FinderView";
import { bassOptions, focusOptions, getFinderResults, melodyOptions, rhythmOptions } from "@/features/finder/model";
import { matchesEntryFilters } from "@/features/navigation/entryFilters";
import { GenreTree } from "@/features/navigation/GenreTree";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { AtlasShell } from "@/features/shell/AtlasShell";
import type { DetailTab, KnowledgeScope, ViewMode } from "@/features/shell/model";
import { useStoredList } from "@/shared/hooks/useStoredList";
import {
  AtlasEntry,
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
  const [detailTab, setDetailTab] = useState<DetailTab>("quick");
  const [scope, setScope] = useState<KnowledgeScope>("all");
  const [showDisputed, setShowDisputed] = useState(true);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [finderFocus, setFinderFocus] = useState<string[]>(["bass"]);
  const [finderBass, setFinderBass] = useState<string[]>([]);
  const [finderRhythm, setFinderRhythm] = useState<string[]>([]);
  const [finderMelody, setFinderMelody] = useState<string[]>([]);
  const [finderEnergy, setFinderEnergy] = useState(3);
  const [finderSpace, setFinderSpace] = useState(3);
  const [finderDistortion, setFinderDistortion] = useState(2);
  const [finderReference, setFinderReference] = useState("");
  const [finderReviewedOnly, setFinderReviewedOnly] = useState(true);
  const [finderShowDisputed, setFinderShowDisputed] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EditorDraft>(emptyEditorDraft);
  const [editorCopied, setEditorCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = selectedId ? entryById.get(selectedId) ?? null : null;
  const contextRecentEntries = selected
    ? recent.map((id) => entryById.get(id)).filter((item): item is AtlasEntry => Boolean(item) && item!.id !== selected.id).slice(0, 4)
    : [];
  const selectedFamily = selected ? getFamily(selected.family) : null;
  const selectedLineage = selected ? getLineage(selected).filter((node) => node.id !== selected.id) : [];
  const selectedChildren = selected ? getChildren(selected.id) : [];
  const selectedRelated = selected
    ? selected.related
      .map((id) => entryById.get(id))
      .filter((item): item is AtlasEntry => Boolean(item))
      .map((entry) => ({ entry, family: getFamily(entry.family) }))
    : [];
  const selectedCanonical = selected?.canonicalId ? entryById.get(selected.canonicalId) : undefined;
  const selectedRelationNotes = selected
    ? selected.relationNotes.map((relation) => ({ relation, target: entryById.get(relation.target) }))
    : [];
  const glossaryTerms = Object.keys(glossary);
  const bookmarkedEntries = bookmarks.map((id) => entryById.get(id)).filter(Boolean) as AtlasEntry[];
  const comparedEntries = compareIds.map((id) => entryById.get(id)).filter(Boolean) as AtlasEntry[];
  const visibleIds = useMemo(() => {
    const visible = new Set<string>();
    entries.forEach((entry) => {
      if (matchesEntryFilters(entry, { scope, showDisputed })) {
        visible.add(entry.id);
        getLineage(entry).forEach((node) => visible.add(node.id));
      }
    });
    return visible;
  }, [scope, showDisputed]);

  const searchResults = useMemo(
    () => searchEntries(query).filter(({ entry }) =>
      matchesEntryFilters(entry, { scope, showDisputed })),
    [query, scope, showDisputed],
  );

  const editorMissing = getEditorMissing(editorDraft);
  const editorOutput = getEditorOutput(editorDraft);

  const finderResults = useMemo(
    () => getFinderResults(entries, {
      focus: finderFocus,
      bass: finderBass,
      rhythm: finderRhythm,
      melody: finderMelody,
      energy: finderEnergy,
      space: finderSpace,
      distortion: finderDistortion,
      reference: finderReference,
      reviewedOnly: finderReviewedOnly,
      showDisputed: finderShowDisputed,
    }),
    [finderFocus, finderBass, finderRhythm, finderMelody, finderEnergy, finderSpace, finderDistortion, finderReference, finderReviewedOnly, finderShowDisputed],
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

  const resetFinderControls = () => {
    setFinderFocus(["bass"]); setFinderBass([]); setFinderRhythm([]); setFinderMelody([]);
    setFinderEnergy(3); setFinderSpace(3); setFinderDistortion(2); setFinderReference("");
  };

  const resetFinderState = () => {
    resetFinderControls();
    setFinderReviewedOnly(true);
    setFinderShowDisputed(false);
  };

  const updateEditorDraft = <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) => setEditorDraft((current) => ({ ...current, [key]: value }));

  const copyEditorDraft = async () => {
    try {
      await navigator.clipboard.writeText(editorOutput);
      setEditorCopied(true);
      window.setTimeout(() => setEditorCopied(false), 1600);
    } catch {
      setEditorCopied(false);
    }
  };

  const resetEditorState = () => {
    setEditorDraft(emptyEditorDraft);
    setEditorCopied(false);
  };

  const selectEntry = (entry: AtlasEntry, pushHistory = true) => {
    resetFinderState();
    resetEditorState();
    setDetailTab("quick");
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
    if (next !== "finder") resetFinderState();
    if (next !== "editor") resetEditorState();
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
            <FinderView
              focusOptions={focusOptions}
              bassOptions={bassOptions}
              rhythmOptions={rhythmOptions}
              melodyOptions={melodyOptions}
              focus={finderFocus}
              bass={finderBass}
              rhythm={finderRhythm}
              melody={finderMelody}
              energy={finderEnergy}
              space={finderSpace}
              distortion={finderDistortion}
              reference={finderReference}
              reviewedOnly={finderReviewedOnly}
              showDisputed={finderShowDisputed}
              reviewedTotal={reviewedTotal}
              results={finderResults}
              entityKindLabels={entityKindLabels}
              getFamily={getFamily}
              onFocusChange={setFinderFocus}
              onBassChange={setFinderBass}
              onRhythmChange={setFinderRhythm}
              onMelodyChange={setFinderMelody}
              onEnergyChange={setFinderEnergy}
              onSpaceChange={setFinderSpace}
              onDistortionChange={setFinderDistortion}
              onReferenceChange={setFinderReference}
              onReviewedOnlyChange={setFinderReviewedOnly}
              onShowDisputedChange={setFinderShowDisputed}
              onReset={resetFinderControls}
              onSelect={selectEntry}
            />
          ) : view === "bookmarks" ? (
            <BookmarksView entries={bookmarkedEntries} getFamily={getFamily} onSelect={selectEntry} />
          ) : view === "compare" ? (
            <CompareView entries={comparedEntries} getFamily={getFamily} onSelect={selectEntry} onRemove={(id) => toggleCompare(id)} />
          ) : view === "guide" ? (
            <GuideView onEditor={() => showView("editor")} />
          ) : view === "editor" ? (
            <EditorView
              draft={editorDraft}
              copied={editorCopied}
              missing={editorMissing}
              output={editorOutput}
              entityKindLabels={entityKindLabels}
              maturityLabels={maturityLabels}
              confidenceLabels={confidenceLabels}
              onUpdate={updateEditorDraft}
              onCopy={copyEditorDraft}
              onReset={() => setEditorDraft(emptyEditorDraft)}
            />
          ) : selected ? (
            <EntryView
              key={selected.id}
              entry={selected}
              family={selectedFamily!}
              lineage={selectedLineage}
              childEntries={selectedChildren}
              related={selectedRelated}
              canonical={selectedCanonical}
              relationNotes={selectedRelationNotes}
              detailTab={detailTab}
              isBookmarked={bookmarks.includes(selected.id)}
              inCompare={compareIds.includes(selected.id)}
              glossaryTerms={glossaryTerms}
              statusSymbol={statusSymbol}
              entityKindLabels={entityKindLabels}
              maturityLabels={maturityLabels}
              confidenceLabels={confidenceLabels}
              relationTypeLabels={relationTypeLabels}
              onDetailTabChange={setDetailTab}
              onToggleBookmark={() => toggleBookmark(selected.id)}
              onSelect={selectEntry}
              onCompare={() => toggleCompare(selected.id)}
              onOpenGlossary={() => setGlossaryOpen(true)}
            />
          ) : (
            <HomeView onSelect={selectEntry} onFinder={() => showView("finder")} onGuide={() => showView("guide")} onFocusSearch={() => { searchRef.current?.focus(); }} />
          )}
        </main>
      }
      contextRail={<ContextRail selectedEntry={selected} recentEntries={contextRecentEntries} onSelect={selectEntry} />}
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
