<template>
  <div class="narration">
    <p>
      I asked Claude to make up a fictional commercial air filter manufacturer with a common problem: quote requests
      piling up as reps translate messy emails (spec references, legacy part numbers, odd units) into priced quotes.
      I wanted a POC that reads the email, matches each line to the catalog, converts units, checks stock by plant,
      prices it, flags problems, and drafts a reply.
    </p>
    <p>
      One thing I did not automate here but did check by hand is cost. Running the full workflow on one incoming email
      costs about 5 cents in model calls.
    </p>
  </div>
</template>
