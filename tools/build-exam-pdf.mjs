#!/usr/bin/env node
/* ============================================================
   build-exam-pdf.mjs
   Genera un PDF a partir de un examen HTML usando Puppeteer.

   Uso:
     node tools/build-exam-pdf.mjs <input.html> [output.pdf] [--clave]
     npm run exam -- <input.html> [output.pdf] [--clave]

   --clave abre el HTML con ?clave=1 (hoja única alumno/clave) para
   generar la versión del profesor; sin el flag sale la del alumno.

   Si omites output.pdf, se genera junto al input cambiando la
   extensión (input.html → input.pdf).

   El script:
   - Levanta un server HTTP estático efímero sobre la raíz del
     repo, porque los assets cargan con paths absolutos /tercial/*
     que un file:// no resuelve correctamente.
   - Lanza Chromium headless, abre el examen, espera a que las
     fonts y KaTeX terminen de renderear.
   - Llama page.pdf() con format Letter y los márgenes del @page.

   Puppeteer descarga su propio Chromium al instalar; no usa el
   Chrome del sistema, por lo que el render es reproducible.
   ============================================================ */

import { fileURLToPath } from 'node:url';
import { dirname, resolve as pathResolve, basename, extname, join } from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = pathResolve(__dirname, '..');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: node tools/build-exam-pdf.mjs <input.html> [output.pdf]');
  console.error('Ejemplo: node tools/build-exam-pdf.mjs examenes-pdf/examen-1-fisica.html');
  process.exit(1);
}

// --clave: genera la versión del profesor (abre el HTML con ?clave=1,
// que muestra las respuestas vía exam-clave.js). Sin el flag se genera
// la versión del alumno.
const clave = args.includes('--clave');
const fileArgs = args.filter((a) => a !== '--clave');

const inputPath = pathResolve(fileArgs[0]);
if (!existsSync(inputPath)) {
  console.error(`No existe: ${inputPath}`);
  process.exit(1);
}

const defaultSuffix = clave ? '-respuestas.pdf' : '.pdf';
const outputPath = fileArgs[1]
  ? pathResolve(fileArgs[1])
  : pathResolve(dirname(inputPath), basename(inputPath, extname(inputPath)) + defaultSuffix);

console.log('→ Input:  ' + inputPath);
console.log('→ Output: ' + outputPath);

/* ============================================================
   Static HTTP server efímero
   Mismo wrapper trick que usamos manualmente con Python:
   sirve el repo bajo /tercial/ para que los paths absolutos
   /tercial/assets/css/... resuelvan correctamente.
   ============================================================ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':  'font/ttf',
};

function startServer() {
  const server = createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath.startsWith('/tercial/')) urlPath = urlPath.slice('/tercial'.length);
    const filePath = join(REPO_ROOT, urlPath);
    if (!filePath.startsWith(REPO_ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404); res.end('Not found: ' + urlPath); return;
    }
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  });
  return new Promise((resolveP) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolveP({ server, port });
    });
  });
}

/* ============================================================
   Main
   ============================================================ */

(async () => {
  const { server, port } = await startServer();
  console.log('→ Server efímero: http://127.0.0.1:' + port);

  // Construir la URL relativa al repo root
  const relPath = inputPath.startsWith(REPO_ROOT)
    ? inputPath.slice(REPO_ROOT.length).replace(/\\/g, '/')
    : '/' + basename(inputPath);
  const url = `http://127.0.0.1:${port}/tercial${relPath}` + (clave ? '?clave=1' : '');
  console.log('→ URL: ' + url);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  // Logueo de errores de consola para debugging
  page.on('pageerror', (e) => console.error('  ⚠ page error:', e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('  ⚠ console error:', msg.text());
  });

  console.log('→ Cargando página…');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Esperar a que las fonts terminen de cargar
  await page.evaluateHandle('document.fonts.ready');

  // Esperar un poco más para que KaTeX termine de renderear el contenido
  // (KaTeX.load() es asíncrono; sin esto, page.pdf() puede dispararse
  // antes de que las fórmulas estén dibujadas).
  await new Promise((r) => setTimeout(r, 1500));

  console.log('→ Generando PDF…');
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top:    '0.85in',
      bottom: '1in',
      left:   '0.9in',
      right:  '0.9in',
    },
    // Sin headerTemplate / footerTemplate — el @page CSS del exam-print
    // ya inyecta el número de página en @bottom-right (Chromium respeta
    // ese margin box; Safari no, por eso este script existe).
  });

  await browser.close();
  server.close();

  console.log('✓ Listo: ' + outputPath);
})().catch((err) => {
  console.error('✗ Error:', err);
  process.exit(1);
});
