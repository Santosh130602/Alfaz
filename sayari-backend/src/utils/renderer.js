'use strict';

const puppeteer  = require('puppeteer');
const { uploadFile } = require('../config/drive');
const { Errors } = require('../utils/appError');

// ─────────────────────────────────────────────
//  BROWSER POOL (singleton)
//  One browser instance, creates pages per job
// ─────────────────────────────────────────────

let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.connected) return browserInstance;

  browserInstance = await puppeteer.launch({
    headless       : 'new',
    executablePath : process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',     // critical for Docker
      '--disable-gpu',
      '--disable-web-security',      // allow loading Drive URLs cross-origin
      '--font-render-hinting=none',  // crisper text rendering
    ],
  });

  browserInstance.on('disconnected', () => {
    console.warn('[Renderer] Browser disconnected — will relaunch on next render');
    browserInstance = null;
  });

  console.log('[Renderer] Chromium launched');
  return browserInstance;
}

// ─────────────────────────────────────────────
//  HTML TEMPLATE
//  We inject the Fabric.js canvas state into
//  a blank page and let Fabric render it, then
//  screenshot at the exact canvas dimensions
// ─────────────────────────────────────────────

function buildHtml(fabricJson, width, height, backgroundImageUrl) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
  canvas { display: block; }
</style>
<!-- Google Fonts for Urdu/Hindi support -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Jameel+Noori+Nastaleeq&family=Amiri:ital,wght@0,400;0,700;1,400&family=Rajdhani:wght@400;600;700&family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet">
</head>
<body>
<canvas id="c" width="${width}" height="${height}"></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<script>
  window.__renderDone = false;
  window.__renderError = null;

  async function render() {
    try {
      const canvas = new fabric.Canvas('c', {
        width : ${width},
        height: ${height},
        enableRetinaScaling: false,
      });

      // Load the Fabric.js JSON state
      const fabricJson = ${JSON.stringify(fabricJson)};

      await new Promise((resolve, reject) => {
        canvas.loadFromJSON(fabricJson, () => {
          canvas.renderAll();
          resolve();
        });
      });

      // Give fonts a moment to render
      await new Promise(r => setTimeout(r, 800));
      canvas.renderAll();

      window.__renderDone = true;
    } catch(e) {
      window.__renderError = e.message;
    }
  }

  // Wait for fonts to load then render
  document.fonts.ready.then(render);
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  MAIN RENDER FUNCTION
//  Takes canvasState, renders to PNG, uploads to Drive
// ─────────────────────────────────────────────

/**
 * @param {object} canvasState   - From Post.canvasState (contains fabricJson, dimensions)
 * @param {string} postId        - Used for filename
 * @returns {object}             - { driveId, url, thumbnail, width, height, sizeBytes }
 */
async function renderCanvasToImage(canvasState, postId) {
  const {
    fabricJson,
    canvasWidth  = 1080,
    canvasHeight = 1080,
    backgroundImage,
  } = canvasState;

  if (!fabricJson) throw Errors.badRequest('Canvas state has no fabricJson to render', 'CANVAS_EMPTY');

  const browser = await getBrowser();
  const page    = await browser.newPage();

  try {
    // Set viewport exactly to canvas size (critical for correct screenshot)
    await page.setViewport({ width: canvasWidth, height: canvasHeight, deviceScaleFactor: 1 });

    const html = buildHtml(fabricJson, canvasWidth, canvasHeight, backgroundImage?.url);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for render to complete (fabric signals via window.__renderDone)
    await page.waitForFunction('window.__renderDone === true || window.__renderError !== null', { timeout: 15000 });

    const renderError = await page.evaluate(() => window.__renderError);
    if (renderError) throw Errors.internal(`Canvas render failed: ${renderError}`, 'RENDER_FAILED');

    // Screenshot the canvas element only
    const canvasEl  = await page.$('canvas#c');
    const imageBuffer = await canvasEl.screenshot({ type: 'png', omitBackground: false });

    // Upload to Google Drive
    const filename = `post_${postId}_${Date.now()}.png`;
    const driveResult = await uploadFile(imageBuffer, filename, 'image/png', 'posts');

    return {
      ...driveResult,
      width : canvasWidth,
      height: canvasHeight,
      renderedAt: new Date(),
    };

  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
//  RENDER COVER IMAGE (for audio posts / series)
//  Same pipeline but uploaded to 'covers' folder
// ─────────────────────────────────────────────

async function renderCoverToImage(canvasState, entityId) {
  const result = await renderCanvasToImage(canvasState, `cover_${entityId}`);
  return result;
}

// ─────────────────────────────────────────────
//  CLOSE BROWSER (for graceful shutdown)
// ─────────────────────────────────────────────

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

module.exports = { renderCanvasToImage, renderCoverToImage, closeBrowser, getBrowser };
