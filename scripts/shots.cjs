// Capturas de página completa de todas las páginas: node scripts/shots.cjs [carpeta]  (playwright global + servidor en 5181)
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const out = process.argv[2] || '.';
const only = process.argv[3];
const pages = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.html') && (!only || f.startsWith(only)));
(async () => {
  const browser = await chromium.launch();
  for (const file of pages) for (const [name, vp, mobile] of [['d', { width: 1440, height: 900 }, false], ['m', { width: 390, height: 844 }, true]]) {
    const page = await browser.newPage({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    await page.addInitScript(() => { try { sessionStorage.setItem('yb-intro', '1'); sessionStorage.setItem('yb-toasts', '9'); localStorage.setItem('yb-theme-seen', '1'); } catch (e) {} });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => m.type() === 'error' && !/maps|google|ERR_/.test(m.text()) && errors.push(m.text()));
    await page.goto('http://localhost:5181/' + file + (process.env.TEMA ? '?tema=' + process.env.TEMA : ''), { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
      document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
      scrollTo(0, 0);
      document.querySelectorAll('.reveal,.split,.swash,.score-side').forEach(e => e.classList.add('is-in')); document.querySelectorAll('.razor').forEach(e => e.classList.add('is-cut'));
    });
    await page.waitForTimeout(1600);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await page.screenshot({ path: `${out}/${file.replace('.html', '')}-${name}${process.env.TEMA ? '-' + process.env.TEMA : ''}.png`, fullPage: true });
    console.log(file, name, ov ? 'DESBORDA ' + ov + 'px' : 'ok', errors.length ? errors : '');
    await page.close();
  }
  await browser.close();
})();
