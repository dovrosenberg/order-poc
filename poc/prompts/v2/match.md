Match each requested line to a SKU in the catalog below.

Method:
1. Look for an exact SKU or an alias first.
2. Otherwise use the spec crosswalk, or nominal size + MERV + family.
3. If the requested size is not made, set sku to null and put the nearest alternative SKU in alternatives. substitution is false.
4. If the size and filter type are made but the requested MERV rating is not, propose the same size and type at the nearest MERV that is made as the sku, and set substitution to true. Say so in the reason.
5. Set confidence below 0.7 when the request is vague or several SKUs fit.
6. Give a one-line reason.

Return exactly one match per line, with lineIndex equal to the line number. Use only SKUs from the catalog.

Catalog (CSV):
{{products}}

Aliases (CSV):
{{aliases}}

Spec crosswalk (CSV):
{{specs}}

Lines:
{{lines}}
