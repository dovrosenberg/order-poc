Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
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

Facts (JSON):
{
  "customerName": "Cumberland MRO Distribution",
  "lines": [
    {
      "text": "CHT-RB14-2424 - 16 ea",
      "sku": "BX-M14-242412",
      "sellQty": 16,
      "sellUnit": "EA",
      "unitPrice": 71.67,
      "extPrice": 1146.72
    },
    {
      "text": "CHT-RB14-1224 - 8 ea",
      "sku": "BX-M14-122412",
      "sellQty": 8,
      "sellUnit": "EA",
      "unitPrice": 47.52,
      "extPrice": 380.16
    },
    {
      "text": "CHT-CO-2025 - 6 cs",
      "sku": "CB-M8-20252",
      "sellQty": 6,
      "sellUnit": "CASE",
      "unitPrice": 144.89,
      "extPrice": 869.34
    },
    {
      "text": "CHT-HE-2424-G - 4 ea",
      "sku": "HP-9997-242412-G",
      "sellQty": 4,
      "sellUnit": "EA",
      "unitPrice": 247.72,
      "extPrice": 990.88
    },
    {
      "text": "CHT-BG14-2424-8 - 24 ea",
      "sku": "BG-M14-2424-8P",
      "sellQty": 24,
      "sellUnit": "EA",
      "unitPrice": 43,
      "extPrice": 1032
    }
  ],
  "totals": {
    "subtotal": 4419.1,
    "pallets": 5,
    "volumeDiscount": 0.05,
    "freight": 600,
    "total": 5019.1
  },
  "flags": [],
  "missing": []
}
