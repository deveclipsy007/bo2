/* Campos particulados da apresentação Harness — canvas 2D leve, pausado fora de cena. */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  var insts = [];

  function fit(c) {
    var w = Math.max(2, Math.round(c.offsetWidth || 800));
    var h = Math.max(2, Math.round(c.offsetHeight || 400));
    c.width = w * DPR; c.height = h * DPR;
    var x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { w: w, h: h, ctx: x };
  }

  /* ---------- vaporização tipográfica (cena 01) ---------- */
  function vapor(c) {
    var words = (c.dataset.words || '').split('|');
    var g = fit(c), ctx = g.ctx, W = g.w, H = g.h;
    var off = document.createElement('canvas'), oc = off.getContext('2d', { willReadFrequently: true });
    off.width = W; off.height = H;
    function sample(word) {
      oc.clearRect(0, 0, W, H);
      var size = H * 0.78;
      oc.letterSpacing = '-0.02em';
      oc.font = '300 ' + size + 'px Manrope, system-ui, sans-serif';
      var guard = 0;
      while (oc.measureText(word).width > W * 0.92 && guard++ < 60) {
        size *= 0.94; oc.font = '300 ' + size + 'px Manrope, system-ui, sans-serif';
      }
      oc.textAlign = 'center'; oc.textBaseline = 'middle';
      oc.fillStyle = '#fff';
      oc.fillText(word, W / 2, H / 2);
      var d = oc.getImageData(0, 0, W, H).data, pts = [], step = c.dataset.dense ? 2 : (W > 900 ? 3 : 4);
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
        if (d[(y * W + x) * 4 + 3] > 130) pts.push([x, y]);
      }
      return pts;
    }
    var sets = words.map(sample);
    var n = Math.max.apply(null, sets.map(function (s) { return s.length; }));
    var P = [];
    for (var i = 0; i < n; i++) P.push({ x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, vx: 0, vy: 0, a: 0, s: Math.random() });
    var wi = 0, t0 = 0, phase = 'in', mx = -1e4, my = -1e4;
    function target(idx) {
      var s = sets[idx];
      for (var i = 0; i < P.length; i++) {
        var p = P[i], q = s[i % s.length];
        p.tx = q[0] + (Math.random() - .5) * 1.2; p.ty = q[1] + (Math.random() - .5) * 1.2;
      }
    }
    function scatter() {
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.vx += (Math.random() - .3) * 1.5; p.vy -= Math.random() * 1.1 + .2;
      }
    }
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height);
    });
    c.addEventListener('pointerleave', function () { mx = my = -1e4; });
    function reset() {
      wi = 0; phase = 'in'; t0 = performance.now();
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.x = W / 2 + (Math.random() - .5) * W * 0.9; p.y = H / 2 + (Math.random() - .5) * H * 2.2;
        p.vx = p.vy = 0; p.a = 0;
      }
      target(0);
    }
    reset();
    function frame(now) {
      var el = now - t0;
      if (phase === 'in' && el > (RM ? 400 : 4200) && wi < sets.length - 1) { phase = 'out'; t0 = now; scatter(); }
      if (phase === 'out' && el > 900) { wi++; target(wi); phase = 'in'; t0 = now; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (phase === 'out') { p.x += p.vx; p.y += p.vy; p.vy += .012; p.a += (0 - p.a) * .05; }
        else {
          p.vx = (p.vx + (p.tx - p.x) * .012) * .86;
          p.vy = (p.vy + (p.ty - p.y) * .012) * .86;
          var ox = p.x - mx, oy = p.y - my, d2 = ox * ox + oy * oy;
          if (d2 < 18000 && d2 > 1) { var f = (1 - d2 / 18000) * 5 / Math.sqrt(d2); p.vx += ox * f; p.vy += oy * f; }
          p.x += p.vx; p.y += p.vy; p.a += (1 - p.a) * .035;
        }
        if (p.a <= .01) continue;
        var sz = c.dataset.dense ? 2.1 : 1.5;
        ctx.fillStyle = 'rgba(244,244,239,' + Math.min(1, p.a * (c.dataset.dense ? .75 + p.s * .35 : .5 + p.s * .5)).toFixed(3) + ')';
        ctx.fillRect(p.x, p.y, sz, sz);
      }
    }
    return { frame: frame, reset: reset };
  }

  /* ---------- point cloud do segundo cérebro (cena 07) ---------- */
  function cloud(c) {
    var g = fit(c), ctx = g.ctx, W = g.w, H = g.h;
    var P = [], mx = -1e4, my = -1e4, ready = false, t0 = 0;
    var img = new Image(); img.src = c.dataset.src;
    img.onload = function () {
      var off = document.createElement('canvas'), oc = off.getContext('2d', { willReadFrequently: true });
      var s = Math.min(W / img.width, H / img.height) * 0.88;
      var iw = Math.round(img.width * s), ih = Math.round(img.height * s);
      off.width = W; off.height = H;
      oc.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      var d = oc.getImageData(0, 0, W, H).data, step = 5, CAP = 26000;
      for (var y = 0; y < H && P.length < CAP; y += step) for (var x = 0; x < W; x += step) {
        var i = (y * W + x) * 4, l = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (l > 55 && Math.random() < 0.7) {
          P.push({ hx: x, hy: y, x: -W * .35 + Math.random() * W * .3, y: y + (Math.random() - .5) * H * .5, vx: 0, vy: 0, a: 0, l: l / 255, e: Math.random() > .985, d: (x / W) * 1500 + Math.random() * 700 });
        }
      }
      ready = true;
    };
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height);
    });
    c.addEventListener('pointerleave', function () { mx = my = -1e4; });
    function frame(now) {
      if (!ready) return;
      if (!t0) t0 = now || performance.now();
      var el = (now || performance.now()) - t0;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (el < p.d) continue;
        var dx = p.hx - p.x, dy = p.hy - p.y;
        p.vx = (p.vx + dx * .02) * .82; p.vy = (p.vy + dy * .02) * .82;
        var ox = p.x - mx, oy = p.y - my, d2 = ox * ox + oy * oy;
        if (d2 < 16000 && d2 > 1) { var f = (1 - d2 / 16000) * 5 / Math.sqrt(d2); p.vx += ox * f; p.vy += oy * f; }
        p.x += p.vx + Math.sin((p.hy + performance.now() * .0004)) * .02;
        p.y += p.vy;
        p.a += (1 - p.a) * .02;
        ctx.fillStyle = 'rgba(244,244,239,' + Math.min(1, p.a * (p.l * 1.5 + .25)).toFixed(3) + ')';
        ctx.fillRect(p.x, p.y, 1.6, 1.6);
      }
    }
    function reset() { t0 = 0; for (var i = 0; i < P.length; i++) { var p = P[i]; p.a = 0; p.vx = p.vy = 0; p.x = -W * .35 + Math.random() * W * .3; p.y = p.hy + (Math.random() - .5) * H * .5; } }
    return { frame: frame, reset: reset };
  }

  /* ---------- pontos que tentam uma forma e colapsam (cena 02) ---------- */
  function drift(c) {
    var g = fit(c), ctx = g.ctx, W = g.w, H = g.h, N = W > 900 ? 320 : 160;
    var P = [], t = 0, mx = -1e4, my = -1e4;
    for (var i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, ph: (i / N) * Math.PI * 2 });
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height);
    });
    c.addEventListener('pointerleave', function () { mx = my = -1e4; });
    function frame() {
      t += 1 / 60;
      var cyc = (t % 9) / 9, pull = cyc < .5 ? Math.min(1, cyc * 3) : Math.max(0, 1 - (cyc - .5) * 4);
      ctx.clearRect(0, 0, W, H);
      var R = Math.min(W, H) * .3;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        var tx = W / 2 + Math.cos(p.ph + t * .12) * R, ty = H / 2 + Math.sin(p.ph + t * .12) * R;
        p.vx = (p.vx + (tx - p.x) * .004 * pull + (Math.random() - .5) * .25 * (1 - pull)) * .95;
        p.vy = (p.vy + (ty - p.y) * .004 * pull + (Math.random() - .5) * .25 * (1 - pull)) * .95;
        var ox = p.x - mx, oy = p.y - my, d2 = ox * ox + oy * oy;
        if (d2 < 18000 && d2 > 1) { var f = (1 - d2 / 18000) * 4 / Math.sqrt(d2); p.vx += ox * f; p.vy += oy * f; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x += W; if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
        ctx.fillStyle = 'rgba(244,244,239,' + (.14 + pull * .4).toFixed(3) + ')';
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }
    }
    return { frame: frame, reset: function () { } };
  }

  /* ---------- morfologia de partículas entre objetos ---------- */
  function drawFigure(kind, oc, W, H) {
    var s = Math.min(W, H) * 0.9 / 100, ox = (W - 100 * s) / 2, oy = (H - 100 * s) / 2;
    oc.save(); oc.translate(ox, oy); oc.scale(s, s);
    oc.fillStyle = '#fff'; oc.strokeStyle = '#fff'; oc.lineCap = 'round'; oc.lineJoin = 'round';
    if (kind === 'cerebro') {
      oc.fill(new Path2D('M22,46 C20,28 36,14 53,17 C61,8 79,9 84,20 C95,23 99,33 94,42 C101,50 97,62 88,66 C88,78 77,86 65,83 C57,91 43,89 37,81 C25,81 17,70 20,58 C13,54 14,48 22,46 Z'));
      oc.fill(new Path2D('M58,83 L63,97 L50,97 C53,92 55,88 55,83 Z'));
      oc.globalCompositeOperation = 'destination-out';
      oc.lineWidth = 3.2;
      oc.stroke(new Path2D('M40,28 C53,33 45,43 58,46 C70,49 62,59 73,62'));
      oc.stroke(new Path2D('M28,52 C41,52 36,63 50,66 C59,68 54,76 62,78'));
      oc.stroke(new Path2D('M67,22 C76,29 70,38 82,43'));
      oc.stroke(new Path2D('M30,38 C38,40 36,45 32,48'));
      oc.globalCompositeOperation = 'source-over';
    } else if (kind === 'balao') {
      var r = 12;
      oc.beginPath();
      oc.moveTo(14 + r, 22); oc.arcTo(86, 22, 86, 34, r); oc.arcTo(86, 70, 74, 70, r);
      oc.lineTo(44, 70); oc.lineTo(30, 86); oc.lineTo(31, 70); oc.arcTo(14, 70, 14, 58, r); oc.arcTo(14, 22, 26, 22, r);
      oc.closePath(); oc.fill();
      oc.globalCompositeOperation = 'destination-out'; oc.lineWidth = 5;
      oc.beginPath(); oc.moveTo(28, 40); oc.lineTo(72, 40); oc.moveTo(28, 54); oc.lineTo(58, 54); oc.stroke();
      oc.globalCompositeOperation = 'source-over';
    } else if (kind === 'rede') {
      var nodes = [[50, 50], [20, 24], [80, 26], [16, 72], [84, 70], [50, 12], [50, 88], [28, 48], [74, 52]];
      oc.lineWidth = 2.6;
      oc.beginPath();
      for (var i = 1; i < nodes.length; i++) { oc.moveTo(nodes[0][0], nodes[0][1]); oc.lineTo(nodes[i][0], nodes[i][1]); }
      oc.moveTo(20, 24); oc.lineTo(80, 26); oc.moveTo(16, 72); oc.lineTo(84, 70);
      oc.stroke();
      for (var j = 0; j < nodes.length; j++) {
        oc.beginPath(); oc.arc(nodes[j][0], nodes[j][1], j === 0 ? 9 : 6, 0, 6.2832); oc.fill();
      }
    } else if (kind === 'arvore') {
      oc.beginPath(); oc.arc(50, 34, 26, 0, 6.2832); oc.fill();
      oc.beginPath(); oc.arc(30, 44, 15, 0, 6.2832); oc.fill();
      oc.beginPath(); oc.arc(70, 44, 15, 0, 6.2832); oc.fill();
      oc.fillRect(45, 52, 10, 26);
      oc.lineWidth = 4;
      oc.beginPath();
      oc.moveTo(50, 76); oc.bezierCurveTo(44, 84, 32, 84, 22, 94);
      oc.moveTo(50, 76); oc.bezierCurveTo(56, 84, 68, 84, 78, 94);
      oc.moveTo(50, 76); oc.lineTo(50, 96);
      oc.stroke();
    } else if (kind === 'engrenagem') {
      oc.beginPath();
      for (var t = 0; t < 10; t++) {
        var a0 = (t / 10) * 6.2832, a1 = a0 + 0.19, a2 = a0 + 0.44, a3 = a0 + 0.628;
        oc.lineTo(50 + Math.cos(a0) * 30, 50 + Math.sin(a0) * 30);
        oc.lineTo(50 + Math.cos(a1) * 44, 50 + Math.sin(a1) * 44);
        oc.lineTo(50 + Math.cos(a2) * 44, 50 + Math.sin(a2) * 44);
        oc.lineTo(50 + Math.cos(a3) * 30, 50 + Math.sin(a3) * 30);
      }
      oc.closePath(); oc.fill();
      oc.globalCompositeOperation = 'destination-out';
      oc.beginPath(); oc.arc(50, 50, 13, 0, 6.2832); oc.fill();
      oc.globalCompositeOperation = 'source-over';
    } else if (kind === 'cerebro2') {
      oc.beginPath(); oc.ellipse(50, 45, 31, 38, 0, 0, 6.2832); oc.fill();
      oc.beginPath(); oc.ellipse(50, 84, 19, 11, 0, 0, 6.2832); oc.fill();
      oc.fillRect(46, 88, 8, 9);
      oc.globalCompositeOperation = 'destination-out';
      oc.lineWidth = 3.4;
      oc.beginPath(); oc.moveTo(50, 9); oc.lineTo(50, 82); oc.stroke();
      oc.lineWidth = 2.6;
      for (var q = 0; q < 5; q++) {
        var yy = 20 + q * 13;
        oc.beginPath();
        oc.moveTo(46, yy); oc.bezierCurveTo(34, yy - 7, 26, yy + 6, 21, yy - 1);
        oc.moveTo(54, yy); oc.bezierCurveTo(66, yy - 7, 74, yy + 6, 79, yy - 1);
        oc.stroke();
      }
      oc.lineWidth = 2.4;
      oc.beginPath(); oc.moveTo(34, 80); oc.lineTo(66, 80); oc.stroke();
      oc.globalCompositeOperation = 'source-over';
    } else if (kind === 'veiculo') {
      oc.beginPath();
      oc.moveTo(10, 66); oc.lineTo(14, 48); oc.lineTo(32, 46); oc.lineTo(44, 30); oc.lineTo(66, 30);
      oc.lineTo(72, 46); oc.lineTo(90, 50); oc.lineTo(92, 66); oc.lineTo(10, 66); oc.closePath(); oc.fill();
      oc.globalCompositeOperation = 'destination-out';
      oc.beginPath(); oc.arc(30, 66, 11, 0, 6.2832); oc.arc(72, 66, 11, 0, 6.2832); oc.fill();
      oc.lineWidth = 3; oc.beginPath(); oc.moveTo(55, 31); oc.lineTo(55, 46); oc.stroke();
      oc.globalCompositeOperation = 'source-over';
      oc.beginPath(); oc.arc(30, 66, 8, 0, 6.2832); oc.fill();
      oc.beginPath(); oc.arc(72, 66, 8, 0, 6.2832); oc.fill();
    } else if (kind === 'seta') {
      oc.beginPath();
      oc.moveTo(8, 40); oc.lineTo(58, 40); oc.lineTo(58, 24); oc.lineTo(94, 50);
      oc.lineTo(58, 76); oc.lineTo(58, 60); oc.lineTo(8, 60); oc.closePath(); oc.fill();
    } else if (kind === 'chave') {
      oc.beginPath(); oc.arc(28, 50, 20, 0, 6.2832); oc.fill();
      oc.fillRect(46, 45, 46, 10);
      oc.fillRect(74, 55, 8, 13);
      oc.fillRect(86, 55, 8, 10);
      oc.globalCompositeOperation = 'destination-out';
      oc.beginPath(); oc.arc(28, 50, 8, 0, 6.2832); oc.fill();
      oc.globalCompositeOperation = 'source-over';
    } else if (kind === 'aneis') {
      oc.lineWidth = 7;
      oc.beginPath(); oc.arc(50, 50, 42, 0, 6.2832); oc.stroke();
      oc.beginPath(); oc.arc(50, 50, 30, 0, 6.2832); oc.stroke();
      oc.beginPath(); oc.arc(50, 50, 18, 0, 6.2832); oc.stroke();
      oc.beginPath(); oc.arc(50, 50, 7, 0, 6.2832); oc.fill();
    } else if (kind === 'flor') {
      for (var pt = 0; pt < 6; pt++) {
        oc.save(); oc.translate(50, 44); oc.rotate((pt / 6) * 6.2832);
        oc.beginPath(); oc.ellipse(0, -20, 10, 20, 0, 0, 6.2832); oc.fill(); oc.restore();
      }
      oc.beginPath(); oc.arc(50, 44, 9, 0, 6.2832); oc.fill();
      oc.lineWidth = 5; oc.beginPath(); oc.moveTo(50, 56); oc.lineTo(50, 96); oc.stroke();
      oc.beginPath(); oc.ellipse(38, 76, 11, 5, -0.5, 0, 6.2832); oc.fill();
      oc.beginPath(); oc.ellipse(62, 84, 11, 5, 0.5, 0, 6.2832); oc.fill();
    } else if (kind === 'blocos') {
      for (var by = 0; by < 4; by++) for (var bx = 0; bx < 4; bx++) oc.fillRect(12 + bx * 21, 12 + by * 21, 15, 15);
    }
    oc.restore();
  }

  var FIGS = { cerebro: 1, cerebro2: 1, balao: 1, rede: 1, arvore: 1, engrenagem: 1, blocos: 1, veiculo: 1, seta: 1, chave: 1, aneis: 1, flor: 1 };

  function figurePoints(kind, W, H, N) {
    var off = document.createElement('canvas'), oc = off.getContext('2d', { willReadFrequently: true });
    off.width = W; off.height = H;
    drawFigure(kind, oc, W, H);
    var d = oc.getImageData(0, 0, W, H).data, cand = [], step = 2;
    for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 140) cand.push([x, y]);
    var out = [];
    if (!cand.length) return shapePoints('ruido', W, H, N);
    for (var k = 0; k < N; k++) out.push(cand[(Math.random() * cand.length) | 0]);
    return out;
  }

  function shapePoints(kind, W, H, N) {
    if (FIGS[kind]) return figurePoints(kind, W, H, N);
    var pts = [], i, a, r, cx = W / 2, cy = H / 2, R = Math.min(W, H) * .38;
    if (kind === 'ruido') {
      for (i = 0; i < N; i++) pts.push([Math.random() * W, Math.random() * H]);
    } else if (kind === 'grade') {
      var cols = Math.round(Math.sqrt(N * (W / H))), rows = Math.ceil(N / cols);
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++)
        pts.push([W * .12 + (x / (cols - 1)) * W * .76, H * .14 + (y / (rows - 1)) * H * .72]);
    } else if (kind === 'esfera') {
      for (i = 0; i < N; i++) {
        var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        pts.push([cx + Math.cos(th) * s * R, cy + u * R * .96]);
      }
    } else if (kind === 'orbita') {
      for (i = 0; i < N; i++) {
        var ring = i % 3, ang = Math.random() * Math.PI * 2, rr = R * (.55 + ring * .22);
        pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * (ring === 1 ? .28 : ring === 2 ? .55 : .9)]);
      }
    } else if (kind === 'rede') {
      var nodes = [], K = 14;
      for (i = 0; i < K; i++) { a = (i / K) * Math.PI * 2; r = R * (.35 + (i % 3) * .3); nodes.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .78]); }
      for (i = 0; i < N; i++) {
        var n1 = nodes[i % K], n2 = nodes[(i * 7 + 3) % K], t = Math.random();
        pts.push([n1[0] + (n2[0] - n1[0]) * t, n1[1] + (n2[1] - n1[1]) * t]);
      }
    } else if (kind === 'raizes') {
      for (i = 0; i < N; i++) {
        var br = i % 9, tt = Math.random(), sp = (br - 4) * .17;
        var x0 = cx, y0 = H * .12;
        pts.push([x0 + Math.sin(tt * 2.4 + sp * 3) * W * .34 * sp * 1.4 + sp * W * .16, y0 + tt * H * .74 + Math.sin(tt * 6) * 6]);
      }
    } else if (kind === 'horizonte') {
      for (i = 0; i < N; i++) {
        var f = i / N;
        pts.push([W * .06 + f * W * .88, cy + (Math.random() - .5) * (8 + Math.sin(f * 9) * 14)]);
      }
    } else if (kind === 'camadas') {
      for (i = 0; i < N; i++) {
        var lay = i % 4, fx2 = Math.random();
        pts.push([W * .14 + fx2 * W * .72 + lay * 12, H * .24 + lay * H * .17 + Math.sin(fx2 * 5 + lay) * 10]);
      }
    } else {
      for (i = 0; i < N; i++) { a = Math.random() * Math.PI * 2; pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
    }
    return pts;
  }

  function imgPoints(src, W, H, N, done) {
    var img = new Image(); img.src = src;
    img.onload = function () {
      var off = document.createElement('canvas'), oc = off.getContext('2d', { willReadFrequently: true });
      off.width = W; off.height = H;
      var s = Math.min(W / img.width, H / img.height) * .92;
      var iw = img.width * s, ih = img.height * s;
      oc.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      var d = oc.getImageData(0, 0, W, H).data, cand = [], step = 3;
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
        var i = (y * W + x) * 4, l = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (l > 52) cand.push([x, y]);
      }
      if (!cand.length) return;
      var out = [];
      for (var k = 0; k < N; k++) out.push(cand[(Math.random() * cand.length) | 0]);
      done(out);
    };
  }

  function morph(c) {
    var g = fit(c), ctx = g.ctx, W = g.w, H = g.h;
    var kinds = (c.dataset.shapes || 'ruido|grade').split('|');
    var hasImg = kinds.some(function (k) { return k.indexOf('img:') === 0; });
    var hasFig = kinds.some(function (k) { return FIGS[k]; });
    var N = hasImg ? (W > 700 ? 6500 : 3000) : hasFig ? (W > 700 ? 9000 : 4200) : (W > 700 ? 1100 : 600), hold = +(c.dataset.hold || 5200);
    var sets = kinds.map(function (k) { return shapePoints(k.indexOf('img:') === 0 ? 'ruido' : k, W, H, N); });
    kinds.forEach(function (k, idx) {
      if (k.indexOf('img:') !== 0) return;
      imgPoints(k.slice(4), W, H, N, function (pts) { sets[idx] = pts; if (si === idx) aim(idx); });
    });
    var P = [], mx = -1e4, my = -1e4, si = 0, t0 = 0;
    for (var i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: 0, ty: 0, a: 0, e: Math.random() > .975 });
    function aim(k) { for (var i = 0; i < N; i++) { var q = sets[k][i % sets[k].length]; P[i].tx = q[0]; P[i].ty = q[1]; } }
    aim(0);
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height);
    });
    c.addEventListener('pointerleave', function () { mx = my = -1e4; });
    function frame(now) {
      if (!t0) t0 = now;
      if (!RM && now - t0 > hold) { si = (si + 1) % sets.length; aim(si); t0 = now; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N; i++) {
        var p = P[i], dx = p.tx - p.x, dy = p.ty - p.y;
        p.vx = (p.vx + dx * .014) * .85; p.vy = (p.vy + dy * .014) * .85;
        var ox = p.x - mx, oy = p.y - my, d2 = ox * ox + oy * oy;
        if (d2 < 14000 && d2 > 1) { var f = (1 - d2 / 14000) * 4.5 / Math.sqrt(d2); p.vx += ox * f; p.vy += oy * f; }
        p.x += p.vx; p.y += p.vy; p.a += (1 - p.a) * .03;
        var sp = Math.min(1, (Math.abs(p.vx) + Math.abs(p.vy)) / 6);
        ctx.fillStyle = 'rgba(244,244,239,' + Math.min(1, p.a * (.72 + sp * .28)).toFixed(3) + ')';
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    }
    function reset() { t0 = 0; si = 0; aim(0); for (var i = 0; i < N; i++) { P[i].a = 0; P[i].x = Math.random() * W; P[i].y = Math.random() * H; P[i].vx = P[i].vy = 0; } }
    return { frame: frame, reset: reset };
  }

  var KIND = { vapor: vapor, cloud: cloud, drift: drift, morph: morph };
  var raf = null;
  function tick(now) { raf = requestAnimationFrame(tick); for (var i = 0; i < insts.length; i++) if (insts[i].live) insts[i].fx.frame(now || performance.now()); }

  function boot() {
    var nodes = document.querySelectorAll('canvas[data-fx]');
    if (!nodes.length) return setTimeout(boot, 250);
    insts = [];
    nodes.forEach(function (c) {
      var mk = KIND[c.dataset.fx]; if (!mk) return;
      try { insts.push({ el: c, fx: mk(c), live: false }); } catch (e) { }
    });
    sync();
    if (!raf) raf = requestAnimationFrame(tick);
    document.addEventListener('slidechange', sync, true);
  }
  function sync() {
    insts.forEach(function (it) {
      var live = !!it.el.closest('[data-deck-active]');
      if (live && !it.live) it.fx.reset();
      it.live = live;
    });
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
})();
