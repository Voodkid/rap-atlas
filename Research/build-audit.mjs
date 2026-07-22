import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const researchDir = path.dirname(fileURLToPath(import.meta.url));
const cli = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  cli.set(process.argv[index], process.argv[index + 1]);
}

const startAgent = Number(cli.get("--start-agent") ?? 6);
const endAgent = Number(cli.get("--end-agent") ?? 15);
const startCard = Number(cli.get("--start-card") ?? 51);
const endCard = Number(cli.get("--end-card") ?? 150);
const auditPart = Number(cli.get("--part") ?? 3);
const outputName = cli.get("--output") ?? "RAP-ATLAS_AUDIT_03.md";
const outputPath = path.join(researchDir, outputName);
const inputNames = Array.from(
  { length: endAgent - startAgent + 1 },
  (_, index) => `agent-${String(index + startAgent).padStart(2, "0")}.md`,
);

const unnumberedCards = new Map([
  ["proto-rage", 131],
  ["rage-1", 132],
  ["opium-rage", 133],
  ["sample-rage", 134],
  ["rage-2", 135],
  ["noise-rage", 136],
  ["noise-pollution", 137],
  ["love-blur", 138],
  ["anime-princess", 139],
  ["cyberpunk-rage", 140],
  ["sample-step", 61],
  ["modern-jerk", 62],
  ["original-jerkin", 63],
  ["1c34", 64],
  ["hoodtrap", 65],
  ["cloud-hoodtrap", 66],
  ["drill-hoodtrap", 67],
  ["lowend-hoodtrap", 68],
  ["rnb-hoodtrap", 69],
  ["jugg-fxspam", 70],
]);

function cleanUrl(value) {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "srsltid") url.searchParams.delete(key);
    }
    return url.toString().replace(/\/$/, value.endsWith("/") ? "/" : "");
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
    .replace(/[ \t]+$/gm, "")
    .trim();
}

function getSections(body, references) {
  const matches = [...body.matchAll(/^###\s+(\d+)\.\s+[^\n]*\n/gm)];
  const sections = new Map();
  for (let index = 0; index < matches.length; index += 1) {
    const number = Number(matches[index][1]);
    const start = matches[index].index + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    sections.set(number, resolveReferences(body.slice(start, end).replace(/^---\s*$/gm, ""), references));
  }
  return sections;
}

function extractDecision(section) {
  const match = section.match(/(?:Решение(?: для RAP ATLAS)?):\*{0,2}\s*([^\n]+)/i);
  return (match?.[1] ?? "См. подробный итог карточки")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\|/g, "/")
    .trim();
}

function parseFile(fileName) {
  const fullPath = path.join(researchDir, fileName);
  const text = fs.readFileSync(fullPath, "utf8");
  const references = collectReferences(text);
  const headings = [...text.matchAll(/^#{1,2}\s+([^\n]+)\n/gm)];
  const cards = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index][1].trim();
    if (/^(Какие|Найденные|Главные|Основные|Что нужно|Что дополнительно|Рекомендуемая|Противоречия)/i.test(heading)) continue;

    const numeric = heading.match(/^(\d{2,3})\s+—\s+(.+)$/);
    const slugged = heading.match(/^([a-z0-9-]+)\s+—\s+(.+)$/i);
    const number = numeric ? Number(numeric[1]) : unnumberedCards.get(slugged?.[1]);
    if (!number || number < startCard || number > endCard) continue;

    const name = (numeric ? numeric[2] : slugged[2]).trim();
    const start = headings[index].index + headings[index][0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : text.length;
    const body = text.slice(start, end);
    const sections = getSections(body, references);
    const id = numeric ? "" : slugged[1];

    cards.push({ number, name, id, fileName, sections, decision: extractDecision(sections.get(1) ?? "") });
  }

  return cards;
}

const cards = inputNames.flatMap(parseFile).sort((left, right) => left.number - right.number);
const expected = Array.from({ length: endCard - startCard + 1 }, (_, index) => index + startCard);
const seen = new Set(cards.map((card) => card.number));
const missing = expected.filter((number) => !seen.has(number));
const duplicates = cards
  .map((card) => card.number)
  .filter((number, index, values) => values.indexOf(number) !== index);

if (missing.length || duplicates.length || cards.length !== 100) {
  throw new Error(`Неверное покрытие: карточек ${cards.length}; пропуски ${missing.join(", ") || "нет"}; дубли ${duplicates.join(", ") || "нет"}`);
}

const fileRanges = new Map();
for (const card of cards) {
  const range = fileRanges.get(card.fileName) ?? [];
  range.push(card.number);
  fileRanges.set(card.fileName, range);
}

const lines = [
  `# RAP ATLAS — аудит направлений, часть ${auditPart}`,
  "",
  "Дата проверки: 22 июля 2026 года  ",
  `Объём: ${cards.length} карточек, № ${startCard}–${endCard}  `,
  `Основа: исследовательские отчёты \`agent-${String(startAgent).padStart(2, "0")}.md\` — \`agent-${String(endAgent).padStart(2, "0")}.md\`  `,
  "Статус: принятый исследовательский контекст; код и данные программы не менялись",
  "",
  "## Как использовать этот файл",
  "",
  "Это сокращённая рабочая версия десяти больших отчётов. Карточки отсортированы по исходным номерам, даже если имена файлов были перепутаны. Для каждой сохранены итог проверки, простое объяснение, слышимые признаки, границы, примеры, связи, источники и открытые вопросы.",
  "",
  "Исследования выполнены GPT-5.6 Sol на высоком уровне рассуждения и приняты владельцем проекта как достоверная основа. Все ссылки отдельно вручную не перепроверялись; спорные выводы сохраняют собственные пометки уверенности из отчётов.",
  "",
  ...(inputNames.includes("agent-10.md")
    ? ["В `agent-10.md` названия источников и подтверждаемые утверждения указаны, но колонки с прямыми URL оставлены пустыми. Содержание карточек принято; перед публичным показом источников ссылки нужно восстановить.", ""]
    : []),
  "## Где лежали исходные группы",
  "",
  "| Файл | Номера карточек |",
  "|---|---|",
  ...[...fileRanges.entries()].sort((a, b) => Math.min(...a[1]) - Math.min(...b[1])).map(([fileName, numbers]) => `| \`${fileName}\` | ${Math.min(...numbers)}–${Math.max(...numbers)} |`),
  "",
  "## Сводный вердикт",
  "",
  "| № | Карточка | Решение | Исходник |",
  "|---:|---|---|---|",
  ...cards.map((card) => `| ${card.number} | ${card.name.replace(/\|/g, "/")} | ${card.decision.replace(/\|/g, "/")} | \`${card.fileName}\` |`),
  "",
  "---",
  "",
];

const selectedSections = [
  [1, "Итог проверки"],
  [2, "Что это"],
  [5, "Что слышно"],
  [6, "С чем путают"],
  [7, "Примеры"],
  [9, "Связи"],
  [10, "Источники"],
  [11, "Короткая карточка"],
  [12, "Что осталось неизвестным"],
];

for (const card of cards) {
  lines.push(`## ${card.number}. ${card.name}`, "");
  if (card.id) lines.push(`**ID:** \`${card.id}\`  `);
  lines.push(`**Исходный отчёт:** \`${card.fileName}\``, "");

  for (const [number, title] of selectedSections) {
    const content = card.sections.get(number);
    if (!content) continue;
    lines.push(`### ${title}`, "", content, "");
  }

  lines.push("---", "");
}

lines.push(
  "## Контроль покрытия",
  "",
  `- Карточек: ${cards.length}.`,
  `- Диапазон: ${startCard}–${endCard}.`,
  "- Пропусков: нет.",
  "- Дублей: нет.",
  "- Исходные отчёты сохранены рядом и остаются полной версией исследования.",
  "",
);

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(outputPath);
console.log(`cards=${cards.length}`);
console.log(`bytes=${fs.statSync(outputPath).size}`);
