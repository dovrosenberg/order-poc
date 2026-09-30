Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
---
From: Kelsey Tran <ktran@sierrabasinhvac.example>
Subject: FW: FW: filters for Washoe Cty jobs
Received: 2026-09-29T11:48:00-07:00

Hi NAF - can you quote the request at the bottom? Ship to our Sparks branch. Thx!

Kelsey Tran | Counter Sales
Sierra Basin HVAC Supply | 2380 Glendale Ave, Sparks NV 89431
775-555-0119

---------- Forwarded message ---------
From: Rob Kessler <rkessler@sierrabasinhvac.example>
Date: Tue, Sep 29, 2026 at 9:02 AM
Subject: FW: filters for Washoe Cty jobs
To: Kelsey Tran

Kelsey - can you get this to NAF? FYI last time we did this for them it was PO 44871, 22 cases, invoice came to $3,212.50 and they paid in 45 days not 30, so heads up. Also they still owe us for the 14 belts from August. Call me at x214 if questions.

Rob

---------- Forwarded message ---------
From: Gary Lindqvist <glindqvist@highdesertsvc.example>
Date: Mon, Sep 28, 2026 at 4:37 PM
Subject: filters for Washoe Cty jobs
To: Rob Kessler

Rob,

For the county buildings (Bldg 3 and Bldg 11, about 26 RTUs total) I need:

18 cases 16x25x1 MERV 8
12 cases 20x20x2 MERV 11
30 each 12x24 6 pocket bags MERV 14

Need them by Friday 10/9. Deliver to your Sparks store, we'll pick up there.

Thanks
Gary L.
High Desert Service Co.
775-555-0163
---

Facts (JSON):
{
  "customerName": "Sierra Basin HVAC Supply",
  "lines": [
    {
      "text": "18 cases 16x25x1 MERV 8",
      "sku": "PL-M8-16251",
      "sellQty": 18,
      "sellUnit": "CASE",
      "unitPrice": 31.69,
      "extPrice": 570.42
    },
    {
      "text": "12 cases 20x20x2 MERV 11",
      "sku": "PL-M11-20202",
      "sellQty": 12,
      "sellUnit": "CASE",
      "unitPrice": 64.32,
      "extPrice": 771.84
    },
    {
      "text": "30 each 12x24 6 pocket bags MERV 14",
      "sku": "BG-M14-1224-6P",
      "sellQty": 30,
      "sellUnit": "EA",
      "unitPrice": 24.13,
      "extPrice": 723.9
    }
  ],
  "totals": {
    "subtotal": 2066.16,
    "pallets": 3,
    "volumeDiscount": 0.03,
    "freight": 495,
    "total": 2561.16
  },
  "flags": [],
  "missing": []
}
