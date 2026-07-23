const DATA = window.OLESNICE_DATA;

let COLORS = {
  blue: "#62a8ff",
  red: "#ff6f7b",
  green: "#58d38c",
  amber: "#f5b84b",
  violet: "#b99cff",
  gray: "#9aa9b5"
};

function refreshColors() {
  const styles = getComputedStyle(document.body);
  COLORS = {
    blue: styles.getPropertyValue("--blue").trim(),
    red: styles.getPropertyValue("--red").trim(),
    green: styles.getPropertyValue("--green").trim(),
    amber: styles.getPropertyValue("--amber").trim(),
    violet: styles.getPropertyValue("--violet").trim(),
    gray: styles.getPropertyValue("--muted").trim()
  };
}

function formatGeneratedAt(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function applyTheme(theme, rerender = false) {
  document.body.dataset.theme = theme;
  localStorage.setItem("olesniceTheme", theme);
  document.querySelector("#themeToggleText").textContent = theme === "dark" ? "Světlý režim" : "Tmavý režim";
  refreshColors();
  if (rerender) render();
}

function initTheme() {
  const saved = localStorage.getItem("olesniceTheme");
  const theme = saved === "light" || saved === "dark" ? saved : "dark";
  applyTheme(theme, false);
  document.querySelector("#themeToggle").addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark", true);
  });
}

const state = {
  season: "all",
  hose: "all",
  league: "all",
  event: "all",
  trendMetric: "results"
};

const els = {
  season: document.querySelector("#seasonFilter"),
  hose: document.querySelector("#hoseFilter"),
  league: document.querySelector("#leagueFilter"),
  event: document.querySelector("#eventFilter"),
  trendMetric: document.querySelector("#trendMetric")
};

const numberFields = new Set([
  "rank", "sezona", "sezona_sort", "L", "P", "vysledny_cas", "poradi",
  "cas", "sestrik",
  "pocet_zavodu", "pocet_vysledku_do_statistik", "pocet_np_bez_vysledku",
  "nejlepsi_cas", "prumer_vysledku", "median_vysledku",
  "nejlepsi_l", "prumer_l", "median_l",
  "nejlepsi_p", "prumer_p", "median_p",
  "nejlepsi_sestrik", "prumer_sestriku", "median_sestriku"
]);

function cleanRow(row) {
  const out = { ...row };
  for (const key of Object.keys(out)) {
    if (numberFields.has(key) && out[key] !== "" && out[key] != null) {
      out[key] = Number(String(out[key]).replace(",", "."));
    }
  }
  return out;
}

const raw = DATA.dataExport.map(cleanRow);
const seasonStats = DATA.sezony.map(cleanRow);
const eventStats = DATA.souteze.map(cleanRow);
const topResults = DATA.topVysledky.map(cleanRow);
const topHits = DATA.topSestriky.map(cleanRow);

function fmt(value, digits = 2) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function median(values) {
  const nums = values.filter(v => Number.isFinite(v)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function average(values) {
  const nums = values.filter(v => Number.isFinite(v));
  return nums.length ? nums.reduce((sum, v) => sum + v, 0) / nums.length : null;
}

function best(values) {
  const nums = values.filter(v => Number.isFinite(v));
  return nums.length ? Math.min(...nums) : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "cs"));
}

function byNumber(a, b) {
  return Number(a) - Number(b);
}

function matchesFilters(row, includeSeason = true) {
  if (includeSeason && state.season !== "all" && String(row.sezona) !== state.season) return false;
  if (state.hose !== "all" && row.hadice !== state.hose) return false;
  if (state.league !== "all" && row.liga !== state.league) return false;
  if (state.event !== "all" && row.misto !== state.event) return false;
  return true;
}

function filteredRows() {
  return raw.filter(row => matchesFilters(row));
}

function fillSelect(select, values, allLabel, selected) {
  const current = selected ?? select.value ?? "all";
  select.innerHTML = "";
  select.append(new Option(allLabel, "all"));
  for (const value of values) {
    select.append(new Option(value, value));
  }
  select.value = values.includes(current) ? current : "all";
}

function initFilters() {
  const seasons = unique(raw.map(r => String(r.sezona))).sort((a, b) => byNumber(b, a));
  fillSelect(els.season, seasons, "Všechny sezony", state.season);
  refreshDependentFilters();

  for (const [key, element] of Object.entries(els)) {
    element.addEventListener("change", () => {
      state[key] = element.value;
      if (key === "season" || key === "hose") refreshDependentFilters();
      render();
    });
  }

  document.querySelector("#resetFilters").addEventListener("click", () => {
    state.season = "all";
    state.hose = "all";
    state.league = "all";
    state.event = "all";
    state.trendMetric = "results";
    els.season.value = "all";
    els.hose.value = "all";
    els.trendMetric.value = "results";
    refreshDependentFilters();
    render();
  });

  const generatedAt = formatGeneratedAt(DATA.generatedAt);
  document.querySelector("#lastUpdated").textContent = generatedAt
    ? `Aktualizováno ${generatedAt}`
    : "Aktualizováno";
}

function refreshDependentFilters() {
  const baseRows = raw.filter(row => {
    if (state.season !== "all" && String(row.sezona) !== state.season) return false;
    if (state.hose !== "all" && row.hadice !== state.hose) return false;
    return true;
  });
  const leagues = unique(baseRows.map(r => r.liga || "Bez ligy"));
  const events = unique(baseRows.map(r => r.misto));
  fillSelect(els.league, leagues, "Všechny ligy", state.league);
  fillSelect(els.event, events, "Všechny soutěže", state.event);
  state.league = els.league.value;
  state.event = els.event.value;
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function renderKpis(rows) {
  const validResults = rows.filter(r => Number.isFinite(r.vysledny_cas));
  const targetTimes = rows.flatMap(r => [
    Number.isFinite(r.L) ? { side: "L", time: r.L, row: r } : null,
    Number.isFinite(r.P) ? { side: "P", time: r.P, row: r } : null
  ]).filter(Boolean);
  const bestResultRow = validResults.toSorted((a, b) => a.vysledny_cas - b.vysledny_cas)[0];
  const bestHit = targetTimes.toSorted((a, b) => a.time - b.time)[0];
  const starts2B = rows.filter(r => r.hadice === "2B").length;
  const starts3B = rows.filter(r => r.hadice === "3B").length;
  const seasonCount = unique(rows.map(r => String(r.sezona))).length;
  const places = rows.map(r => r.poradi).filter(Number.isFinite);
  const wins = places.filter(p => p === 1).length;
  const podiums = places.filter(p => p >= 1 && p <= 3).length;

  setText("kpiStarts", String(rows.length));
  setText("kpiBreakdown", `${starts2B}x 2B / ${starts3B}x 3B · ${seasonCount} sezon`);
  setText("kpiBestResult", bestResultRow ? fmt(bestResultRow.vysledny_cas) : "-");
  setText("kpiBestResultDetail", bestResultRow ? `${bestResultRow.datum}, ${bestResultRow.misto}, ${bestResultRow.hadice}` : "-");
  setText("kpiBestHit", bestHit ? `${fmt(bestHit.time)} ${bestHit.side}` : "-");
  setText("kpiBestHitDetail", bestHit ? `${bestHit.row.datum}, ${bestHit.row.misto}, ${bestHit.row.hadice}` : "-");
  setText("kpiMedianResult", fmt(median(validResults.map(r => r.vysledny_cas))));
  setText("kpiAvgResult", `Průměr ${fmt(average(validResults.map(r => r.vysledny_cas)))}`);
  setText("kpiWins", String(wins));
  setText("kpiPodiums", `${podiums}x bedna`);
}

function svgWrap(width, height, inner) {
  return `<svg viewBox="0 0 ${width} ${height}" role="img">${inner}</svg>`;
}

function emptyChart(el, message = "Pro zvolený filtr nejsou data.") {
  el.innerHTML = `<div class="empty">${message}</div>`;
}

function showTip(evt, html) {
  let tip = document.querySelector(".tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "tooltip";
    document.body.append(tip);
  }
  tip.innerHTML = html;
  tip.style.left = `${evt.clientX + 14}px`;
  tip.style.top = `${evt.clientY + 14}px`;
}

function hideTip() {
  document.querySelector(".tooltip")?.remove();
}

function scale(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return (outMin + outMax) / 2;
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}

function aggregateBySeason(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.sezona)) map.set(row.sezona, []);
    map.get(row.sezona).push(row);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([season, items]) => ({
    season,
    starts: items.length,
    starts2B: items.filter(r => r.hadice === "2B").length,
    starts3B: items.filter(r => r.hadice === "3B").length,
    median_vysledku: median(items.map(r => r.vysledny_cas)),
    prumer_vysledku: average(items.map(r => r.vysledny_cas)),
    nejlepsi_cas: best(items.map(r => r.vysledny_cas)),
    nejlepsi_sestrik: best(items.flatMap(r => [r.L, r.P])),
    prumer_sestriku: average(items.flatMap(r => [r.L, r.P])),
    median_sestriku: median(items.flatMap(r => [r.L, r.P])),
    median_l: median(items.map(r => r.L)),
    median_p: median(items.map(r => r.P))
  }));
}

function aggregateForMainChart(rows) {
  if (state.season === "all") {
    return aggregateBySeason(rows).map(point => ({
      ...point,
      label: String(point.season),
      tipTitle: String(point.season)
    }));
  }

  return rows
    .toSorted((a, b) => {
      const dateA = String(a.datum || "").split(".").reverse().join("-");
      const dateB = String(b.datum || "").split(".").reverse().join("-");
      return dateA.localeCompare(dateB) || String(a.misto).localeCompare(String(b.misto), "cs");
    })
    .map((row, index) => {
      const targets = [row.L, row.P].filter(Number.isFinite);
      return {
        index: index + 1,
        label: String(index + 1),
        tipTitle: `${index + 1}. ${row.datum}, ${row.misto}`,
        starts: 1,
        vysledek: Number.isFinite(row.vysledny_cas) ? row.vysledny_cas : null,
        l: Number.isFinite(row.L) ? row.L : null,
        p: Number.isFinite(row.P) ? row.P : null,
        nejlepsi_cas: Number.isFinite(row.vysledny_cas) ? row.vysledny_cas : null,
        prumer_vysledku: Number.isFinite(row.vysledny_cas) ? row.vysledny_cas : null,
        median_vysledku: Number.isFinite(row.vysledny_cas) ? row.vysledny_cas : null,
        nejlepsi_sestrik: best(targets),
        prumer_sestriku: average(targets),
        median_sestriku: median(targets)
      };
    });
}

function lineChart(el, rows, metricMode) {
  const points = aggregateForMainChart(rows);
  const series = state.season !== "all"
    ? [
        { key: "vysledek", label: "Výsledek", color: COLORS.green },
        { key: "l", label: "L", color: COLORS.blue },
        { key: "p", label: "P", color: COLORS.red }
      ]
    : metricMode === "hits"
    ? [
        { key: "nejlepsi_sestrik", label: "Top sestřik", color: COLORS.green },
        { key: "prumer_sestriku", label: "Průměr sestřiku", color: COLORS.amber },
        { key: "median_sestriku", label: "Medián sestřiku", color: COLORS.violet }
      ]
    : [
        { key: "nejlepsi_cas", label: "Top výsledek", color: COLORS.green },
        { key: "prumer_vysledku", label: "Průměr výsledku", color: COLORS.amber },
        { key: "median_vysledku", label: "Medián výsledku", color: COLORS.blue }
      ];
  const active = series.map(item => ({
    ...item,
    points: points.filter(point => Number.isFinite(point[item.key]))
  })).filter(item => item.points.length > 0);
  if (!active.length || points.length < 2) return emptyChart(el);

  const w = 900, h = 520, left = 60, right = 24, top = 28, bottom = 82;
  const allVals = active.flatMap(item => item.points.map(point => point[item.key]));
  const minY = Math.floor((Math.min(...allVals) - .8) * 10) / 10;
  const maxY = Math.ceil((Math.max(...allVals) + .8) * 10) / 10;
  const xValue = point => state.season === "all" ? Number(point.season) : Number(point.index);
  const xVals = points.map(xValue);
  const minX = Math.min(...xVals);
  const maxX = Math.max(...xVals);
  const x = point => scale(xValue(point), minX, maxX, left, w - right);
  const yFor = (point, key) => scale(point[key], minY, maxY, h - bottom, top);
  const yTicks = Array.from({ length: 6 }, (_, i) => minY + (maxY - minY) * i / 5);
  const grid = yTicks.map(t => {
    const yy = scale(t, minY, maxY, h - bottom, top);
    return `<line class="gridline" x1="${left}" x2="${w - right}" y1="${yy}" y2="${yy}"/><text class="axisText" x="12" y="${yy + 4}">${fmt(t)}</text>`;
  }).join("");
  const labelStep = Math.max(1, Math.ceil(points.length / 18));
  const labels = points.map((point, i) => {
    if (i % labelStep !== 0 && i !== points.length - 1) return "";
    const labelX = x(point);
    const labelY = h - 28;
    return `<text class="axisText" x="${labelX}" y="${labelY}" text-anchor="end" transform="rotate(-45 ${labelX} ${labelY})">${escapeHtml(point.label)}</text>`;
  }).join("");
  const paths = active.map(item => {
    const d = item.points.map((point, i) => `${i ? "L" : "M"} ${x(point)} ${yFor(point, item.key)}`).join(" ");
    const dots = item.points.map(point => {
      const extras = state.season !== "all"
        ? `Výsledek: ${fmt(point.vysledek)}<br>L: ${fmt(point.l)}<br>P: ${fmt(point.p)}`
        : metricMode === "hits"
        ? `Top: ${fmt(point.nejlepsi_sestrik)}<br>Průměr: ${fmt(point.prumer_sestriku)}<br>Medián: ${fmt(point.median_sestriku)}`
        : `Top: ${fmt(point.nejlepsi_cas)}<br>Průměr: ${fmt(point.prumer_vysledku)}<br>Medián: ${fmt(point.median_vysledku)}`;
      return `<circle cx="${x(point)}" cy="${yFor(point, item.key)}" r="4" fill="${item.color}" data-tip="<strong>${escapeHtml(point.tipTitle)}</strong><br>${extras}<br>Startů: ${point.starts}"></circle>`;
    }).join("");
    return `<path d="${d}" fill="none" stroke="${item.color}" stroke-width="3"/>${dots}`;
  }).join("");
  const legend = `<div class="legend">${active.map(item => `<span><i style="background:${item.color}"></i>${item.label}</span>`).join("")}</div>`;
  el.innerHTML = legend + svgWrap(w, h, `${grid}<line class="axis" x1="${left}" x2="${w - right}" y1="${h - bottom}" y2="${h - bottom}"/>${labels}${paths}`);
  attachTips(el);
}

function groupedBars(el, rows) {
  const points = aggregateBySeason(rows);
  if (!points.length) return emptyChart(el);
  const w = 620, h = 285, left = 42, right = 18, top = 20, bottom = 58;
  const maxY = Math.max(1, ...points.map(p => p.starts));
  const group = (w - left - right) / points.length;
  const barW = Math.max(4, Math.min(14, group / 3));
  const bars = points.map((p, i) => {
    const baseX = left + i * group + group / 2;
    const y2 = h - bottom;
    const y2b = scale(p.starts2B, 0, maxY, y2, top);
    const y3b = scale(p.starts3B, 0, maxY, y2, top);
    return `<rect x="${baseX - barW - 1}" y="${y2b}" width="${barW}" height="${y2 - y2b}" fill="${COLORS.green}" data-tip="<strong>${p.season}</strong><br>2B: ${p.starts2B}"></rect>
      <rect x="${baseX + 1}" y="${y3b}" width="${barW}" height="${y2 - y3b}" fill="${COLORS.amber}" data-tip="<strong>${p.season}</strong><br>3B: ${p.starts3B}"></rect>
      <text class="axisText" x="${baseX}" y="${h - 20}" text-anchor="end" transform="rotate(-45 ${baseX} ${h - 20})">${p.season}</text>`;
  }).join("");
  const legend = `<div class="legend"><span><i style="background:${COLORS.green}"></i>2B</span><span><i style="background:${COLORS.amber}"></i>3B</span></div>`;
  el.innerHTML = legend + svgWrap(w, h, `<line class="axis" x1="${left}" x2="${w - right}" y1="${h - bottom}" y2="${h - bottom}"/>${bars}`);
  attachTips(el);
}

function targetBars(el, rows) {
  const points = aggregateBySeason(rows).filter(p => Number.isFinite(p.median_l) || Number.isFinite(p.median_p));
  if (!points.length) return emptyChart(el);
  const w = 620, h = 285, left = 42, right = 18, top = 20, bottom = 58;
  const vals = points.flatMap(p => [p.median_l, p.median_p]).filter(Number.isFinite);
  const minY = Math.floor((Math.min(...vals) - .5) * 10) / 10;
  const maxY = Math.ceil((Math.max(...vals) + .5) * 10) / 10;
  const group = (w - left - right) / points.length;
  const barW = Math.max(4, Math.min(14, group / 3));
  const bars = points.map((p, i) => {
    const baseX = left + i * group + group / 2;
    const yBase = h - bottom;
    const lY = Number.isFinite(p.median_l) ? scale(p.median_l, minY, maxY, yBase, top) : yBase;
    const pY = Number.isFinite(p.median_p) ? scale(p.median_p, minY, maxY, yBase, top) : yBase;
    return `<rect x="${baseX - barW - 1}" y="${lY}" width="${barW}" height="${yBase - lY}" fill="${COLORS.blue}" data-tip="<strong>${p.season}</strong><br>Medián L: ${fmt(p.median_l)}"></rect>
      <rect x="${baseX + 1}" y="${pY}" width="${barW}" height="${yBase - pY}" fill="${COLORS.red}" data-tip="<strong>${p.season}</strong><br>Medián P: ${fmt(p.median_p)}"></rect>
      <text class="axisText" x="${baseX}" y="${h - 20}" text-anchor="end" transform="rotate(-45 ${baseX} ${h - 20})">${p.season}</text>`;
  }).join("");
  const legend = `<div class="legend"><span><i style="background:${COLORS.blue}"></i>L</span><span><i style="background:${COLORS.red}"></i>P</span></div>`;
  el.innerHTML = legend + svgWrap(w, h, `<line class="axis" x1="${left}" x2="${w - right}" y1="${h - bottom}" y2="${h - bottom}"/>${bars}`);
  attachTips(el);
}

function horizontalBars(el, rows, getKey, getValue, color, limit = 10, minRows = limit) {
  const map = new Map();
  for (const row of rows) {
    const key = getKey(row);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + getValue(row));
  }
  const items = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (!items.length) return emptyChart(el);
  const w = 620, h = Math.max(285, 34 + minRows * 24), left = 138, right = 22, top = 16, rowH = 24;
  const maxV = Math.max(...items.map(i => i[1]));
  const bars = items.map(([name, value], i) => {
    const y = top + i * rowH;
    const bw = scale(value, 0, maxV, 0, w - left - right);
    return `<text class="axisText" x="${left - 8}" y="${y + 15}" text-anchor="end">${escapeHtml(name)}</text>
      <rect x="${left}" y="${y}" width="${bw}" height="17" rx="3" fill="${color}" data-tip="<strong>${escapeHtml(name)}</strong><br>${value}x"></rect>
      <text class="axisText" x="${left + bw + 6}" y="${y + 14}">${value}</text>`;
  }).join("");
  el.innerHTML = svgWrap(w, h, bars);
  attachTips(el);
}

function renderPlaces(rows) {
  const el = document.querySelector("#placesChart");
  const map = new Map();
  for (const row of rows) {
    const key = Number.isFinite(row.poradi)
      ? (row.poradi <= 15 ? String(row.poradi) : "Ostatní")
      : "Bez pořadí";
    map.set(key, (map.get(key) || 0) + 1);
  }
  const items = [...map.entries()].sort((a, b) => {
    const order = (key) => {
      if (key === "Ostatní") return 16;
      if (key === "Bez pořadí") return 17;
      const parsed = Number(key);
      return Number.isFinite(parsed) ? parsed : 999999;
    };
    return order(a[0]) - order(b[0]);
  });
  if (!items.length) return emptyChart(el);
  const w = 620, h = Math.max(285, 34 + items.length * 24), left = 138, right = 22, top = 16, rowH = 24;
  const maxV = Math.max(...items.map(i => i[1]));
  const bars = items.map(([name, value], i) => {
    const y = top + i * rowH;
    const bw = scale(value, 0, maxV, 0, w - left - right);
    return `<text class="axisText" x="${left - 8}" y="${y + 15}" text-anchor="end">${escapeHtml(name)}</text>
      <rect x="${left}" y="${y}" width="${bw}" height="17" rx="3" fill="${COLORS.violet}" data-tip="<strong>${escapeHtml(name)}</strong><br>${value}x"></rect>
      <text class="axisText" x="${left + bw + 6}" y="${y + 14}">${value}</text>`;
  }).join("");
  el.innerHTML = svgWrap(w, h, bars);
  attachTips(el);
}

function renderEvents(rows) {
  horizontalBars(document.querySelector("#eventsChart"), rows, r => r.misto, () => 1, COLORS.green, 15, 17);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function table(el, rows, columns) {
  if (!rows.length) {
    el.innerHTML = `<tbody><tr><td>Pro zvolený filtr nejsou data.</td></tr></tbody>`;
    return;
  }
  const head = columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows.map(row => `<tr>${columns.map(c => `<td>${escapeHtml(c.format ? c.format(row[c.key], row) : row[c.key] || "-")}</td>`).join("")}</tr>`).join("");
  el.innerHTML = `<thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
}

function filteredTop(rows, sortKey) {
  return rows.filter(row => {
    if (state.season !== "all" && String(row.sezona) !== state.season) return false;
    if (state.hose !== "all" && row.hadice !== state.hose) return false;
    if (state.league !== "all" && row.liga !== state.league) return false;
    if (state.event !== "all" && (row.misto || row.soutez) !== state.event) return false;
    return true;
  }).toSorted((a, b) => {
    const numericSort = (value) => {
      if (value === null || value === undefined || value === "") return Infinity;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : Infinity;
    };
    const aSort = numericSort(a[sortKey]);
    const bSort = numericSort(b[sortKey]);
    if (aSort !== bSort) return aSort - bSort;
    return String(a.datum || "").localeCompare(String(b.datum || ""));
  }).slice(0, 20);
}

function renderTables() {
  table(document.querySelector("#topResultsTable"), filteredTop(topResults, "cas"), [
    { key: "datum", label: "Datum" },
    { key: "soutez", label: "Soutěž" },
    { key: "hadice", label: "Hadice" },
    { key: "cas", label: "Výsledek", format: (v, row) => Number.isFinite(v) ? fmt(v) : (row.cas_raw || "-") },
    { key: "L", label: "L", format: v => fmt(v) },
    { key: "P", label: "P", format: v => fmt(v) },
    { key: "poradi", label: "Pořadí", format: v => Number.isFinite(v) ? v : "-" }
  ]);
  table(document.querySelector("#topHitsTable"), filteredTop(topHits, "sestrik"), [
    { key: "datum", label: "Datum" },
    { key: "soutez", label: "Soutěž" },
    { key: "hadice", label: "Hadice" },
    { key: "strana", label: "Terč" },
    { key: "sestrik", label: "Sestřik", format: v => fmt(v) },
    { key: "liga", label: "Liga" }
  ]);
}

function attachTips(root) {
  root.querySelectorAll("[data-tip]").forEach(node => {
    node.addEventListener("mousemove", evt => showTip(evt, node.dataset.tip));
    node.addEventListener("mouseleave", hideTip);
  });
}

function render() {
  const rows = filteredRows();
  renderKpis(rows);
  lineChart(document.querySelector("#seasonTrend"), rows, state.trendMetric);
  groupedBars(document.querySelector("#startsChart"), rows);
  targetBars(document.querySelector("#targetsChart"), rows);
  renderPlaces(rows);
  renderEvents(rows);
  renderTables();
}

initTheme();
initFilters();
render();
