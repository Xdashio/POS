# Prompts for Claude Code (run in order, commit after each)

**0 – Scaffold and port.** Read CLAUDE.md and prototype/index.html. Create a Vite + React + TypeScript (strict) + Tailwind app in `app/` and port the prototype 1:1: same layout, light/dark tokens, radius scale, responsive behaviour, checkout, payment modal, receipt, dashboard. Use Zustand for UI state. No backend yet. Add Vitest and a CI script (typecheck, lint, test).

**1 – Domain and local database.** Add Dexie (IndexedDB). Model Product (pack sizes, tots per bottle), StockMovement (append-only ledger), Sale, SaleLine, Payment, TillSession, User, AuditLog, Supplier. Derive stock from movements. Seed the demo catalogue. Unit-test carton/bottle/tot conversion and VAT maths (integer KES).

**2 – Real checkout.** Wire checkout to the database: scanner (Enter) and search, stock deduction through movements, sale numbering, 18+ gate, receipt from stored sale. Prevent selling beyond stock unless owner allows.

**3 – Products and pricing.** Owner screens to add/edit products, barcodes, pack sizes, buying and selling prices, with price-change audit log. CSV/Excel import for opening stock with validation and a preview step.

**4 – Stock management.** Receive goods (supplier, cartons, buying price), stock take (blind count, variance review, approve adjustment) and manual adjustments with mandatory reason. Reorder list with suggested quantities from sales velocity.

**5 – Till and shifts.** Open/close till with float, expected vs counted cash, expected vs received M-Pesa, variance report and owner sign-off. Block selling when no till is open.

**6 – Users and roles.** PIN login, cashier/owner permissions, owner-approval flow for voids, discounts and price overrides, full audit log screen.

**7 – Reports.** Daily/weekly sales, margin by product, shrinkage (variance) trends, void/discount report, export to CSV and printable PDF.

**8 – PWA and offline sync.** Service worker, installable app, outbox queue for events, visible sync status, conflict-safe merge (ledger is append-only). Define the sync API contract in `docs/api.md`.

**9 – Backend.** Node + TypeScript + Postgres API implementing the sync contract, auth, and backups. Dockerfile and deployment notes for a small VPS.

**10 – M-Pesa and eTIMS.** Integrate Safaricom Daraja (STK push, callbacks, reconciliation of manually entered codes). Research the CURRENT KRA eTIMS requirements and integrate or stub behind an interface; document what the client must register. Do not assume compliance.

**11 – Hardware.** Receipt printing (ESC/POS via WebUSB/Web Serial or a print service), cash drawer kick, scanner handling, test on the client's actual devices.

**12 – Hardening and handover.** Accessibility pass, performance on low-end Android, backup/restore, owner and cashier quick guides, pilot checklist.
