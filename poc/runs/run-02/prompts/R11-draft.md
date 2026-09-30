Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Wade Simmons <wsimmons@palmettoair.example>
Subject: 20x25x2 MERV 13 - need your best
Received: 2026-09-30T07:55:00-04:00

Hey,

Need 30 cases of the 20x25x2 MERV 13 (PL-M13-20252). I'm getting these for $72.00 a case from another supplier so you need to be at $72 or better or I'm going with them. Ship to 302 Frontage Rd, Greenville SC 29611, need by 10/8.

Let me know today.

Wade Simmons
Owner, Palmetto Air Services
864-555-0193
---

Facts (JSON):
{
  "customerName": "Palmetto Air Services",
  "lines": [
    {
      "text": "30 cases of the 20x25x2 MERV 13 (PL-M13-20252)",
      "sku": "PL-M13-20252",
      "sellQty": 30,
      "sellUnit": "CASE",
      "unitPrice": 104.88,
      "extPrice": 3146.4
    }
  ],
  "totals": {
    "subtotal": 3146.4,
    "pallets": 1,
    "volumeDiscount": 0,
    "freight": 120,
    "total": 3266.4
  },
  "flags": [
    "below_floor"
  ],
  "missing": []
}
