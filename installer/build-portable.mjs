import fs from "node:fs";
import path from "node:path";

const [bundlePath, cssPath, outputPath] = process.argv.slice(2);

if (!bundlePath || !cssPath || !outputPath) {
  throw new Error("Usage: node build-portable.mjs <bundle.js> <globals.css> <output.html>");
}

const script = fs.readFileSync(bundlePath, "utf8").replaceAll("</script", "<\\/script");
const styles = fs
  .readFileSync(cssPath, "utf8")
  .replace(/^\uFEFF?\s*@import\s+["']tailwindcss["'];\s*/u, "")
  .replaceAll("</style", "<\\/style");

const lifecycle = `(() => {
  const token = new URLSearchParams(location.search).get("token") ?? "";
  const nativeFetch = window.fetch.bind(window);
  const authenticated = (input) => {
    if (typeof input !== "string" || !input.startsWith("/__")) return input;
    const url = new URL(input, location.origin);
    url.searchParams.set("token", token);
    return url.pathname + url.search;
  };
  window.fetch = (input, init) => nativeFetch(authenticated(input), init);
  const sessionId = globalThis.crypto?.randomUUID?.() ?? (Date.now().toString(36) + Math.random().toString(36).slice(2));
  let opened = false;
  let heartbeat = 0;
  const endpoint = (action) => "/__session/" + action + "?id=" + encodeURIComponent(sessionId) + "&token=" + encodeURIComponent(token);
  const ping = (action) => nativeFetch(endpoint(action), { method: "POST", cache: "no-store", keepalive: true }).catch(() => {});
  const open = () => {
    if (opened || !token) return;
    opened = true;
    ping("open");
    heartbeat = window.setInterval(() => ping("heartbeat"), 5000);
  };
  const close = () => {
    if (!opened) return;
    opened = false;
    window.clearInterval(heartbeat);
    navigator.sendBeacon(endpoint("close"));
  };
  open();
  window.addEventListener("pagehide", close);
  window.addEventListener("beforeunload", close);
  window.addEventListener("pageshow", (event) => { if (event.persisted) open(); });
})();`.replaceAll("</script", "<\\/script");

const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <meta name="description" content="Карта жанров, сцен и продюсерских тегов интернет-рэпа.">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <title>RAP ATLAS — карта интернет-рэпа</title>
  <style>${styles}</style>
</head>
<body>
  <div id="root"></div>
  <noscript>Для работы RAP ATLAS нужно включить JavaScript в браузере.</noscript>
  <script>${lifecycle}</script>
  <script>${script}</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
