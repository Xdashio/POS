# Open questions for the client

Resolve these with the owner before fixing the production scope. Tax and eTIMS treatment should be confirmed with the client’s accountant or tax adviser.

## VAT and eTIMS

- Is the business VAT-registered? Are shelf prices VAT-inclusive or VAT-exclusive, and are any products exempt or treated differently?
- What VAT rate and receipt breakdown should the POS use, as confirmed by the client’s adviser?
- Is the business already using eTIMS? Which account, device, or integration method is expected, and what invoice/control-unit fields must appear on receipts?
- Who can provide a test environment or coordinate eTIMS validation before launch?

## Till and payment setup

- Which M-Pesa merchant service is used at the shop (Till, PayBill, or another setup)?
- Should checkout use STK push, manual confirmation codes, or both? Who can arrange the required Daraja access and callback configuration?
- What M-Pesa statement format does the owner receive, and how often should reconciliation happen?
- How many tills, outlets, cashiers, and owner accounts are in scope? Who can approve voids, discounts, price changes, and shift variances?

## Hardware

- What are the exact barcode scanner make/model and connection type (USB, Bluetooth, or other)? Can the team provide a test unit?
- What are the receipt printer make/model, supported command language, connection type, and paper width (58 mm or 80 mm)?
- What cash drawer model is used, and how does it connect to the till or printer?
- Which computers, tablets, operating systems, and browsers will run the POS? Is there a dedicated test till available?

## Products and stock

- How many active SKUs are there today, and how many are expected within the next year?
- Is there a current product spreadsheet? Which fields are reliable: barcode, category, size, carton quantity, tots per bottle, buying price, selling price, VAT treatment, supplier, and opening stock?
- Which products are sold by bottle, carton, tot, or another unit? Are pack sizes consistent by supplier?
- What stock-count frequency and approval rules should apply to variances, breakage, expired goods, theft, and gifts?

## Suppliers and reordering

- What are the supplier names, contacts, and product-to-supplier mappings?
- For each supplier, what are the carton sizes, minimum order quantities, lead times, delivery days, payment terms, and ordering channel?
- Should the reorder suggestion use a fixed coverage period, supplier lead time, safety stock, seasonal adjustments, or owner-set targets?
- Should purchase orders remain drafts, require owner approval, or be sent from the system? If sent, through which channel?

## Offline operations and rollout

- How long must a till keep selling without internet, and which actions must remain available offline?
- What should happen if the same product or price is edited on two tills before they reconnect?
- Which staff need Kiswahili labels or training, and what receipt language should be used?
- What is the preferred pilot shop, start date, and success measure for checkout speed, stock accuracy, and till reconciliation?
