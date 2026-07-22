$ErrorActionPreference = "Stop"

$appDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$portFile = Join-Path $PSScriptRoot "rap-atlas.port"
$logFile = Join-Path $PSScriptRoot "rap-atlas-server.log"
$errorFile = Join-Path $PSScriptRoot "rap-atlas-server.err"

function Test-RapAtlas([int]$Port) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ne 200 -or $response.Content -notmatch "RAP ATLAS") {
      return $false
    }
    $cssPath = [regex]::Match($response.Content, 'href="([^"]+\.css[^"]*)"').Groups[1].Value
    if (-not $cssPath) {
      return $false
    }
    $css = Invoke-WebRequest -Uri "http://localhost:$Port$cssPath" -UseBasicParsing -Headers @{ Accept = "text/css,*/*;q=0.1" } -TimeoutSec 2
    return $css.StatusCode -eq 200 -and $css.Headers["Content-Type"] -match "text/css"
  } catch {
    return $false
  }
}

if (Test-Path -LiteralPath $portFile) {
  $savedPort = [int](Get-Content -LiteralPath $portFile -Raw)
  if (Test-RapAtlas $savedPort) {
    Start-Process "http://localhost:$savedPort/"
    exit 0
  }
}

$runtimeRoot = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
$nodeDir = Join-Path $runtimeRoot "node\bin"
$pnpmPath = Join-Path $runtimeRoot "bin\fallback\pnpm.cmd"

if (-not (Test-Path -LiteralPath $pnpmPath)) {
  $fallbackPnpm = Get-Command pnpm -ErrorAction SilentlyContinue
  if ($fallbackPnpm) {
    $pnpmPath = $fallbackPnpm.Source
  } else {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show(
      "The local RAP ATLAS runtime was not found. Open the project in Codex once to restore its dependencies.",
      "RAP ATLAS"
    ) | Out-Null
    exit 1
  }
}

$activePorts = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners().Port
$selectedPort = $null
foreach ($candidatePort in 4867..4899) {
  if ($activePorts -notcontains $candidatePort) {
    $selectedPort = $candidatePort
    break
  }
}

if ($null -eq $selectedPort) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("RAP ATLAS could not find a free local port.", "RAP ATLAS") | Out-Null
  exit 1
}

$env:PATH = "$nodeDir;$(Split-Path -Parent $pnpmPath);$env:PATH"
$env:WRANGLER_LOG_PATH = ".wrangler/wrangler.log"

if (-not (Test-Path -LiteralPath (Join-Path $appDir "node_modules"))) {
  $install = Start-Process -FilePath $pnpmPath -ArgumentList @("install", "--frozen-lockfile") -WorkingDirectory $appDir -WindowStyle Hidden -Wait -PassThru
  if ($install.ExitCode -ne 0) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show("RAP ATLAS could not prepare itself for launch.", "RAP ATLAS") | Out-Null
    exit 1
  }
}

Set-Content -LiteralPath $portFile -Value $selectedPort -Encoding ascii
Start-Process -FilePath $pnpmPath `
  -ArgumentList @("exec", "vinext", "dev", "--host", "localhost", "--port", "$selectedPort", "--strictPort") `
  -WorkingDirectory $appDir `
  -WindowStyle Hidden `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError $errorFile | Out-Null

$ready = $false
foreach ($attempt in 1..80) {
  if (Test-RapAtlas $selectedPort) {
    $ready = $true
    break
  }
  Start-Sleep -Milliseconds 250
}

if ($ready) {
  Start-Process "http://localhost:$selectedPort/"
} else {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("RAP ATLAS is taking longer than expected. Try opening the launcher again in a few seconds.", "RAP ATLAS") | Out-Null
}
