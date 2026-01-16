# Data-Miner Directive: BEGIN BACKGROUND INGESTION

**Issued:** 2026-01-16
**Status:** ACTIVE
**Priority:** HIGH

---

## Command

```
BEGIN BACKGROUND INGESTION
```

You are authorized to begin scraping all 138 cities in the remaining cities list.

---

## Source of Truth

```
data/packs/scratchanddentfinder-remaining-cities.ts
```

**DO NOT** maintain a separate copy. Import directly from this file.

---

## City Count

| Category | Count |
|----------|-------|
| Cities to scrape | 138 |
| Already configured (DO NOT re-scrape) | 35 |
| Total coverage after completion | 173 |

---

## Search Queries (LOCKED)

Use ONLY these queries per city:

```json
[
  "scratch and dent appliances",
  "used appliance store",
  "discount appliance outlet"
]
```

**No additions or deviations.**

---

## Batch Strategy

Process cities in 7 batches of 20-25 cities each:

| Batch | States | Est. Cities |
|-------|--------|-------------|
| 1 | AL, AK, AZ, AR, CA (partial) | ~25 |
| 2 | CA (rest), CO, CT, DE, FL (partial) | ~25 |
| 3 | FL (rest), GA, HI, ID, IL, IN, IA, KS | ~25 |
| 4 | KY, LA, ME, MA, MI, MN, MS, MT | ~20 |
| 5 | NE, NV, NH, NJ, NM, NY, NC | ~20 |
| 6 | ND, OH, OK, OR, PA, RI, SC, SD, TN | ~20 |
| 7 | TX, UT, VT, VA, WA, WV, WI, WY | ~18 |

**Priority order:** Process batches 1-7 sequentially. Each batch must complete before starting the next.

---

## Output Requirements

### Per Batch

```
outputs/2026-01-XX/batch-NN/
├── canonical.json      # All places found
└── manifest.json       # Batch metadata
```

### canonical.json Format

```json
{
  "places": [
    {
      "name": "Store Name",
      "address": "123 Main St",
      "city": "City",
      "state_code": "ST",
      "zip": "12345",
      "phone": "+1-555-123-4567",
      "website": "https://example.com",
      "lat": 40.7128,
      "lng": -74.0060,
      "google_place_id": "ChIJ...",
      "confidence": 0.92,
      "source": "outscraper",
      "scraped_at": "2026-01-16T12:00:00Z"
    }
  ],
  "metadata": {
    "city": "City, ST",
    "queries": ["scratch and dent appliances", "used appliance store", "discount appliance outlet"],
    "total_results": 15,
    "deduplicated_count": 12
  }
}
```

### manifest.json Format

```json
{
  "batch_id": "2026-01-16-batch-01",
  "created_at": "2026-01-16T12:00:00Z",
  "cities_processed": ["Birmingham, AL", "Huntsville, AL"],
  "cities_count": 25,
  "total_places": 312,
  "status": "staged",
  "promoted_at": null
}
```

---

## Quality Requirements

| Requirement | Threshold |
|-------------|-----------|
| Confidence score | ≥ 0.85 |
| Required fields | name, address, city, state_code |
| Deduplication | By google_place_id, then address |
| Phone format | E.164 (+1-XXX-XXX-XXXX) |

---

## Data Handling

### MUST

- ✅ Store all outputs in `outputs/YYYY-MM-DD/batch-NN/`
- ✅ Deduplicate within each batch
- ✅ Apply confidence scoring
- ✅ Include google_place_id when available
- ✅ Log failed cities for retry

### MUST NOT

- ❌ Insert directly into production database
- ❌ Trigger any UI updates
- ❌ Modify sitemap or indexing
- ❌ Auto-promote without explicit command
- ❌ Re-scrape the 35 already-configured cities

---

## Promotion Protocol

Data remains **staged** until explicit promotion.

After each batch completes, notify with:

```
BATCH COMPLETE: 2026-01-XX-batch-NN
Cities: 25
Places found: XXX
Ready for review.
```

Await one of these commands before surfacing data:

| Command | Scope |
|---------|-------|
| `PROMOTE_BATCH: 2026-01-XX-batch-NN` | Single batch |
| `PROMOTE_ALL_STAGED_DATA` | Everything staged |

---

## Timeline Expectation

| Phase | Duration |
|-------|----------|
| Per batch | ~2 hours |
| All 7 batches | ~14 hours |
| Full completion | 2-3 days (with review cycles) |

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| All 138 cities processed | ✅ |
| Confidence ≥ 0.85 for all places | ✅ |
| No data surfaced until promoted | ✅ |
| Each batch has valid manifest | ✅ |
| Delaware covered (2 cities) | ✅ |
| Montana covered (3 cities) | ✅ |

---

## Expected Outcome

After all batches promoted:

| Metric | Before | After |
|--------|--------|-------|
| States | 43 | **50** |
| Stores | 3,653 | ~5,500 |
| Cities | 574 | ~720 |

---

## Contact

For questions or issues:

- **Batch failures:** Log and retry in next run
- **Query changes:** Requires explicit approval (not authorized here)
- **City list changes:** Check `scratchanddentfinder-remaining-cities.ts`

---

## Authorization

This directive authorizes background ingestion of all 138 remaining cities using Outscraper as the sole provider.

**Issued by:** ScratchAndDentFinder
**Valid until:** Completion of all 7 batches or explicit cancellation

---

*BEGIN INGESTION NOW*
