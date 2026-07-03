# Olešnice X - aktualizace dashboardu

Tahle složka slouží k tomu, abys z Excelu vytvořil nové soubory pro webový dashboard.

Hlavní postup je jednoduchý:

1. Dej aktuální Excel do složky `Zdroj_dat`.
2. Spusť `.\update_local.ps1`.
3. Na GitHub ručně nahraj 4 soubory ze složky `web_dashboard`.

Nepouštěj přímo:

```powershell
python build_local_stats.py
```

Může to spadnout na chybějící knihovně `openpyxl`.

## Co který skript dělá

### `update_local.ps1`

Tohle je hlavní skript, který máš běžně používat.

Spuštění:

```powershell
.\update_local.ps1
```

Co udělá:

- vezme Excel ze složky `Zdroj_dat`,
- vytvoří metriky,
- přegeneruje web,
- připraví nové soubory ve složce `web_dashboard`.

Potom ručně nahraješ na GitHub obsah složky `web_dashboard`.

Konkrétně tyto soubory:

```text
index.html
styles.css
app.js
data.js
```

Když chceš použít Excel z jiné složky, můžeš zadat cestu:

```powershell
.\update_local.ps1 -SourceXlsx "C:\CESTA\K\SOUBORU.xlsx"
```

Pokud nechceš řešit cestu, prostě Excel ručně zkopíruj do `Zdroj_dat` a spusť jen:

```powershell
.\update_local.ps1
```

### `run_build_local_stats.ps1`

Pomocný skript jen pro vytvoření metrik.

Spuštění:

```powershell
.\run_build_local_stats.ps1
```

Co udělá:

- načte Excel,
- vytvoří složku `vystupy`,
- vytvoří CSV/JSON/MD statistiky,
- nevytvoří finální web.

Běžně ho nepotřebuješ. Použij ho jen když chceš zkontrolovat samotné metriky.

### `build_local_stats.py`

Python skript, který počítá statistiky z Excelu.

Nepouštěj ho přímo přes `python`, pokud nevíš, že máš nainstalovaný `openpyxl`.

Správně ho spouští tyto PowerShell skripty:

```powershell
.\update_local.ps1
.\run_build_local_stats.ps1
```

### `build_web_dashboard.py`

Python skript, který z metrik vytvoří web.

Vytvoří nebo přepíše soubory ve složce `web_dashboard`.

Běžně ho nespouštěj ručně. Automaticky ho spouští:

```powershell
.\update_local.ps1
```

### `refresh_dashboard.ps1`

Starší univerzální skript.

Umí přegenerovat dashboard podobně jako `update_local.ps1`, ale má v sobě i starší volby pro práci s GitHub repozitářem.

Pro tvoje aktuální použití ho nepotřebuješ.

Používej radši:

```powershell
.\update_local.ps1
```

### `update_git.ps1`

Starý skript pro automatický commit a push do GitHub repozitáře.

Teď ho nepoužívej.

Vyžaduje:

- lokálně stažené GitHub repo,
- funkční Git přihlášení,
- GitHub token nebo GitHub CLI login.

Protože chceš nahrávat soubory na GitHub ručně, tenhle skript ignoruj.

## Kde má být Excel

Excel dej sem:

```text
Git_page_refresh\Zdroj_dat
```

Název Excelu může být jakýkoliv, třeba:

```text
Výsledky_Olešnice_X.xlsx
export.xlsx
Výsledky Olešnice X final (3).xlsx
```

Skript si vezme první `.xlsx` soubor ve složce `Zdroj_dat`.

## Jak otevřít PowerShell ve správné složce

1. Otevři složku `Git_page_refresh`.
2. Klikni do řádku s cestou nahoře v Průzkumníku.
3. Napiš:

```text
powershell
```

4. Dej Enter.

Správně máš vidět něco jako:

```powershell
PS C:\Users\TH\Documents\Codex\Výsledky_Olešnice_X\Git_page_refresh>
```

## Běžný postup aktualizace

Ve složce `Git_page_refresh` spusť:

```powershell
.\update_local.ps1
```

Po doběhnutí otevři složku:

```text
Git_page_refresh\web_dashboard
```

Na GitHub ručně nahraj:

```text
index.html
styles.css
app.js
data.js
```

## Časté chyby

### PowerShell nenajde skript

Špatně:

```powershell
update_local.ps1
```

Správně:

```powershell
.\update_local.ps1
```

PowerShell chce před skriptem z aktuální složky `.\`.

### Chybějící openpyxl

Špatně:

```powershell
python build_local_stats.py
```

Správně:

```powershell
.\update_local.ps1
```

### Cesta k Excelu obsahuje mezery

Když zadáváš cestu ručně, dej ji do uvozovek:

```powershell
.\update_local.ps1 -SourceXlsx "C:\Users\TH\Documents\Můj Excel.xlsx"
```

## Nejkratší tahák

Jsem ve složce `Git_page_refresh`.

Chci přegenerovat web:

```powershell
.\update_local.ps1
```

Chci přegenerovat web z konkrétního Excelu:

```powershell
.\update_local.ps1 -SourceXlsx "C:\CESTA\K\SOUBORU.xlsx"
```

Potom ručně nahraju na GitHub:

```text
web_dashboard\index.html
web_dashboard\styles.css
web_dashboard\app.js
web_dashboard\data.js
```
