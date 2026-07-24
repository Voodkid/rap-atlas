import { BadgeCheck, RotateCcw } from "lucide-react";
import type { AtlasEntry, FamilyId, FamilyMeta } from "@/app/atlas-data";

type FinderOption = {
  id: string;
  label: string;
};

type FinderResult = {
  entry: AtlasEntry;
  score: number;
  reasons: string[];
};

type FinderViewProps = {
  focusOptions: FinderOption[];
  bassOptions: FinderOption[];
  rhythmOptions: FinderOption[];
  melodyOptions: FinderOption[];
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
  reviewedTotal: number;
  results: FinderResult[];
  entityKindLabels: Record<AtlasEntry["entityKind"], string>;
  getFamily: (id: FamilyId) => FamilyMeta;
  onFocusChange: (value: string[]) => void;
  onBassChange: (value: string[]) => void;
  onRhythmChange: (value: string[]) => void;
  onMelodyChange: (value: string[]) => void;
  onEnergyChange: (value: number) => void;
  onSpaceChange: (value: number) => void;
  onDistortionChange: (value: number) => void;
  onReferenceChange: (value: string) => void;
  onReviewedOnlyChange: (value: boolean) => void;
  onShowDisputedChange: (value: boolean) => void;
  onReset: () => void;
  onSelect: (entry: AtlasEntry) => void;
};

export function FinderView({
  focusOptions,
  bassOptions,
  rhythmOptions,
  melodyOptions,
  focus,
  bass,
  rhythm,
  melody,
  energy,
  space,
  distortion,
  reference,
  reviewedOnly,
  showDisputed,
  reviewedTotal,
  results,
  entityKindLabels,
  getFamily,
  onFocusChange,
  onBassChange,
  onRhythmChange,
  onMelodyChange,
  onEnergyChange,
  onSpaceChange,
  onDistortionChange,
  onReferenceChange,
  onReviewedOnlyChange,
  onShowDisputedChange,
  onReset,
  onSelect,
}: FinderViewProps) {
  return (
    <div className="finder-view">
      <section className="finder-hero">
        <span className="section-kicker">Подбор по звуку</span>
        <h1>Что ты реально слышишь?</h1>
        <p>Можно выбрать несколько вариантов. Название жанра знать не нужно — атлас объяснит каждое предложение обычными слышимыми признаками.</p>
      </section>
      <div className="finder-layout">
        <div className="finder-controls">
          <MultiChoiceGroup title="1. Что важнее?" options={focusOptions} values={focus} onChange={onFocusChange} />
          <MultiChoiceGroup title="2. Как звучит бас?" options={bassOptions} values={bass} onChange={onBassChange} />
          <MultiChoiceGroup title="3. Какая драмка?" options={rhythmOptions} values={rhythm} onChange={onRhythmChange} />
          <MultiChoiceGroup title="4. Какая мелодия?" options={melodyOptions} values={melody} onChange={onMelodyChange} />
          <div className="choice-group">
            <div className="choice-group__title"><span>Тонкая настройка</span><button onClick={onReset}><RotateCcw size={12} /> Сбросить</button></div>
            <RangeControl label="Энергия" value={energy} onChange={onEnergyChange} left="спокойно" right="жёстко" />
            <RangeControl label="Ширина и реверб" value={space} onChange={onSpaceChange} left="сухо" right="широко" />
            <RangeControl label="Перегруз" value={distortion} onChange={onDistortionChange} left="чисто" right="грязно" />
          </div>
          <div className="choice-group reference-field">
            <div className="choice-group__title"><span>Референс — необязательно</span></div>
            <input value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Артист, продюсер или трек" />
          </div>
          <div className="finder-switches">
            <label><input type="checkbox" checked={reviewedOnly} onChange={(event) => onReviewedOnlyChange(event.target.checked)} /> Только проверенные ({reviewedTotal})</label>
            <label><input type="checkbox" checked={showDisputed} onChange={(event) => onShowDisputedChange(event.target.checked)} /> Показывать спорные теги</label>
          </div>
        </div>
        <div className="finder-results">
          <div className="section-heading section-heading--compact">
            <div><span className="section-kicker">Без выдуманных процентов</span><h2>{results.length} ближайших вариантов</h2></div>
          </div>
          {results.map(({ entry, score, reasons }, index) => {
            const family = getFamily(entry.family);
            const band = score >= 45 ? "Очень близко" : score >= 30 ? "Похоже" : "Стоит проверить";
            return (
              <button key={entry.id} className="finder-result" onClick={() => onSelect(entry)}>
                <span className="finder-result__rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="finder-result__main">
                  <span className="finder-result__meta"><span style={{ color: family.color }}>{family.name}</span><span>{entityKindLabels[entry.entityKind]}</span>{entry.researchState === "reviewed" && <BadgeCheck size={11} />}</span>
                  <strong>{entry.name}</strong>
                  <small>Предложили из-за: {reasons.length ? reasons.join(", ") : entry.signature.toLowerCase()}.</small>
                  <em>Может не подойти: {(entry.confusions[0] ?? "границы этой карточки ещё не разобраны").toLowerCase()}</em>
                </span>
                <span className="finder-result__band">{band}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MultiChoiceGroup({ title, options, values, onChange }: { title: string; options: FinderOption[]; values: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="choice-group">
      <div className="choice-group__title"><span>{title}</span></div>
      <div className="choice-options">
        {options.map((option) => (
          <button key={option.id} className={values.includes(option.id) ? "active" : ""} onClick={() => onChange(values.includes(option.id) ? values.filter((id) => id !== option.id) : [...values, option.id])}>{option.label}</button>
        ))}
      </div>
    </div>
  );
}

function RangeControl({ label, value, onChange, left, right }: { label: string; value: number; onChange: (value: number) => void; left: string; right: string }) {
  return <label className="range-control"><span><b>{label}</b><em>{value}/5</em></span><input aria-label={label} type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} /><small><i>{left}</i><i>{right}</i></small></label>;
}
