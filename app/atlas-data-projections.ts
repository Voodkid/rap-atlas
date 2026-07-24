import type {
  AtlasEntry,
  AtlasIndexEntry,
  EntryDetails,
  EntryDetailsModule,
  FinderDataEntry,
  SearchIndexEntry,
} from "./atlas-types";

export function getAtlasIndexEntry(entry: AtlasEntry): AtlasIndexEntry {
  return {
    id: entry.id,
    name: entry.name,
    family: entry.family,
    parent: entry.parent,
    status: entry.status,
    summary: entry.summary,
    signature: entry.signature,
    researchState: entry.researchState,
    entityKind: entry.entityKind,
    maturity: entry.maturity,
  };
}

export function getEntryDetails(entry: AtlasEntry): EntryDetails {
  return {
    id: entry.id,
    bass: entry.bass,
    drums: entry.drums,
    mood: entry.mood,
    tempo: entry.tempo,
    era: entry.era,
    aliases: entry.aliases,
    artists: entry.artists,
    producers: entry.producers,
    related: entry.related,
    tags: entry.tags,
    profile: entry.profile,
    ...(entry.source === undefined ? {} : { source: entry.source }),
    confidence: entry.confidence,
    verdict: entry.verdict,
    history: entry.history,
    listenFor: entry.listenFor,
    production: entry.production,
    confusions: entry.confusions,
    sources: entry.sources,
    relationNotes: entry.relationNotes,
    examples: entry.examples,
    canonicalId: entry.canonicalId,
    needsListeningCheck: entry.needsListeningCheck,
    reviewedAt: entry.reviewedAt,
    researchBatch: entry.researchBatch,
  };
}

export function mergeAtlasEntry(indexEntry: AtlasIndexEntry, details: EntryDetails): AtlasEntry {
  return {
    id: indexEntry.id,
    name: indexEntry.name,
    family: indexEntry.family,
    parent: indexEntry.parent,
    status: indexEntry.status,
    summary: indexEntry.summary,
    signature: indexEntry.signature,
    bass: details.bass,
    drums: details.drums,
    mood: details.mood,
    tempo: details.tempo,
    era: details.era,
    aliases: details.aliases,
    artists: details.artists,
    producers: details.producers,
    related: details.related,
    tags: details.tags,
    profile: details.profile,
    ...(details.source === undefined ? {} : { source: details.source }),
    researchState: indexEntry.researchState,
    entityKind: indexEntry.entityKind,
    maturity: indexEntry.maturity,
    confidence: details.confidence,
    verdict: details.verdict,
    history: details.history,
    listenFor: details.listenFor,
    production: details.production,
    confusions: details.confusions,
    sources: details.sources,
    relationNotes: details.relationNotes,
    examples: details.examples,
    canonicalId: details.canonicalId,
    needsListeningCheck: details.needsListeningCheck,
    reviewedAt: details.reviewedAt,
    researchBatch: details.researchBatch,
  };
}

export function getSearchIndexEntry(entry: AtlasEntry): SearchIndexEntry {
  return {
    id: entry.id,
    name: entry.name,
    aliases: entry.aliases,
    artists: entry.artists,
    producers: entry.producers,
    examples: entry.examples,
    summary: entry.summary,
    signature: entry.signature,
    verdict: entry.verdict,
    listenFor: entry.listenFor,
    production: entry.production,
    tags: entry.tags,
  };
}

export function getFinderDataEntry(entry: AtlasEntry): FinderDataEntry {
  return {
    id: entry.id,
    name: entry.name,
    family: entry.family,
    summary: entry.summary,
    signature: entry.signature,
    bass: entry.bass,
    drums: entry.drums,
    mood: entry.mood,
    listenFor: entry.listenFor,
    production: entry.production,
    tags: entry.tags,
    artists: entry.artists,
    producers: entry.producers,
    profile: entry.profile,
    researchState: entry.researchState,
    maturity: entry.maturity,
    entityKind: entry.entityKind,
    confusions: entry.confusions,
  };
}

export function groupEntryDetailsByFamily(entries: AtlasEntry[]): EntryDetailsModule[] {
  const modules = new Map<EntryDetailsModule["family"], EntryDetailsModule>();

  for (const entry of entries) {
    const familyModule = modules.get(entry.family);
    if (familyModule) {
      familyModule.details.push(getEntryDetails(entry));
    } else {
      modules.set(entry.family, { family: entry.family, details: [getEntryDetails(entry)] });
    }
  }

  return [...modules.values()];
}
