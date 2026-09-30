Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Mike Dombrowski <mdombrowski@lakeshoremech.example>
Subject: RFQ - stock order wk of 10/5
Received: 2026-09-28T07:42:00-04:00

Morning,

Please quote the following for our Monday stock order. Ship to our Grandville warehouse as usual (4410 Chicago Dr SW, Grandville MI 49418). Need it on the dock by Mon 10/5.

PL-M8-20251   qty 20 cases
PL-M11-20252  qty 10 cases
PL-M13-24242  qty 8 cases
BG-M13-2424-6P  qty 24 each

Thx,
Mike Dombrowski
Inside Sales / Purchasing
Lakeshore Mechanical Supply
o: 616-555-0142
---

Facts (JSON):
{
  "customerName": "Lakeshore Mechanical Supply",
  "lines": [
    {
      "text": "PL-M8-20251   qty 20 cases",
      "sku": "PL-M8-20251",
      "sellQty": 20,
      "sellUnit": "CASE",
      "unitPrice": 32.45,
      "extPrice": 649
    },
    {
      "text": "PL-M11-20252  qty 10 cases",
      "sku": "PL-M11-20252",
      "sellQty": 10,
      "sellUnit": "CASE",
      "unitPrice": 65.86,
      "extPrice": 658.6
    },
    {
      "text": "PL-M13-24242  qty 8 cases",
      "sku": "PL-M13-24242",
      "sellQty": 8,
      "sellUnit": "CASE",
      "unitPrice": 93.82,
      "extPrice": 750.56
    },
    {
      "text": "BG-M13-2424-6P  qty 24 each",
      "sku": "BG-M13-2424-6P",
      "sellQty": 24,
      "sellUnit": "EA",
      "unitPrice": 30.23,
      "extPrice": 725.52
    }
  ],
  "totals": {
    "subtotal": 2783.68,
    "pallets": 4,
    "volumeDiscount": 0.03,
    "freight": 380,
    "total": 3163.68
  },
  "flags": [],
  "missing": []
}
