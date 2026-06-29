# Launches Lingo Player with the bundled NW.js 0.12.3 runtime (./.nwjs).
# Run setup.ps1 once first. Self-heals the WebChimera/VLC binding if a fresh
# `npm install` pruned it.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$nw   = Join-Path $root ".nwjs\nw.exe"

if (-not (Test-Path $nw)) {
    Write-Error "NW.js runtime not found at .\.nwjs - run .\setup.ps1 first."
    exit 1
}

# Re-fetch WebChimera if missing (e.g. after a fresh npm install).
& (Join-Path $root "fetch-vlc.ps1")

& $nw $root
