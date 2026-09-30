Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Janet Halvorsen <jhalvorsen@kettleriversd.example>
Subject: Bid #KRSD-2026-117 HVAC Filters - responses due 9/30 2:00 PM
Received: 2026-09-29T08:20:00-05:00

Good morning,

Kettle River School District is requesting pricing for HVAC filters per the attached bid tab (Bid #KRSD-2026-117). All items must meet spec section 23 41 00 as noted. Please return unit pricing per each on the bid tab.

RESPONSES ARE DUE WEDNESDAY 9/30/2026 AT 2:00 PM CENTRAL. Late responses will not be accepted.

Deliver to District Maintenance, 2100 Maintenance Way, Moose Lake MN 55767, no later than 10/23/2026. Dock hours 6:30-2:30.

Janet Halvorsen
Purchasing Coordinator
Kettle River School District
218-555-0131

--- Attachment (text) ---
BID TAB - KRSD-2026-117 - HVAC FILTERS
Bidder: ______________________

Item | Spec Ref              | Description                          | Size (nom) | Min MERV | Qty | UOM | Unit Price | Ext
-----+-----------------------+--------------------------------------+------------+----------+-----+-----+------------+-----
1    | KRSD 23 41 00 / 2.2.A | Pleated prefilter, 2in               | 20x25x2    | 8        | 240 | EA  |            |
2    | KRSD 23 41 00 / 2.2.A | Pleated prefilter, 2in               | 24x24x2    | 8        | 120 | EA  |            |
3    | KRSD 23 41 00 / 2.2.B | Pleated final, 4in                   | 24x24x4    | 13       | 60  | EA  |            |
4    | KRSD 23 41 00 / 2.2.B | Pleated final, 4in                   | 20x25x4    | 13       | 36  | EA  |            |
5    | KRSD 23 41 00 / 2.3.A | Holding frame, galvanized            | 24x24      | --       | 20  | EA  |            |

Bids due 9/30/2026 2:00 PM CST. Substitutions must meet or exceed listed min MERV.
---

Facts (JSON):
{
  "customerName": "Kettle River School District (Purchasing)",
  "lines": [
    {
      "text": "1 | KRSD 23 41 00 / 2.2.A | Pleated prefilter, 2in | 20x25x2 | Min MERV 8 | 240 EA",
      "sku": "PL-M8-20252",
      "sellQty": 20,
      "sellUnit": "CASE",
      "unitPrice": 46.15,
      "extPrice": 923
    },
    {
      "text": "2 | KRSD 23 41 00 / 2.2.A | Pleated prefilter, 2in | 24x24x2 | Min MERV 8 | 120 EA",
      "sku": "PL-M8-24242",
      "sellQty": 10,
      "sellUnit": "CASE",
      "unitPrice": 49.31,
      "extPrice": 493.1
    },
    {
      "text": "3 | KRSD 23 41 00 / 2.2.B | Pleated final, 4in | 24x24x4 | Min MERV 13 | 60 EA",
      "sku": "PL-M13-24244",
      "sellQty": 10,
      "sellUnit": "CASE",
      "unitPrice": 104.5,
      "extPrice": 1045
    },
    {
      "text": "4 | KRSD 23 41 00 / 2.2.B | Pleated final, 4in | 20x25x4 | Min MERV 13 | 36 EA",
      "sku": "PL-M13-20254",
      "sellQty": 6,
      "sellUnit": "CASE",
      "unitPrice": 97.81,
      "extPrice": 586.86
    },
    {
      "text": "5 | KRSD 23 41 00 / 2.3.A | Holding frame, galvanized | 24x24 | 20 EA",
      "sku": "FR-GV-2424",
      "sellQty": 20,
      "sellUnit": "EA",
      "unitPrice": 20.48,
      "extPrice": 409.6
    }
  ],
  "totals": {
    "subtotal": 3457.56,
    "pallets": 5,
    "volumeDiscount": 0.05,
    "freight": 475,
    "total": 3932.56
  },
  "flags": [
    "bid_deadline"
  ],
  "missing": []
}
