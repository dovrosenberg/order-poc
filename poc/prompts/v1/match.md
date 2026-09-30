Match each requested line to a SKU in the catalog below.

Method:
1. Look for an exact SKU or an alias first.
2. Otherwise use the spec crosswalk, or nominal size + MERV + family.
3. If the requested item is not made by this company, set sku to null. Put the nearest alternative SKU in alternatives. Set substitution to true only if you propose an alternative as the sku.
4. Set confidence below 0.7 when the request is vague or several SKUs fit.
5. Give a one-line reason.

Return exactly one match per line, with lineIndex equal to the line number. Use only SKUs from the catalog.

Catalog (CSV):
{{products}}

Aliases (CSV):
{{aliases}}

Spec crosswalk (CSV):
{{specs}}

Lines:
{{lines}}
