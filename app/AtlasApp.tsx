"use client";

import {
  ArrowLeft,
  ArrowRight,
  GitCompareArrows,
  Info,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookmarksView } from "@/features/bookmarks/BookmarksView";
import { EntryView } from "@/features/entry/EntryView";
import { HomeView } from "@/features/home/HomeView";
import { CompareView } from "@/features/legacy-tools/CompareView";
import { EditorView } from "@/features/legacy-tools/EditorView";
import { GuideView } from "@/features/legacy-tools/GuideView";
import type { EditorDraft } from "@/features/legacy-tools/types";
import { GlossaryDrawer } from "@/features/glossary/GlossaryDrawer";
import { glossary } from "@/features/glossary/glossary-data";
import { FinderView } from "@/features/finder/FinderView";
import { GenreTree } from "@/features/navigation/GenreTree";
import { ProfileBars } from "@/features/profile/ProfileBars";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { AtlasShell } from "@/features/shell/AtlasShell";
import type { DetailTab, KnowledgeScope, ViewMode } from "@/features/shell/model";
import { useStoredList } from "@/shared/hooks/useStoredList";
import { EntityBadge } from "@/shared/ui/EntityBadge";
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

const emptyEditorDraft: EditorDraft = { id: "", name: "", summary: "", entityKind: "microgenre", maturity: "local", confidence: "medium", verdict: "", history: "", listenFor: "", production: "", sources: "" };

const statusSymbol: Record<EntryStatus, string> = {
  established: "●",
  emerging: "◐",
  scene: "◇",
  tag: "△",
  adjacent: "↔",
  misnomer: "×",
  umbrella: "◎",
};

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

  const editorLines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
  const editorMissing = [
    !editorDraft.id && "ID",
    !editorDraft.name && "название",
    !editorDraft.summary && "короткое объяснение",
    editorLines(editorDraft.listenFor).length < 3 && "три слышимых признака",
    editorLines(editorDraft.production).length < 2 && "продюсерские заметки",
    !editorDraft.history && "история термина",
    editorLines(editorDraft.sources).length === 0 && "источники",
  ].filter(Boolean) as string[];
  const editorOutput = JSON.stringify({
    id: editorDraft.id.trim(), name: editorDraft.name.trim(), summary: editorDraft.summary.trim(), entityKind: editorDraft.entityKind,
    maturity: editorDraft.maturity, confidence: editorDraft.confidence, verdict: editorDraft.verdict.trim(), history: editorDraft.history.trim(),
    listenFor: editorLines(editorDraft.listenFor), production: editorLines(editorDraft.production),
    sources: editorLines(editorDraft.sources).map((url) => ({ label: "Уточнить подпись", url })),
  }, null, 2);

  const finderResults = useMemo(() => {
    const maps: Record<string, string[]> = {
      short: ["коротк", "short", "импульс"], long: ["длин", "long", "хвост"], clean: ["чист", "саб", "soft"],
      distorted: ["перегруз", "клип", "искаж", "distort"], slides: ["slide", "скольз"], lead: ["как лид", "формант", "визж", "бульк"], barely: ["едва", "тих", "barely"],
      sparse: ["редк", "пуст", "пау", "sparse"], dense: ["плотн", "част", "dense"], broken: ["ломан", "сбив", "stop-start", "неров"],
      club: ["club", "jersey", "клуб", "прямой боч"], swing: ["swing", "смещ"], bounce: ["bounce", "баунс", "пруж"], straight: ["прям", "four-on"], beatless: ["без удар", "драмки нет", "near-beatless"],
      chords: ["аккорд", "гармони", "r&b", "gospel"], loop: ["луп", "loop", "plack", "плак"], sample: ["сэмпл", "sample", "вокальн нарез"],
      drone: ["дрон", "пэд", "pad", "протяж"], minimal: ["мелодии нет", "почти отсутств", "один тон"], bright: ["ярк", "колоколь", "плак"], dark: ["тём", "мрач", "диссон"],
    };
    const optionLabel = new Map([...bassOptions, ...rhythmOptions, ...melodyOptions].map((option) => [option.id, option.label.toLowerCase()]));
    const referenceLower = finderReference.trim().toLowerCase();
    const scored = entries
      .filter((entry) => (!finderReviewedOnly || entry.researchState === "reviewed"))
      .filter((entry) => finderShowDisputed || (entry.maturity !== "disputed" && entry.maturity !== "unconfirmed"))
      .map((entry) => {
        let score = 24 - Math.abs(entry.profile.energy - finderEnergy) * 3 - Math.abs(entry.profile.ambience - finderSpace) * 2 - Math.abs(entry.profile.distortion - finderDistortion) * 2;
        const text = `${entry.name} ${entry.summary} ${entry.signature} ${entry.bass} ${entry.drums} ${entry.mood} ${entry.listenFor.join(" ")} ${entry.production.join(" ")} ${entry.tags.join(" ")} ${entry.artists.join(" ")} ${entry.producers.join(" ")}`.toLowerCase();
        const reasons: string[] = [];
        const selected = [...finderBass, ...finderRhythm, ...finderMelody];
        for (const choice of selected) {
          const hits = (maps[choice] ?? []).filter((word) => text.includes(word)).length;
          if (hits > 0) { score += 7 + hits * 2; reasons.push(optionLabel.get(choice) ?? choice); }
          else score -= 2;
        }
        if (finderFocus.includes("bass")) { score += entry.profile.bassWeight * 2; reasons.push("выразительный низ"); }
        if (finderFocus.includes("drums")) { score += entry.profile.bounce * 2; reasons.push("характерная драмка"); }
        if (finderFocus.includes("melody")) { score += entry.profile.ambience * 2; reasons.push("мелодия заметнее остальных слоёв"); }
        if (finderFocus.includes("vocals") && (entry.artists.length || text.includes("вокал"))) { score += 7; reasons.push("характерный вокал"); }
        if (referenceLower && text.includes(referenceLower)) { score += 25; reasons.unshift(`референс «${finderReference.trim()}»`); }
        return { entry, score, reasons: [...new Set(reasons)].slice(0, 3) };
      })
      .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
    return scored.slice(0, 12);
  }, [finderFocus, finderBass, finderRhythm, finderMelody, finderEnergy, finderSpace, finderDistortion, finderReference, finderReviewedOnly, finderShowDisputed]);

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
