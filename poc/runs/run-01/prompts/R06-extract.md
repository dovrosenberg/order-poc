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
