import type { AtlasEntry, EntityKind } from "@/app/atlas-data";

export type EditorDraft = {
  id: string;
  name: string;
  summary: string;
  entityKind: EntityKind;
  maturity: AtlasEntry["maturity"];
  confidence: AtlasEntry["confidence"];
  verdict: string;
  history: string;
  listenFor: string;
  production: string;
  sources: string;
};
