Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Luis Ortega <lortega@crestlinefs.example>
Subject: filters quote
Received: 2026-09-29T15:22:00-07:00

Hi there,

can you send me a price on

M8 20x25x1 - 10 cases
2in MERV8 24x24 - 6 cases

thanks!
Luis

Luis Ortega
Maintenance Supervisor
Crestline Facility Services
Sent from Outlook for Android
---

Facts (JSON):
{
  "customerName": "Crestline Facility Services",
  "lines": [
    {
      "text": "M8 20x25x1 - 10 cases",
      "sku": "PL-M8-20251",
      "sellQty": 10,
      "sellUnit": "CASE",
      "unitPrice": 34.83,
      "extPrice": 348.3
    },
    {
      "text": "2in MERV8 24x24 - 6 cases",
      "sku": "PL-M8-24242",
      "sellQty": 6,
      "sellUnit": "CASE",
      "unitPrice": 50.35,
      "extPrice": 302.1
    }
  ],
  "totals": {
    "subtotal": 650.4,
    "pallets": 2,
    "volumeDiscount": 0.03,
    "freight": 330,
    "total": 980.4
  },
  "flags": [
    "missing_info"
  ],
  "missing": [
    "ship-to address",
    "delivery date"
  ]
}
