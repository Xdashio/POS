#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright'];
  const installs = path.join(os.homedir(), '.local', 'share', 'mise', 'installs', 'npm-playwright');
  if (fs.existsSync(installs)) {
    for (const version of fs.readdirSync(installs)) {
      const misePackages = path.join(installs, version, 'node_modules', '.mise');
      if (!fs.existsSync(misePackages)) continue;
      for (const packageDir of fs.readdirSync(misePackages)) {
        if (packageDir.startsWith('playwright@')) candidates.push(path.join(misePackages, packageDir, 'node_modules', 'playwright'));
      }
    }
  }
  for (const candidate of candidates.filter(Boolean)) {
    try { return require(candidate); } catch (_) { /* try next installation */ }
  }
  throw new Error('Playwright not found. Set PLAYWRIGHT_MODULE to its module path.');
}

function chromiumPath() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const root = path.join(os.homedir(), '.cache', 'ms-playwright');
  if (!fs.existsSync(root)) return undefined;
  const dirs = fs.readdirSync(root).filter(name => /^chromium-\d+$/.test(name)).sort().reverse();
  for (const dir of dirs) {
    const candidates = [
      path.join(root, dir, 'chrome-linux64', 'chrome'),
      path.join(root, dir, 'chrome-linux', 'chrome')
    ];
    const found = candidates.find(file => fs.existsSync(file));
    if (found) return found;
  }
  return undefined;
}

function parseArgs(argv) {
  const values = { screens: 'overview,receive,take,adjust,history', widths: '360,768,1366', themes: 'light,dark', out: 'screenshots/stock' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: node tests/capture.cjs [--screens overview,history] [--widths 360,768,1366] [--themes light,dark] [--out screenshots/stock]');
      process.exit(0);
    }
    const match = arg.match(/^--(screens|widths|themes|out)=(.*)$/);
    if (match) values[match[1]] = match[2];
    else if (/^--(screens|widths|themes|out)$/.test(arg)) values[arg.slice(2)] = argv[++i];
    else throw new Error(`Unknown option: ${arg}`);
  }
  const list = key => values[key].split(',').map(value => value.trim()).filter(Boolean);
  const screens = list('screens'), themes = list('themes'), widths = list('widths').map(Number);
  const validScreens = new Set(['overview', 'receive', 'take', 'adjust', 'history']);
  if (!screens.length || screens.some(screen => !validScreens.has(screen))) throw new Error('Screens must be overview, receive, take, adjust, or history.');
  if (!widths.length || widths.some(width => !Number.isInteger(width) || width < 1)) throw new Error('Widths must be positive integers.');
  if (!themes.length || themes.some(theme => !['light', 'dark'].includes(theme))) throw new Error('Themes must be light or dark.');
  return { screens, widths, themes, out: path.resolve(values.out) };
}

(async () => {
  const { chromium } = loadPlaywright();
  const options = parseArgs(process.argv.slice(2));
  const prototype = path.resolve(__dirname, '../prototype/index.html');
  fs.mkdirSync(options.out, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(), args: ['--no-sandbox'] });
  const labels = { overview: 'Overview', receive: 'Receive Goods', take: 'Stock Take', adjust: 'Adjustments', history: 'History' };
  let count = 0;
  try {
    for (const width of options.widths) for (const theme of options.themes) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await page.goto(`file://${prototype}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      await page.locator('#login-pin').fill('1234');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Stock', exact: true }).click();
      for (const screen of options.screens) {
        if (screen !== 'overview') {
          const label = labels[screen];
          await page.getByRole('button', { name: new RegExp(`^${label}(?:$| \\()`) }).click();
        }
        const file = path.join(options.out, `${width}-${theme}-${screen}.png`);
        await page.screenshot({ path: file });
        count++;
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`Captured ${count} Stock screenshots in ${options.out}`);
})().catch(error => { console.error(error); process.exit(1); });
