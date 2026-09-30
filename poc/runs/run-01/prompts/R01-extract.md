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
