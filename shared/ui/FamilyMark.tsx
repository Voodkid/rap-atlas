import { getFamily } from "@/app/atlas-data";
import type { FamilyId } from "@/app/atlas-data";

export function FamilyMark({ familyId }: { familyId: FamilyId }) {
  const family = getFamily(familyId);
  return (
    <span className="family-mark" style={{ color: family.color }}>
      <span className="family-mark__dot" style={{ backgroundColor: family.color }} />
      {family.name}
    </span>
  );
}
