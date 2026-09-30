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
