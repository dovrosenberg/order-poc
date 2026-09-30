Match each requested line to a SKU in the catalog below.

Method:
1. Look for an exact SKU or an alias first.
2. Otherwise use the spec crosswalk, or nominal size + MERV + family.
3. If the requested item is not made by this company, set sku to null. Put the nearest alternative SKU in alternatives. Set substitution to true only if you propose an alternative as the sku.
4. Set confidence below 0.7 when the request is vague or several SKUs fit.
5. Give a one-line reason.

Return exactly one match per line, with lineIndex equal to the line number. Use only SKUs from the catalog.

Catalog (CSV):
sku,name,family,merv,nominalSize,actualSize,sellUnit,unitsPerSell,specNotes
PL-M8-16201,Pleated Panel Filter MERV 8 16x20x1,pleated,8,16x20x1,15.5x19.5x0.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 1"" depth"
PL-M8-16251,Pleated Panel Filter MERV 8 16x25x1,pleated,8,16x25x1,15.5x24.5x0.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 1"" depth"
PL-M8-20201,Pleated Panel Filter MERV 8 20x20x1,pleated,8,20x20x1,19.5x19.5x0.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 1"" depth"
PL-M8-20251,Pleated Panel Filter MERV 8 20x25x1,pleated,8,20x25x1,19.5x24.5x0.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 1"" depth"
PL-M8-16252,Pleated Panel Filter MERV 8 16x25x2,pleated,8,16x25x2,15.5x24.5x1.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 2"" depth"
PL-M8-20252,Pleated Panel Filter MERV 8 20x25x2,pleated,8,20x25x2,19.5x24.5x1.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 2"" depth"
PL-M8-24242,Pleated Panel Filter MERV 8 24x24x2,pleated,8,24x24x2,23.5x23.5x1.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 2"" depth"
PL-M8-20202,Pleated Panel Filter MERV 8 20x20x2,pleated,8,20x20x2,19.5x19.5x1.75,CASE,12 EA,"MERV 8; initial resistance 0.22 in. w.g. @ 300 fpm; beverage-board frame; 2"" depth"
PL-M11-16202,Pleated Panel Filter MERV 11 16x20x2,pleated,11,16x20x2,15.5x19.5x1.75,CASE,12 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 2"" depth"
PL-M11-16252,Pleated Panel Filter MERV 11 16x25x2,pleated,11,16x25x2,15.5x24.5x1.75,CASE,12 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 2"" depth"
PL-M11-20202,Pleated Panel Filter MERV 11 20x20x2,pleated,11,20x20x2,19.5x19.5x1.75,CASE,12 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 2"" depth"
PL-M11-20252,Pleated Panel Filter MERV 11 20x25x2,pleated,11,20x25x2,19.5x24.5x1.75,CASE,12 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 2"" depth"
PL-M11-24242,Pleated Panel Filter MERV 11 24x24x2,pleated,11,24x24x2,23.5x23.5x1.75,CASE,12 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 2"" depth"
PL-M11-20254,Pleated Panel Filter MERV 11 20x25x4,pleated,11,20x25x4,19.5x24.5x3.75,CASE,6 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 4"" depth"
PL-M11-24244,Pleated Panel Filter MERV 11 24x24x4,pleated,11,24x24x4,23.5x23.5x3.75,CASE,6 EA,"MERV 11; initial resistance 0.27 in. w.g. @ 300 fpm; moisture-resistant beverage-board frame; 4"" depth"
PL-M13-16252,Pleated Panel Filter MERV 13 16x25x2,pleated,13,16x25x2,15.5x24.5x1.75,CASE,12 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 2"" depth"
PL-M13-20202,Pleated Panel Filter MERV 13 20x20x2,pleated,13,20x20x2,19.5x19.5x1.75,CASE,12 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 2"" depth"
PL-M13-20252,Pleated Panel Filter MERV 13 20x25x2,pleated,13,20x25x2,19.5x24.5x1.75,CASE,12 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 2"" depth"
PL-M13-24242,Pleated Panel Filter MERV 13 24x24x2,pleated,13,24x24x2,23.5x23.5x1.75,CASE,12 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 2"" depth"
PL-M13-16254,Pleated Panel Filter MERV 13 16x25x4,pleated,13,16x25x4,15.5x24.5x3.75,CASE,6 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 4"" depth"
PL-M13-20204,Pleated Panel Filter MERV 13 20x20x4,pleated,13,20x20x4,19.5x19.5x3.75,CASE,6 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 4"" depth"
PL-M13-20254,Pleated Panel Filter MERV 13 20x25x4,pleated,13,20x25x4,19.5x24.5x3.75,CASE,6 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 4"" depth"
PL-M13-24244,Pleated Panel Filter MERV 13 24x24x4,pleated,13,24x24x4,23.5x23.5x3.75,CASE,6 EA,"MERV 13; initial resistance 0.31 in. w.g. @ 300 fpm; high-wet-strength board frame; 4"" depth"
BG-M13-2424-6P,Bag Filter MERV 13 6-Pocket 24x24x15,bag,13,24x24x15,23.375x23.375x15,EA,1 EA,MERV 13; 6 pockets; synthetic media; initial resistance 0.30 in. w.g. @ 500 fpm; galvanized header
BG-M13-1224-6P,Bag Filter MERV 13 6-Pocket 12x24x15,bag,13,12x24x15,11.375x23.375x15,EA,1 EA,MERV 13; 6 pockets; synthetic media; initial resistance 0.30 in. w.g. @ 500 fpm; galvanized header
BG-M13-2424-8P,Bag Filter MERV 13 8-Pocket 24x24x22,bag,13,24x24x22,23.375x23.375x22,EA,1 EA,MERV 13; 8 pockets; synthetic media; initial resistance 0.30 in. w.g. @ 500 fpm; galvanized header
BG-M13-1224-8P,Bag Filter MERV 13 8-Pocket 12x24x22,bag,13,12x24x22,11.375x23.375x22,EA,1 EA,MERV 13; 8 pockets; synthetic media; initial resistance 0.30 in. w.g. @ 500 fpm; galvanized header
BG-M14-2424-6P,Bag Filter MERV 14 6-Pocket 24x24x15,bag,14,24x24x15,23.375x23.375x15,EA,1 EA,MERV 14; 6 pockets; synthetic media; initial resistance 0.38 in. w.g. @ 500 fpm; galvanized header
BG-M14-1224-6P,Bag Filter MERV 14 6-Pocket 12x24x15,bag,14,12x24x15,11.375x23.375x15,EA,1 EA,MERV 14; 6 pockets; synthetic media; initial resistance 0.38 in. w.g. @ 500 fpm; galvanized header
BG-M14-2424-8P,Bag Filter MERV 14 8-Pocket 24x24x22,bag,14,24x24x22,23.375x23.375x22,EA,1 EA,MERV 14; 8 pockets; synthetic media; initial resistance 0.38 in. w.g. @ 500 fpm; galvanized header
BG-M14-1224-8P,Bag Filter MERV 14 8-Pocket 12x24x22,bag,14,12x24x22,11.375x23.375x22,EA,1 EA,MERV 14; 8 pockets; synthetic media; initial resistance 0.38 in. w.g. @ 500 fpm; galvanized header
BX-M14-242412,Rigid Box Filter MERV 14 24x24x12,box,14,24x24x12,23.5x23.5x11.5,EA,1 EA,"MERV 14; 90-95% ASHRAE dust spot; initial resistance 0.42 in. w.g. @ 500 fpm; single header, plastic frame"
BX-M14-122412,Rigid Box Filter MERV 14 12x24x12,box,14,12x24x12,11.5x23.5x11.5,EA,1 EA,"MERV 14; 90-95% ASHRAE dust spot; initial resistance 0.42 in. w.g. @ 500 fpm; single header, plastic frame"
HP-9997-242412-G,HEPA Filter 99.97% 24x24x11.5 Galvanized Frame,hepa,,24x24x12,23.375x23.375x11.5,EA,1 EA,99.97% @ 0.3 micron; initial resistance 1.0 in. w.g. @ 250 fpm; galvanized steel frame; neoprene gasket
HP-9997-242412-SG,HEPA Filter 99.97% 24x24x11.5 Stainless Gel-Seal,hepa,,24x24x12,23.375x23.375x11.5,EA,1 EA,99.97% @ 0.3 micron; initial resistance 1.0 in. w.g. @ 250 fpm; stainless steel frame; gel seal; for surgical/cleanroom terminal housings
CB-M8-20252,Pleated Carbon Odor Filter 20x25x2,carbon,8,20x25x2,19.5x24.5x1.75,CASE,12 EA,"MERV 8; activated carbon impregnated pleated media, 200 g/SF carbon; initial resistance 0.30 in. w.g. @ 300 fpm"
CB-M8-24242,Pleated Carbon Odor Filter 24x24x2,carbon,8,24x24x2,23.5x23.5x1.75,CASE,12 EA,"MERV 8; activated carbon impregnated pleated media, 200 g/SF carbon; initial resistance 0.30 in. w.g. @ 300 fpm"
FR-GV-2424,Holding Frame Galvanized 24x24,frame,,24x24,23.75x23.75x4.75,EA,1 EA,"16-ga galvanized steel; accepts 2"", 4"" and header filters with clips; universal holding frame"
FR-GV-1224,Holding Frame Galvanized 12x24,frame,,12x24,11.75x23.75x4.75,EA,1 EA,"16-ga galvanized steel; accepts 2"", 4"" and header filters with clips; universal holding frame"
RM-M8-3090,"Roll Media MERV 8 Synthetic 30"" x 90'",media,8,30in x 90ft,30in x 90ft,ROLL,225 SF; 90 LF,"MERV 8 synthetic polyester, 1"" loft, tackified; 225 SF per roll"
RM-M8-4590,"Roll Media MERV 8 Synthetic 45"" x 90'",media,8,45in x 90ft,45in x 90ft,ROLL,337.5 SF; 90 LF,"MERV 8 synthetic polyester, 1"" loft, tackified; 337.5 SF per roll"

Aliases (CSV):
alias,sku,source
CHT-RB14-2424,BX-M14-242412,plant2
CHT-RB14-1224,BX-M14-122412,plant2
CHT-CO-2025,CB-M8-20252,plant2
CHT-CO-2424,CB-M8-24242,plant2
CHT-HE-2424-G,HP-9997-242412-G,plant2
CHT-HE-2424-SG,HP-9997-242412-SG,plant2
CHT-BG14-2424-8,BG-M14-2424-8P,plant2
CHT-BG14-1224-8,BG-M14-1224-8P,plant2
CHT-BG14-2424-6,BG-M14-2424-6P,plant2
CHT-BG14-1224-6,BG-M14-1224-6P,plant2
CHT-BG13-2424-8,BG-M13-2424-8P,plant2
CHT-BG13-1224-8,BG-M13-1224-8P,plant2
CHT-BG13-2424-6,BG-M13-2424-6P,plant2
CHT-BG13-1224-6,BG-M13-1224-6P,plant2
400112,BX-M14-242412,plant2
400113,BX-M14-122412,plant2
410240,HP-9997-242412-G,plant2
410241,HP-9997-242412-SG,plant2
420250,CB-M8-20252,plant2
420240,CB-M8-24242,plant2
430288,BG-M14-2424-8P,plant2
RNO-8-16201,PL-M8-16201,plant3
RNO-8-16251,PL-M8-16251,plant3
RNO-8-20201,PL-M8-20201,plant3
RNO-8-20251,PL-M8-20251,plant3
RNO-8-16252,PL-M8-16252,plant3
RNO-8-20252,PL-M8-20252,plant3
RNO-8-20202,PL-M8-20202,plant3
RNO-8-24242,PL-M8-24242,plant3
RNO-11-20252,PL-M11-20252,plant3
RNO-11-24242,PL-M11-24242,plant3
RNO-11-20254,PL-M11-20254,plant3
RNO-11-24244,PL-M11-24244,plant3
RNO-13-16252,PL-M13-16252,plant3
RNO-13-20252,PL-M13-20252,plant3
RNO-13-24242,PL-M13-24242,plant3
RNO-13-20254,PL-M13-20254,plant3
RNO-13-24244,PL-M13-24244,plant3
RNO-MR30,RM-M8-3090,plant3
RNO-MR45,RM-M8-4590,plant3
M8 20x25x1,PL-M8-20251,customer
2in MERV8 24x24,PL-M8-24242,customer
6pk bag 24x24 M13,BG-M13-2424-6P,customer
20x25x2 M8,PL-M8-20252,customer
16x25x1 M8,PL-M8-16251,customer
MERV8 16x20x1,PL-M8-16201,customer
20x20x1 pleated,PL-M8-20201,customer
M11 20x20x2,PL-M11-20202,customer
24x24x2 MERV 11,PL-M11-24242,customer
2in M13 16x25,PL-M13-16252,customer
4in MERV13 20x25,PL-M13-20254,customer
MERV 13 24x24x4,PL-M13-24244,customer
8pk bag 24x24 M14,BG-M14-2424-8P,customer

Spec crosswalk (CSV):
code,issuer,description,minMerv,filterType,acceptableSkus
KRSD 23 41 00 / 2.2.A,school_district,"2"" pleated prefilter, MERV 8 minimum",8,pleated,PL-M8-16252; PL-M8-20252; PL-M8-24242; PL-M8-20202; PL-M11-16202; PL-M11-16252; PL-M11-20202; PL-M11-20252; PL-M11-24242; PL-M13-16252; PL-M13-20202; PL-M13-20252; PL-M13-24242
KRSD 23 41 00 / 2.2.B,school_district,"4"" pleated final filter, MERV 13 minimum",13,pleated,PL-M13-16254; PL-M13-20204; PL-M13-20254; PL-M13-24244
KRSD 23 41 00 / 2.3.A,school_district,Galvanized holding frame,0,frame,FR-GV-2424; FR-GV-1224
SBRMC 23 41 33 / 2.1.A,hospital,"HEPA 99.97% @ 0.3 micron terminal filter, surgical suites",16,hepa,HP-9997-242412-G; HP-9997-242412-SG
SBRMC 23 41 00 / 2.2.C,hospital,"MERV 14 final filter, bag or rigid box",14,box,BX-M14-242412; BX-M14-122412; BG-M14-2424-6P; BG-M14-1224-6P; BG-M14-2424-8P; BG-M14-1224-8P
SBRMC 23 41 00 / 2.1.A,hospital,"2"" pleated prefilter ahead of final filter bank, MERV 8 minimum",8,pleated,PL-M8-16252; PL-M8-20252; PL-M8-24242; PL-M8-20202; PL-M11-16202; PL-M11-16252; PL-M11-20202; PL-M11-20252; PL-M11-24242; PL-M13-16252; PL-M13-20202; PL-M13-20252; PL-M13-24242
PVRH 23 41 00 / 2.1.A,hospital,"4"" pleated prefilter, MERV 13 minimum",13,pleated,PL-M13-16254; PL-M13-20204; PL-M13-20254; PL-M13-24244
PVRH 23 41 00 / 2.2.A,hospital,"Bag final filter, MERV 14 minimum",14,bag,BG-M14-2424-6P; BG-M14-1224-6P; BG-M14-2424-8P; BG-M14-1224-8P
PVRH 23 41 33 / 2.1.B,hospital,"HEPA 99.97% @ 0.3 micron, airborne isolation room exhaust",16,hepa,HP-9997-242412-G; HP-9997-242412-SG
LVUSD 23 41 00 / 2.1.A,school_district,"1"" pleated return grille filter, MERV 8 minimum",8,pleated,PL-M8-16201; PL-M8-16251; PL-M8-20201; PL-M8-20251
LVUSD 23 41 00 / 2.1.B,school_district,"2"" pleated classroom unit ventilator filter, MERV 11 minimum",11,pleated,PL-M11-16202; PL-M11-16252; PL-M11-20202; PL-M11-20252; PL-M11-24242; PL-M13-16252; PL-M13-20202; PL-M13-20252; PL-M13-24242
LVUSD 23 41 00 / 2.2.A,school_district,"Bag final filter for AHUs, MERV 13 minimum",13,bag,BG-M13-2424-6P; BG-M13-1224-6P; BG-M13-2424-8P; BG-M13-1224-8P; BG-M14-2424-6P; BG-M14-1224-6P; BG-M14-2424-8P; BG-M14-1224-8P
LVUSD 23 41 00 / 2.4.A,school_district,"Kitchen hood makeup air odor filter, activated carbon pleated",8,carbon,CB-M8-20252; CB-M8-24242
CITY-WB 23 41 00 / 2.1.A,municipal,"Synthetic roll media for makeup air units, MERV 8 minimum",8,media,RM-M8-3090; RM-M8-4590
CITY-WB 23 41 00 / 2.2.A,municipal,"4"" pleated filter, MERV 11 minimum",11,pleated,PL-M11-20254; PL-M11-24244; PL-M13-16254; PL-M13-20204; PL-M13-20254; PL-M13-24244
CITY-WB 23 41 00 / 2.2.B,municipal,"2"" pleated filter, public library, MERV 13 minimum",13,pleated,PL-M13-16252; PL-M13-20202; PL-M13-20252; PL-M13-24242
CITY-WB 23 41 00 / 2.3.A,municipal,"Galvanized holding frame, 16-ga minimum",0,frame,FR-GV-2424; FR-GV-1224
CITY-WB 23 41 00 / 2.5.A,municipal,"Activated carbon odor filter, wastewater plant admin building",8,carbon,CB-M8-20252; CB-M8-24242

Lines:
0: PL-M8-20251   qty 20 cases (qty=20, unit=CASE)
1: PL-M11-20252  qty 10 cases (qty=10, unit=CASE)
2: PL-M13-24242  qty 8 cases (qty=8, unit=CASE)
3: BG-M13-2424-6P  qty 24 each (qty=24, unit=EA)
