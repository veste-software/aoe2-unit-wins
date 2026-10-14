/* AoE2 Unit Wins - dashboard. Vanilla JS, no dependencies, no network calls except loading data/data.json. */
(function () {
  'use strict';

  /* ---------- tiny helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(String(k))); }
    return e;
  }
  function S(tag, props, ...kids) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(String(k))); }
    return e;
  }
  const fmtN = (n) => Number(n).toLocaleString('en-US');
  const MINUS = '−';
  const pct = (x) => (x * 100).toFixed(1) + '%';
  const pts = (x, d) => (x >= 0 ? '+' : MINUS) + Math.abs(x * 100).toFixed(d == null ? 1 : d);
  const title = (s) => String(s).replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const sgn = (x) => (x > 0 ? 'pos' : x < 0 ? 'neg' : '');
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const TESTS = {
    cas: { name: 'Castle-age test (strict)', short: 'Castle-age (strict)', v: '--s1', help: 'Both players reached Imperial; only units built in the Castle Age count - the choice is made before the outcome is clear.' },
    imp: { name: 'Imperial test', short: 'Imperial', v: '--s2', help: 'Both players reached Imperial; units built in the Castle and Imperial Ages count.' },
    all: { name: 'Whole game', short: 'Whole game', v: '--s3', help: 'Every army unit built in the whole game. Easiest to read, but the result influences the mix.' },
  };
  const TEST_ORDER = ['cas', 'imp', 'all'];

  let D = null;
  const CORR = { cas: {}, imp: {}, all: {} };
  const ROLES = ['Infantry', 'Cavalry & camels', 'Elephants', 'Foot archers, skirmishers & gunpowder', 'Mounted archers'];

  /* ---------- tooltip ---------- */
  const tipEl = $('#tip');
  function tipNodes(lines) {
    // lines: [{k: 'label', v: 'value', c: '--s1'}] - value leads, label follows
    return lines.map((l) => h('div', null,
      l.c ? h('span', { class: 'key', style: 'background:var(' + l.c + ')' }) : null,
      l.v != null ? h('span', { class: l.big ? 'tv' : '' }, l.v) : null, l.v != null && l.k ? ' ' : null,
      l.k ? h('span', { class: 'tl' }, l.k) : null));
  }
  function showTip(nodes, x, y) {
    tipEl.replaceChildren(...nodes);
    tipEl.classList.add('on');
    const r = tipEl.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = Math.max(8, x - r.width - 14);
    if (top + r.height > innerHeight - 8) top = Math.max(8, y - r.height - 14);
    tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  }
  const hideTip = () => tipEl.classList.remove('on');
  function tipOn(el, getNodes) {
    el.addEventListener('pointermove', (e) => showTip(getNodes(), e.clientX, e.clientY));
    el.addEventListener('pointerleave', hideTip);
    el.addEventListener('focus', () => { const b = el.getBoundingClientRect(); showTip(getNodes(), b.left + b.width / 2, b.top + b.height / 2); });
    el.addEventListener('blur', hideTip);
  }

  /* ---------- scales / paths ---------- */
  const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  function niceStep(span, target) {
    const raw = span / target, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
  }
  function ticks(min, max, target) {
    const st = niceStep(max - min, target || 6), out = [];
    for (let v = Math.ceil(min / st - 1e-9) * st; v <= max + 1e-9; v += st) out.push(Math.abs(v) < 1e-12 ? 0 : v);
    return out;
  }
  function barPath(x0, x1, y, hgt, r) {
    const len = Math.abs(x1 - x0); r = Math.min(r, len, hgt / 2);
    if (len < 0.5) return 'M' + x0 + ',' + y + 'h0.5v' + hgt + 'h-0.5Z';
    return x1 >= x0
      ? `M${x0},${y}H${x1 - r}A${r},${r} 0 0 1 ${x1},${y + r}V${y + hgt - r}A${r},${r} 0 0 1 ${x1 - r},${y + hgt}H${x0}Z`
      : `M${x0},${y}H${x1 + r}A${r},${r} 0 0 0 ${x1},${y + r}V${y + hgt - r}A${r},${r} 0 0 0 ${x1 + r},${y + hgt}H${x0}Z`;
  }
  function mix(a, b, t) {
    const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
  }
  const hexOf = (name) => { const v = css(name); return /^#[0-9a-f]{6}$/i.test(v) ? v : '#888888'; };

  /* ---------- charts ---------- */
  // Horizontal bars from zero with optional CI whiskers. rows: {label, sub, v, lo, hi, c (css var), tip: [lines]}
  function forest(rows, o) {
    o = o || {};
    const W = 760, labelW = o.labelW || 215, rightPad = 64, top = 6, rowH = o.rowH || 38, axisH = 34;
    const H = top + rows.length * rowH + axisH;
    let lo = 0, hi = 0;
    rows.forEach((r) => { lo = Math.min(lo, r.v, r.lo != null ? r.lo : r.v); hi = Math.max(hi, r.v, r.hi != null ? r.hi : r.v); });
    const span0 = (hi - lo) || 0.04; lo -= lo < 0 ? span0 * 0.16 : span0 * 0.06; hi += span0 * 0.06;
    const x = lin(lo, hi, labelW, W - rightPad), x0 = x(0);
    const svg = S('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.aria || 'Bar chart' });
    const tk = o.tickList ? o.tickList.filter((t) => t.v > lo && t.v < hi) : ticks(lo * 100, hi * 100, 7).map((t) => ({ v: t / 100, t: (t > 0 ? '+' : t < 0 ? MINUS : '') + Math.abs(t) }));
    tk.forEach((tkk) => {
      const px = x(tkk.v);
      svg.append(S('line', { x1: px, x2: px, y1: top, y2: H - axisH, style: 'stroke:var(--grid);stroke-width:1' }));
      svg.append(S('text', { x: px, y: H - axisH + 16, 'text-anchor': 'middle', style: 'fill:var(--muted)' }, tkk.t));
    });
    svg.append(S('line', { x1: x0, x2: x0, y1: top, y2: H - axisH, style: 'stroke:var(--axis);stroke-width:1.5' }));
    svg.append(S('text', { x: (labelW + W - rightPad) / 2, y: H - 4, 'text-anchor': 'middle' }, o.axis || 'Win-rate uplift (percentage points)'));
    rows.forEach((r, i) => {
      const y = top + i * rowH, cy = y + rowH / 2, bh = Math.min(16, rowH - 8);
      const g = S('g', { tabindex: 0, role: 'img', 'aria-label': r.aria || (r.label + ': ' + pts(r.v) + ' points') });
      g.append(S('rect', { class: 'hit', x: 0, y: y, width: W, height: rowH }));
      g.append(S('text', { x: labelW - 10, y: cy - (r.sub ? 2 : -4), 'text-anchor': 'end', class: 'lab' }, r.label));
      if (r.sub) g.append(S('text', { x: labelW - 10, y: cy + 12, 'text-anchor': 'end', style: 'fill:var(--muted);font-size:11px' }, r.sub));
      g.append(S('path', { d: barPath(x0, x(r.v), cy - bh / 2, bh, 4), style: r.faint ? 'fill:var(' + (r.c || '--s1') + ');fill-opacity:.28;stroke:var(' + (r.c || '--s1') + ');stroke-width:1.5' : 'fill:var(' + (r.c || '--s1') + ')' }));
      let endX = x(r.v);
      if (r.lo != null && r.hi != null) {
        const a = x(r.lo), b = x(r.hi);
        g.append(S('line', { x1: a, x2: b, y1: cy, y2: cy, style: 'stroke:var(--ink);stroke-width:1.5' }));
        g.append(S('line', { x1: a, x2: a, y1: cy - 5, y2: cy + 5, style: 'stroke:var(--ink);stroke-width:1.5' }));
        g.append(S('line', { x1: b, x2: b, y1: cy - 5, y2: cy + 5, style: 'stroke:var(--ink);stroke-width:1.5' }));
        endX = Math.max(endX, b);
      }
      const left = r.v < 0 && (r.lo == null || x(r.lo) < x(r.v));
      const lx = r.v < 0 ? Math.min(x(r.v), r.lo != null ? x(r.lo) : x(r.v)) - 6 : endX + 6;
      g.append(S('text', { x: lx, y: cy + 4, 'text-anchor': r.v < 0 ? 'end' : 'start', class: 'lab', style: 'font-weight:600' }, r.valLabel || pts(r.v)));
      if (r.tip) tipOn(g, () => tipNodes(r.tip));
      if (r.onClick) { g.style.cursor = 'pointer'; g.addEventListener('click', r.onClick); g.addEventListener('keydown', (e) => { if (e.key === 'Enter') r.onClick(); }); }
      svg.append(g);
    });
    return svg;
  }

  // Scatter: x = uplift (fraction), y = games in the 'massed' group (log). pts: {x, n, c, label, tip, onClick, dim}
  function scatter(points, o) {
    const W = 760, Hh = 400, m = { l: 58, r: 18, t: 12, b: 46 };
    const svg = S('svg', { class: 'chart', viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': o.aria || 'Scatter chart of win-rate uplift against sample size' });
    let xmin = Math.min(-0.05, ...points.map((p) => p.x)), xmax = Math.max(0.05, ...points.map((p) => p.x));
    const padx = (xmax - xmin) * 0.05; xmin -= padx; xmax += padx;
    const nmin = Math.min(...points.map((p) => p.n), 100), nmax = Math.max(...points.map((p) => p.n), 1000);
    const lymin = Math.log10(nmin) - 0.05, lymax = Math.log10(nmax) + 0.08;
    const X = lin(xmin, xmax, m.l, W - m.r), Y = (n) => lin(lymin, lymax, Hh - m.b, m.t)(Math.log10(n));
    // noise band (approx. 95%): +-1.96 * k / sqrt(n)
    if (o.k) {
      const left = [], right = [];
      for (let i = 0; i <= 40; i++) { const ly = lymin + (lymax - lymin) * i / 40, n = Math.pow(10, ly), hw = 1.96 * o.k / Math.sqrt(n); left.push([X(-hw), Y(n)]); right.push([X(hw), Y(n)]); }
      svg.append(S('path', { d: 'M' + left.concat(right.reverse()).map((p) => p.join(',')).join('L') + 'Z', style: 'fill:var(--wash)' }));
      svg.append(S('text', { x: X(0), y: Y(Math.pow(10, lymin)) - 16, 'text-anchor': 'middle', style: 'fill:var(--muted);font-size:11px' }, 'noise band (approx. 95%)'));
    }
    ticks(xmin * 100, xmax * 100, 8).forEach((t) => {
      svg.append(S('line', { x1: X(t / 100), x2: X(t / 100), y1: m.t, y2: Hh - m.b, style: 'stroke:var(--grid)' }));
      svg.append(S('text', { x: X(t / 100), y: Hh - m.b + 16, 'text-anchor': 'middle', style: 'fill:var(--muted)' }, (t > 0 ? '+' : t < 0 ? MINUS : '') + Math.abs(t)));
    });
    [100, 300, 1000, 3000, 10000].filter((n) => Math.log10(n) > lymin && Math.log10(n) < lymax).forEach((n) => {
      svg.append(S('line', { x1: m.l, x2: W - m.r, y1: Y(n), y2: Y(n), style: 'stroke:var(--grid)' }));
      svg.append(S('text', { x: m.l - 8, y: Y(n) + 4, 'text-anchor': 'end', style: 'fill:var(--muted)' }, fmtN(n)));
    });
    svg.append(S('line', { x1: X(0), x2: X(0), y1: m.t, y2: Hh - m.b, style: 'stroke:var(--axis);stroke-width:1.5' }));
    svg.append(S('text', { x: (m.l + W - m.r) / 2, y: Hh - 6, 'text-anchor': 'middle' }, 'Win-rate uplift when the unit is massed (percentage points)'));
    svg.append(S('text', { transform: `translate(14 ${(m.t + Hh - m.b) / 2}) rotate(-90)`, 'text-anchor': 'middle' }, 'Games with the unit massed (log scale)'));
    const dots = points.map((p) => {
      const c = S('circle', { cx: X(p.x), cy: Y(p.n), r: p.big ? 6 : 4.5, style: `fill:var(${p.c});stroke:var(--surface);stroke-width:2;opacity:${p.dim ? 0.25 : 1}` });
      svg.append(c); return c;
    });
    const ring = S('circle', { r: 9, style: 'fill:none;stroke:var(--ink);stroke-width:2;display:none' });
    svg.append(ring);
    let cur = -1;
    function nearest(e) {
      const b = svg.getBoundingClientRect(), sx = W / b.width, px = (e.clientX - b.left) * sx, py = (e.clientY - b.top) * sx;
      let best = -1, bd = 24 * 24 * sx * sx;
      points.forEach((p, i) => { const dx = X(p.x) - px, dy = Y(p.n) - py, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
      return best;
    }
    svg.addEventListener('pointermove', (e) => {
      const i = nearest(e); cur = i;
      if (i < 0) { ring.style.display = 'none'; hideTip(); return; }
      ring.setAttribute('cx', X(points[i].x)); ring.setAttribute('cy', Y(points[i].n)); ring.style.display = '';
      showTip(tipNodes(points[i].tip), e.clientX, e.clientY);
    });
    svg.addEventListener('pointerleave', () => { ring.style.display = 'none'; hideTip(); });
    svg.addEventListener('click', (e) => { const i = nearest(e); if (i >= 0 && points[i].onClick) points[i].onClick(); });
    return svg;
  }

  // Heatmap of 10 x 10 army matchups. cell(a,b) -> {v: 0..1 diverging value around 0.5, text, tip, empty}
  function heatmap(cats, cellFn) {
    const W = 760, lw = 110, th = 96, rp = 64, cs = (W - lw - rp) / cats.length, Hh = th + cats.length * cs + 8;
    const svg = S('svg', { class: 'chart', viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': 'Army versus army matchup grid' });
    const pos = hexOf('--pole-pos'), neg = hexOf('--pole-neg'), mid = hexOf('--pole-mid');
    const short = { 'hand cannoneers': 'hand cannons', 'cavalry archers': 'cav. archers', 'scouts/hussars': 'scouts/hussars' };
    cats.forEach((c, j) => {
      const tx = lw + j * cs + cs / 2;
      svg.append(S('text', { transform: `translate(${tx} ${th - 8}) rotate(-35)`, 'text-anchor': 'start', style: 'font-size:11px' }, title(short[c] || c)));
    });
    cats.forEach((a, i) => {
      const y = th + i * cs;
      svg.append(S('text', { x: lw - 8, y: y + cs / 2 + 4, 'text-anchor': 'end', class: 'lab', style: 'font-size:11px' }, title(short[a] || a)));
      cats.forEach((b, j) => {
        const x = lw + j * cs;
        if (a === b) { svg.append(S('rect', { x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, rx: 3, style: 'fill:var(--wash)' })); return; }
        const c = cellFn(a, b);
        if (!c || c.empty) { svg.append(S('rect', { x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, rx: 3, style: 'fill:none;stroke:var(--grid)' })); return; }
        const t = Math.max(-1, Math.min(1, c.v)); // -1 (row loses) .. +1 (row wins)
        const fill = t >= 0 ? mix(mid, pos, t) : mix(mid, neg, -t);
        const g = S('g', { tabindex: 0, role: 'img', 'aria-label': c.aria });
        g.append(S('rect', { class: 'cellrect', x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, rx: 3, style: 'fill:' + fill }));
        const lum = (() => { const m2 = fill.match(/\d+/g).map(Number); return (0.2126 * m2[0] + 0.7152 * m2[1] + 0.0722 * m2[2]) / 255; })();
        g.append(S('text', { x: x + cs / 2, y: y + cs / 2 + 4, 'text-anchor': 'middle', style: `font-size:11px;font-weight:600;fill:${lum > 0.52 ? '#0b0b0b' : '#ffffff'}` }, c.text));
        tipOn(g, () => tipNodes(c.tip));
        svg.append(g);
      });
    });
    return svg;
  }

  /* ---------- generic sortable table ---------- */
  function dataTable(cols, rows, st, onChange, onRow) {
    const sorted = rows.slice().sort((a, b) => {
      const c = cols.find((k) => k.key === st.key) || cols[0];
      const va = c.val(a), vb = c.val(b);
      if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1;
      const d = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return st.desc ? -d : d;
    });
    const limit = st.limit || 100;
    const thead = h('tr', null, cols.map((c) => h('th', {
      class: c.num ? 'num' : '', tabindex: 0, 'aria-sort': st.key === c.key ? (st.desc ? 'descending' : 'ascending') : null,
      onclick: () => { if (st.key === c.key) st.desc = !st.desc; else { st.key = c.key; st.desc = c.desc !== false; } onChange(); },
      onkeydown: (e) => { if (e.key === 'Enter') e.target.click(); },
    }, c.label, st.key === c.key ? h('span', { class: 'arrow' }, st.desc ? '▼' : '▲') : null)));
    const tbody = h('tbody', null, sorted.slice(0, limit).map((r) => h('tr', { tabindex: 0, onclick: () => onRow(r), onkeydown: (e) => { if (e.key === 'Enter') onRow(r); } },
      cols.map((c) => h('td', { class: c.num ? 'num' : '' }, c.cell ? c.cell(r) : c.val(r))))));
    const wrap = h('div', { class: 'tablewrap' }, h('table', null, h('thead', null, thead), tbody));
    const more = sorted.length > limit ? h('p', { class: 'small muted', style: 'margin-top:8px' }, `Showing ${limit} of ${fmtN(sorted.length)}. `, h('button', { class: 'btn', type: 'button', onclick: () => { st.limit = limit + 150; onChange(); } }, 'Show more')) : h('p', { class: 'small muted', style: 'margin-top:8px' }, `${fmtN(sorted.length)} rows`);
    return { el: h('div', null, wrap, more), sorted };
  }
  function downloadCSV(name, head, rows) {
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const blob = new Blob([[head, ...rows].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' });
    const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove();
  }
  const select = (label, opts, val, on, id) => h('label', null, label, h('select', { id, onchange: (e) => on(e.target.value) }, opts.map((o) => h('option', { value: o.v, selected: o.v === val }, o.t))));
  const seg = (items, val, on) => h('div', { class: 'seg', role: 'group' }, items.map((i) => h('button', { type: 'button', 'aria-pressed': String(i.v === val), onclick: () => on(i.v) }, i.t)));
  const legend = () => h('div', { class: 'legend' }, TEST_ORDER.map((t) => h('span', null, h('i', { style: 'background:var(' + TESTS[t].v + ')' }), TESTS[t].short)));

  /* ---------- derived data ---------- */
  function corrRow(a) { return { civ: a[0], unit: a[1], nh: a[2], nl: a[3], wh: a[4], wl: a[5], up: a[6], se: a[7], z: a[8], r: a[9], bands: a[10] }; }
  const key = (civ, unit) => civ.toLowerCase() + '|' + unit;
  function prepare() {
    TEST_ORDER.forEach((t) => D.corr[t].forEach((a) => { const r = corrRow(a); CORR[t][key(r.civ, r.unit)] = r; }));
    D.nUnitsEvidence = D.units.filter((u) => u.real).length;
  }
  function robustSet() {
    const out = {};
    Object.values(CORR.cas).forEach((c) => {
      const k = key(c.civ, c.unit), i = CORR.imp[k], a = CORR.all[k], mw = D.windows.main.cas[k], sp = D.windows.spring.cas[k];
      if (i && a && mw > 0 && sp > 0 && c.z >= 2.5 && i.z >= 2.5 && a.z >= 2.5 && c.nh >= 200) out[k] = true;
    });
    return out;
  }
  function noiseK() { const v = D.corr.cas.map((a) => a[7] * Math.sqrt(a[2])).sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; }
  function forestRowsFor(civ, unit) {
    return TEST_ORDER.map((t) => CORR[t][key(civ, unit)] ? { t, r: CORR[t][key(civ, unit)] } : null).filter(Boolean).map(({ t, r }) => ({
      label: TESTS[t].short, sub: `${fmtN(r.nh)} vs ${fmtN(r.nl)} games`, v: r.up, lo: r.up - 1.96 * r.se, hi: r.up + 1.96 * r.se, c: TESTS[t].v,
      tip: [{ v: pts(r.up) + ' pts', k: 'uplift, ' + TESTS[t].short, c: TESTS[t].v, big: true }, { v: pct(r.wh), k: 'win rate when massed (' + fmtN(r.nh) + ' games)' }, { v: pct(r.wl), k: 'win rate when barely used (' + fmtN(r.nl) + ' games)' }, { v: 'z = ' + r.z.toFixed(1), k: '95% interval ' + pts(r.up - 1.96 * r.se) + ' to ' + pts(r.up + 1.96 * r.se) }],
    }));
  }

  /* ---------- views ---------- */

  /* ---------- unit categories, calculation explainer ---------- */
  const UCAT = {
    unique: { name: 'Unique unit', v: '--s2', short: "a civ's own Castle Age unit (or its Elite version)", help: "A civ's own Castle Age unique unit (or its Elite version)." },
    trash: { name: 'Trash', v: '--s3', short: 'costs no gold or stone after civ discounts (food and wood only)', help: "Not unique, and costs no gold or stone after the civ's discounts: food and wood only." },
    standard: { name: 'Standard', v: '--s1', short: 'every other unit', help: 'Every other unit.' },
  };
  const catLegend = () => h('div', { class: 'legend' },
    Object.values(UCAT).map((c) => h('span', { title: c.help }, h('i', { style: 'background:var(' + c.v + ')' }), c.name + ': ' + c.short)),
    h('span', null, h('i', { style: 'background:var(--muted);opacity:.4' }), 'faded / outlined = stats model only, no real-game evidence'));
  const BAND_LABELS = ['10–20 min', '20–30 min', '30–40 min', '40–50 min', '50+ min'];
  function bandTable(r) {
    const th = (x, i) => h('th', { class: i ? 'num' : '', style: 'cursor:default' }, x);
    const body = (r.bands || []).map((b, i) => {
      const has = b[4] != null;
      return h('tr', { style: 'cursor:default' + (has ? '' : ';color:var(--muted)') },
        h('td', null, BAND_LABELS[i]), h('td', { class: 'num' }, fmtN(b[0])), h('td', { class: 'num' }, has ? pct(b[2]) : '–'),
        h('td', { class: 'num' }, fmtN(b[1])), h('td', { class: 'num' }, has ? pct(b[3]) : '–'),
        h('td', { class: 'num ' + (has ? sgn(b[4]) : '') }, has ? pts(b[4]) + ' pts' : 'too few games'), h('td', { class: 'num' }, has ? Math.round(b[5] * 100) + '%' : '–'));
    });
    const foot = h('tr', { style: 'cursor:default;font-weight:650;background:var(--wash)' }, h('td', null, 'All lengths'), h('td', { class: 'num' }, fmtN(r.nh)), h('td', { class: 'num' }, pct(r.wh)),
      h('td', { class: 'num' }, fmtN(r.nl)), h('td', { class: 'num' }, pct(r.wl)), h('td', { class: 'num ' + sgn(r.up) }, pts(r.up) + ' pts'), h('td', { class: 'num' }, '100%'));
    return h('div', { class: 'tablewrap', style: 'margin:8px 0' }, h('table', null, h('thead', null, h('tr', null, ['Game length', 'Massed: games', 'Massed: win rate', 'Not massed: games', 'Not massed: win rate', 'Difference', 'Weight'].map(th))), h('tbody', null, body, foot)));
  }
  function smallBandNote(r) {
    const i = (r.bands || []).findIndex((b) => b[4] != null && b[5] < 0.05 && Math.abs(b[4]) > 0.2);
    if (i < 0) return null; const b = r.bands[i];
    return h('p', { class: 'small muted' }, `The ${BAND_LABELS[i]} band has only ${fmtN(b[0])} massed and ${fmtN(b[1])} not-massed games, so its ${pts(b[4])} difference is mostly noise; the weight column shows it counts for just ${Math.max(1, Math.round(b[5] * 100))}% of the average.`);
  }
  function bandDetails(civ, unit, test, onTest, open, onToggle) {
    const avail = TEST_ORDER.filter((t) => CORR[t][key(civ, unit)] && CORR[t][key(civ, unit)].bands);
    if (!avail.length) return null;
    if (!avail.includes(test)) test = avail[0];
    const r = CORR[test][key(civ, unit)];
    return h('details', { class: 'explain', open: open ? true : null, ontoggle: (e) => onToggle && onToggle(e.target.open) },
      h('summary', null, 'Show the calculation for ' + title(civ) + ' + ' + title(unit)),
      h('div', { class: 'filters' }, h('label', null, 'Test', seg(avail.map((t) => ({ v: t, t: TESTS[t].short })), test, onTest))),
      h('p', { class: 'small muted' }, TESTS[test].help),
      bandTable(r), smallBandNote(r),
      h('p', { class: 'small' }, `Within each game-length band, "massed" games (${title(unit)} is at least 30% of the army) are compared with "not massed" games (at most 5%). Win rates are adjusted for the rating gap, so they read as "the win rate if both players had been rated equally". The band differences are averaged using the weights shown (bigger bands count more) to give ${pts(r.up)} points.`));
  }
  function explainerBody() {
    const ex = CORR.cas[key('celts', 'woad raider')];
    const kids = [
      h('p', null, 'The question for each civ and unit: does this civ win more often in games where it builds a lot of that unit than in games where it builds almost none? This is exactly how that is measured.'),
      h('ol', null,
        h('li', null, h('b', null, 'Take the games. '), `All ranked 1v1 random-map games of that civ where both players were rated 1200+ and the game lasted at least 10 minutes (${fmtN(D.meta.base_games)} games across all civs).`),
        h('li', null, h('b', null, 'Split them into massed and not massed. '), 'Count the army units the civ built (villagers, trade, siege, ships and monks are left out). Massed = the unit is at least 30% of that army and at least 10 were built. Not massed = at most 5%. Games in between are left out, so the two groups are clearly different.'),
        h('li', null, h('b', null, 'Correct for rating. '), 'Every game has an expected result from the Elo gap: a player rated 1200 against one rated 1000 is expected to win about 76% of the time. Each group\'s win rate is its actual wins minus its expected wins, added to 50%. Beating a stronger opponent counts for more; cruising past a weaker one counts for less.'),
        h('li', null, h('b', null, 'Correct for game length. '), 'A game that ends at 15 minutes and one that ends at 50 are very different, and the unit mix depends on how long the game lasts. So games go into five length bands (10–20, 20–30, 30–40, 40–50, 50+ minutes) and massed is compared with not massed only inside the same band. The band differences are then averaged, giving bands with more games (less noise) more weight.'),
        h('li', null, h('b', null, 'The result is the uplift. '), 'That weighted average, in percentage points. +10 means: in games of the same length and rating, the civ won 10 points more often when it massed the unit.')),
      h('p', null, h('b', null, 'Three tests. '), 'The same calculation is run three ways, differing only in which units count: the whole game; only games where both players reached the Imperial Age (units built in the Castle and Imperial Ages); and a strict test that counts only units built in the Castle Age, before the outcome is clear. The strict test avoids the trap that winning players simply train more late-game units.'),
    ];
    if (ex && ex.bands) kids.push(h('p', null, h('b', null, 'Worked example: Celts and Woad Raiders (strict test). '), `Woad Raiders made up at least 30% of the Celtic army in ${fmtN(ex.nh)} games (${pct(ex.wh)} win rate) and at most 5% in ${fmtN(ex.nl)} games (${pct(ex.wl)}). By length band:`), bandTable(ex), smallBandNote(ex));
    kids.push(h('p', { class: 'small muted' }, 'What this cannot tell you: it is a correlation. A civ that wins more when it masses a unit may be winning for other reasons (it is ahead, the player is better, the unit is a symptom of a good opening). Rating and game length are controlled; skill and snowballing are not.'));
    return h('div', null, kids);
  }
  const explainer = (open) => h('details', { class: 'explain', open: open ? true : null }, h('summary', null, 'How the numbers are calculated: massed vs not massed, adjusted for rating and game length'), explainerBody());
  const tryState = { civ: 'goths', unit: 'huskarl', test: 'cas', open: false };
  function viewOverview() {
    const m = D.meta, root = h('div');
    root.append(h('section', { class: 'hero' }, h('h1', null, 'What actually wins in Age of Empires II?'),
      h('p', { class: 'lead' }, `Win rate by civilization and unit from ${fmtN(m.base_games)} real ranked 1v1 games (both players 1200+ Elo), checked against the game's own stats. Pick a civ and a unit to see whether building more of it goes with winning, and whether that survives a fair test.`)));
    root.append(h('div', { class: 'tiles' },
      tile(fmtN(m.base_games), 'ranked 1v1 games analysed'), tile(fmtN(m.games.cas), 'games in the strict test'),
      tile(fmtN(D.nUnitsEvidence), 'civ-unit pairs with real-game evidence'), tile(m.civs_in_real_data + ' of 56', 'civs covered by the game data')));

    // try-it
    const tryBox = h('div', { class: 'card' });
    root.append(h('h2', null, 'Try it: does massing a unit make a civ win more?'), tryBox);
    function renderTry() {
      const civs = [...new Set(Object.values(CORR.all).filter((r) => r.nh >= 150 && r.nl >= 150).map((r) => r.civ))].sort();
      if (!civs.includes(tryState.civ)) tryState.civ = civs[0];
      const units = Object.values(CORR.all).filter((r) => r.civ === tryState.civ && r.nh >= 150 && r.nl >= 150).sort((a, b) => b.nh - a.nh).map((r) => r.unit);
      if (!units.includes(tryState.unit)) tryState.unit = units[0];
      const a = CORR.all[key(tryState.civ, tryState.unit)], c = CORR.cas[key(tryState.civ, tryState.unit)];
      let verdict = '';
      if (!c) verdict = 'There are too few Castle-age games with this unit for the strict test, so only the weaker tests are shown.';
      else if (a.up > 0.03 && c.up < a.up * 0.5) verdict = 'The effect shrinks by more than half under the strict test: much of the whole-game gap is the unit mix following the result, not causing it.';
      else if (a.up > 0.03 && c.up >= a.up * 0.5 && c.z >= 2.5) verdict = 'The effect holds up under the strict test, which makes it more credible (still a correlation).';
      else if (a.up < -0.03) verdict = 'Massing this unit goes with losing more often, for this civ.';
      else verdict = 'No clear relationship for this civ.';
      const line = `${title(tryState.civ)} win ${pct(a.wh)} of games when ${title(tryState.unit)} makes up at least 30% of their army, against ${pct(a.wl)} when barely used (${pts(a.up)} points) counting the whole game.` + (c ? ` Counting only the Castle Age, before the outcome is clear: ${pts(c.up)} points.` : '');
      tryBox.replaceChildren(
        h('div', { class: 'filters' },
          select('Civilization', civs.map((v) => ({ v, t: title(v) })), tryState.civ, (v) => { tryState.civ = v; renderTry(); }),
          select('Unit (production line)', units.map((v) => ({ v, t: title(v) })), tryState.unit, (v) => { tryState.unit = v; renderTry(); })),
        legend(), forest(forestRowsFor(tryState.civ, tryState.unit), { aria: 'Uplift under three tests', rowH: 46 }),
        h('p', null, line), h('p', { class: 'callout' }, verdict),
        h('p', { class: 'small muted' }, 'Bars show the win-rate difference between games where the unit is at least 30% of the army (massed) and games where it is at most 5%, adjusted for the rating gap and game length, within the same civ. Whiskers are 95% intervals.'),
        bandDetails(tryState.civ, tryState.unit, tryState.test, (t) => { tryState.test = t; renderTry(); }, tryState.open, (o) => { tryState.open = o; }));
    }
    renderTry();

    // findings
    root.append(h('h2', null, 'What the data says'));
    const f = findings();
    root.append(h('div', { class: 'cards' }, f.map((x) => h('div', { class: 'card finding' }, h('div', { class: 'big ' + (x.cls || '') }, x.big), h('h3', null, x.head), h('p', { class: 'muted' }, x.body)))));

    // top 100
    root.append(h('h2', null, 'Top 100 units by expected uplift'));
    root.append(h('p', { class: 'muted' }, 'Expected uplift blends the strict-test result with a stats model, weighted by how many games exist. Click a bar for details, or see all ' + D.units.length + ' in ', h('a', { href: '#/units' }, 'Unit rankings'), '.'));
    root.append(catLegend());
    const top = D.units.slice(0, 100);
    root.append(h('div', { class: 'card' }, forest(top.map((u) => ({
      label: '#' + u.rank + '  ' + u.civ + ' ' + u.unit, v: u.up, c: UCAT[u.cat].v, faint: !u.real,
      tip: unitTip(u), onClick: () => openDetail(u), aria: '#' + u.rank + ' ' + u.civ + ' ' + u.unit + ' (' + UCAT[u.cat].name + ') expected uplift ' + pts(u.up) + ' points' + (u.real ? '' : ', model only'),
    })), { axis: 'Expected win-rate uplift (percentage points)', labelW: 270, rowH: 24 })));
    return root;
  }
  const tile = (v, l) => h('div', { class: 'tile' }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, l));
  function unitTip(u) {
    const L = [{ v: pts(u.up) + ' pts', k: 'expected uplift (#' + u.rank + ')', big: true }, { v: UCAT[u.cat].name, k: 'unit type', c: UCAT[u.cat].v }];
    if (u.real) L.push({ v: pct(u.real.wh) + ' vs ' + pct(u.real.wl), k: 'win rate massed vs barely used, strict test' }, { v: fmtN(u.real.nh), k: 'games with the unit massed' });
    else L.push({ v: 'model only', k: 'too few games with this unit at 1200+ Elo' });
    return tipNodes(L);
  }
  function findings() {
    const m = D.meta, cf = m.confound.mean_uplift_by_test, out = [];
    out.push({ big: pts(cf.all.later_and_unique) + ' \u2192 ' + pts(cf.cas.later_and_unique), cls: '', head: 'Late-game bonuses are mostly an illusion',
      body: `Counting the whole game, late and unique units seem to add ${pts(cf.all.later_and_unique)} points of win rate. Counting only what was built in the Castle Age, before the outcome is clear, it is ${pts(cf.cas.later_and_unique)}. A player who is winning trains lots of late units; the units did not cause the win.` });
    const knights = Object.values(CORR.cas).filter((r) => r.unit === 'knight' && r.nh >= 150 && r.nl >= 150);
    const kp = knights.filter((r) => r.up > 0 && r.z >= 2).sort((a, b) => b.up - a.up);
    if (knights.length) out.push({ big: `${kp.length} of ${knights.length} civs`, cls: 'pos', head: 'Massing Knights (and Paladins) goes with winning',
      body: `Under the strict test, Knight-line armies beat the same civ's other builds for ${kp.length} of ${knights.length} civs with enough games (z >= 2). Largest: ${title(kp[0].civ)} ${pts(kp[0].up)} points.` });
    const spears = Object.values(CORR.cas).filter((r) => r.unit === 'spearman' && r.nh >= 150 && r.nl >= 150);
    const sn = spears.filter((r) => r.up < 0 && r.z <= -2).sort((a, b) => a.up - b.up);
    if (spears.length) out.push({ big: `${sn.length} of ${spears.length} civs`, cls: 'neg', head: 'Spear spam loses',
      body: `Civs that mass Spearmen and Halberdiers win less often than the same civ with other builds: ${sn.length} of ${spears.length} are significantly negative. Worst: ${title(sn[0].civ)} ${pts(sn[0].up)} points.` });
    const cl = m.claims, ca = cl.find((c) => c.matchup.startsWith('Champions vs Arb')), ks = cl.find((c) => c.matchup.startsWith('Knights'));
    if (ca && ks) out.push({ big: pct(ca.cas.first_wins), head: 'Champions vs Arbalesters is close, not a counter',
      body: `Champion-heavy armies beat Arbalester-heavy ones ${pct(ca.cas.first_wins)} of the time in the strict test (${pct(ca.all.first_wins)} whole game). Knight armies beat spear armies ${pct(ks.cas.first_wins)} (${pct(ks.all.first_wins)} whole game).` });
    const cal = m.calibration;
    out.push({ big: 'r = ' + cal['used (cost weight k=0.25, no kiting)'].correlation_imperial_test.toFixed(2), head: 'The stats model needed correcting',
      body: `Checked against real army-vs-army results, a model with equal-resource fights and kiting scored r = ${cal['earlier model (equal-resource, 75% kiting)'].correlation_imperial_test.toFixed(2)}. Fights at roughly equal unit counts with no kiting score r = ${cal['used (cost weight k=0.25, no kiting)'].correlation_imperial_test.toFixed(2)}, so the ranking uses that.` });
    out.push({ big: 'Caution', head: 'Correlation, 2023 data',
      body: `Even the strict test cannot separate a unit's effect from the plans of the players who choose it. The newest unit-level data is from early 2024, so balance changes since then are not reflected. ${56 - m.civs_in_real_data} civs are missing from the real-game data (added to the game after it ends, or never recorded by the source).` });
    return out;
  }

  /* ---- Unit rankings ---- */
  const uState = { civ: '', role: '', ev: '', cat: '', q: '', key: 'rank', desc: false, limit: 100 };
  function viewUnits() {
    const root = h('div'); root.append(h('h1', null, 'Unit rankings'),
      h('p', { class: 'lead' }, 'Every civ and unit, ranked by expected win-rate uplift: how much more a civ wins when it masses that unit, adjusted for rating and game length. Click a column to sort and a row for the full breakdown.'),
      explainer(true));
    const body = h('div');
    function draw() {
      const rows = D.units.filter((u) => (!uState.civ || u.civ === uState.civ) && (!uState.role || u.role === uState.role) && (!uState.cat || u.cat === uState.cat) &&
        (uState.ev === '' || (uState.ev === 'real' ? !!u.real : !u.real)) && (!uState.q || (u.civ + ' ' + u.unit).toLowerCase().includes(uState.q.toLowerCase())));
      const maxUp = Math.max(0.05, ...D.units.map((u) => Math.abs(u.up)));
      const order = { unique: 0, trash: 1, standard: 2 };
      const cols = [
        { key: 'rank', label: '#', num: true, desc: false, val: (u) => u.rank },
        { key: 'civ', label: 'Civ', desc: false, val: (u) => u.civ }, { key: 'unit', label: 'Unit', desc: false, val: (u) => u.unit, cell: (u) => h('span', null, u.unit, u.caveats.length ? h('span', { class: 'tag', title: 'Has an ability the data cannot quantify: ' + u.caveats[0] }, '†') : null) },
        { key: 'cat', label: 'Type', desc: false, val: (u) => order[u.cat], cell: (u) => h('span', null, h('span', { class: 'catdot', style: 'background:var(' + UCAT[u.cat].v + ')' }), UCAT[u.cat].name) },
        { key: 'up', label: 'Expected uplift', num: true, val: (u) => u.up, cell: (u) => h('span', null, h('span', { class: 'inbar' + (u.up < 0 ? ' neg' : '') + (u.real ? '' : ' faint'), style: `width:${Math.round(Math.abs(u.up) / maxUp * 60)}px;background:var(${UCAT[u.cat].v})` }), pts(u.up) + ' pts') },
        { key: 'wh', label: 'Win rate: massed vs not massed', num: true, val: (u) => (u.real ? u.real.wh : null), cell: (u) => (u.real ? pct(u.real.wh) + ' vs ' + pct(u.real.wl) : h('span', { class: 'muted' }, 'model only')) },
        { key: 'nh', label: 'Games massed', num: true, val: (u) => (u.real ? u.real.nh : null), cell: (u) => (u.real ? fmtN(u.real.nh) : '') },
        { key: 'model', label: 'Model score', num: true, val: (u) => u.model, cell: (u) => u.model.toFixed(2) },
        { key: 'hp', label: 'HP', num: true, val: (u) => u.hp, cell: (u) => Math.round(u.hp) }, { key: 'atk', label: 'Atk', num: true, val: (u) => u.atk, cell: (u) => Math.round(u.atk) },
        { key: 'arm', label: 'Armor', num: true, val: (u) => u.ma * 100 + u.pa, cell: (u) => u.ma + '/' + u.pa }, { key: 'rng', label: 'Range', num: true, val: (u) => u.rng },
        { key: 'cost', label: 'Cost', num: true, val: (u) => costEq(u), cell: (u) => costStr(u) },
      ];
      const t = dataTable(cols, rows, uState, draw, openDetail);
      body.replaceChildren(catLegend(), h('p', { class: 'small muted' }, '"Massed" = the unit is at least 30% of the civ\'s army, "not massed" = at most 5% (see the calculation above). † = unit has an ability the data cannot quantify. Armor is melee/pierce. Stats are fully upgraded for that civ. Unit type is by the cost the civ actually pays, so a civ discount can turn a unit into trash.'), t.el);
      uState._rows = t.sorted;
    }
    const civs = [...new Set(D.units.map((u) => u.civ))].sort();
    root.append(h('div', { class: 'filters' },
      select('Civilization', [{ v: '', t: 'All civs' }, ...civs.map((c) => ({ v: c, t: c }))], uState.civ, (v) => { uState.civ = v; uState.limit = 100; draw(); }),
      select('Type', [{ v: '', t: 'All types' }, { v: 'unique', t: 'Unique units' }, { v: 'trash', t: 'Trash (no gold)' }, { v: 'standard', t: 'Standard' }], uState.cat, (v) => { uState.cat = v; uState.limit = 100; draw(); }),
      select('Role', [{ v: '', t: 'All roles' }, ...ROLES.map((c) => ({ v: c, t: c }))], uState.role, (v) => { uState.role = v; uState.limit = 100; draw(); }),
      select('Evidence', [{ v: '', t: 'All' }, { v: 'real', t: 'Real-game evidence' }, { v: 'model', t: 'Model only' }], uState.ev, (v) => { uState.ev = v; uState.limit = 100; draw(); }),
      h('label', null, 'Search', h('input', { type: 'search', value: uState.q, placeholder: 'e.g. Teutons, Paladin', oninput: (e) => { uState.q = e.target.value; uState.limit = 100; draw(); } })),
      h('button', { class: 'btn', type: 'button', onclick: () => downloadCSV('aoe2-unit-wins-ranking.csv', ['rank', 'civ', 'unit', 'type', 'role', 'expected_uplift_pts', 'real_wr_massed', 'real_wr_not_massed', 'games_massed', 'model_score', 'hp', 'attack', 'melee_armor', 'pierce_armor', 'range', 'cost_eq'],
        (uState._rows || D.units).map((u) => [u.rank, u.civ, u.unit, UCAT[u.cat].name, u.role, (u.up * 100).toFixed(2), u.real ? u.real.wh : '', u.real ? u.real.wl : '', u.real ? u.real.nh : '', u.model, u.hp, u.atk, u.ma, u.pa, u.rng, costEq(u).toFixed(1)])) }, 'Download CSV')));
    root.append(body); draw();
    const qp = new URLSearchParams((location.hash.split('?')[1]) || '');
    if (qp.get('civ') && qp.get('unit')) { const u = D.units.find((x) => x.civ === qp.get('civ') && x.unit === qp.get('unit')); if (u) setTimeout(() => openDetail(u), 0); }
    return root;
  }
  const costEq = (u) => (u.cost.food || 0) + (u.cost.wood || 0) + 1.5 * ((u.cost.gold || 0) + (u.cost.stone || 0));
  const costStr = (u) => Object.entries(u.cost).map(([k, v]) => Math.round(v * 10) / 10 + { food: 'F', wood: 'W', gold: 'G', stone: 'S' }[k]).join(' ');

  let detailTest = 'cas', detailOpen = false;
  function openDetail(u) {
    const d = $('#detail');
    const close = () => d.close();
    const parts = [];
    parts.push(h('p', { class: 'muted', style: 'margin:0 0 6px' }, h('span', { class: 'catdot', style: 'background:var(' + UCAT[u.cat].v + ')' }), UCAT[u.cat].name + ' – ' + UCAT[u.cat].help));
    parts.push(h('div', { class: 'kv' }, kv(Math.round(u.hp), 'HP'), kv(Math.round(u.atk), 'Attack'), kv(u.ma + ' / ' + u.pa, 'Melee / pierce armor'), kv(u.rng, 'Range'), kv(u.spd, 'Speed'), kv(u.reload + ' s', 'Reload'), kv(costStr(u), 'Cost')));
    parts.push(h('p', null, h('b', null, 'Expected uplift ' + pts(u.up) + ' pts'), ` (rank #${u.rank}; stats-model-only rank #${u.rank_model}). `, u.real ? `${Math.round(u.ew * 100)}% of the estimate comes from real games.` : 'No usable real-game evidence, so this is the stats model alone.'));
    if (u.real) {
      const ru = u.real.ru;
      parts.push(h('h3', null, 'Real games: ' + title(ru) + ' production line'), legend(), forest(forestRowsFor(u.civ, ru), { aria: 'Uplift under three tests', rowH: 44 }),
        h('p', { class: 'small muted' }, `Win rate ${pct(u.real.wh)} when massed (${fmtN(u.real.nh)} games) vs ${pct(u.real.wl)} when barely used (${fmtN(u.real.nl)} games), strict test.`));
    }
    if (u.real) { const bd = bandDetails(u.civ, u.real.ru, detailTest, (t) => { detailTest = t; openDetail(u); }, detailOpen, (o) => { detailOpen = o; }); if (bd) parts.push(bd); }
    parts.push(h('h3', null, 'Stats model: strength vs generic fully upgraded units'));
    const mu = Object.entries(u.matchups).map(([k, v]) => ({ label: k, v: Math.log10(v), valLabel: v.toFixed(2) + '×', c: v >= 1 ? '--pole-pos' : '--pole-neg', tip: [{ v: v.toFixed(2) + '×', k: 'strength ratio vs ' + k, big: true }] }));
    const mf = forest(mu, { axis: 'Strength ratio (log scale; right of centre = this unit wins)', rowH: 28, labelW: 170, tickList: [0.1, 0.25, 0.5, 1, 2, 4, 10, 30].map((r) => ({ v: Math.log10(r) === 0 ? 0 : Math.log10(r), t: r < 1 ? '1/' + Math.round(1 / r) : String(r) })) });
    parts.push(mf);
    if (u.bonuses.length) parts.push(h('h3', null, 'Civ bonuses applied'), h('ul', { class: 'clean' }, u.bonuses.map((b) => h('li', null, b))));
    if (u.caveats.length) parts.push(h('div', { class: 'callout' }, 'Not modelled: ' + u.caveats.join('; ') + '. The data has no numbers for this ability.'));
    d.replaceChildren(h('div', { class: 'dhead' }, h('div', null, h('h2', { id: 'dtitle', style: 'margin:0' }, u.civ + ' ' + u.unit), h('p', { class: 'muted', style: 'margin:0' }, u.role)), h('button', { class: 'btn', type: 'button', onclick: close, 'aria-label': 'Close' }, 'Close')), h('div', { class: 'dbody' }, parts));
    if (!d.open) d.showModal();
  }
  const kv = (b, s) => h('div', null, h('b', null, b), h('span', null, s));
  $('#detail').addEventListener('click', (e) => { if (e.target === $('#detail')) $('#detail').close(); });

  /* ---- What wins ---- */
  const wState = { test: 'cas', civ: '', unit: '', min: 150, show: 'all', key: 'up', desc: true, limit: 100 };
  function viewWins() {
    const root = h('div');
    root.append(h('h1', null, 'What wins'), h('p', { class: 'lead' }, 'Every civ-unit pair we could measure: how much more (or less) a civ wins when that unit is at least 30% of its army. Dots above the grey band are unlikely to be noise.'));
    const robust = robustSet();
    const out = h('div');
    function draw() {
      const tbl = CORR[wState.test];
      const rows = Object.values(tbl).filter((r) => r.nh >= wState.min && r.nl >= wState.min && (!wState.civ || r.civ === wState.civ) && (!wState.unit || r.unit === wState.unit) &&
        (wState.show === 'all' || (wState.show === 'pos' && r.up > 0 && r.z >= 2) || (wState.show === 'neg' && r.up < 0 && r.z <= -2) || (wState.show === 'robust' && robust[key(r.civ, r.unit)])));
      const pointsArr = rows.map((r) => ({
        x: r.up, n: r.nh, c: TESTS[wState.test].v, dim: !!(wState.civ || wState.unit) ? false : false, big: !!robust[key(r.civ, r.unit)] && wState.show !== 'all',
        tip: [{ v: pts(r.up) + ' pts', k: title(r.civ) + ' ' + title(r.unit), c: TESTS[wState.test].v, big: true }, { v: pct(r.wh) + ' vs ' + pct(r.wl), k: 'win rate massed vs barely used' }, { v: fmtN(r.nh) + ' / ' + fmtN(r.nl), k: 'games massed / barely used' }, { v: 'z = ' + r.z.toFixed(1) + ', r = ' + r.r.toFixed(3), k: robust[key(r.civ, r.unit)] ? 'survives every check' : '' }],
        onClick: () => { tryState.civ = r.civ; tryState.unit = r.unit; location.hash = '#/overview'; },
      }));
      const chartCard = h('div', { class: 'card' }, h('h3', null, TESTS[wState.test].name), h('p', { class: 'small muted' }, TESTS[wState.test].help),
        rows.length ? scatter(pointsArr, { k: noiseK(), aria: `${rows.length} civ-unit pairs: win-rate uplift against games` }) : h('p', { class: 'muted' }, 'No pairs match these filters.'),
        h('p', { class: 'small muted' }, 'Click a dot to open that pair on the Overview page with all three tests side by side.'));
      const cols = [
        { key: 'civ', label: 'Civ', desc: false, val: (r) => r.civ, cell: (r) => title(r.civ) }, { key: 'unit', label: 'Unit (line)', desc: false, val: (r) => r.unit, cell: (r) => h('span', null, title(r.unit), robust[key(r.civ, r.unit)] ? h('span', { class: 'tag real', title: 'Significant in all three tests and positive in both time windows' }, 'robust') : null) },
        { key: 'up', label: 'Uplift', num: true, val: (r) => r.up, cell: (r) => h('span', { class: sgn(r.up) }, pts(r.up) + ' pts') },
        { key: 'wh', label: 'Win rate massed', num: true, val: (r) => r.wh, cell: (r) => pct(r.wh) }, { key: 'wl', label: 'Barely used', num: true, val: (r) => r.wl, cell: (r) => pct(r.wl) },
        { key: 'nh', label: 'Games massed', num: true, val: (r) => r.nh, cell: (r) => fmtN(r.nh) }, { key: 'z', label: 'z', num: true, val: (r) => r.z, cell: (r) => r.z.toFixed(1) },
        { key: 'r', label: 'Correlation r', num: true, val: (r) => r.r, cell: (r) => (r.r >= 0 ? '+' : MINUS) + Math.abs(r.r).toFixed(3) },
      ];
      const t = dataTable(cols, rows, wState, draw, (r) => { tryState.civ = r.civ; tryState.unit = r.unit; location.hash = '#/overview'; });
      out.replaceChildren(chartCard, h('h2', null, 'Table view'), t.el);
    }
    const civs = [...new Set(Object.values(CORR.all).map((r) => r.civ))].sort(), unitsAll = [...new Set(Object.values(CORR.all).map((r) => r.unit))].sort();
    const ctl = h('div');
    function drawControls() {
      ctl.replaceChildren(h('div', { class: 'filters' },
        h('label', null, 'Test', seg(TEST_ORDER.map((t) => ({ v: t, t: TESTS[t].short })), wState.test, (v) => { wState.test = v; drawControls(); draw(); })),
        select('Civilization', [{ v: '', t: 'All civs' }, ...civs.map((c) => ({ v: c, t: title(c) }))], wState.civ, (v) => { wState.civ = v; wState.limit = 100; draw(); }),
        select('Unit', [{ v: '', t: 'All units' }, ...unitsAll.map((c) => ({ v: c, t: title(c) }))], wState.unit, (v) => { wState.unit = v; wState.limit = 100; draw(); }),
        select('Min. games per group', [150, 300, 500, 1000].map((v) => ({ v: String(v), t: String(v) })), String(wState.min), (v) => { wState.min = +v; draw(); }),
        select('Show', [{ v: 'all', t: 'All pairs' }, { v: 'pos', t: 'Clearly positive' }, { v: 'neg', t: 'Clearly negative' }, { v: 'robust', t: 'Survive every check' }], wState.show, (v) => { wState.show = v; draw(); })));
    }
    drawControls(); root.append(ctl, out); draw();
    root.append(h('div', { class: 'callout' }, 'Read the three tests in order. Whole-game numbers are biggest but least trustworthy; the Castle-age test is the fairest. "Robust" means: significant (z >= 2.5) in all three tests and positive in both separate time windows.'));
    return root;
  }

  /* ---- Counters ---- */
  const cState = { src: 'real', test: 'cas' };
  function viewCounters() {
    const root = h('div'); root.append(h('h1', null, 'Counters: army vs army'), h('p', { class: 'lead' }, 'When one army is at least 40% of one unit type and the other army is at least 40% of another, who wins? Compared with what the stats model predicts.'));
    const ctl = h('div'), body = h('div');
    function drawControls() {
      ctl.replaceChildren(h('div', { class: 'filters' },
        h('label', null, 'Show', seg([{ v: 'real', t: 'Real games' }, { v: 'model', t: 'Stats model' }], cState.src, (v) => { cState.src = v; drawControls(); draw(); })),
        h('label', null, 'Test', seg(TEST_ORDER.map((t) => ({ v: t, t: TESTS[t].short })), cState.test, (v) => { cState.test = v; drawControls(); draw(); }))));
    }
    function draw() {
      const real = {}; D.matrix[cState.test].forEach(([a, b, wr, n]) => { real[a + '|' + b] = { wr, n }; });
      const mod = {}; D.model_matrix.forEach(([a, b, R]) => { mod[a + '|' + b] = R; });
      let agree = 0, tot = 0;
      D.cats.forEach((a) => D.cats.forEach((b) => { const r = real[a + '|' + b], m = mod[a + '|' + b]; if (a < b && r && r.n >= 150 && m) { tot++; if ((r.wr > 0.5) === (m > 1)) agree++; } }));
      const grid = heatmap(D.cats, (a, b) => {
        const r = real[a + '|' + b], m = mod[a + '|' + b];
        if (cState.src === 'real') {
          if (!r || r.n < 100) return { empty: true };
          return { v: (r.wr - 0.5) / 0.15, text: Math.round(r.wr * 100) + '%', aria: title(a) + ' beat ' + title(b) + ' ' + pct(r.wr) + ' of ' + fmtN(r.n) + ' games',
            tip: [{ v: pct(r.wr), k: title(a) + ' beat ' + title(b), big: true }, { v: fmtN(r.n), k: 'games' }, { v: m ? m.toFixed(2) + '\u00D7' : 'n/a', k: 'stats model strength ratio' }] };
        }
        if (!m) return { empty: true };
        return { v: Math.log10(m), text: m.toFixed(1) + '\u00D7', aria: 'Model: ' + title(a) + ' vs ' + title(b) + ' strength ratio ' + m.toFixed(2),
          tip: [{ v: m.toFixed(2) + '\u00D7', k: 'model strength: ' + title(a) + ' over ' + title(b), big: true }, { v: r ? pct(r.wr) : 'n/a', k: 'real win rate (' + (r ? fmtN(r.n) : 0) + ' games)' }] };
      });
      body.replaceChildren(h('div', { class: 'card' }, h('p', { class: 'small muted' }, cState.src === 'real'
        ? "Each cell: the row army's win rate against the column army, adjusted for rating. Blue = row wins, red = row loses; blank = fewer than 100 games. Hover for the game count and the model's view."
        : "Each cell: the stats model's strength ratio of the row army over the column army (fully upgraded generic units). Blue = row favoured."), grid),
        h('p', null, 'In ' + agree + ' of ' + tot + ' matchups with at least 150 games, the stats model picks the same winner as real games (' + TESTS[cState.test].short + ' test).'),
        h('h2', null, 'Claims people argue about'), claimsTable());
    }
    drawControls(); root.append(ctl, body); draw();
    return root;
  }
  function claimsTable() {
    const rows = D.meta.claims.map((c) => h('tr', null, h('td', null, c.matchup), ...['all', 'imp', 'cas'].map((t) => h('td', { class: 'num' }, c[t] ? pct(c[t].first_wins) + ' (' + fmtN(c[t].games) + ')' : 'n/a'))));
    return h('div', { class: 'tablewrap' }, h('table', null, h('thead', null, h('tr', null, h('th', null, 'First army wins'), ...['all', 'imp', 'cas'].map((t) => h('th', { class: 'num' }, TESTS[t].short)))), h('tbody', null, rows)));
  }

  /* ---- Civs ---- */
  const slug = (n) => 'civ-' + n.replace(/\W/g, '');
  function viewCivs() {
    const root = h('div');
    root.append(h('h1', null, 'Civilizations'), h('p', { class: 'lead' }, 'All ' + D.civs.length + ' civs, one below the other: bonuses, unique units and techs, and how each of their units ranks. Use the dropdown to jump to one.'));
    root.append(h('div', { class: 'jumpbar' },
      select('Jump to civilization', [{ v: '', t: 'Choose a civ…' }, ...D.civs.map((c) => ({ v: c.name, t: c.name }))], '', (v) => {
        if (!v) return; const el = document.getElementById(slug(v));
        if (el) { el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); el.focus({ preventScroll: true }); }
      }), catLegend()));
    const inData = new Set(); TEST_ORDER.forEach((t) => Object.values(CORR[t]).forEach((r) => inData.add(r.civ)));
    D.civs.forEach((c) => {
      const us = D.units.filter((u) => u.civ === c.name);
      const anyReal = us.some((u) => u.real), present = inData.has(c.name.toLowerCase());
      const bars = forest(us.map((u) => ({ label: u.unit, v: u.up, c: UCAT[u.cat].v, faint: !u.real, tip: unitTip(u), onClick: () => openDetail(u),
        aria: u.unit + ' (' + UCAT[u.cat].name + ') ' + pts(u.up) + ' points' + (u.real ? '' : ', model only') })), { axis: 'Expected win-rate uplift (percentage points)', labelW: 220, rowH: 30 });
      root.append(h('section', { id: slug(c.name), class: 'civsec', tabindex: '-1' },
        h('div', { class: 'civhead' }, h('h2', null, c.name), h('span', { class: 'muted' }, c.style + ' civilization'), h('button', { class: 'btn', type: 'button', onclick: () => scrollTo({ top: 0, behavior: 'smooth' }) }, '↑ Top')),
        h('div', { class: 'card' }, anyReal ? null : h('p', { class: 'callout' }, present ? 'This civ has too few games at 1200+ Elo for any of its units to be measured, so every number below is from the stats model.' : 'This civ is not in the real-game data, which ends in early 2024 and has no games for it, so every number below is from the stats model.'),
          h('h3', null, 'Bonuses'), h('ul', { class: 'clean' }, c.bonuses.map((b) => h('li', null, b))),
          h('p', null, h('b', null, 'Team bonus: '), c.team), h('p', null, h('b', null, 'Unique units: '), c.uu.join(', ')),
          h('h3', null, 'Unique techs'), h('ul', { class: 'clean' }, c.ut.map((b) => h('li', null, b)))),
        h('div', { class: 'card' }, h('h3', null, 'Units for ' + c.name + ' by expected uplift'), bars)));
    });
    return root;
  }

  /* ---- Method ---- */
  function viewMethod() {
    const m = D.meta, cf = m.confound, root = h('div');
    root.append(h('h1', null, 'Method and caveats'));
    const sec = (t, ...c) => root.append(h('h2', null, t), ...c);
    sec('Where the numbers come from',
      h('p', null, 'Game results come from the public weekly database dumps of aoestats.io: ranked 1v1 random map games where a replay was parsed, giving each player\'s units built in each age. Windows used: ' + m.windows + '. ' + m.why_not_newer + '.'),
      h('p', null, `${fmtN(m.base_games)} games have two different civs, both players rated 1200+, and last at least 10 minutes. Each test then keeps games with enough army units (and, for two of the tests, where both players reached the Imperial Age): ${TEST_ORDER.map((t) => TESTS[t].short + ' ' + fmtN(m.games[t])).join(', ')}. Villagers, trade units, siege, ships and monks are not counted as army.`),
      h('p', null, 'Unit and civ stats come from the game data in SiegeEngineers/aoe2techtree (DE update 185872): base stats, available upgrades per civ, civ bonuses and unique techs.'));
    sec('How the win-rate uplift is calculated', explainerBody());
    sec('Why there are three tests',
      h('p', null, 'The whole-game count is contaminated: a player who loses early never reaches the Castle Age (so lands in the "barely used" group for every Castle-age unit), and a player who is ahead trains lots of late units. The Imperial test removes early losses; the Castle-age test looks only at what was built before the outcome is clear.'),
      tableOf(['Test', 'Early-age lines', 'Later and unique units'], TEST_ORDER.map((t) => [TESTS[t].name, pts(cf.mean_uplift_by_test[t].early_lines), pts(cf.mean_uplift_by_test[t].later_and_unique)])),
      h('p', { class: 'small muted' }, 'Average uplift in percentage points. Early-age lines: Spearman, Skirmisher, Archer, Militia, Scout, Eagle. The gap between the two columns is the age artifact. Replication between two separate time windows: ' + TEST_ORDER.map((t) => TESTS[t].short + ' r = ' + cf.replication_main_vs_spring[t].r.toFixed(2)).join(', ') + '. When outcomes are shuffled at random, at most ' + (100 * Math.max(...TEST_ORDER.map((t) => cf.shuffled_outcome_placebo[t].share_abs_z_over_3))).toFixed(1) + '% of pairs reach |z| > 3, so the pipeline does not invent effects.'));
    sec('The stats model and how it was checked',
      h('p', null, 'The model fights each civ\'s fully upgraded unit (with its civ bonuses) against 11 generic fully upgraded reference units using the game\'s attack and armor class tables and a Lanchester square-law estimate. Its settings were chosen by how well it predicts real army-vs-army results:'),
      tableOf(['Model version', 'Correlation, Imperial test', 'Same winner', 'Correlation, Castle-age test', 'Same winner'], Object.entries(m.calibration).map(([k, v]) => [k, v.correlation_imperial_test.toFixed(2), v.same_winner_imperial_test, v.correlation_castle_age_test.toFixed(2), v.same_winner_castle_age_test])),
      h('p', null, `Expected uplift combines the strict-test result and the model's prediction (a linear fit across ${m.sensitivity.pairs_with_real_data} pairs, r = ${m.sensitivity.model_vs_real_uplift_correlation}), weighted by how many games exist: well-sampled pairs follow the data, thin or missing ones follow the model.`));
    sec('Limits',
      h('ul', { class: 'clean' },
        h('li', null, 'Correlation, not cause. Skill and plans of the players who choose a unit are not separated out.'),
        h('li', null, 'Old data: unit-level evidence ends in early 2024; units, balance and civs have changed since. 11 civs are missing from it and are model-only.'),
        h('li', null, 'Production lines, not final forms: "knight" covers Knight, Cavalier and Paladin; the data\'s "camel scout" label is wrong and is not used.'),
        h('li', null, 'Shares count units, not resources; cheap units look more common than they are in spend.'),
        h('li', null, 'Abilities with no numbers in the game data (multi-arrow volleys, trample, charge, regeneration, auras) are marked † and not modelled. Production speed, economy, team bonuses, siege, ships, monks and heroes are ignored.'),
        h('li', null, `Choices matter: without the real-game evidence the top 20 would share only ${m.sensitivity.top20_overlap_model_only_vs_final} places with this ranking.`)));
    sec('Download the data',
      h('ul', { class: 'clean' },
        h('li', null, h('a', { href: 'data/unit-ranking-full.json' }, 'unit-ranking-full.json'), ' - every civ-unit row: stats, matchups, bonuses applied, real-game results.'),
        h('li', null, h('a', { href: 'data/winrate-by-unit-full.json' }, 'winrate-by-unit-full.json'), ' - every civ-unit win-rate result for all three tests and both time windows, plus the army-vs-army matrices.'),
        h('li', null, h('a', { href: 'data/report.md' }, 'report.md'), ' - the written report.'),
        h('li', null, h('a', { href: 'data/data.json' }, 'data.json'), ' - the compact bundle this site runs on.')));
    return root;
  }
  function tableOf(head, rows) {
    return h('div', { class: 'tablewrap', style: 'margin:8px 0 10px' }, h('table', null, h('thead', null, h('tr', null, head.map((x, i) => h('th', { class: i ? 'num' : '', style: 'cursor:default' }, x)))), h('tbody', null, rows.map((r) => h('tr', { style: 'cursor:default' }, r.map((c, i) => h('td', { class: i ? 'num' : '' }, c)))))));
  }

  /* ---------- router ---------- */
  const ROUTES = { overview: viewOverview, units: viewUnits, wins: viewWins, counters: viewCounters, civs: viewCivs, method: viewMethod };
  function route(keepScroll) {
    const name = (location.hash.replace(/^#\/?/, '') || 'overview').split('?')[0];
    const fn = ROUTES[name] || viewOverview;
    document.querySelectorAll('nav a').forEach((a) => { if (a.dataset.nav === (ROUTES[name] ? name : 'overview')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    hideTip();
    $('#view').replaceChildren(fn());
    if (!keepScroll) window.scrollTo(0, 0);
    const t = { overview: 'AoE2 Unit Wins - which units actually win?', units: 'Unit rankings', wins: 'What wins', counters: 'Counters', civs: 'Civilizations', method: 'Method' }[name] || 'AoE2 Unit Wins';
    document.title = name === 'overview' ? t : t + ' - AoE2 Unit Wins';
  }

  /* ---------- theme ---------- */
  function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  const qTheme = new URLSearchParams(location.search).get('theme');
  if (qTheme === 'dark' || qTheme === 'light') applyTheme(qTheme);
  else { try { applyTheme(localStorage.getItem('theme')); } catch (e) { /* storage unavailable: follow the OS */ } }
  $('#theme').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark'; applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    route(true);
  });

  const setHdr = () => document.documentElement.style.setProperty('--hdr', ($('header.top') ? $('header.top').offsetHeight : 56) + 'px');
  window.addEventListener('resize', setHdr); setHdr();

  /* ---------- boot ---------- */
  fetch('data/data.json').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then((j) => {
    D = j; prepare(); window.addEventListener('hashchange', route); route();
  }).catch((e) => { $('#view').replaceChildren(h('p', { class: 'callout' }, 'Could not load the data (' + e.message + '). If you opened this file directly, serve the folder with a local web server instead.')); });
})();
