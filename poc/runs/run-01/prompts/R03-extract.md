Extract the current request from this email. Ignore quoted earlier messages that are not the ask.

Rules:
- One line per requested item. Set text to the line as written.
- Copy qty and unit as written. Map units: case/cs -> CASE, each/ea/pcs -> EA, sq ft -> SF, linear ft/lin ft -> LF, rolls -> ROLL, pallets -> PALLET. Use null if a quantity or unit is not stated.
- Do not convert units or do any math.
- customerName, shipTo, needBy: use null if not stated.
- bidDueAt: the bid or response due date and time as ISO 8601, if stated; otherwise null.
- targetUnitPrice: only if the customer names a price they want; otherwise null.
- Give each line a confidence from 0 to 1, and a confidence for customer, shipTo and needBy.

Email:
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
