Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
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

Facts (JSON):
{
  "customerName": "Summit Ridge Facilities Group",
  "lines": [
    {
      "text": "24x24x1 MERV 8 pleated - 24 each",
      "sku": null,
      "sellQty": 0,
      "sellUnit": null,
      "unitPrice": 0,
      "extPrice": 0
    },
    {
      "text": "20x25x4 MERV 16 pleated - 12 each (tenant is asking for MERV 16 for the 3rd floor)",
      "sku": "PL-M13-20254",
      "sellQty": 2,
      "sellUnit": "CASE",
      "unitPrice": 111.15,
      "extPrice": 222.3
    }
  ],
  "totals": {
    "subtotal": 222.3,
    "pallets": 1,
    "volumeDiscount": 0,
    "freight": 165,
    "total": 387.3
  },
  "flags": [
    "no_match",
    "substitution"
  ],
  "missing": []
}
