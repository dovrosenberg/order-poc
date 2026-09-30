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
From: Darnell Pruitt <dpruitt@cumberlandmro.example>
Subject: PO pricing request - CHT items
Received: 2026-09-28T13:05:00-04:00

Hey team,

Can I get updated pricing on these before I cut the PO. Same old Chattanooga numbers we always use:

CHT-RB14-2424 - 16 ea
CHT-RB14-1224 - 8 ea
CHT-CO-2025 - 6 cs
CHT-HE-2424-G - 4 ea
CHT-BG14-2424-8 - 24 ea

Ship to our Riverfront whse (1275 Riverfront Industrial Pkwy, Chattanooga TN 37406). Need by 10/12 if possible.

Thanks,
Darnell Pruitt
Purchasing Mgr, Cumberland MRO Distribution
423-555-0170

CONFIDENTIALITY NOTICE: This e-mail is intended only for the addressee.
---
