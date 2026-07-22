import fs from "node:fs";

const [htmlPath] = process.argv.slice(2);

if (!htmlPath) {
  throw new Error("Usage: node validate-portable.mjs <portable.html>");
}

const html = fs.readFileSync(htmlPath, "utf8");
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gu)];

if (!scriptMatches.length) {
  throw new Error("Inline script is missing");
}

for (const match of scriptMatches) new Function(match[1]);

const checks = {
  doctype: /^<!doctype html>/iu.test(html),
  charset: html.includes('charset="utf-8"'),
  root: html.includes('id="root"'),
  inlineStyle: (html.match(/<style>/gu) ?? []).length === 1,
  inlineScript: (html.match(/<script>/gu) ?? []).length >= 1,
  noScriptSrc: !/<script[^>]+src=/iu.test(html),
  noStylesheetLink: !/<link[^>]+stylesheet/iu.test(html),
  noLocalhost: !html.includes("localhost"),
  appName: html.includes("RAP ATLAS"),
  scripts: scriptMatches.length,
  bundleBytes: Math.max(...scriptMatches.map((match) => match[1].length)),
};

console.log(JSON.stringify(checks, null, 2));

if (Object.values(checks).some((value) => value === false)) {
  process.exitCode = 1;
}
