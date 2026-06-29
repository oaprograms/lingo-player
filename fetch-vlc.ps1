# Fetches the WebChimera.js prebuilt (native VLC binding) into node_modules,
# matched to the bundled NW.js 0.12.3 runtime. No-op if already present.
# Used by both setup.ps1 and run.ps1 (self-heal after a fresh `npm install`).
#
# wcjs-prebuilt (the downloader) is installed in a throwaway temp dir so its
# ~600 build-time deps never pollute this project's node_modules.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$binding = Join-Path $root "node_modules\webchimera.js\WebChimera.js.node"
if (Test-Path $binding) { return }

Write-Host "Fetching WebChimera (VLC) prebuilt for NW.js 0.12.3..."

$tool = Join-Path $env:TEMP "lingo-wcjs-prebuilt"
if (-not (Test-Path (Join-Path $tool "node_modules\wcjs-prebuilt\install.js"))) {
    New-Item -ItemType Directory -Force -Path $tool | Out-Null
    '{ "name": "wcjs-tool", "version": "1.0.0" }' | Set-Content -LiteralPath (Join-Path $tool "package.json") -Encoding utf8
    Push-Location $tool
    try { npm install --no-audit --ignore-scripts wcjs-prebuilt } finally { Pop-Location }
}

$env:WCJS_RUNTIME         = "nw"
$env:WCJS_RUNTIME_VERSION = "v0.12.3"
$env:WCJS_PLATFORM        = "win"
$env:WCJS_ARCH            = "x64"
$env:WCJS_VERSION         = "v0.2.3"
$env:WCJS_TARGET_DIR      = Join-Path $root "node_modules\webchimera.js"

Push-Location $tool
try { node node_modules/wcjs-prebuilt/install.js }
finally { Pop-Location }

if (-not (Test-Path $binding)) { Write-Error "WebChimera fetch failed." ; exit 1 }
