Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Brenda Vogel <bvogel@greatplainsbs.example>
Subject: Q4 pallet buy - pleated
Received: 2026-09-29T09:30:00-05:00

Hello,

Putting together our Q4 pallet buy. Please quote:

- PL-M8-20252 (20x25x2 MERV 8): 300 cases
- PL-M13-24244 (24x24x4 MERV 13): 90 cases
- PL-M8-16201 (16x20x1 MERV 8): 20 cases

Ship to Peoria DC, 6725 W Industrial Ave, Peoria IL 61604. Need everything by 10/16. Please show pallet breaks and freight.

Regards,
Brenda Vogel
Category Buyer - HVAC
Great Plains Building Supply
309-555-0156
---

Facts (JSON):
{
  "customerName": "Great Plains Building Supply",
  "lines": [
    {
      "text": "PL-M8-20252 (20x25x2 MERV 8): 300 cases",
      "sku": "PL-M8-20252",
      "sellQty": 300,
      "sellUnit": "CASE",
      "unitPrice": 41.64,
      "extPrice": 12492
    },
    {
      "text": "PL-M13-24244 (24x24x4 MERV 13): 90 cases",
      "sku": "PL-M13-24244",
      "sellQty": 90,
      "sellUnit": "CASE",
      "unitPrice": 94.3,
      "extPrice": 8487
    },
    {
      "text": "PL-M8-16201 (16x20x1 MERV 8): 20 cases",
      "sku": "PL-M8-16201",
      "sellQty": 20,
      "sellUnit": "CASE",
      "unitPrice": 25.79,
      "extPrice": 515.8
    }
  ],
  "totals": {
    "subtotal": 21494.8,
    "pallets": 16,
    "volumeDiscount": 0.08,
    "freight": 0,
    "total": 21494.8
  },
  "flags": [
    "short_stock"
  ],
  "missing": []
}
