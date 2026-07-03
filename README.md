# Olešnice X - aktualizace webu

Krátký návod, jak z nového Excelu vygenerovat aktuální dashboard a ručně ho nahrát na GitHub Pages.

## Co ve složce nechat

Pro běžnou práci stačí:

```text
update_local.ps1
build_local_stats.py
build_web_dashboard.py
Zdroj_dat\
web_dashboard\
README.md
```

Ostatní skripty nejsou pro běžný refresh potřeba.

## 1. Vlož nový Excel

Nový `.xlsx` soubor dej do složky:

```text
Zdroj_dat
```

Název Excelu může být libovolný.

## 2. Spusť refresh

Otevři PowerShell ve složce `Git_page_refresh` a spusť:

```powershell
.\update_local.ps1
```

Skript:

- načte Excel ze složky `Zdroj_dat`,
- přepočítá statistiky,
- vytvoří nový web ve složce `web_dashboard`.

## 3. Nahraj web na GitHub

Na GitHub Pages nahraj pouze soubory ze složky:

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

Tyto 4 soubory nahraj do rootu repozitáře, pokud GitHub Pages běží z rootu.

Pokud GitHub Pages běží ze složky `docs`, nahraj je do `docs`.

## Co nenahrávat do rootu webu

Do rootu webu nedávej:

```text
update_local.ps1
build_local_stats.py
build_web_dashboard.py
Zdroj_dat
vystupy
```

Když je chceš mít na GitHubu jako zálohu, dej je do složky:

```text
tools
```

## Nejkratší tahák

```powershell
.\update_local.ps1
```

Potom na GitHub nahraj:

```text
web_dashboard\index.html
web_dashboard\styles.css
web_dashboard\app.js
web_dashboard\data.js
```

## Častá chyba

Nespouštěj:

```powershell
python build_local_stats.py
```

Používej:

```powershell
.\update_local.ps1
```
