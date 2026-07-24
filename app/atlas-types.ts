import type {
  EntityKind,
  RelationNote,
  ResearchConfidence,
  ResearchSource,
  TermMaturity,
  TrackExample,
} from "./research-data";

export type {
  EntityKind,
  RelationNote,
  ResearchConfidence,
  ResearchSource,
  TermMaturity,
  TrackExample,
} from "./research-data";

export type EntryId = string;

export type FamilyId =
  | "cloud"
  | "plugg"
  | "ambient"
  | "rhythm"
  | "jerk"
  | "digital"
  | "hex"
  | "rage"
  | "regional"
  | "phonk"
  | "rock"
  | "global";

export type EntryStatus =
  | "established"
  | "emerging"
  | "scene"
  | "tag"
  | "adjacent"
  | "misnomer"
  | "umbrella";

export type SourceLink = { label: string; url: string };

export type SoundProfile = {
  energy: number;
  distortion: number;
  ambience: number;
  bounce: number;
  bassWeight: number;
};

export type AtlasEntry = {
  id: EntryId;
  name: string;
  family: FamilyId;
  parent?: EntryId;
  status: EntryStatus;
  summary: string;
  signature: string;
  bass: string;
  drums: string;
  mood: string;
  tempo: string;
  era: string;
  aliases: string[];
  artists: string[];
  producers: string[];
  related: EntryId[];
  tags: string[];
  profile: SoundProfile;
  source?: SourceLink;
  researchState: "reviewed" | "legacy";
  entityKind: EntityKind;
  maturity: TermMaturity | "unreviewed";
  confidence: ResearchConfidence | "unreviewed";
  verdict: string;
  history: string;
  listenFor: string[];
  production: string[];
  confusions: string[];
  sources: ResearchSource[];
  relationNotes: RelationNote[];
  examples: TrackExample[];
  canonicalId?: EntryId;
  needsListeningCheck: boolean;
  reviewedAt?: string;
  researchBatch?: string;
};

export type AtlasIndexEntry = Pick<
  AtlasEntry,
  | "id"
  | "name"
  | "family"
  | "parent"
  | "status"
  | "summary"
  | "signature"
  | "researchState"
  | "entityKind"
  | "maturity"
>;

export type EntryDetails = Pick<
  AtlasEntry,
  "id" | Exclude<keyof AtlasEntry, keyof AtlasIndexEntry>
>;

export type SearchIndexEntry = Pick<
  AtlasEntry,
  | "id"
  | "name"
  | "aliases"
  | "artists"
  | "producers"
  | "examples"
  | "summary"
  | "signature"
  | "verdict"
  | "listenFor"
  | "production"
  | "tags"
>;

export type FinderDataEntry = Pick<
  AtlasEntry,
  | "id"
  | "name"
  | "family"
  | "summary"
  | "signature"
  | "bass"
  | "drums"
  | "mood"
  | "listenFor"
  | "production"
  | "tags"
  | "artists"
  | "producers"
  | "profile"
  | "researchState"
  | "maturity"
  | "entityKind"
  | "confusions"
>;

export type EntryDetailsModule = {
  family: FamilyId;
  details: EntryDetails[];
};

export type FamilyMeta = {
  id: FamilyId;
  order: number;
  code: string;
  name: string;
  short: string;
  description: string;
  color: string;
  root: EntryId;
  defaults: Pick<AtlasEntry, "bass" | "drums" | "mood" | "tempo" | "era" | "profile">;
};
