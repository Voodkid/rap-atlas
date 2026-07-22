#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/package.json').version")"
BUILD="$ROOT/macos/build"
APP="$BUILD/RAP ATLAS.app"
CONTENTS="$APP/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"
DMG_ROOT="$BUILD/dmg"
OUTPUT="$ROOT/macos/release/RAP-ATLAS-macOS-Beta.dmg"

rm -rf "$BUILD" "$ROOT/macos/release"
mkdir -p "$MACOS" "$RESOURCES" "$DMG_ROOT" "$ROOT/macos/release"

pnpm exec esbuild "$ROOT/installer/portable-entry.tsx" \
  --bundle --format=iife --platform=browser --target=es2020 \
  --jsx=automatic --minify --legal-comments=none \
  --outfile="$BUILD/rap-atlas.bundle.js"
node "$ROOT/installer/build-portable.mjs" \
  "$BUILD/rap-atlas.bundle.js" "$ROOT/app/globals.css" "$RESOURCES/RAP ATLAS.html"
node "$ROOT/installer/validate-portable.mjs" "$RESOURCES/RAP ATLAS.html"
sed "s/__VERSION__/$VERSION/g" "$ROOT/macos/Info.plist.template" > "$CONTENTS/Info.plist"

swiftc -O -target arm64-apple-macos11.0 -framework Cocoa -framework WebKit \
  "$ROOT/macos/RapAtlasApp.swift" -o "$BUILD/RapAtlas-arm64"
swiftc -O -target x86_64-apple-macos11.0 -framework Cocoa -framework WebKit \
  "$ROOT/macos/RapAtlasApp.swift" -o "$BUILD/RapAtlas-x86_64"
lipo -create "$BUILD/RapAtlas-arm64" "$BUILD/RapAtlas-x86_64" -output "$MACOS/RapAtlas"
chmod +x "$MACOS/RapAtlas"

ICONSET="$BUILD/AppIcon.iconset"
mkdir -p "$ICONSET"
SOURCE_ICON="$ROOT/installer/assets/RAP ATLAS.png"
for spec in "16 icon_16x16.png" "32 icon_16x16@2x.png" "32 icon_32x32.png" \
            "64 icon_32x32@2x.png" "128 icon_128x128.png" "256 icon_128x128@2x.png" \
            "256 icon_256x256.png" "512 icon_256x256@2x.png" "512 icon_512x512.png" \
            "1024 icon_512x512@2x.png"; do
  size="${spec%% *}"; name="${spec#* }"
  sips -z "$size" "$size" "$SOURCE_ICON" --out "$ICONSET/$name" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$RESOURCES/AppIcon.icns"

codesign --force --deep --sign - "$APP"
codesign --verify --deep --strict "$APP"

cp -R "$APP" "$DMG_ROOT/"
ln -s /Applications "$DMG_ROOT/Applications"
cp "$ROOT/macos/Удалить RAP ATLAS.command" "$DMG_ROOT/Удалить RAP ATLAS.command"
cp "$ROOT/macos/ПЕРВЫЙ ЗАПУСК.txt" "$DMG_ROOT/ПЕРВЫЙ ЗАПУСК.txt"
chmod +x "$DMG_ROOT/Удалить RAP ATLAS.command"
hdiutil create -volname "RAP ATLAS $VERSION Beta" -srcfolder "$DMG_ROOT" -format UDZO -ov "$OUTPUT"
shasum -a 256 "$OUTPUT" | tee "$ROOT/macos/release/RAP-ATLAS-macOS-Beta.sha256"
