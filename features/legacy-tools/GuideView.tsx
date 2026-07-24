import { ArrowRight, Database } from "lucide-react";

type GuideViewProps = {
  onEditor: () => void;
};

const axes = [
  { title: "Что обозначает название?", text: "Это может быть жанр, круг артистов, стиль продюсеров, смесь двух направлений или просто тег для поиска." },
  { title: "Насколько часто так говорят?", text: "От общего названия, которым пользуются многие, до редкого молодого тега." },
  { title: "Насколько хорошо это проверено?", text: "Смотрим, есть ли надёжные источники, примеры музыки и использование названия самими участниками." },
];

export function GuideView({ onEditor }: GuideViewProps) {
  return (
    <div className="guide-view">
      <section className="guide-hero"><span className="section-kicker">Как работает RAP ATLAS 2.0</span><h1>Сразу видно,<br />что перед тобой.</h1><p>Одно слово может означать жанр, круг артистов или просто тег для поиска. Мы показываем это отдельно. Дерево помогает найти направление, а карточка простыми словами объясняет его место в музыке.</p></section>
      <section className="detail-section"><div className="section-heading"><div><span className="section-kicker">Три простых вопроса</span><h2>Одной плашки «статус» было недостаточно</h2></div></div><div className="method-axis-grid">{axes.map((axis, index) => <div key={axis.title}><span>0{index + 1}</span><h3>{axis.title}</h3><p>{axis.text}</p></div>)}</div></section>
      <section className="detail-section guide-process"><div><span className="section-kicker">Как проходит проверка</span><h2>Что мы делаем перед публикацией карточки</h2></div><ol><li><strong>Проверяем название</strong><p>Выясняем, кто так говорит, когда появилось слово и не изменился ли его смысл.</p></li><li><strong>Подбираем треки</strong><p>Берём ранние, основные, новые и пограничные примеры. Отдельно отмечаем треки, которые сюда относят ошибочно.</p></li><li><strong>Слушаем по одному плану</strong><p>Проверяем ритм, ударные, бас, мелодию, вокал, построение трека и микс.</p></li><li><strong>Сравниваем с соседями</strong><p>Показываем, что у направлений общего и какое отличие действительно слышно.</p></li><li><strong>Решение проверяет человек</strong><p>ИИ помогает искать материалы, но не решает сам, что считать жанром.</p></li></ol></section>
      <section className="detail-section source-priority"><div><span className="section-kicker">Каким источникам верим больше</span><h2>Сначала участники сцены, потом чужие пересказы</h2></div><div><p><b>1.</b> Интервью артистов и продюсеров, их страницы и первые загрузки.</p><p><b>2.</b> Материалы музыкальных изданий.</p><p><b>3.</b> Музыкальные каталоги и базы.</p><p><b>4.</b> Reddit, TikTok, YouTube и BeatStars показывают, что слово используют. Но одной такой ссылки мало, чтобы доказать историю жанра.</p></div></section>
      <section className="detail-section editor-invite"><Database size={28} /><div><span className="section-kicker">Для следующих партий по 25</span><h2>Внутренний редактор уже готов</h2><p>Заполняешь карточку в форме, сразу видишь пробелы и копируешь готовый объект для базы.</p></div><button className="button button--primary" onClick={onEditor}>Открыть редактор <ArrowRight size={16} /></button></section>
    </div>
  );
}
