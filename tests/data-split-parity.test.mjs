import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const project = new URL("../", import.meta.url);

async function transpile(relative, replacements = []) {
  let source = await readFile(new URL(relative, project), "utf8");
  for (const [from, to] of replacements) source = source.replace(from, to);
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
}

function asModuleUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

async function loadRuntimeModules() {
  const generated = await transpile("app/research-generated.ts");
  const generatedUrl = asModuleUrl(generated);
  const research = await transpile("app/research-data.ts", [["./research-generated", generatedUrl]]);
  const researchUrl = asModuleUrl(research);
  const atlas = await transpile("app/atlas-data.ts", [["./research-data", researchUrl]]);
  const [atlasModule, projections, finder] = await Promise.all([
    import(asModuleUrl(atlas)),
    import(asModuleUrl(await transpile("app/atlas-data-projections.ts"))),
    import(asModuleUrl(await transpile("features/finder/model.ts"))),
  ]);
  return { atlas: atlasModule, projections, finder };
}

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function fieldsReadFromEntry(source) {
  return [...new Set([...source.matchAll(/\bentry\.([A-Za-z0-9_]+)/g)].map((match) => match[1]))].sort();
}

const indexFields = [
  "id", "name", "family", "parent", "status", "summary", "signature", "researchState", "entityKind", "maturity",
].sort();

const searchFields = [
  "id", "name", "aliases", "artists", "producers", "examples", "summary", "signature", "verdict", "listenFor", "production", "tags",
].sort();

const finderFields = [
  "id", "name", "family", "summary", "signature", "bass", "drums", "mood", "listenFor", "production", "tags", "artists", "producers",
  "profile", "researchState", "maturity", "entityKind", "confusions",
].sort();

test("data split projections reconstruct every active atlas card without changing fields", async () => {
  const { atlas, projections } = await loadRuntimeModules();
  const { entries } = atlas;

  assert.equal(entries.length, 250, "expected 250 active cards");
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 250, "active ids must be unique");

  for (const entry of entries) {
    const index = projections.getAtlasIndexEntry(entry);
    const details = projections.getEntryDetails(entry);
    const reconstructed = projections.mergeAtlasEntry(index, details);

    assert.equal(index.id, details.id, `${entry.id} index and details ids must match`);
    assert.deepEqual(sortedKeys(index), indexFields, `${entry.id} index fields must remain exact`);
    assert.deepEqual(reconstructed, entry, `${entry.id} must reconstruct exactly`);
    assert.deepEqual(
      [...new Set([...Object.keys(index), ...Object.keys(details)])].sort(),
      sortedKeys(entry),
      `${entry.id} must not lose or add runtime fields`,
    );
    assert.ok(sortedKeys(index).every((field) => field in entry), `${entry.id} index must not add fields`);
    assert.ok(sortedKeys(details).every((field) => field in entry), `${entry.id} details must not add fields`);
  }
});

test("family detail groups cover every active card exactly once", async () => {
  const { atlas, projections } = await loadRuntimeModules();
  const modules = projections.groupEntryDetailsByFamily(atlas.entries);
  const ids = modules.flatMap((familyModule) => familyModule.details.map((details) => details.id));
  const indexById = new Map(atlas.entries.map((entry) => [entry.id, entry]));

  assert.equal(ids.length, 250, "family modules must contain 250 details records");
  assert.equal(new Set(ids).size, 250, "family modules must not duplicate ids");
  assert.deepEqual([...ids].sort(), [...indexById.keys()].sort(), "family modules must cover all active ids");
  for (const familyModule of modules) {
    for (const details of familyModule.details) {
      assert.equal(indexById.get(details.id).family, familyModule.family, `${details.id} belongs to its family module`);
    }
  }
});

test("search and Finder projections contain every current runtime field they need", async () => {
  const [{ atlas, projections, finder }, searchSource, finderSource, finderViewSource] = await Promise.all([
    loadRuntimeModules(),
    readFile(new URL("../app/atlas-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/finder/model.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/finder/FinderView.tsx", import.meta.url), "utf8"),
  ]);

  const searchStart = searchSource.indexOf("export const searchEntries");
  const searchEnd = searchSource.indexOf("export const discoveryRoutes", searchStart);
  const searchRuntimeFields = fieldsReadFromEntry(searchSource.slice(searchStart, searchEnd));
  const finderRuntimeFields = [...new Set([
    ...fieldsReadFromEntry(finderSource),
    ...fieldsReadFromEntry(finderViewSource),
  ])].sort();

  assert.deepEqual(searchRuntimeFields, searchFields.filter((field) => field !== "id"));
  assert.deepEqual(finderRuntimeFields, finderFields);

  const aliasEntry = atlas.entries.find((entry) => entry.aliases.length > 0);
  const artistEntry = atlas.entries.find((entry) => entry.artists.length > 0);
  const producerEntry = atlas.entries.find((entry) => entry.producers.length > 0);
  const exampleEntry = atlas.entries.find((entry) => entry.examples.length > 0);
  const productionEntry = atlas.entries.find((entry) => entry.production.length > 0 && entry.listenFor.length > 0 && entry.verdict);
  assert.ok(aliasEntry && artistEntry && producerEntry && exampleEntry && productionEntry, "representative search data must exist");

  assert.deepEqual(projections.getSearchIndexEntry(aliasEntry).aliases, aliasEntry.aliases);
  assert.deepEqual(projections.getSearchIndexEntry(artistEntry).artists, artistEntry.artists);
  assert.deepEqual(projections.getSearchIndexEntry(producerEntry).producers, producerEntry.producers);
  assert.deepEqual(projections.getSearchIndexEntry(exampleEntry).examples, exampleEntry.examples);
  assert.deepEqual(projections.getSearchIndexEntry(productionEntry).listenFor, productionEntry.listenFor);
  assert.deepEqual(projections.getSearchIndexEntry(productionEntry).production, productionEntry.production);
  assert.equal(projections.getSearchIndexEntry(productionEntry).verdict, productionEntry.verdict);

  const representativeFamilies = [...new Map(atlas.entries.map((entry) => [entry.family, entry])).values()].slice(0, 3);
  for (const entry of representativeFamilies) {
    const finderEntry = projections.getFinderDataEntry(entry);
    assert.deepEqual(sortedKeys(finderEntry), finderFields);
    for (const field of finderFields) assert.deepEqual(finderEntry[field], entry[field], `${entry.id} preserves Finder ${field}`);
  }

  const filters = [
    { focus: ["bass"], bass: ["clean"], rhythm: ["sparse"], melody: [], energy: 2, space: 4, distortion: 1, reference: "", reviewedOnly: true, showDisputed: false },
    { focus: ["drums", "vocals"], bass: ["distorted"], rhythm: ["broken"], melody: ["dark"], energy: 4, space: 3, distortion: 4, reference: "Luci4", reviewedOnly: false, showDisputed: true },
  ];
  const reconstructed = atlas.entries.map((entry) => projections.mergeAtlasEntry(projections.getAtlasIndexEntry(entry), projections.getEntryDetails(entry)));
  for (const filter of filters) {
    assert.deepEqual(finder.getFinderResults(reconstructed, filter), finder.getFinderResults(atlas.entries, filter));
  }
});
