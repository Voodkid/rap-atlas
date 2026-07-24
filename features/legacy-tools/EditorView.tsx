import { ListFilter, ShieldCheck } from "lucide-react";
import type { EditorDraft } from "@/features/legacy-tools/types";
import { cn } from "@/shared/lib/cn";

type EditorViewProps = {
  draft: EditorDraft;
  copied: boolean;
  missing: string[];
  output: string;
  entityKindLabels: Record<EditorDraft["entityKind"], string>;
  maturityLabels: Record<EditorDraft["maturity"], { label: string }>;
  confidenceLabels: Record<EditorDraft["confidence"], { label: string }>;
  onUpdate: <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) => void;
  onCopy: () => void;
  onReset: () => void;
};

export function EditorView({
  draft,
  copied,
  missing,
  output,
  entityKindLabels,
  maturityLabels,
  confidenceLabels,
  onUpdate,
  onCopy,
  onReset,
}: EditorViewProps) {
  return (
    <div className="editor-view">
      <section className="editor-hero"><span className="section-kicker">Работает только на этом компьютере</span><h1>Черновик карточки</h1><p>Форма ничего не публикует. Она помогает заполнить все поля одинаково и подготовить данные к ручной проверке.</p></section>
      <div className="editor-layout">
        <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
          <div className="editor-row"><label>ID<input value={draft.id} onChange={(event) => onUpdate("id", event.target.value)} placeholder="lowercase-with-dashes" /></label><label>Название<input value={draft.name} onChange={(event) => onUpdate("name", event.target.value)} /></label></div>
          <label>Что это одной фразой<textarea value={draft.summary} onChange={(event) => onUpdate("summary", event.target.value)} rows={3} /></label>
          <div className="editor-row"><label>Что это<select value={draft.entityKind} onChange={(event) => onUpdate("entityKind", event.target.value as EditorDraft["entityKind"])}>{Object.entries(entityKindLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label><label>Как часто используют название<select value={draft.maturity} onChange={(event) => onUpdate("maturity", event.target.value as EditorDraft["maturity"])}>{Object.entries(maturityLabels).filter(([id]) => id !== "unreviewed").map(([id, item]) => <option value={id} key={id}>{item.label}</option>)}</select></label><label>Насколько хорошо проверено<select value={draft.confidence} onChange={(event) => onUpdate("confidence", event.target.value as EditorDraft["confidence"])}>{Object.entries(confidenceLabels).filter(([id]) => id !== "unreviewed").map(([id, item]) => <option value={id} key={id}>{item.label}</option>)}</select></label></div>
          <label>Куда поставить карточку и почему<textarea value={draft.verdict} onChange={(event) => onUpdate("verdict", event.target.value)} rows={3} /></label>
          <label>История названия<textarea value={draft.history} onChange={(event) => onUpdate("history", event.target.value)} rows={5} /></label>
          <div className="editor-row"><label>Что слушать — по строке на признак<textarea value={draft.listenFor} onChange={(event) => onUpdate("listenFor", event.target.value)} rows={6} placeholder={"длинный чистый саб\nредкий сухой клэп\nпэд меняется медленно"} /></label><label>Продюсеру — по строке на заметку<textarea value={draft.production} onChange={(event) => onUpdate("production", event.target.value)} rows={6} /></label></div>
          <label>Источники — по одной ссылке на строку<textarea value={draft.sources} onChange={(event) => onUpdate("sources", event.target.value)} rows={5} /></label>
        </form>
        <aside className="editor-preview">
          <div className={cn("completion-card", missing.length === 0 && "completion-card--ready")}><span>{missing.length === 0 ? <ShieldCheck size={20} /> : <ListFilter size={20} />}</span><div><strong>{missing.length === 0 ? "Основные поля заполнены" : `Осталось: ${missing.length}`}</strong>{missing.length > 0 && <ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul>}</div></div>
          <pre>{output}</pre>
          <button className="button button--primary" onClick={onCopy}>{copied ? "Скопировано" : "Скопировать готовые данные"}</button>
          <button className="button button--ghost" onClick={onReset}>Очистить форму</button>
        </aside>
      </div>
    </div>
  );
}
