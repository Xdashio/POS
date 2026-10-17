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

    await desktop.getByRole('button', { name: 'Products', exact: true }).click();
    const productRow = desktop.locator('.tab-tbl tbody tr').filter({ hasText: 'Hennessy VS' });
    await productRow.getByRole('button', { name: 'Edit' }).click();
    await desktop.locator('#product-price').fill('7600');
    await desktop.locator('#product-buy-price').fill('4000');
    await desktop.locator('#product-reorder-level').fill('2');
    await desktop.locator('#product-supplier').selectOption({ label: 'UDV Kenya (Diageo)' });
    assert.match(await desktop.locator('#product-margin').innerText(), /47\.4% gross margin/, 'Margin should update live from retail and buy price');
    await desktop.getByRole('button', { name: 'Save product' }).click();
    const edited = await desktop.evaluate(() => {
      const product = state.products.find(item => item.n === 'Hennessy VS');
      const change = state.priceChanges[state.priceChanges.length - 1];
      return { price: product.b, reorderLevel: product.reorderLevel, supplier: product.preferredSupplier, change: { oldPrice: change.oldPrice, newPrice: change.newPrice, user: change.user, at: change.at instanceof Date } };
    });
    assert.equal(edited.price, 7600, 'Edited price should be saved');
    assert.equal(edited.reorderLevel, 2, 'Edited reorder level should be saved');
    assert.equal(edited.supplier, 'UDV Kenya (Diageo)', 'Preferred supplier should be saved');
    assert.deepEqual(edited.change, { oldPrice: 7500, newPrice: 7600, user: 'Cashier 1', at: true }, 'Price log should retain actor, timestamp, and old/new price');
    assert.match(await desktop.locator('.price-log').innerText(), /KES 7,500 → KES 7,600 bottle/);
    await desktop.getByRole('button', { name: 'Sell', exact: true }).click();
    const editedCard = desktop.locator('.pt').filter({ hasText: 'Hennessy VS' });
    assert.match(await editedCard.innerText(), /KES 7,600/, 'Checkout product card should use the edited price immediately');
    await editedCard.click();
    assert.match(await desktop.locator('.cart .ln').filter({ hasText: 'Hennessy VS' }).innerText(), /KES 7,600/, 'Checkout cart should use the edited price immediately');
    await desktop.getByRole('button', { name: 'Clear' }).click();

    await desktop.getByRole('button', { name: 'Products', exact: true }).click();
    await desktop.getByRole('button', { name: 'Add product', exact: true }).click();
    await desktop.locator('#product-name').fill('E2E Sparkling Test');
    await desktop.locator('#product-size').fill('330ml');
    await desktop.locator('#product-price').fill('999');
    await desktop.locator('#product-buy-price').fill('500');
    await desktop.getByRole('button', { name: 'Add product', exact: true }).last().click();
    assert.equal(await desktop.evaluate(() => state.products.some(item => item.n === 'E2E Sparkling Test')), true, 'Add product should append a catalog item');
    await desktop.getByRole('button', { name: 'Sell', exact: true }).click();
    const addedCard = desktop.locator('.pt').filter({ hasText: 'E2E Sparkling Test' });
    assert.match(await addedCard.innerText(), /KES 999/, 'Added product should be available in checkout');
    console.log('✓ Product editing updates live margin, checkout price, and audit log; new product appears in checkout.');
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 360, height: 900 } });
    await runCheckout(mobile, 360);
    console.log('✓ 360px checkout completed through the bottom cart bar.');
    await mobile.close();

    const tillPage = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await tillPage.goto(`file://${path.resolve(__dirname, '../prototype/index.html')}`, { waitUntil: 'domcontentloaded' });
    const mpesaSale = await tillPage.evaluate(() => state.products.find(product => product.n === 'Tusker Lager').b);
    await tillPage.getByRole('button', { name: 'Age verified' }).click();
    await tillPage.locator('.pt').filter({ hasText: 'Tusker Lager' }).click();
    await tillPage.getByRole('button', { name: /Charge KES/ }).click();
    await tillPage.getByRole('button', { name: /M-Pesa/ }).click();
    await tillPage.getByRole('button', { name: 'Send STK push' }).click();
    await tillPage.getByText('Payment received', { exact: true }).waitFor();
    await tillPage.getByRole('button', { name: 'Complete sale' }).click();
    await tillPage.getByRole('button', { name: 'New sale' }).click();

    await tillPage.getByRole('button', { name: 'Till', exact: true }).click();
    await tillPage.getByRole('button', { name: 'Close till', exact: true }).click();
    await tillPage.locator('[aria-label="KES 1000 count"]').fill('5');
    await tillPage.locator('#mpesa-received').fill(String(mpesaSale - 50));
    await tillPage.locator('#variance-reason').fill('M-Pesa short in shift close test');
    await tillPage.locator('#owner-pin').fill('1234');
    await tillPage.getByRole('button', { name: 'Close till & sign off' }).click();
    await tillPage.getByText('Shift closed', { exact: true }).waitFor();
    const closedShift = await tillPage.evaluate(() => state.shiftHistory.at(-1));
    assert.equal(closedShift.cashExpected, 5000, 'Expected cash should start with the opening float and cash sales');
    assert.equal(closedShift.cashCounted, 5000, 'Denomination count should total the cash received');
    assert.equal(closedShift.mpesaExpected, mpesaSale, 'Expected M-Pesa should include completed M-Pesa sales');
    assert.equal(closedShift.mpesaReceived, mpesaSale - 50, 'Close flow should record M-Pesa received');
    assert.equal(closedShift.totalVariance, -50, 'Shift summary should calculate the combined variance');
    assert.equal(closedShift.reason, 'M-Pesa short in shift close test', 'Shift close should retain the variance reason');
    assert.equal(closedShift.ownerSignedOff, true, 'Owner PIN should sign off the close');
    assert.match(await tillPage.locator('.paper').innerText(), /SHIFT SUMMARY/);
    await tillPage.getByRole('button', { name: 'Done', exact: true }).click();

    await tillPage.getByRole('button', { name: 'Reports', exact: true }).click();
    assert.match(await tillPage.locator('.dash').innerText(), /M-Pesa short in shift close test/, 'Dashboard should show the latest shift variance reason');
    await tillPage.getByRole('button', { name: 'Sell', exact: true }).click();
    await tillPage.locator('.pt').filter({ hasText: 'Tusker Lager' }).click();
    await tillPage.getByRole('button', { name: 'Age verified' }).click();
    const closedCharge = tillPage.getByRole('button', { name: 'Till closed', exact: true });
    assert.equal(await closedCharge.isDisabled(), true, 'Charge must remain disabled while the till is closed');
    assert.deepEqual(await tillPage.evaluate(() => ({ charge: charge(), finish: finish() })), { charge: false, finish: false }, 'Checkout actions must reject a closed till');
    await tillPage.getByRole('button', { name: 'Till', exact: true }).click();
    await tillPage.getByRole('button', { name: 'Open till', exact: true }).click();
    await tillPage.locator('#opening-float').fill('6000');
    await tillPage.getByRole('button', { name: 'Open shift', exact: true }).click();
    assert.deepEqual(await tillPage.evaluate(() => ({ status: state.till.status, float: state.till.openingFloat })), { status: 'open', float: 6000 }, 'Reopened till should record its opening float');
    console.log('✓ Till close reconciles denomination cash and M-Pesa, requires variance reason and owner sign-off, shows a shift receipt, updates Reports, blocks closed-till sales, and reopens with a float.');
    await tillPage.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error('E2E test failed:', error); process.exit(1); });
