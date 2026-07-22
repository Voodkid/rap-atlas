import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const researchDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(researchDir);
const atlasPath = path.join(projectDir, "app", "atlas-data.ts");
const outputPath = path.join(projectDir, "app", "research-generated.ts");

const unnumberedCards = new Map([
  ["proto-rage", 131], ["rage-1", 132], ["opium-rage", 133], ["sample-rage", 134],
  ["rage-2", 135], ["noise-rage", 136], ["noise-pollution", 137], ["love-blur", 138],
  ["anime-princess", 139], ["cyberpunk-rage", 140], ["sample-step", 61], ["modern-jerk", 62],
  ["original-jerkin", 63], ["1c34", 64], ["hoodtrap", 65], ["cloud-hoodtrap", 66],
  ["drill-hoodtrap", 67], ["lowend-hoodtrap", 68], ["rnb-hoodtrap", 69], ["jugg-fxspam", 70],
]);

function cleanUrl(value) {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "srsltid") url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return value;
  }
}

function collectReferences(text) {
  const references = new Map();
  for (const match of text.matchAll(/^\[(\d+)\]:\s+(https?:\/\/\S+)/gm)) {
    references.set(match[1], cleanUrl(match[2]));
  }
  return references;
}

function resolveReferences(text, references) {
  return text
    .replace(/\[([^\]\n]+)\]\[(\d+)\]/g, (full, label, number) => {
      const url = references.get(number);
      return url ? `[${label}](${url})` : full;
    })
    .replace(/https?:\/\/[^\s\)\]>"']+/g, (url) => cleanUrl(url))
    .trim();
}

function plain(value = "") {
  return value
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/родословн(ая|ую|ой|ые)/gi, "история происхождения")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

function shorten(value, limit) {
  const clean = plain(value);
  if (clean.length <= limit) return clean;
  const slice = clean.slice(0, limit);
  const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "));
  return `${slice.slice(0, stop > limit * 0.55 ? stop + 1 : limit).trim()}…`;
}

function field(section, labels) {
  for (const label of Array.isArray(labels) ? labels : [labels]) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = section.match(new RegExp(`(?:^|\\n)\\s*[-*]?\\s*\\*\\*${escaped}:\\*\\*\\s*([^\\n]+)`, "i"));
    if (match) return plain(match[1]);
  }
  return "";
}

function splitItems(value) {
  if (!value || /^(нет|не найден|не установ)/i.test(value)) return [];
  const separator = value.includes(";") ? /\s*;\s*/ : /\s*,\s*/;
  return [...new Set(value.split(separator).map((item) => plain(item)).filter((item) => item.length > 1 && item.length < 100))];
}

function splitSentences(value, maximum = 3) {
  return plain(value)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maximum);
}

function parseSections(body, references) {
  const matches = [...body.matchAll(/^###\s+(\d+)\.\s+[^\n]*\n/gm)];
  const sections = new Map();
  for (let index = 0; index < matches.length; index += 1) {
    const start = matches[index].index + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    sections.set(Number(matches[index][1]), resolveReferences(body.slice(start, end).replace(/^---\s*$/gm, ""), references));
  }
  return sections;
}

function parseRawEntries() {
  const text = fs.readFileSync(atlasPath, "utf8");
  const start = text.indexOf("const rawEntries: RawEntry[] = [");
  const end = text.indexOf("\n];", start);
  const source = text.slice(start, end);
  const matches = [...source.matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"([\s\S]*?)(?=\n\s*\},)/g)];
  return matches.map((match) => {
    const block = match[3];
    const relatedMatch = block.match(/related:\s*\[([^\]]*)\]/);
    const related = relatedMatch ? [...relatedMatch[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]) : [];
    return { id: match[1], name: match[2], related };
  });
}

const rawEntries = parseRawEntries();
if (rawEntries.length !== 253) throw new Error(`Ожидалось 253 исходные карточки, найдено ${rawEntries.length}`);
const rawById = new Map(rawEntries.map((entry) => [entry.id, entry]));

function rawEntryForResearchNumber(number) {
  const rawNumber = number <= 150 ? number + 22 : number <= 172 ? number - 150 : number;
  return rawEntries[rawNumber - 1];
}

function parseCards(fileName) {
  const filePath = path.join(researchDir, fileName);
  const text = fs.readFileSync(filePath, "utf8");
  const references = collectReferences(text);
  const headings = [...text.matchAll(/^#{1,2}\s+([^\n]+)\n/gm)];
  const cards = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index][1].trim();
    const numeric = heading.match(/^(\d{2,3})\s+—\s+(.+)$/);
    const slugged = heading.match(/^([a-z0-9-]+)\s+—\s+(.+)$/i);
    const number = numeric ? Number(numeric[1]) : unnumberedCards.get(slugged?.[1]);
    if (!number || number < 51 || number > 250) continue;

    const entry = rawEntryForResearchNumber(number);
    if (!entry) throw new Error(`Не найдена исходная карточка для исследовательского номера ${number}`);
    const start = headings[index].index + headings[index][0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : text.length;
    cards.push({ number, entry, fileName, sections: parseSections(text.slice(start, end), references) });
  }
  return cards;
}

const inputNames = Array.from({ length: 20 }, (_, index) => `agent-${String(index + 6).padStart(2, "0")}.md`);
const cards = inputNames.flatMap(parseCards).sort((left, right) => left.number - right.number);
const expected = Array.from({ length: 200 }, (_, index) => index + 51);
const numbers = cards.map((card) => card.number);
const missing = expected.filter((number) => !numbers.includes(number));
const duplicateNumbers = numbers.filter((number, index) => numbers.indexOf(number) !== index);
if (cards.length !== 200 || missing.length || duplicateNumbers.length) {
  throw new Error(`Покрытие исследований неверно: ${cards.length}; пропуски ${missing.join(", ")}; дубли ${duplicateNumbers.join(", ")}`);
}

function inferEntityKind(section, decision) {
  const text = `${field(section, "Что обозначает название")} ${decision}`.toLowerCase();
  if (/служебн|навигационн/.test(text)) return "umbrella";
  if (/коллектив|команд|crew/.test(text)) return "collective";
  if (/лейбл|импринт/.test(text)) return "label";
  if (/партн[её]р|дуэт|связк[аи] продюсер/.test(text)) return "partnership";
  if (/продюсерск(ая|ую) школ|стиль группы продюсер/.test(text)) return "school";
  if (/сцен[аыу]|круг артист|движени/.test(text)) return "scene";
  if (/волна|период|эра/.test(text)) return "wave";
  if (/гибрид|смешени|сочетани/.test(text)) return "hybrid";
  if (/техник|при[её]м|способ обработ/.test(text)) return "technique";
  if (/релиз|альбом|песн|трек-референс/.test(text)) return "release";
  if (/стиль одного|стиль артист|авторск(ий|ая) стил/.test(text)) return "influence";
  if (/алиас|другое название/.test(text)) return "alias";
  if (/поисков|type.?beat|тег|фильтр|описательн/.test(text)) return "filter";
  if (/общее название|зонтич|семейств/.test(text)) return "umbrella";
  if (/микрожанр|микростиль/.test(text)) return "microgenre";
  if (/жанр/.test(text)) return "genre";
  if (/не подтверж|не является|ошибоч/.test(text)) return "misnomer";
  return "microgenre";
}

function inferConfidence(section) {
  const value = field(section, "Насколько хорошо проверено").toLowerCase();
  if (/высок|хорошо|high/.test(value)) return "high";
  if (/низк|мало данных|low|не подтверж/.test(value)) return "low";
  return "medium";
}

function inferMaturity(section, kind) {
  const value = `${field(section, "Насколько часто его используют")} ${field(section, "Насколько распространено название")}`.toLowerCase();
  if (/не подтверж|почти не|не использ|единичн/.test(value)) return "unconfirmed";
  if (/спорн/.test(value) || ["misnomer", "release"].includes(kind)) return "disputed";
  if (/широк|зонтич|слишком свобод/.test(value) || kind === "umbrella") return "broad";
  if (/устоя|широко|подтверж|исторически устойчив/.test(value) && ["genre", "microgenre"].includes(kind)) return "confirmed";
  return "local";
}

function statusFor(kind) {
  if (kind === "genre") return "established";
  if (kind === "microgenre" || kind === "wave") return "emerging";
  if (["scene", "school", "collective", "partnership", "label"].includes(kind)) return "scene";
  if (["filter", "technique", "alias", "influence", "release"].includes(kind)) return "tag";
  if (kind === "hybrid") return "adjacent";
  if (kind === "umbrella") return "umbrella";
  return "misnomer";
}

function parseSoundTable(section) {
  const result = new Map();
  for (const line of section.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line) || /^\s*\|\s*-/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => plain(cell));
    if (cells.length < 2 || /часть музыки/i.test(cells[0])) continue;
    result.set(cells[0].toLowerCase(), cells[1]);
  }
  return result;
}

function findSound(table, patterns) {
  for (const [key, value] of table) if (patterns.some((pattern) => key.includes(pattern))) return value;
  return "";
}

function parseSources(section) {
  const sources = [];
  const seen = new Set();
  for (const match of section.matchAll(/\[([^\]\n]+)\]\((https?:\/\/[^\)]+)\)/g)) {
    const url = cleanUrl(match[2]);
    if (seen.has(url)) continue;
    seen.add(url);
    sources.push({ label: plain(match[1]).slice(0, 120) || new URL(url).hostname, url });
  }
  for (const match of section.matchAll(/(?<!\()https?:\/\/[^\s\)\]>"']+/g)) {
    const url = cleanUrl(match[0]);
    if (seen.has(url)) continue;
    seen.add(url);
    sources.push({ label: new URL(url).hostname.replace(/^www\./, ""), url });
  }
  return sources;
}

function parseExamples(section) {
  const examples = [];
  for (const line of section.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line) || /^\s*\|\s*-/.test(line)) continue;
    const rawCells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (rawCells.length < 5 || /роль примера/i.test(rawCells[0])) continue;
    const artistAndTitle = plain(rawCells[1]);
    const divider = artistAndTitle.search(/\s[—–]\s/);
    if (divider < 1) continue;
    const roleText = plain(rawCells[0]).toLowerCase();
    const link = rawCells[3].match(/\]\((https?:\/\/[^\)]+)\)/)?.[1] ?? rawCells[3].match(/https?:\/\/[^\s]+/)?.[0];
    const role = /ошиб|не относ|ложн/.test(roleText) ? "misattributed"
      : /погранич|границ/.test(roleText) ? "borderline"
      : /ранн|предшествен/.test(roleText) ? "early"
      : /соврем|поздн/.test(roleText) ? "modern" : "core";
    examples.push({
      artist: artistAndTitle.slice(0, divider).trim(),
      title: artistAndTitle.slice(divider + 3).trim(),
      role,
      listenFor: plain(rawCells[4] || rawCells[5] || "Сверить с описанием карточки."),
      ...(link ? { url: cleanUrl(link) } : {}),
    });
  }
  return examples.slice(0, 12);
}

function parsePeople(section, labels) {
  return splitItems(field(section, labels)).map((item) => item.replace(/\s*\([^\)]*\)\s*/g, " ").trim()).filter(Boolean);
}

function normalize(value) {
  return plain(value).toLowerCase().replace(/[’']/g, "").replace(/[^a-zа-яё0-9#]+/gi, " ").trim();
}

const relationCandidates = rawEntries.map((entry) => {
  const names = [entry.id, entry.name, ...entry.name.split(/\s*\/\s*/)]
    .map(normalize)
    .filter((value) => value.length >= 4);
  return { ...entry, names: [...new Set(names)] };
});

function parseRelationNotes(section, currentId) {
  const notes = [];
  const seen = new Set();
  for (const rawLine of section.split(/\r?\n/)) {
    if (!/^\s*[-*]/.test(rawLine)) continue;
    const line = plain(rawLine);
    const normalizedLine = ` ${normalize(line)} `;
    const label = rawLine.match(/\*\*([^:]+):\*\*/)?.[1]?.toLowerCase() ?? "";
    const type = /алиас|старое|другое название/.test(label) ? "alias"
      : /часть сцены|сцен/.test(label) ? "scene"
      : /гибрид|смеш/.test(label) ? "hybrid"
      : /вырос|повлиял|влияни/.test(label) ? "influence"
      : /перенаправ|объедин/.test(label) ? "redirect" : "overlap";
    for (const candidate of relationCandidates) {
      if (candidate.id === currentId || seen.has(candidate.id)) continue;
      if (!candidate.names.some((name) => normalizedLine.includes(` ${name} `))) continue;
      seen.add(candidate.id);
      notes.push({ target: candidate.id, type, note: shorten(line, 260) });
      if (notes.length >= 6) return notes;
    }
  }
  return notes;
}

function makeRecord(card) {
  const s1 = card.sections.get(1) ?? "";
  const s2 = card.sections.get(2) ?? "";
  const s4 = card.sections.get(4) ?? "";
  const s5 = card.sections.get(5) ?? "";
  const s7 = card.sections.get(7) ?? "";
  const s8 = card.sections.get(8) ?? "";
  const s9 = card.sections.get(9) ?? "";
  const s10 = card.sections.get(10) ?? "";
  const s11 = card.sections.get(11) ?? "";
  const decision = field(s1, "Решение для RAP ATLAS");
  const reason = field(s1, ["Короткая причина решения", "Короткая причина"]);
  const kind = inferEntityKind(s1, decision);
  const confidence = inferConfidence(s1);
  const maturity = inferMaturity(s1, kind);
  const summary = shorten(field(s11, "Что это") || s2, 520);
  const signs = splitItems(field(s11, "Три слышимых признака"));
  const soundTable = parseSoundTable(s5);
  const bass = findSound(soundTable, ["бас", "808", "низ"]);
  const rhythm = findSound(soundTable, ["ритм"]);
  const drums = findSound(soundTable, ["ударн", "барабан"]);
  const melody = findSound(soundTable, ["мелоди", "аккорд"]);
  const texture = findSound(soundTable, ["текстур", "эффект"]);
  const mix = findSound(soundTable, ["микс"]);
  const tempo = findSound(soundTable, ["bpm", "темп"]);
  const fallbackSigns = [drums || rhythm, bass, melody].filter(Boolean);
  const listenFor = [...new Set([...signs, ...fallbackSigns])].filter(Boolean).slice(0, 5);
  const producerNote = field(s11, ["Короткая заметка для продюсера", "Заметка для продюсера", "Продюсеру"]);
  const boundary = field(s11, ["Главное отличие от ближайшего соседа", "Главное отличие"]);
  const commonError = field(s11, ["Частая ошибка", "Ошибка"]);
  const sources = parseSources(s10);
  const aliases = splitItems(field(s1, "Другие написания и алиасы"));
  const verdict = shorten([decision, reason].filter(Boolean).join(" ") || field(s1, "Что обозначает название") || summary, 700);
  const relationNotes = parseRelationNotes(s9, card.entry.id);
  const originalRelated = card.entry.related.filter((target) => rawById.has(target));
  for (const target of originalRelated) {
    if (relationNotes.some((note) => note.target === target)) continue;
    relationNotes.push({ target, type: "overlap", note: `Связано с ${rawById.get(target).name}; точная граница объясняется в исследовании карточки.` });
    if (relationNotes.length >= 6) break;
  }

  const record = {
    status: statusFor(kind),
    summary,
    signature: listenFor.join("; "),
    aliases,
    artists: parsePeople(s8, ["Ключевые артисты", "Артисты"]),
    producers: parsePeople(s8, ["Ключевые продюсеры", "Продюсеры"]),
    tags: [...new Set([kind, maturity, ...aliases.map((item) => item.toLowerCase())])].slice(0, 12),
    entityKind: kind,
    confidence,
    maturity,
    verdict,
    history: shorten(s4, 1400),
    listenFor,
    production: splitSentences(producerNote, 4),
    confusions: [boundary, commonError].filter(Boolean),
    sources,
    relationNotes,
    examples: parseExamples(s7),
    needsListeningCheck: sources.length === 0 || /не (выполня|провод).{0,30}прослуш|не мог.{0,30}прослуш/i.test(`${s5} ${s7}`),
    reviewedAt: "22 июля 2026",
    researchBatch: card.number <= 150 ? "03 · Ambient / Jerk / Digital / HexD / Rage" : "04 · Cloud / Regional / Phonk / Rock / Global",
  };

  return {
    record,
    sound: {
      bass: shorten(bass || "Описание баса в отчёте не отделено от общего разбора.", 420),
      drums: shorten([rhythm, drums].filter(Boolean).join(" ") || "Описание ударных в отчёте не отделено от общего разбора.", 520),
      mood: shorten([texture, mix].filter(Boolean).join(" ") || field(s11, "Три слышимых признака"), 420),
      tempo: shorten(tempo || "Единый диапазон BPM не подтверждён.", 240),
    },
  };
}

const overrides = {};
const sounds = {};
for (const card of cards) {
  const { record, sound } = makeRecord(card);
  overrides[card.entry.id] = record;
  sounds[card.entry.id] = sound;
}

const header = `// Этот файл создаётся из Research/agent-06.md — agent-25.md.\n// Не редактировать вручную: запусти Research/generate-site-data.mjs.\nimport type { ResearchOverride, ReviewedSound } from "./research-data";\n\n`;
const output = `${header}export const generatedResearchOverrides: Record<string, ResearchOverride> = ${JSON.stringify(overrides, null, 2)};\n\nexport const generatedReviewedSounds: Record<string, ReviewedSound> = ${JSON.stringify(sounds, null, 2)};\n`;
fs.writeFileSync(outputPath, output, "utf8");

const sourceCount = Object.values(overrides).reduce((total, record) => total + record.sources.length, 0);
const exampleCount = Object.values(overrides).reduce((total, record) => total + record.examples.length, 0);
console.log(outputPath);
console.log(`cards=${Object.keys(overrides).length}`);
console.log(`sources=${sourceCount}`);
console.log(`examples=${exampleCount}`);
