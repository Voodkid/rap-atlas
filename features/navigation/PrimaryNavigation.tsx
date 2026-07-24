import {
  Bookmark,
  BookOpen,
  GitCompareArrows,
  Home,
  PencilLine,
  SlidersHorizontal,
} from "lucide-react";
import type { ViewMode } from "@/features/shell/model";
import { cn } from "@/shared/lib/cn";

type PrimaryNavigationProps = {
  view: ViewMode;
  isHomeActive: boolean;
  bookmarksCount: number;
  compareCount: number;
  onShowView: (view: ViewMode) => void;
};

export function PrimaryNavigation({
  view,
  isHomeActive,
  bookmarksCount,
  compareCount,
  onShowView,
}: PrimaryNavigationProps) {
  return (
    <nav className="primary-nav" aria-label="Основная навигация">
      <button className={cn(isHomeActive && "active")} onClick={() => onShowView("home")}><Home size={17} /> Обзор</button>
      <button className={cn(view === "finder" && "active")} onClick={() => onShowView("finder")}><SlidersHorizontal size={17} /> Подобрать звук</button>
      <button className={cn(view === "bookmarks" && "active")} onClick={() => onShowView("bookmarks")}><Bookmark size={17} /> Избранное <span>{bookmarksCount}</span></button>
      <button className={cn(view === "compare" && "active")} onClick={() => onShowView("compare")}><GitCompareArrows size={17} /> Сравнение <span>{compareCount}</span></button>
      <button className={cn(view === "guide" && "active")} onClick={() => onShowView("guide")}><BookOpen size={17} /> Как устроен атлас</button>
      <button className={cn(view === "editor" && "active")} onClick={() => onShowView("editor")}><PencilLine size={17} /> Редактор карточки</button>
    </nav>
  );
}
