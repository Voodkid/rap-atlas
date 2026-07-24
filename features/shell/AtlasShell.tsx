import type { ReactNode } from "react";
import { CircleHelp, Dice5, Menu, Moon, Sun, X } from "lucide-react";
import { PrimaryNavigation } from "@/features/navigation/PrimaryNavigation";
import type { ViewMode } from "./model";
import { cn } from "@/shared/lib/cn";

type AtlasShellProps = {
  theme: "dark" | "light";
  navOpen: boolean;
  view: ViewMode;
  isHomeActive: boolean;
  reviewedTotal: number;
  entryTotal: number;
  bookmarksCount: number;
  compareCount: number;
  searchContent: ReactNode;
  navigationContent: ReactNode;
  mainContent: ReactNode;
  contextRail: ReactNode;
  compareTray: ReactNode;
  glossaryDrawer: ReactNode;
  onOpenNavigation: () => void;
  onCloseNavigation: () => void;
  onShowView: (view: ViewMode) => void;
  onRandomEntry: () => void;
  onOpenGlossary: () => void;
  onToggleTheme: () => void;
};

export function AtlasShell({
  theme,
  navOpen,
  view,
  isHomeActive,
  reviewedTotal,
  entryTotal,
  bookmarksCount,
  compareCount,
  searchContent,
  navigationContent,
  mainContent,
  contextRail,
  compareTray,
  glossaryDrawer,
  onOpenNavigation,
  onCloseNavigation,
  onShowView,
  onRandomEntry,
  onOpenGlossary,
  onToggleTheme,
}: AtlasShellProps) {
  return (
    <div className="atlas-app" data-theme={theme}>
      <header className="topbar">
        <button className="mobile-menu" onClick={onOpenNavigation} title="Открыть дерево"><Menu size={20} /></button>
        <button className="brand" onClick={() => onShowView("home")}>
          <span className="brand__glyph">RA</span>
          <span className="brand__copy"><strong>RAP ATLAS</strong><small>2.0 · проверено {reviewedTotal} из {entryTotal}</small></span>
        </button>
        {searchContent}
        <div className="topbar-actions">
          <button className="top-action" onClick={onRandomEntry} title="Открыть случайную карточку"><Dice5 size={18} /><span>Случайная</span></button>
          <button className="icon-button" onClick={onOpenGlossary} title="Словарь"><CircleHelp size={18} /></button>
          <button className="icon-button" onClick={onToggleTheme} title="Сменить тему">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="atlas-shell">
        <aside className={cn("atlas-nav", navOpen && "atlas-nav--open")}>
          <div className="atlas-nav__mobile-top">
            <strong>Дерево жанров</strong>
            <button onClick={onCloseNavigation}><X size={18} /></button>
          </div>
          <PrimaryNavigation
            view={view}
            isHomeActive={isHomeActive}
            bookmarksCount={bookmarksCount}
            compareCount={compareCount}
            onShowView={onShowView}
          />
          {navigationContent}
        </aside>

        {navOpen && <button className="nav-backdrop" onClick={onCloseNavigation} aria-label="Закрыть меню" />}

        {mainContent}
        {contextRail}
      </div>

      {compareTray}
      {glossaryDrawer}
    </div>
  );
}
