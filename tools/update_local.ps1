param(
    [string]$SourceXlsx = ""
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceDir = Join-Path $ProjectRoot "Zdroj_dat"
$SourceTarget = Join-Path $SourceDir "Výsledky Olešnice X final.xlsx"
$DashboardDir = Join-Path $ProjectRoot "web_dashboard"
$PythonExe = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if (-not (Test-Path $PythonExe)) {
    throw "Nenašel jsem Python runtime: $PythonExe"
}

if ($SourceXlsx) {
    if (-not (Test-Path $SourceXlsx)) {
        throw "Vstupní Excel neexistuje: $SourceXlsx"
    }
    if (-not (Test-Path $SourceDir)) {
        New-Item -ItemType Directory -Path $SourceDir | Out-Null
    }
    Copy-Item -LiteralPath $SourceXlsx -Destination $SourceTarget -Force
    Write-Host "OK: Nový Excel zkopírován do Zdroj_dat."
}

Push-Location $ProjectRoot
try {
    Write-Host "Krok 1/2: Generuji metriky..."
    & $PythonExe "build_local_stats.py"
    if ($LASTEXITCODE -ne 0) {
        throw "build_local_stats.py selhal."
    }

    Write-Host "Krok 2/2: Generuji web..."
    & $PythonExe "build_web_dashboard.py"
    if ($LASTEXITCODE -ne 0) {
        throw "build_web_dashboard.py selhal."
    }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Hotovo. Na GitHub ručně nahraj obsah této složky:"
Write-Host $DashboardDir
Write-Host ""
Write-Host "Soubory k nahrání:"
Write-Host " - index.html"
Write-Host " - styles.css"
Write-Host " - app.js"
Write-Host " - data.js"
