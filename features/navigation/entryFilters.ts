import type { AtlasEntry } from "@/app/atlas-data";
import type { KnowledgeScope } from "@/features/shell/model";

export type EntryFilters = {
  scope: KnowledgeScope;
  showDisputed: boolean;
};

export function matchesEntryFilters(entry: AtlasEntry, filters: EntryFilters) {
  const inScope = filters.scope === "all" || entry.researchState === "reviewed";
  const allowed = filters.showDisputed || (entry.maturity !== "disputed" && entry.maturity !== "unconfirmed");
  return inScope && allowed;
}
