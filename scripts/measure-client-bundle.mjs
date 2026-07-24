import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompress, gzip } from "node:zlib";
import { promisify } from "node:util";

const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientOutputDirectory = join(projectRoot, "dist", "client");
const clientManifestPath = join(clientOutputDirectory, ".vite", "manifest.json");
const buildCommand = "pnpm build";
const atlasAppManifestSource = posix.join("app", "AtlasApp.tsx");

function formatBytes(bytes) {
  const mebibyte = 1024 ** 2;
  const unit = bytes >= mebibyte ? "MiB" : "KiB";
  const divisor = bytes >= mebibyte ? mebibyte : 1024;

  return `${bytes} bytes (${(bytes / divisor).toFixed(2)} ${unit})`;
}

function compareAssets(left, right) {
  if (left.rawBytes !== right.rawBytes) {
    return right.rawBytes - left.rawBytes;
  }

  if (left.fileName !== right.fileName) {
    return left.fileName < right.fileName ? -1 : 1;
  }

  if (left.relativePath === right.relativePath) {
    return 0;
  }

  return left.relativePath < right.relativePath ? -1 : 1;
}

function formatRelativePath(filePath) {
  return relative(clientOutputDirectory, filePath).split(sep).join("/");
}

function formatProjectRelativePath(filePath) {
  return relative(projectRoot, filePath).split(sep).join("/");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function measureAsset(filePath) {
  const contents = await readFile(filePath);
  const [gzipContents, brotliContents] = await Promise.all([
    compressGzip(contents),
    compressBrotli(contents),
  ]);

  return {
    fileName: basename(filePath),
    relativePath: formatRelativePath(filePath),
    rawBytes: contents.byteLength,
    gzipBytes: gzipContents.byteLength,
    brotliBytes: brotliContents.byteLength,
  };
}

function summarize(assets) {
  return assets.reduce(
    (totals, asset) => ({
      rawBytes: totals.rawBytes + asset.rawBytes,
      gzipBytes: totals.gzipBytes + asset.gzipBytes,
      brotliBytes: totals.brotliBytes + asset.brotliBytes,
    }),
    { rawBytes: 0, gzipBytes: 0, brotliBytes: 0 },
  );
}

function printSizeSummary(label, totals) {
  console.log(`${label} raw: ${formatBytes(totals.rawBytes)}`);
  console.log(`${label} gzip: ${formatBytes(totals.gzipBytes)}`);
  console.log(`${label} Brotli: ${formatBytes(totals.brotliBytes)}`);
}

async function findAtlasAppAsset(jsAssets) {
  let manifest;

  try {
    manifest = JSON.parse(await readFile(clientManifestPath, "utf8"));
  } catch {
    console.log(
      "WARNING: AtlasApp chunk could not be identified because the client manifest is unavailable or invalid.",
    );
    return;
  }

  const matchingPaths = new Set(
    Object.values(manifest)
      .filter(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          entry.src === atlasAppManifestSource &&
          typeof entry.file === "string",
      )
      .map((entry) => entry.file),
  );
  const candidates = jsAssets.filter((asset) => matchingPaths.has(asset.relativePath));

  if (candidates.length !== 1) {
    console.log(
      `WARNING: AtlasApp chunk could not be identified unambiguously (${candidates.length} matching client assets).`,
    );
    return;
  }

  const [atlasAppAsset] = candidates;
  console.log("AtlasApp chunk:");
  console.log(`  ${atlasAppAsset.relativePath}`);
  console.log(`  raw: ${formatBytes(atlasAppAsset.rawBytes)}`);
  console.log(`  gzip: ${formatBytes(atlasAppAsset.gzipBytes)}`);
  console.log(`  Brotli: ${formatBytes(atlasAppAsset.brotliBytes)}`);
}

async function main() {
  let files;

  try {
    files = await listFiles(clientOutputDirectory);
  } catch {
    console.error("Production client output was not found.");
    console.error(`Run '${buildCommand}' first to create it.`);
    process.exitCode = 1;
    return;
  }

  const jsPaths = files.filter((filePath) => /\.(?:cjs|js|mjs)$/i.test(filePath));
  const cssPaths = files.filter((filePath) => /\.css$/i.test(filePath));
  const [jsAssets, cssAssets] = await Promise.all([
    Promise.all(jsPaths.map(measureAsset)),
    Promise.all(cssPaths.map(measureAsset)),
  ]);
  const sortedJsAssets = jsAssets.toSorted(compareAssets);
  const sortedCssAssets = cssAssets.toSorted(compareAssets);

  console.log("Client bundle baseline");
  console.log(`Client output: ${formatProjectRelativePath(clientOutputDirectory)}`);
  console.log(`JS chunks: ${sortedJsAssets.length}`);
  printSizeSummary("Client JS total", summarize(sortedJsAssets));
  console.log("Top JS chunks by raw size:");

  for (const [index, asset] of sortedJsAssets.slice(0, 10).entries()) {
    console.log(
      `  ${index + 1}. ${asset.relativePath} | raw: ${formatBytes(asset.rawBytes)} | gzip: ${formatBytes(asset.gzipBytes)} | Brotli: ${formatBytes(asset.brotliBytes)}`,
    );
  }

  await findAtlasAppAsset(sortedJsAssets);
  console.log(`CSS assets: ${sortedCssAssets.length}`);
  printSizeSummary("Client CSS total", summarize(sortedCssAssets));
}

main().catch((error) => {
  console.error("Unable to measure the production client bundle.");
  console.error(error.message);
  process.exitCode = 1;
});
