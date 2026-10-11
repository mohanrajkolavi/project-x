/* @ds-bundle: {"format":4,"namespace":"Caro","components":[{"name":"Header"},{"name":"Button"},{"name":"HeroNumeral"},{"name":"TextBlock"},{"name":"Rows"},{"name":"PromptBlock"},{"name":"Meter"},{"name":"Steps"},{"name":"Versus"},{"name":"Flip"},{"name":"Stat"},{"name":"Constellation"},{"name":"NewsletterCTA"},{"name":"Sky"}]} */
/* Caro Cosmic Keynote: vanilla helpers for the web components (no framework). Assigns window.Caro. */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduce = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };

  // ---------- glyphs (kit.py), drawn with currentColor
  var icons = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12h14.5M13 5.75L19.25 12 13 18.25"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4.5L16.5 12 9 19.5"></path></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.25" width="18" height="13.5" rx="2.75"></rect><path d="M3.75 7.25L12 13l8.25-5.75"></path></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v14.5M5.75 13L12 19.25 18.25 13"></path></svg>',
    check: '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 22.5l6 6 12-13"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"></rect><path d="M15.5 8.5V6.75a2.25 2.25 0 0 0-2.25-2.25h-6.5A2.25 2.25 0 0 0 4.5 6.75v6.5a2.25 2.25 0 0 0 2.25 2.25H8.5"></path></svg>'
  };

  // ---------- Webb six-spike star (kit.webb)
  function ray(a, l, w) {
    var t = a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    return 'M' + (-s * w).toFixed(2) + ' ' + (c * w).toFixed(2) + 'L' + (c * l).toFixed(2) + ' ' + (s * l).toFixed(2) + 'L' + (s * w).toFixed(2) + ' ' + (-c * w).toFixed(2) + 'Z';
  }
  var WEBB_D = [90, 270, 30, 150, 210, 330].map(function (a) { return ray(a, (a === 90 || a === 270) ? 13 : 11, 1.15); }).join('') + ray(0, 5.5, 0.9) + ray(180, 5.5, 0.9);
  function webb() {
    return '<svg class="ck-webb" viewBox="-15 -15 30 30" aria-hidden="true"><circle class="ck-webb__glow" r="8"></circle><path class="ck-webb__rays" d="' + WEBB_D + '"></path><circle class="ck-webb__core" r="2.6"></circle></svg>';
  }

  // ---------- planet orbit ring with one moon (kit.planet); size = wrap px
  function planetOrbit(size, moonDeg) {
    var c = size / 2, r = c - 1, a = (moonDeg == null ? 140 : moonDeg) * Math.PI / 180;
    var mx = (c + r * Math.cos(a)).toFixed(1), my = (c + r * Math.sin(a)).toFixed(1);
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle class="ck-planet__orbit" cx="' + c + '" cy="' + c + '" r="' + r + '"></circle>' +
      '<circle class="ck-planet__moon-cut" cx="' + mx + '" cy="' + my + '" r="6.5"></circle><circle class="ck-planet__moon" cx="' + mx + '" cy="' + my + '" r="3.5"></circle></svg>';
  }
  // Fill every [data-ck-planet] / [data-ck-webb] / [data-ck-icon] placeholder under root.
  function mount(root) {
    root = root || document;
    root.querySelectorAll('[data-ck-planet]').forEach(function (el) {
      if (el.querySelector(':scope > svg')) return;
      var size = el.getBoundingClientRect().width || 60;
      el.insertAdjacentHTML('afterbegin', planetOrbit(Math.round(size), parseFloat(el.getAttribute('data-ck-planet')) || 140));
    });
    root.querySelectorAll('[data-ck-webb]').forEach(function (el) { if (!el.firstChild) el.innerHTML = webb(); });
    root.querySelectorAll('[data-ck-icon]').forEach(function (el) { if (!el.firstChild) el.innerHTML = icons[el.getAttribute('data-ck-icon')] || ''; });
  }

  // ---------- colour helpers
  var probe;
  function rgb(css) {
    probe = probe || document.createElement('canvas').getContext('2d');
    probe.fillStyle = '#000'; probe.fillStyle = (css || '').trim() || '#000';
    var v = probe.fillStyle;
    if (v.charAt(0) === '#') return [parseInt(v.substr(1, 2), 16), parseInt(v.substr(3, 2), 16), parseInt(v.substr(5, 2), 16)];
    var m = v.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]];
  }
  function cssVar(el, name, fb) { var v = getComputedStyle(el).getPropertyValue(name); return (v && v.trim()) || fb; }
  function mix(a, b, f) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * f); }); }
  function palAt(P, t) { t = Math.max(0, Math.min(1, t)) * 2; var k = Math.min(1, Math.floor(t)); return mix(P[k], P[k + 1], t - k); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')'; }
  function seeded(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }

  // ---------- the night sky (sky_final.py, as a canvas)
  // Caro.sky(canvas, {seed, density, drift}) -> {destroy()}
  function sky(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d'), layer = document.createElement('canvas'), lctx = layer.getContext('2d');
    var W = 0, H = 0, dpr = 1, twinkles = [], raf = 0, t0 = performance.now(), alive = true, timer;
    var drift = opts.drift == null ? 4 : opts.drift; // px per second; the reel uses 34 for video
    function build() {
      var box = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(box.width)); H = Math.max(1, Math.round(box.height));
      canvas.width = W * dpr; canvas.height = H * dpr; layer.width = W * dpr; layer.height = H * dpr;
      var rnd = seeded(opts.seed || 7), k = H / 1350, area = (W * H) / (1080 * 1350), density = opts.density || 1;
      var light = (function () { var b = rgb(cssVar(canvas, '--bg', '#000')); return (b[0] + b[1] + b[2]) / 3 > 128; })();
      var hz = light ? 0.5 : 1;
      var P = [rgb(cssVar(canvas, '--pal-1', '#7FE3FF')), rgb(cssVar(canvas, '--pal-2', '#2E9BFF')), rgb(cssVar(canvas, '--pal-3', '#5E5CE6'))];
      var tints = [rgb(cssVar(canvas, '--star-cool', '#C4D8FF')), rgb(cssVar(canvas, '--star-white', '#FFFFFF')), rgb(cssVar(canvas, '--star-warm', '#FFDDB0'))];
      function band(x) {
        var c = (690 + 290 * Math.sin(2 * Math.PI * x / 7800 + 1.15) + 60 * Math.sin(2 * Math.PI * x / 2300)) * k;
        var w = (200 + 55 * Math.sin(2 * Math.PI * x / 3300 + 0.4)) * (0.6 + 0.4 * k);
        return [c, w];
      }
      var g = lctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      function wrapDraw(x, r, fn) { fn(x); if (x - r < 0) fn(x + W); if (x + r > W) fn(x - W); }
      // haze: soft clouds along a winding band, palette-tinted, one even layer at 70%
      g.globalAlpha = 0.7 * hz;
      var x = -200, hr = seeded((opts.seed || 7) + 24);
      while (x < W + 200) {
        x += 110 + hr() * 60;
        var bw = band(x), cy = bw[0] + (hr() - 0.5) * 0.3 * bw[1], rx = 300 + hr() * 140, ry = bw[1] * (0.85 + hr() * 0.3), op = 0.045 + hr() * 0.03;
        var col = palAt(P, ((x / 8640) % 1 + 1) % 1 + (hr() - 0.5) * 0.12);
        (function (cx, cy, rx, ry, op, col) {
          wrapDraw(cx, rx, function (px) {
            g.save(); g.translate(px, cy); g.scale(1, ry / rx);
            var rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
            rg.addColorStop(0, rgba(col, op)); rg.addColorStop(0.35, rgba(col, op * 0.62)); rg.addColorStop(0.68, rgba(col, op * 0.2)); rg.addColorStop(1, rgba(col, 0));
            g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
          });
        })(x, cy, rx, ry, op, col);
      }
      g.globalAlpha = 1;
      // stars, denser in the band
      var n = Math.round(325 * area * density), stars = [], tries = 0, bright = [];
      twinkles = [];
      while (stars.length < n && tries < n * 20) {
        tries++;
        var sx = rnd() * W, sy = rnd() * H, b2 = band(sx), inband = Math.exp(-Math.pow((sy - b2[0]) / b2[1], 2) * 1.25);
        if (rnd() > 0.55 + 0.45 * Math.min(1, inband * 1.4)) continue;
        var b = 0.10 + 0.9 * Math.pow(rnd(), 9), r = rnd(), t = r < 0.42 ? 0 : r < 0.82 ? 1 : 2, a = b * (0.55 + 0.45 * rnd()) * (light ? 0.8 : 1);
        stars.push([sx, sy, b, a, t]);
        if (b > 0.55 && sy > 140 && sy < H - 140) bright.push([sx, sy, b]);
      }
      stars.forEach(function (s) {
        var rr = 0.6 + 1.5 * s[2], c = tints[s[4]];
        if (s[2] > 0.45) { var rg = g.createRadialGradient(s[0], s[1], 0, s[0], s[1], rr * 4.5); rg.addColorStop(0, rgba(c, 0.55 * Math.min(1, s[3]))); rg.addColorStop(1, rgba(c, 0)); g.fillStyle = rg; g.beginPath(); g.arc(s[0], s[1], rr * 4.5, 0, Math.PI * 2); g.fill(); }
        if (rr < 3 && s[3] > 0.25 && rnd() < 0.4) { twinkles.push({ x: s[0], y: s[1], r: rr, c: c, o: Math.min(1, s[3] * 1.25), w: 1 + rnd() * 2.6, ph: rnd() * 6.28 }); return; }
        g.fillStyle = rgba(c, Math.min(1, s[3] * 1.25)); g.beginPath(); g.arc(s[0], s[1], rr, 0, Math.PI * 2); g.fill();
      });
      // Webb spike stars: about one per 2-3 screens, at least one
      bright.sort(function (p, q) { return q[2] - p[2]; });
      var want = Math.max(1, Math.round(area * 0.4)), spikes = [];
      bright.forEach(function (s) {
        if (spikes.length >= want) return;
        if (spikes.some(function (p) { return Math.hypot(s[0] - p[0], s[1] - p[1]) < 600; })) return;
        spikes.push(s);
      });
      var sw = tints[1];
      spikes.forEach(function (s) {
        var L = 34 + 18 * s[2];
        [[90, L], [270, L], [30, L], [150, L], [210, L], [330, L], [0, L * 0.45], [180, L * 0.45]].forEach(function (d) {
          var ca = Math.cos(d[0] * Math.PI / 180), sa = Math.sin(d[0] * Math.PI / 180);
          var lg = g.createLinearGradient(s[0], s[1], s[0] + ca * d[1], s[1] + sa * d[1]);
          lg.addColorStop(0, rgba(sw, 0.9)); lg.addColorStop(1, rgba(sw, 0));
          g.fillStyle = lg; g.beginPath(); g.moveTo(s[0] - sa, s[1] + ca); g.lineTo(s[0] + ca * d[1], s[1] + sa * d[1]); g.lineTo(s[0] + sa, s[1] - ca); g.closePath(); g.fill();
        });
        var hg = g.createRadialGradient(s[0], s[1], 0, s[0], s[1], 11); hg.addColorStop(0, rgba(tints[0], 0.5)); hg.addColorStop(1, rgba(tints[0], 0));
        g.fillStyle = hg; g.beginPath(); g.arc(s[0], s[1], 11, 0, Math.PI * 2); g.fill();
        g.fillStyle = rgba(sw, 1); g.beginPath(); g.arc(s[0], s[1], 2.4, 0, Math.PI * 2); g.fill();
      });
      // one or two tiny galaxies
      for (var gi = 0; gi < Math.max(1, Math.round(area / 4)); gi++) {
        var gx = 60 + rnd() * (W - 120), gy = 160 + rnd() * Math.max(1, H - 320), ga = 6 + rnd() * 4, ge = 0.3 + rnd() * 0.25, rot = (rnd() - 0.5) * 2.4, gc = P[Math.floor(rnd() * 3)];
        g.save(); g.translate(gx, gy); g.rotate(rot); g.scale(1, ge);
        var gg = g.createRadialGradient(0, 0, 0, 0, 0, ga); gg.addColorStop(0, 'rgba(255,255,255,0.8)'); gg.addColorStop(0.3, rgba(gc, 0.68)); gg.addColorStop(1, rgba(gc, 0));
        g.fillStyle = gg; g.beginPath(); g.arc(0, 0, ga, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
    function frame(now) {
      if (!alive) return;
      var t = (now - t0) / 1000, still = reduce(), off = still ? 0 : (t * drift) % W;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer, -off * dpr, 0); if (off) ctx.drawImage(layer, (W - off) * dpr, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      twinkles.forEach(function (z) {
        var o = still ? z.o : z.o * (0.55 + 0.45 * Math.sin(t * z.w + z.ph)), x = z.x - off; if (x < 0) x += W;
        ctx.fillStyle = rgba(z.c, o); ctx.beginPath(); ctx.arc(x, z.y, z.r, 0, Math.PI * 2); ctx.fill();
      });
      if (!still) raf = requestAnimationFrame(frame);
    }
    function start() { cancelAnimationFrame(raf); build(); raf = requestAnimationFrame(frame); }
    var onResize = function () { clearTimeout(timer); timer = setTimeout(start, 150); };
    window.addEventListener('resize', onResize);
    var mo = new MutationObserver(start); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    start();
    return { destroy: function () { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); mo.disconnect(); }, rebuild: start };
  }

  // ---------- orbits round a hero numeral (art.orbits), palette gradient, planets travelling
  var oid = 0;
  function orbits(el, opts) {
    opts = opts || {}; var k = opts.k || 1, id = 'ckor' + (++oid);
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '-520 -220 1040 440'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'ck-orbits');
    var html = '<defs><linearGradient id="' + id + '" x1="-340" x2="340" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:var(--pal-1)"></stop><stop offset="0.5" style="stop-color:var(--pal-2)"></stop><stop offset="1" style="stop-color:var(--pal-3)"></stop></linearGradient></defs><g transform="rotate(-10)">';
    var ops = [0.8, 0.62, 0.48, 0.36, 0.26], cols = ['--pal-1', '--pal-1', '--pal-2', '--pal-3', '--pal-3'];
    for (var i = 0; i < 5; i++) {
      html += '<ellipse cx="0" cy="0" rx="' + ((280 + i * 50) * k) + '" ry="' + ((50 + i * 16) * k) + '" fill="none" stroke="url(#' + id + ')" stroke-width="2" opacity="' + ops[i] + '" pathLength="1"></ellipse>';
      html += '<g class="ck-orbit-planet"><circle r="16" style="fill:var(' + cols[i] + ')" opacity="0.18"></circle><circle r="7" style="fill:var(' + cols[i] + ')"></circle></g>';
    }
    svg.innerHTML = html + '</g>';
    el.classList.add('ck-orbit-wrap'); el.insertBefore(svg, el.firstChild);
    var ps = svg.querySelectorAll('.ck-orbit-planet'), base = [205, 330, 25, 150, 280], t0 = performance.now(), alive = true;
    var rings = svg.querySelectorAll('ellipse');
    if (!reduce() && rings[0].animate) rings.forEach(function (r) { r.animate([{ strokeDasharray: '0 1' }, { strokeDasharray: '1 0' }], { duration: 1300, easing: 'cubic-bezier(0.33,1,0.68,1)', delay: 200 }); });
    function tick(now) {
      if (!alive) return;
      var t = reduce() ? 0 : (now - t0) / 1000;
      ps.forEach(function (p, i) { var a = base[i] * Math.PI / 180 + t * (0.42 - i * 0.06) * 0.5; p.setAttribute('transform', 'translate(' + ((280 + i * 50) * k * Math.cos(a)).toFixed(1) + ' ' + ((50 + i * 16) * k * Math.sin(a)).toFixed(1) + ')'); });
      if (!reduce()) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return { destroy: function () { alive = false; svg.remove(); } };
  }

  // ---------- word reveal, fades, meters, count-ups and flips when a block scrolls in
  function splitWords(el) {
    if (el.getAttribute('data-ck-split')) return; el.setAttribute('data-ck-split', '1');
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'), inner = document.createElement('span');
            w.className = 'ck-w'; inner.textContent = p; inner.style.transitionDelay = (i++ * 70) + 'ms';
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('ck-nb') && !n.classList.contains('ck-grad')) walk(n);
        else if (n.nodeType === 1) { var w2 = document.createElement('span'), in2 = document.createElement('span'); w2.className = 'ck-w'; in2.style.transitionDelay = (i++ * 70) + 'ms'; n.parentNode.replaceChild(w2, n); in2.appendChild(n); w2.appendChild(in2); }
      });
    })(el);
    return i;
  }
  function countUp(el) {
    var v = parseFloat(el.getAttribute('data-ck-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10), pre = el.getAttribute('data-pre') || '', post = el.getAttribute('data-post') || '';
    var fmt = function (x) { return pre + x.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post; };
    if (reduce()) { el.textContent = fmt(v); return; }
    var t0 = performance.now();
    (function step(now) { var p = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(v * e); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  function play(block) {
    block.classList.remove('is-pending');
    block.querySelectorAll('[data-ck-count]').forEach(countUp);
    if (block.hasAttribute('data-ck-flip') || block.querySelector('[data-ck-flip]')) {
      var f = block.hasAttribute('data-ck-flip') ? block : block.querySelector('[data-ck-flip]');
      setTimeout(function () { f.classList.add('is-flipped'); }, reduce() ? 0 : 900);
    }
  }
  function reveal(root) {
    root = root || document;
    var blocks = root.querySelectorAll('[data-ck-reveal]');
    blocks.forEach(function (b) {
      var words = 0; b.querySelectorAll('[data-ck-words]').forEach(function (h) { words = Math.max(words, splitWords(h) || 0); });
      b.querySelectorAll('.ck-fade').forEach(function (f, i) { f.style.transitionDelay = (250 + words * 70 + i * 120) + 'ms'; });
    });
    if (!('IntersectionObserver' in window) || reduce()) { blocks.forEach(play); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); requestAnimationFrame(function () { requestAnimationFrame(function () { play(e.target); }); }); } }); }, { threshold: 0.2 });
    blocks.forEach(function (b) { b.classList.add('is-pending'); io.observe(b); });
  }

  // ---------- constellation progress (kit.constellation): seen = blue and joined, current glows, rest faint
  var OFFS = [6, -10, 4, -13, 7, -5, 12, -3, 8, -7, 5, -11, 9, -4, 10, -8, 3, -12, 6, -6];
  function constellation(svg, n, N) {
    var sx = N <= 10 ? 38 : 34, h = 64, cy = h / 2, w = 32 + sx * (N - 1), s = '';
    var pts = []; for (var k = 0; k < N; k++) pts.push([16 + k * sx, cy + OFFS[k % OFFS.length]]);
    for (k = 0; k < N - 1; k++) s += '<path class="c-line' + (k + 1 < n ? ' is-done' : '') + '" d="M' + pts[k][0] + ' ' + pts[k][1] + 'L' + pts[k + 1][0] + ' ' + pts[k + 1][1] + '"></path>';
    pts.forEach(function (p, k) {
      if (k + 1 === n) s += '<circle class="c-halo" cx="' + p[0] + '" cy="' + p[1] + '" r="15" opacity="0.16"></circle><circle class="c-halo" cx="' + p[0] + '" cy="' + p[1] + '" r="10" opacity="0.28"></circle><circle class="c-core" cx="' + p[0] + '" cy="' + p[1] + '" r="6"></circle>';
      else s += '<circle class="c-dot' + (k + 1 < n ? ' is-done' : '') + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (k + 1 < n ? 4.2 : 3.6) + '"></circle>';
    });
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('width', w); svg.setAttribute('height', h);
    svg.classList.add('ck-constellation'); svg.innerHTML = s;
    if (!svg.hasAttribute('role')) { svg.setAttribute('role', 'img'); }
    svg.setAttribute('aria-label', 'Step ' + n + ' of ' + N);
  }
  // Ties a constellation to the sections of a page: Caro.progress(svg, sections, onChange)
  function progress(svg, sections, onChange) {
    var list = Array.prototype.slice.call(sections), cur = 0;
    function update() {
      var mid = window.innerHeight * 0.5, n = 1;
      list.forEach(function (s, i) { if (s.getBoundingClientRect().top < mid) n = i + 1; });
      if (n !== cur) { cur = n; constellation(svg, n, list.length); if (onChange) onChange(n, list[n - 1]); }
    }
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
    return { update: update };
  }

  // ---------- copy buttons on prompt blocks
  function copy(root) {
    (root || document).querySelectorAll('[data-ck-copy]').forEach(function (b) {
      if (b._ck) return; b._ck = 1;
      b.addEventListener('click', function () {
        var p = b.closest('.ck-prompt'), t = p && p.querySelector('.ck-prompt__text'), label = b.querySelector('span');
        if (!t) return;
        var txt = t.textContent.trim(), done = function () { if (label) { var o = label.textContent; label.textContent = 'Copied'; setTimeout(function () { label.textContent = o; }, 1600); } };
        var sel = function () { var r = document.createRange(); r.selectNodeContents(t); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); };
        try { navigator.clipboard.writeText(txt).then(done, sel); } catch (e) { sel(); }
      });
    });
  }

  function init(root) { mount(root); reveal(root); copy(root); }

  window.Caro = { icons: icons, webb: webb, planetOrbit: planetOrbit, mount: mount, sky: sky, orbits: orbits, reveal: reveal, countUp: countUp,
    constellation: constellation, progress: progress, copy: copy, init: init, palette: function (el) { return [cssVar(el, '--pal-1'), cssVar(el, '--pal-2'), cssVar(el, '--pal-3')]; } };
})();
