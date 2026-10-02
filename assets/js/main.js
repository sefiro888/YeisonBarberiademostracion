/* Yeison Barber Shop · interacción común y de cada página */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const YB = window.YB;
  const WA = n => `https://wa.me/34617781215?text=${encodeURIComponent(n)}`;
  const esNum = (n, d = 0) => n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- Dos colores: crema y negro ---------- */
  const LOGOS = { 'logo.png': 'logo-negro.png', 'logo-sm.png': 'logo-negro-sm.png' };
  const meta = $('meta[name="theme-color"]');
  const paintTheme = t => {
    const dark = t === 'negro';
    root.toggleAttribute('data-theme', dark);
    if (dark) root.setAttribute('data-theme', 'negro');
    $$('img[src*="assets/img/marca/logo"]').forEach(img => {
      const file = img.getAttribute('src').split('/').pop();
      const light = Object.keys(LOGOS).find(k => LOGOS[k] === file) || file;
      const next = dark ? (LOGOS[light] || light) : light;
      if (next !== file) img.src = 'assets/img/marca/' + next;
    });
    if (meta) meta.content = dark ? '#0c0907' : '#f6eedc';
    $$('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)));
  };
  const current = () => (root.getAttribute('data-theme') === 'negro' ? 'negro' : 'crema');
  paintTheme(current());
  $$('[data-theme-set]').forEach(b => b.addEventListener('click', e => {
    const t = b.dataset.themeSet;
    if (t === current()) return;
    try { localStorage.setItem('yb-theme', t); localStorage.setItem('yb-theme-seen', '1'); } catch (_) {}
    if (!document.startViewTransition || reduce) { paintTheme(t); return; }
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => paintTheme(t)).ready.then(() => {
      root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] }, { duration: 750, easing: 'cubic-bezier(.7, 0, .3, 1)', pseudoElement: '::view-transition-new(root)' });
    });
  }));
  // La primera vez se señala el selector para que el cliente sepa que puede comparar
  try {
    if (!localStorage.getItem('yb-theme-seen') && current() === 'crema') {
      const sw = $('.theme-switch');
      setTimeout(() => { sw.classList.add('is-hint'); setTimeout(() => sw.classList.remove('is-hint'), 3400); }, 2200);
      localStorage.setItem('yb-theme-seen', '1');
    }
  } catch (_) {}

  /* ---------- Transición entre páginas ---------- */
  try { sessionStorage.removeItem('yb-nav'); } catch (_) {}
  if (root.classList.contains('is-entering')) {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-entered')));
    setTimeout(() => root.classList.remove('is-entering', 'is-entered'), 1000);
  }
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('is-leaving', 'is-entering', 'is-entered'); });
  if (!reduce) document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    root.style.setProperty('--vx', e.clientX + 'px');
    root.style.setProperty('--vy', e.clientY + 'px');
    root.classList.add('is-leaving');
    try { sessionStorage.setItem('yb-nav', '1'); } catch (_) {}
    setTimeout(() => { location.href = url.href; }, 560);
  });

  /* ---------- Cabecera, progreso, menú y barra móvil ---------- */
  const header = $('.site-header');
  const bar = $('.pole-progress span');
  const dock = $('.dock');
  const footer = $('.site-footer');
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
    header.classList.toggle('is-scrolled', scrollY > 30 || nav.classList.contains('is-open'));
    if (dock && footer) dock.classList.toggle('is-hidden', footer.getBoundingClientRect().top < innerHeight - 40);
  };
  const nav = $('#nav');
  const menuBtn = $('.menu-btn');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
    root.classList.toggle('menu-open', open);
    onScroll();
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Titulares: palabras que suben ---------- */
  $$('.split').forEach(el => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        if (n.classList.contains('script')) { n.style.setProperty('--i', i); i += 2; }
        else walk(n);
      }
    });
    walk(el);
  });

  /* ---------- Apariciones al hacer scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    io.unobserve(en.target);
  }), { threshold: .14, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal, .split, .swash, .score-side').forEach(el => io.observe(el));

  /* ---------- Contadores ---------- */
  const cio = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, d = +(el.dataset.decimals || 0);
    if (reduce) { el.textContent = esNum(end, d); return; }
    const t0 = performance.now();
    const tick = t => {
      const k = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = esNum(end * e, d);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Horario en vivo (hora de Madrid) ---------- */
  const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const hhmm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const madrid = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: +p.hour * 60 + +p.minute };
  };
  const status = () => {
    const { day, min } = madrid();
    const open = YB.hours[day].find(([a, b]) => min >= a && min < b);
    if (open) {
      const left = open[1] - min;
      return { open: true, day, min, text: left <= 45 ? `Abierto · cierra en ${left} min` : `Abierto ahora · hasta las ${hhmm(open[1])}` };
    }
    const later = YB.hours[day].find(([a]) => a > min);
    if (later) return { open: false, day, min, text: `Cerrado · abre hoy a las ${hhmm(later[0])}` };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (YB.hours[d].length) return { open: false, day, min, text: `Cerrado · abre ${i === 1 ? 'mañana' : 'el ' + DAYS[d]} a las ${hhmm(YB.hours[d][0][0])}` };
    }
  };
  // Letrero de neón: poste con la espiral girando + OPEN encendido, o CLOSED apagado
  let neonId = 0;
  const neonSVG = () => {
    const id = 'nc' + (++neonId);
    const stripes = Array.from({ length: 12 }, (_, k) => `<path class="${k % 2 ? 'b' : 'r'}" d="M2 ${10 + k * 4} L22 ${2 + k * 4}"/>`).join('');
    return `<svg viewBox="0 0 24 64" aria-hidden="true"><defs><clipPath id="${id}"><rect x="8.4" y="18.8" width="7.2" height="28.4" rx="1"/></clipPath></defs>
      <g clip-path="url(#${id})"><g class="ns">${stripes}</g></g>
      <circle class="nt" cx="12" cy="6.5" r="4.3"/><path class="nt" d="M6.5 12.5h11a1.6 1.6 0 0 1 1.6 1.6v1.6a1.6 1.6 0 0 1-1.6 1.6h-11a1.6 1.6 0 0 1-1.6-1.6v-1.6a1.6 1.6 0 0 1 1.6-1.6Z"/>
      <rect class="nt" x="7.5" y="18" width="9" height="30" rx="1.4"/>
      <path class="nt" d="M6.5 48.5h11a1.6 1.6 0 0 1 1.6 1.6v1.4a1.6 1.6 0 0 1-1.6 1.6h-11a1.6 1.6 0 0 1-1.6-1.6v-1.4a1.6 1.6 0 0 1 1.6-1.6ZM9.5 53.5h5l-1.2 5h-2.6Z"/></svg>`;
  };
  const setNeon = (host, open) => {
    let n = host.querySelector('.neon');
    if (!n) {
      n = document.createElement('span');
      n.className = 'neon';
      n.innerHTML = `<span class="neon-lit">${neonSVG()}<span class="neon-word"></span></span>`;
      const dot = host.querySelector(':scope > i');
      dot ? dot.replaceWith(n) : host.prepend(n);
    }
    if (n.dataset.state === String(open)) return;
    n.dataset.state = String(open);
    n.classList.toggle('is-on', open);
    n.classList.toggle('is-off', !open);
    n.querySelector('.neon-word').textContent = open ? 'OPEN' : 'CLOSED';
    n.setAttribute('role', 'img');
    n.setAttribute('aria-label', open ? 'Abierto' : 'Cerrado');
  };
  const paintStatus = () => {
    const s = status();
    $$('[data-status]').forEach(el => {
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
      setNeon(el, s.open);
      el.querySelector(':scope > span:last-child').textContent = s.text.replace(/^(Abierto ahora|Abierto|Cerrado) · /, '');
    });
    $$('[data-neon-board]').forEach(el => setNeon(el, s.open));
    $$('.hours tr').forEach(tr => tr.classList.toggle('is-today', +tr.dataset.day === s.day));
    $$('[data-tuesday]').forEach(el => el.classList.toggle('is-today', s.day === 2));
    const today = $('[data-today]');
    if (today) {
      const h = YB.hours[s.day];
      today.textContent = h.length ? `Hoy ${DAYS[s.day]}: ${h.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(' y ')}` : `Hoy ${DAYS[s.day]} descansamos`;
    }
    const dayBar = $('[data-daybar]');
    if (dayBar) {
      const from = 540, to = 1230, pct = m => ((m - from) / (to - from) * 100).toFixed(2) + '%';
      $$('i', dayBar).forEach(i => i.remove());
      YB.hours[s.day].forEach(([a, b]) => { const i = document.createElement('i'); i.style.left = pct(a); i.style.width = `calc(${pct(b)} - ${pct(a)})`; dayBar.append(i); });
      const now = $('.day-now', dayBar);
      now.style.display = s.min >= from && s.min <= to ? 'block' : 'none';
      now.style.left = pct(s.min);
    }
  };
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- Vídeos: se cargan y reproducen solo a la vista ---------- */
  const vio = new IntersectionObserver(entries => entries.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting) {
      if (v.dataset.src && !v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; }
      if (!reduce) v.play().catch(() => {});
    } else v.pause();
  }), { threshold: .3 });
  $$('video').forEach(v => { if (reduce) v.removeAttribute('autoplay'); vio.observe(v); });

  /* ---------- Efectos con ratón: imán, inclinación y profundidad ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`; });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
    const stage = $('[data-depth]');
    if (stage) stage.closest('section').addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      $$('[data-layer]', stage).forEach(el => { const k = +el.dataset.layer; el.style.transform = `translate(${x * k * 2}px, ${y * k * 2}px)`; });
    });
  }

  /* ---------- Citas que rotan (portada) ---------- */
  $$('[data-rotator]').forEach(rot => {
    const items = $$('blockquote', rot), dots = $('[data-rotator-dots]');
    let i = 0, timer;
    const go = n => {
      i = (n + items.length) % items.length;
      items.forEach((q, k) => q.classList.toggle('is-on', k === i));
      if (dots) $$('button', dots).forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    if (dots) items.forEach((_, k) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Opinión ${k + 1}`); b.addEventListener('click', () => { go(k); restart(); }); dots.append(b); });
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 6000); };
    go(0); restart();
  });

  /* ---------- Tira de fotos que avanza sola y se puede arrastrar ---------- */
  $$('.filmstrip').forEach(strip => {
    const track = $('.filmstrip-track', strip);
    track.append(...[...track.children].map(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; return c; }));
    let x = 0, speed = reduce ? 0 : .45, drag = null, moved = 0, hover = false;
    const half = () => track.scrollWidth / 2;
    const loop = () => {
      if (!drag && !hover) x -= speed;
      if (x <= -half()) x += half();
      if (x > 0) x -= half();
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    strip.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    strip.addEventListener('pointerleave', () => { hover = false; });
    strip.addEventListener('pointerdown', e => { drag = { x0: e.clientX, start: x }; moved = 0; strip.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!drag) return; moved = e.clientX - drag.x0; x = drag.start + moved; });
    addEventListener('pointerup', () => { if (drag) { drag = null; strip.classList.remove('is-drag'); } });
    strip.addEventListener('click', e => { if (Math.abs(moved) > 6) e.preventDefault(); }, true);
  });

  /* ---------- Galería de trabajos + visor ---------- */
  const gallery = $('#gallery');
  if (gallery) {
    const T = { degradado: 'Degradado', textura: 'Textura', diseno: 'Diseño', barba: 'Barba', peques: 'Peques' };
    const works = YB.works.map(([n, tags, title]) => ({ n: String(n).padStart(2, '0'), tags: tags.split(' '), title }));
    const more = $('#more');
    const STEP = 14; // múltiplo de 7: cada bloque de 7 fotos (una doble) llena filas completas
    let filter = 'todos', shown = STEP, current = [];
    $$('.chip[data-filter]').forEach(c => {
      const f = c.dataset.filter;
      $('small', c).textContent = f === 'todos' ? works.length : works.filter(w => w.tags.includes(f)).length;
      c.addEventListener('click', () => {
        $$('.chip[data-filter]').forEach(x => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
        filter = f; shown = STEP; render();
      });
    });
    const render = () => {
      current = works.filter(w => filter === 'todos' || w.tags.includes(filter));
      gallery.innerHTML = current.slice(0, shown).map((w, i) => `
        <button class="shot" data-i="${i}" style="animation-delay:${(i % STEP) * 45}ms" aria-label="Ampliar: ${w.title}">
          <img src="assets/img/trabajos/trabajo-${w.n}-sm.jpg" alt="${w.title}" loading="lazy" decoding="async" width="520" height="693">
          <span>${T[w.tags[0]]} · ${w.title}</span>
        </button>`).join('');
      more.parentElement.hidden = shown >= current.length;
      more.textContent = `Ver más trabajos (${current.length - Math.min(shown, current.length)})`;
    };
    more.addEventListener('click', () => { shown += STEP; render(); });
    render();

    const lb = $('#lightbox'), img = $('img', lb), cap = $('.lb-cap', lb), want = $('.lb-want', lb);
    let idx = 0, last = null;
    const show = i => {
      idx = (i + current.length) % current.length;
      const w = current[idx];
      img.src = `assets/img/trabajos/trabajo-${w.n}.jpg`;
      img.alt = w.title;
      cap.textContent = `${w.title} · ${idx + 1}/${current.length}`;
      want.href = WA(`Hola Yeison, quiero un corte como este de vuestra web: «${w.title}» (foto ${w.n}). ¿Cuándo tenéis hueco?`);
    };
    const open = i => { last = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; last && last.focus(); };
    gallery.addEventListener('click', e => { const b = e.target.closest('.shot'); if (b) open(+b.dataset.i); });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); });
  }

  /* ---------- Arma tu cita ---------- */
  const builder = $('[data-builder]');
  if (builder) {
    const svcBox = $('[data-services]', builder), daysBox = $('[data-days]', builder), slotsBox = $('[data-slots]', builder);
    const t = k => $(`[data-t="${k}"]`, builder);
    svcBox.innerHTML = YB.services.map((s, i) => `
      <label class="opt"><input type="radio" name="servicio" value="${s.id}"${i === 0 ? ' checked' : ''}>
        <b>${s.name}</b><small>${s.note ? s.note + ' · ' : ''}${s.min >= 60 ? '1 h' : s.min + ' min'}</small><span class="opt-price">${s.price} €</span></label>`).join('');
    const fmt = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
    const long = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });
    const svc = () => YB.services.find(s => s.id === $('input[name=servicio]:checked', builder).value);
    const days = () => {
      const out = [], now = madrid();
      for (let i = 0; out.length < 7 && i < 30; i++) {
        const d = new Date(Date.now() + i * 864e5), dow = (now.day + i) % 7;
        const h = YB.hours[dow];
        if (!h.length) continue;
        if (i === 0 && !h.some(([, b]) => b - 30 > now.min)) continue;
        if (svc().tue && dow !== 2) continue;
        out.push({ d, dow, i });
      }
      return out;
    };
    const renderDays = () => {
      const prev = $('input[name=dia]:checked', builder)?.value;
      const list = days();
      daysBox.innerHTML = list.map(({ d, dow, i }, k) => `
        <label class="opt"><input type="radio" name="dia" value="${i}" data-dow="${dow}"${(prev ? +prev === i : k === 0) ? ' checked' : ''}>
          <small>${i === 0 ? 'hoy' : i === 1 ? 'mañana' : fmt.formatToParts(d).find(p => p.type === 'weekday').value}</small><b>${fmt.formatToParts(d).find(p => p.type === 'day').value}</b><small>${fmt.formatToParts(d).find(p => p.type === 'month').value}</small></label>`).join('');
      if (!$('input[name=dia]:checked', builder) && $('input[name=dia]', builder)) $('input[name=dia]', builder).checked = true;
      renderSlots();
    };
    const renderSlots = () => {
      const day = $('input[name=dia]:checked', builder);
      if (!day) { slotsBox.innerHTML = ''; return; }
      const dow = +day.dataset.dow, now = madrid(), today = +day.value === 0;
      const prev = $('input[name=franja]:checked', builder)?.value;
      const slots = YB.hours[dow].map(([a, b], k) => ({ v: k === 0 ? 'por la mañana' : 'por la tarde', label: `${k === 0 ? 'Mañana' : 'Tarde'} · ${hhmm(a)}–${hhmm(b)}`, off: today && b - 30 <= now.min }));
      const first = slots.findIndex(s => !s.off);
      slotsBox.innerHTML = slots.map((s, k) => `<label class="opt"><input type="radio" name="franja" value="${s.v}"${s.off ? ' disabled' : ''}${(prev === s.v && !s.off) || (!slots.some(x => x.v === prev && !x.off) && k === first) ? ' checked' : ''}><b>${s.label}</b></label>`).join('');
      update();
    };
    let lastPrice = 0;
    const update = () => {
      const s = svc();
      const barber = $('input[name=barbero]:checked', builder).value;
      const day = $('input[name=dia]:checked', builder);
      const slot = $('input[name=franja]:checked', builder)?.value || '';
      const date = day ? new Date(Date.now() + +day.value * 864e5) : null;
      const when = date ? `${+day.value === 0 ? 'hoy' : +day.value === 1 ? 'mañana' : 'el ' + long.format(date)}${slot ? ' ' + slot : ''}` : '';
      t('service').textContent = s.name;
      t('barber').textContent = barber || 'El primero libre';
      t('when').textContent = when ? when.charAt(0).toUpperCase() + when.slice(1) : 'Elige día';
      t('dur').textContent = s.min >= 60 ? '1 h' : `${s.min} min`;
      const price = t('price');
      price.textContent = `${s.price} €`;
      if (s.price !== lastPrice && !reduce) { price.classList.remove('bump'); void price.offsetWidth; price.classList.add('bump'); setTimeout(() => price.classList.remove('bump'), 300); }
      lastPrice = s.price;
      t('wa').href = WA(`Hola Yeison, quería pedir cita en la barbería: ${s.name} (${s.price} €)${barber ? ' con ' + barber : ''}${when ? ', ' + when : ''}. ¿Tenéis hueco?`);
    };
    builder.addEventListener('change', e => {
      if (e.target.name === 'servicio') renderDays();
      else if (e.target.name === 'dia') renderSlots();
      else update();
    });
    renderDays();
  }

  /* ---------- Lo que dicen de cada barbero ---------- */
  $$('[data-said]').forEach(box => {
    const list = YB.reviews.filter(r => r.b === box.dataset.said && r.t.length > 40).slice(0, 8);
    box.innerHTML = list.map((r, i) => `<blockquote class="${i ? '' : 'is-on'}"><p>«${r.t}»</p><cite><b>${r.a}</b> · ${r.s} · ${r.d}</cite></blockquote>`).join('');
    const qs = $$('blockquote', box);
    let i = 0;
    if (!reduce && qs.length > 1) setInterval(() => { qs[i].classList.remove('is-on'); i = (i + 1) % qs.length; qs[i].classList.add('is-on'); }, 5500);
  });

  /* ---------- Página de opiniones ---------- */
  const grid = $('[data-reviews]');
  if (grid) {
    const svcSel = $('[data-svc]'), moreBtn = $('[data-more-reviews]');
    [...new Set(YB.reviews.map(r => r.s))].sort().forEach(s => svcSel.add(new Option(s, s)));
    const THEMES = [['Trato', /trato|aten(c|t)|amable|majo|cercan|simp/i], ['Profesionales', /profesional/i], ['Perfecto', /perfect/i], ['De 10', /\b10\b|10\/10|diez|11\/10/i], ['Ambiente', /ambiente|casa|risas|agradable/i], ['Repetiré', /volver|repetir|repito|vuelvo|no será la última/i], ['Recomendable', /recomend|recomiendo/i]];
    $('[data-themes]').innerHTML = THEMES.map(([name, re]) => [name, YB.reviews.filter(r => re.test(r.t)).length]).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1])
      .map(([name, n]) => `<span class="theme">${name} <b>${n}</b></span>`).join('');
    let who = '', svcF = '', shown = 12;
    const initials = n => n.trim().charAt(0).toUpperCase();
    const render = () => {
      const list = YB.reviews.filter(r => (!who || r.b === who) && (!svcF || r.s === svcF));
      grid.innerHTML = list.slice(0, shown).map((r, i) => `
        <article class="rcard" style="animation-delay:${(i % 12) * 40}ms">
          <span class="stars" aria-label="5 estrellas">★★★★★</span>
          <p>${r.t}</p>
          <footer><span class="avatar" aria-hidden="true">${initials(r.a)}</span><span><b>${r.a}</b><small>${r.s} · ${r.d}</small></span>${r.b ? `<span class="with">con ${r.b}</span>` : ''}</footer>
        </article>`).join('') || '<p>No hay opiniones con ese filtro.</p>';
      moreBtn.parentElement.hidden = shown >= list.length;
    };
    $$('[data-who]').forEach(c => c.addEventListener('click', () => {
      $$('[data-who]').forEach(x => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
      who = c.dataset.who; shown = 12; render();
    }));
    svcSel.addEventListener('change', () => { svcF = svcSel.value; shown = 12; render(); });
    moreBtn.addEventListener('click', () => { shown += 12; render(); });
    render();
  }

  /* ---------- Formulario que abre WhatsApp ---------- */
  const form = $('[data-msg]');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const txt = `Hola, soy ${f.get('nombre').trim()}. ${f.get('motivo')}.${f.get('mensaje').trim() ? ' ' + f.get('mensaje').trim() : ''}`;
    window.open(WA(txt), '_blank', 'noopener');
  });

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
