# Project context: Cellar POS

Build a production POS for a Kenyan wines & spirits **retail shop**. The clickable prototype in `prototype/index.html` is the visual and behavioural reference. Match it unless a prompt says otherwise.

## Client facts (confirmed)
- Retail shop only (no tabs/tables). Single outlet, 1 till. Users: owner + cashiers.
- Payments: cash and M-Pesa (Till/Paybill via Daraja STK push). No cards or customer credit yet.
- Today they use paper/notebook. Needs an easy opening-stock load (Excel/CSV import or guided stock take).
- ~300-1,000 SKUs sold as bottle, carton and tot (e.g. 750ml bottle = 25 tots; carton = 6 or 12 bottles).
- Internet is often unreliable: **offline-first** (PWA). Checkout must never need the network.
- Hardware: barcode scanner (acts as keyboard, Enter to submit), receipt printer, cash drawer.
- VAT/eTIMS status of the client is UNCONFIRMED. Receipts carry eTIMS-ready fields; do not claim KRA compliance until verified against current KRA eTIMS docs.
- Owner pain points: stock theft/shrinkage, cash vs M-Pesa mismatches, knowing what to reorder, slow checkout.

## Rules
- Stock is never stored as a number alone: it is derived from an append-only **stock movements ledger** (sale, receipt, adjustment, void, stock take). Base unit is per product (tot for spirits that sell tots, bottle otherwise), converted to bottles only for display.
- Money as integers in KES (no floats). Prices include VAT 16%; show VAT split on receipts.
- Roles: `cashier` sells; `owner` controls prices, voids, discounts, stock adjustments, reports. Log every void, discount, price override and adjustment with user + time.
- Offline M-Pesa: cashier enters the confirmation code manually; sale is flagged `pending reconciliation`.
- Age check (18+) must be confirmed before charging.

## Design system (from prototype)
- Light + dark mode via CSS variables; neutral base, single deep wine accent (`#8a1c3c` light / `#b8294f` dark).
- Radius scale only: 8px (buttons, inputs, chips), 12px (tiles, rows), 16px (cards, modals). No pills except the toggle switch.
- Bento grid on laptop (tiles + product card + tall cart card); on <1000px the cart is a bottom bar opening a full-screen sheet; <640px single column; scale up at 1600px and 2200px.
- Product images are placeholders (category icons) until real photos are supplied.
- Font: Plus Jakarta Sans (Google Fonts, system-ui fallback), tabular numerals for prices.
- Spacing: generous (cards 1.5rem padding, 1.25rem gaps on laptop); chips and tiles never clip focus rings.
- Thin themed scrollbars; touch targets >= 44px.

## Quality bar
TypeScript strict, tests for stock/pricing/till maths, accessible controls, no network calls in the checkout path.
