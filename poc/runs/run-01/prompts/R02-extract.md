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
From: Tanya Reyes <treyes@ridgewaymech.example>
Subject: quote - Dayton Public Library RTU job
Received: 2026-09-28T10:15:00-04:00

Hi,

Need pricing for the Dayton Public Library RTU changeout job.

- 40 single filters, 20x25x2 MERV 13
- 900 sq ft of the 45" wide MERV 8 roll media (for the make up air units)

Please deliver to our shop at 815 E Fifth St, Dayton OH 45402, need by Friday Oct 9. Job name on the quote pls: DPL RTU Changeout.

thanks
Tanya

--
Tanya Reyes | Project Coordinator
Ridgeway Mechanical Contractors
937-555-0188
Sent from my iPhone
---
