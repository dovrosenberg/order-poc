Extract the current request from this email. Ignore quoted earlier messages that are not the ask.

Rules:
- One line per requested item. Set text to the line as written.
- Copy qty and unit as written. Map units: case/cs -> CASE, each/ea/pcs -> EA, sq ft -> SF, linear ft/lin ft -> LF, rolls -> ROLL, pallets -> PALLET. A count of filters with no unit stated ("8 of the HEPAs", a quantity column in an equipment schedule) is EA. Use null only if no quantity is stated at all.
- Do not convert units or do any math.
- customerName, shipTo, needBy: use null if not stated.
- bidDueAt: the bid or response due date and time as ISO 8601, if stated; otherwise null.
- targetUnitPrice: only if the customer names a price they want; otherwise null.
- Give each line a confidence from 0 to 1, and a confidence for customer, shipTo and needBy.

Email:
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
