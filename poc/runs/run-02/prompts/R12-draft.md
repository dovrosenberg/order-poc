Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Jordan Pike <jpike@tricountymech.example>
Subject: Maricopa Clinic reno - AHU filters per M-601
Received: 2026-09-30T12:34:00-07:00

NAF,

Attached is the AHU schedule off sheet M-601 for the Maricopa Community Clinic reno. Please quote one full set of filters for AHU-1 thru AHU-8, prefilters and finals, per the schedule. Note AHU-7 uses your RNO roll media and we need 400 LF of it.

Ship direct to the jobsite, NOT our shop - I'll get you the site address once the GC confirms which gate deliveries go to. Timing depends on when TAB is scheduled, prob mid/late Oct, will confirm.

Also, AHU-4 prefilter is an odd size, let me know what you can do.

Jordan Pike
Estimator / PM
Tri-County Mechanical
602-555-0148
"If it moves air, we move it." 

--- Attachment (text) ---
MECHANICAL EQUIPMENT SCHEDULE - AIR HANDLING UNITS (FILTER DATA)
Project: Maricopa Community Clinic Renovation   Sheet M-601   Rev 2

TAG   | SERVES           | PREFILTER                              | QTY | FINAL FILTER                          | QTY
------+------------------+----------------------------------------+-----+---------------------------------------+----
AHU-1 | Lobby/Admin      | 2" pleated MERV 8, 20x25x2             | 12  | RNO-13-20252                          | 12
AHU-2 | Exam wing A      | RNO-8-16251                            | 16  | 4" pleated MERV 13, 24x24x4           | 6
AHU-3 | Exam wing B      | 2" pleated MERV 8, 24x24x2             | 9   | Bag MERV 14, 8 pocket, 24x24          | 9
AHU-4 | Imaging          | 2" pleated MERV 8, 18x24x2             | 8   | 4" pleated MERV 13, 20x20x4           | 8
AHU-5 | Lab              | 2" pleated MERV 8, 20x25x2             | 6   | 4" pleated MERV 11, 20x25x4           | 6
AHU-6 | Offices 2nd fl   | 2" pleated MERV 8, 16x25x2             | 10  | 4" pleated MERV 13, 16x25x4           | 10
AHU-7 | Kitchen/MAU      | RNO-MR30 roll media, cut to fit        | 400 LF | RNO-13-20252                       | 12
AHU-8 | Pharmacy         | 2" pleated MERV 8, 24x24x2             | 4   | Rigid box MERV 14, 24x24x12           | 4

NOTES: 1. Filter qty is per unit, one full set each.  2. Filter sizes nominal.  3. Provide one spare set of prefilters for AHU-1 only (by owner, NIC).
---

Facts (JSON):
{
  "customerName": "Tri-County Mechanical",
  "lines": [
    {
      "text": "AHU-1 prefilter: 2\" pleated MERV 8, 20x25x2",
      "sku": "PL-M8-20252",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 44.69,
      "extPrice": 44.69
    },
    {
      "text": "AHU-1 final: RNO-13-20252",
      "sku": "PL-M13-20252",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 89.38,
      "extPrice": 89.38
    },
    {
      "text": "AHU-2 prefilter: RNO-8-16251",
      "sku": "PL-M8-16251",
      "sellQty": 2,
      "sellUnit": "CASE",
      "unitPrice": 30.06,
      "extPrice": 60.12
    },
    {
      "text": "AHU-2 final: 4\" pleated MERV 13, 24x24x4",
      "sku": "PL-M13-24244",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 101.2,
      "extPrice": 101.2
    },
    {
      "text": "AHU-3 prefilter: 2\" pleated MERV 8, 24x24x2",
      "sku": "PL-M8-24242",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 47.75,
      "extPrice": 47.75
    },
    {
      "text": "AHU-3 final: Bag MERV 14, 8 pocket, 24x24",
      "sku": "BG-M14-2424-8P",
      "sellQty": 9,
      "sellUnit": "EA",
      "unitPrice": 44.69,
      "extPrice": 402.21
    },
    {
      "text": "AHU-4 prefilter: 2\" pleated MERV 8, 18x24x2",
      "sku": null,
      "sellQty": 0,
      "sellUnit": null,
      "unitPrice": 0,
      "extPrice": 0
    },
    {
      "text": "AHU-4 final: 4\" pleated MERV 13, 20x20x4",
      "sku": "PL-M13-20204",
      "sellQty": 2,
      "sellUnit": "CASE",
      "unitPrice": 86.2,
      "extPrice": 172.4
    },
    {
      "text": "AHU-5 prefilter: 2\" pleated MERV 8, 20x25x2",
      "sku": "PL-M8-20252",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 44.69,
      "extPrice": 44.69
    },
    {
      "text": "AHU-5 final: 4\" pleated MERV 11, 20x25x4",
      "sku": "PL-M11-20254",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 67.03,
      "extPrice": 67.03
    },
    {
      "text": "AHU-6 prefilter: 2\" pleated MERV 8, 16x25x2",
      "sku": "PL-M8-16252",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 40.67,
      "extPrice": 40.67
    },
    {
      "text": "AHU-6 final: 4\" pleated MERV 13, 16x25x4",
      "sku": "PL-M13-16254",
      "sellQty": 2,
      "sellUnit": "CASE",
      "unitPrice": 86.2,
      "extPrice": 172.4
    },
    {
      "text": "AHU-7 prefilter: RNO-MR30 roll media, cut to fit",
      "sku": "RM-M8-3090",
      "sellQty": 5,
      "sellUnit": "ROLL",
      "unitPrice": 46.96,
      "extPrice": 234.8
    },
    {
      "text": "AHU-7 final: RNO-13-20252",
      "sku": "PL-M13-20252",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 89.38,
      "extPrice": 89.38
    },
    {
      "text": "AHU-8 prefilter: 2\" pleated MERV 8, 24x24x2",
      "sku": "PL-M8-24242",
      "sellQty": 1,
      "sellUnit": "CASE",
      "unitPrice": 47.75,
      "extPrice": 47.75
    },
    {
      "text": "AHU-8 final: Rigid box MERV 14, 24x24x12",
      "sku": "BX-M14-242412",
      "sellQty": 4,
      "sellUnit": "EA",
      "unitPrice": 74.48,
      "extPrice": 297.92
    }
  ],
  "totals": {
    "subtotal": 1912.39,
    "pallets": 15,
    "volumeDiscount": 0.08,
    "freight": 2475,
    "total": 4387.39
  },
  "flags": [
    "missing_info",
    "no_match"
  ],
  "missing": [
    "delivery date"
  ]
}
