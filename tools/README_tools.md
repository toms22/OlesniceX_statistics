# Olešnice X - aktualizace webu

Tahle složka slouží k vytvoření aktuálního dashboardu z Excelu. Běžně stačí jen vložit nový Excel do `Zdroj_dat` a spustit `update_local.bat`.

## Nejrychlejší postup

1. Dej aktuální `.xlsx` soubor do složky:

```text
Zdroj_dat
```

2. Dvojklikem spusť:

```text
update_local.bat
```

3. Na GitHub Pages nahraj 4 soubory ze složky:

```text
web_dashboard
```

Konkrétně:

```text
index.html
styles.css
app.js
data.js
```

## Co dělají jednotlivé soubory

### `update_local.bat`

Nejjednodušší spouštěč na dvojklik.

Spustí `update_local.ps1` a po dokončení nechá otevřené okno, abys viděl, jestli vše proběhlo bez chyby.

Používej ho pro běžnou aktualizaci.

### `update_local.ps1`

Hlavní PowerShell skript.

Udělá celý refresh:

- načte Excel ze složky `Zdroj_dat`,
- spustí `build_local_stats.py`,
- spustí `build_web_dashboard.py`,
- vytvoří aktuální web ve složce `web_dashboard`.

Dá se spustit i ručně z PowerShellu:

```powershell
.\update_local.ps1
```

### `build_local_stats.py`

Python skript pro výpočet statistik.

Z Excelu vytvoří datové výstupy do složky:

```text
vystupy
```

Počítá například sezony, ligy, soutěže, umístění, top výsledky a top sestřiky.

Běžně ho nespouštěj přímo. Spouští ho `update_local.ps1`.

### `build_web_dashboard.py`

Python skript pro vytvoření webu.

Vezme data ze složky `vystupy` a vytvoří soubory:

```text
web_dashboard\index.html
web_dashboard\styles.css
web_dashboard\app.js
web_dashboard\data.js
```

Součástí buildu je i cache-buster `?v=...`, aby se po nahrání na GitHub nenačítala stará verze z prohlížeče.

Běžně ho nespouštěj přímo. Spouští ho `update_local.ps1`.

## Co nahrávat na GitHub Pages

Do rootu webu nahraj pouze:

```text
index.html
styles.css
app.js
data.js
```

Pokud GitHub Pages běží ze složky `docs`, nahraj tyto 4 soubory do `docs`.

## Co do rootu webu nenahrávat

Do rootu webu nedávej pracovní soubory:

```text
update_local.bat
update_local.ps1
build_local_stats.py
build_web_dashboard.py
Zdroj_dat
vystupy
```

Když je chceš mít na GitHubu jako zálohu, dej je mimo veřejný root, třeba do složky:

```text
tools
```
