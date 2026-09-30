# Scorecard: run-01

| Metric | Hits | Total | Score |
| --- | --- | --- | --- |
| Classification accuracy | 12 | 12 | 100.0% |
| SKU match accuracy | 44 | 45 | 97.8% |
| Quantity/unit accuracy | 28 | 45 | 62.2% |
| Flag recall | 8 | 9 | 88.9% |

## Misses (21)

| Request | Cause | Expected | Got | Detail |
| --- | --- | --- | --- | --- |
| R04 | extra_flag | - | short_stock | not scored |
| R07 | qty_unit | HP-9997-242412-SG 8 EA | HP-9997-242412-SG 8 ? | "8 of the terminal HEPAs (24x24) - must meet SBRMC 23 41 33 / 2.1.A" |
| R07 | qty_unit | BX-M14-242412 8 EA | BX-M14-242412 8 ? | "8 of the finals (also 24x24) - final bank, SBRMC 23 41 00 / 2.2.C" |
| R09 | wrong_sku | PL-M13-20254 12 EA | no match 12 EA | "20x25x4 MERV 16 pleated - 12 each (tenant is asking for MERV 16 for the 3rd floor)" — No pleated filter above MERV 13 is made. The 20x25x4 MERV 13 is the closest, and the MERV 16 request would need HEPA, which is a different product. |
| R09 | missing_flag | substitution | low_confidence, no_match |  |
| R09 | extra_flag | no_match, substitution | low_confidence | not scored |
| R12 | qty_unit | PL-M8-20252 12 EA | PL-M8-20252 12 ? | "AHU-1 prefilter: 2" pleated MERV 8, 20x25x2" |
| R12 | qty_unit | PL-M13-20252 12 EA | PL-M13-20252 12 ? | "AHU-1 final filter: RNO-13-20252" |
| R12 | qty_unit | PL-M8-16251 16 EA | PL-M8-16251 16 ? | "AHU-2 prefilter: RNO-8-16251" |
| R12 | qty_unit | PL-M13-24244 6 EA | PL-M13-24244 6 ? | "AHU-2 final filter: 4" pleated MERV 13, 24x24x4" |
| R12 | qty_unit | PL-M8-24242 9 EA | PL-M8-24242 9 ? | "AHU-3 prefilter: 2" pleated MERV 8, 24x24x2" |
| R12 | qty_unit | BG-M14-2424-8P 9 EA | BG-M14-2424-8P 9 ? | "AHU-3 final filter: Bag MERV 14, 8 pocket, 24x24" |
| R12 | qty_unit | no match 8 EA | no match 8 ? | "AHU-4 prefilter: 2" pleated MERV 8, 18x24x2 (odd size - customer asks what we can do)" |
| R12 | qty_unit | PL-M13-20204 8 EA | PL-M13-20204 8 ? | "AHU-4 final filter: 4" pleated MERV 13, 20x20x4" |
| R12 | qty_unit | PL-M8-20252 6 EA | PL-M8-20252 6 ? | "AHU-5 prefilter: 2" pleated MERV 8, 20x25x2" |
| R12 | qty_unit | PL-M11-20254 6 EA | PL-M11-20254 6 ? | "AHU-5 final filter: 4" pleated MERV 11, 20x25x4" |
| R12 | qty_unit | PL-M8-16252 10 EA | PL-M8-16252 10 ? | "AHU-6 prefilter: 2" pleated MERV 8, 16x25x2" |
| R12 | qty_unit | PL-M13-16254 10 EA | PL-M13-16254 10 ? | "AHU-6 final filter: 4" pleated MERV 13, 16x25x4" |
| R12 | qty_unit | PL-M13-20252 12 EA | PL-M13-20252 12 ? | "AHU-7 final filter: RNO-13-20252" |
| R12 | qty_unit | PL-M8-24242 4 EA | PL-M8-24242 4 ? | "AHU-8 prefilter: 2" pleated MERV 8, 24x24x2" |
| R12 | qty_unit | BX-M14-242412 4 EA | BX-M14-242412 4 ? | "AHU-8 final filter: Rigid box MERV 14, 24x24x12" |
