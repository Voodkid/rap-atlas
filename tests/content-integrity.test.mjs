import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const project = new URL("../", import.meta.url);

async function parse(relative) {
  const text = await readFile(new URL(relative, project), "utf8");
  return { text, source: ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS) };
}

function findInitializer(source, name) {
  let found;
  source.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) found = declaration.initializer;
    }
  });
  assert.ok(found, `missing ${name}`);
  return found;
}

function propertyName(property) {
  if (!property.name) return undefined;
  if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) || ts.isNumericLiteral(property.name)) return property.name.text;
  return undefined;
}

function objectProperty(object, name) {
  return object.properties.find((property) => propertyName(property) === name);
}

function stringValue(property) {
  if (!property || !ts.isPropertyAssignment(property)) return undefined;
  return ts.isStringLiteral(property.initializer) || ts.isNoSubstitutionTemplateLiteral(property.initializer) ? property.initializer.text : undefined;
}

function stringArray(property) {
  if (!property || !ts.isPropertyAssignment(property) || !ts.isArrayLiteralExpression(property.initializer)) return [];
  return property.initializer.elements.filter(ts.isStringLiteral).map((item) => item.text);
}

function objectEntries(initializer) {
  assert.ok(ts.isObjectLiteralExpression(initializer), "expected object literal");
  return initializer.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => ({ key: propertyName(property), value: property.initializer }))
    .filter((item) => item.key && ts.isObjectLiteralExpression(item.value));
}

function objectKeys(initializer) {
  assert.ok(ts.isObjectLiteralExpression(initializer), "expected object literal");
  return initializer.properties.map(propertyName).filter(Boolean);
}

test("the 250 reviewed records have one-to-one research and sound data", async () => {
  const [{ source: atlas }, { source: research }, { source: generated }] = await Promise.all([
    parse("app/atlas-data.ts"),
    parse("app/research-data.ts"),
    parse("app/research-generated.ts"),
  ]);
  const raw = findInitializer(atlas, "rawEntries");
  assert.ok(ts.isArrayLiteralExpression(raw));
  const rawObjects = raw.elements.filter(ts.isObjectLiteralExpression);
  const ids = rawObjects.map((object) => stringValue(objectProperty(object, "id"))).filter(Boolean);
  const researchEntries = [
    ...objectEntries(findInitializer(research, "manualResearchOverrides")),
    ...objectEntries(findInitializer(generated, "generatedResearchOverrides")),
  ];
  const soundIds = [
    ...objectKeys(findInitializer(research, "manualReviewedSounds")),
    ...objectKeys(findInitializer(generated, "generatedReviewedSounds")),
  ];
  const researchIds = researchEntries.map((entry) => entry.key);

  assert.equal(new Set(ids).size, ids.length, "raw atlas contains duplicate ids");
  assert.equal(new Set(researchIds).size, researchIds.length, "reviewed ids must be unique across manual and generated data");
  assert.equal(researchIds.length, 250, `expected 250 reviewed records, got ${researchIds.length}`);
  assert.deepEqual([...researchIds].sort(), [...soundIds].sort(), "every reviewed record must have its own bass, drums, mood and tempo");
  for (const id of researchIds) assert.ok(ids.includes(id), `reviewed id ${id} does not exist in the atlas`);
  assert.deepEqual(ids.filter((id) => !researchIds.includes(id)).sort(), ["asia-dream", "mohcore", "punch-rock"], "only the final three cards may remain unreviewed");
});

test("strict parent links are valid and acyclic", async () => {
  const { source } = await parse("app/atlas-data.ts");
  const raw = findInitializer(source, "rawEntries");
  assert.ok(ts.isArrayLiteralExpression(raw));
  const objects = raw.elements.filter(ts.isObjectLiteralExpression);
  const ids = new Set(objects.map((object) => stringValue(objectProperty(object, "id"))).filter(Boolean));
  const parents = new Map();
  for (const object of objects) {
    const id = stringValue(objectProperty(object, "id"));
    const parent = stringValue(objectProperty(object, "parent"));
    if (id && parent) {
      assert.ok(ids.has(parent), `${id} points to missing parent ${parent}`);
      parents.set(id, parent);
    }
    for (const target of stringArray(objectProperty(object, "related"))) assert.ok(ids.has(target), `${id} points to missing related id ${target}`);
  }
  for (const id of ids) {
    const seen = new Set();
    let cursor = id;
    while (parents.has(cursor)) {
      assert.ok(!seen.has(cursor), `parent cycle found at ${cursor}`);
      seen.add(cursor);
      cursor = parents.get(cursor);
    }
  }
});

test("reviewed copy has no duplicate verdicts or known empty AI phrases", async () => {
  const [{ source, text }, { source: generatedSource, text: generatedText }] = await Promise.all([
    parse("app/research-data.ts"),
    parse("app/research-generated.ts"),
  ]);
  const records = [
    ...objectEntries(findInitializer(source, "manualResearchOverrides")),
    ...objectEntries(findInitializer(generatedSource, "generatedResearchOverrides")),
  ];
  const verdicts = records.map(({ value }) => stringValue(objectProperty(value, "verdict"))).filter(Boolean);
  assert.equal(new Set(verdicts).size, verdicts.length, "reviewed cards contain duplicate verdicts");
  const allText = `${text}\n${generatedText}`;
  for (const phrase of ["цифровая романтика", "проклятый интернет", "невозможный 808", "светящиеся плаки", "меланхолия встречается с хаосом"]) {
    assert.ok(!allText.toLowerCase().includes(phrase), `forbidden vague phrase found: ${phrase}`);
  }
});

test("public copy avoids unexplained research jargon", async () => {
  const [{ text: interfaceText }, { text: researchText }, { text: generatedText }] = await Promise.all([
    parse("app/AtlasApp.tsx"),
    parse("app/research-data.ts"),
    parse("app/research-generated.ts"),
  ]);
  const publicCopy = `${interfaceText}\n${researchText}\n${generatedText}`.toLowerCase();
  for (const phrase of [
    "дроновая мелодия",
    "типизированные связи",
    "изображает судью",
    "исследовательское досье",
    "discovery-тег",
    "proper name",
    "self-use",
    "басовая грамматика",
    "драм-формула",
    "родословная",
    "зонтичный микрожанр",
  ]) {
    assert.ok(!publicCopy.includes(phrase), `unexplained wording found: ${phrase}`);
  }
});

test("source gaps in reviewed cards are explicit instead of hidden", async () => {
  const [{ source }, { source: generatedSource }] = await Promise.all([
    parse("app/research-data.ts"),
    parse("app/research-generated.ts"),
  ]);
  const records = [
    ...objectEntries(findInitializer(source, "manualResearchOverrides")),
    ...objectEntries(findInitializer(generatedSource, "generatedResearchOverrides")),
  ];
  for (const { key, value } of records) {
    const sources = objectProperty(value, "sources");
    const emptySources = sources && ts.isPropertyAssignment(sources) && ts.isArrayLiteralExpression(sources.initializer) && sources.initializer.elements.length === 0;
    if (emptySources) {
      const flag = objectProperty(value, "needsListeningCheck");
      assert.ok(flag && ts.isPropertyAssignment(flag) && flag.initializer.kind === ts.SyntaxKind.TrueKeyword, `${key} has no sources but is not marked for follow-up`);
    }
  }
});
