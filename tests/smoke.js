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

  // 1. Central State Verification
  console.log("[1/6] Verifying Central State...");
  if (!state || typeof state !== "object") throw new Error("Central state is not an object");
  if (!Array.isArray(state.products) || state.products.length !== 17) {
    throw new Error(`Expected 17 products in state.products, found ${state.products?.length}`);
  }
  if (!Array.isArray(state.stockMovements) || state.stockMovements.length !== 17) {
    throw new Error(`Expected 17 initial stock movements, found ${state.stockMovements?.length}`);
  }
  if (state.view !== "sell") throw new Error(`Initial view should be "sell", got "${state.view}"`);
  console.log("  ✓ Central state store initialized correctly with 17 SKUs and initial movements.");

  // 2. Base Unit per Product & Stock Derivation
  console.log("\n[2/6] Verifying Base Unit per Product & Stock Derivation...");
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
  console.log("\n[3/6] Verifying Router & Every Screen Rendering...");
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
  console.log("\n[4/6] Verifying Switching Units (Bottle -> Carton -> Tot)...");
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
  console.log("\n[5/6] Verifying Carton Sale Deducting Pack Size...");
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
  console.log("\n[6/6] Verifying Void or Negative Stock Being Blocked...");

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
