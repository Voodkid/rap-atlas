param(
    [string]$IconSource = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$installerDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $installerDir
$buildDir = Join-Path $installerDir "build"
$releaseDir = Join-Path $installerDir "release"
$compiler = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if ([string]::IsNullOrWhiteSpace($IconSource)) {
    $IconSource = Join-Path $installerDir "assets\RAP ATLAS.png"
}

function Find-Tool {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$EnvironmentOverride = ""
    )

    if (-not [string]::IsNullOrWhiteSpace($EnvironmentOverride) -and (Test-Path -LiteralPath $EnvironmentOverride)) {
        return (Resolve-Path -LiteralPath $EnvironmentOverride).Path
    }

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    throw "Не найден $Name. Добавь его в PATH или укажи путь через переменную окружения RAP_ATLAS_$($Name.ToUpper())."
}

function Find-PythonWithPillow {
    $candidates = @(
        $env:RAP_ATLAS_PYTHON,
        (Get-Command "python" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
        (Get-Command "py" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique

    foreach ($candidate in $candidates) {
        & $candidate -c "import PIL" 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $candidate
        }
    }

    throw "Не найден Python с библиотекой Pillow. Установи её командой: python -m pip install Pillow"
}

$node = Find-Tool -Name "node" -EnvironmentOverride $env:RAP_ATLAS_NODE
$python = Find-PythonWithPillow

$package = Get-Content -LiteralPath (Join-Path $projectDir "package.json") -Raw | ConvertFrom-Json
$version = [string]$package.version
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    throw "Версия в package.json должна иметь вид X.Y.Z, например 0.3.0."
}
$assemblyVersion = "$version.0"

foreach ($required in @($node, $python, $compiler, $IconSource)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Не найден обязательный файл сборки: $required"
    }
}

$esbuild = Get-ChildItem -LiteralPath (Join-Path $projectDir "node_modules\.pnpm") -Filter "esbuild.exe" -Recurse |
    Where-Object { $_.FullName -like "*@esbuild+win32-x64*" } |
    Select-Object -First 1 -ExpandProperty FullName

if (-not $esbuild) {
    throw "Не найден esbuild в node_modules проекта."
}

New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

$versionSource = Join-Path $buildDir "Version.g.cs"
@"
using System.Reflection;
[assembly: AssemblyVersion("$assemblyVersion")]
[assembly: AssemblyFileVersion("$assemblyVersion")]
namespace RapAtlasDesktop { internal static partial class AppPaths { internal const string Version = "$version"; } }
"@ | Set-Content -LiteralPath $versionSource -Encoding UTF8

$bundlePath = Join-Path $buildDir "rap-atlas.bundle.js"
$htmlPath = Join-Path $buildDir "RAP ATLAS.html"
$iconPath = Join-Path $buildDir "RAP ATLAS.ico"
$outputExe = Join-Path $releaseDir "УСТАНОВИТЬ RAP ATLAS.exe"

& $esbuild (Join-Path $installerDir "portable-entry.tsx") `
    --bundle `
    --format=iife `
    --platform=browser `
    --target=firefox115,chrome120,edge120 `
    --jsx=automatic `
    --minify `
    --legal-comments=none `
    "--outfile=$bundlePath"
if ($LASTEXITCODE -ne 0) { throw "Не удалось собрать браузерную часть RAP ATLAS." }

& $node (Join-Path $installerDir "build-portable.mjs") $bundlePath (Join-Path $projectDir "app\globals.css") $htmlPath
if ($LASTEXITCODE -ne 0) { throw "Не удалось собрать автономную страницу RAP ATLAS." }

& $node (Join-Path $installerDir "validate-portable.mjs") $htmlPath
if ($LASTEXITCODE -ne 0) { throw "Автономная страница RAP ATLAS не прошла проверку." }

& $python (Join-Path $installerDir "make-icon.py") $IconSource $iconPath
if ($LASTEXITCODE -ne 0) { throw "Не удалось подготовить иконку RAP ATLAS." }

& $compiler `
    /nologo `
    /target:winexe `
    /optimize+ `
    /platform:anycpu `
    "/win32icon:$iconPath" `
    "/resource:$htmlPath,RapAtlas.Index.html" `
    "/resource:$iconPath,RapAtlas.AppIcon.ico" `
    "/out:$outputExe" `
    /reference:System.dll `
    /reference:System.Core.dll `
    /reference:System.Drawing.dll `
    /reference:System.Windows.Forms.dll `
    @((Get-ChildItem -LiteralPath (Join-Path $installerDir "src") -Filter "*.cs" -File | Sort-Object Name | Select-Object -ExpandProperty FullName) + $versionSource)
if ($LASTEXITCODE -ne 0) { throw "Не удалось собрать Windows-установщик RAP ATLAS." }

$hash = (Get-FileHash -LiteralPath $outputExe -Algorithm SHA256).Hash.ToLowerInvariant()
$manifest = [ordered]@{
    name = "RAP ATLAS"
    version = $version
    file = (Split-Path -Leaf $outputExe)
    sha256 = $hash
    builtAtUtc = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
    source = "https://t.me/RAPATLAS"
}
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $releaseDir "release-manifest.json") -Encoding UTF8

Get-Item -LiteralPath $outputExe | Select-Object FullName, Length, LastWriteTime
Write-Host "SHA-256: $hash"
