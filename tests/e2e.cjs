#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

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
  for (const dir of fs.readdirSync(root).filter(name => /^chromium-\d+$/.test(name)).sort().reverse()) {
    for (const file of [path.join(root, dir, 'chrome-linux64', 'chrome'), path.join(root, dir, 'chrome-linux', 'chrome')]) {
      if (fs.existsSync(file)) return file;
    }
  }
  return undefined;
}

async function runCheckout(page, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`file://${path.resolve(__dirname, '../prototype/index.html')}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Age verified' }).click();

  if (width === 1366) {
    const chips = page.locator('.prod .chips button');
    const tops = await chips.evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().top));
    assert.equal(new Set(tops.map(top => Math.round(top))).size, 1, 'Sell category chips should fit on one row at 1366px');
  }

  const before = await page.evaluate(() => ({ beer: getProductBaseUnits(0), spirit: getProductBaseUnits(3) }));
  await page.locator('.pt').filter({ hasText: 'Tusker Lager' }).click();
  await page.locator('.pt').filter({ hasText: 'Johnnie Walker Black' }).click();
  if (width < 1000) {
    const cartBar = page.locator('.cbar');
    await cartBar.waitFor({ state: 'visible' });
    assert.match(await cartBar.innerText(), /View sale/, 'Mobile checkout should use the bottom cart bar');
    await cartBar.click({ position: { x: 20, y: 8 } });
  }
  const spiritLine = page.locator('.cart .ln').filter({ hasText: 'Johnnie Walker Black' });
  await spiritLine.getByRole('button', { name: 'Tot', exact: true }).click();

  await page.getByRole('button', { name: /Charge KES/ }).click();
  await page.getByRole('button', { name: 'Complete sale' }).click();
  await page.getByText('Sale complete', { exact: true }).waitFor();
  const sale = await page.evaluate(() => ({
    beer: getProductBaseUnits(0),
    spirit: getProductBaseUnits(3),
    method: state.receipt.m,
    units: state.receipt.lines.map(line => line.u)
  }));
  assert.equal(sale.method, 'cash', `${width}px checkout should use cash`);
  assert.deepEqual([...sale.units].sort(), ['b', 't'], 'Checkout should contain one bottle and one tot');
  assert.equal(sale.beer, before.beer - 1, `${width}px checkout should deduct one bottle`);
  assert.equal(sale.spirit, before.spirit - 1, `${width}px checkout should deduct one tot`);
  await page.getByRole('button', { name: 'New sale' }).click();
}

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(), args: ['--no-sandbox'] });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await runCheckout(desktop, 1366);
    await desktop.getByRole('button', { name: 'Stock', exact: true }).click();

    const before = await desktop.evaluate(() => ({
      stock: state.products.find(product => product.n === 'Hennessy VS').st,
      pack: state.products.find(product => product.n === 'Hennessy VS').k,
      low: state.products.filter(isLowStock).length
    }));
    assert.ok(before.low >= 3 && before.low <= 4, `Seeded demo should show about 3 to 4 low-stock products, got ${before.low}`);
    await desktop.getByRole('button', { name: 'Receive Goods', exact: true }).click();
    const receiveRow = desktop.locator('.tab-tbl tbody tr').first();
    await receiveRow.locator('select').first().selectOption('12');
    await receiveRow.locator('input[type="number"]').first().fill('2');
    await desktop.getByRole('button', { name: 'Confirm & Receive Goods' }).click();
    const after = await desktop.evaluate(() => ({
      stock: state.products.find(product => product.n === 'Hennessy VS').st,
      low: state.products.filter(isLowStock).length
    }));
    assert.equal(after.stock, before.stock + before.pack * 2, 'Receiving two cartons should add two pack sizes on hand');
    assert.equal(after.low, before.low - 1, 'Receiving two cartons should clear one item from low stock');
    console.log(`✓ Desktop checkout and stock receipt passed (${before.low} → ${after.low} low-stock items).`);
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 360, height: 900 } });
    await runCheckout(mobile, 360);
    console.log('✓ 360px checkout completed through the bottom cart bar.');
    await mobile.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error('E2E test failed:', error); process.exit(1); });
