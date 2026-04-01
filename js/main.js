/* ── COST BARS ────────────────────────────────────────────── */
function animateCostBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.cost-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.cost-bars').forEach(el => {
    el.querySelectorAll('.cost-fill').forEach(bar => { bar.style.width = '0%'; });
    observer.observe(el);
  });
}

/* ── MACH PROFILE ─────────────────────────────────────────── */
function drawMachProfile() {
  document.querySelectorAll('.mach-profile').forEach(svg => {
    const W   = svg.clientWidth  || 500;
    const H   = svg.clientHeight || 200;
    const pad = { l: 36, r: 16, t: 16, b: 36 };
    const iW  = W - pad.l - pad.r;
    const iH  = H - pad.t - pad.b;
    const ns  = 'http://www.w3.org/2000/svg';

    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const M = t < 0.35
        ? 0.1 + 0.9 * (t / 0.35)
        : 1 + 13 * Math.pow((t - 0.35) / 0.65, 1.35);
      pts.push({ t, M });
    }

    const x = t => pad.l + t * iW;
    const y = M => pad.t + iH - (M / 14) * iH;

    const pathD = pts.map((p, i) =>
      `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.M).toFixed(1)}`
    ).join(' ');

    const fillD = pathD +
      ` L${x(1)},${(pad.t + iH).toFixed(1)} L${pad.l},${(pad.t + iH).toFixed(1)} Z`;

    // Gradient
    const defs = document.createElementNS(ns, 'defs');
    const gid  = 'mg' + Math.random().toString(36).slice(2, 6);
    const grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', gid);
    grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '1'); grad.setAttribute('y2', '0');
    [['0%', '#e8e4de'], ['100%', '#c8602a']].forEach(([off, clr]) => {
      const s = document.createElementNS(ns, 'stop');
      s.setAttribute('offset', off);
      s.setAttribute('stop-color', clr);
      grad.appendChild(s);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Fill area
    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', fillD);
    area.setAttribute('fill', `url(#${gid})`);
    area.setAttribute('opacity', '0.12');
    svg.appendChild(area);

    // Y grid lines
    [0, 2, 4, 6, 8, 10, 12, 14].forEach(M => {
      const yp = y(M);
      const gl = document.createElementNS(ns, 'line');
      gl.setAttribute('x1', pad.l); gl.setAttribute('y1', yp);
      gl.setAttribute('x2', pad.l + iW); gl.setAttribute('y2', yp);
      gl.setAttribute('stroke', '#e8e4de');
      gl.setAttribute('stroke-width', '1');
      svg.insertBefore(gl, area);

      const lbl = document.createElementNS(ns, 'text');
      lbl.setAttribute('x', pad.l - 6);
      lbl.setAttribute('y', yp + 4);
      lbl.setAttribute('fill', '#9c9488');
      lbl.setAttribute('font-size', '9');
      lbl.setAttribute('font-family', 'Inter, sans-serif');
      lbl.setAttribute('text-anchor', 'end');
      lbl.textContent = M;
      svg.appendChild(lbl);
    });

    // Throat line
    const tx = x(0.35);
    const tl = document.createElementNS(ns, 'line');
    tl.setAttribute('x1', tx); tl.setAttribute('y1', pad.t);
    tl.setAttribute('x2', tx); tl.setAttribute('y2', pad.t + iH);
    tl.setAttribute('stroke', '#e8e4de');
    tl.setAttribute('stroke-dasharray', '4,3');
    tl.setAttribute('stroke-width', '1');
    svg.insertBefore(tl, area);

    const tlbl = document.createElementNS(ns, 'text');
    tlbl.setAttribute('x', tx + 5);
    tlbl.setAttribute('y', pad.t + 12);
    tlbl.setAttribute('fill', '#9c9488');
    tlbl.setAttribute('font-size', '9');
    tlbl.setAttribute('font-family', 'Inter, sans-serif');
    tlbl.textContent = 'throat';
    svg.appendChild(tlbl);

    // Main line
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', pathD);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#c8602a');
    line.setAttribute('stroke-width', '1.75');
    svg.appendChild(line);

    // Exit label
    const el = document.createElementNS(ns, 'text');
    el.setAttribute('x', x(0.97));
    el.setAttribute('y', y(14) + 14);
    el.setAttribute('fill', '#c8602a');
    el.setAttribute('font-size', '9');
    el.setAttribute('font-family', 'Inter, sans-serif');
    el.setAttribute('text-anchor', 'end');
    el.textContent = 'M = 14';
    svg.appendChild(el);

    // Axis labels
    const ya = document.createElementNS(ns, 'text');
    ya.setAttribute('x', 8);
    ya.setAttribute('y', H / 2);
    ya.setAttribute('fill', '#9c9488');
    ya.setAttribute('font-size', '9');
    ya.setAttribute('font-family', 'Inter, sans-serif');
    ya.setAttribute('text-anchor', 'middle');
    ya.setAttribute('transform', `rotate(-90,8,${H / 2})`);
    ya.textContent = 'Mach Number';
    svg.appendChild(ya);
  });
}

/* ── NOZZLE CONTOUR ───────────────────────────────────────── */
function drawNozzleContour() {
  const svg = document.querySelector('#nozzleContour');
  if (!svg) return;

  const W  = svg.clientWidth  || 800;
  const H  = svg.clientHeight || 260;
  const ns = 'http://www.w3.org/2000/svg';
  const cx = 0.36;

  svg.setAttribute('width', W);
  svg.setAttribute('height', H);

  const upper = [], lower = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    let r;
    if (t < cx) {
      const s = t / cx;
      r = 0.36 - 0.24 * (3 * s * s - 2 * s * s * s);
    } else {
      const s = (t - cx) / (1 - cx);
      r = 0.12 + 0.32 * (3 * s * s - 2 * s * s * s + 0.25 * Math.sin(Math.PI * s));
    }
    const px = 32 + t * (W - 64);
    upper.push({ x: px, y: H / 2 - r * H });
    lower.push({ x: px, y: H / 2 + r * H });
  }

  const toPath = pts => pts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ');

  // Fill
  const fillD = toPath(upper) + ' ' + toPath([...lower].reverse()).replace('M', 'L') + ' Z';
  const fill  = document.createElementNS(ns, 'path');
  fill.setAttribute('d', fillD);
  fill.setAttribute('fill', '#f7f5f2');
  svg.appendChild(fill);

  // Characteristic lines (faint)
  for (let i = 0; i < 16; i++) {
    const t  = cx + (i / 16) * (1 - cx);
    const idx = Math.round(t * 100);
    const uP = upper[Math.min(idx, 99)];
    const lP = lower[Math.min(idx, 99)];
    const ox = (i / 16) * 24;

    const cl1 = document.createElementNS(ns, 'line');
    cl1.setAttribute('x1', uP.x - ox); cl1.setAttribute('y1', H / 2);
    cl1.setAttribute('x2', uP.x);       cl1.setAttribute('y2', uP.y);
    cl1.setAttribute('stroke', '#e8e4de');
    cl1.setAttribute('stroke-width', '1');
    svg.appendChild(cl1);

    const cl2 = document.createElementNS(ns, 'line');
    cl2.setAttribute('x1', lP.x - ox); cl2.setAttribute('y1', H / 2);
    cl2.setAttribute('x2', lP.x);       cl2.setAttribute('y2', lP.y);
    cl2.setAttribute('stroke', '#e8e4de');
    cl2.setAttribute('stroke-width', '1');
    svg.appendChild(cl2);
  }

  // Centerline
  const cl = document.createElementNS(ns, 'line');
  cl.setAttribute('x1', 32); cl.setAttribute('y1', H / 2);
  cl.setAttribute('x2', W - 32); cl.setAttribute('y2', H / 2);
  cl.setAttribute('stroke', '#e8e4de');
  cl.setAttribute('stroke-dasharray', '5,4');
  cl.setAttribute('stroke-width', '1');
  svg.appendChild(cl);

  // Wall contours
  [upper, lower].forEach(pts => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', toPath(pts));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#2a2724');
    path.setAttribute('stroke-width', '1.75');
    svg.appendChild(path);
  });

  // Throat marker
  const throatIdx = Math.round(cx * 100);
  const throatX   = upper[throatIdx].x;
  const tm = document.createElementNS(ns, 'line');
  tm.setAttribute('x1', throatX); tm.setAttribute('y1', upper[throatIdx].y);
  tm.setAttribute('x2', throatX); tm.setAttribute('y2', lower[throatIdx].y);
  tm.setAttribute('stroke', '#c8602a');
  tm.setAttribute('stroke-width', '1.5');
  svg.appendChild(tm);

  // Labels
  [
    { x: 56,     y: H / 2 - 12, text: 'subsonic',  color: '#9c9488', anchor: 'start' },
    { x: W - 40, y: H / 2 - 12, text: 'M = 14',    color: '#c8602a', anchor: 'end'   },
    { x: throatX + 6, y: upper[throatIdx].y - 6, text: 'M = 1', color: '#c8602a', anchor: 'start' },
  ].forEach(l => {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', l.x); t.setAttribute('y', l.y);
    t.setAttribute('fill', l.color);
    t.setAttribute('font-size', '10');
    t.setAttribute('font-family', 'Inter, sans-serif');
    t.setAttribute('text-anchor', l.anchor);
    t.textContent = l.text;
    svg.appendChild(t);
  });
}

/* ── ACTIVE NAV ───────────────────────────────────────────── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

/* ── LIGHTBOX ─────────────────────────────────────────────── */
function initLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';

  const img = document.createElement('img');
  const btn = document.createElement('button');
  btn.className = 'lightbox-close';
  btn.setAttribute('aria-label', 'Close');
  btn.textContent = '×';

  overlay.appendChild(img);
  overlay.appendChild(btn);
  document.body.appendChild(overlay);

  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('.analysis-img, .dark-diagram-wrap img').forEach(el => {
    el.classList.add('lightbox-trigger');
    el.addEventListener('click', () => open(el.src, el.alt));
  });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  animateCostBars();
  drawMachProfile();
  drawNozzleContour();
  setActiveNav();
  initLightbox();
});
