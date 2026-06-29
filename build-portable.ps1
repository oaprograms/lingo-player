# Builds a portable Windows release into .\dist and zips it.
# Prerequisite: run .\setup.ps1 first (needs .\.nwjs and node_modules).
#
# Produces .\dist\Lingo Player\  (run via LingoPlayer.exe) and
#          .\dist\Lingo Player Portable.zip
#
# What it does, and why each step exists:
#   - trims the NW.js runtime to the files actually needed
#   - bundles the VC++ 2013 runtime so it works on a clean Win10/11
#   - tops up the VLC plugin set to the full official VLC 2.2.2 set
#   - renames the launcher nw.exe -> LingoPlayer.exe (see tools/patch-nw-name.js)
$ErrorActionPreference = "Stop"
$root  = $PSScriptRoot
$nwDir = Join-Path $root ".nwjs"
$dist  = Join-Path $root "dist"
$app   = Join-Path $dist "Lingo Player"
$wcjsDir = Join-Path $root "node_modules\webchimera.js"

if (-not (Test-Path (Join-Path $nwDir "nw.exe")))   { throw "Missing .\.nwjs - run .\setup.ps1 first." }
if (-not (Test-Path (Join-Path $wcjsDir "WebChimera.js.node"))) { & (Join-Path $root "fetch-vlc.ps1") }

Write-Host "[1/7] Staging folder..."
if (Test-Path $app) { Remove-Item $app -Recurse -Force }
New-Item -ItemType Directory -Force -Path $app | Out-Null

Write-Host "[2/7] NW.js runtime (trimmed)..."
foreach ($f in @("nw.exe","icudtl.dat","nw.pak","ffmpegsumo.dll","libEGL.dll","libGLESv2.dll","d3dcompiler_47.dll")) {
    Copy-Item (Join-Path $nwDir $f) $app
}
New-Item -ItemType Directory -Force -Path (Join-Path $app "locales") | Out-Null
Copy-Item (Join-Path $nwDir "locales\en-US.pak") (Join-Path $app "locales")

Write-Host "[3/7] App + node_modules..."
Copy-Item (Join-Path $root "app") (Join-Path $app "app") -Recurse
Copy-Item (Join-Path $root "package.json") $app
if (Test-Path (Join-Path $root "LICENSE")) { Copy-Item (Join-Path $root "LICENSE") $app }
Copy-Item (Join-Path $root "node_modules") (Join-Path $app "node_modules") -Recurse

Write-Host "[4/7] VC++ 2013 runtime (for clean systems)..."
foreach ($d in @("msvcr120.dll","msvcp120.dll")) {
    $sys = Join-Path $env:WINDIR "System32\$d"
    if (Test-Path $sys) { Copy-Item $sys $app }
    else { Write-Warning "$d not in System32 - clean machines without the VC++ 2013 runtime may not start the app." }
}

Write-Host "[5/7] Full VLC 2.2.2 plugin set..."
# WebChimera bundles a subset; top it up from the official VLC 2.2.2 win64 build
# (its libvlc/libvlccore are byte-identical to WebChimera's, so plugins match).
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = "SilentlyContinue"
    $vlcZip = Join-Path $env:TEMP "vlc-2.2.2-win64.zip"
    $vlcDir = Join-Path $env:TEMP "vlc-2.2.2-extract"
    if (-not (Test-Path (Join-Path $vlcDir "vlc-2.2.2\plugins"))) {
        Invoke-WebRequest -Uri "https://download.videolan.org/pub/videolan/vlc/2.2.2/win64/vlc-2.2.2-win64.zip" -OutFile $vlcZip
        if (Test-Path $vlcDir) { Remove-Item $vlcDir -Recurse -Force }
        Expand-Archive -Path $vlcZip -DestinationPath $vlcDir -Force
    }
    $srcPlugins = Join-Path $vlcDir "vlc-2.2.2\plugins"
    $dstPlugins = Join-Path $app "node_modules\webchimera.js\plugins"
    $added = 0
    Get-ChildItem $srcPlugins -Recurse -Filter *.dll | ForEach-Object {
        $rel = $_.FullName.Substring($srcPlugins.Length + 1)
        $target = Join-Path $dstPlugins $rel
        if (-not (Test-Path $target)) {
            New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
            Copy-Item $_.FullName $target
            $added++
        }
    }
    Write-Host "      added $added plugins"
} catch {
    Write-Warning "Could not fetch official VLC plugins ($($_.Exception.Message)). Continuing with WebChimera's bundled set (playback still works)."
}

Write-Host "[6/7] Rename launcher nw.exe -> LingoPlayer.exe..."
node (Join-Path $root "tools\patch-nw-name.js") (Join-Path $app "node_modules\webchimera.js\WebChimera.js.node") "LingoPlayer.exe"
Rename-Item (Join-Path $app "nw.exe") "LingoPlayer.exe"
"Lingo Player - portable`r`n`r`nRun: LingoPlayer.exe`r`n`r`nRuns from any location. No install, no VLC, nothing else required.`r`n" |
    Set-Content -LiteralPath (Join-Path $app "README.txt") -Encoding utf8

Write-Host "[7/7] Zipping..."
$zip = Join-Path $dist "Lingo Player Portable.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $app -DestinationPath $zip -CompressionLevel Optimal

Write-Host ""
Write-Host "Done:"
Write-Host "  folder: $app"
Write-Host "  zip:    $zip"
