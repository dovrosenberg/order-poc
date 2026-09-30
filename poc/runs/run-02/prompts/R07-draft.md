Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Cheryl Ambrose <cambrose@stbrendanmed.example>
Subject: Filters for OR 4 air handler
Received: 2026-09-30T08:05:00-05:00

Hello,

Facilities is replacing filters on the air handler serving OR 4 and OR 5. Could you recommend and quote the best filters for a hospital operating room air handler? Our engineer says the terminal filters need to meet SBRMC 23 41 33 / 2.1.A and the final bank is SBRMC 23 41 00 / 2.2.C.

I think it's 8 of the terminal HEPAs (24x24) and 8 of the finals (also 24x24) but I'm not 100% sure, maintenance is double-checking.

Deliver to Central Receiving, 900 Medical Center Dr, Huntsville AL 35801 by 10/16.

Thank you,
Cheryl Ambrose
Facilities Bid Desk
St. Brendan Regional Medical Center
256-555-0104
---

Facts (JSON):
{
  "customerName": "St. Brendan Regional Medical Center (Facilities Bid Desk)",
  "lines": [
    {
      "text": "8 of the terminal HEPAs (24x24) - must meet SBRMC 23 41 33 / 2.1.A",
      "sku": "HP-9997-242412-SG",
      "sellQty": 8,
      "sellUnit": "EA",
      "unitPrice": 399.48,
      "extPrice": 3195.84
    },
    {
      "text": "8 of the finals (also 24x24) - final bank, SBRMC 23 41 00 / 2.2.C",
      "sku": "BX-M14-242412",
      "sellQty": 8,
      "sellUnit": "EA",
      "unitPrice": 78.53,
      "extPrice": 628.24
    }
  ],
  "totals": {
    "subtotal": 3824.08,
    "pallets": 2,
    "volumeDiscount": 0.03,
    "freight": 240,
    "total": 4064.08
  },
  "flags": [
    "low_confidence",
    "short_stock"
  ],
  "missing": []
}
