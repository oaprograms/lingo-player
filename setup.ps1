# One-time setup to run Lingo Player locally on Windows.
#   1. installs runtime npm dependencies
#   2. downloads the matching NW.js 0.12.3 runtime into .\.nwjs
#   3. fetches the WebChimera.js (native VLC) prebuilt
# Re-running is safe: each step is skipped if already done.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# --- 1. npm dependencies -----------------------------------------------------
Write-Host "[1/3] Installing npm dependencies..."
Push-Location $root
try { npm install } finally { Pop-Location }

# --- 2. NW.js runtime --------------------------------------------------------
# NW.js must be <= 0.12.x: only those versions enable node `require()` under the
# app:// protocol this app loads from. The runtime lives in .\.nwjs (gitignored).
$nwDir = Join-Path $root ".nwjs"
$nwExe = Join-Path $nwDir "nw.exe"
if (Test-Path $nwExe) {
    Write-Host "[2/3] NW.js runtime already present, skipping."
} else {
    Write-Host "[2/3] Downloading NW.js 0.12.3..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = "SilentlyContinue"
    $zip     = Join-Path $env:TEMP "nwjs-v0.12.3-win-x64.zip"
    $tmpDir  = Join-Path $env:TEMP "nwjs-extract-0.12.3"
    Invoke-WebRequest -Uri "https://dl.nwjs.io/v0.12.3/nwjs-v0.12.3-win-x64.zip" -OutFile $zip
    if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
    Expand-Archive -Path $zip -DestinationPath $tmpDir -Force
    Move-Item (Join-Path $tmpDir "nwjs-v0.12.3-win-x64") $nwDir
    Remove-Item $zip -Force
    Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}

# --- 3. WebChimera (VLC) -----------------------------------------------------
Write-Host "[3/3] Fetching WebChimera (VLC) binding..."
& (Join-Path $root "fetch-vlc.ps1")

Write-Host ""
Write-Host "Setup complete. Launch the app with:  .\run.ps1"
