// tests/smoke.js - Cellar POS smoke tests (runnable with `node tests/smoke.js`)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function runSmokeTests() {
  console.log("Starting Cellar POS smoke tests...\n");

  const htmlPath = path.join(__dirname, "..", "prototype", "index.html");
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Cannot find prototype at ${htmlPath}`);
  }

  const html = fs.readFileSync(htmlPath, "utf-8");
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!scriptMatch) {
    throw new Error("No script block found in prototype/index.html");
  }

  // Set up mock browser environment
  const domElements = {};
  const mockDoc = {
    documentElement: { dataset: {} },
    getElementById: (id) => {
      if (!domElements[id]) {
        domElements[id] = {
          innerHTML: "",
          value: "",
          focus: () => {},
          setSelectionRange: () => {}
        };
      }
      return domElements[id];
    }
  };

  const context = {
    document: mockDoc,
    window: {},
    matchMedia: () => ({ matches: false }),
    setTimeout: (fn) => fn(),
    console
  };
  context.window = context;

  vm.createContext(context);
  vm.runInContext(scriptMatch[1], context);

  function getVar(name) {
    return vm.runInContext(name, context);
  }

  function callFn(name, ...args) {
    const fn = vm.runInContext(name, context);
    return fn(...args);
  }

  const state = getVar("state");
  if (state.zeroStockPolicy !== "allow") throw new Error("Zero-stock policy should default to allow and flag");

  // 1. Central State & Seeded Movements Verification
  console.log("[1/10] Verifying Central State & Seeded Stock Movements...");
  if (!state || typeof state !== "object") throw new Error("Central state is not an object");
  if (!Array.isArray(state.products) || state.products.length !== 17) {
    throw new Error(`Expected 17 products in state.products, found ${state.products?.length}`);
  }
  if (!Array.isArray(state.stockMovements) || state.stockMovements.length < 27) {
    throw new Error(`Expected at least 27 initial stock movements, found ${state.stockMovements?.length}`);
  }
  const seededTypes = new Set(state.stockMovements.map(m => m.type));
  for (const t of ["opening", "receipt", "sale", "adjustment", "take"]) {
    if (!seededTypes.has(t)) {
      throw new Error(`Seeded stock ledger is missing expected movement type: "${t}"`);
    }
  }
  if (!Array.isArray(state.suppliers) || state.suppliers.length < 2) {
    throw new Error("Expected distributor suppliers to be initialized");
  }
  if (state.view !== "sell") throw new Error(`Initial view should be "sell", got "${state.view}"`);
  console.log(`  ✓ Central state store initialized correctly with 17 SKUs and ${state.stockMovements.length} realistic movements.`);
  console.log("  ✓ Seeded movements include opening, receipt, sale, adjustment, and stock take types.");

  // 2. Base Unit per Product & Stock Derivation
  console.log("\n[2/10] Verifying Base Unit per Product & Stock Derivation...");
  const tusker = state.products.find(p => p.n === "Tusker Lager");
  const jw = state.products.find(p => p.n === "Johnnie Walker Black");

  if (!tusker || tusker.baseUnit !== "bottle" || tusker.baseUnitsPerBottle !== 1) {
    throw new Error(`Tusker should have baseUnit="bottle" and factor=1, got ${tusker?.baseUnit}`);
  }
  if (!jw || jw.baseUnit !== "tot" || jw.baseUnitsPerBottle !== 25) {
    throw new Error(`JW Black should have baseUnit="tot" and factor=25, got ${jw?.baseUnit}`);
  }

  // Verify all ledger quantities are strictly integers
  for (const m of state.stockMovements) {
    if (!Number.isInteger(m.qty)) {
      throw new Error(`Stock movement ${m.id} has non-integer quantity: ${m.qty}`);
    }
  }

  if (tusker.st !== 120) throw new Error(`Expected Tusker stock to be 120 btl, got ${tusker.st}`);
  if (jw.st !== 8) throw new Error(`Expected JW Black stock to be 8 btl, got ${jw.st}`);
  if (callFn("getProductBaseUnits", jw.id) !== 200) {
    throw new Error(`Expected JW Black base units to be 200 tots, got ${callFn("getProductBaseUnits", jw.id)}`);
  }
  console.log("  ✓ Spirits store integer tots (200 tots = 8 btl); beers store integer bottles (120 btl).");
  console.log("  ✓ Conversion to bottles applies only for display.");

  // 3. Router & Screen Renderers
  console.log("\n[3/10] Verifying Router & Every Screen Rendering...");
  const allScreens = ["sell", "stock", "products", "till", "reports", "users", "settings"];
  for (const s of allScreens) {
    callFn("go", s);
    if (state.view !== s) throw new Error(`Router failed to navigate to "${s}"`);
    const rendered = domElements["app"]?.innerHTML || "";
    if (rendered.length < 200) throw new Error(`Screen "${s}" rendered empty or unexpectedly short HTML`);
    if (rendered.includes("undefined") || rendered.includes("NaN")) {
      throw new Error(`Screen "${s}" rendered invalid undefined/NaN values`);
    }
    console.log(`  ✓ Screen "${s}" rendered cleanly (${rendered.length} bytes).`);
  }

  // Check alias "dash" routes to "reports"
  callFn("go", "dash");
  if (state.view !== "reports") throw new Error(`Alias "dash" did not map to "reports"`);
  console.log("  ✓ Router alias 'dash' -> 'reports' works.");

  // Return to sell screen for cart tests
  callFn("go", "sell");

  // 4. Switching Units in Cart
  console.log("\n[4/10] Verifying Switching Units (Bottle -> Carton -> Tot)...");
  state.cart = [];
  callFn("add", jw.id); // Add 1 bottle of JW Black
  if (state.cart.length !== 1 || state.cart[0].u !== "b" || state.cart[0].q !== 1) {
    throw new Error("Failed to add bottle to cart");
  }
  if (callFn("total") !== jw.b) throw new Error(`Total should be bottle price ${jw.b}`);

  // Switch to carton
  const switchedCtn = callFn("unit", 0, "c");
  if (!switchedCtn || state.cart[0].u !== "c") throw new Error("Failed to switch unit to carton");
  if (callFn("total") !== jw.cp) {
    throw new Error(`Total should be carton price ${jw.cp}, got ${callFn("total")}`);
  }

  // Switch to tot
  const switchedTot = callFn("unit", 0, "t");
  if (!switchedTot || state.cart[0].u !== "t") throw new Error("Failed to switch unit to tot");
  if (callFn("total") !== jw.t) {
    throw new Error(`Total should be tot price ${jw.t}, got ${callFn("total")}`);
  }

  // Unit merging: Add another JW Black (comes in as bottle), switch unit to tot -> should merge
  callFn("add", jw.id); // line 1: { u: "b", q: 1 }
  if (state.cart.length !== 2) throw new Error("Cart should have 2 lines before merge");
  callFn("unit", 1, "t"); // switch line 1 to tot -> merges into line 0
  if (state.cart.length !== 1 || state.cart[0].u !== "t" || state.cart[0].q !== 2) {
    throw new Error(`Expected merged cart line with q=2 tots, got len=${state.cart.length}, q=${state.cart[0]?.q}`);
  }
  console.log("  ✓ Successfully switched units (Bottle -> Carton -> Tot) with dynamic repricing and quantity merging.");

  // 5. Carton Sale Deducting Pack Size
  console.log("\n[5/10] Verifying Carton Sale Deducting Pack Size...");
  state.cart = [];
  const tuskerInitialBtl = tusker.st; // 120
  const tuskerPackSize = tusker.k;    // 24

  // Add 1 carton of Tusker
  callFn("add", tusker.id);
  callFn("unit", 0, "c");
  if (state.cart[0].u !== "c" || state.cart[0].q !== 1) {
    throw new Error("Tusker carton not set in cart");
  }

  state.ageVerified = true;
  callFn("charge");
  const movCountBefore = state.stockMovements.length;
  const finishOk = callFn("finish");
  if (!finishOk) throw new Error("Failed to complete carton sale");

  if (state.stockMovements.length !== movCountBefore + 1) {
    throw new Error("Stock movement was not appended for carton sale");
  }
  const lastMov = state.stockMovements[state.stockMovements.length - 1];
  if (lastMov.productId !== tusker.id || lastMov.qty !== -tuskerPackSize) {
    throw new Error(`Expected ledger deduction of -${tuskerPackSize} base units, got ${lastMov.qty}`);
  }
  if (tusker.st !== tuskerInitialBtl - tuskerPackSize) {
    throw new Error(`Expected Tusker stock to be ${tuskerInitialBtl - tuskerPackSize}, got ${tusker.st}`);
  }
  console.log(`  ✓ Selling 1 carton of Tusker (pack size 24) deducted exactly ${tuskerPackSize} bottles (${tuskerInitialBtl} -> ${tusker.st}).`);

  // Spirit carton sale test (JW Black: pack size 6, 25 tots/bottle -> 150 tots)
  const jwInitialBtl = jw.st; // 8
  const jwInitialTots = callFn("getProductBaseUnits", jw.id); // 200
  callFn("add", jw.id);
  callFn("unit", 0, "c");
  callFn("charge");
  callFn("finish");
  const jwLastMov = state.stockMovements[state.stockMovements.length - 1];
  const expectedJwDelta = -(jw.k * jw.baseUnitsPerBottle); // -150
  if (jwLastMov.qty !== expectedJwDelta) {
    throw new Error(`Expected JW Black carton deduction of ${expectedJwDelta} tots, got ${jwLastMov.qty}`);
  }
  if (jw.st !== jwInitialBtl - jw.k) {
    throw new Error(`Expected JW Black stock to be ${jwInitialBtl - jw.k} btl, got ${jw.st} btl`);
  }
  if (callFn("getProductBaseUnits", jw.id) !== jwInitialTots + expectedJwDelta) {
    throw new Error(`Expected JW Black base units to be ${jwInitialTots + expectedJwDelta}, got ${callFn("getProductBaseUnits", jw.id)}`);
  }
  console.log(`  ✓ Selling 1 carton of JW Black (pack 6 × 25 tots) deducted exactly ${-expectedJwDelta} tots (${jwInitialBtl} btl -> ${jw.st} btl).`);

  // 6. Void or Negative Stock Being Blocked
  console.log("\n[6/10] Verifying configured zero-stock policy...");
  state.zeroStockPolicy = "block";

  // A: recordStockMovement blocks negative stock
  const testMovBlocked = callFn("recordStockMovement", {
    id: "mov_test_neg",
    productId: tusker.id,
    type: "sale",
    qty: -999999, // exceeds available stock
    unit: "b",
    unitQty: 999999,
    ref: "TEST-BLOCK",
    note: "Attempting to create negative stock",
    user: "Test",
    at: new Date()
  });
  if (testMovBlocked !== false) {
    throw new Error("recordStockMovement allowed an operation that would make stock negative!");
  }
  if (state.stockMovements.some(m => m.id === "mov_test_neg")) {
    throw new Error("Movement that causes negative stock was mistakenly appended to ledger!");
  }
  console.log("  ✓ recordStockMovement successfully rejected negative stock movement.");

  // B: Cannot add out-of-stock product
  // Simulate draining Robertson Chardonnay (id 16) stock to 0
  const rob = state.products.find(p => p.n === "Robertson Chardonnay");
  const robCurrentBase = callFn("getProductBaseUnits", rob.id);
  callFn("recordStockMovement", {
    id: "mov_drain",
    productId: rob.id,
    type: "adjustment",
    qty: -robCurrentBase,
    unit: "b",
    unitQty: robCurrentBase,
    ref: "TEST-DRAIN",
    note: "Drain for testing",
    user: "Test",
    at: new Date()
  });
  if (rob.st !== 0) throw new Error(`Expected Robertson Chardonnay stock to be 0, got ${rob.st}`);

  const addOutBlocked = callFn("add", rob.id);
  if (addOutBlocked !== false) {
    throw new Error("add() allowed adding an out-of-stock item!");
  }
  if (state.cart.some(l => l.id === rob.id)) {
    throw new Error("Out-of-stock product was added to the cart!");
  }
  console.log("  ✓ Adding out-of-stock item to cart is blocked.");

  // C: Cannot switch unit or increase quantity beyond available stock
  // Nederburg Cabernet has 2 bottles in stock (pack size is 6)
  const ned = state.products.find(p => p.n === "Nederburg Cabernet");
  state.cart = [];
  callFn("add", ned.id); // 1 bottle added
  // Try to switch 1 bottle to carton (requires 6 bottles, but only 2 in stock)
  const switchExceedsBlocked = callFn("unit", 0, "c");
  if (switchExceedsBlocked !== false) {
    throw new Error("unit() allowed switching to carton when stock is insufficient for carton pack size!");
  }
  if (state.cart[0].u === "c") {
    throw new Error("Unit was switched to carton despite insufficient stock!");
  }
  console.log("  ✓ Switching unit to carton beyond available stock is blocked.");

  // D: finish() blocks checkout if cart quantity exceeds stock
  // Force cart line to exceed stock
  state.cart[0].q = 100;
  state.ageVerified = true;
  callFn("charge");
  const finishExceedsBlocked = callFn("finish");
  if (finishExceedsBlocked !== false) {
    throw new Error("finish() allowed checkout that exceeds available stock!");
  }
  console.log("  ✓ finish() sale checkout is blocked if cart quantity exceeds stock.");

  // Clean cart after test
  state.cart = [];
  state.payment = null;
  state.ageVerified = false;

  // 7. Receiving Goods (Purchases) & Dashboard Shortage Figures
  console.log("\n[7/10] Verifying Receiving Goods & Dashboard Shortage Figures...");
  const jd = state.products.find(p => p.n.includes("Jack Daniel"));
  if (!jd) throw new Error("Jack Daniel's not found in products");

  const jdInitialBtl = jd.st; // 3 bottles initially (<= 5)
  const jdInitialBase = callFn("getProductBaseUnits", jd.id); // 75 tots
  const jdPackSize = jd.k; // 12 bottles per carton
  const jdTotsPerBtl = jd.baseUnitsPerBottle; // 25 tots

  // A: Jack Daniel's is low stock (<= 5), so it must appear in dashboard reorder list
  const dashBeforeRec = callFn("dash");
  if (!dashBeforeRec.includes(jd.n)) {
    throw new Error(`Jack Daniel's (${jdInitialBtl} btl <= 5) should appear in dash() reorder shortage list before receipt`);
  }

  // B: Receive 2 cartons of Jack Daniel's
  state.receiveDraft = {
    supplier: "UDV Kenya (Diageo)",
    invoiceRef: "UDV-INV-9901",
    lines: [
      { productId: jd.id, unit: "c", qty: 2, cost: jd.cp }
    ]
  };

  const movCountBeforeRec = state.stockMovements.length;
  const recOk = callFn("submitReceiveGoods");
  if (!recOk) throw new Error("submitReceiveGoods returned false");

  if (state.stockMovements.length !== movCountBeforeRec + 1) {
    throw new Error("Stock movement was not appended for goods receipt");
  }

  const recMov = state.stockMovements[state.stockMovements.length - 1];
  const expectedRecDelta = 2 * jdPackSize * jdTotsPerBtl; // 2 * 12 * 25 = 600 tots
  if (recMov.type !== "receipt" || recMov.productId !== jd.id || recMov.qty !== expectedRecDelta) {
    throw new Error(`Expected receipt movement of +${expectedRecDelta} tots, got type=${recMov.type}, qty=${recMov.qty}`);
  }
  if (recMov.supplier !== "UDV Kenya (Diageo)" || recMov.user !== "Owner") {
    throw new Error("Receipt movement missing expected supplier or owner user");
  }

  const expectedJdAfterRec = jdInitialBtl + (2 * jdPackSize); // 3 + 24 = 27 bottles
  if (jd.st !== expectedJdAfterRec) {
    throw new Error(`Expected Jack Daniel's stock to rise from ${jdInitialBtl} to ${expectedJdAfterRec} btl, got ${jd.st}`);
  }
  if (callFn("getProductBaseUnits", jd.id) !== jdInitialBase + expectedRecDelta) {
    throw new Error(`Expected JD base units ${jdInitialBase + expectedRecDelta}, got ${callFn("getProductBaseUnits", jd.id)}`);
  }
  console.log(`  ✓ Receiving 2 cartons of ${jd.n} raised stock by 2 pack sizes (+24 btl: ${jdInitialBtl} -> ${jd.st} btl).`);

  // C: Dashboard shortage figures update dynamically: JD is now 27 btl (> 5), so no longer in reorder list
  const dashAfterRec = callFn("dash");
  if (dashAfterRec.includes(jd.n)) {
    throw new Error("Jack Daniel's should have cleared from dashboard shortage figures after receipt raised stock to 27");
  }
  console.log("  ✓ Dashboard shortage figures dynamically cleared Jack Daniel's after stock rose above 5.");

  // D: A sale lowers it: selling 1 carton of JD drops stock from 27 to 15
  state.cart = [];
  callFn("add", jd.id);
  callFn("unit", 0, "c");
  state.ageVerified = true;
  callFn("charge");
  callFn("finish");
  if (jd.st !== 15) throw new Error(`Expected JD stock to drop to 15 btl after selling 1 carton, got ${jd.st}`);

  // Selling another carton drops stock from 15 to 3
  callFn("add", jd.id);
  callFn("unit", 0, "c");
  state.ageVerified = true;
  callFn("charge");
  callFn("finish");
  if (jd.st !== 3) throw new Error(`Expected JD stock to drop to 3 btl after selling 2nd carton, got ${jd.st}`);

  // E: Dashboard shortage figures update again: JD is back in reorder list!
  const dashAfterSale = callFn("dash");
  if (!dashAfterSale.includes(jd.n)) {
    throw new Error("Jack Daniel's should reappear in dashboard shortage figures after stock dropped back to 3");
  }
  console.log(`  ✓ Sales lowered ${jd.n} stock (27 -> 15 -> 3 btl) and dashboard shortage figures updated dynamically.`);

  // Quick receive helper check
  callFn("quickReceive", jd.id);
  if (state.stockTab !== "receive" || state.receiveDraft.lines[0]?.productId !== jd.id) {
    throw new Error("quickReceive failed to prep receive draft");
  }
  callFn("setStockTab", "overview");
  console.log("  ✓ Quick receive action routes to receive tab with pre-filled line.");

  // 8. Stock Take (Blind Count, Variance & Loss/Gain Values)
  console.log("\n[8/10] Verifying Stock Take (Blind Count & Variance Audit)...");
  callFn("setStockTab", "take");

  // A: Mode switching
  callFn("setStockTakeMode", "blind");
  if (state.stockTakeDraft.mode !== "blind") throw new Error("Failed to set blind mode");
  callFn("setStockTakeMode", "review");
  if (state.stockTakeDraft.mode !== "review") throw new Error("Failed to set review mode");

  // B: Auto-fill and clear
  callFn("autoFillStockTake");
  if (Object.keys(state.stockTakeDraft.counts).length !== 17) {
    throw new Error("autoFillStockTake did not fill all 17 product counts");
  }
  callFn("clearStockTake");
  if (Object.keys(state.stockTakeDraft.counts).length !== 0) {
    throw new Error("clearStockTake did not reset counts");
  }

  // C: Empty count submission rejected
  if (callFn("submitStockTake") !== false) {
    throw new Error("submitStockTake allowed posting with 0 counted products");
  }

  // D: Variance audit and financial impact:
  // We record count for Tusker (loss of 4 btl) and Guinness (gain of 2 btl)
  const currentTuskerSt = tusker.st; // 96
  const guinness = state.products.find(p => p.n === "Guinness");
  const currentGuinnessSt = guinness.st; // 80

  callFn("updateStockTakeCount", tusker.id, currentTuskerSt - 4);
  callFn("updateStockTakeCount", guinness.id, currentGuinnessSt + 2);

  // Review variance tab rendering
  const takeReviewHtml = callFn("renderStockTakeTab");
  if (!takeReviewHtml.includes("−4 btl (Loss)") || !takeReviewHtml.includes("+2 btl (Gain)")) {
    throw new Error("renderStockTakeTab failed to calculate or render variance labels");
  }

  // Submit stock take
  const movCountBeforeTake = state.stockMovements.length;
  const takeOk = callFn("submitStockTake");
  if (!takeOk) throw new Error("submitStockTake failed");

  if (state.stockMovements.length !== movCountBeforeTake + 2) {
    throw new Error("Stock take did not append exactly 2 variance movements");
  }

  const newTakeMovements = state.stockMovements.slice(movCountBeforeTake);
  const tuskerTakeMov = newTakeMovements.find(m => m.productId === tusker.id && m.type === "take");
  const guinnessTakeMov = newTakeMovements.find(m => m.productId === guinness.id && m.type === "take");

  if (!tuskerTakeMov || tuskerTakeMov.qty !== -4 || tuskerTakeMov.user !== "Owner") {
    throw new Error(`Tusker take movement invalid: qty=${tuskerTakeMov?.qty}`);
  }
  if (!guinnessTakeMov || guinnessTakeMov.qty !== 2 || guinnessTakeMov.user !== "Owner") {
    throw new Error(`Guinness take movement invalid: qty=${guinnessTakeMov?.qty}`);
  }

  if (tusker.st !== currentTuskerSt - 4) {
    throw new Error(`Expected Tusker stock to adjust to ${currentTuskerSt - 4}, got ${tusker.st}`);
  }
  if (guinness.st !== currentGuinnessSt + 2) {
    throw new Error(`Expected Guinness stock to adjust to ${currentGuinnessSt + 2}, got ${guinness.st}`);
  }
  if (state.stockTab !== "overview" || Object.keys(state.stockTakeDraft.counts).length !== 0) {
    throw new Error("Stock take did not reset draft and tab state");
  }
  console.log(`  ✓ Stock take posted loss (−4 btl Tusker) and gain (+2 btl Guinness) with Owner audit trail.`);
  console.log("  ✓ Derived stock levels updated directly from ledger movements.");

  // 9. Stock Adjustments (Breakage, Theft, Expired, Gift)
  console.log("\n[9/10] Verifying Stock Adjustments with Mandatory Reasons...");
  callFn("setStockTab", "adjust");

  // A: Mandatory reason requirement
  state.adjustmentDraft = {
    productId: tusker.id,
    direction: "loss",
    unit: "b",
    qty: 1,
    reason: "",
    note: "Missing reason"
  };
  if (callFn("submitAdjustment") !== false) {
    throw new Error("submitAdjustment must reject adjustment without mandatory reason");
  }

  // B: Quantity must be > 0
  state.adjustmentDraft.reason = "breakage";
  state.adjustmentDraft.qty = 0;
  if (callFn("submitAdjustment") !== false) {
    throw new Error("submitAdjustment must reject zero quantity");
  }

  // C: Block reduction exceeding available stock
  state.adjustmentDraft.qty = 999999;
  if (callFn("submitAdjustment") !== false) {
    throw new Error("submitAdjustment allowed adjustment exceeding available stock");
  }

  // D: Test all 4 standard adjustment reasons
  // 1. Breakage (Four Cousins Wine, id 14)
  const fc = state.products.find(p => p.n === "Four Cousins Sweet Red");
  const fcBefore = fc.st;
  state.adjustmentDraft = {
    productId: fc.id,
    direction: "loss",
    unit: "b",
    qty: 2,
    reason: "breakage",
    note: "Dropped carton in storage room"
  };
  if (!callFn("submitAdjustment")) throw new Error("Failed to post breakage adjustment");
  if (fc.st !== fcBefore - 2) throw new Error("Breakage did not deduct 2 bottles from Four Cousins");
  let lastAdj = state.stockMovements[state.stockMovements.length - 1];
  if (lastAdj.reason !== "breakage" || lastAdj.type !== "adjustment" || lastAdj.user !== "Owner") {
    throw new Error("Invalid breakage adjustment movement metadata");
  }

  // 2. Theft (Captain Morgan, id 7)
  const cm = state.products.find(p => p.n === "Captain Morgan");
  const cmBefore = cm.st;
  state.adjustmentDraft = {
    productId: cm.id,
    direction: "loss",
    unit: "b",
    qty: 1,
    reason: "theft",
    note: "Missing bottle during morning count"
  };
  if (!callFn("submitAdjustment")) throw new Error("Failed to post theft adjustment");
  if (cm.st !== cmBefore - 1) throw new Error("Theft did not deduct 1 bottle from Captain Morgan");
  lastAdj = state.stockMovements[state.stockMovements.length - 1];
  if (lastAdj.reason !== "theft" || lastAdj.qty !== -25) { // 25 tots for 1 btl spirit
    throw new Error(`Theft movement invalid: expected -25 tots, got ${lastAdj.qty}`);
  }

  // 3. Expired (Heineken, id 2)
  const hnk = state.products.find(p => p.n === "Heineken");
  const hnkBefore = hnk.st;
  state.adjustmentDraft = {
    productId: hnk.id,
    direction: "loss",
    unit: "b",
    qty: 3,
    reason: "expired",
    note: "Past freshness date batch 401"
  };
  if (!callFn("submitAdjustment")) throw new Error("Failed to post expired adjustment");
  if (hnk.st !== hnkBefore - 3) throw new Error("Expired did not deduct 3 bottles from Heineken");
  lastAdj = state.stockMovements[state.stockMovements.length - 1];
  if (lastAdj.reason !== "expired") throw new Error("Invalid expired adjustment reason");

  // 4. Gift (Hennessy VS, id 8)
  const hen = state.products.find(p => p.n === "Hennessy VS");
  const henBefore = hen.st;
  state.adjustmentDraft = {
    productId: hen.id,
    direction: "loss",
    unit: "b",
    qty: 1,
    reason: "gift",
    note: "VIP loyal customer corporate gift"
  };
  if (!callFn("submitAdjustment")) throw new Error("Failed to post gift adjustment");
  if (hen.st !== henBefore - 1) throw new Error("Gift did not deduct 1 bottle from Hennessy");
  lastAdj = state.stockMovements[state.stockMovements.length - 1];
  if (lastAdj.reason !== "gift") throw new Error("Invalid gift adjustment reason");

  console.log("  ✓ All 4 adjustment reasons (Breakage, Theft, Expired, Gift) validated and posted to ledger.");
  console.log("  ✓ Mandatory reason requirement and negative stock guards verified.");

  // 10. Stock Screen Tabs & Ledger History Audit
  console.log("\n[10/10] Verifying Stock Screen Tabs, Filters & Ledger History...");
  const tabs = ["overview", "receive", "take", "adjust", "history"];
  for (const t of tabs) {
    callFn("setStockTab", t);
    callFn("go", "stock");
    const stockHtml = domElements["app"]?.innerHTML || "";
    if (stockHtml.length < 500) throw new Error(`Stock tab "${t}" rendered too short (${stockHtml.length} bytes)`);
    if (stockHtml.includes("undefined") || stockHtml.includes("NaN")) {
      throw new Error(`Stock tab "${t}" rendered invalid undefined/NaN values`);
    }
    console.log(`  ✓ Stock tab "${t}" rendered cleanly.`);
  }

  // Stock overview search & filter
  callFn("setStockTab", "overview");
  callFn("searchStock", "Guinness");
  const guinnessSearchHtml = callFn("stockView");
  if (!guinnessSearchHtml.includes("Guinness")) {
    throw new Error("searchStock failed to locate Guinness");
  }
  callFn("searchStock", "");

  callFn("setStockFilter", "low");
  const lowFilterHtml = callFn("stockView");
  if (!lowFilterHtml.includes("Low stock")) {
    throw new Error("setStockFilter('low') failed");
  }
  callFn("setStockFilter", "all");

  // History ledger search & filter
  callFn("setStockTab", "history");
  callFn("setHistoryFilter", "receipt");
  const historyRecHtml = callFn("stockView");
  if (!historyRecHtml.includes("receipt") || historyRecHtml.includes("INV-000001")) {
    throw new Error("History receipt filter did not isolate receipts");
  }

  callFn("setHistoryFilter", "adjustment");
  const historyAdjHtml = callFn("stockView");
  if (!historyAdjHtml.includes("breakage") && !historyAdjHtml.includes("theft")) {
    throw new Error("History adjustment filter missing posted adjustments");
  }

  callFn("searchHistory", "corporate gift");
  const historySearchHtml = callFn("stockView");
  if (!historySearchHtml.includes("Hennessy VS")) {
    throw new Error("History search failed to find gift note");
  }
  callFn("searchHistory", "");
  callFn("setHistoryFilter", "all");
  console.log("  ✓ Stock Overview and History search/filtering verified.");

  // Smoke test the default allow-and-flag policy with a sale at zero stock.
  console.log("\n[11/11] Verifying allow-and-flag negative stock policy...");
  state.zeroStockPolicy = "allow";
  const zeroProduct = state.products.find(p => p.id === 16);
  const remaining = callFn("getProductBaseUnits", zeroProduct.id);
  if (remaining > 0) callFn("recordStockMovement", { id: "mov_smoke_drain", productId: zeroProduct.id, type: "adjustment", qty: -remaining, unit: "b", unitQty: remaining, ref: "SMOKE-DRAIN", note: "Smoke test drain", user: "Test", at: new Date() });
  state.cart = [];
  callFn("add", zeroProduct.id);
  state.ageVerified = true;
  callFn("charge");
  if (!callFn("finish")) throw new Error("Default allow policy rejected a sale at zero stock");
  const negativeSale = state.stockMovements[state.stockMovements.length - 1];
  if (!negativeSale.negativeStock || zeroProduct.st !== -1) throw new Error("Zero-stock sale was not flagged and recorded as negative");
  const negativeHistory = callFn("renderHistoryTab");
  if (!negativeHistory.includes("negative stock sale")) throw new Error("Flagged negative sale missing from Stock History");
  const reportsHtml = callFn("dash");
  if (!reportsHtml.includes("Negative stock") || !reportsHtml.includes(zeroProduct.n)) throw new Error("Negative stock item missing from Reports reorder list");
  console.log("  ✓ Zero-stock sale is recorded, flagged in History, and shown on the Reports reorder list.");

  // Product price edits update checkout pricing and create a complete audit record.
  console.log("\n[12/12] Verifying product edit, price audit, and add-product flow...");
  const priceProduct = state.products.find(p => p.n === "Tusker Lager");
  const oldPrice = priceProduct.b;
  const newPrice = oldPrice + 50;
  callFn("openProductEditor", priceProduct.id);
  callFn("updateProductDraft", "b", newPrice);
  callFn("updateProductDraft", "buyPrice", priceProduct.buyPrice + 10);
  callFn("updateProductDraft", "reorderLevel", 2);
  callFn("updateProductDraft", "preferredSupplier", state.suppliers[1]);
  if (!callFn("saveProductEditor")) throw new Error("Failed to save product edits");
  if (callFn("price", priceProduct, "b") !== newPrice) throw new Error("Product price edit did not update checkout price");
  if (priceProduct.reorderLevel !== 2 || priceProduct.preferredSupplier !== state.suppliers[1]) throw new Error("Product reorder level or preferred supplier was not saved");
  const priceLog = state.priceChanges[state.priceChanges.length - 1];
  if (!priceLog || priceLog.oldPrice !== oldPrice || priceLog.newPrice !== newPrice || !priceLog.user || !priceLog.at || Number.isNaN(new Date(priceLog.at).getTime())) {
    throw new Error("Price change audit is missing old/new price, user, or timestamp");
  }

  callFn("openProductEditor");
  for (const [field, value] of Object.entries({ n: "Smoke Test Soda", s: "330ml", g: "Beer", b: 220, k: 24, tn: 0, t: 0, reorderLevel: 1, preferredSupplier: state.suppliers[0], buyPrice: 140 })) {
    callFn("updateProductDraft", field, value);
  }
  if (!callFn("saveProductEditor")) throw new Error("Failed to add product from editor");
  const addedProduct = state.products.find(p => p.n === "Smoke Test Soda");
  if (!addedProduct || state.products.length !== 18 || callFn("price", addedProduct, "b") !== 220) throw new Error("New product is missing or not priced for checkout");
  console.log("  ✓ Product edits update checkout, retain reorder/supplier settings, log the price change, and add a checkout-ready SKU.");

  console.log("\n=========================================");
  console.log("🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("=========================================\n");
  process.exit(0);
}

try {
  runSmokeTests();
} catch (err) {
  console.error("\n❌ SMOKE TEST FAILED:\n", err);
  process.exit(1);
}
