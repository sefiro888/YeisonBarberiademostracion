// Genera las páginas de la raíz a partir de src/pages/*.html con la plantilla común.
// Uso: node scripts/build.mjs
// Cada página empieza con un comentario JSON: <!-- {"title": "...", "desc": "...", "nav": "servicios"} -->
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKSY = 'https://booksy.com/es-es/69152_yeisonbarbershop_barberia_60431_a-fraga';
const WA = 'https://wa.me/34617781215?text=Hola%20Yeison%2C%20quer%C3%ADa%20pedir%20cita';
const v = Date.now().toString(36);
const SITE = 'https://sefiro888.github.io/YeisonBarberiademostracion/';

export const icons = {
  wa: '<svg class="i-wa" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 6.9L3 29l6.5-1.9c2 1.1 4.2 1.6 6.5 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3Zm0 23.4c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-3.9 1.1 1.1-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.8C5 10 9.9 5.3 16 5.3S27 10 27 15.8s-4.9 10.6-11 10.6Zm6-7.9c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2l-1 1.3c-.2.2-.4.2-.7.1a9 9 0 0 1-4.5-3.9c-.3-.6.3-.5 1-1.8.1-.2 0-.4 0-.6l-1-2.5c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2 2.2.9 3 1 4.1.8.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4Z"/></svg>',
  ig: '<svg class="i-ig" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" class="dot"/></svg>',
  arrow: '<svg class="i-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6"/></svg>',
  phone: '<svg class="i-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5 9 3l1.6 4.2-2 1.4a11 11 0 0 0 6.8 6.8l1.4-2L21 15l-.5 2.4a2.5 2.5 0 0 1-2.6 2A16 16 0 0 1 4.6 6.1a2.5 2.5 0 0 1 2-2.6Z"/></svg>',
  pin: '<svg class="i-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  scissors: '<svg class="i-line" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.2 15.8 19 4M15.8 15.8 5 4"/></svg>',
  clock: '<svg class="i-line" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  g: '<svg class="i-g" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.4-.2-2.1H12v4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9Z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7H2.2a11 11 0 0 0 0 10l3.6-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4Z"/></svg>'
};

// Remate caligráfico, como los trazos que rodean "Barber" en el logo
export const swash = (cls = '') => `<svg class="swash ${cls}" viewBox="0 0 320 28" aria-hidden="true"><path class="sw-l" d="M150 14C118 2 72 26 38 14 24 9 12 10 2 16"/><path class="sw-r" d="M170 14c32-12 78 12 112 0 14-5 26-4 36 2"/><path class="sw-d" d="m160 6 8 8-8 8-8-8z"/></svg>`;

const NAV = [
  ['servicios', 'servicios.html', 'Servicios'],
  ['trabajos', 'trabajos.html', 'Trabajos'],
  ['equipo', 'equipo.html', 'Equipo'],
  ['opiniones', 'opiniones.html', 'Opiniones'],
  ['local', 'el-local.html', 'El local'],
  ['contacto', 'contacto.html', 'Contacto']
];

const layout = (meta, body, file) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}">
<meta name="theme-color" content="#0c0907">
<link rel="icon" type="image/png" sizes="48x48" href="assets/img/marca/favicon-48.png">
<link rel="apple-touch-icon" href="assets/img/marca/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Yeison Barber Shop">
<meta property="og:title" content="${meta.ogTitle || meta.title}">
<meta property="og:description" content="${meta.ogDesc || meta.desc}">
<meta property="og:url" content="${SITE}${file === 'index.html' ? '' : file}">
<link rel="canonical" href="${SITE}${file === 'index.html' ? '' : file}">
<meta property="og:image" content="${SITE}assets/img/og-yeison.jpg">
<meta property="og:image:secure_url" content="${SITE}assets/img/og-yeison.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="Sello de Yeison Barber Shop con valoración 5,0, servicios y dirección en Fene">
<meta name="twitter:image" content="${SITE}assets/img/og-yeison.jpg">
<meta name="twitter:title" content="${meta.ogTitle || meta.title}">
<meta name="twitter:description" content="${meta.ogDesc || meta.desc}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="assets/fonts/bodoni-moda-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css?v=${v}">
<link rel="stylesheet" href="assets/css/fx.css?v=${v}">
<script>(function(d){d.classList.add('js');var t;try{var q=new URLSearchParams(location.search).get('tema');if(q==='negro'||q==='crema')localStorage.setItem('yb-tema',q);t=localStorage.getItem('yb-tema');if(sessionStorage.getItem('yb-nav'))d.classList.add('is-entering')}catch(e){}if(t!=='crema')d.setAttribute('data-theme','negro');try{if(!sessionStorage.getItem('yb-intro')&&!sessionStorage.getItem('yb-nav')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('show-intro')}catch(e){}})(document.documentElement)</script>
${meta.ld ? `<script type="application/ld+json">${meta.ld}</script>` : ''}
</head>
<body class="page-${meta.nav}">
<a class="skip" href="#contenido">Saltar al contenido</a>
<div class="intro" aria-hidden="true">
  <div class="intro-half intro-top"></div><div class="intro-half intro-bottom"></div>
  <div class="intro-core">
    <div class="intro-seal"><img src="assets/img/marca/logo-negro.png" alt="" width="640" height="640"></div>
    <p class="intro-name">Yeison Barber Shop</p>
    <p class="intro-neon">OPEN</p>
    <div class="intro-tube"><span></span></div>
    <p class="intro-skip">Toca para entrar</p>
  </div>
</div>
<div class="toasts" aria-live="polite"></div>
<div class="veil" aria-hidden="true"><div class="veil-pole"></div><img src="assets/img/marca/logo-sm.png" alt="" width="420" height="365"></div>
<div class="pole-progress" aria-hidden="true"><span></span></div>

<header class="site-header">
  <div class="wrap header-in">
    <a class="brand" href="index.html" aria-label="Yeison Barber Shop, inicio">
      <img src="assets/img/marca/logo-sm.png" width="420" height="365" alt="">
    </a>
    <nav class="nav" id="nav" aria-label="Principal">
      <a href="index.html" class="nav-home"${meta.nav === 'inicio' ? ' aria-current="page"' : ''}>Inicio</a>
${NAV.map(([k, href, label]) => `      <a href="${href}"${meta.nav === k ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}
      <div class="nav-extra">
        <a class="btn btn-red" href="${BOOKSY}" target="_blank" rel="noopener">Reservar en Booksy ${icons.arrow}</a>
        <p><a href="tel:+34617781215">617 781 215</a> · Av. Marqués de Figueroa, 15 · Fene</p>
      </div>
    </nav>
    <span class="status status-head" data-status><i></i><span>Consultando horario…</span></span>
    <a class="btn btn-red btn-sm header-cta" href="${BOOKSY}" target="_blank" rel="noopener">Reservar</a>
    <button class="menu-btn" aria-controls="nav" aria-expanded="false" aria-label="Abrir menú"><span></span><span></span><span></span></button>
  </div>
</header>

<main id="contenido">
${body}
</main>

<footer class="site-footer">
  <div class="footer-pole" aria-hidden="true"></div>
  <div class="wrap footer-top">
    <div class="lamp footer-lamp" aria-hidden="true"><span class="lamp-mount"></span><span class="lamp-cap lamp-top"></span><span class="lamp-glass"></span><span class="lamp-cap lamp-bottom"></span></div>
    <a class="footer-logo" href="index.html" aria-label="Inicio"><img src="assets/img/marca/logo-sm.png" width="420" height="365" alt="Yeison Barber Shop"></a>
    <p class="footer-claim">Cortes con oficio,<br><span class="script">trato de casa.</span></p>
    <div class="footer-cta">
      <a class="btn btn-red" href="${BOOKSY}" target="_blank" rel="noopener">Reservar cita ${icons.arrow}</a>
      <a class="btn btn-wa" href="${WA}" target="_blank" rel="noopener">${icons.wa} WhatsApp</a>
    </div>
  </div>
  <div class="wrap footer-cols">
    <div>
      <h2>Visítanos</h2>
      <p>Av. Marqués de Figueroa, 15, bajo izq.<br>15500 Fene, A Coruña</p>
      <p><a href="tel:+34617781215">617 781 215</a></p>
    </div>
    <div>
      <h2>Horario</h2>
      <p>Martes a viernes<br>9:30–13:30 · 16:30–20:30</p>
      <p>Sábado 9:00–14:00<br>Domingo y lunes, cerrado</p>
      <p class="status" data-status><i></i><span>…</span></p>
    </div>
    <div>
      <h2>La barbería</h2>
      <p class="footer-links">${[['index.html', 'Inicio'], ...NAV.map(([, h, l]) => [h, l])].map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</p>
    </div>
    <div>
      <h2>Síguenos</h2>
      <p class="socials">
        <a class="soc soc-ig" href="https://www.instagram.com/yeisonbarbershop01/" target="_blank" rel="noopener" aria-label="Instagram">${icons.ig}</a>
        <a class="soc soc-wa" href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${icons.wa}</a>
        <a class="soc soc-bk" href="${BOOKSY}" target="_blank" rel="noopener" aria-label="Booksy">b</a>
      </p>
      <p class="footer-rating"><b>5,0</b> ★★★★★<br>229 reseñas en Booksy</p>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© <span data-year>2026</span> Yeison Barber Shop · Barbería en Fene</p>
    <a href="#contenido" class="to-top">Volver arriba ↑</a>
  </div>
</footer>

<div class="theme-switch" role="group" aria-label="Color de la web">
  <span class="theme-switch-label">Estilo</span>
  <button type="button" data-theme-set="negro" aria-pressed="true"><i class="sw-negro" aria-hidden="true"></i>Negro</button>
  <button type="button" data-theme-set="crema" aria-pressed="false"><i class="sw-crema" aria-hidden="true"></i>Crema</button>
</div>

<nav class="dock" aria-label="Acciones rápidas">
  <a href="tel:+34617781215">${icons.phone}<span>Llamar</span></a>
  <a href="${WA}" target="_blank" rel="noopener" class="dock-wa">${icons.wa}<span>WhatsApp</span></a>
  <a href="${BOOKSY}" target="_blank" rel="noopener" class="dock-main">Reservar cita</a>
</nav>

<script src="assets/js/data.js?v=${v}" defer></script>
<script src="assets/js/lenis.min.js" defer></script>
<script src="assets/js/main.js?v=${v}" defer></script>
<script src="assets/js/fx.js?v=${v}" defer></script>
</body>
</html>
`;

// Sustituciones disponibles dentro de las páginas
const tokens = {
  '{{BOOKSY}}': BOOKSY,
  '{{WA}}': WA,
  '{{wa}}': icons.wa,
  '{{ig}}': icons.ig,
  '{{arrow}}': icons.arrow,
  '{{phone}}': icons.phone,
  '{{pin}}': icons.pin,
  '{{clock}}': icons.clock,
  '{{scissors}}': icons.scissors,
  '{{g}}': icons.g,
  '{{swash}}': swash(),
  '{{swash-light}}': swash('swash-light')
};

const dir = path.join(root, 'src/pages');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  let src = fs.readFileSync(path.join(dir, f), 'utf8');
  const m = src.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) throw new Error(`${f}: falta el comentario JSON de cabecera`);
  const meta = JSON.parse(m[1]);
  src = src.slice(m[0].length);
  for (const [k, val] of Object.entries(tokens)) src = src.split(k).join(val);
  fs.writeFileSync(path.join(root, f), layout(meta, src.trim(), f));
  console.log('✓', f);
}
