import { maturityLabels } from "@/app/atlas-data";
import type { AtlasEntry } from "@/app/atlas-data";
import { cn } from "@/shared/lib/cn";

export function MaturityBadge({ entry }: { entry: AtlasEntry }) {
  return (
    <span className={cn("maturity-badge", `maturity-badge--${entry.maturity}`)} title={maturityLabels[entry.maturity].note}>
      {maturityLabels[entry.maturity].label}
    </span>
  );
}
