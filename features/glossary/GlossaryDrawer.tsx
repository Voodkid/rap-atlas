import { X } from "lucide-react";
import { glossary } from "./glossary-data";

export function GlossaryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <button className="drawer-backdrop" onClick={onClose} aria-label="Закрыть словарь" />
      <aside className="glossary-drawer" role="dialog" aria-label="Словарь продюсерских терминов">
        <div className="glossary-drawer__top">
          <div><span className="section-kicker">Коротко и на слух</span><h2>Словарь</h2></div>
          <button className="icon-button" onClick={onClose} title="Закрыть"><X size={18} /></button>
        </div>
        <p className="glossary-drawer__intro">Здесь простые объяснения слов из карточек. Переводить их полностью не нужно: продюсеры обычно говорят именно так.</p>
        <div className="glossary-list">
          {Object.entries(glossary).map(([term, definition]) => (
            <div key={term}><strong>{term}</strong><p>{definition}</p></div>
          ))}
        </div>
      </aside>
    </>
  );
}
