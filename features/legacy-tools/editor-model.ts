import type { EditorDraft } from "@/features/legacy-tools/types";

export const emptyEditorDraft: EditorDraft = { id: "", name: "", summary: "", entityKind: "microgenre", maturity: "local", confidence: "medium", verdict: "", history: "", listenFor: "", production: "", sources: "" };

export function getEditorLines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function getEditorMissing(draft: EditorDraft): string[] {
  return [
    !draft.id && "ID",
    !draft.name && "название",
    !draft.summary && "короткое объяснение",
    getEditorLines(draft.listenFor).length < 3 && "три слышимых признака",
    getEditorLines(draft.production).length < 2 && "продюсерские заметки",
    !draft.history && "история термина",
    getEditorLines(draft.sources).length === 0 && "источники",
  ].filter(Boolean) as string[];
}

export function getEditorOutput(draft: EditorDraft) {
  return JSON.stringify({
    id: draft.id.trim(), name: draft.name.trim(), summary: draft.summary.trim(), entityKind: draft.entityKind,
    maturity: draft.maturity, confidence: draft.confidence, verdict: draft.verdict.trim(), history: draft.history.trim(),
    listenFor: getEditorLines(draft.listenFor), production: getEditorLines(draft.production),
    sources: getEditorLines(draft.sources).map((url) => ({ label: "Уточнить подпись", url })),
  }, null, 2);
}
