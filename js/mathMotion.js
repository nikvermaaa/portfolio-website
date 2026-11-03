/**
 * Math, in motion
 * Real-time mathematical visual simulations rendered onto Canvas cards.
 * Equations: Euler's formula, Fourier series, Golden angle, Mandelbrot set,
 * Mercury's precessing orbit, Lorenz attractor, Times tables, and Cycloid.
 */

export function initMathMotion() {
  const shelf = document.getElementById('shelf');
  if (!shelf) return;

  const shelfWrapper = shelf.closest('.shelf-wrapper') || shelf.parentElement;
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  // Prevent duplicate clone setup if initMathMotion is invoked again
  if (!shelf.dataset.infiniteCarousel) {
    shelf.dataset.infiniteCarousel = 'true';
    const originalItems = [...shelf.querySelectorAll('.item')];
    const N = originalItems.length;

    if (N >= 2) {
      // Prepend N clones and append N clones for seamless two-way infinite looping
      const preClones = originalItems.map(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('is-clone');
        return clone;
      });
      const postClones = originalItems.map(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('is-clone');
        return clone;
      });

      for (let i = preClones.length - 1; i >= 0; i--) {
        shelf.insertBefore(preClones[i], shelf.firstChild);
      }
      postClones.forEach(clone => shelf.appendChild(clone));
    }
  }

  // Theme colors for canvas drawing
  let P, I, M, F, S;
  function updateTheme() {
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    P = isDark ? '#52b788' : '#2d6a4f';
    I = isDark ? '#ececea' : '#222';
    M = isDark ? '#8a8a88' : '#777';
    F = isDark ? '#444' : '#d4d4d2';
    S = isDark ? '#777' : '#9a9a9a';
  }
  updateTheme();
  try {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
  } catch (_) {}

  const TAU = Math.PI * 2;
  const ln = (c, x1, y1, x2, y2, s, w = 1) => {
    c.strokeStyle = s;
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };
  const ci = (c, x, y, r, s, f) => {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    if (f) {
      c.fillStyle = f;
      c.fill();
    } else {
      c.strokeStyle = s;
      c.lineWidth = 1;
      c.stroke();
    }
  };

  // ---- 1. Euler
  function euler(c, t) {
    const cx = 150, cy = 135, R = 100, th = (t * 0.7) % TAU;
    const x = cx + R * Math.cos(th), y = cy - R * Math.sin(th);
    ln(c, cx - 130, cy, cx + 130, cy, F);
    ln(c, cx, cy - 120, cx, cy + 120, F);
    ci(c, cx, cy, R, M);
    c.beginPath();
    c.arc(cx, cy, R, -th, 0);
    c.strokeStyle = P;
    c.lineWidth = 1.8;
    c.stroke();
    ln(c, cx, cy, x, y, M);
    ln(c, x, y, x, cy, P, 2);
    ln(c, cx, cy, x, cy, I, 2);
    c.beginPath();
    c.arc(cx, cy, 14, -th, 0);
    c.strokeStyle = I;
    c.lineWidth = 1;
    c.stroke();
    ci(c, x, y, 4, 0, P);
  }

  // ---- 2. Fourier epicycles tracing a figure eight
  const TERMS = [[1, 0.5], [-1, 0.5], [2, 0.25], [-2, -0.25]];
  function fourier(c, t) {
    const cx = 150, cy = 135, s = 115;
    c.beginPath();
    for (let i = 0; i <= 240; i++) {
      const u = i / 240 * TAU;
      let x = 0, y = 0;
      for (const [k, a] of TERMS) {
        x += a * Math.cos(k * u);
        y += a * Math.sin(k * u);
      }
      if (i) c.lineTo(cx + s * x, cy - s * y);
      else c.moveTo(cx + s * x, cy - s * y);
    }
    c.strokeStyle = P;
    c.lineWidth = 1.8;
    c.stroke();

    let x = cx, y = cy;
    const u = t * 0.9;
    for (const [k, a] of TERMS) {
      const nx = x + s * a * Math.cos(k * u);
      const ny = y - s * a * Math.sin(k * u);
      ci(c, x, y, Math.abs(a) * s, F);
      ln(c, x, y, nx, ny, M);
      x = nx;
      y = ny;
    }
    ci(c, x, y, 4, 0, P);
  }

  // ---- 3. Golden angle (Vogel spiral)
  function golden(c, t) {
    const N = 260, rot = t * 0.12, sc = 1 + 0.015 * Math.sin(t * 1.3), g = 2.399963;
    for (let n = 1; n <= N; n++) {
      const a = n * g + rot;
      const r = 7.3 * Math.sqrt(n) * sc;
      const x = 150 + r * Math.cos(a);
      const y = 135 + r * Math.sin(a);
      let col = S, k = 1;
      if (n % 21 === 0) { col = P; k = 1.35; }
      else if (n % 34 === 0) { col = I; k = 1.35; }
      const sz = (0.9 + 1.6 * n / N) * k * (1 + 0.3 * Math.sin(n * 0.18 - t * 2.5));
      ci(c, x, y, sz, 0, col);
    }
  }

  // ---- 4. Mandelbrot: static set, wandering parameter c and its orbit
  let off = null;
  function buildSet() {
    const W = 450;
    off = document.createElement('canvas');
    off.width = off.height = W;
    const g = off.getContext('2d');
    const img = g.createImageData(W, W);
    const MX = 80;
    for (let j = 0; j < W; j++) {
      for (let i = 0; i < W; i++) {
        const cr = (i / 1.5 - 150) / 95 - 0.65;
        const ci_ = (135 - j / 1.5) / 95;
        let x = 0, y = 0, n = 0;
        while (n < MX && x * x + y * y <= 4) {
          const xt = x * x - y * y + cr;
          y = 2 * x * y + ci_;
          x = xt;
          n++;
        }
        const p = (j * W + i) * 4;
        img.data[p] = img.data[p + 1] = img.data[p + 2] = 125;
        img.data[p + 3] = n === MX ? 46 : (n >= 14 ? 230 : 0);
      }
    }
    g.putImageData(img, 0, 0);
  }
  const mx = x => 150 + (x + 0.65) * 95;
  const my = y => 135 - y * 95;
  function mandel(c, t) {
    if (!off) buildSet();
    c.drawImage(off, 0, 0, 300, 300);
    const f = t * 0.45, k = 1.04 + 0.06 * Math.sin(t * 1.1);
    const cr = (Math.cos(f) / 2 - Math.cos(2 * f) / 4) * k;
    const cim = (Math.sin(f) / 2 - Math.sin(2 * f) / 4) * k;
    let x = 0, y = 0;
    c.beginPath();
    c.moveTo(mx(0), my(0));
    const pts = [];
    for (let n = 0; n < 40; n++) {
      const xt = x * x - y * y + cr;
      y = 2 * x * y + cim;
      x = xt;
      if (x * x + y * y > 16) break;
      c.lineTo(mx(x), my(y));
      pts.push([mx(x), my(y)]);
    }
    c.strokeStyle = P;
    c.globalAlpha = 0.7;
    c.lineWidth = 1;
    c.stroke();
    c.globalAlpha = 1;
    pts.forEach(p => ci(c, p[0], p[1], 1.4, 0, P));
    ci(c, mx(0), my(0), 2, 0, P);
    const px = mx(cr), py = my(cim);
    ln(c, px - 5, py, px + 5, py, I);
    ln(c, px, py - 5, px, py + 5, I);
  }

  // ---- 5. Mercury: precessing ellipse
  const mer = { th: 0, trail: [] };
  function mercury(c, t, dt) {
    const a = 105, e = 0.45, eps = 0.07, sx = 150 + a * e, sy = 135, b = Math.sqrt(1 - e * e);
    mer.th += (TAU / 7) * Math.pow(1 + e * Math.cos(mer.th), 2) / Math.pow(b, 3) * (dt || 0.016);
    const ph = mer.th / (1 - eps);
    const r = a * b * b / (1 + e * Math.cos(mer.th));
    const x = sx + r * Math.cos(ph), y = sy - r * Math.sin(ph);
    mer.trail.push([x, y]);
    if (mer.trail.length > 1000) mer.trail.shift();

    c.setLineDash([3, 3]);
    c.beginPath();
    c.ellipse(150, 135, a, a * b, 0, 0, TAU);
    c.strokeStyle = M;
    c.globalAlpha = 0.6;
    c.lineWidth = 1;
    c.stroke();
    c.setLineDash([]);

    const T = mer.trail, L = T.length, parts = 4;
    for (let p = 0; p < parts; p++) {
      const s = Math.floor(L * p / parts), en = Math.floor(L * (p + 1) / parts) + 1;
      if (en - s < 2) continue;
      c.beginPath();
      c.moveTo(T[s][0], T[s][1]);
      for (let i = s + 1; i < Math.min(en, L); i++) c.lineTo(T[i][0], T[i][1]);
      c.globalAlpha = 0.15 + 0.2 * (p + 1);
      c.strokeStyle = P;
      c.lineWidth = 1.6;
      c.stroke();
    }
    c.globalAlpha = 1;
    ci(c, sx, sy, 5, 0, I);
    ci(c, x, y, 4, 0, P);
  }

  // ---- 6. Lorenz attractor, slowly turning
  const lor = { x: 1, y: 1, z: 1, trail: [] }, LH = 0.005;
  function lstep() {
    const { x, y, z } = lor;
    lor.x += LH * 10 * (y - x);
    lor.y += LH * (x * (28 - z) - y);
    lor.z += LH * (x * y - 8 / 3 * z);
  }
  for (let i = 0; i < 3000; i++) lstep();
  function lorenz(c, t, dt) {
    const n = Math.min(60, Math.round((dt || 0.016) * 8 / LH)), a = t * 0.15, ca = Math.cos(a), sa = Math.sin(a);
    for (let i = 0; i < n; i++) {
      lstep();
      if (i % 3 === 0) lor.trail.push([lor.x, lor.y, lor.z]);
    }
    if (lor.trail.length > 1500) lor.trail.splice(0, lor.trail.length - 1500);
    const T = lor.trail, L = T.length, pr = p => [150 + (p[0] * ca + p[1] * sa) * 5, 240 - p[2] * 4.3];
    ln(c, 150, 20, 150, 250, F);
    for (let s = 0; s < 6; s++) {
      const b = Math.floor(L * s / 6), e = Math.min(L, Math.floor(L * (s + 1) / 6) + 1);
      if (e - b < 2) continue;
      c.beginPath();
      for (let i = b; i < e; i++) {
        const q = pr(T[i]);
        if (i === b) c.moveTo(q[0], q[1]);
        else c.lineTo(q[0], q[1]);
      }
      c.globalAlpha = 0.12 + 0.14 * (s + 1);
      c.strokeStyle = P;
      c.lineWidth = 1.3;
      c.stroke();
    }
    c.globalAlpha = 1;
    if (L) {
      const q = pr(T[L - 1]);
      ci(c, q[0], q[1], 3.5, 0, P);
    }
  }

  // ---- 7. Times table circle
  function times(c, t) {
    const N = 200, R = 105, cx = 150, cy = 135;
    const k = 3 + 2 * Math.sin(t * 0.2);
    const pt = i => {
      const a = i / N * TAU - Math.PI / 2;
      return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    };
    ci(c, cx, cy, R, F);
    c.lineWidth = 0.6;
    c.strokeStyle = M;
    c.globalAlpha = 0.4;
    c.beginPath();
    for (let i = 0; i < N; i++) {
      const p = pt(i), q = pt((k * i) % N);
      c.moveTo(p[0], p[1]);
      c.lineTo(q[0], q[1]);
    }
    c.stroke();
    c.globalAlpha = 0.9;
    c.strokeStyle = P;
    c.lineWidth = 0.9;
    c.beginPath();
    for (let i = 0; i < N; i += 20) {
      const p = pt(i), q = pt((k * i) % N);
      c.moveTo(p[0], p[1]);
      c.lineTo(q[0], q[1]);
    }
    c.stroke();
    c.globalAlpha = 1;
    for (let i = 0; i < N; i += 5) {
      const p = pt(i);
      ci(c, p[0], p[1], i % 20 === 0 ? 2.2 : 1.2, 0, i % 20 === 0 ? I : S);
    }
    c.fillStyle = M;
    c.font = '12px Inter, system-ui, sans-serif';
    c.fillText('k = ' + k.toFixed(2), 18, 28);
  }

  // ---- 8. Cycloid
  function cycloid(c, t) {
    const r = 28, x0 = 18, g = 170, th = 3 * Math.PI * (0.5 - 0.5 * Math.cos(t * 0.35));
    const X = u => x0 + r * (u - Math.sin(u)), Y = u => g - r * (1 - Math.cos(u));
    ln(c, 8, g, 292, g, F);
    c.beginPath();
    for (let i = 0; i <= 240; i++) {
      const u = i / 240 * 3 * Math.PI;
      if (i) c.lineTo(X(u), Y(u));
      else c.moveTo(X(u), Y(u));
    }
    c.strokeStyle = F;
    c.lineWidth = 1;
    c.stroke();
    c.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120 * th;
      if (i) c.lineTo(X(u), Y(u));
      else c.moveTo(X(u), Y(u));
    }
    c.strokeStyle = P;
    c.lineWidth = 1.8;
    c.stroke();
    const cx = x0 + r * th, cy = g - r, px = X(th), py = Y(th);
    ci(c, cx, cy, r, M);
    ln(c, cx, cy, px, py, I, 1.4);
    ln(c, cx, g, cx, cy, F);
    ci(c, cx, cy, 2, 0, I);
    ci(c, cx, g, 2.5, 0, M);
    ci(c, px, py, 4, 0, P);
  }

  // Draw list mapped to shelf items (7 ideas)
  const draws = [euler, fourier, lorenz, golden, times, mercury, cycloid];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = reduced ? 0.2 : 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const canvasList = [...document.querySelectorAll('.shelf .item canvas')];
  const cards = canvasList.map((cv, i) => ({
    cv,
    ctx: cv.getContext('2d'),
    draw: draws[i % draws.length],
    vis: false,
    s: 1
  }));

  const ro = new ResizeObserver(entries => {
    entries.forEach(en => {
      const cd = cards.find(x => x.cv === en.target);
      if (!cd) return;
      const w = en.contentRect.width;
      const h = en.contentRect.height;
      if (w === 0 || h === 0) return;
      cd.cv.width = Math.round(w * dpr);
      cd.cv.height = Math.round(h * dpr);
      cd.s = w / 300;
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      const cd = cards.find(x => x.cv === en.target);
      if (cd) cd.vis = en.isIntersecting;
    });
  }, { threshold: 0 });

  cards.forEach(cd => {
    ro.observe(cd.cv);
    io.observe(cd.cv);
  });

  let last = 0;
  const SCALE = 0.82; // Scales visualizations to give comfortable inner padding within the card box
  function loop(ms) {
    const t = ms / 1000 * K;
    const dt = Math.min(0.05, (ms - last) / 1000) * K;
    last = ms;
    for (const cd of cards) {
      if (!cd.vis || !cd.ctx) continue;
      cd.ctx.setTransform(1, 0, 0, 1, 0, 0);
      cd.ctx.clearRect(0, 0, cd.cv.width, cd.cv.height);
      const s = dpr * cd.s * SCALE;
      const ox = 150 * (1 - SCALE) * dpr * cd.s;
      const oy = 135 * (1 - SCALE) * dpr * cd.s;
      cd.ctx.setTransform(s, 0, 0, s, ox, oy);
      cd.draw(cd.ctx, t, dt);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ===== INFINITE CLONE CAROUSEL ENGINE ===== */
  const N = shelf.querySelectorAll('.item:not(.is-clone)').length || 7;
  let currentIndex = N; // Start at index N (Euler's formula original)
  let isAnimating = false;

  function updateCardDimensions() {
    if (!shelfWrapper) return;
    const wrapperWidth = shelfWrapper.getBoundingClientRect().width;
    if (!wrapperWidth) return;

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    const gap = isMobile ? 14 : 18;

    let visibleCards = 5;
    if (isMobile) {
      visibleCards = 1.25;
    } else if (isTablet) {
      visibleCards = 3;
    }

    let cardWidth;
    if (isMobile) {
      cardWidth = Math.min(290, wrapperWidth * 0.82);
    } else {
      cardWidth = (wrapperWidth - (visibleCards - 1) * gap) / visibleCards;
    }

    shelfWrapper.style.setProperty('--shelf-gap', `${gap}px`);
    shelfWrapper.style.setProperty('--card-width', `${cardWidth}px`);
  }

  function getStepDistance() {
    const items = shelf.children;
    if (items.length < 2) return 0;
    const r0 = items[0].getBoundingClientRect();
    const r1 = items[1].getBoundingClientRect();
    return r1.left - r0.left;
  }

  function setTrackPosition(index, animate = false) {
    const step = getStepDistance();
    const x = -index * step;
    if (animate) {
      shelf.style.transition = 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      shelf.style.transition = 'none';
    }
    shelf.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  // Initial calculation and position
  updateCardDimensions();
  requestAnimationFrame(() => {
    updateCardDimensions();
    setTrackPosition(currentIndex, false);
  });

  function slideNext() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex++;
    setTrackPosition(currentIndex, true);
  }

  function slidePrev() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex--;
    setTrackPosition(currentIndex, true);
  }

  // Seamless silent loop normalization on transition completion
  shelf.addEventListener('transitionend', (e) => {
    if (e.target !== shelf || e.propertyName !== 'transform') return;

    if (currentIndex >= 2 * N) {
      // Reached or passed post-clone threshold (>= 10): silently jump back to original range [5..9]
      currentIndex -= N;
      setTrackPosition(currentIndex, false);
    } else if (currentIndex < N) {
      // Reached pre-clone threshold (< 5): silently jump forward to original range [5..9]
      currentIndex += N;
      setTrackPosition(currentIndex, false);
    }

    isAnimating = false;
  });

  // Navigation arrow buttons: ALWAYS enabled, no dead ends
  if (prevBtn && nextBtn) {
    prevBtn.removeAttribute('disabled');
    nextBtn.removeAttribute('disabled');
    prevBtn.setAttribute('aria-label', 'Previous card');
    nextBtn.setAttribute('aria-label', 'Next card');

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      slidePrev();
    });

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      slideNext();
    });
  }

  // Keyboard navigation: Left/Right arrows
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const homeView = document.getElementById('view-home');
    if (homeView && homeView.classList.contains('hidden')) return;

    if (e.key === 'ArrowLeft') {
      slidePrev();
    } else if (e.key === 'ArrowRight') {
      slideNext();
    }
  });

  // Touch swipe gesture support
  if (shelfWrapper) {
    let startX = 0;
    let diffX = 0;

    shelfWrapper.addEventListener('touchstart', (e) => {
      if (isAnimating || e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      diffX = 0;
    }, { passive: true });

    shelfWrapper.addEventListener('touchmove', (e) => {
      if (isAnimating || e.touches.length !== 1) return;
      diffX = e.touches[0].clientX - startX;
    }, { passive: true });

    shelfWrapper.addEventListener('touchend', () => {
      if (isAnimating) return;
      const threshold = 40;
      if (diffX < -threshold) {
        slideNext();
      } else if (diffX > threshold) {
        slidePrev();
      }
      diffX = 0;
    });
  }

  // Window resize handler: update dimensions and maintain exact card alignment
  window.addEventListener('resize', () => {
    updateCardDimensions();
    if (!isAnimating) {
      setTrackPosition(currentIndex, false);
    }
  });
}
