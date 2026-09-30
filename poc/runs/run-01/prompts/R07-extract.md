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
