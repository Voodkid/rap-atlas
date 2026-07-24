import { BadgeCheck, FileWarning } from "lucide-react";
import type { AtlasEntry } from "@/app/atlas-data";
import { cn } from "@/shared/lib/cn";

export function ResearchBadge({ entry, compact = false }: { entry: AtlasEntry; compact?: boolean }) {
  return entry.researchState === "reviewed" ? (
    <span className={cn("research-badge", compact && "research-badge--compact")} title={`Проверено: ${entry.reviewedAt}`}>
      <BadgeCheck size={compact ? 12 : 14} /> Проверено
    </span>
  ) : (
    <span className={cn("research-badge", "research-badge--legacy", compact && "research-badge--compact")} title="Карточка сохранена из первой версии и ждёт подробной проверки">
      <FileWarning size={compact ? 12 : 14} /> Ждёт проверки
    </span>
  );
}
