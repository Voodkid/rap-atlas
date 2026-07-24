import Ajv2020 from "ajv/dist/2020.js";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, normalize } from "node:path";

const requiredFiles = ["card.json", "content.ru.md", "evidence.json", "review.json"];
export const profileSections = {
  sound_direction: ["overview", "sound", "make", "listen", "check", "tools", "people", "context", "relations", "history"],
  scene_context: ["overview", "context", "place-time", "participants", "sound", "listen", "key-releases", "timeline", "production", "relations", "history"],
  organization: ["overview", "role", "people-catalog", "activity", "sound", "key-releases", "timeline", "context", "relations", "history"],
  term_reference: ["overview", "meaning", "usage-boundaries", "origin", "sound-cues", "examples", "confusions", "context", "relations", "history"],
  release_reference: ["overview", "release-context", "credits", "sound", "listen", "track-map", "production", "influence-reception", "context", "relations"],
};
const requiredSections = {
  sound_direction: ["overview", "sound", "make"],
  scene_context: ["overview", "context", "place-time", "participants"],
  organization: ["overview", "role", "people-catalog"],
  term_reference: ["overview", "meaning", "usage-boundaries"],
  release_reference: ["overview", "release-context", "credits"],
};

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function schemas(root) {
  const schemaRoot = join(root, "schemas");
  const names = ["card", "evidence", "review", "media", "content-release"];
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const result = {};
  for (const name of names) result[name] = ajv.compile(await json(join(schemaRoot, `${name}.schema.json`)));
  return result;
}

function markdown(text, profile, mediaPresent, claimIds, label, errors) {
  if (/<\/?[A-Za-z][^>]*>/u.test(text)) errors.push(`${label}: raw HTML is forbidden`);
  const sections = [...text.matchAll(/^##\s+.+\{#([a-z0-9-]+)\}\s*$/gmu)].map((match) => match[1]);
  const allowed = profileSections[profile] ?? [];
  for (const section of requiredSections[profile] ?? []) if (!sections.includes(section)) errors.push(`${label}: missing required section ${section}`);
  for (const section of sections) if (!allowed.includes(section)) errors.push(`${label}: forbidden section ${section}`);
  const order = sections.map((section) => allowed.indexOf(section));
  if (order.some((value, index) => index > 0 && value <= order[index - 1])) errors.push(`${label}: section order is invalid`);
  if (sections.includes("listen") && !mediaPresent) errors.push(`${label}: listen requires media.json`);
  for (const marker of text.matchAll(/<!--\s*claims:\s*([^>]+?)\s*-->/gu)) {
    for (const id of marker[1].trim().split(/\s+/u)) if (!claimIds.has(id)) errors.push(`${label}: dangling claim marker ${id}`);
  }
}

function schemaErrors(validate, value, label, errors) {
  if (!validate(value)) errors.push(`${label}: schema ${validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ")}`);
}

function safeAssetPath(value) {
  const normalized = value.replaceAll("\\", "/");
  return !normalized.startsWith("/") && !normalized.includes("../") && !normalized.split("/").includes("..");
}

export async function validateContent(root) {
  const errors = [];
  const validators = await schemas(root);
  const taxonomyPath = join(root, "taxonomy", "taxonomy.json");
  const taxonomy = await exists(taxonomyPath) ? await json(taxonomyPath) : { entities: [], tombstones: [] };
  const cardsRoot = join(root, "cards");
  const directories = (await readdir(cardsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const cards = [];
  for (const directory of directories) {
    const cardRoot = join(cardsRoot, directory);
    for (const file of requiredFiles) if (!await exists(join(cardRoot, file))) errors.push(`${directory}: missing required file ${file}`);
    if (errors.some((error) => error.startsWith(`${directory}: missing`))) continue;
    const [card, evidence, review] = await Promise.all([json(join(cardRoot, "card.json")), json(join(cardRoot, "evidence.json")), json(join(cardRoot, "review.json"))]);
    const mediaPresent = await exists(join(cardRoot, "media.json"));
    const media = mediaPresent ? await json(join(cardRoot, "media.json")) : undefined;
    schemaErrors(validators.card, card, `${directory}/card.json`, errors);
    schemaErrors(validators.evidence, evidence, `${directory}/evidence.json`, errors);
    schemaErrors(validators.review, review, `${directory}/review.json`, errors);
    if (mediaPresent) schemaErrors(validators.media, media, `${directory}/media.json`, errors);
    if (directory !== card.id) errors.push(`${directory}: directory must equal entity ID`);
    if (!/^1\./u.test(card.schemaVersion ?? "")) errors.push(`${directory}: incompatible schema major`);
    if (card.id !== evidence.entityId || card.id !== review.entityId || (mediaPresent && card.id !== media.entityId)) errors.push(`${directory}: entity IDs must agree`);
    const claimIds = new Set(evidence.claims.map((claim) => claim.id));
    const sourceIds = new Set(evidence.sources.map((source) => source.id));
    const evidenceIds = new Set(evidence.evidence.map((item) => item.id));
    for (const item of evidence.evidence) if (!sourceIds.has(item.sourceId)) errors.push(`${directory}: dangling source ${item.sourceId}`);
    for (const claim of evidence.claims) for (const evidenceId of claim.evidenceIds) if (!evidenceIds.has(evidenceId)) errors.push(`${directory}: dangling evidence ${evidenceId}`);
    await markdown(await readFile(join(cardRoot, "content.ru.md"), "utf8"), card.contentProfile, mediaPresent, claimIds, directory, errors);
    if (await exists(join(cardRoot, "assets")) && !mediaPresent) errors.push(`${directory}: assets require media.json`);
    if (mediaPresent) for (const asset of media.assets) {
      if (!safeAssetPath(asset.path)) errors.push(`${directory}: media path traversal`);
      else if (!await exists(join(cardRoot, ...asset.path.replaceAll("\\", "/").split("/")))) errors.push(`${directory}: media asset is missing`);
    }
    cards.push({ directory, card, evidence, media: media ?? { references: [], assets: [], derivedAssets: [], playlists: [] }, mediaSourceState: mediaPresent ? "present" : "absent" });
  }
  const ids = new Set([...cards.map((item) => item.card.id), ...taxonomy.entities.map((entity) => entity.id), ...taxonomy.tombstones.map((entity) => entity.id)]);
  const branch = new Map();
  for (const item of cards) for (const relation of item.card.relations) {
    if (relation.targetId === item.card.id) errors.push(`${item.directory}: self-relation ${relation.id}`);
    if (!ids.has(relation.targetId)) errors.push(`${item.directory}: dangling relation ${relation.targetId}`);
    for (const claimId of relation.claimIds) if (!item.evidence.claims.some((claim) => claim.id === claimId)) errors.push(`${item.directory}: dangling relation claim ${claimId}`);
    if (["branch-of", "regional-branch-of"].includes(relation.type)) branch.set(item.card.id, relation.targetId);
  }
  for (const id of branch.keys()) { const seen = new Set(); let cursor = id; while (branch.has(cursor)) { if (seen.has(cursor)) { errors.push(`branch relation cycle at ${cursor}`); break; } seen.add(cursor); cursor = branch.get(cursor); } }
  return { ok: errors.length === 0, errors: [...new Set(errors)].sort(), cards: cards.sort((left, right) => left.card.id.localeCompare(right.card.id)) };
}

export async function generateFixtureRelease(root) {
  const validation = await validateContent(root);
  if (!validation.ok) throw new Error(validation.errors.join("\n"));
  const release = { schemaVersion: "1.0.0", taxonomyVersion: "3.0.0", contentRelease: "fixture", minReaderVersion: "1.0.0", cards: validation.cards.map(({ card, media, mediaSourceState }) => ({ id: card.id, kind: card.kind, contentProfile: card.contentProfile, media, mediaSourceState })) };
  const releaseValidator = (await schemas(root))["content-release"];
  if (!releaseValidator(release)) throw new Error(`generated release: ${releaseValidator.errors.map((error) => error.message).join("; ")}`);
  return stable(release);
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const root = process.argv[2] ? normalize(process.argv[2]) : join(process.cwd(), "content-v3");
  const result = await validateContent(root);
  if (!result.ok) { console.error(result.errors.join("\n")); process.exitCode = 1; }
  else console.log(`content-v3 valid: ${result.cards.length} cards`);
}
