import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders RAP ATLAS instead of the starter", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>RAP ATLAS — карта интернет-рэпа<\/title>/i);
  assert.match(html, /RAP ATLAS/);
  assert.match(html, /Сначала звук/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships a large, classified underground-rap knowledge base", async () => {
  const [data, research, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/atlas-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/research-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const entryCount = [...data.matchAll(/^\s*id: "/gm)].length;
  assert.ok(entryCount >= 250, `expected at least 250 classified records, got ${entryCount}`);
  for (const id of ["cloud-rap", "plugg", "nod", "ambient-rap", "stepteam", "modern-jerk", "digicore", "hexd", "sigilkore", "rage", "chugg", "bollytekk"]) {
    assert.match(data, new RegExp(`id: "${id}"`));
  }
  assert.match(page, /<AtlasApp \/>/);
  assert.match(layout, /lang="ru"/);
  assert.match(packageJson, /"lucide-react"/);
  assert.match(research, /researchOverrides/);
  assert.match(research, /reviewedSounds/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
