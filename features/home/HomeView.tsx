import {
  ArrowRight,
  Compass,
  Ear,
  Search,
  SlidersHorizontal,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  type AtlasEntry,
  discoveryRoutes,
  entries,
  entryById,
  families,
  learningPaths,
} from "@/app/atlas-data";

type HomeViewProps = {
  onSelect: (entry: AtlasEntry) => void;
  onFinder: () => void;
  onFocusSearch: () => void;
  onGuide: () => void;
};

export function HomeView({ onSelect, onFinder, onFocusSearch, onGuide }: HomeViewProps) {
  const reviewedCount = entries.filter((entry) => entry.researchState === "reviewed").length;
  const queuedCount = entries.length - reviewedCount;
  const taskRoutes = [
    { id: "known", icon: <Search size={18} />, title: "Уже знаю название", text: "Введи жанр, артиста, продюсера или признак звука.", action: onFocusSearch },
    { id: "sound", icon: <SlidersHorizontal size={18} />, title: "Ищу звук для бита", text: "Ответь на четыре вопроса без знания жанровых терминов.", action: onFinder },
    { id: "identify", icon: <Ear size={18} />, title: "Хочу понять, что играет", text: "Начни с слышимых признаков и сравни ближайшие варианты.", action: onFinder },
    { id: "branch", icon: <Workflow size={18} />, title: "Хочу разобрать одну ветку", text: "Иди по короткому маршруту и смотри, где меняется звук.", action: () => onSelect(entryById.get("plugg")!) },
  ];
  return (
    <div className="home-view">
      <section className="hero-panel">
        <div className="hero-panel__eyebrow"><Sparkles size={15} /> RAP ATLAS 2.0 · новая версия базы</div>
        <h1>Сначала звук.<br /><span>Потом название.</span></h1>
        <p>
          Ищи направление по басу, драмке, мелодии или артисту. В карточке сразу видно, что это:
          жанр, круг артистов, стиль продюсеров или просто тег для поиска.
        </p>
        <div className="hero-actions">
          <button className="button button--primary" onClick={onFinder}><Compass size={18} /> Подобрать по звуку</button>
          <button className="button button--ghost" onClick={onGuide}>Как читать атлас <ArrowRight size={17} /></button>
        </div>
        <div className="hero-stats">
          <div><strong>{entries.length}</strong><span>карточки сохранены</span></div>
          <div><strong>{reviewedCount}</strong><span>подробно проверены</span></div>
          <div><strong>{queuedCount}</strong><span>в очереди на проверку</span></div>
          <div><strong>{families.length}</strong><span>больших веток</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">Можно начать без названия жанра</span><h2>Что ты хочешь сделать?</h2></div></div>
        <div className="task-grid">
          {taskRoutes.map((task, index) => (
            <button key={task.id} className="task-card" onClick={task.action}>
              <span className="task-card__index">0{index + 1}</span>
              <span className="task-card__icon">{task.icon}</span>
              <span><strong>{task.title}</strong><small>{task.text}</small></span>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="section-kicker">Быстрый поиск по признаку</span><h2>Если уже знаешь, что нужно</h2></div>
          <button className="text-button" onClick={onFinder}>Точный подбор <ArrowRight size={15} /></button>
        </div>
        <div className="route-grid">
          {discoveryRoutes.map((route, index) => {
            const first = entryById.get(route.ids.find((id) => entryById.has(id))!)!;
            return (
              <button key={route.id} className="route-card" onClick={() => onSelect(first)}>
                <span className="route-card__index">0{index + 1}</span>
                <span className="route-card__copy"><strong>{route.title}</strong><small>{route.subtitle}</small></span>
                <ArrowRight size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">Короткий путь по основным карточкам</span><h2>Маршруты по веткам</h2></div></div>
        <div className="learning-grid">
          {learningPaths.map((path) => (
            <article className="learning-card" key={path.id}>
              <span className="section-kicker">{path.ids.length} шагов</span>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <div className="learning-card__steps">
                {path.ids.map((id, index) => {
                  const item = entryById.get(id);
                  return item ? <button key={id} onClick={() => onSelect(item)}><b>{index + 1}</b>{item.name}</button> : null;
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">Весь атлас сохранён</span><h2>12 больших веток</h2></div></div>
        <div className="family-grid">
          {families.map((family) => {
            const familyEntries = entries.filter((entry) => entry.family === family.id);
            return (
              <button key={family.id} className="family-card" onClick={() => onSelect(entryById.get(family.root)!)}>
                <div className="family-card__top">
                  <span className="family-card__code" style={{ color: family.color }}>{family.code}</span>
                  <span className="family-card__count">{familyEntries.filter((entry) => entry.researchState === "reviewed").length}/{familyEntries.length} проверено</span>
                </div>
                <strong>{family.name}</strong><p>{family.short}</p>
                <div className="family-card__line" style={{ backgroundColor: family.color }} />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
