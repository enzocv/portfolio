// Renderiza cada cv/out/*.html a PDF (texto real, fuente TrueType) y lo copia a /public,
// desde donde el portfolio lo ofrece para descargar.
// Requiere Playwright con Chromium (CommonJS porque el repo es "type": "module"): `node cv/pdf.cjs`
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'out');
const PUBLIC = path.join(__dirname, '..', 'public');

(async () => {
  const pages = fs.readdirSync(OUT).filter((f) => f.endsWith('.html'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const file of pages) {
    const pdf = file.replace(/\.html$/, '.pdf');
    await page.goto('file://' + path.join(OUT, file), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(OUT, pdf), format: 'A4', printBackground: true, preferCSSPageSize: true });
    fs.copyFileSync(path.join(OUT, pdf), path.join(PUBLIC, pdf));
    console.log(`ok ${pdf} → public/${pdf}`);
  }
  await browser.close();
})();
