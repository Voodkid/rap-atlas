import type { AtlasEntry } from "@/app/atlas-data";

export type FinderOption = {
  id: string;
  label: string;
};

export type FinderFilters = {
  focus: string[];
  bass: string[];
  rhythm: string[];
  melody: string[];
  energy: number;
  space: number;
  distortion: number;
  reference: string;
  reviewedOnly: boolean;
  showDisputed: boolean;
};

export type FinderResult = {
  entry: AtlasEntry;
  score: number;
  reasons: string[];
};

export const focusOptions: FinderOption[] = [
  { id: "bass", label: "Бас" },
  { id: "drums", label: "Драмка" },
  { id: "melody", label: "Мелодия" },
  { id: "vocals", label: "Вокал" },
];

export const bassOptions: FinderOption[] = [
  { id: "short", label: "Короткий" },
  { id: "long", label: "Длинный" },
  { id: "clean", label: "Чистый саб" },
  { id: "distorted", label: "С перегрузом" },
  { id: "slides", label: "Со slides" },
  { id: "lead", label: "808 играет мелодию" },
  { id: "barely", label: "Едва слышный" },
];

export const rhythmOptions: FinderOption[] = [
  { id: "sparse", label: "Редкая драмка" },
  { id: "dense", label: "Плотная" },
  { id: "broken", label: "Ломаная драмка" },
  { id: "club", label: "Клубный ритм" },
  { id: "swing", label: "Со swing" },
  { id: "bounce", label: "Сильно качает" },
  { id: "straight", label: "Прямая" },
  { id: "beatless", label: "Почти без ударных" },
];

export const melodyOptions: FinderOption[] = [
  { id: "chords", label: "Аккордовая" },
  { id: "loop", label: "Короткий луп" },
  { id: "sample", label: "Сэмпловая" },
  { id: "drone", label: "Одна длинная нота или пэд" },
  { id: "minimal", label: "Почти отсутствует" },
  { id: "bright", label: "Яркий плак" },
  { id: "dark", label: "Тёмная, ноты звучат напряжённо" },
];

const finderKeywordMap: Record<string, string[]> = {
  short: ["коротк", "short", "импульс"], long: ["длин", "long", "хвост"], clean: ["чист", "саб", "soft"],
  distorted: ["перегруз", "клип", "искаж", "distort"], slides: ["slide", "скольз"], lead: ["как лид", "формант", "визж", "бульк"], barely: ["едва", "тих", "barely"],
  sparse: ["редк", "пуст", "пау", "sparse"], dense: ["плотн", "част", "dense"], broken: ["ломан", "сбив", "stop-start", "неров"],
  club: ["club", "jersey", "клуб", "прямой боч"], swing: ["swing", "смещ"], bounce: ["bounce", "баунс", "пруж"], straight: ["прям", "four-on"], beatless: ["без удар", "драмки нет", "near-beatless"],
  chords: ["аккорд", "гармони", "r&b", "gospel"], loop: ["луп", "loop", "plack", "плак"], sample: ["сэмпл", "sample", "вокальн нарез"],
  drone: ["дрон", "пэд", "pad", "протяж"], minimal: ["мелодии нет", "почти отсутств", "один тон"], bright: ["ярк", "колоколь", "плак"], dark: ["тём", "мрач", "диссон"],
};

const finderOptionLabels = new Map([...bassOptions, ...rhythmOptions, ...melodyOptions].map((option) => [option.id, option.label.toLowerCase()]));

function getFinderText(entry: AtlasEntry) {
  return `${entry.name} ${entry.summary} ${entry.signature} ${entry.bass} ${entry.drums} ${entry.mood} ${entry.listenFor.join(" ")} ${entry.production.join(" ")} ${entry.tags.join(" ")} ${entry.artists.join(" ")} ${entry.producers.join(" ")}`.toLowerCase();
}

export function getFinderResults(entries: AtlasEntry[], filters: FinderFilters): FinderResult[] {
  const referenceLower = filters.reference.trim().toLowerCase();
  const scored = entries
    .filter((entry) => (!filters.reviewedOnly || entry.researchState === "reviewed"))
    .filter((entry) => filters.showDisputed || (entry.maturity !== "disputed" && entry.maturity !== "unconfirmed"))
    .map((entry) => {
      let score = 24 - Math.abs(entry.profile.energy - filters.energy) * 3 - Math.abs(entry.profile.ambience - filters.space) * 2 - Math.abs(entry.profile.distortion - filters.distortion) * 2;
      const text = getFinderText(entry);
      const reasons: string[] = [];
      const selected = [...filters.bass, ...filters.rhythm, ...filters.melody];
      for (const choice of selected) {
        const hits = (finderKeywordMap[choice] ?? []).filter((word) => text.includes(word)).length;
        if (hits > 0) { score += 7 + hits * 2; reasons.push(finderOptionLabels.get(choice) ?? choice); }
        else score -= 2;
      }
      if (filters.focus.includes("bass")) { score += entry.profile.bassWeight * 2; reasons.push("выразительный низ"); }
      if (filters.focus.includes("drums")) { score += entry.profile.bounce * 2; reasons.push("характерная драмка"); }
      if (filters.focus.includes("melody")) { score += entry.profile.ambience * 2; reasons.push("мелодия заметнее остальных слоёв"); }
      if (filters.focus.includes("vocals") && (entry.artists.length || text.includes("вокал"))) { score += 7; reasons.push("характерный вокал"); }
      if (referenceLower && text.includes(referenceLower)) { score += 25; reasons.unshift(`референс «${filters.reference.trim()}»`); }
      return { entry, score, reasons: [...new Set(reasons)].slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
  return scored.slice(0, 12);
}
