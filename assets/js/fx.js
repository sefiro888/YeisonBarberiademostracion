/* Yeison Barber Shop · efectos que enganchan:
   intro, scroll suave, cursor, navaja, rótulos, ritual, test, cuenta atrás y avisos de reseñas */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const YB = window.YB;
  const WA = n => `https://wa.me/34617781215?text=${encodeURIComponent(n)}`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 1. Intro de cine (una vez por visita) ---------- */
  const intro = $('.intro');
  if (intro && root.classList.contains('show-intro')) {
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      intro.classList.add('is-open');
      try { sessionStorage.setItem('yb-intro', '1'); } catch (_) {}
      setTimeout(() => root.classList.remove('show-intro'), 1050);
    };
    const t = setTimeout(finish, 2600);
    intro.addEventListener('click', () => { clearTimeout(t); finish(); });
    addEventListener('keydown', () => { clearTimeout(t); finish(); }, { once: true });
  }

  /* ---------- 2. Desplazamiento suave con inercia ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // Anclas de la misma página con desplazamiento suave
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
    });
    // Se detiene con el menú, el visor o la intro abiertos
    const sync = () => {
      const stop = root.classList.contains('menu-open') || root.classList.contains('show-intro') || document.body.style.overflow === 'hidden';
      stop ? lenis.stop() : lenis.start();
    };
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['style'] });
    sync();
  }

  /* Velocidad del scroll, compartida por los efectos */
  let lastY = scrollY, vel = 0;
  const tickVel = () => { const y = scrollY; vel += ((y - lastY) - vel) * .18; lastY = y; requestAnimationFrame(tickVel); };
  requestAnimationFrame(tickVel);

  /* ---------- 3. Cursor de barbero ---------- */
  const cursor = $('.cursor');
  if (cursor && fine && !reduce && innerWidth > 1024) {
    root.classList.add('has-cursor');
    cursor.classList.add('is-hidden');
    const dot = $('.cursor-dot', cursor), ring = $('.cursor-ring', cursor), snip = $('.cursor-snip', cursor);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cursor.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    const loop = () => {
      rx += (mx - rx) * .2; ry += (my - ry) * .2;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      snip.style.transform = `translate(${mx}px, ${my}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.addEventListener('pointerover', e => {
      const t = e.target;
      const ver = t.closest('[data-cursor="ver"], .shot, .filmstrip a, .qopt, .rp figure, .quiz-pics img, .tp');
      cursor.classList.toggle('is-ver', !!ver);
      cursor.classList.toggle('is-link', !ver && !!t.closest('a, button, label, summary, select'));
    });
    addEventListener('pointerdown', () => { cursor.classList.remove('is-snip'); void cursor.offsetWidth; cursor.classList.add('is-snip'); });
  }

  /* ---------- 4. Fotos que se revelan con un pase de navaja ---------- */
  const razors = $$('.razor');
  razors.forEach(r => { const b = document.createElement('span'); b.className = 'blade'; r.append(b); });
  const rio = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-cut');
    rio.unobserve(en.target);
  }), { threshold: .18 });
  razors.forEach(r => rio.observe(r));

  /* ---------- 5. Rótulos que corren con la velocidad del scroll ---------- */
  const rows = $$('.bigline-row').map(row => {
    const track = $('.bigline-track', row);
    track.append(...[...track.children].map(n => n.cloneNode(true)));
    return { track, dir: +row.dataset.velocity || 1, x: 0 };
  });
  const tks = $$('.ticker-track').map(track => { track.style.animation = 'none'; return { track, dir: 1, x: 0, tk: true }; });
  if (rows.length || tks.length) {
    const run = () => {
      const boost = clamp(Math.abs(vel) * .35, 0, 18);
      const sign = vel < -0.5 ? -1 : 1;
      [...rows, ...tks].forEach(r => {
        const half = r.track.scrollWidth / 2;
        if (!r.track.offsetParent) return;
        r.x -= (reduce ? 0 : (r.tk ? .7 : .55) + boost) * r.dir * sign;
        if (r.x <= -half) r.x += half;
        if (r.x > 0) r.x -= half;
        const skew = reduce ? 0 : clamp(vel * -.12, -8, 8);
        r.track.style.transform = `translate3d(${r.x}px,0,0) skewX(${skew}deg)`;
      });
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  /* ---------- 6. El ritual: recorrido horizontal mientras bajas ---------- */
  const pin = $('[data-pin]');
  if (pin) {
    const track = $('[data-pin-track]', pin), bar = $('.ritual-progress', pin);
    let active = false;
    const size = () => {
      active = innerWidth > 900;
      if (!active) { pin.style.height = ''; track.style.transform = ''; return; }
      const dist = track.scrollWidth - innerWidth;
      pin.style.height = (dist + innerHeight) + 'px';
    };
    const move = () => {
      if (active) {
        const dist = track.scrollWidth - innerWidth;
        const p = clamp((scrollY - pin.offsetTop) / (pin.offsetHeight - innerHeight), 0, 1);
        track.style.transform = `translate3d(${-p * dist}px,0,0)`;
        bar.style.setProperty('--rp', p.toFixed(4));
      }
      requestAnimationFrame(move);
    };
    size();
    addEventListener('resize', size);
    addEventListener('load', size);
    requestAnimationFrame(move);
  }

  /* ---------- 6b. El ritual: tarjetas que se apilan ---------- */
  const stack = $$('.rs');
  if (stack.length) {
    const steps = $$('[data-ritual-steps] li');
    const loopStack = () => {
      let active = 0;
      stack.forEach((card, i) => {
        const top = parseFloat(getComputedStyle(card).top) || 0;
        const r = card.getBoundingClientRect();
        if (r.top <= top + 2) active = i;
        const next = stack[i + 1];
        let k = 0;
        if (next) {
          const nt = parseFloat(getComputedStyle(next).top) || 0;
          k = clamp((r.height - (next.getBoundingClientRect().top - nt)) / r.height, 0, 1);
        }
        card.style.transform = reduce ? '' : `scale(${1 - k * .07})`;
        card.style.filter = k > 0 ? `brightness(${1 - k * .45})` : '';
      });
      steps.forEach((li, i) => { li.classList.toggle('is-on', i === active); li.classList.toggle('is-done', i < active); });
      requestAnimationFrame(loopStack);
    };
    requestAnimationFrame(loopStack);
  }

  /* ---------- 7. Test «Encuentra tu corte» ---------- */
  const works = YB.works.map(([n, tags, title]) => ({ n: String(n).padStart(2, '0'), tags: tags.split(' '), title }));
  const STYLES = {
    degradado: { name: 'Degradado <span class="script">limpio</span>', plain: 'Degradado limpio', text: 'Nuca y laterales al milímetro, sin saltos, y arriba a tu medida. El clásico que nunca falla.' },
    textura: { name: 'Textura <span class="script">con flow</span>', plain: 'Textura con flow', text: 'Volumen y movimiento arriba con tijera, flequillo si te va, y un degradado suave que lo enmarca.' },
    diseno: { name: 'Fade <span class="script">con diseño</span>', plain: 'Fade con diseño', text: 'Degradado con línea o dibujo a cuchilla. Para los que quieren que se note desde lejos.' },
    peques: { name: 'Corte <span class="script">peque</span>', plain: 'Corte peque', text: 'Paciencia, buen rollo y el corte tal cual lo quiere. Salen contentos y vuelven con ganas.' }
  };
  $$('[data-quiz]').forEach(box => {
    const Q = [
      { q: '¿Para quién es el corte?', o: [['yo', 'Para mí', 'De 8 años en adelante', '09'], ['peque', 'Para un peque', 'Hasta 8 años', '18']] },
      { q: '¿Qué rollo buscas?', o: [['degradado', 'Limpio y clásico', 'Degradado apurado', '17'], ['textura', 'Con textura', 'Volumen y flequillo', '24'], ['diseno', 'Que se note', 'Líneas y diseños', '32']] },
      { q: '¿Y la barba?', o: [['barba', 'También barba', 'Perfilada y a navaja', '33'], ['pelo', 'Solo el pelo', 'Barba fuera', '11']] }
    ];
    let step = 0;
    const ans = {};
    const render = () => {
      if (step === 1 && ans[0] === 'peque') step = 3;
      if (step >= Q.length) return result();
      const q = Q[step];
      box.innerHTML = `
        <div class="quiz-top"><span class="quiz-step">Pregunta ${step + 1} de ${ans[0] === 'peque' ? 1 : 3}</span><span class="quiz-bar"><span style="width:${(step / 3) * 100 + 8}%"></span></span></div>
        <h3>${q.q}</h3>
        <div class="quiz-opts">${q.o.map(([v, t, s, img], i) => `
          <button type="button" class="qopt" data-v="${v}" style="animation-delay:${i * 70}ms">
            <img src="assets/img/trabajos/trabajo-${img}-sm.jpg" alt="" loading="lazy" width="520" height="693">
            <span><b>${t}</b><small>${s}</small></span>
          </button>`).join('')}</div>`;
    };
    const result = () => {
      const style = ans[0] === 'peque' ? 'peques' : ans[1];
      const beard = ans[2] === 'barba' && style !== 'peques';
      const st = STYLES[style];
      const svc = style === 'peques' ? YB.services.find(s => s.id === 'nino') : beard ? YB.services.find(s => s.id === 'cortebarba') : YB.services.find(s => s.id === 'corte');
      let pool = works.filter(w => w.tags.includes(style));
      if (beard) pool = [...pool.filter(w => w.tags.includes('barba')), ...works.filter(w => w.tags.includes('barba') && !w.tags.includes(style)), ...pool.filter(w => !w.tags.includes('barba'))];
      const pics = [...new Map(pool.map(w => [w.n, w])).values()].slice(0, 4);
      const msg = `Hola Yeison, he hecho el test de vuestra web y me sale «${st.plain}» (${svc.name}, ${svc.price} €). ¿Cuándo tenéis hueco?`;
      box.innerHTML = `
        <div class="quiz-res">
          <div>
            <p class="eyebrow">Tu corte ideal</p>
            <h3>${st.name}</h3>
            <p>${st.text}${beard ? ' Y la barba, perfilada a navaja en la misma cita.' : ''}</p>
            <p class="quiz-svc"><span>${svc.name} · ${svc.min >= 60 ? '1 h' : svc.min + ' min'}</span><b>${svc.price} €</b></p>
            <div class="quiz-btns">
              <a class="btn btn-wa" href="${WA(msg)}" target="_blank" rel="noopener">Lo quiero por WhatsApp</a>
              <a class="btn btn-line" href="trabajos.html#estilo=${style}">Ver más así</a>
            </div>
            <button type="button" class="quiz-again">Repetir el test</button>
          </div>
          <div class="quiz-pics">${pics.map(w => `<img src="assets/img/trabajos/trabajo-${w.n}-sm.jpg" alt="${w.title}" loading="lazy" width="520" height="693">`).join('')}</div>
        </div>`;
    };
    box.addEventListener('click', e => {
      const o = e.target.closest('.qopt');
      if (o) { ans[step] = o.dataset.v; step++; render(); return; }
      if (e.target.closest('.quiz-again')) { step = 0; Object.keys(ans).forEach(k => delete ans[k]); render(); }
    });
    render();
  });
  // Filtro desde el test: trabajos.html#estilo=textura
  const applyHash = () => {
    const m = location.hash.match(/estilo=(\w+)/);
    const chip = m && $(`.chip[data-filter="${m[1]}"]`);
    if (!chip) return;
    chip.click();
    const g = $('#gallery');
    if (g) setTimeout(() => (lenis ? lenis.scrollTo(g, { offset: -170 }) : g.scrollIntoView({ behavior: 'smooth' })), 150);
  };
  addEventListener('hashchange', applyHash);
  if ($('#gallery')) setTimeout(applyHash, 300);

  /* ---------- 8. Cuenta atrás de paletas ---------- */
  const cd = $('[data-countdown]');
  if (cd) {
    const label = $('.cd-label', cd), digits = $('.cd-digits', cd);
    const now = () => {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), s: +p.hour * 3600 + +p.minute * 60 + +p.second };
    };
    let prev = '';
    const tick = () => {
      const { day, s } = now();
      const open = YB.hours[day].find(([a, b]) => s >= a * 60 && s < b * 60);
      let left, txt;
      if (open) { left = open[1] * 60 - s; txt = 'Cierra en'; }
      else {
        txt = 'Abre en';
        left = null;
        for (let i = 0; i <= 7 && left === null; i++) {
          const d = (day + i) % 7;
          const next = YB.hours[d].find(([a]) => i > 0 || a * 60 > s);
          if (next) left = i * 86400 + next[0] * 60 - s;
        }
      }
      label.textContent = txt;
      const dd = Math.floor(left / 86400), h = Math.floor(left % 86400 / 3600), m = Math.floor(left % 3600 / 60), sec = left % 60;
      const str = (dd ? dd + 'd ' : '') + [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
      if (str.length !== prev.length) digits.innerHTML = [...str].map(c => `<i class="${c === ':' ? 'sep' : c === 'd' ? 'd-unit' : c === ' ' ? 'sep' : ''}">${c === ' ' ? '' : c}</i>`).join('');
      const cells = $$('i', digits);
      [...str].forEach((c, i) => {
        const cell = cells[i];
        if (!cell || c === ' ') return;
        if (cell.textContent !== c) { cell.textContent = c; if (!reduce) { cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip'); } }
      });
      prev = str;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 9. Avisos de reseñas reales (solo en ordenador) ---------- */
  const toasts = $('.toasts');
  if (toasts && innerWidth > 900 && !document.body.classList.contains('page-opiniones')) {
    const pool = YB.reviews.filter(r => r.b && r.t.length > 28 && r.t.length < 140).sort(() => Math.random() - .5);
    let shown = 0;
    try { shown = +sessionStorage.getItem('yb-toasts') || 0; } catch (_) {}
    const show = () => {
      if (shown >= 5 || document.hidden || root.classList.contains('show-intro')) return;
      const r = pool[shown % pool.length];
      const el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = `<span class="avatar" aria-hidden="true">${r.a.charAt(0)}</span><div><p>«${r.t}»</p><small><b>★★★★★</b> ${r.a} · con ${r.b} · Booksy</small></div><button type="button" aria-label="Cerrar">×</button>`;
      toasts.append(el);
      shown++;
      try { sessionStorage.setItem('yb-toasts', shown); } catch (_) {}
      let timer;
      const out = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 500); };
      const arm = () => { timer = setTimeout(out, 7000); };
      el.addEventListener('mouseenter', () => clearTimeout(timer));
      el.addEventListener('mouseleave', arm);
      el.querySelector('button').addEventListener('click', out);
      arm();
    };
    setTimeout(() => { show(); setInterval(show, 30000); }, 14000);
  }

  /* ---------- En móvil, el selector de color se aparta al bajar ---------- */
  const sw = $('.theme-switch');
  if (sw) {
    let ly = scrollY;
    addEventListener('scroll', () => {
      if (innerWidth > 900) return;
      const y = scrollY;
      if (Math.abs(y - ly) < 8) return;
      sw.classList.toggle('is-tucked', y > ly && y > 400);
      ly = y;
    }, { passive: true });
  }

  /* ---------- Foco de luz que sigue al ratón en la portada ---------- */
  const hero = $('.hero');
  if (hero && fine && !reduce) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
})();
