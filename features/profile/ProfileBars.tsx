import type { AtlasEntry } from "@/app/atlas-data";
import { getFamily } from "@/app/atlas-data";
import { cn } from "@/shared/lib/cn";

const profileLabels: Array<{ key: keyof AtlasEntry["profile"]; label: string }> = [
  { key: "energy", label: "Энергия" },
  { key: "distortion", label: "Перегруз" },
  { key: "ambience", label: "Ширина и реверб" },
  { key: "bounce", label: "Насколько качает" },
  { key: "bassWeight", label: "Тяжесть низа" },
];

type ProfileBarsProps = {
  entry: AtlasEntry;
  compact?: boolean;
};

export function ProfileBars({ entry, compact = false }: ProfileBarsProps) {
  const family = getFamily(entry.family);
  return (
    <div className={cn("profile-bars", compact && "profile-bars--compact")}>
      {profileLabels.map(({ key, label }) => (
        <div className="profile-row" key={key}>
          <div className="profile-label">
            <span>{label}</span>
            <b>{entry.profile[key]}/5</b>
          </div>
          <div className="profile-track" aria-label={`${label}: ${entry.profile[key]} из 5`}>
            <span style={{ width: `${entry.profile[key] * 20}%`, backgroundColor: family.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
