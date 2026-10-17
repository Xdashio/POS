# Cellar POS: 10-minute demo flow

**Audience:** shop owner and store team
**Goal:** show how the prototype addresses shrinkage, cash and M-Pesa mismatches, reordering, and slow checkout.

## Before the demo

- Open the [prototype](../prototype/index.html) and sign in as Owner with demo PIN `1234`.
- Use **Reset demo data** in Settings if you want the seeded stock, receipts, and settings restored first. Reset reloads the prototype.
- Keep the till open. The cashier demo PINs are `1111` and `2222` if you want to show role-based access.
- Set expectations: payments, printer/drawer checks, sync, CSV exports, and eTIMS fields are simulated in this prototype.

## Run of show

| Time | Screen and actions | Talk track |
| --- | --- | --- |
| 0:00–0:30 | **Sell:** point out the floating **Demo guide** button. Mention that the guide has eight steps and can be closed at any time. | “We’ll follow one sale through checkout, stock, reconciliation, and replenishment.” |
| 0:30–2:15 | Search for Tusker or tap a product tile. Use **Scan simulator** once. Add Johnnie Walker Black and switch its unit to a tot or carton. On a phone, open the cart from the bottom bar. Verify the age check, press F2 to focus search and F4 to open charge. Apply a discount over 5% and approve it with the Owner PIN. Complete a cash test sale, then void it from the receipt with a reason and owner approval; show that stock is restored. | “A cashier can search or tap quickly, sell in the unit the customer wants, and protected discounts and voids leave an approval trail.” |
| 2:15–3:15 | Start a new sale, choose M-Pesa, send the simulated STK push, and complete the sale. Show the customer phone on the receipt. | “The receipt keeps the customer phone and the shop’s configured receipt details. The payment confirmation here is a simulation.” |
| 3:15–4:15 | **Stock:** show the low-stock count and movement history. Open **Receive Goods**, choose a supplier and product, then post a sample receipt. Show the resulting movement and updated on-hand quantity. | “Stock is derived from recorded movements, so a receipt and sale update the same stock figure.” |
| 4:15–5:15 | Open **Stock Take**. Enter a sample physical count that differs from the expected count, review the variance, and post it. Show the stock-take entry in History and the shrinkage report. | “A counted variance is visible and attributable; it gives the owner a place to investigate shrinkage.” |
| 5:15–6:15 | **Till:** open the close flow. Count cash by denomination, enter M-Pesa received slightly below expected, add a variance reason, and sign off with Owner PIN `1234`. Show the shift receipt, then reopen the till with a float before continuing checkout. | “The close captures expected versus counted cash and M-Pesa, the reason, and owner sign-off.” |
| 6:15–7:20 | Turn on **Offline** in the header. Take an M-Pesa sale, enter a customer phone and a sample confirmation code of at least eight characters, then complete it. Show the pending receipt and **Sync queue**. Retry while offline, go online, and retry again. Open M-Pesa reconciliation, paste a row in `code,total,phone,date` order using the sale’s exact code and total, import it, and mark it matched. | “The demo queues each sale and stock movement and lets an owner compare an offline code with a pasted statement. The queue and payment gateway are simulated.” |
| 7:20–8:25 | **Reports:** switch through the date presets and point out sales by day, payment method, category, top/bottom sellers, margin, shrinkage, and voids/discounts. Open **Reorder list**, build a supplier draft, and preview the WhatsApp text and CSV export. | “Reorder quantities use recent sales velocity and the configured minimum. This is a draft and preview; nothing is sent to a supplier.” |
| 8:25–9:20 | **Settings:** change paper width and receipt text, show the live preview and eTIMS placeholders, run the printer or drawer test, and switch button labels to Kiswahili and back. | “Shop details and receipt settings are editable. Hardware and eTIMS are preview-only until the real devices and tax setup are confirmed.” |
| 9:20–10:00 | Return to **Sell**. Open the Demo guide and show Previous/Next. Visit **Settings** to point out **Reset demo data**; only confirm it when you are ready to reload the seeded demo. Take questions. | “Which part of this flow should we validate first with your actual products, till, M-Pesa account, and hardware?” |

## If time is short

Keep the checkout, stock-take, till variance, and reorder segments. Those four sections show the owner’s core pain points. Mention Settings and offline reconciliation, then offer to walk through them after the main demo.
