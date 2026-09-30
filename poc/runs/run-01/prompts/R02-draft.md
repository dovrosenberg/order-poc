Write a short, plain reply email to this customer quote request.

Rules:
- Use only the numbers in the facts below, exactly as given. Never calculate a new number.
- If "missing" is not empty, ask only for those fields.
- If flags include no_match, substitution or short_stock, say so plainly for the affected lines.
- Do not invent lead times, terms or discounts.
- Sign off as "Northfield Air Filtration Sales".

Original email:
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

Facts (JSON):
{
  "customerName": "Ridgeway Mechanical Contractors",
  "lines": [
    {
      "text": "40 single filters, 20x25x2 MERV 13",
      "sku": "PL-M13-20252",
      "sellQty": 4,
      "sellUnit": "CASE",
      "unitPrice": 94.24,
      "extPrice": 376.96
    },
    {
      "text": "900 sq ft of the 45\" wide MERV 8 roll media (for the make up air units)",
      "sku": "RM-M8-4590",
      "sellQty": 3,
      "sellUnit": "ROLL",
      "unitPrice": 70,
      "extPrice": 210
    }
  ],
  "totals": {
    "subtotal": 586.96,
    "pallets": 2,
    "volumeDiscount": 0.03,
    "freight": 190,
    "total": 776.96
  },
  "flags": [],
  "missing": []
}
