import { entityKindLabels } from "@/app/atlas-data";
import type { EntityKind } from "@/app/atlas-data";

export function EntityBadge({ kind }: { kind: EntityKind }) {
  return <span className="entity-badge">{entityKindLabels[kind]}</span>;
}
