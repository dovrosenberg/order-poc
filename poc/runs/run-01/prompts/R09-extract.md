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
From: Amy Christensen <achristensen@summitridgefg.example>
Subject: RE: filter pricing - Millcreek office bldg
Received: 2026-09-28T14:40:00-06:00

Hi,

Following up on my voicemail. For the Millcreek office building we need:

1) 24x24x1 MERV 8 pleated - 24 each
2) 20x25x4 MERV 16 pleated - 12 each (tenant is asking for MERV 16 for the 3rd floor)

Ship to our SLC shop, 455 W 2100 S, Salt Lake City UT 84115. Need by 10/14. PO will follow once we approve the quote.

Amy Christensen
Facilities Coordinator
Summit Ridge Facilities Group

> On Fri, Sep 25, 2026, NAF Sales wrote:
> Hi Amy, happy to help, send over the list when you have it.
---
