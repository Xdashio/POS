# Prototype Prompt Pack (Claude Code)

Goal: finish the **clickable prototype** so the client can see the full product. No backend. State lives in memory (optionally `localStorage` when run locally). Keep one file, `prototype/index.html`, unless a prompt says otherwise.

## How to use
1. `cd` into the repo and run `claude`. It reads `CLAUDE.md` automatically.
2. Paste **Prompt 0**, then Prompts 1-9 in order. After each: open the file in a browser, run the QA checklist below, commit.
3. If something looks wrong, paste the **Fix prompt** with a full-screen screenshot.

## Rules for every prompt (repeat if Claude drifts)
- Keep the design system in CLAUDE.md: light + dark mode, one wine accent, radii 8/12/16px only, Plus Jakarta Sans, generous spacing, thin themed scrollbars, image placeholders (no letter tiles).
- Responsive at 360, 768, 1280 and 1920px wide. On <1000px navigation and the cart must stay thumb-friendly. No horizontal scrolling anywhere, and filter chips never scroll.
- Money is whole KES. Stock changes only through the stock-movement ledger (sale, receipt, adjustment, void, stock take). Base unit = tot.
- Do not break existing flows (checkout, cash/M-Pesa, offline toggle, receipt, dashboard).

## Prompt 0 - Prepare
Read CLAUDE.md and prototype/index.html. Summarise the current structure in 10 lines, then refactor ONLY for maintainability: central `state`, a small router for screens (Sell, Stock, Products, Till, Reports, Users, Settings), a persistent bottom/side navigation that works on phone and desktop, and a `stockMovements` ledger from which product stock is derived. No visual changes yet. Confirm nothing regressed.

## Prompt 1 - Stock management
Add a **Stock** screen (owner only). Tabs: Overview (stock levels with search, low-stock filter), Receive goods (pick supplier, add lines in cartons/bottles, buying price, creates receipt movements), Stock take (blind count per product, variance review with value of loss/gain, approve to post adjustment movements), Adjustments (breakage, theft, expired, gift with mandatory reason), History (searchable movement ledger with user and time). Seed realistic movements.
Done when: receiving 2 cartons raises stock by the pack size, a sale lowers it, and the dashboard shortage figures update.

## Prompt 2 - Products and pricing
Add a **Products** screen: searchable table/cards, add/edit drawer (name, size, category, barcode, buy price, sell price, pack sizes, tots per bottle, reorder level, image placeholder), live margin % and tot price suggestion, price-change log, archive product. Add a mock "Import from Excel" flow: upload step, column mapping, validation preview with errors, confirm (simulated).
Done when: editing a price changes it at checkout immediately and appears in the audit log.

## Prompt 3 - Till and shifts
Add open-till (float entry) and close-till (counted cash by denomination, expected cash, expected vs received M-Pesa, variance with reason, owner sign-off) flows. Block selling while the till is closed. Show a shift summary receipt. Feed variance into the dashboard.

## Prompt 4 - Users, PIN login and approvals
Add a PIN login screen (owner 1234, cashiers 1111/2222 as demo PINs, shown on a demo hint). Role-based navigation: cashiers see Sell and their own till only. Add an owner-approval modal (owner PIN) required for voids, discounts and price overrides. Add an **Audit log** screen with filters by user, action and date.

## Prompt 5 - Checkout upgrades
Add: line and bill discounts (approval above 5%), void line and void sale (reason + approval), hold and recall sale, last-sale reprint, customer phone on receipt for M-Pesa, keyboard shortcuts (F2 search, F4 charge, Esc close), and a "scan" simulator button that picks random products. Keep the cart fast on touch.

## Prompt 6 - Reports and reorder
Add a **Reports** screen with date presets: sales by day (inline SVG chart), by payment method, by category, top and bottom sellers, margin by product, shrinkage (stock-take variance), voids and discounts. Add a reorder list that suggests quantities from sales velocity, builds a draft purchase order per supplier, and a "Share via WhatsApp" text preview. Export buttons produce simulated CSV downloads.

## Prompt 7 - Offline and sync centre
Make offline mode visible and believable: sync queue screen listing unsynced sales and stock movements, per-item status, retry, a banner showing pending count, and a **M-Pesa reconciliation** screen where the owner matches manually entered codes to a pasted statement (mock) and marks each as matched or disputed.

## Prompt 8 - Settings and receipts
Add Settings: shop name, address, KRA PIN, VAT toggle, receipt header/footer, paper width (58/80mm) with live receipt preview, eTIMS fields preview (QR placeholder, control unit fields), printer and cash-drawer test buttons (simulated), 18+ prompt toggle, trading-hours reminder. Add language labels toggle (English/Kiswahili) for main buttons.

## Prompt 9 - Demo mode and polish
Add a **Demo guide** (floating button) with a scripted 8-step walkthrough that highlights each key feature and a "Reset demo data" button. Add empty states, loading skeletons, success toasts, and consistent iconography. Run the full QA checklist and fix every issue found.

## Prompt 10 - Client handover
Produce `docs/demo-script.md` (a 10-minute demo flow), `docs/prototype-vs-product.md` (what is simulated vs what the real build delivers, mapped to the pain points: shrinkage, cash/M-Pesa mismatch, reordering, slow checkout), and a list of open questions for the client (VAT/eTIMS status, hardware models, number of SKUs, supplier list).

## Fix prompt (use any time)
Here is a full-screen screenshot at <width> px in <light/dark>. Problem: <describe>. Fix only this without changing unrelated screens, keep the design system, and re-check 360, 768, 1280 and 1920px.

## QA checklist (run after every prompt)
- Light and dark mode both readable; contrast fine.
- 360 / 768 / 1280 / 1920px: no horizontal scroll, no clipped text or focus rings, chips fit without scrolling.
- Checkout still works: scan/search, bottle/carton/tot, cash, M-Pesa online and offline, receipt.
- Stock numbers consistent across Sell, Stock, Dashboard.
- Every destructive or price-affecting action is logged.
